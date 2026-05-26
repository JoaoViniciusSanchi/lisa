# Plano — Sistema de E-mails Transacionais do Portal LISA

## Contexto

O Portal LISA precisa automatizar a comunicação por e-mail entre a coordenação de tecnologia social da AGIR/UFF e os coordenadores de experiências em todas as etapas do fluxo (cadastro → moderação → aprovação → tradução bilíngue → revalidação de catálogos antigos).

**Estado atual:**
- Schema do banco **já está pronto e robusto**: tabela [`disparo_email`](supabase/lisa_setup.sql#L431-L444) com enums `email_tipo` e `email_status`, tabela [`convite_atualizacao`](supabase/lisa_setup.sql#L446-L456) para links mágicos, tabela [`configuracao_sistema`](supabase/lisa_setup.sql#L469-L477) com categoria `templates_email` (vazia), e auditoria via `historico_status` + `log_moderacao`.
- **Resend não está instalado**. A variável `RESEND_API_KEY` existe no `.env.local.example` mas não há wrapper.
- Apenas [`rejectExperiencia`](portal-lisa-app/lib/admin/actions.ts#L83-L112) enfileira e-mail (status `'pendente'`); nada é enviado de fato. [`approveExperiencia`](portal-lisa-app/lib/admin/actions.ts#L54-L81) não dispara nada.
- O mockup [`mockups/dashboard-admin.html`](mockups/dashboard-admin.html#L561-L612) já desenha a tela "Disparo de E-mails" com cards por gatilho (Automático/Manual/Agendado), botão "Editar template" e formulário de e-mail personalizado.
- A página `/atualizar/[token]` **não existe** — o schema do convite está pronto mas o fluxo do coordenador editar via link mágico nunca foi implementado.
- O formulário de cadastro ([`components/cadastro/`](portal-lisa-app/components/cadastro/)) usa `useReducer` + `localStorage`; **não suporta modo de edição** com dados pré-carregados.

**Decisões confirmadas com o usuário:**
1. Envio **síncrono** nas Server Actions (sem Edge Function processadora de fila — `disparo_email` vira log de auditoria + suporte a reenvio manual).
2. Editor de templates: **Markdown + preview** ao lado, com lista de variáveis substituíveis.
3. Tradução bilíngue: **DeepL após aprovação** (mantém o fluxo já documentado em `docs/CONTEXTO.md`). O formulário inicial continua só em PT; campos EN aparecem **só na tela de edição via link mágico**.
4. Validação por botões no e-mail: estende **`convite_atualizacao`** com campo `tipo` (`atualizacao_dados` vs `validacao_traducao`) — um único mecanismo de token para os dois fluxos.

---

## Frente A — Infraestrutura base de e-mail

**Arquivos novos:**
- `portal-lisa-app/lib/email/client.ts` — cliente Resend único (lazy init, usa `process.env.RESEND_API_KEY`).
- `portal-lisa-app/lib/email/send.ts` — função `sendEmail({ tipo, destinatario, experienciaId, pessoaId, vars })` que:
  1. Lê template de `configuracao_sistema` (chave `template_email_<tipo>`) ou cai no default em `lib/email/defaults.ts`.
  2. Renderiza Markdown → HTML com `marked` (~10kb) e substitui `{{vars}}`.
  3. Chama `resend.emails.send()`.
  4. Insere em `disparo_email` com `status`, `resend_id`, `corpo_html`, `assunto`, `erro_mensagem`.
- `portal-lisa-app/lib/email/defaults.ts` — strings PT padrão para cada `email_tipo` (assunto + corpo Markdown).
- `portal-lisa-app/lib/email/render.ts` — wrapper layout HTML (header LISA, footer AGIR/UFF) + substituição de `{{var}}`.

**Migration SQL nova** — `supabase/migrations/2026XX_emails_traducao.sql`:
- `ALTER TYPE email_tipo ADD VALUE 'validacao_traducao';` (novo tipo p/ frente C).
- `ALTER TYPE convite_resposta ADD VALUE 'aprovou_traducao';` e `'solicitou_edicao_traducao'`.
- `CREATE TYPE convite_tipo AS ENUM ('atualizacao_dados', 'validacao_traducao');`
- `ALTER TABLE convite_atualizacao ADD COLUMN tipo convite_tipo NOT NULL DEFAULT 'atualizacao_dados';`
- `INSERT INTO configuracao_sistema (chave, valor, categoria, descricao)` — uma linha por `email_tipo`, com `valor` JSONB no formato `{ "usar_padrao": true, "assunto": null, "corpo_md": null }`. **Não duplica defaults**: quando `usar_padrao=true`, o sistema usa `lib/email/defaults.ts`.

**Variáveis de ambiente** (`.env.local.example`):
```
RESEND_API_KEY=
EMAIL_FROM_ADDRESS=LISA <nao-responda@agir.uff.br>
EMAIL_ADMIN_DESTINO=tecsocial@agir.uff.br
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Dependência:** `npm install resend marked` (Markdown→HTML leve).

---

## Frente B — Gatilhos automáticos de envio

**Arquivos editados:**

1. **`portal-lisa-app/supabase/functions/submit-cadastro/index.ts`** — após inserir experiência em `em_moderacao`, faz duas chamadas a `sendEmail()`:
   - `confirmacao_submissao` → coordenador (usa `pessoa.email` do papel coordenador).
   - `notificacao_admin` → `process.env.EMAIL_ADMIN_DESTINO`.
   - *Decisão:* como `sendEmail()` vive no Next, e Edge Functions Supabase rodam em Deno, fazer o disparo de e-mail na **Server Action `submitCadastroWithFiles`** ([`portal-lisa-app/lib/actions/submit-cadastro.ts`](portal-lisa-app/lib/actions/submit-cadastro.ts)) **após** receber a resposta da Edge Function. Mantém Edge Function pura para persistência.

2. **`portal-lisa-app/lib/admin/actions.ts`** → função `approveExperiencia`:
   - Após `UPDATE experiencia.status`, dispara `sendEmail({ tipo: 'aprovacao', ... })` com texto de seleção para o Catálogo 2026 (mencionando que o catálogo será bilíngue PT/EN e que em breve receberá texto para validação).
   - Em seguida, chama `triggerDeepLTranslation(experienciaId)` que já existe ([`actions.ts:168`](portal-lisa-app/lib/admin/actions.ts#L168)).
   - Quando a Edge Function da DeepL terminar (atualiza `experiencia_traducao.status_global='rascunho_api_gerado'`), uma nova Server Action `enviarValidacaoTraducao(experienciaId)` é chamada pelo admin (botão na aba Traduções) → cria `convite_atualizacao` com `tipo='validacao_traducao'` + dispara e-mail `validacao_traducao` com 2 botões linkando para `/validar/{token}?acao=aprovar` e `/atualizar/{token}`.

3. **`rejectExperiencia`** já enfileira ([`actions.ts:102`](portal-lisa-app/lib/admin/actions.ts#L102)) — trocar o `INSERT pendente` por chamada a `sendEmail()` (que insere com status real).

---

## Frente C — Páginas `/atualizar/[token]` e `/validar/[token]`

**Arquivos novos:**

- `portal-lisa-app/app/atualizar/[token]/page.tsx` — Server Component que:
  1. Valida `convite_atualizacao` pelo token (verifica `expira_em > now()`, `respondido_em IS NULL`).
  2. Carrega experiência + `experiencia_traducao` (PT e EN se houver) + `experiencia_conteudo` + pessoas.
  3. Renderiza `<CadastroController initialData={...} modo="edicao" />`.
- `portal-lisa-app/app/atualizar/[token]/not-found.tsx` — token inválido/expirado.
- `portal-lisa-app/app/validar/[token]/page.tsx` — recebe `?acao=aprovar`:
  - Valida token (tipo deve ser `validacao_traducao`).
  - `UPDATE experiencia_traducao SET status_global='publicavel'` (vai para revisão admin) ou direto `'publicada'` (decidir com a coordenadora — proposta: `publicavel`, para preservar revisão humana).
  - Marca `convite_atualizacao.respondido_em=now(), resposta='aprovou_traducao'`.
  - Renderiza tela de confirmação simples ("Obrigado por aprovar a tradução").

**`middleware.ts`** já exclui `/atualizar` do `next-intl` ([middleware.ts:`matcher`](portal-lisa-app/middleware.ts)). Adicionar `/validar` à exclusão.

---

## Frente D — Formulário em modo edição + campos EN

**Edições em [`components/cadastro/`](portal-lisa-app/components/cadastro/):**

1. **`state.ts`** — adicionar:
   - Campo `modo: 'cadastro' | 'edicao'` no estado.
   - Bloco `experienciaEN: { titulo, historico, metodologia, resultadosImpactos, desafiosPerspectivas }` (5 campos).
2. **`FormProvider.tsx`** — aceitar prop `initialData?: Partial<FormState>` e prop `modo`. Quando passado, despachar `HYDRATE` com os dados ao invés de ler do `localStorage`. **Em modo edição não escreve no localStorage** (evita poluição com dados de outro usuário).
3. **`CadastroController.tsx`** — quando `modo='edicao'`:
   - Pula `WelcomeStep`, `TriagemStep` e `ResultStep` (a triagem fuzzy já passou).
   - Adiciona nova step `TextoIngleStep.tsx` após `ResultadosMateriaisStep`.
4. **Novo step `TextoIngleStep.tsx`** — 5 textareas (titulo/historico/metodologia/resultados/desafios em EN), com botão "Gerar com DeepL" que chama uma nova API route `/api/regerar-traducao` para preencher campos vazios. Mostra preview lado a lado PT|EN.
5. **`CadastroNavigation.tsx` → `handleSubmit`** — quando `modo='edicao'`:
   - Chama nova Server Action `updateExperienciaFromToken(token, payload)` em vez de `submitCadastroWithFiles`.
   - A action faz UPDATE em `experiencia`, `experiencia_traducao` (PT e EN), `experiencia_conteudo`; marca `convite_atualizacao.respondido_em` + `resposta='solicitou_edicao_traducao'`; insere `log_moderacao` com `acao='editou_conteudo_pt'` ou `'editou_conteudo_en'` (já existem no enum [`log_acao`](supabase/lisa_setup.sql#L142-L163)).

**Nota importante:** os enums `log_acao` já incluem `editou_conteudo_pt` e `editou_conteudo_en` — atende ao requisito "Notificação de Edição" sem schema novo. A entrada no log serve como registro de "o coordenador X editou o texto Y".

---

## Frente E — Aba "E-mails" no painel admin

**Arquivos novos:**

- `portal-lisa-app/app/admin-lisa-xyz/(protected)/emails/page.tsx` — Server Component que carrega todos os templates de `configuracao_sistema` (categoria `templates_email`) + últimos 30 disparos.
- `portal-lisa-app/components/admin/EmailsClient.tsx` — duas abas:
  - **Templates** — grid de cards (1 por `email_tipo`, espelhando [mockup linha 570-600](mockups/dashboard-admin.html#L570-L600)):
    - Badge "Automático"/"Manual"/"Agendado".
    - Toggle "Usar texto padrão (sistema)" / "Texto personalizado".
    - Quando personalizado: editor de assunto + textarea Markdown + preview ao lado renderizando HTML final com vars de exemplo.
    - Lista de variáveis disponíveis para aquele tipo.
    - Botão "Enviar teste para meu e-mail".
    - Salvar via `saveConfigValue('template_email_<tipo>', { usar_padrao: false, assunto, corpo_md })`.
  - **Histórico** — tabela paginada de `disparo_email` (data, tipo, destinatário, status, `resend_id`, botão "Reenviar" para falhas).
- `portal-lisa-app/components/admin/EmailTemplateCard.tsx` e `MarkdownPreview.tsx`.

**Edição:**

- `portal-lisa-app/components/admin/AdminSidebar.tsx` → adicionar item `{ href: '/admin-lisa-xyz/emails', label: 'E-mails', icon: '✉' }` entre `Traduções` e `Importar Experiência`.

**Action nova em `lib/admin/actions.ts`:** `sendTestEmail(tipo: string)` — envia o template renderizado para o e-mail do admin logado, com vars fake (`{{coordenador_nome}}` = "[Nome Teste]" etc.).

---

## Frente F — Validação em lote de experiências importadas

**Como identificar experiências importadas:** o gerador SQL ([`lib/import/sql-generator.ts`](portal-lisa-app/lib/import/sql-generator.ts)) cria protocolos com prefixo `IMP-YY-NNNN`. Vou usar isso como discriminante: `WHERE submissao_formulario.protocolo LIKE 'IMP-%'`. (Se for instável, adicionar coluna `experiencia.origem` no futuro — fora do escopo deste plano.)

**Edição [`app/admin-lisa-xyz/(protected)/experiencias/internas/page.tsx`](portal-lisa-app/app/admin-lisa-xyz/(protected)/experiencias/internas/page.tsx) e `/externas/page.tsx`:**
- Adicionar filtro "Apenas importadas" no [`ExperienciasClient.tsx`](portal-lisa-app/components/admin/ExperienciasClient.tsx) e [`ExperienciasTableClient.tsx`](portal-lisa-app/components/admin/ExperienciasTableClient.tsx).
- Adicionar coluna de checkbox para seleção múltipla.
- Botão "Solicitar validação" no rodapé que chama action `requestUpdateBulk(experienciaIds[])` que, para cada experiência:
  1. Gera token (`crypto.randomBytes(32).toString('hex')`).
  2. Insere `convite_atualizacao` (`tipo='atualizacao_dados'`, `expira_em` = now + dias de `configuracao_sistema.convite_atualizacao_dias_validade`).
  3. Atualiza `experiencia.status='aguardando_confirmacao_coordenador'`.
  4. Chama `sendEmail({ tipo: 'solicitacao_atualizacao', destinatario, vars: { link: /atualizar/{token} } })`.
  5. Insere `log_moderacao` com `acao='enviou_solicitacao_atualizacao'` (já existe no enum).

**Botão individual também por linha** (cada experiência tem ação "Solicitar validação" mesmo fora do modo seleção).

---

## Frente G — Sumário dos arquivos a tocar

**Novos:**
- `lib/email/{client,send,defaults,render}.ts`
- `app/atualizar/[token]/{page,not-found}.tsx`
- `app/validar/[token]/page.tsx`
- `app/admin-lisa-xyz/(protected)/emails/page.tsx`
- `components/admin/{EmailsClient,EmailTemplateCard,MarkdownPreview}.tsx`
- `components/cadastro/steps/TextoIngleStep.tsx`
- `supabase/migrations/2026XX_emails_traducao.sql`
- `app/api/regerar-traducao/route.ts`

**Editados:**
- `lib/admin/actions.ts` (approve/reject + novas actions `enviarValidacaoTraducao`, `requestUpdateBulk`, `sendTestEmail`)
- `lib/actions/submit-cadastro.ts` (disparo síncrono pós-Edge-Function)
- `components/cadastro/{state.ts,FormProvider.tsx,CadastroController.tsx,CadastroNavigation.tsx}`
- `components/admin/{AdminSidebar.tsx,ExperienciasClient.tsx,ExperienciasTableClient.tsx,TraducoesClient.tsx}` (botão "Enviar validação" por tradução pronta)
- `middleware.ts` (excluir `/validar`)
- `.env.local.example`
- `package.json` (resend + marked)

**Não tocar:** Edge Functions existentes (`submit-cadastro`, `triagem`, `pesquisador`) — manter puras. Tradução automática DeepL continua sendo responsabilidade da Edge Function existente (não escopo deste PR).

---

## Verificação

1. **E2E manual com Supabase local** (`npx supabase start`):
   - Cadastrar experiência pelo formulário → confirmar 2 e-mails (coordenador + admin) no painel Mailhog/Inbucket local do Supabase ou no Resend dashboard com chave de teste.
   - Como admin, aprovar → confirmar e-mail de seleção 2026 ao coordenador.
   - Manualmente marcar `experiencia_traducao.status_global='rascunho_api_gerado'` no SQL Editor → clicar "Enviar validação de tradução" no admin → coordenador recebe e-mail com 2 botões.
   - Clicar botão "Aprovar Tradução" → confirmar redirect para `/validar/[token]` e que `experiencia_traducao.status_global='publicavel'`.
   - Clicar botão "Quero Editar" → formulário abre pré-preenchido em `/atualizar/[token]`. Editar campo PT → salvar → `log_moderacao` recebe entrada `editou_conteudo_pt`.
2. **Admin → aba E-mails**: alternar template `aprovacao` para personalizado, editar, enviar teste, verificar HTML renderizado no inbox.
3. **Importação + validação em lote**: importar 2 experiências via wizard, ir em `/experiencias/internas` com filtro "Apenas importadas", selecionar e disparar "Solicitar validação". Verificar `convite_atualizacao` populada e e-mails enviados.
4. **`npm run lint`** + **`npm run build`** sem erros.
5. **Reenvio de falha**: forçar `RESEND_API_KEY` inválida, tentar enviar, verificar `disparo_email.status='falhou'` e `erro_mensagem` populada; corrigir chave e reenviar via histórico do admin.

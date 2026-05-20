@AGENTS.md
# Portal LISA — Instruções para Claude Code

> **Este arquivo é o cérebro do projeto.** Sempre leia-o antes de qualquer tarefa. Consulte também os arquivos referenciados em `/docs/` antes de tomar decisões de arquitetura.

---

## 🎯 O que é o Portal LISA

**LISA** = Laboratório de Inovação Social Aberto

Portal web da **Universidade Federal Fluminense (UFF)**, coordenado pela **Agência de Inovação (AGIR/PROPPI)**, cuja função principal é **conectar demandas sociais reais com tecnologias sociais desenvolvidas pela comunidade universitária** — um sistema de matchmaking entre ONGs/prefeituras/coletivos que têm problemas e iniciativas acadêmicas que já resolveram problemas similares.

**Coordenadora do projeto:** Profa. Dra. Elaine Sigette

**Missão do portal (ordem de importância):**
1. **Conectar** — matchmaking de demandas sociais com tecnologias sociais existentes (função-coração, protagonista visual)
2. **Catalogar** — documentar e publicar experiências de tecnologia social da UFF em catálogo bilíngue (PT/EN)
3. **Cadastrar** — receber submissões de novas experiências durante editais anuais
4. **Historiar** — preservar a trajetória institucional da UFF no campo da inovação social

**Referencial teórico fundante:** Dagnino/ITS (Instituto de Tecnologia Social), Rodrigues & Barbieri (2008), Duque & Valadão (2017). O portal aceita tanto a **Visão 1** (tecnologia social como construção sociotécnica coletiva, linha Dagnino) quanto a **Visão 2** (tecnologia para o social, linha Bava). Os artigos completos estão em `/docs/referencias/`.

---

## 🛠️ Stack Técnica (decidida, não mudar sem discussão)

| Camada | Escolha | Motivo |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) + TypeScript | Padrão da indústria, SEO nativo, deploy fácil |
| **Estilização** | Tailwind CSS | Já usado nos mockups, velocidade de iteração |
| **Hospedagem frontend** | Vercel (plano Hobby) | Grátis, deploy automático do GitHub |
| **Backend / DB / Auth / Storage** | Supabase (plano Free) | PostgreSQL + API REST auto-gerada + auth pronta |
| **Banco de dados** | PostgreSQL (via Supabase) | Schema já modelado em `/docs/lisa_schema.dbml` |
| **E-mail transacional** | Resend (plano Free) | 3000 e-mails/mês grátis, fácil integração |
| **Tradução automática** | DeepL Free API | 500k chars/mês grátis, qualidade superior para textos acadêmicos |
| **Animações** | GSAP + ScrollTrigger | Licença gratuita para projeto acadêmico não-comercial |
| **Fonte tipográfica** | Inter + Inter Tight (Google Fonts) | Oficial da marca LISA |
| **Busca vetorial (v2)** | pgvector (extensão Postgres) | Para matchmaking semântico |
| **IA para matchmaking (v2)** | Gemini Flash ou Claude Haiku | Custo baixo, qualidade suficiente |

**Custo total previsto:** R$ 0/mês no MVP, ~R$ 5/mês no v2 (embeddings de matchmaking).

**Não usar:** Firebase, MongoDB, qualquer ORM pesado (Prisma está ok, mas prefira o client nativo do Supabase), bibliotecas de UI pesadas (MUI, Chakra), CSS-in-JS runtime (styled-components, emotion).

---

## 🎨 Design System (fiel aos mockups aprovados)

### Paleta (CSS variables)

```css
:root {
  /* Fundos - cinza escuro neutro */
  --bg-base: #0E0E10;
  --bg-elevated: #16161A;
  --bg-card: #1A1A1F;

  /* Accent - paleta petrol oficial LISA (detalhe, não fundo) */
  --petrol-deep: #0B2A33;
  --petrol-mid: #143B47;
  --petrol-light: #1F5160;

  /* Texto */
  --warm-white: #F4EFE6;
  --pure-white: #FFFFFF;

  /* Highlights */
  --accent: #2EA39B;
  --accent-glow: #3FBDB4;

  /* Danger / validação */
  --danger: #E55542;

  /* Linhas */
  --line: rgba(244, 239, 230, 0.07);
  --line-strong: rgba(244, 239, 230, 0.16);
  --line-brighter: rgba(244, 239, 230, 0.3);
}
```

### Princípios de design (obrigatórios)

- **Tema escuro sempre.** Não existir modo claro.
- **Cantos retos absolutos.** Nada de `border-radius`. Enforçar via CSS global: `*, *::before, *::after { border-radius: 0 !important; }`
- **Tipografia dupla:** `Inter` para corpo, `Inter Tight` para display/títulos. Pesos extremos (200 vs 700), não intermediários.
- **Eyebrows em letra pequena uppercase** com `letter-spacing: 0.18em` e cor `--accent-glow` para títulos de seção.
- **Numeração editorial de seções** tipo `[ 02 ]`, `[ 03 ]` em fonte tabular.
- **Hairlines de 1px** como elementos decorativos (referência DeGirum).
- **Glassmorphism sutil** em cards elevados (backdrop-filter blur + saturate).
- **Accent teal (#2EA39B) para CTAs, hover states, elementos interativos.** Nunca como background dominante.
- **Inspiração visual:** DeGirum Corporate Website (Vide Infra) — minimalismo estrito, formas blocadas, pattern signature.

### Componentes-chave

Os mockups aprovados estão em `/mockups/`:
- `lisa_home_mockup.html` — home completa com dot grid interativo, timeline horizontal com scroll hijacking, catálogo em destaque
- `lisa_cadastro_mockup.html` — formulário multi-step com 8 etapas, cards SIM/NÃO estilo quiz, auto-save em localStorage

**Use esses mockups como referência pixel-perfect.** Qualquer divergência visual precisa ser justificada.

---

## 🗄️ Banco de Dados

**Schema completo:** `/docs/lisa_schema.dbml` (visualizável em dbdiagram.io) e `/supabase/lisa_setup.sql` (SQL pronto para rodar).

**Resumo:** 21 tabelas, 4 views, 16 enums. Dividido em 3 grupos:

1. **Núcleo e taxonomias:** `experiencia`, `pessoa`, `experiencia_pessoa`, `grande_area_cnpq`, `subarea_cnpq`, `experiencia_cnpq`, `categoria_editorial`, `ods`, `experiencia_ods`
2. **Operação:** `experiencia_conteudo`, `experiencia_traducao`, `pergunta_score`, `resposta_score`, `avaliacao_score`, `anexo`, `historico_status`, `disparo_email`, `convite_atualizacao`
3. **Admin e logs:** `admin_perfil`, `log_moderacao`, `configuracao_sistema`

**Decisões arquiteturais do banco (não mudar sem discussão):**

- **UUIDs** em todas as tabelas de entidade (não integer autoincrement)
- **Conteúdo editorial bilíngue separado em `experiencia_traducao`** — uma linha por idioma por experiência (pt, en, es futuro)
- **Score de tecnologia social usa lógica fuzzy, não determinística.** Modelo EFITS v2.0: 20 perguntas em escala 0-10, 5 dimensões com pesos fixos (P=0.30, I=0.25, A=0.20, S=0.15, R=0.10), motor de inferência Mamdani com regras SE-ENTÃO, saída como índice 0-1 classificado em faixas cromáticas (vermelho/amarelo/verde). Detalhes em `/docs/lisa_perguntas_score.md`. Validação estatística do instrumento (Cronbach, AFE, AFC) fica 100% fora do portal.
- **Anexos híbridos:** imagens leves no Supabase Storage, vídeos/PDFs grandes via link externo
- **3 slots padronizados de imagem por experiência** (foto_capa + 2 foto_secundaria). Obrigatórios para publicação.
- **Status de experiência como ENUM** com 8 estados explícitos
- **Log completo de moderação** e **histórico imutável de status** para auditoria acadêmica
- **Configurações do sistema em tabela chave-valor JSONB** — editáveis via painel admin sem redeploy

**Para rodar o setup:** copiar o conteúdo de `/supabase/lisa_setup.sql` e executar no SQL Editor do Supabase. Verificar com as queries de validação no final do arquivo.

---

## 🌐 Estrutura do Site (rotas Next.js)

```
/                          → Home pública (lisa_home_mockup.html)
/catalogo                  → Listagem do catálogo com filtros
/catalogo/[slug]           → Página individual de cada experiência
/conectar                  → Formulário de demanda (matchmaking)
/cadastrar                 → Formulário de cadastro de experiência (lisa_cadastro_mockup.html)
/sobre                     → Sobre o LISA / AGIR / UFF
/contato                   → Contato institucional

/admin-lisa-xyz            → Painel administrativo (URL oculta, não indexada)
/admin-lisa-xyz/fila       → Fila de moderação
/admin-lisa-xyz/traducoes  → Traduções pendentes
/admin-lisa-xyz/config     → Configurações do sistema

/atualizar/[token]         → Link mágico para coordenadores atualizarem experiências (sem login)
```

**Internacionalização:** MVP já nasce bilíngue PT/EN. Usar roteamento nativo do Next.js App Router com `[locale]` (`/pt/catalogo`, `/en/catalogo`).

**SEO:** todas as páginas públicas devem ter metadata tags, Open Graph, `hreflang` para as versões bilíngues.

---

## 📋 O que está no MVP vs. o que fica para v2

### ✅ MVP (4-7 semanas)

- Home completa com todas as 7 seções do mockup
- Formulário de cadastro de experiência (8 etapas, auto-save, validação)
- Sistema de avaliação fuzzy EFITS v2.0 (20 perguntas, 5 dimensões, escala 0-10, motor TypeScript)
- Catálogo público com filtros (ODS, CNPq, categoria editorial, campus, status, data)
- Página individual de experiência
- Painel admin oculto com moderação de submissões
- Disparo de e-mails (confirmação, notificação, solicitação de atualização)
- Status de experiência (8 estados)
- Bilíngue PT/EN com tradução via DeepL API + revisão humana em duas etapas
- Convites de atualização com token (link mágico)
- Migração das ~110 experiências existentes pela estagiária

### ❌ Fora do MVP (v2+)

- Chatbot de matchmaking semântico com IA (embeddings + pgvector)
- Base de demandantes completa
- Base de especialistas
- Catálogo em formato de livro com export PDF (modo "InDesign no navegador")
- Blog institucional
- Newsletter automática
- Hierarquia CNPq de 4 níveis completa (no MVP só 1 e 2)
- Rede universitária, tecnologia cidadã, certificação, startup social

### ⚠️ Função "Conectar" — caso especial

A função de matchmaking é a função-coração do portal e protagonista visual. **Mas a implementação completa (com IA de busca semântica) é v2.** No MVP, a página `/conectar` existe e tem um formulário simples de captura de demanda, que:
- Salva a demanda no banco (tabela a criar: `demanda_externa` — ainda não está no schema atual, será adicionada na primeira sprint de código)
- Dispara e-mail para os admins com a demanda
- Retorna uma mensagem amigável tipo "Obrigado, entraremos em contato com sugestões relevantes"
- A triagem manual feita por humanos no MVP vira automação via IA no v2

Isso preserva a promessa da home sem exigir implementação de IA no MVP.

---

## 🔐 Autenticação e Acesso

- **Público externo:** sem login. Acessa catálogo, lê experiências, submete cadastro (quando edital ativo), submete demanda via /conectar
- **Coordenadores que cadastram:** sem conta. Preenchem formulário, recebem confirmação por e-mail, acompanham por link mágico se precisarem
- **Admins:** Supabase Auth com e-mail/senha. URL do painel admin é **oculta** (ex: `/admin-lisa-xyz`) e não-indexada. Primeiro admin criado manualmente no Supabase Dashboard.
- **Níveis de admin** (para v2, no MVP todos são `moderador`): `super_admin`, `moderador`, `revisor_traducao`, `visualizador`

**Row Level Security (RLS) do Supabase é OBRIGATÓRIO** em todas as tabelas. Ver seção 10 do `lisa_setup.sql` para exemplos de policies.

---

## 📧 Envio de E-mails

Usar **Resend** via Edge Functions do Supabase. Templates de e-mail ficam na tabela `configuracao_sistema` (categoria `templates_email`) — editáveis pelo painel admin sem redeploy.

**Tipos de e-mail (enum `email_tipo`):**
- `confirmacao_submissao` — para o coordenador, após enviar
- `notificacao_admin` — para os admins, quando há nova submissão
- `aprovacao` — para o coordenador, quando experiência é aprovada
- `rejeicao` — para o coordenador, quando experiência é rejeitada
- `solicitacao_atualizacao` — para o coordenador, "ainda está ativa?"
- `lembrete_atualizacao` — segundo aviso de atualização
- `notificacao_inativacao` — quando experiência é marcada inativa

Todo disparo é registrado em `disparo_email` para auditoria.

---

## 🌍 Fluxo de Tradução Bilíngue

1. Coordenador submete formulário em PT → linha em `experiencia_traducao` com `idioma='pt'`, `is_original=true`
2. Admin revisa texto PT → `status_por_campo` atualizado
3. Edge Function dispara DeepL API com os 4 campos editoriais (historico, metodologia, resultados_impactos, desafios_perspectivas)
4. DeepL devolve tradução → grava em nova linha `experiencia_traducao` com `idioma='en'`, `rascunho_api` salvo em JSONB, `status_global='rascunho_api_gerado'`
5. Estagiária revisa rascunho → status vira `em_primeira_revisao` → `primeira_revisao_concluida`
6. Segunda revisão (outro membro da equipe) → status vira `em_segunda_revisao` → `publicavel`
7. Publicação → status vira `publicada`, aparece no catálogo EN

**Tradução é bloqueante para publicação no MVP** (decisão do usuário). Se virar gargalo, rota de fuga documentada: tornar EN não-bloqueante, publicando só em PT até tradução estar pronta.

---

## 📏 Regras de Negócio Importantes

### Validação de formulários

- **Todos os textareas de texto livre têm limite de 3.000 caracteres.** Validar no frontend (maxlength + contador visual) e no backend (constraint no Postgres ou validação na Edge Function).
- **As 20 perguntas fuzzy são obrigatórias.** Todas devem ter valor entre 0 e 10 para submissão ser aceita.
- **Os 5 campos abertos por dimensão são opcionais**, limite de 1.000 caracteres cada.
- **Foto de capa + 2 secundárias são obrigatórias** para publicação (não para submissão — coordenador pode submeter sem e anexar depois).
- **Termo de consentimento** obrigatório para submissão.

### Score de tecnologia social (modelo fuzzy EFITS v2.0)

**IMPORTANTE:** O sistema de pontuação do LISA usa **lógica fuzzy**, não scoring determinístico binário. Isso é uma decisão metodológica da coordenadora, baseada no fato de que fenômenos sociais são graduais, não binários.

**FLUXO DE CADASTRO EM DUAS FASES (gate de triagem):**

1. **Fase 1 — Triagem de Aderência (obrigatória):** Assim que o coordenador clica em "Cadastrar Experiência", ele responde **primeiro** as 20 perguntas fuzzy (5 dimensões × 4 perguntas, escala 0-10 via slider). Ao final, o motor fuzzy calcula o índice de aderência.

2. **Gate de decisão:** Dependendo do resultado da triagem:
   - **🟢 Verde (≥ 0.7)** ou **🟡 Amarelo (0.3 - 0.7):** O coordenador vê o resultado e é **habilitado** a prosseguir para o cadastro completo da experiência.
   - **🔴 Vermelho (< 0.3):** O coordenador recebe uma **mensagem respeitosa** explicando que o LISA tem parâmetros mínimos que a experiência não atingiu, agradecendo o interesse e convidando a retornar em outro momento. O cadastro completo **não é liberado**.

3. **Fase 2 — Cadastro Completo (condicional):** Se a triagem liberou, o coordenador preenche as 6 etapas restantes (Identificação, Experiência, Classificação CNPq+ODS+Categoria, FORPROEX, Resultados, Materiais).

**Limite do gate é configurável** via `configuracao_sistema.fuzzy_gate_triagem_min` (padrão: 0.3).

Ver `/docs/lisa_perguntas_score.md` para especificação completa (regras, funções de pertinência, algoritmo de defuzzificação, exemplo de cálculo).

**Resumo do modelo:**

- **20 perguntas** distribuídas em **5 dimensões** (4 perguntas por dimensão)
- **Escala de resposta contínua 0-10** (slider com passo 0.5)
- **5 dimensões:** Participação Comunitária (P), Impacto Social (I), Apropriação Tecnológica (A), Sustentabilidade (S), Replicabilidade (R)
- **Pesos fixos** (não editáveis no MVP): P=0.30, I=0.25, A=0.20, S=0.15, R=0.10
- **Motor de inferência fuzzy Mamdani** com funções triangulares sobrepostas (baixo/médio/alto) e regras SE-ENTÃO
- **Defuzzificação por média ponderada** gera um índice 0-1
- **Cálculo também de índice linear** como referência cruzada

**Faixas cromáticas (classificação final):**
- 🔴 **Vermelho** (0.0 – 0.3) — Não é tecnologia social (triagem bloqueia cadastro)
- 🟡 **Amarelo** (0.3 – 0.7) — Potencial / em transição (libera cadastro)
- 🟢 **Verde** (0.7 – 1.0) — Tecnologia social consolidada (libera cadastro)

**Implementação técnica obrigatória:**

- O motor fuzzy é implementado em **TypeScript puro** no servidor (Next.js Server Action ou Edge Function do Supabase)
- Sem dependências externas (sem `fuzzyjs`, sem `scikit-fuzzy` via API externa)
- As funções de pertinência (`baixo(x)`, `medio(x)`, `alto(x)`) são triangulares e estão documentadas matematicamente em `/docs/lisa_perguntas_score.md`
- O conjunto completo de regras SE-ENTÃO também está no mesmo documento
- Resultados são armazenados em `avaliacao_fuzzy` com pertinências e ativações em JSONB para auditoria
- A triagem (fase 1) roda **antes** de qualquer dado do coordenador ser persistido no banco de forma definitiva — apenas rascunho em localStorage no cliente. Apenas quando o coordenador é habilitado e prossegue, os dados começam a ser persistidos. Se bloqueado, nenhum dado pessoal é salvo.

**Importante — o que NÃO faz parte do portal:**

- Validação estatística do instrumento (Alfa de Cronbach, AFE, AFC) fica **100% fora do código do portal**
- Essa validação é trabalho de pesquisa acadêmica, rodada em SPSS ou R pela equipe de pesquisa
- O portal deve oferecer **exportação em CSV** das respostas cruas no painel admin para uso externo

**O score é organizador da fila de moderação E gate de entrada**. Mas a decisão final de publicação continua humana — o índice fuzzy apenas filtra as submissões que atendem o limiar mínimo e informa a moderação.

### Áreas Temáticas de Extensão (FORPROEX)

Além da classificação por grande área do CNPq (pesquisa), o cadastro inclui uma etapa obrigatória de seleção das **Áreas Temáticas do FORPROEX**, que são o padrão nacional brasileiro para classificar projetos de extensão universitária.

As 8 áreas disponíveis (seed na tabela `area_tematica_forproex`):

1. **Comunicação** — mídia comunitária, produção de material educativo, rádio e TV
2. **Cultura** — produção cultural, memória, patrimônio, folclore, artesanato e artes
3. **Direitos Humanos e Justiça** — cidadania, ética, inclusão, assistência jurídica
4. **Educação** — educação básica, superior, profissional, popular, especial e EJA
5. **Meio Ambiente** — ecologia, desenvolvimento sustentável, recursos hídricos, gestão ambiental
6. **Saúde** — saúde pública, nutrição, enfermagem, saúde do trabalhador e coletiva
7. **Tecnologia e Produção** — desenvolvimento tecnológico, difusão de tecnologias, desenvolvimento rural e industrial
8. **Trabalho** — economia solidária, qualificação profissional, relações de trabalho

O coordenador seleciona **uma ou mais áreas** (múltipla seleção). A relação é N:N via tabela `experiencia_forproex`, com flag `principal` opcional para marcar a área dominante. Esta classificação complementa a classificação CNPq: **CNPq reflete a área de conhecimento (pesquisa), FORPROEX reflete a área de intervenção social (extensão)**.

### Status da experiência

Fluxo típico: `em_moderacao` → (após aprovação) `aprovada_ativa_em_andamento` / `aprovada_ativa_perene` → (após encerramento) `aprovada_encerrada` → (se coordenador não responde ao convite de atualização) `aguardando_confirmacao_coordenador` → `inativa_nao_confirmada`

Toda mudança de status gera linha imutável em `historico_status`.

---

## 🚫 O Que Evitar

- **Não criar features que não estão no MVP** sem antes discutir. Chatbot com IA, blog, base de especialistas completa — tudo isso é v2.
- **Não usar IA no MVP para scoring ou moderação automática.** Decisão explícita do projeto.
- **Não mudar a stack** (Next.js + Supabase) sem discussão.
- **Não adicionar border-radius** em nenhum lugar. Cantos retos são identidade visual.
- **Não criar tema claro.** Apenas escuro.
- **Não usar emojis em títulos** ou elementos de navegação do portal (no código/documentação pode usar).
- **Não usar cores fora da paleta definida** sem justificativa.
- **Não criar arquivos de texto soltos na raiz do projeto.** Tudo organizado em `/app`, `/components`, `/lib`, `/docs`, `/public`, `/supabase`.
- **Não hardcodar strings que serão traduzidas.** Usar sistema de i18n do Next.js desde o início.
- **Não hardcodar configurações mutáveis** (textos de e-mail, faixas de score, edital ativo). Usar tabela `configuracao_sistema`.

---

## 📁 Arquivos de Referência em /docs

Sempre consultar antes de tomar decisões:

- **`lisa_consolidacao.md`** — documento mestre do projeto, resume todas as decisões tomadas na fase de modelagem
- **`lisa_schema.dbml`** — schema visual do banco (para visualizar em dbdiagram.io)
- **`lisa_perguntas_score.md`** — 30 perguntas de pontuação com pesos e justificativa teórica
- **`referencias/Formulario_Registro_2025.pdf`** — formulário original da AGIR que inspirou o cadastro
- **`referencias/A_emergencia_da_tecnologia_social.pdf`** — Rodrigues & Barbieri (2008), referencial teórico ITS
- **`referencias/Abordagens_teoricas.pdf`** — Duque & Valadão (2017), Visão 1 vs Visão 2
- **`referencias/Cozinha_CuidAR_catalogo.pdf`** — exemplo de página do catálogo atual (referência editorial)
- **`referencias/Logo_Portal_LISA.pdf`** — identidade visual oficial (paleta + tipografia)
- **`/mockups/lisa_home_mockup.html`** — home aprovada pixel-perfect
- **`/mockups/lisa_cadastro_mockup.html`** — formulário de cadastro aprovado
- **`/supabase/lisa_setup.sql`** — SQL completo para criar banco do zero

---

## 🔄 Convenções de Código

### Linguagem
- **Código e nomes de variáveis em inglês**
- **Comentários em português** (o código vai ser mantido por equipe BR)
- **Nomes de tabelas e colunas do banco em português snake_case** (já definido no schema)
- **Textos de UI em pt-BR e en-US** (i18n)

### Estrutura Next.js (App Router)

```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx                     → Home
│   ├── catalogo/
│   │   ├── page.tsx                 → Listagem
│   │   └── [slug]/page.tsx          → Experiência individual
│   ├── cadastrar/page.tsx           → Formulário cadastro
│   ├── conectar/page.tsx            → Formulário demanda
│   ├── sobre/page.tsx
│   └── contato/page.tsx
├── admin-lisa-xyz/                  → URL oculta do admin
│   ├── layout.tsx
│   ├── page.tsx                     → Dashboard
│   ├── fila/page.tsx
│   ├── traducoes/page.tsx
│   └── config/page.tsx
├── atualizar/[token]/page.tsx
└── api/
    ├── submit-experiencia/route.ts
    ├── submit-demanda/route.ts
    └── translate/route.ts

components/
├── ui/                              → componentes atômicos reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   └── ...
├── home/                            → componentes específicos da home
│   ├── Hero.tsx
│   ├── DotGrid.tsx
│   ├── Timeline.tsx
│   └── ...
├── cadastro/                        → componentes do formulário
│   ├── StepIndicator.tsx
│   ├── YesNoCard.tsx
│   └── ...
└── catalogo/                        → componentes do catálogo
    ├── ExperienciaCard.tsx
    ├── Filtros.tsx
    └── ...

lib/
├── supabase/
│   ├── client.ts                    → Supabase client para componentes client
│   ├── server.ts                    → Supabase client para Server Components
│   └── types.ts                     → Tipos gerados do schema
├── deepl/
│   └── translate.ts                 → Wrapper da API DeepL
├── email/
│   └── send.ts                      → Wrapper do Resend
└── utils/
    ├── score.ts                     → Cálculo de score determinístico
    └── slug.ts                      → Geração de slugs de URL

supabase/
├── migrations/                      → migrações SQL versionadas
├── functions/                       → Edge Functions
│   ├── translate-experiencia/
│   ├── send-email/
│   └── recalculate-score/
└── seed.sql                         → Dados iniciais (seeds)
```

### Padrões de commits

Usar **Conventional Commits**:
- `feat: adicionar formulário de cadastro multi-step`
- `fix: corrigir cálculo de score na dimensão participacao_comunidade`
- `docs: atualizar CLAUDE.md com regras de tradução`
- `refactor: extrair componente YesNoCard`
- `style: ajustar espaçamento do hero`

---

## 🎓 Quando em dúvida

1. **Se for decisão visual:** consulte os mockups em `/mockups/`
2. **Se for decisão de dados:** consulte `/docs/lisa_schema.dbml` e `/supabase/lisa_setup.sql`
3. **Se for decisão conceitual sobre tecnologia social:** consulte os artigos em `/docs/referencias/`
4. **Se for decisão de produto:** consulte `/docs/lisa_consolidacao.md` e pergunte ao usuário se ainda houver ambiguidade
5. **Se for decisão nova que não está em lugar nenhum:** PERGUNTE ANTES. Não invente.

---

## 📌 Informações Institucionais

- **Coordenadora:** Profa. Dra. Elaine Sigette
- **Órgão:** AGIR / PROPPI / UFF
- **Endereço:** Rua Miguel de Frias, 9, Icaraí, Niterói — RJ, CEP 24220-900
- **E-mail do projeto:** lisa@id.uff.br (a confirmar)
- **Edital atual:** Chamamento 2026 (datas a confirmar)

---

**Versão deste CLAUDE.md:** 1.0 · abril 2026
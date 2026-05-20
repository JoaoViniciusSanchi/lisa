# Portal LISA — Contexto Completo do Projeto

> Documento de referência para decisões de produto, arquitetura, design e regras de negócio.
> Leia antes de qualquer tarefa de maior escopo.

---

## O que é o Portal LISA

**LISA** = Laboratório de Inovação Social Aberto

Portal web da **Universidade Federal Fluminense (UFF)**, coordenado pela **Agência de Inovação (AGIR/PROPPI)**, cuja função principal é **conectar demandas sociais reais com tecnologias sociais desenvolvidas pela comunidade universitária** — matchmaking entre ONGs/prefeituras/coletivos com problemas e iniciativas acadêmicas que já resolveram problemas similares.

**Coordenadora:** Profa. Dra. Elaine Sigette  
**Órgão:** AGIR / PROPPI / UFF  
**Endereço:** Rua Miguel de Frias, 9, Icaraí, Niterói — RJ, CEP 24220-900  
**E-mail:** lisa@id.uff.br (a confirmar)  
**Edital atual:** Chamamento 2026 (datas a confirmar)

**Missão (ordem de importância):**
1. **Conectar** — matchmaking de demandas sociais com tecnologias sociais existentes (função-coração, protagonista visual)
2. **Catalogar** — documentar e publicar experiências em catálogo bilíngue (PT/EN)
3. **Cadastrar** — receber submissões durante editais anuais
4. **Historiar** — preservar trajetória institucional da UFF em inovação social

**Referencial teórico:** Dagnino/ITS, Rodrigues & Barbieri (2008), Duque & Valadão (2017). O portal aceita a **Visão 1** (tecnologia social como construção sociotécnica coletiva, linha Dagnino) e a **Visão 2** (tecnologia para o social, linha Bava). Artigos em `docs/referencias/`.

---

## Design System

### Paleta de Cores (CSS variables)

```css
:root {
  /* Fundos */
  --bg-base: #0E0E10;
  --bg-elevated: #16161A;
  --bg-card: #1A1A1F;

  /* Accent petrol LISA (detalhe, nunca fundo dominante) */
  --petrol-deep: #0B2A33;
  --petrol-mid: #143B47;
  --petrol-light: #1F5160;

  /* Texto */
  --warm-white: #F4EFE6;
  --pure-white: #FFFFFF;

  /* Highlights */
  --accent: #2EA39B;
  --accent-glow: #3FBDB4;

  /* Danger */
  --danger: #E55542;

  /* Linhas */
  --line: rgba(244, 239, 230, 0.07);
  --line-strong: rgba(244, 239, 230, 0.16);
  --line-brighter: rgba(244, 239, 230, 0.3);
}
```

### Princípios Obrigatórios

- **Tema escuro sempre.** Modo claro não existe.
- **Cantos retos absolutos.** Zero `border-radius`. Enforçar globalmente: `*, *::before, *::after { border-radius: 0 !important; }`
- **Tipografia dupla:** `Inter` para corpo, `Inter Tight` para display/títulos. Pesos extremos (200 vs 700) — sem intermediários.
- **Eyebrows em uppercase** com `letter-spacing: 0.18em` e cor `--accent-glow`.
- **Numeração editorial** tipo `[ 02 ]`, `[ 03 ]` em fonte tabular.
- **Hairlines de 1px** como elementos decorativos.
- **Glassmorphism sutil** em cards elevados (backdrop-filter blur + saturate).
- **Accent teal (#2EA39B)** para CTAs e hover states. Nunca como background dominante.
- **Sem emojis** em títulos ou navegação do portal (documentação pode usar).
- **Cores fora da paleta** exigem justificativa explícita.
- **Inspiração visual:** DeGirum Corporate Website — minimalismo estrito, formas blocadas.

### Mockups Aprovados (pixel-perfect)

- `mockups/lisa_home_mockup.html` — home completa (dot grid interativo, timeline horizontal com scroll hijacking, catálogo em destaque)
- `mockups/lisa_cadastro_mockup.html` — formulário multi-step (8 etapas, cards SIM/NÃO estilo quiz, auto-save em localStorage)

Qualquer divergência visual precisa ser justificada.

---

## Banco de Dados

**Schema:** `docs/lisa_schema.dbml` (visualizar em dbdiagram.io) · `supabase/lisa_setup.sql`

**Resumo:** 21 tabelas, 4 views, 16 enums, divididas em 3 grupos:

1. **Núcleo e taxonomias:** `experiencia`, `pessoa`, `experiencia_pessoa`, `grande_area_cnpq`, `subarea_cnpq`, `experiencia_cnpq`, `categoria_editorial`, `ods`, `experiencia_ods`
2. **Operação:** `experiencia_conteudo`, `experiencia_traducao`, `pergunta_score`, `resposta_score`, `avaliacao_score`, `anexo`, `historico_status`, `disparo_email`, `convite_atualizacao`
3. **Admin e logs:** `admin_perfil`, `log_moderacao`, `configuracao_sistema`

**Decisões arquiteturais (não mudar sem discussão):**

- **UUIDs** em todas as tabelas de entidade (não integer autoincrement)
- **Conteúdo bilíngue separado em `experiencia_traducao`** — uma linha por idioma por experiência (pt, en; es futuro)
- **Score fuzzy, não determinístico** — modelo EFITS v2.0, detalhes abaixo
- **Anexos híbridos:** imagens leves no Supabase Storage; vídeos/PDFs grandes via link externo
- **3 slots de imagem por experiência** (foto_capa + 2 foto_secundaria) — obrigatórios para publicação, não para submissão
- **Status de experiência como ENUM** com 8 estados explícitos
- **Log imutável de moderação** e **histórico de status** para auditoria acadêmica
- **Configurações em `configuracao_sistema`** (tabela chave-valor JSONB) — editáveis sem redeploy

---

## Rotas do Site (Next.js)

```
/                          → Home pública
/catalogo                  → Listagem com filtros
/catalogo/[slug]           → Página individual de experiência
/conectar                  → Formulário de demanda (matchmaking)
/cadastrar                 → Formulário de cadastro (8 etapas)
/sobre                     → Sobre LISA / AGIR / UFF
/contato                   → Contato institucional

/admin-lisa-xyz            → Painel admin (URL oculta, não indexada)
/admin-lisa-xyz/fila       → Fila de moderação
/admin-lisa-xyz/traducoes  → Traduções pendentes
/admin-lisa-xyz/config     → Configurações do sistema

/atualizar/[token]         → Link mágico para coordenadores (sem login)
```

**i18n:** MVP bilíngue PT/EN. Roteamento com `[locale]` (`/pt/catalogo`, `/en/catalogo`).  
**SEO:** metadata tags + Open Graph + `hreflang` em todas as páginas públicas.

---

## MVP vs. v2

### MVP (4–7 semanas)

- Home completa (7 seções do mockup)
- Formulário de cadastro multi-step (8 etapas, auto-save, validação)
- Motor fuzzy EFITS v2.0 em TypeScript (20 perguntas, 5 dimensões, gate de triagem)
- Catálogo público com filtros (ODS, CNPq, categoria editorial, campus, status, data)
- Página individual de experiência
- Painel admin oculto com moderação
- E-mails transacionais (confirmação, notificação, aprovação, rejeição, atualização)
- Bilíngue PT/EN com DeepL + revisão humana em duas etapas
- Convites de atualização com token (link mágico)
- Migração das ~110 experiências existentes (estagiária)

### v2 (fora do MVP — não implementar sem discussão)

- Chatbot de matchmaking semântico com IA (embeddings + pgvector)
- Base de demandantes completa
- Base de especialistas
- Export PDF do catálogo (modo "InDesign no navegador")
- Blog institucional
- Newsletter automática
- Hierarquia CNPq de 4 níveis completa (MVP só níveis 1 e 2)
- Rede universitária, tecnologia cidadã, certificação, startup social

### Função "Conectar" — caso especial

Matchmaking é a função-coração do portal, mas a implementação com IA é v2. No MVP, `/conectar` tem formulário simples que:
- Salva demanda no banco (tabela `demanda_externa` — a adicionar na primeira sprint de código, ainda não está no schema atual)
- Dispara e-mail para admins com a demanda
- Retorna mensagem "Obrigado, entraremos em contato com sugestões relevantes"
- Triagem manual no MVP → automação via IA no v2

---

## Autenticação e Acesso

| Perfil | Acesso |
|---|---|
| Público externo | Sem login. Lê catálogo, submete cadastro (quando edital ativo), submete demanda |
| Coordenadores | Sem conta. Preenchem formulário, recebem e-mail, acompanham por link mágico |
| Admins | Supabase Auth (e-mail/senha). Primeiro admin criado manualmente no Supabase Dashboard |

**Níveis de admin** (v2; no MVP todos são `moderador`): `super_admin`, `moderador`, `revisor_traducao`, `visualizador`

**Row Level Security (RLS) é OBRIGATÓRIO** em todas as tabelas. Ver seção 10 de `supabase/lisa_setup.sql` para exemplos de policies.

---

## E-mails Transacionais

Implementar via **Resend** em Edge Functions do Supabase. Templates ficam em `configuracao_sistema` (categoria `templates_email`) — editáveis pelo painel admin sem redeploy.

**Tipos (enum `email_tipo`):**
- `confirmacao_submissao` — para o coordenador após enviar
- `notificacao_admin` — para admins quando há nova submissão
- `aprovacao` — para o coordenador quando experiência é aprovada
- `rejeicao` — para o coordenador quando experiência é rejeitada
- `solicitacao_atualizacao` — "ainda está ativa?"
- `lembrete_atualizacao` — segundo aviso
- `notificacao_inativacao` — quando experiência vira inativa

Todo disparo registrado em `disparo_email` para auditoria.

---

## Fluxo de Tradução Bilíngue

1. Coordenador submete em PT → `experiencia_traducao` com `idioma='pt'`, `is_original=true`
2. Admin revisa PT → `status_por_campo` atualizado
3. Edge Function chama DeepL com 4 campos editoriais (historico, metodologia, resultados_impactos, desafios_perspectivas)
4. DeepL retorna → nova linha com `idioma='en'`, rascunho em JSONB, `status_global='rascunho_api_gerado'`
5. Estagiária revisa → `em_primeira_revisao` → `primeira_revisao_concluida`
6. Segunda revisão → `em_segunda_revisao` → `publicavel`
7. Publicação → `publicada`, aparece no catálogo EN

**Tradução é bloqueante para publicação no MVP.** Rota de fuga: tornar EN não-bloqueante (publicar só em PT até tradução pronta) — só ativar se virar gargalo real.

---

## Score de Tecnologia Social (Motor Fuzzy EFITS v2.0)

O sistema usa **lógica fuzzy**, não scoring determinístico. Decisão metodológica da coordenadora: fenômenos sociais são graduais, não binários.

### Fluxo de cadastro em duas fases

**Fase 1 — Triagem (obrigatória):** Ao clicar em "Cadastrar Experiência", o coordenador responde **primeiro** as 20 perguntas fuzzy. O motor calcula o índice de aderência.

**Gate de decisão:**
- **Verde (≥ 0.7)** ou **Amarelo (0.3–0.7):** coordenador habilitado a prosseguir para cadastro completo
- **Vermelho (< 0.3):** mensagem respeitosa explicando que a experiência não atingiu os parâmetros mínimos; cadastro completo **não liberado**; nenhum dado pessoal salvo

**Fase 2 — Cadastro completo (condicional):** 6 etapas restantes (Identificação, Experiência, Classificação CNPq+ODS+Categoria, FORPROEX, Resultados, Materiais).

Limiar do gate configurável via `configuracao_sistema.fuzzy_gate_triagem_min` (padrão: 0.3).

### Modelo

- **20 perguntas** · **5 dimensões** (4 perguntas cada) · **escala 0–10** (slider, passo 0.5)
- **Dimensões e pesos fixos:** Participação Comunitária P=0.30, Impacto Social I=0.25, Apropriação Tecnológica A=0.20, Sustentabilidade S=0.15, Replicabilidade R=0.10
- **Motor Mamdani** com funções de pertinência triangulares (baixo/médio/alto) e regras SE-ENTÃO
- **Defuzzificação por média ponderada** → índice 0–1
- **Índice linear** calculado em paralelo como referência cruzada

**Faixas cromáticas:**
- Vermelho (0.0–0.3) — não é tecnologia social; bloqueia cadastro
- Amarelo (0.3–0.7) — potencial / em transição; libera cadastro
- Verde (0.7–1.0) — tecnologia social consolidada; libera cadastro

### Implementação técnica

- Motor em **TypeScript puro** no servidor (Server Action ou Edge Function) — sem libs externas
- Funções de pertinência e regras documentadas matematicamente em `docs/lisa_perguntas_score.md`
- Resultados em `avaliacao_fuzzy` com pertinências e ativações em JSONB para auditoria
- Triagem roda antes de qualquer persistência — dados ficam só em localStorage até habilitação

### O que NÃO é do portal

- Validação estatística do instrumento (Cronbach, AFE, AFC) — trabalho de pesquisa acadêmica, roda em SPSS/R
- O painel admin deve oferecer **exportação CSV** das respostas cruas para uso externo

O score organiza a fila de moderação e funciona como gate de entrada, mas a **decisão final de publicação é humana**.

---

## Classificação de Experiências

### Áreas CNPq

Classificação por grande área de conhecimento (pesquisa). Hierarquia de 2 níveis no MVP (4 no v2). Tabelas `grande_area_cnpq` e `subarea_cnpq`.

### Áreas FORPROEX

Classificação por área de intervenção social (extensão universitária) — padrão nacional brasileiro. CNPq reflete a área de conhecimento; FORPROEX reflete a área de intervenção.

As 8 áreas (seed em `area_tematica_forproex`):
1. **Comunicação** — mídia comunitária, material educativo, rádio e TV
2. **Cultura** — produção cultural, memória, patrimônio, folclore, artesanato
3. **Direitos Humanos e Justiça** — cidadania, ética, inclusão, assistência jurídica
4. **Educação** — básica, superior, profissional, popular, especial, EJA
5. **Meio Ambiente** — ecologia, sustentabilidade, recursos hídricos, gestão ambiental
6. **Saúde** — saúde pública, nutrição, saúde do trabalhador
7. **Tecnologia e Produção** — desenvolvimento tecnológico, difusão, desenvolvimento rural/industrial
8. **Trabalho** — economia solidária, qualificação profissional, relações de trabalho

Seleção múltipla obrigatória. Relação N:N via `experiencia_forproex` com flag `principal` opcional.

### ODS (Objetivos de Desenvolvimento Sustentável)

Seleção múltipla. Relação N:N via `experiencia_ods`.

---

## Regras de Negócio — Validação de Formulários

- Textareas de texto livre: **limite de 3.000 caracteres** — validar no frontend (maxlength + contador) e backend
- Campos abertos por dimensão fuzzy: **opcionais**, limite de 1.000 caracteres cada
- 20 perguntas fuzzy: **obrigatórias**, valor 0–10 para aceitar submissão
- Foto de capa + 2 secundárias: **obrigatórias para publicação**, não para submissão
- Termo de consentimento: **obrigatório** para submissão

---

## Status da Experiência

Fluxo típico:

```
em_moderacao
  → aprovada_ativa_em_andamento | aprovada_ativa_perene
    → aprovada_encerrada
      → aguardando_confirmacao_coordenador
        → inativa_nao_confirmada
```

Toda mudança de status gera linha imutável em `historico_status`.

---

## O Que Evitar

- Criar features fora do MVP sem discussão (chatbot IA, blog, base de especialistas, etc.)
- Usar IA no MVP para scoring ou moderação automática — decisão explícita do projeto
- Mudar a stack (Next.js + Supabase) sem discussão
- Adicionar `border-radius` em qualquer lugar
- Criar tema claro
- Usar emojis em títulos ou navegação do portal
- Usar cores fora da paleta sem justificativa
- Criar arquivos soltos na raiz — organizar em `/app`, `/components`, `/lib`, `/docs`, `/public`, `/supabase`
- Hardcodar strings de UI — usar i18n desde o início
- Hardcodar configurações mutáveis — usar tabela `configuracao_sistema`

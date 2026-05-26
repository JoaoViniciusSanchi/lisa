# Portal LISA — Referência Rápida

> Para contexto completo (produto, design, regras de negócio): leia `docs/CONTEXTO.md`.
## Stack

| Camada | Escolha |
|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| Estilização | Tailwind CSS |
| Hospedagem | Vercel (plano Hobby) |
| Backend / DB / Auth | Supabase (plano Free) — PostgreSQL |
| E-mail | Resend (plano Free) |
| Tradução | DeepL Free API |
| Animações | GSAP + ScrollTrigger |
| Fontes | Inter + Inter Tight (Google Fonts) |

## Comandos Essenciais

```bash
npm run dev          # servidor Next.js em localhost:3000
npm run build        # build de produção
npm run lint         # ESLint
npx supabase start   # Supabase local (Docker)
npx supabase stop    # parar Supabase local
npx supabase db push # aplicar migrações no projeto remoto
```

Setup do banco: copiar `/supabase/lisa_setup.sql` e rodar no SQL Editor do Supabase.

## Estrutura de Pastas

```
app/[locale]/              → rotas públicas (home, cadastrar, cadastrar-pesquisador)
app/[locale]/catalogo/     → catálogo público com filtros [a implementar]
app/admin-lisa-xyz/        → painel admin (URL oculta, não indexada)
app/atualizar/             → link mágico para coordenadores — atualizar dados e texto EN
app/validar/               → link mágico para coordenadores — aprovar tradução EN
app/api/                   → route handlers (regerar-traducao, submit-cadastro…)
components/ui/             → componentes atômicos reutilizáveis
components/home/           → seções da home (Hero, DotGrid, Timeline…)
components/cadastro/       → formulário multi-step (steps/, state.ts, FormProvider…)
components/admin/          → painel admin (ExperienciasClient, TraducoesClient, EmailsClient…)
lib/supabase/              → clients (client.ts, server.ts) + types.ts gerado
lib/email/                 → wrapper Resend (client, send, defaults, render)
lib/actions/               → Server Actions (submit-cadastro, update-experiencia)
lib/admin/                 → ações do admin (actions.ts, email-actions.ts)
lib/utils/                 → score.ts (motor fuzzy), slug.ts
supabase/migrations/       → SQL versionado (0001 a 0012+)
docs/                      → documentação e referências
mockups/                   → HTML pixel-perfect aprovados (não editar)
```

## Convenções de Código

- Código e variáveis em **inglês**; comentários em **português**
- Tabelas e colunas do banco em **português snake_case** (definido no schema)
- Strings de UI nunca hardcodadas — usar i18n desde o início
- Configurações mutáveis na tabela `configuracao_sistema`, nunca no código

## Commits (Conventional Commits)

```
feat: adicionar formulário de cadastro multi-step
fix: corrigir cálculo de score na dimensão participacao_comunidade
refactor: extrair componente YesNoCard
style: ajustar espaçamento do hero
docs: atualizar CLAUDE.md
```

## Onde buscar informação

| Dúvida | Onde olhar |
|---|---|
| Decisões de produto, MVP vs v2, regras de negócio | `docs/CONTEXTO.md` |
| Schema do banco (tabelas, enums, relações) | `docs/lisa_schema.dbml` · `supabase/lisa_setup.sql` |
| Motor fuzzy EFITS — perguntas, pesos, algoritmo | `docs/lisa_perguntas_score.md` |
| Decisões consolidadas da fase de modelagem | `docs/lisa_consolidacao.md` |
| Referencial teórico (Dagnino, Rodrigues & Barbieri) | `docs/referencias/` |
| Mockups aprovados (home + cadastro) | `mockups/` |
| Design system completo (paleta, princípios) | `docs/CONTEXTO.md` → seção Design System |

**Se a dúvida não estiver em nenhum dos lugares acima: pergunte antes de inventar.**

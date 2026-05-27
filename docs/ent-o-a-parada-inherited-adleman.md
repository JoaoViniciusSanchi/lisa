# Plano — Formulário Tecnologia Social (TS) duplicado

## Context

A professora apontou que o formulário público em [/cadastrar](portal-lisa-app/app/[locale]/cadastrar/page.tsx) usa a identidade visual do Portal LISA (paleta petrol escura, marca "LISA", design system minimalista), mas o público-alvo imediato (coordenadores de projetos UFF que vão alimentar o **Catálogo 2026 de Tecnologia Social**) ainda não conhece o Portal LISA — ele não foi lançado. A identidade que os usuários reconhecem é a da **AGIR (Agência de Inovação UFF)** e do setor de **Tecnologia Social**.

Solução: criar um **segundo formulário** num caminho novo (`/cadastrar-ts`), com **as mesmas perguntas e a mesma lógica**, mas com **identidade visual diferente** (cores AGIR/TS, fonte Nunito, logos da AGIR, TS, PROPPI e UFF no rodapé). Os dois formulários alimentam o mesmo banco — a única diferença é a "cara". O formulário LISA continua existindo em `/cadastrar` para uso futuro.

**Decisões já alinhadas:**
- Rota: `/cadastrar-ts` (paralelo a `/cadastrar`)
- Estratégia: **duplicação total** dos componentes visuais em `components/cadastro-ts/` — sem refactor para tematização. A lógica (state, reducer, submit) é compartilhada.
- `tipoOrigem` fica fixo em `'interna_edital'` — sem tela intermediária de seleção (interna/externa não se aplica ao catálogo TS).
- Fonte: **Nunito** (Google Font) — carregada via `next/font/google`.
- Cores: `#0C71C3` (accent), `#041726` (fundo profundo), `#062D4D` (fundo elevado).
- Logos: `logo_ts.svg` no header; `logo_rodape_1.svg` a `logo_rodape_4.svg` no rodapé. Todas em [portal-lisa-app/public/images/](portal-lisa-app/public/images/).

---

## Arquitetura

### O que é **compartilhado** (zero duplicação)

| Arquivo | Responsabilidade |
|---|---|
| [components/cadastro/FormProvider.tsx](portal-lisa-app/components/cadastro/FormProvider.tsx) | Context + reducer + auto-save no localStorage |
| [components/cadastro/state.ts](portal-lisa-app/components/cadastro/state.ts) | STEPS, TipoOrigem, reducer, tipos |
| [lib/actions/submit-cadastro.ts](portal-lisa-app/lib/actions/submit-cadastro.ts) | Server Action de submissão |
| [lib/fuzzy/*](portal-lisa-app/lib/fuzzy/) | Motor EFITS |
| Componentes UI globais usados nos steps (`Button`, `Eyebrow`, `ArrowRight`, etc.) — **não duplicar** |

### O que é **duplicado** com nova identidade

Tudo dentro de `components/cadastro-ts/`, mirror de `components/cadastro/`:

```
components/cadastro-ts/
  CadastroControllerTS.tsx    ← orquestra steps, usa FormProvider compartilhado
  CadastroHeaderTS.tsx        ← logo TS, fundo claro, "VOLTAR AO PORTAL"
  ProgressBarTS.tsx           ← círculos azuis, fonte Nunito
  CadastroNavigationTS.tsx    ← botões azul #0C71C3
  DraftIndicatorTS.tsx        ← cores TS
  FormFieldsTS.tsx            ← inputs com paleta TS
  FuzzySliderTS.tsx           ← mantém semântica red/yellow/green; thumb e moldura na paleta TS
  UploadZoneTS.tsx
  PillTS.tsx
  CategoryCardTS.tsx
  OdsCardTS.tsx
  DimensionBreakdownTS.tsx
  FuzzyResultGaugeTS.tsx
  FooterTS.tsx                ← 4 logos centralizados (logo_rodape_1..4)
  steps/
    WelcomeStepTS.tsx
    TriagemStepTS.tsx
    ResultStepTS.tsx
    IdentificacaoStepTS.tsx
    ExperienciaStepTS.tsx
    MacroareaStepTS.tsx
    ClassificacaoCnpqOdsStepTS.tsx
    FinalidadeSocialStepTS.tsx
    ForproexStepTS.tsx
    OutrasClassificacoesStepTS.tsx
    ResultadosMateriaisStepTS.tsx
    TextoIngleStepTS.tsx
    SuccessStepTS.tsx
```

Cada arquivo TS **importa state, dispatch e tipos de `components/cadastro/`** (origem única para lógica), e apenas a camada de apresentação muda.

---

## Passos de implementação

### 1. Adicionar a fonte Nunito

Em [portal-lisa-app/app/[locale]/layout.tsx](portal-lisa-app/app/[locale]/layout.tsx) (onde Inter já é carregada via `next/font/google`):

```ts
import { Nunito } from 'next/font/google';
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' });
// adicionar nunito.variable ao className do <html> ou <body>
```

E em [portal-lisa-app/tailwind.config.ts](portal-lisa-app/tailwind.config.ts), expor a fonte:

```ts
fontFamily: {
  // ... existentes
  nunito: ['var(--font-nunito)', 'system-ui', 'sans-serif']
}
```

### 2. Adicionar tokens de cor TS no Tailwind

Em [tailwind.config.ts](portal-lisa-app/tailwind.config.ts), adicionar à seção `colors`:

```ts
'ts-deep': '#041726',        // fundo principal
'ts-mid': '#062D4D',         // fundo elevado / cards
'ts-accent': '#0C71C3',      // botões, links, destaques
'ts-accent-hover': '#0F8AE5',// hover (~15% mais claro)
```

Manter `border-radius: 0 !important` global vigente (a referência visual mostra cantos retos, está coerente).

### 3. Criar a página

[portal-lisa-app/app/[locale]/cadastrar-ts/page.tsx](portal-lisa-app/app/[locale]/cadastrar-ts/page.tsx) — clone enxuto da page LISA:

```tsx
import { FormProvider } from '@/components/cadastro/FormProvider';
import { CadastroControllerTS } from '@/components/cadastro-ts/CadastroControllerTS';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Cadastrar Experiência · Tecnologia Social · AGIR UFF',
  description: 'Cadastre sua experiência no Catálogo 2026 de Tecnologia Social da AGIR UFF.'
};

export default function CadastrarTSPage() {
  return (
    <div className="font-nunito bg-ts-deep min-h-screen text-white">
      <FormProvider tipoOrigem="interna_edital">
        <CadastroControllerTS />
      </FormProvider>
    </div>
  );
}
```

Notas:
- `tipoOrigem` fixo em `'interna_edital'` (não depende mais do estado do edital — o cadastro TS só faz sentido em contexto de catálogo).
- O wrapper `font-nunito bg-ts-deep` aplica fonte e fundo a tudo abaixo.

### 4. Replicar o CadastroController

[components/cadastro-ts/CadastroControllerTS.tsx](portal-lisa-app/components/cadastro-ts/CadastroControllerTS.tsx) — cópia adaptada de [CadastroController.tsx](portal-lisa-app/components/cadastro/CadastroController.tsx):
- Mesma lógica de routing por step
- Importa `CadastroHeaderTS`, `ProgressBarTS`, `CadastroNavigationTS`, `DraftIndicatorTS`, `FooterTS`
- Importa os 13 steps de `./steps/*StepTS`
- Importa `STEPS`, `TRIAGEM_STEPS`, `CADASTRO_STEPS`, `TRIAGEM_DIMENSION_BY_STEP` de `@/components/cadastro/state`
- Importa `useCadastroForm` de `@/components/cadastro/FormProvider`
- Ajustes de layout/padding conforme a nova identidade

### 5. Header TS

[components/cadastro-ts/CadastroHeaderTS.tsx](portal-lisa-app/components/cadastro-ts/CadastroHeaderTS.tsx) — espelha o layout da referência:
- Fundo **branco** com borda inferior azul (`border-b-2 border-ts-accent`)
- À esquerda: `<Image src="/images/logo_ts.svg" .../>` (alt: "Tecnologia Social")
- À direita: "Edital **Chamamento 2026**" (em azul) + separador + "VOLTAR AO PORTAL" como `<Link href="/" />`
- Fonte Nunito, peso medium

### 6. Footer TS

[components/cadastro-ts/FooterTS.tsx](portal-lisa-app/components/cadastro-ts/FooterTS.tsx):
- Fundo `bg-ts-deep` com borda superior azul fina
- Quatro `<Image>` lado a lado, centralizados: logo TS, AGIR, PROPPI, UFF
- Espaçamento generoso, max-width contido

### 7. ProgressBar TS

Mesma estrutura de [ProgressBar.tsx](portal-lisa-app/components/cadastro/ProgressBar.tsx), mas:
- Círculos `border-ts-accent` (ativo), `border-ts-accent/40` (pendente)
- Linhas conectoras `bg-ts-accent/30`
- Texto da fase em `text-ts-accent` com fonte Nunito
- Fundo `bg-ts-deep/95` com backdrop-blur

### 8. CadastroNavigationTS, FormFieldsTS e demais

- Botões "Próximo / Anterior": `bg-ts-accent text-white hover:bg-ts-accent-hover`
- Botão "Voltar": `border border-white/20 text-white/80 hover:bg-white/5`
- Inputs: `bg-ts-mid border border-white/10 text-white placeholder:text-white/40 focus:border-ts-accent`
- Pills, Cards, FuzzySlider thumb: usar paleta TS, mantendo as cores **fuzzy semânticas (vermelho/amarelo/verde) inalteradas** porque carregam significado de score, não identidade visual

### 9. Replicar os 13 steps

Cada `*StepTS.tsx` em `components/cadastro-ts/steps/`:
- Mesma estrutura JSX e mesmas chamadas `dispatch`
- Substituir classes hardcoded LISA por TS:
  - `text-accent-glow` → `text-ts-accent`
  - `bg-bg-elevated` → `bg-ts-mid`
  - `border-line-strong` → `border-white/15`
  - `bg-bg-base` → `bg-ts-deep`
  - `font-display` → `font-nunito` (com pesos diferentes)
- Importar `FieldGroup`, `FieldTextarea`, etc. de `FormFieldsTS` em vez de `FormFields`

Os textos (perguntas EFITS, labels, ajudas) **ficam idênticos** — fazem referência a "AGIR UFF" e "Catálogo 2026 de Tecnologia Social", o que já bate com a identidade TS.

### 10. Pequenos ajustes nos componentes compartilhados (se necessário)

Se algum componente UI global (ex: `Button`, `Eyebrow`) tiver paleta LISA hardcoded, criar variantes TS locais em `cadastro-ts/` em vez de mexer no global. Manter `components/ui/` intocado para não afetar o resto do site.

---

## Arquivos a criar (lista completa)

**Novos:**
- [portal-lisa-app/app/[locale]/cadastrar-ts/page.tsx](portal-lisa-app/app/[locale]/cadastrar-ts/page.tsx)
- [portal-lisa-app/components/cadastro-ts/CadastroControllerTS.tsx](portal-lisa-app/components/cadastro-ts/CadastroControllerTS.tsx)
- [portal-lisa-app/components/cadastro-ts/CadastroHeaderTS.tsx](portal-lisa-app/components/cadastro-ts/CadastroHeaderTS.tsx)
- [portal-lisa-app/components/cadastro-ts/ProgressBarTS.tsx](portal-lisa-app/components/cadastro-ts/ProgressBarTS.tsx)
- [portal-lisa-app/components/cadastro-ts/CadastroNavigationTS.tsx](portal-lisa-app/components/cadastro-ts/CadastroNavigationTS.tsx)
- [portal-lisa-app/components/cadastro-ts/DraftIndicatorTS.tsx](portal-lisa-app/components/cadastro-ts/DraftIndicatorTS.tsx)
- [portal-lisa-app/components/cadastro-ts/FormFieldsTS.tsx](portal-lisa-app/components/cadastro-ts/FormFieldsTS.tsx)
- [portal-lisa-app/components/cadastro-ts/FuzzySliderTS.tsx](portal-lisa-app/components/cadastro-ts/FuzzySliderTS.tsx)
- [portal-lisa-app/components/cadastro-ts/UploadZoneTS.tsx](portal-lisa-app/components/cadastro-ts/UploadZoneTS.tsx)
- [portal-lisa-app/components/cadastro-ts/PillTS.tsx](portal-lisa-app/components/cadastro-ts/PillTS.tsx)
- [portal-lisa-app/components/cadastro-ts/CategoryCardTS.tsx](portal-lisa-app/components/cadastro-ts/CategoryCardTS.tsx)
- [portal-lisa-app/components/cadastro-ts/OdsCardTS.tsx](portal-lisa-app/components/cadastro-ts/OdsCardTS.tsx)
- [portal-lisa-app/components/cadastro-ts/DimensionBreakdownTS.tsx](portal-lisa-app/components/cadastro-ts/DimensionBreakdownTS.tsx)
- [portal-lisa-app/components/cadastro-ts/FuzzyResultGaugeTS.tsx](portal-lisa-app/components/cadastro-ts/FuzzyResultGaugeTS.tsx)
- [portal-lisa-app/components/cadastro-ts/FooterTS.tsx](portal-lisa-app/components/cadastro-ts/FooterTS.tsx)
- 13 arquivos em [portal-lisa-app/components/cadastro-ts/steps/](portal-lisa-app/components/cadastro-ts/steps/)

**Alterados:**
- [portal-lisa-app/app/[locale]/layout.tsx](portal-lisa-app/app/[locale]/layout.tsx) — adicionar Nunito
- [portal-lisa-app/tailwind.config.ts](portal-lisa-app/tailwind.config.ts) — adicionar `font-nunito` e tokens `ts-*`

**Sem mudança:**
- Submit action, FormProvider, state, fuzzy engine, schema do banco, server actions

---

## O que NÃO faz parte deste plano (follow-ups)

- Linkar `/cadastrar-ts` a partir da home — você vai mandar a URL diretamente para os usuários por ora.
- Refatorar o formulário LISA original para tematização — fica como está.
- Edição de experiência via link mágico no design TS — fluxo `/atualizar` continua com design LISA por ora.
- Texto da EN para o formulário TS — `TextoIngleStepTS` é incluído para paridade, mas só aparece em modo edição (que ainda usa /cadastrar).
- E-mails de confirmação não precisam mudar (são processados via submit action compartilhada).

---

## Verificação

1. `npm run dev` em `portal-lisa-app/`
2. Abrir `http://localhost:3000/pt/cadastrar-ts` — verificar:
   - Header branco com logo TS à esquerda e "Voltar ao portal" à direita
   - Fundo `#041726`, fonte Nunito carregada
   - WelcomeStep renderiza com eyebrow azul "EDITAL DE CHAMAMENTO 2026 · ABERTO", 4 tiles, botão azul "Começar triagem"
3. Avançar pela triagem (5 dimensões EFITS) — sliders funcionam, justificativas salvam
4. Passar pelo ResultStep e completar as 8 etapas do cadastro
5. Submeter — verificar no painel admin em `/admin-lisa-xyz/experiencias/internas` que a experiência apareceu com `tipo_origem='interna_edital'` (ou equivalente) e mesma estrutura de campos que uma submissão `/cadastrar`
6. Abrir `/pt/cadastrar` em paralelo — confirmar que o formulário LISA original continua intacto
7. Testar responsivo (mobile/tablet)
8. Confirmar que o auto-save no localStorage funciona (a chave `lisa_cadastro_draft_v1` é compartilhada — verificar se isso causa colisão entre os dois formulários; se sim, ajustar a chave em `FormProvider` para incluir `tipoOrigem` no nome)

> ⚠️ Ponto de atenção do item 8: o `FormProvider` salva o rascunho em `localStorage` com chave fixa. Se o usuário começar a preencher em `/cadastrar` e abrir `/cadastrar-ts` (ou vice-versa), o rascunho vai cruzar. Verificar isso na verificação e, se for problema real, separar as chaves por `tipoOrigem` ou rota.

# Portal LISA — Refatoração para Hospedagem Estática

## 📋 Resumo Executivo

A aplicação Portal LISA foi refatorada de um modelo **Server-side Rendering (SSR)** para um modelo **Static Export + Serverless**, permitindo hospedagem em servidor de arquivos (FTP) sem necessidade de VPS com Node.js.

### Benefícios
- ✅ Hospedagem em FTP simples (Locaweb ou similar)
- ✅ Redução drástica de custos operacionais
- ✅ Sem manutenção de servidor
- ✅ Performance máxima (conteúdo estático + edge functions)
- ✅ Escalabilidade automática (Supabase serverless)

---

## 🏗️ Arquitetura Nova

```
┌──────────────────────────────────────────────────────────────┐
│                     FTP (Servidor de Arquivos)               │
│  - HTML estático pré-renderizado                             │
│  - CSS/JS otimizado                                          │
│  - Assets (imagens, fonts)                                   │
│  Hospedagem: Locaweb FTP                                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    (cliente acessa)
                            ↓
┌──────────────────────────────────────────────────────────────┐
│               Supabase (Backend Serverless)                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Edge Functions (Deno Runtime)                      │   │
│  │  - /pesquisador → cadastro de especialistas       │   │
│  │  - /triagem → validação fuzzy                      │   │
│  │  - /submit-cadastro → submissão com upload         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                │   │
│  │  - Tabelas (experiencia, pessoa, etc)              │   │
│  │  - RLS Policies (segurança)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Storage (Bucket anexos-experiencias)              │   │
│  │  - Upload de imagens (JPG, PNG, WebP)             │   │
│  │  - URLs públicas                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Plano: Free (ou Pro para maior volume)                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Mudanças Implementadas

### 1. **Remover Server Actions**
- ❌ Deletado: `lib/actions/cadastrarPesquisador.ts`
- ❌ Deletado: `lib/actions/submit-cadastro.ts`
- ❌ Deletado: `lib/actions/triagem.ts`

### 2. **Criar Supabase Edge Functions**
- ✅ `supabase/functions/pesquisador/index.ts`
  - Cadastro de pesquisador/expert
  - Validação de email único
  - Relação com áreas FORPROEX

- ✅ `supabase/functions/triagem/index.ts`
  - Cálculo fuzzy no servidor
  - Validação de gate de triagem
  - Retorna resultado e permissão de prosseguir

- ✅ `supabase/functions/submit-cadastro/index.ts`
  - Submissão completa de experiência
  - Upload de múltiplas imagens
  - Geração de protocolo único
  - Cleanup automático em caso de falha

### 3. **Atualizar Componentes para Fetch**
- ✅ `app/[locale]/cadastrar-pesquisador/CadastrarPesquisadorForm.tsx`
  - Troca: `startTransition(async () => { await cadastrarPesquisadorPublicoAction(...) })`
  - Para: `fetch(getEdgeFunctionURL('pesquisador'), { method: 'POST', body: JSON.stringify(...) })`

- ✅ `components/cadastro/CadastroNavigation.tsx`
  - Troca: `await submitCadastroWithFiles(formData)`
  - Para: `fetch(getEdgeFunctionURL('submit-cadastro'), { method: 'POST', body: formData })`

- ✅ `components/cadastro/steps/ResultStep.tsx`
  - Troca: `runTriagem(state.fuzzyAnswers)`
  - Para: `fetch(getEdgeFunctionURL('triagem'), { method: 'POST', body: JSON.stringify({ answers }) })`

### 4. **Habilitar Static Export**
- ✅ `next.config.mjs`
  ```javascript
  const nextConfig = {
    output: 'export',  // ← adicionado
    reactStrictMode: true
  };
  ```

### 5. **Excluir Supabase do TypeScript**
- ✅ `tsconfig.json`
  ```json
  "exclude": ["node_modules", "supabase"]  // ← adicionar supabase
  ```

### 6. **Criar Helper para URLs**
- ✅ `lib/supabase/edge-functions.ts`
  - Extrai project ID de `NEXT_PUBLIC_SUPABASE_URL`
  - Constrói URLs automáticas: `https://{project-id}.supabase.co/functions/v1/{function}`
  - Usado por todos os componentes

### 7. **Deletar Route Handlers (API Routes)**
- ❌ `app/api/pesquisador/route.ts`
- ❌ `app/api/triagem/route.ts`
- ❌ `app/api/submit-cadastro/route.ts`

(Route handlers não funcionam com static export)

---

## 📦 Build & Deploy

### Build Estático
```bash
npm run build
# Gera arquivos em: .next/out/
```

Tamanho esperado: **~5-10 MB** (muito menor que antes)

### Deploy das Edge Functions (uma única vez)
```bash
supabase functions deploy pesquisador
supabase functions deploy triagem
supabase functions deploy submit-cadastro

# Verificar:
supabase functions list
```

### Deploy no FTP
```bash
# Opção 1: Manual (FTP GUI)
# - Conectar ao FTP da Locaweb
# - Navegar para public_html (ou pasta pública)
# - Fazer upload de tudo de .next/out/

# Opção 2: Script SFTP
sftp usuario@seu-ftp << EOF
cd public_html
mput .next/out/*
quit
EOF
```

---

## 🔐 Segurança

### Edge Functions
- Usam `SUPABASE_SERVICE_ROLE_KEY` (nunca exposto ao cliente)
- Validação server-side em TODAS as operações
- CORS headers configurados (permitir qualquer origem)
- Rate limiting via Supabase (plano Free: 1M requests/mês)

### Banco de Dados
- RLS (Row-Level Security) policies em vigor
- Sem dados sensíveis expostos
- Acesso apenas via Edge Functions autorizadas

### Storage
- Bucket público apenas para LEITURA (imagens)
- WRITE apenas via Edge Functions
- Validação de MIME type (JPEG, PNG, WebP)
- Limite de tamanho: 5MB por arquivo

---

## 📊 Custo-Benefício

### Antes (Vercel SSR)
- Hospedagem: Vercel Free ou Pro (~$20/mês)
- Database: Supabase Free
- **Total: ~$0-20/mês**

### Depois (Static + Edge)
- Hospedagem: FTP Locaweb (já contratado)
- Database: Supabase Free
- Edge Functions: Supabase Free (até 1M requests/mês)
- **Total: ~$0/mês** (apenas FTP que já usa)

**ROI: -100% de custos de hospedagem** ✅

---

## 📝 Variáveis de Ambiente

### `.env.local` (Público - deve constar no .env.example)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Essas variáveis são **públicas** e necessárias para o cliente chamar as Edge Functions.

### Supabase (Automático)
As Edge Functions têm acesso automático a:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Nenhuma configuração extra é necessária.

---

## ✅ Testes Recomendados

### 1. Localmente
```bash
npm run build
npx serve .next/out
# Acessar http://localhost:3000
# Testar: formulário de pesquisador, cadastro, upload
```

### 2. Produção
- [ ] Verificar se Edge Functions foram deployadas
- [ ] Testar cadastro de pesquisador
- [ ] Testar triagem com diferentes respostas
- [ ] Testar upload de imagem durante cadastro
- [ ] Verificar protocolo gerado
- [ ] Confirmar dados no Supabase Dashboard

---

## 🚨 Possíveis Problemas

| Problema | Causa | Solução |
|----------|-------|--------|
| Edge Functions 404 | Não foram deployadas | `supabase functions deploy <name>` |
| CORS error | Navegador bloqueando | Adicionar headers CORS (já feito) |
| Upload falha | Bucket não existe ou sem permissão | Criar/configurar bucket no Supabase |
| Imagens não carregam | URL pública incorreta | Verificar função `getPublicUrl()` |
| Protocolo não é gerado | Query count falha | Verificar permissões RLS |

---

## 📚 Documentação

- **[DEPLOY_STATIC.md](./docs/DEPLOY_STATIC.md)** — Guia completo de deployment
- **[CLAUDE.md](./CLAUDE.md)** — Stack e referências do projeto
- **[docs/CONTEXTO.md](./docs/CONTEXTO.md)** — Regras de negócio e design

---

## 🎯 Próximos Passos

1. ✅ Build e testar localmente
2. ⏳ Deploy das Edge Functions no Supabase
3. ⏳ Upload para FTP da Locaweb
4. ⏳ Testar em produção
5. ⏳ Monitorar logs das Edge Functions

---

## 📞 Suporte

Para dúvidas sobre a arquitetura, veja:
- Logs: `supabase functions logs <name> --follow`
- Dashboard: https://app.supabase.com/ (seu projeto)
- Docs: https://supabase.com/docs/guides/functions

---

**Status Final: ✅ Pronto para Produção**

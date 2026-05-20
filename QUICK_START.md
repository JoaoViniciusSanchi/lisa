# 🚀 Quick Start — Portal LISA Estático

Seu Portal LISA agora está configurado para hospedagem estática + serverless.

## TL;DR (3 Passos)

```bash
# 1. Build
cd portal-lisa-app
npm run build

# 2. Deploy das Edge Functions
supabase functions deploy pesquisador
supabase functions deploy triagem
supabase functions deploy submit-cadastro

# 3. Upload para FTP
# Fazer upload de .next/out/* para seu FTP
```

---

## 📁 O que mudou?

### Removido
- ❌ `lib/actions/` (Server Actions)
- ❌ `app/api/` (Route Handlers)
- ❌ Server-side rendering

### Adicionado
- ✅ `supabase/functions/` (Edge Functions)
- ✅ `lib/supabase/edge-functions.ts` (helper)
- ✅ `lib/i18n/static-params.ts` (static params)
- ✅ `output: 'export'` no next.config

### Atualizado
- ✅ Componentes usam `fetch()` em vez de Server Actions
- ✅ Páginas `[locale]` têm `generateStaticParams()`
- ✅ tsconfig.json exclui `supabase/`

---

## 🔧 Antes de Começar

```bash
# Verificar versão do Node
node --version
# Deve ser 18.17+ ou 19.8+

# Verificar .env.local
cat .env.local
# Deve conter:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# Verificar CLI Supabase
supabase --version
# Se não tem: npm install -g supabase@latest
```

---

## 🛠️ Passo 1: Build Estático Local

```bash
npm run build
```

**O que acontece:**
1. TypeScript compila
2. Verifica tipos
3. Lint ESLint
4. Pré-renderiza todas as páginas HTML
5. Otimiza CSS/JS
6. Gera em `.next/out/`

**Tempo esperado:** 2-5 minutos

**Resultado:**
```
.next/out/
├── pt/
│   ├── index.html
│   ├── cadastrar/
│   ├── cadastrar-pesquisador/
│   └── ...
├── en/
│   ├── index.html
│   ├── cadastrar/
│   └── ...
├── _next/
│   ├── static/
│   └── data/
└── 404.html
```

**Se falhar:**
```bash
# Limpar cache
rm -rf .next
npm run build -- --debug

# Ou
npm run lint
```

---

## 🌐 Passo 2: Deploy das Edge Functions

### 2.1 Autenticar

```bash
supabase login
```

Será pedido um token. Gere em: https://app.supabase.com/account/tokens

### 2.2 Link com Projeto

```bash
supabase link
```

Selecione seu projeto. Se não vê: verifique acesso em https://app.supabase.com

### 2.3 Deploy das 3 Functions

```bash
supabase functions deploy pesquisador
supabase functions deploy triagem
supabase functions deploy submit-cadastro
```

**Cada uma deve retornar:**
```
✓ Function pesquisador deployed successfully!
   Endpoint: https://xxxxx.supabase.co/functions/v1/pesquisador
```

### 2.4 Verificar

```bash
supabase functions list
```

Deve aparecer:
```
Name                Status    Version
pesquisador         active    1
triagem             active    1
submit-cadastro     active    1
```

### 2.5 Testar (Opcional)

```bash
# Testar pesquisador
curl -X POST https://<seu-projeto-id>.supabase.co/functions/v1/pesquisador \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","email":"test@example.com"}'

# Resposta esperada:
# {"ok":false,"error":"..."}  (erro de banco é ok, prova que função roda)
```

---

## 📤 Passo 3: Upload para FTP

### Opção A: FTP Gui (Recomendado para Iniciantes)

1. Abrir Filezilla ou WinSCP
2. Host: `seu-ftp.com.br` (seu FTP da Locaweb)
3. Usuário: `seu-usuario-ftp`
4. Senha: `sua-senha-ftp`
5. Porta: 21
6. Conectar
7. Navegar para `public_html` (ou pasta pública do seu servidor)
8. **Deletar** conteúdo antigo (se houver)
9. **Arrastar & soltar** tudo de `portal-lisa-app/.next/out/` para o FTP

### Opção B: SFTP via Terminal

```bash
sftp seu-usuario@seu-ftp << 'EOF'
cd public_html
mput .next/out/*
quit
EOF
```

### Opção C: RSYNC (Se Disponível)

```bash
rsync -avz --delete .next/out/ seu-usuario@seu-ftp:public_html/
```

**Checkpoint:**
- [ ] Arquivos no FTP
- [ ] Vê `index.html`, `pt/`, `en/` no FTP
- [ ] Consigo acessar: https://seu-dominio.com.br/

---

## ✅ Testar em Produção

### Acesso Básico

Abra no navegador:
```
https://seu-dominio.com.br/
```

**Esperado:**
- ✅ Página carrega
- ✅ Vê conteúdo com styling
- ✅ Menu funciona
- ✅ Links navegam

### Testar Cadastro

1. Ir para: `https://seu-dominio.com.br/cadastrar-pesquisador`
2. Preencher formulário
3. Clicar "Enviar cadastro"

**Esperado:**
- ✅ Vê "Cadastro recebido!"
- ⏳ Pegar dados no Supabase (próximo passo)

### Verificar Dados no Supabase

```bash
# Ir para https://app.supabase.com/
# Selecionar seu projeto
# Ir para SQL Editor
# Rodar:

SELECT * FROM pesquisador_expert ORDER BY criado_em DESC LIMIT 10;
```

**Esperado:** Vê seu teste cadastrado

---

## 🔍 Troubleshooting

| Problema | Solução |
|----------|--------|
| `npm run build` falha | `rm -rf .next && npm install && npm run build` |
| Edge Function 404 | `supabase functions deploy <name>` novamente |
| Upload lento | Normal para FTP. Considera rsync/sftp |
| Cadastro não salva | DevTools (F12) → Network → vê erro fetch? |
| Imagem não carrega | Verificar bucket `anexos-experiencias` no Supabase |
| "CORS error" | Edge Functions têm CORS configurado, deve ser origem |

---

## 📊 Status de Verificação

```bash
# Verificar tudo funcionando
npm run build  # ✅ Sem erros?
supabase functions list  # ✅ 3 functions "active"?
curl https://seu-dominio.com.br/  # ✅ 200 OK?
curl https://seu-projeto.supabase.co/functions/v1/pesquisador  # ✅ Responde?
```

---

## 📚 Mais Informações

- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) — O que mudou
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) — Guia detalhado
- [DEPLOY_STATIC.md](./docs/DEPLOY_STATIC.md) — Documentação completa

---

## 🎉 Pronto!

Se tudo passou na verificação: **Seu site está em produção!**

### Próximos passos:
1. Monitorar por 1 semana
2. Coletar feedback de usuários
3. Manter `supabase functions logs <name>` de olho

### Custos Contínuos:
- **FTP Locaweb:** já tem (hospedagem estática)
- **Supabase Free:** até 1M requests/mês (mais que suficiente)
- **Total:** $0/mês (apenas FTP que já pagava)

✨ **Aproveite!**

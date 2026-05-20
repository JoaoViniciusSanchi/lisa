# 🚀 Deployment Checklist — Portal LISA

## Pré-Requisitos
- [ ] Conta Supabase (projeto existente)
- [ ] CLI do Supabase instalada: `npm install -g supabase@latest`
- [ ] Acesso ao FTP da Locaweb
- [ ] Node.js 18+ instalado

---

## 1️⃣ Preparar Ambiente Local

```bash
# Clonar/acessar projeto
cd "d:\jv\Documents\UFF 2025\Bolsa Agir\Tecnologia Social\Portal LISA\portal-lisa-app"

# Instalar dependências
npm install

# Verificar variáveis de ambiente
cat .env.local
# Deve conter:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Checkpoints:**
- [ ] `npm install` completou sem erros
- [ ] `.env.local` possui as 2 variáveis necessárias
- [ ] Projeto compila: `npm run build` ✓

---

## 2️⃣ Fazer Build Estático

```bash
npm run build
```

**Resultado esperado:**
- [ ] Build completou com exit code 0
- [ ] Pasta `.next/out/` foi criada
- [ ] Contém arquivos HTML, CSS, JS
- [ ] Tamanho total: ~5-10 MB

**Se falhar:**
```bash
# Debug
npm run lint
npm run build -- --debug
```

---

## 3️⃣ Deploy das Edge Functions

### Passo 1: Autenticar no Supabase

```bash
supabase login
# Insira sua chave de API (consegue em https://app.supabase.com/account/tokens)
```

**Checkpoint:**
- [ ] Login bem-sucedido

### Passo 2: Link com Projeto Remoto

```bash
supabase link
# Selecione seu projeto
```

**Checkpoint:**
- [ ] Projeto linkado com sucesso
- [ ] Vê: `Project linked to: seu-projeto-id`

### Passo 3: Deploy das 3 Functions

```bash
supabase functions deploy pesquisador
supabase functions deploy triagem
supabase functions deploy submit-cadastro
```

**Cada function deve retornar:**
```
✓ Function <name> deployed successfully!
   Endpoint: https://<project-id>.supabase.co/functions/v1/<name>
```

**Checkpoint:**
- [ ] Pesquisador deployada
- [ ] Triagem deployada
- [ ] Submit-cadastro deployada

### Passo 4: Verificar Status

```bash
supabase functions list
```

**Resultado esperado:**
```
Name               Status     Version
pesquisador        active     1
triagem            active     1
submit-cadastro    active     1
```

**Checkpoint:**
- [ ] Todas as 3 functions aparecem como "active"

### Passo 5: Testar as Functions (Opcional)

```bash
# Testar pesquisador
curl -X POST https://<project-id>.supabase.co/functions/v1/pesquisador \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","email":"test@test.com"}'

# Deve retornar (com erro de duplicata é ok):
# {"ok":false,"error":"..."}
```

**Checkpoint:**
- [ ] Função responde (não retorna 404)
- [ ] CORS headers presentes

---

## 4️⃣ Fazer Upload para FTP

### Opção A: FTP Manual (GUI)

1. Abrir software FTP (Filezilla, WinSCP, etc.)
2. Conectar ao FTP da Locaweb
   - Host: seu-ftp.com.br
   - Usuário: seu-usuario
   - Senha: sua-senha
3. Navegar para pasta pública (geralmente `public_html`)
4. Limpar conteúdo antigo (se houver)
5. Fazer upload recursivo de `.next/out/`

**Checkpoint:**
- [ ] Conectado ao FTP
- [ ] Pasta pública vazia
- [ ] Upload completado (~5-10 MB)
- [ ] Vê arquivos: `index.html`, `pt/`, `en/`, etc.

### Opção B: Script SFTP/RSYNC

**Via SFTP:**
```bash
sftp seu-usuario@seu-ftp << 'EOF'
cd public_html
mput .next/out/*
quit
EOF
```

**Via RSYNC (se disponível):**
```bash
rsync -avz .next/out/ seu-usuario@seu-ftp:public_html/
```

**Checkpoint:**
- [ ] Script executou sem erros
- [ ] Arquivos no servidor

---

## 5️⃣ Testar em Produção

### Acesso Básico

```bash
# Acessar site
https://seu-dominio.com.br/
# ou
https://seu-ftp.com.br/

# Deve carregar a página inicial
```

**Checkpoint:**
- [ ] Site carrega (HTML estático)
- [ ] CSS aplica (não vê conteúdo sem estilo)
- [ ] Menu funciona
- [ ] Sem erros 404 (check DevTools → Network)

### Testar Cadastro de Pesquisador

1. Ir para "Cadastro de Pesquisador" (URL: `/cadastrar-pesquisador`)
2. Preencher formulário
3. Clicar "Enviar cadastro"

**Esperado:**
- [ ] Enviou com sucesso
- [ ] Viu mensagem "Cadastro recebido!"
- [ ] Dados aparecem no Supabase (verificar na aba SQL)

**Se falhar:**
```javascript
// DevTools → Console, vá verificar erro
// Likely: CORS error ou function 404
```

### Testar Triagem + Cadastro

1. Ir para "Cadastro de Experiência"
2. Responder 5 etapas de triagem
3. Clicar "Ver resultado da triagem"

**Esperado:**
- [ ] Triagem calcula no servidor
- [ ] Vê resultado (verde, amarelo ou vermelho)
- [ ] Se verde/amarelo, pode prosseguir

4. Preencher cadastro completo (identificação, experiência, etc.)
5. Fazer upload de imagem
6. Clicar "Enviar cadastro"

**Esperado:**
- [ ] Upload de imagem processado (~1-2s)
- [ ] Vê protocolo único (LISA-2026-0001)
- [ ] Dados no Supabase (tabela `experiencia`)
- [ ] Imagem no Supabase Storage

**Checkpoint:**
- [ ] Triagem funciona
- [ ] Cadastro salva no banco
- [ ] Imagem salva no storage
- [ ] Protocolo gerado

---

## 6️⃣ Verificar Dados no Supabase

Acessar: https://app.supabase.com/

### Tabelas
```sql
-- Pesquisadores
SELECT * FROM pesquisador_expert;

-- Experiências
SELECT * FROM experiencia;

-- Submissões
SELECT * FROM submissao_formulario;
```

**Checkpoint:**
- [ ] Pesquisador cadastrado
- [ ] Experiência criada
- [ ] Submissão registrada com protocolo

### Storage
- Ir para "Storage" → "anexos-experiencias"
- Deve ver pasta com ID da experiência
- Dentro, ver imagens (capa, secundaria1, etc.)

**Checkpoint:**
- [ ] Imagens uploadadas
- [ ] URLs públicas acessíveis

### Logs das Functions
```bash
supabase functions logs pesquisador --follow
supabase functions logs submit-cadastro --follow
```

**Checkpoint:**
- [ ] Sem erros nos logs
- [ ] Vê `console.log` das funções

---

## 7️⃣ Monitoramento Contínuo

### Verificar Saúde

```bash
# A cada dia
supabase functions list  # Todas ativas?

# Ver uso do plano Free
# https://app.supabase.com/project/seu-projeto/settings/billing
# - Requests/mês: deve estar bem abaixo de 1M
```

**Checkpoint:**
- [ ] Functions all "active"
- [ ] Uso dentro dos limites Free

### Troubleshooting Rápido

Se algo quebrou:

```bash
# Ver erros recentes
supabase functions logs pesquisador --tail

# Redeploy de uma função
supabase functions deploy submit-cadastro

# Checar conectividade Supabase
curl https://seu-projeto-id.supabase.co/rest/v1/experiencia \
  -H "apikey: <seu-anon-key>"
```

---

## ✅ Checklist Final

### Build & Deploy
- [ ] `npm run build` com sucesso
- [ ] `.next/out/` criado
- [ ] 3 Edge Functions deployadas (pesquisador, triagem, submit-cadastro)
- [ ] Arquivo uploaded para FTP

### Acesso & Funcionalidade
- [ ] Site carrega (https://seu-dominio.com.br)
- [ ] Cadastro de pesquisador funciona
- [ ] Triagem calcula resultado
- [ ] Cadastro de experiência salva
- [ ] Upload de imagem funciona
- [ ] Protocolo gerado e exibido

### Dados & Segurança
- [ ] Dados aparecem no Supabase
- [ ] Imagens no Storage público
- [ ] Edge Functions não expõem SERVICE_ROLE_KEY
- [ ] RLS policies em vigor

### Produção
- [ ] Monitorado logs de functions
- [ ] Plano Free Supabase dentro de limites
- [ ] Backups do banco automáticos (Supabase)
- [ ] Política de erro/observabilidade em lugar

---

## 🎉 Sucesso!

Se todo o checklist foi marcado: **Parabéns! Seu site está em produção!**

Próximos passos:
1. Monitorar diariamente por 1 semana
2. Coletar feedback de usuários
3. Fazer pequenos ajustes conforme necessário
4. Documentar lições aprendidas

**Contato em caso de dúvida:** supabase.com/docs/guides/functions

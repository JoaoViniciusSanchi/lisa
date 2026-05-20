# Deploy Estático + Edge Functions

Este documento descreve como fazer deploy da aplicação Portal LISA para hospedagem estática (FTP) com lógica serverless no Supabase.

## Arquitetura

```
┌─────────────────────────────┐
│  FTP (Locaweb)              │
│  - HTML/CSS/JS estático     │
│  - Next.js exported files   │
└────────────┬────────────────┘
             │
             ├─→ https://seu-site.com.br
             │
             └─→ Chama Supabase Edge Functions
                 para validação, upload, etc.

┌─────────────────────────────┐
│  Supabase (Edge Functions)  │
│  - /pesquisador             │
│  - /triagem                 │
│  - /submit-cadastro         │
│  - Banco de dados           │
│  - Storage (anexos)         │
└─────────────────────────────┘
```

## 1. Deploy das Edge Functions

### Pré-requisitos
- CLI do Supabase: `npm install -g supabase@latest`
- Credenciais Supabase configuradas

### Deploy

```bash
# Na pasta do projeto
cd portal-lisa-app

# Deploy das edge functions
supabase functions deploy pesquisador
supabase functions deploy triagem
supabase functions deploy submit-cadastro

# Verificar status
supabase functions list
```

### URLs das Edge Functions

Após deploy, as funções ficarão em:
- `https://<project-id>.supabase.co/functions/v1/pesquisador`
- `https://<project-id>.supabase.co/functions/v1/triagem`
- `https://<project-id>.supabase.co/functions/v1/submit-cadastro`

Essas URLs são automaticamente detectadas pelo helper `lib/supabase/edge-functions.ts`.

## 2. Build Estático

```bash
npm run build
```

Isso gera os arquivos estáticos em `.next/out/`:
- HTML pré-renderizado
- CSS/JS otimizado
- Assets

## 3. Deploy no FTP (Locaweb)

### Opção A: Via FTP Manual
1. Conectar ao FTP da Locaweb
2. Navegar para a pasta pública (geralmente `public_html` ou `www`)
3. Fazer upload do conteúdo de `.next/out/`:
   ```
   .next/out/*  →  public_html/
   ```
4. Testar acesso

### Opção B: Via Script

Criar um script `deploy.sh` na raiz do projeto:

```bash
#!/bin/bash
npm run build
# Copiar para FTP usando lftp, rsync ou sftp
sftp usuario@seu-ftp.com.br << EOF
cd public_html
mput .next/out/*
quit
EOF
```

## 4. Variáveis de Ambiente

### No Cliente (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key
```

Essas são públicas e necessárias para o cliente chamar as Edge Functions.

### No Supabase (Edge Functions)
As Edge Functions têm acesso automático a:
- `SUPABASE_URL` (ambiente)
- `SUPABASE_SERVICE_ROLE_KEY` (ambiente)

Nenhuma configuração extra é necessária.

## 5. Testando Localmente

### Rodando o build estático localmente

```bash
npm run build
npx serve .next/out
```

Acesse `http://localhost:3000` e teste:
- Formulário de pesquisador
- Cadastro de experiência
- Triagem

## 6. Troubleshooting

### Edge Functions retornam erro 404
- Verificar se as funções foram deployadas: `supabase functions list`
- Verificar CORS nas funções (devem permitir `*`)
- Testar URL diretamente: `curl https://xxxx.supabase.co/functions/v1/pesquisador`

### Upload de imagens falha
- Verificar se o bucket `anexos-experiencias` existe no Supabase Storage
- Verificar permissões do bucket (devem ser públicas para leitura)
- Verificar se `SUPABASE_SERVICE_ROLE_KEY` está configurada

### Formulário não envia
- Abrir DevTools (F12) → Network/Console
- Verificar erro de fetch
- Confirmar que CORS headers estão sendo retornados

## 7. Monitoramento

### Logs das Edge Functions

```bash
supabase functions logs pesquisador --follow
```

### Monitoramento do Banco

No dashboard do Supabase:
- Statistics → Requests (por function)
- Logs → Edge Functions

## 8. Atualizar a Aplicação

Quando fazer mudanças:

1. **Apenas código estático (componentes, UI)**
   ```bash
   npm run build
   # Fazer upload de `.next/out/*` para FTP
   ```

2. **Lógica da Edge Function**
   ```bash
   supabase functions deploy <function-name>
   # Nenhum build estático necessário
   ```

3. **Schema do banco**
   ```bash
   supabase db push
   ```

## 9. Segurança

- Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha!)
- RLS policies no banco garantem isolamento de dados
- Validação server-side em todas as operações
- CORS restrito ao seu domínio (opcional, para produção):
  ```typescript
  'Access-Control-Allow-Origin': 'https://seu-dominio.com.br'
  ```

## 10. Performance

Static export + Edge Functions é **muito rápido**:
- HTML/CSS/JS carregados diretamente do FTP (CDN local)
- Edge Functions executam em ~100ms
- Zero latência de server rendering

Não há necessidade de cache extra — o FTP e Supabase já otimizam.

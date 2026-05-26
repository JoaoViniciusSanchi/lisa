-- =============================================================
-- Migration: Sistema de e-mails transacionais + validação de tradução
-- Criada em: 2026-05-26
-- =============================================================

-- 1. Novo valor no enum email_tipo para o fluxo de validação bilíngue
ALTER TYPE email_tipo ADD VALUE IF NOT EXISTS 'validacao_traducao';

-- 2. Novos valores em convite_resposta para o fluxo de validação de tradução
ALTER TYPE convite_resposta ADD VALUE IF NOT EXISTS 'aprovou_traducao';
ALTER TYPE convite_resposta ADD VALUE IF NOT EXISTS 'solicitou_edicao_traducao';

-- 3. Tipo discriminante para convites (atualização de dados vs. validação de tradução)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'convite_tipo') THEN
    CREATE TYPE convite_tipo AS ENUM ('atualizacao_dados', 'validacao_traducao');
  END IF;
END $$;

-- 4. Coluna tipo na tabela convite_atualizacao
ALTER TABLE convite_atualizacao
  ADD COLUMN IF NOT EXISTS tipo convite_tipo NOT NULL DEFAULT 'atualizacao_dados';

-- 5. Inserir linhas de configuração de templates de e-mail
--    usar_padrao=true → sistema usa defaults do código (lib/email/defaults.ts)
--    Admin pode personalizar via painel → usar_padrao=false com assunto/corpo_md

INSERT INTO configuracao_sistema (chave, valor, descricao, categoria) VALUES
  (
    'template_email_confirmacao_submissao',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'E-mail enviado ao coordenador após submissão do formulário de cadastro',
    'templates_email'
  ),
  (
    'template_email_notificacao_admin',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'E-mail enviado aos admins quando uma nova experiência é submetida',
    'templates_email'
  ),
  (
    'template_email_aprovacao',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'E-mail enviado ao coordenador quando a experiência é aprovada para o catálogo',
    'templates_email'
  ),
  (
    'template_email_rejeicao',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'E-mail enviado ao coordenador quando a experiência é rejeitada',
    'templates_email'
  ),
  (
    'template_email_solicitacao_atualizacao',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'E-mail enviado ao coordenador solicitando atualização de experiência importada',
    'templates_email'
  ),
  (
    'template_email_lembrete_atualizacao',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'Lembrete enviado ao coordenador que ainda não respondeu à solicitação de atualização',
    'templates_email'
  ),
  (
    'template_email_notificacao_inativacao',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'E-mail enviado ao coordenador quando a experiência é inativada por falta de resposta',
    'templates_email'
  ),
  (
    'template_email_validacao_traducao',
    '{"usar_padrao": true, "assunto": null, "corpo_md": null}'::jsonb,
    'E-mail enviado ao coordenador para validar a tradução automática PT→EN',
    'templates_email'
  )
ON CONFLICT (chave) DO NOTHING;

-- 6. Configuração: validade padrão dos convites (em dias)
INSERT INTO configuracao_sistema (chave, valor, descricao, categoria) VALUES
  (
    'convite_atualizacao_dias_validade',
    '30'::jsonb,
    'Número de dias de validade do link mágico enviado aos coordenadores',
    'edital'
  )
ON CONFLICT (chave) DO NOTHING;

-- =============================================================
-- MIGRAÇÃO 0012: E-mails transacionais + validação de tradução
-- Frente A do plano de e-mails (peaceful-gizmo)
-- =============================================================

-- 1. Novo valor no enum email_tipo (validação de tradução bilíngue)
ALTER TYPE email_tipo ADD VALUE IF NOT EXISTS 'validacao_traducao';

-- 2. Novos valores em convite_resposta para o fluxo de tradução
ALTER TYPE convite_resposta ADD VALUE IF NOT EXISTS 'aprovou_traducao';
ALTER TYPE convite_resposta ADD VALUE IF NOT EXISTS 'solicitou_edicao_traducao';

-- 3. Novo enum para tipo de convite
DO $$ BEGIN
  CREATE TYPE convite_tipo AS ENUM ('atualizacao_dados', 'validacao_traducao');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Adicionar coluna tipo em convite_atualizacao
ALTER TABLE convite_atualizacao
  ADD COLUMN IF NOT EXISTS tipo convite_tipo NOT NULL DEFAULT 'atualizacao_dados';

-- 5. Inserir registros de template em configuracao_sistema
-- (usar_padrao=true → sistema usa defaults em código; null nos campos de customização)
INSERT INTO configuracao_sistema (chave, valor, categoria, descricao, editavel_pelo_painel)
VALUES
  ('template_email_confirmacao_submissao', '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'E-mail enviado ao coordenador após submissão do formulário', true),
  ('template_email_notificacao_admin',     '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'E-mail enviado à equipe LISA quando nova experiência é submetida', true),
  ('template_email_aprovacao',            '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'E-mail enviado ao coordenador quando experiência é aprovada', true),
  ('template_email_rejeicao',             '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'E-mail enviado ao coordenador quando experiência é rejeitada', true),
  ('template_email_solicitacao_atualizacao', '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'E-mail com link mágico para coordenador atualizar dados', true),
  ('template_email_lembrete_atualizacao', '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'Lembrete de atualização (segunda notificação)', true),
  ('template_email_notificacao_inativacao', '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'Notificação de inativação por ausência de resposta', true),
  ('template_email_validacao_traducao',   '{"usar_padrao": true, "assunto": null, "corpo_md": null}', 'templates_email', 'E-mail com botões para aprovar ou editar tradução EN', true),
  -- Configuração de validade dos convites (em dias)
  ('convite_atualizacao_dias_validade', '30', 'geral', 'Validade em dias dos links mágicos de atualização', true)
ON CONFLICT (chave) DO NOTHING;

-- 6. Índices úteis para consultas de e-mail no painel
CREATE INDEX IF NOT EXISTS idx_disparo_email_tipo_status ON disparo_email(tipo, status);
CREATE INDEX IF NOT EXISTS idx_disparo_email_criado ON disparo_email(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_convite_token ON convite_atualizacao(token);
CREATE INDEX IF NOT EXISTS idx_convite_tipo ON convite_atualizacao(tipo);

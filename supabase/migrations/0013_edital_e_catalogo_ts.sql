-- =============================================================
-- Migration 0013: edital dinâmico + campo catalogo_ts
-- Adiciona catalogo_ts e edital_origem à tabela experiencia,
-- move edital_atual_ativo para a categoria 'edital' e
-- insere os novos registros de configuração (deadline e data_fim).
-- =============================================================

-- 1. Novos campos na tabela experiencia
ALTER TABLE experiencia
  ADD COLUMN IF NOT EXISTS catalogo_ts boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edital_origem varchar(100);

CREATE INDEX IF NOT EXISTS idx_experiencia_catalogo_ts ON experiencia(catalogo_ts);

COMMENT ON COLUMN experiencia.catalogo_ts IS
  'true = compõe o Catálogo de Tecnologias Sociais (cadastrada durante um edital ativo); false = apenas catálogo interno LISA';
COMMENT ON COLUMN experiencia.edital_origem IS
  'Nome do edital durante o qual a experiência foi cadastrada (ex: "Chamamento 2026")';

-- 2. Mover edital_atual_ativo da categoria feature_flag para edital
--    (para que apareça agrupado com os outros campos do edital no painel admin)
UPDATE configuracao_sistema
SET categoria = 'edital'
WHERE chave = 'edital_atual_ativo';

-- 3. Novos registros de configuração para o edital
INSERT INTO configuracao_sistema (chave, valor, descricao, categoria, editavel_pelo_painel) VALUES
  ('edital_atual_deadline',
   '"Submissões abertas até 30 de junho"'::jsonb,
   'Texto do prazo do edital exibido na homepage (ex: "Submissões abertas até 30 de junho")',
   'edital',
   true),
  ('edital_data_fim',
   '"2026-06-30"'::jsonb,
   'Data de encerramento do edital no formato ISO 8601 (ex: 2026-06-30)',
   'edital',
   true)
ON CONFLICT (chave) DO NOTHING;

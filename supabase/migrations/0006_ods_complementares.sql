-- =============================================================
-- 0006_ods_complementares.sql
-- Adiciona coluna nome_en à tabela ods e insere os 3 ODS
-- complementares do Portal LISA (18, 19, 20) além dos 17 oficiais.
-- Migração aditiva — não remove nem altera linhas existentes.
-- =============================================================

-- Adiciona coluna nome_en (nullable) para suporte ao catálogo bilíngue
ALTER TABLE ods ADD COLUMN IF NOT EXISTS nome_en varchar(200);

COMMENT ON COLUMN ods.nome_en IS
  'Nome do ODS em inglês. Preenchido para os 3 ODS complementares LISA; '
  'pode ser preenchido futuramente para os 17 ODS oficiais da ONU.';

-- ODS 18: Igualdade Étnico-Racial
INSERT INTO ods (id, nome, nome_en, descricao, cor_hex) VALUES
(
  18,
  'Igualdade Étnico-Racial',
  'Ethnic-Racial Equality',
  'Combate ao racismo estrutural e promoção da equidade racial, reduzindo desigualdades em educação, saúde e emprego.',
  '#7B2D8B'
)
ON CONFLICT (id) DO NOTHING;

-- ODS 19: Arte, Cultura e Comunicação
INSERT INTO ods (id, nome, nome_en, descricao, cor_hex) VALUES
(
  19,
  'Arte, Cultura e Comunicação',
  'Art, Culture and Communication',
  'Democratização da arte, liberdade cultural, comunicação inclusiva e fortalecimento de identidades coletivas.',
  '#C2185B'
)
ON CONFLICT (id) DO NOTHING;

-- ODS 20: Direitos dos Povos Originários e Comunidades Tradicionais
INSERT INTO ods (id, nome, nome_en, descricao, cor_hex) VALUES
(
  20,
  'Direitos dos Povos Originários e Comunidades Tradicionais',
  'Rights of Indigenous Peoples and Traditional Communities',
  'Proteção dos direitos, territórios, saberes e culturas de povos indígenas e comunidades tradicionais.',
  '#2E7D32'
)
ON CONFLICT (id) DO NOTHING;

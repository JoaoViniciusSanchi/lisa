-- =============================================================
-- 0005_experiencia_macroarea.sql
-- Tabela de relacionamento N:N entre experiencia e macroarea_ts.
-- Regra de negócio: 1 principal obrigatória + até 2 secundárias.
-- Migração aditiva — não afeta dados existentes.
-- =============================================================

CREATE TABLE experiencia_macroarea (
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  macroarea_id   uuid NOT NULL REFERENCES macroarea_ts(id),
  is_principal   boolean NOT NULL DEFAULT false,
  criado_em      timestamp DEFAULT now(),
  PRIMARY KEY (experiencia_id, macroarea_id)
);

COMMENT ON TABLE experiencia_macroarea IS
  'Relacionamento N:N entre experiencias e macroareas temáticas. '
  'Regra: exatamente 1 linha com is_principal=true por experiência; '
  'máximo de 2 linhas adicionais com is_principal=false (secundárias).';

COMMENT ON COLUMN experiencia_macroarea.is_principal IS
  'true para a macroarea principal (obrigatória); false para secundárias (até 2).';

CREATE INDEX idx_experiencia_macroarea_exp
  ON experiencia_macroarea(experiencia_id);

CREATE INDEX idx_experiencia_macroarea_mac
  ON experiencia_macroarea(macroarea_id);

-- RLS
ALTER TABLE experiencia_macroarea ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de experiencia_macroarea"
  ON experiencia_macroarea FOR SELECT USING (true);

CREATE POLICY "Escrita apenas via service role"
  ON experiencia_macroarea FOR ALL USING (auth.role() = 'service_role');

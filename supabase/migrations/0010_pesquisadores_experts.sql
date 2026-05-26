-- =============================================================
-- Migration 0010: tabelas de pesquisadores/experts
-- Suporte ao matchmaking futuro no /conectar:
-- experts recebem e-mail automático por área quando não há
-- solução cadastrada para uma demanda.
-- =============================================================

CREATE TABLE pesquisador_expert (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          varchar(200) NOT NULL,
  email         varchar(200) NOT NULL UNIQUE,
  instituicao   varchar(200),
  lattes        varchar(500),
  orcid         varchar(100),
  ativo         boolean NOT NULL DEFAULT true,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE pesquisador_expert IS
  'Pesquisadores e experts disponíveis para receber demandas via matchmaking no /conectar';

CREATE INDEX idx_expert_ativo ON pesquisador_expert(ativo);

-- N:N com áreas temáticas FORPROEX (já existentes — PK uuid)
CREATE TABLE expert_forproex (
  expert_id                 uuid NOT NULL REFERENCES pesquisador_expert(id) ON DELETE CASCADE,
  area_tematica_forproex_id uuid NOT NULL REFERENCES area_tematica_forproex(id),
  PRIMARY KEY (expert_id, area_tematica_forproex_id)
);

-- N:N com grandes áreas CNPq (já existentes — PK uuid)
CREATE TABLE expert_cnpq (
  expert_id           uuid NOT NULL REFERENCES pesquisador_expert(id) ON DELETE CASCADE,
  grande_area_cnpq_id uuid NOT NULL REFERENCES grande_area_cnpq(id),
  PRIMARY KEY (expert_id, grande_area_cnpq_id)
);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION set_expert_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_expert_atualizado_em
  BEFORE UPDATE ON pesquisador_expert
  FOR EACH ROW EXECUTE FUNCTION set_expert_atualizado_em();

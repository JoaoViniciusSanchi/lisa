-- =============================================================
-- Migration 0011: substituir ORCID por departamento
-- Remove campo orcid e adiciona campo departamento na tabela
-- pesquisador_expert
-- =============================================================

ALTER TABLE pesquisador_expert
  DROP COLUMN orcid;

ALTER TABLE pesquisador_expert
  ADD COLUMN departamento varchar(200);

COMMENT ON COLUMN pesquisador_expert.departamento IS
  'Departamento ou unidade do pesquisador/expert (ex: Engenharia de Softwarem Ciência de Dados)';

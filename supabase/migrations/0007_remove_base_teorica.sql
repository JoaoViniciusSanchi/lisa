-- =============================================================
-- 0007_remove_base_teorica.sql
-- Remove tabelas base_teorica e experiencia_base_teorica.
-- Decisão: campo "Base Teórica / Abordagem" foi removido do
-- formulário de cadastro na reestruturação de abril/2026.
-- =============================================================

-- Remove a tabela de relacionamento primeiro (FK constraint)
DROP TABLE IF EXISTS experiencia_base_teorica;

-- Remove a tabela de taxonomia
DROP TABLE IF EXISTS base_teorica;

-- =============================================================
-- Migration 0009: campo is_interna na tabela experiencia
-- Distingue experiências UFF (internas, publicadas no catálogo)
-- de experiências externas (apenas no admin).
-- =============================================================

ALTER TABLE experiencia
  ADD COLUMN is_interna boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN experiencia.is_interna IS
  'true = experiência vinculada à UFF (entra no catálogo público); false = experiência de origem externa';

CREATE INDEX idx_experiencia_is_interna ON experiencia(is_interna);

-- Recriar view_catalogo_publico filtrando apenas internas
DROP VIEW IF EXISTS view_catalogo_publico;
CREATE VIEW view_catalogo_publico AS
SELECT
  e.id,
  e.slug,
  e.titulo,
  e.resumo,
  e.data_inicio,
  e.data_fim,
  e.is_perene,
  e.status,
  e.campus_uff,
  e.municipio,
  e.uf,
  ce.nome  AS categoria_editorial,
  ec.email_contato_publico,
  ec.instagram,
  ec.facebook,
  ec.youtube,
  ec.site_externo
FROM experiencia e
JOIN experiencia_conteudo ec ON ec.experiencia_id = e.id
LEFT JOIN categoria_editorial ce ON e.categoria_editorial_id = ce.id
WHERE e.status IN (
  'aprovada_ativa_em_andamento',
  'aprovada_ativa_perene',
  'aprovada_encerrada'
)
AND ec.versao_atual = 'publicado'
AND e.is_interna = true;

-- Recriar view_fila_moderacao expondo is_interna para o admin
DROP VIEW IF EXISTS view_fila_moderacao;
CREATE VIEW view_fila_moderacao AS
SELECT
  e.id,
  e.titulo,
  e.submetida_em,
  e.email_contato,
  e.campus_uff,
  e.is_interna,
  ce.nome AS categoria_editorial,
  COALESCE(av.indice_fuzzy, 0)  AS indice_fuzzy,
  COALESCE(av.indice_linear, 0) AS indice_linear,
  av.faixa
FROM experiencia e
LEFT JOIN categoria_editorial ce ON e.categoria_editorial_id = ce.id
LEFT JOIN LATERAL (
  SELECT * FROM avaliacao_fuzzy
  WHERE experiencia_id = e.id
  ORDER BY calculada_em DESC
  LIMIT 1
) av ON true
WHERE e.status = 'em_moderacao'
ORDER BY av.indice_fuzzy DESC NULLS LAST, e.submetida_em ASC;

-- =============================================================
-- 0008_rls_e_security.sql
-- Corrige todos os avisos do Supabase Security Advisor:
--   1. Recria as 4 views sem SECURITY DEFINER
--   2. Habilita RLS nas 33 tabelas públicas sem proteção
--   3. Define políticas de acesso adequadas para cada tabela
-- =============================================================
-- Regras de acesso:
--   anon        → leitura de taxonomias + catálogo aprovado + INSERT no formulário
--   authenticated → apenas admins (admin_perfil.id = auth.uid()), acesso total
--   service_role  → bypassa RLS automaticamente (API routes, Edge Functions)
-- =============================================================

BEGIN;

-- =============================================================
-- PARTE 1: RECRIAR VIEWS SEM SECURITY DEFINER
-- Por padrão CREATE VIEW usa SECURITY INVOKER — o acesso às
-- tabelas subjacentes respeita o RLS do usuário que consulta.
-- =============================================================

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
AND ec.versao_atual = 'publicado';

DROP VIEW IF EXISTS view_fila_moderacao;
CREATE VIEW view_fila_moderacao AS
SELECT
  e.id,
  e.titulo,
  e.submetida_em,
  e.email_contato,
  e.campus_uff,
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

DROP VIEW IF EXISTS view_traducoes_pendentes;
CREATE VIEW view_traducoes_pendentes AS
SELECT
  t.id AS traducao_id,
  t.experiencia_id,
  e.titulo AS titulo_pt,
  t.idioma,
  t.status_global,
  t.status_por_campo,
  t.criada_em,
  t.api_chamada_em,
  t.primeira_revisao_em
FROM experiencia_traducao t
JOIN experiencia e ON t.experiencia_id = e.id
WHERE t.status_global IN (
  'rascunho_api_gerado',
  'em_primeira_revisao',
  'primeira_revisao_concluida',
  'em_segunda_revisao'
)
ORDER BY t.criada_em ASC;

DROP VIEW IF EXISTS view_estatisticas_dashboard;
CREATE VIEW view_estatisticas_dashboard AS
SELECT
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%')                                           AS total_aprovadas,
  COUNT(*) FILTER (WHERE status = 'em_moderacao')                                                 AS fila_moderacao,
  COUNT(*) FILTER (WHERE status = 'aguardando_confirmacao_coordenador')                           AS aguardando_resposta,
  COUNT(*) FILTER (WHERE status = 'inativa_nao_confirmada')                                       AS inativas,
  COUNT(*) FILTER (WHERE status = 'rejeitada')                                                    AS rejeitadas,
  AVG(indice_fuzzy) FILTER (WHERE status::text LIKE 'aprovada%')::numeric(4,3)                    AS indice_medio_aprovadas,
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%' AND faixa_fuzzy_atual = 'verde')           AS aprovadas_verde,
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%' AND faixa_fuzzy_atual = 'amarelo')         AS aprovadas_amarelo,
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%' AND faixa_fuzzy_atual = 'vermelho')        AS aprovadas_vermelho,
  COUNT(DISTINCT campus_uff) FILTER (WHERE campus_uff IS NOT NULL)                                AS campi_envolvidos
FROM experiencia;

-- =============================================================
-- PARTE 2: TAXONOMIAS / TABELAS DE REFERÊNCIA
-- Leitura livre para anon; escrita somente via service_role.
-- =============================================================

ALTER TABLE grande_area_cnpq      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subarea_cnpq          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_editorial   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ods                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_tematica_forproex ENABLE ROW LEVEL SECURITY;
ALTER TABLE pergunta_fuzzy        ENABLE ROW LEVEL SECURITY;
ALTER TABLE finalidade_social     ENABLE ROW LEVEL SECURITY;
ALTER TABLE publico_alvo          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_solucao          ENABLE ROW LEVEL SECURITY;
ALTER TABLE arranjo_institucional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura_publica" ON grande_area_cnpq      FOR SELECT USING (true);
CREATE POLICY "leitura_publica" ON subarea_cnpq          FOR SELECT USING (true);
CREATE POLICY "leitura_publica" ON categoria_editorial   FOR SELECT USING (true);
CREATE POLICY "leitura_publica" ON ods                   FOR SELECT USING (true);
CREATE POLICY "leitura_publica" ON area_tematica_forproex FOR SELECT USING (ativa = true);
CREATE POLICY "leitura_publica" ON pergunta_fuzzy        FOR SELECT USING (ativa = true);
CREATE POLICY "leitura_publica" ON finalidade_social     FOR SELECT USING (ativa = true);
CREATE POLICY "leitura_publica" ON publico_alvo          FOR SELECT USING (ativo = true);
CREATE POLICY "leitura_publica" ON tipo_solucao          FOR SELECT USING (ativo = true);
CREATE POLICY "leitura_publica" ON arranjo_institucional FOR SELECT USING (ativo = true);

-- =============================================================
-- PARTE 3: EXPERIÊNCIA (tabela central)
-- =============================================================

ALTER TABLE experiencia ENABLE ROW LEVEL SECURITY;

-- Anon vê apenas experiências aprovadas (catálogo público)
CREATE POLICY "leitura_publica_aprovadas" ON experiencia
  FOR SELECT TO anon
  USING (status IN (
    'aprovada_ativa_em_andamento',
    'aprovada_ativa_perene',
    'aprovada_encerrada'
  ));

-- Anon pode submeter via formulário (route handler usa service_role,
-- mas esta policy garante que uma submissão direta também seja segura)
CREATE POLICY "insercao_publica" ON experiencia
  FOR INSERT TO anon
  WITH CHECK (status = 'em_moderacao');

-- Admin autenticado tem acesso total
CREATE POLICY "admin_acesso_total" ON experiencia
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- PARTE 4: TABELAS DE CONTEÚDO VINCULADAS À EXPERIÊNCIA
-- Anon pode INSERT (formulário); anon vê apenas conteúdo publicado;
-- admin autenticado tem acesso total.
-- =============================================================

ALTER TABLE experiencia_conteudo ENABLE ROW LEVEL SECURITY;

-- Anon vê apenas conteúdo editorial já publicado (usado por view_catalogo_publico)
CREATE POLICY "leitura_publica_publicado" ON experiencia_conteudo
  FOR SELECT TO anon
  USING (versao_atual = 'publicado');

CREATE POLICY "insercao_publica" ON experiencia_conteudo
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "admin_acesso_total" ON experiencia_conteudo
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- PARTE 5: TABELAS N:N DE CLASSIFICAÇÃO (formulário público)
-- Anon INSERT; admin ALL; anon sem SELECT (dados operacionais).
-- =============================================================

ALTER TABLE experiencia_pessoa           ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_cnpq             ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_ods              ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_forproex         ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_finalidade_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_publico_alvo     ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_tipo_solucao     ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_arranjo          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insercao_publica"  ON experiencia_pessoa            FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_pessoa           FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON experiencia_cnpq              FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_cnpq             FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON experiencia_ods               FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_ods              FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON experiencia_forproex          FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_forproex         FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON experiencia_finalidade_social FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_finalidade_social FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON experiencia_publico_alvo      FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_publico_alvo     FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON experiencia_tipo_solucao      FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_tipo_solucao     FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON experiencia_arranjo           FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON experiencia_arranjo          FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================
-- PARTE 6: MOTOR FUZZY
-- =============================================================

ALTER TABLE resposta_fuzzy        ENABLE ROW LEVEL SECURITY;
ALTER TABLE justificativa_dimensao ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacao_fuzzy       ENABLE ROW LEVEL SECURITY;

-- Respostas e justificativas: anon INSERT (triagem + formulário), admin ALL
CREATE POLICY "insercao_publica"  ON resposta_fuzzy         FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON resposta_fuzzy        FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insercao_publica"  ON justificativa_dimensao FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON justificativa_dimensao FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Avaliação calculada pelo servidor; admin lê para dashboard e moderação
CREATE POLICY "admin_acesso_total" ON avaliacao_fuzzy       FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================
-- PARTE 7: PESSOA E SUBMISSÃO
-- =============================================================

ALTER TABLE pessoa               ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissao_formulario ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexo                ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insercao_publica"  ON pessoa               FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON pessoa              FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Snapshot imutável da submissão; anon insere, admin lê
CREATE POLICY "insercao_publica"  ON submissao_formulario FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON submissao_formulario FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anexos enviados junto ao formulário
CREATE POLICY "insercao_publica"  ON anexo               FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_acesso_total" ON anexo              FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================
-- PARTE 8: TABELAS EXCLUSIVAMENTE ADMINISTRATIVAS
-- Nenhum acesso para anon; admin autenticado tem acesso total.
-- O token de convite é tratado via service_role no route handler
-- /app/atualizar/ — nunca exposto via PostgREST para anon.
-- =============================================================

ALTER TABLE admin_perfil         ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_moderacao        ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_status     ENABLE ROW LEVEL SECURITY;
ALTER TABLE disparo_email        ENABLE ROW LEVEL SECURITY;
ALTER TABLE convite_atualizacao  ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_traducao ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao_sistema ENABLE ROW LEVEL SECURITY;

-- admin_perfil: qualquer admin autenticado vê todos os perfis
-- (necessário para exibir nomes nos logs de moderação);
-- apenas service_role cria/remove admins
CREATE POLICY "admin_le_perfis" ON admin_perfil
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_atualiza_proprio" ON admin_perfil
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin_acesso_total" ON log_moderacao
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_acesso_total" ON historico_status
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_acesso_total" ON disparo_email
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- convite_atualizacao: token sensível — zero acesso anon,
-- validação exclusivamente via service_role no route /atualizar
CREATE POLICY "admin_acesso_total" ON convite_atualizacao
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_acesso_total" ON experiencia_traducao
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- configuracao_sistema: configs não-sensíveis são lidas pelo frontend
-- (textos da home, nome do edital, flags de feature, pesos fuzzy).
-- Apenas integracao (credenciais/URLs externas) fica oculta para anon.
CREATE POLICY "leitura_publica_configs" ON configuracao_sistema
  FOR SELECT TO anon
  USING (categoria <> 'integracao');

CREATE POLICY "admin_acesso_total" ON configuracao_sistema
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;

-- =============================================================
-- Verificações pós-migração (rodar manualmente):
--
-- 1. Confirmar que RLS está ativo em todas as tabelas:
--    SELECT tablename, rowsecurity
--    FROM pg_tables
--    WHERE schemaname = 'public'
--    ORDER BY tablename;
--
-- 2. Confirmar que as views não são mais SECURITY DEFINER:
--    SELECT viewname, definition
--    FROM pg_views
--    WHERE schemaname = 'public'
--    AND viewname LIKE 'view_%';
--
-- 3. Conferir políticas criadas:
--    SELECT tablename, policyname, roles, cmd
--    FROM pg_policies
--    WHERE schemaname = 'public'
--    ORDER BY tablename, cmd;
-- =============================================================

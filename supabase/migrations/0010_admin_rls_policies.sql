-- Políticas RLS para o painel admin (Passo 1)
-- Permite que usuários com admin_perfil ativo acessem as tabelas do painel

-- ─────────────────────────────────────────────────────────────────────────
-- HELPER: Política reutilizável para admin autenticado
-- ─────────────────────────────────────────────────────────────────────────
-- SELECT: usuário é admin ativo
-- INSERT/UPDATE/DELETE: idem (será usado seletivamente)

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia" ON experiencia
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_update_experiencia" ON experiencia
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia_conteudo
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia_conteudo" ON experiencia_conteudo
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia_pessoa
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia_pessoa" ON experiencia_pessoa
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia_cnpq
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia_cnpq" ON experiencia_cnpq
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia_forproex
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia_forproex" ON experiencia_forproex
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia_ods
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia_ods" ON experiencia_ods
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia_finalidade_social
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia_finalidade" ON experiencia_finalidade_social
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: experiencia_traducao
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_experiencia_traducao" ON experiencia_traducao
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_update_experiencia_traducao" ON experiencia_traducao
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: categoria_editorial
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_categoria_editorial" ON categoria_editorial
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: finalidade_social
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_finalidade_social" ON finalidade_social
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: grande_area_cnpq
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_grande_area_cnpq" ON grande_area_cnpq
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: subarea_cnpq
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_subarea_cnpq" ON subarea_cnpq
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: area_tematica_forproex
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_area_forproex" ON area_tematica_forproex
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: ods
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_ods" ON ods
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: pesquisador_expert (CRUD)
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_pesquisador_expert" ON pesquisador_expert
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_insert_pesquisador_expert" ON pesquisador_expert
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_update_pesquisador_expert" ON pesquisador_expert
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_delete_pesquisador_expert" ON pesquisador_expert
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: expert_forproex (CRUD)
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_expert_forproex" ON expert_forproex
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_insert_expert_forproex" ON expert_forproex
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_delete_expert_forproex" ON expert_forproex
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: expert_cnpq (CRUD)
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_expert_cnpq" ON expert_cnpq
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_insert_expert_cnpq" ON expert_cnpq
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_delete_expert_cnpq" ON expert_cnpq
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: avaliacao_fuzzy
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_avaliacao_fuzzy" ON avaliacao_fuzzy
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: resposta_fuzzy
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_resposta_fuzzy" ON resposta_fuzzy
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: pergunta_fuzzy
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_pergunta_fuzzy" ON pergunta_fuzzy
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: anexo
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_anexo" ON anexo
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: log_moderacao
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_log_moderacao" ON log_moderacao
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: configuracao_sistema
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_configuracao_sistema" ON configuracao_sistema
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

CREATE POLICY "admin_can_update_configuracao_sistema" ON configuracao_sistema
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Tabela: admin_perfil
-- ─────────────────────────────────────────────────────────────────────────
CREATE POLICY "admin_can_select_admin_perfil" ON admin_perfil
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_perfil WHERE id = auth.uid() AND ativo = true)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- VIEWS (precisam de SECURITY DEFINER ou de policies nas tabelas base)
-- Note: As policies acima nas tabelas base já cobrem as views
-- ─────────────────────────────────────────────────────────────────────────
-- view_estatisticas_dashboard — sem policy necessária (coberta por policies nas tabelas base)
-- view_traducoes_pendentes — sem policy necessária (coberta por policies nas tabelas base)

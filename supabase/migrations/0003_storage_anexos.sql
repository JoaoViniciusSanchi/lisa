-- =============================================================
-- PORTAL LISA — MIGRATION 0003
-- Bucket público de anexos de experiências (Supabase Storage)
-- =============================================================
-- Pré-requisito: lisa_setup.sql já executado.
-- Para rodar: SQL Editor do Supabase → cole este arquivo → Run.
-- =============================================================
-- Cria o bucket `anexos-experiencias` (público, leitura via URL direta).
-- Escrita/exclusão são feitas exclusivamente pelo service-role da
-- aplicação (que bypassa RLS) — não há policy de write para anon/auth.
-- =============================================================

-- Bucket público com limite de 5 MB e tipos permitidos.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos-experiencias',
  'anexos-experiencias',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy de leitura pública (defesa em profundidade — bucket já é público,
-- mas alguns projetos exigem policy explícita).
DROP POLICY IF EXISTS "anexos_experiencias_public_read" ON storage.objects;
CREATE POLICY "anexos_experiencias_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'anexos-experiencias');

-- Validação: confere que o bucket foi criado.
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM storage.buckets WHERE id = 'anexos-experiencias';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Bucket anexos-experiencias não foi criado';
  END IF;
END $$;

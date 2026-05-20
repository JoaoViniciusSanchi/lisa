-- Criar usuário admin no Portal LISA
-- Execute este script uma única vez no SQL Editor do Supabase.
--
-- IMPORTANTE: Após rodar, delete ou não versione este arquivo,
-- pois contém credenciais em texto plano.

DO $$
DECLARE
  novo_id UUID := gen_random_uuid();
BEGIN
  -- 1. Criar usuário no Supabase Auth
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    novo_id,
    'authenticated',
    'authenticated',
    'tecnologiasocial.uff@gmail.com',
    crypt('Tecsocial1234', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '', '', '', ''
  );

  -- 2. Criar identidade (necessário para login e-mail/senha funcionar)
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    novo_id,
    'tecnologiasocial.uff@gmail.com',
    novo_id,
    jsonb_build_object('sub', novo_id::text, 'email', 'tecnologiasocial.uff@gmail.com'),
    'email',
    now(),
    now(),
    now()
  );

  -- 3. Criar perfil de admin (mesmo UUID do auth.users)
  INSERT INTO admin_perfil (id, nome_completo, email_institucional, nivel_acesso, ativo)
  VALUES (novo_id, 'Tecnologia Social UFF/AGIR', 'tecnologiasocial.uff@gmail.com', 'super_admin', true);

  RAISE NOTICE 'Usuário admin criado com ID: %', novo_id;
END $$;

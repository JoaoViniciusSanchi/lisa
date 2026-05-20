import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service role client — bypassa RLS. Usado em Server Actions para
 * operações que precisam de privilégio total (insert público de
 * cadastro, leitura de configurações, etc).
 *
 * NUNCA exposto ao client. Não persiste sessão.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias'
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

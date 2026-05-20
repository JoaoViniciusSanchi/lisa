import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser client — usa anon key. OK para reads públicos.
 * Para upload de arquivos no Storage também serve.
 */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client de sessão para Server Components do admin.
 * Lê o JWT do cookie definido pelo createBrowserClient no login.
 * Não pode definir cookies (Server Component).
 */
export async function createAdminSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server Components não podem definir cookies — sessão gerenciada pelo browser client
        }
      }
    }
  );
}

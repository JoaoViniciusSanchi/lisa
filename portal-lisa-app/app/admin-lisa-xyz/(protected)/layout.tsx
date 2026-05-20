'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase/client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [filaCount, setFilaCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = createBrowserSupabase();

    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/admin-lisa-xyz/login');
        return;
      }

      setEmail(session.user.email ?? '');

      sb.from('experiencia')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_moderacao')
        .then(({ count }) => {
          setFilaCount(count ?? 0);
          setReady(true);
        });
    });
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen bg-bg-base" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar filaCount={filaCount} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar adminEmail={email} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { createBrowserSupabase } from '@/lib/supabase/client';

interface Props {
  adminEmail: string;
}

export default function AdminTopbar({ adminEmail }: Props) {
  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    window.location.href = '/admin-lisa-xyz/login';
  }

  return (
    <header className="h-14 flex items-center justify-between px-8 bg-bg-elevated border-b border-line flex-shrink-0">
      <div className="text-[12px] text-warm-white/40 uppercase tracking-widest">
        Painel de Administração
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[11px] text-warm-white/30">{adminEmail}</span>
        <button
          onClick={handleLogout}
          className="text-[11px] uppercase tracking-widest text-warm-white/40 hover:text-warm-white/70 transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}

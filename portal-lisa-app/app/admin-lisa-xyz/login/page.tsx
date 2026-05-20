'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createBrowserSupabase();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Credenciais inválidas. Verifique e-mail e senha.');
      setLoading(false);
      return;
    }
    // Hard redirect — força o servidor a reler os cookies de sessão
    window.location.href = '/admin-lisa-xyz';
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-[400px] border border-line-strong bg-bg-elevated p-12">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10">
          <div className="logo-mark flex-shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-1">
              Painel Admin
            </div>
            <div className="font-display text-[18px] font-bold tracking-tight">LISA</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-eyebrow opacity-60">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-bg-base border border-line-strong text-warm-white px-4 py-3 text-sm outline-none focus:border-accent transition-colors w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-eyebrow opacity-60">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-bg-base border border-line-strong text-warm-white px-4 py-3 text-sm outline-none focus:border-accent transition-colors w-full"
            />
          </div>

          {error && (
            <div className="text-[13px] text-danger px-4 py-3 bg-danger/10 border border-danger/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-bg-base font-bold text-[13px] uppercase tracking-widest py-4 mt-2 hover:bg-accent-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

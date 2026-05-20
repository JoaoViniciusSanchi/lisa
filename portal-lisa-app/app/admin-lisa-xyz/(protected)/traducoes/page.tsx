'use client';

import { useEffect, useState } from 'react';
import { getTraducoesPendentes } from '@/lib/admin/queries';
import TraducoesClient from '@/components/admin/TraducoesClient';

export default function TraducoesPage() {
  const [traducoes, setTraducoes] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTraducoesPendentes().then((data) => {
      setTraducoes(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse text-warm-white/30 p-8">Carregando...</div>;
  }

  return (
    <div className="max-w-[900px]">
      <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">[ 03 ]</div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Traduções</h1>
        <span className="text-[12px] text-warm-white/40 font-mono">
          {traducoes.length} pendente{traducoes.length !== 1 ? 's' : ''}
        </span>
      </div>
      <TraducoesClient traducoes={traducoes as Parameters<typeof TraducoesClient>[0]['traducoes']} />
    </div>
  );
}

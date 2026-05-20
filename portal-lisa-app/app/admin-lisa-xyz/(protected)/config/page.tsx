'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { getConfigAll } from '@/lib/admin/queries';
import ConfigClient from '@/components/admin/ConfigClient';

export default function ConfigPage() {
  const [configs, setConfigs] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConfigAll().then((data) => {
      setConfigs(data);
      setLoading(false);
    });
  }, []);

  async function handleExportCsv() {
    const sb = createBrowserSupabase();
    const { data } = await sb
      .from('resposta_fuzzy')
      .select('*')
      .order('criado_em', { ascending: false });
    if (!data?.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(r =>
      Object.values(r).map(v =>
        typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v ?? ''
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respostas-fuzzy-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="animate-pulse text-warm-white/30 p-8">Carregando...</div>;
  }

  return (
    <div className="max-w-[900px]">
      <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">[ 04 ]</div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Configurações</h1>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest border border-line-strong px-4 py-2 text-warm-white/60 hover:border-accent hover:text-accent transition-colors cursor-pointer"
        >
          <span>↓</span>
          Exportar CSV (respostas fuzzy)
        </button>
      </div>
      <ConfigClient configs={configs as Parameters<typeof ConfigClient>[0]['configs']} />
    </div>
  );
}

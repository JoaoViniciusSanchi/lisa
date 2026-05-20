'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import ExperienciasClient from '@/components/admin/ExperienciasClient';

export default function ExperienciasExternasPage() {
  const [experiencias, setExperiencias] = useState<unknown[]>([]);
  const [odsList, setOdsList] = useState<{ id: number; nome: string; cor_hex: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createBrowserSupabase();

    Promise.all([
      sb.from('experiencia')
        .select(`
          id, titulo, campus_uff, status, aprovada_em, is_interna,
          indice_fuzzy, faixa_fuzzy_atual,
          experiencia_ods(ods_id, is_principal, ods(id, nome, cor_hex))
        `)
        .eq('is_interna', false)
        .in('status', ['aprovada_ativa_em_andamento', 'aprovada_ativa_perene', 'aprovada_encerrada'])
        .order('aprovada_em', { ascending: false }),
      sb.from('ods')
        .select('id, nome, cor_hex')
        .order('id'),
    ]).then(([{ data: exp }, { data: ods }]) => {
      setExperiencias((exp ?? []) as unknown[]);
      setOdsList((ods ?? []) as { id: number; nome: string; cor_hex: string | null }[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse text-warm-white/30 p-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-1">Acervo</div>
        <h1 className="font-display font-bold text-[22px]">Experiências Externas</h1>
        <p className="text-[13px] text-warm-white/50 mt-1">
          Não exibidas no catálogo público. Experiências de instituições externas à UFF.
        </p>
      </div>
      <ExperienciasClient
        experiencias={experiencias}
        odsList={odsList}
        isInterna={false}
      />
    </div>
  );
}

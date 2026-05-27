'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import ExperienciasTableClient from '@/components/admin/ExperienciasTableClient';

type Experiencia = any;

export default function ExperienciasInternasPage() {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createBrowserSupabase();

    Promise.all([
      sb.from('experiencia')
        .select(`
          id, titulo, campus_uff, status, aprovada_em, data_inicio,
          catalogo_ts, edital_origem,
          experiencia_pessoa(
            papel,
            pessoa(nome_completo, departamento, vinculo)
          ),
          experiencia_cnpq(
            subarea_id,
            subarea:subarea_cnpq(
              id,
              nome,
              grande_area_id,
              grande_area:grande_area_cnpq(id, nome)
            )
          )
        `)
        .eq('is_interna', true)
        .in('status', ['aprovada_ativa_em_andamento', 'aprovada_ativa_perene', 'aprovada_encerrada'])
        .order('aprovada_em', { ascending: false }),
      sb.from('ods')
        .select('id, nome, cor_hex')
        .order('id'),
    ]).then(([{ data: exp }, { data: ods }]) => {
      setExperiencias((exp ?? []) as Experiencia[]);
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
        <h1 className="font-display font-bold text-[22px]">Experiências Internas — UFF</h1>
        <p className="text-[13px] text-warm-white/50 mt-1">
          Exibidas no catálogo público. Somente experiências vinculadas à Universidade Federal Fluminense.
        </p>
      </div>
      <ExperienciasTableClient experiencias={experiencias} />
    </div>
  );
}

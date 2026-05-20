'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFilaModeracaoFull, getFilaFilterOptions } from '@/lib/admin/queries';
import type { FilaFilters } from '@/lib/admin/queries';
import FilaClient from '@/components/admin/FilaClient';

export default function FilaPage() {
  const searchParams = useSearchParams();
  const [experiencias, setExperiencias] = useState<any>([]);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filters: FilaFilters = {
      status: searchParams.get('status') ?? undefined,
      faixa: (searchParams.get('faixa') as FilaFilters['faixa']) ?? undefined,
      campus: searchParams.get('campus') ?? undefined,
      finalidade_id: searchParams.get('finalidade_id') ?? undefined,
      grande_area_id: searchParams.get('grande_area_id') ?? undefined,
      forproex_id: searchParams.get('forproex_id') ?? undefined,
      orderBy: (searchParams.get('orderBy') as FilaFilters['orderBy']) ?? 'fuzzy_desc'
    };

    Promise.all([
      getFilaModeracaoFull(filters),
      getFilaFilterOptions()
    ]).then(([exp, opts]) => {
      setExperiencias(exp);
      setFilterOptions(opts);
      setLoading(false);
    });
  }, [searchParams]);

  if (loading) {
    return <div className="animate-pulse text-warm-white/30 p-8">Carregando...</div>;
  }

  return (
    <div className="max-w-[1400px]">
      <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">[ 02 ]</div>
      <h1 className="font-display text-2xl font-bold mb-6">Fila de Moderação</h1>
      <FilaClient
        experiencias={experiencias}
        filterOptions={filterOptions}
        total={experiencias.length}
      />
    </div>
  );
}

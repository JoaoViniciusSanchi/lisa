'use client';

import { useState, useTransition } from 'react';
import { FilaCard } from './FilaCard';
import { FilaFilters } from './FilaFilters';
import { ExperienciaDrawer } from './ExperienciaDrawer';
import { getExperienciaDetailsAction } from '@/lib/admin/actions';

interface FilterOptions {
  campi: string[];
  finalidades: { id: string; nome: string }[];
  grandesAreas: { id: string; nome: string }[];
  forproex: { id: string; nome: string; codigo: string }[];
}

interface Props {
  experiencias: unknown[];
  filterOptions: FilterOptions;
  total: number;
}

export default function FilaClient({ experiencias, filterOptions, total }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof getExperienciaDetailsAction>> | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen(id: string) {
    setOpenId(id);
    startTransition(async () => {
      const d = await getExperienciaDetailsAction(id);
      setDetails(d);
    });
  }

  function handleClose() {
    setOpenId(null);
    setDetails(null);
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-9rem)] overflow-hidden border border-line">
      {/* Sidebar de filtros */}
      <FilaFilters
        campi={filterOptions.campi}
        finalidades={filterOptions.finalidades}
        grandesAreas={filterOptions.grandesAreas}
        forproex={filterOptions.forproex}
      />

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {/* Header da lista */}
        <div className="sticky top-0 bg-bg-base border-b border-line px-6 py-3 flex items-center justify-between z-10">
          <span className="text-[12px] text-warm-white/40">
            {total} {total === 1 ? 'experiência' : 'experiências'}
          </span>
        </div>

        {experiencias.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-warm-white/30">
            <div className="text-4xl mb-3">◉</div>
            <div className="text-[14px]">Nenhuma experiência encontrada</div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {(experiencias as Parameters<typeof FilaCard>[0]['data'][]).map((exp) => (
              <FilaCard
                key={(exp as { id: string }).id}
                data={exp}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer de revisão */}
      {openId && (
        <ExperienciaDrawer
          details={isPending ? null : details}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

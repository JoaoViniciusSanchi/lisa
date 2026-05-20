'use client';

import { useState, useTransition } from 'react';
import { TraducaoItem } from './TraducaoItem';
import { TraducaoDrawer } from './TraducaoDrawer';
import { getTraducaoDetalheAction } from '@/lib/admin/actions';

interface TraducaoRow {
  traducao_id: string;
  titulo_pt: string;
  idioma: string;
  status_global: string;
  status_por_campo: Record<string, string> | null;
  criada_em: string;
  api_chamada_em: string | null;
}

const STATUS_ORDER = [
  'rascunho_api_gerado',
  'em_primeira_revisao',
  'primeira_revisao_concluida',
  'em_segunda_revisao'
];

const STATUS_SECTION_LABELS: Record<string, string> = {
  rascunho_api_gerado: 'Aguardando 1ª revisão',
  em_primeira_revisao: 'Em 1ª revisão',
  primeira_revisao_concluida: '1ª revisão concluída',
  em_segunda_revisao: 'Em 2ª revisão'
};

export default function TraducoesClient({ traducoes }: { traducoes: TraducaoRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof getTraducaoDetalheAction>> | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen(id: string) {
    setOpenId(id);
    startTransition(async () => {
      const d = await getTraducaoDetalheAction(id);
      setDetails(d);
    });
  }

  // Agrupar por status
  const groups: Record<string, TraducaoRow[]> = {};
  for (const t of traducoes) {
    if (!groups[t.status_global]) groups[t.status_global] = [];
    groups[t.status_global].push(t);
  }

  return (
    <>
      {traducoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-warm-white/30">
          <div className="text-4xl mb-3">◎</div>
          <div className="text-[14px]">Nenhuma tradução pendente</div>
        </div>
      ) : (
        STATUS_ORDER.filter((s) => groups[s]?.length > 0).map((status) => (
          <div key={status} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40">
                {STATUS_SECTION_LABELS[status]}
              </div>
              <span className="text-[11px] font-mono text-accent">({groups[status].length})</span>
            </div>
            <div className="space-y-2">
              {groups[status].map((item) => (
                <TraducaoItem key={item.traducao_id} item={item} onOpen={handleOpen} />
              ))}
            </div>
          </div>
        ))
      )}

      {openId && (
        <TraducaoDrawer
          data={isPending ? null : (details as Parameters<typeof TraducaoDrawer>[0]['data'])}
          onClose={() => { setOpenId(null); setDetails(null); }}
        />
      )}
    </>
  );
}

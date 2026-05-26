'use client';

import { useState, useTransition } from 'react';
import { TraducaoItem } from './TraducaoItem';
import { TraducaoDrawer } from './TraducaoDrawer';
import { getTraducaoDetalheAction } from '@/lib/admin/actions';
import { enviarValidacaoTraducao } from '@/lib/admin/email-actions';

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
  const [validacaoStatus, setValidacaoStatus] = useState<Record<string, string>>({});

  function handleOpen(id: string) {
    setOpenId(id);
    startTransition(async () => {
      const d = await getTraducaoDetalheAction(id);
      setDetails(d);
    });
  }

  function handleEnviarValidacao(item: TraducaoRow) {
    // Precisamos do experiencia_id — está no drawer; buscamos da action de detalhe
    startTransition(async () => {
      try {
        const det = await getTraducaoDetalheAction(item.traducao_id);
        if (!det?.experiencia?.id) {
          setValidacaoStatus((prev) => ({ ...prev, [item.traducao_id]: '✗ Experiência não encontrada' }));
          return;
        }
        await enviarValidacaoTraducao(det.experiencia.id as string);
        setValidacaoStatus((prev) => ({ ...prev, [item.traducao_id]: '✓ E-mail enviado!' }));
        setTimeout(() => {
          setValidacaoStatus((prev) => {
            const next = { ...prev };
            delete next[item.traducao_id];
            return next;
          });
        }, 5000);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'erro';
        setValidacaoStatus((prev) => ({ ...prev, [item.traducao_id]: `✗ ${msg}` }));
      }
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
                <div key={item.traducao_id} className="relative">
                  <TraducaoItem item={item} onOpen={handleOpen} />
                  {/* Botão de enviar validação — visível apenas para rascunho_api_gerado */}
                  {item.status_global === 'rascunho_api_gerado' && (
                    <div className="absolute top-2 right-2">
                      {validacaoStatus[item.traducao_id] ? (
                        <span className={`text-[11px] ${validacaoStatus[item.traducao_id].startsWith('✓') ? 'text-green-400' : 'text-danger'}`}>
                          {validacaoStatus[item.traducao_id]}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnviarValidacao(item)}
                          disabled={isPending}
                          className="text-[11px] bg-accent/10 border border-accent/30 text-accent px-3 py-1 hover:bg-accent/20 transition-colors disabled:opacity-40"
                        >
                          📧 Enviar validação
                        </button>
                      )}
                    </div>
                  )}
                </div>
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

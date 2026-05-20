'use client';

import { useState, useTransition } from 'react';
import { updateTraducaoStatus, saveTraducaoContent, triggerDeepLTranslation } from '@/lib/admin/actions';

type Campos = 'historico' | 'metodologia' | 'resultados_impactos' | 'desafios_perspectivas';

const CAMPOS: Campos[] = ['historico', 'metodologia', 'resultados_impactos', 'desafios_perspectivas'];
const CAMPO_LABELS: Record<Campos, string> = {
  historico: 'Histórico',
  metodologia: 'Metodologia',
  resultados_impactos: 'Resultados e Impactos',
  desafios_perspectivas: 'Desafios e Perspectivas'
};

const NEXT_STATUS: Record<string, string> = {
  rascunho_api_gerado: 'em_primeira_revisao',
  em_primeira_revisao: 'primeira_revisao_concluida',
  primeira_revisao_concluida: 'em_segunda_revisao',
  em_segunda_revisao: 'publicavel',
  publicavel: 'publicada'
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  rascunho_api_gerado: 'Iniciar 1ª revisão',
  em_primeira_revisao: 'Concluir 1ª revisão',
  primeira_revisao_concluida: 'Iniciar 2ª revisão',
  em_segunda_revisao: 'Concluir 2ª revisão',
  publicavel: 'Publicar tradução'
};

interface TraducaoData {
  id: string;
  idioma: string;
  titulo: string;
  historico: string | null;
  metodologia: string | null;
  resultados_impactos: string | null;
  desafios_perspectivas: string | null;
  status_global: string;
  experiencia_id: string;
  experiencia?: {
    titulo: string;
    experiencia_traducao: {
      idioma: string;
      historico: string | null;
      metodologia: string | null;
      resultados_impactos: string | null;
      desafios_perspectivas: string | null;
    }[];
  } | null;
}

interface Props {
  data: TraducaoData | null;
  onClose: () => void;
}

export function TraducaoDrawer({ data, onClose }: Props) {
  const [editing, setEditing] = useState<Partial<Record<Campos, string>>>({});
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState('');

  if (!data) return null;

  // A partir daqui data é não-nulo — capturar em const para as closures
  const d = data;

  // Texto original PT
  const ptTrad = d.experiencia?.experiencia_traducao?.find((t) => t.idioma === 'pt');

  function getEditedOrOriginal(campo: Campos): string {
    return editing[campo] ?? d[campo] ?? '';
  }

  function handleSave() {
    startTransition(async () => {
      const changedFields: Partial<Record<Campos, string>> = {};
      for (const campo of CAMPOS) {
        if (editing[campo] !== undefined) {
          changedFields[campo] = editing[campo];
        }
      }
      if (Object.keys(changedFields).length === 0) {
        setFeedback('Nenhuma alteração para salvar.');
        return;
      }
      const result = await saveTraducaoContent(d.id, changedFields);
      if (result.ok) {
        setFeedback('Salvo com sucesso.');
        setEditing({});
      }
    });
  }

  function handleAdvanceStatus() {
    const next = NEXT_STATUS[d.status_global];
    if (!next) return;
    startTransition(async () => {
      const result = await updateTraducaoStatus(d.id, next);
      if (result.ok) {
        setFeedback(`Status atualizado para: ${next}`);
        setTimeout(() => onClose(), 1000);
      }
    });
  }

  function handleTriggerDeepL() {
    startTransition(async () => {
      const result = await triggerDeepLTranslation(d.experiencia_id);
      if (result.ok) setFeedback('Tradução DeepL enfileirada.');
    });
  }

  const nextStatusLabel = NEXT_STATUS_LABEL[d.status_global];

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[900px] max-w-[95vw] bg-bg-base border-l border-line z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-line flex-shrink-0">
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-1">
              Revisão de Tradução · {d.idioma.toUpperCase()}
            </div>
            <h2 className="font-display font-bold text-[15px] leading-tight">
              {d.experiencia?.titulo ?? d.titulo}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {feedback ? (
              <span className="text-[12px] text-accent">{feedback}</span>
            ) : (
              <>
                <button
                  onClick={handleTriggerDeepL}
                  disabled={isPending}
                  className="text-[11px] uppercase tracking-widest border border-line-strong text-warm-white/50 px-3 py-2 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  Disparar DeepL
                </button>
                {nextStatusLabel && (
                  <button
                    onClick={handleAdvanceStatus}
                    disabled={isPending}
                    className="text-[11px] uppercase tracking-widest bg-accent text-bg-base px-3 py-2 hover:bg-accent-glow transition-colors disabled:opacity-50"
                  >
                    {nextStatusLabel}
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="text-warm-white/40 hover:text-warm-white text-2xl w-8 h-8 flex items-center justify-center border border-line-strong"
            >
              ×
            </button>
          </div>
        </div>

        {/* Campos lado a lado */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {CAMPOS.map((campo) => (
            <div key={campo}>
              <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 mb-3">
                {CAMPO_LABELS[campo]}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* PT original */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-warm-white/30 mb-2">PT (original)</div>
                  <div className="bg-bg-elevated border border-line p-4 text-[13px] text-warm-white/70 leading-relaxed min-h-[120px] max-h-60 overflow-y-auto">
                    {ptTrad?.[campo] || <span className="text-warm-white/20">—</span>}
                  </div>
                </div>
                {/* EN editável */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-warm-white/30 mb-2">
                    {d.idioma.toUpperCase()} (rascunho)
                  </div>
                  <textarea
                    value={getEditedOrOriginal(campo)}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...prev, [campo]: e.target.value }))
                    }
                    rows={6}
                    className="w-full bg-bg-elevated border border-line-strong text-warm-white/90 text-[13px] leading-relaxed p-4 outline-none focus:border-accent resize-y transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-line px-8 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-[12px] uppercase tracking-widest border border-line-strong px-6 py-2.5 text-warm-white/50 hover:border-line-brighter transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || Object.keys(editing).length === 0}
            className="text-[12px] uppercase tracking-widest bg-accent text-bg-base px-6 py-2.5 font-semibold hover:bg-accent-glow transition-colors disabled:opacity-40"
          >
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </>
  );
}

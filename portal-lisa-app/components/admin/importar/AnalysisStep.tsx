'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  CsvRow,
  DocxMatch,
  FieldMapping,
  ExperienciaImport
} from '@/lib/import/types';

interface AnalysisError {
  index: number;
  title: string;
  message: string;
}

interface AnalysisItemStatus {
  index: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  title: string;
  retryAttempt?: number;
  retryModel?: string;
  nextRetryIn?: number;
  error?: string;
}

interface Props {
  csvRows: CsvRow[];
  docxMatches: DocxMatch[];
  mapping: FieldMapping;
  progress: { current: number; total: number; currentTitle: string };
  onComplete: (experiences: ExperienciaImport[], errors?: AnalysisError[]) => void;
  onProgress: (p: { current: number; total: number; currentTitle: string }) => void;
  onBack: () => void;
}

export default function AnalysisStep({
  csvRows,
  docxMatches,
  mapping,
  progress,
  onComplete,
  onProgress,
  onBack
}: Props) {
  const started = useRef(false);
  const results = useRef<ExperienciaImport[]>([]);
  const errorsRef = useRef<AnalysisError[]>([]);
  const [errors, setErrors] = useState<AnalysisError[]>([]);
  const [itemStatuses, setItemStatuses] = useState<Map<number, AnalysisItemStatus>>(new Map());

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis() {
    results.current = [];
    const total = csvRows.length;

    // Mapa csvRowIndex → DocxMatch para lookup rápido
    const docxByRow = new Map<number, DocxMatch>();
    for (const m of docxMatches) {
      docxByRow.set(m.csvRowIndex, m);
    }

    // Detecta coluna de título para mostrar no progresso
    const titleCol =
      Object.entries(mapping).find(([, v]) => v === 'titulo')?.[0] ??
      Object.keys(csvRows[0] ?? {})[0] ??
      '';

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      const currentTitle = row[titleCol] ?? `Linha ${i + 1}`;

      // Marca como processando
      setItemStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(i, {
          index: i + 1,
          status: 'processing',
          title: currentTitle
        });
        return newMap;
      });

      onProgress({ current: i, total, currentTitle });

      const match = docxByRow.get(i);

      // Sub-passo: extrai .docx (se houver)
      let docxExtracted = undefined;
      let docxSource = undefined;

      if (match) {
        try {
          const { parseDocx } = await import('@/lib/import/docx-parser');
          const buffer = await match.file.arrayBuffer();
          docxExtracted = await parseDocx(buffer);
          docxSource = match.file.name;
        } catch {
          // falha silenciosa — segue sem o .docx
        }
      }

      // Sub-passo: análise com IA
      try {
        const { analyzeExperience } = await import('@/lib/import/claude-prompt');
        const data = await analyzeExperience({
          csvRow: row,
          csvRowIndex: i,
          mapping,
          docxExtracted,
          docxSource
        });
        results.current.push(data);

        // Marca como sucesso
        setItemStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(i, {
            index: i + 1,
            status: 'success',
            title: currentTitle
          });
          return newMap;
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Exceção inesperada';
        console.error(`[analysis] exceção na linha ${i + 1}:`, msg);
        const err = { index: i + 1, title: currentTitle, message: msg };
        errorsRef.current.push(err);
        setErrors((prev) => [...prev, err]);

        // Marca como erro
        setItemStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(i, {
            index: i + 1,
            status: 'error',
            title: currentTitle,
            error: msg
          });
          return newMap;
        });
      }
    }

    onProgress({ current: total, total, currentTitle: 'Concluído' });
    onComplete(results.current, errorsRef.current);
  }

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const done = progress.current >= progress.total && progress.total > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <div>
        <h2 className="text-lg font-semibold text-warm-white mb-1">Passo 4 — Análise com IA</h2>
        <p className="text-[13px] text-warm-white/50">
          Gemini analisa cada projeto, gera as classificações EFITS e resume textos longos.
        </p>
      </div>

      {/* Barra de progresso principal */}
      <div className="space-y-3">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[13px] text-warm-white/60">
          {done ? (
            <span className="text-green-400">Análise concluída ✓</span>
          ) : (
            <>
              <div>Analisando {progress.current + 1}/{progress.total}</div>
              <div className="text-warm-white/80 italic truncate text-[12px] mt-1 max-w-lg mx-auto">
                {progress.currentTitle}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Indicador de atividade com animação */}
      {!done && (
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
          <span className="text-[12px] text-warm-white/50">
            Aguarde — pode fazer até 5 tentativas por modelo em caso de falha
          </span>
        </div>
      )}

      {/* Lista de status detalhado (últimos 5-10 itens) */}
      {itemStatuses.size > 0 && (
        <div className="bg-white/5 rounded-lg p-4 text-left space-y-2 max-h-40 overflow-y-auto">
          {Array.from(itemStatuses.values())
            .slice(-5)
            .map((status) => (
              <div key={status.index} className="text-[11px] flex items-center gap-2">
                {status.status === 'success' && (
                  <>
                    <span className="text-green-400">✓</span>
                    <span className="text-warm-white/60">
                      <span className="text-warm-white/40">#{status.index}</span> {status.title}
                    </span>
                  </>
                )}
                {status.status === 'processing' && (
                  <>
                    <span className="text-accent animate-pulse">⚙</span>
                    <span className="text-warm-white/60">
                      <span className="text-warm-white/40">#{status.index}</span> {status.title}
                    </span>
                  </>
                )}
                {status.status === 'error' && (
                  <>
                    <span className="text-red-400">✗</span>
                    <span className="text-warm-white/60">
                      <span className="text-warm-white/40">#{status.index}</span> {status.title}
                    </span>
                  </>
                )}
              </div>
            ))}
        </div>
      )}

      {done && errors.length > 0 && (
        <div className="text-left rounded-md border border-red-500/30 bg-red-500/10 p-4 space-y-2">
          <p className="text-[12px] font-semibold text-red-400">
            {errors.length} item{errors.length !== 1 ? 's' : ''} falharam na análise:
          </p>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {errors.map((err) => (
              <li key={err.index} className="text-[11px] text-warm-white/60">
                <span className="text-warm-white/40">#{err.index}</span>{' '}
                <span className="text-warm-white/80 italic">{err.title}</span>
                {' — '}
                <span className="text-red-300/80">{err.message}</span>
              </li>
            ))}
          </ul>
          {errors.some((e) => e.message.toLowerCase().includes('quota') || e.message.includes('429')) && (
            <p className="text-[11px] text-yellow-400/80 pt-1">
              A cota gratuita do Gemini pode estar esgotada. O sistema tenta automaticamente o modelo de fallback. Se o erro persistir, aguarde alguns minutos e tente novamente.
            </p>
          )}
        </div>
      )}

      {done && results.current.length > 0 && (
        <button
          type="button"
          onClick={() => onComplete(results.current)}
          className="px-8 py-2.5 text-[13px] bg-accent text-bg-base font-semibold rounded hover:bg-accent/90 transition-colors"
        >
          Revisar {results.current.length} resultado{results.current.length !== 1 ? 's' : ''} →
        </button>
      )}

      {done && results.current.length === 0 && (
        <div className="space-y-3">
          <p className="text-[13px] text-red-400">
            Nenhuma experiência foi analisada com sucesso.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-[13px] text-warm-white/50 border border-line rounded hover:text-warm-white transition-colors"
          >
            ← Voltar ao mapeamento
          </button>
        </div>
      )}

      {!done && (
        <p className="text-[11px] text-warm-white/30">
          Não feche esta aba. Cada projeto leva alguns segundos para ser processado.
        </p>
      )}
    </div>
  );
}

import type { DimensionKey } from '@/lib/fuzzy/types';

interface DimensionBreakdownProps {
  medias: Record<DimensionKey, number>;
}

const LABELS: Record<DimensionKey, string> = {
  P: 'Participação',
  I: 'Impacto',
  A: 'Apropriação',
  S: 'Sustentabilidade',
  R: 'Replicabilidade'
};

/**
 * Painel horizontal com as 5 dimensões P/I/A/S/R, cada uma com
 * barra de preenchimento proporcional à média (0-10).
 */
export function DimensionBreakdown({ medias }: DimensionBreakdownProps) {
  return (
    <div className="grid grid-cols-5 gap-px bg-line mb-12">
      {(['P', 'I', 'A', 'S', 'R'] as DimensionKey[]).map((dim) => {
        const value = medias[dim] ?? 0;
        const pct = (value / 10) * 100;
        return (
          <div key={dim} className="p-6 bg-bg-elevated text-center">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-55 mb-3">
              {LABELS[dim]}
            </div>
            <div className="h-1 w-full bg-bg-base relative mb-3">
              <div
                className="absolute left-0 top-0 bottom-0 bg-accent transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="font-display text-xl font-light text-warm-white tabular-nums">
              {value.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

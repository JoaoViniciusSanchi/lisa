import type { DimensionKey } from '@/lib/fuzzy/types';

interface DimensionBreakdownTSProps {
  medias: Record<DimensionKey, number>;
}

const LABELS: Record<DimensionKey, string> = {
  P: 'Participação',
  I: 'Impacto',
  A: 'Apropriação',
  S: 'Sustentabilidade',
  R: 'Replicabilidade'
};

export function DimensionBreakdownTS({ medias }: DimensionBreakdownTSProps) {
  return (
    <div className="grid grid-cols-5 gap-px bg-white/10 mb-12 font-nunito">
      {(['P', 'I', 'A', 'S', 'R'] as DimensionKey[]).map((dim) => {
        const value = medias[dim] ?? 0;
        const pct = (value / 10) * 100;
        return (
          <div key={dim} className="p-6 bg-ts-mid text-center">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/65 mb-3">
              {LABELS[dim]}
            </div>
            <div className="h-1 w-full bg-ts-deep relative mb-3">
              <div
                className="absolute left-0 top-0 bottom-0 bg-ts-accent transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="font-nunito text-xl font-light text-white tabular-nums">
              {value.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

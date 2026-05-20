import { cn } from '@/lib/utils/cn';

type Faixa = 'verde' | 'amarelo' | 'vermelho' | null | undefined;

const FAIXA_CONFIG = {
  verde: { label: 'Verde', color: 'var(--fuzzy-green)', bg: 'rgba(63,189,180,0.12)' },
  amarelo: { label: 'Amarelo', color: 'var(--fuzzy-yellow)', bg: 'rgba(229,184,66,0.12)' },
  vermelho: { label: 'Vermelho', color: 'var(--fuzzy-red)', bg: 'rgba(229,85,66,0.12)' }
};

interface FuzzyBadgeProps {
  faixa: Faixa;
  indice?: number | null;
  showBar?: boolean;
  className?: string;
}

export function FuzzyBadge({ faixa, indice, showBar = false, className }: FuzzyBadgeProps) {
  const cfg = faixa ? FAIXA_CONFIG[faixa] : null;

  if (!cfg) return <span className="text-warm-white/30 text-[12px]">—</span>;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] uppercase tracking-[0.12em] font-semibold px-2 py-0.5"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
        {indice != null && (
          <span className="text-[13px] font-mono" style={{ color: cfg.color }}>
            {indice.toFixed(3)}
          </span>
        )}
      </div>
      {showBar && indice != null && (
        <div className="h-1 bg-line-strong w-full">
          <div
            className="h-full transition-all"
            style={{ width: `${Math.round(indice * 100)}%`, background: cfg.color }}
          />
        </div>
      )}
    </div>
  );
}

// Mini barra de dimensão (P, I, A, S, R)
interface DimBarProps {
  label: string;
  value: number | null;
  maxValue?: number;
}

export function DimBar({ label, value, maxValue = 10 }: DimBarProps) {
  const pct = value != null ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-warm-white/40 w-4">{label}</span>
      <div className="flex-1 h-1 bg-line-strong">
        <div
          className="h-full bg-accent/60 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono text-warm-white/50 w-6 text-right">
        {value?.toFixed(1) ?? '—'}
      </span>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <div className="bg-bg-elevated border border-line p-6 flex flex-col gap-2">
      <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40">{label}</div>
      <div
        className="text-4xl font-display font-bold tracking-tight"
        style={{ color: accent ? 'var(--accent)' : 'var(--warm-white)' }}
      >
        {value}
      </div>
      {sub && <div className="text-[12px] text-warm-white/40">{sub}</div>}
    </div>
  );
}

interface FaixaBarProps {
  verde: number;
  amarelo: number;
  vermelho: number;
  total: number;
}

export function FaixaBar({ verde, amarelo, vermelho, total }: FaixaBarProps) {
  if (total === 0) return null;
  const pctVerde = (verde / total) * 100;
  const pctAmarelo = (amarelo / total) * 100;
  const pctVermelho = (vermelho / total) * 100;

  return (
    <div className="bg-bg-elevated border border-line p-6 flex flex-col gap-4">
      <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40">
        Distribuição por faixa
      </div>
      <div className="flex h-3">
        {pctVerde > 0 && (
          <div className="h-full bg-fuzzy-green/70" style={{ width: `${pctVerde}%` }} title={`Verde: ${verde}`} />
        )}
        {pctAmarelo > 0 && (
          <div className="h-full bg-fuzzy-yellow/70" style={{ width: `${pctAmarelo}%` }} title={`Amarelo: ${amarelo}`} />
        )}
        {pctVermelho > 0 && (
          <div className="h-full bg-fuzzy-red/70" style={{ width: `${pctVermelho}%` }} title={`Vermelho: ${vermelho}`} />
        )}
      </div>
      <div className="flex gap-6 text-[12px]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-fuzzy-green inline-block" />
          <span className="text-warm-white/60">Verde</span>
          <span className="font-mono">{verde}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-fuzzy-yellow inline-block" />
          <span className="text-warm-white/60">Amarelo</span>
          <span className="font-mono">{amarelo}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-fuzzy-red inline-block" />
          <span className="text-warm-white/60">Vermelho</span>
          <span className="font-mono">{vermelho}</span>
        </span>
      </div>
    </div>
  );
}

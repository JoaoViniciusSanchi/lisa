import { GlassPanel } from '@/components/ui/GlassPanel';
import { Hairline } from '@/components/ui/Hairline';
import { ODS_COLORS } from '@/lib/data/ods-colors';
import type { CatalogHighlight } from '@/lib/mock/home-content';

interface CatalogCardProps {
  card: CatalogHighlight;
}

/**
 * Card individual de experiência no catálogo em destaque.
 * Inclui chips ODS coloridos, número de série, hover shimmer.
 */
export function CatalogCard({ card }: CatalogCardProps) {
  return (
    <GlassPanel
      as="article"
      className="catalog-card p-8 transition-all duration-[400ms] cursor-pointer hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-6">
        <span className="text-[11px] font-semibold tracking-section opacity-40 tabular-nums">
          {card.index}
        </span>
        <div className="flex gap-1">
          {card.odsCodes.map((code) => (
            <span
              key={code}
              className="w-6 h-6 inline-flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: ODS_COLORS[code] ?? '#888' }}
              title={`ODS ${code}`}
            >
              {code}
            </span>
          ))}
        </div>
      </div>

      <div className="font-display text-xs uppercase tracking-[0.18em] text-accent-glow mb-3">
        {card.category}
      </div>

      <h3 className="font-display text-2xl font-medium leading-tight mb-4">
        {card.title}
      </h3>

      <p className="text-sm opacity-65 leading-relaxed mb-6">
        {card.description}
      </p>

      <Hairline className="mb-4" />

      <div className="flex justify-between items-center text-xs">
        <span className="opacity-50">{card.faculty}</span>
        <span className="text-accent-glow font-semibold">{card.location}</span>
      </div>
    </GlassPanel>
  );
}

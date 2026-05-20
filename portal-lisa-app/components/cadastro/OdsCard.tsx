'use client';

import { cn } from '@/lib/utils/cn';
import { ODS_COLORS } from '@/lib/data/ods-colors';

interface OdsCardProps {
  id: number;
  name: string;
  selected: boolean;
  onClick: () => void;
  complementar?: boolean;
}

/**
 * Card de ODS — número grande + nome + barra lateral colorida.
 * ODS 18-20 são complementares LISA: exibem marca sutil (*).
 */
export function OdsCard({ id, name, selected, onClick, complementar }: OdsCardProps) {
  const color = ODS_COLORS[id] ?? '#888';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={complementar ? `ODS complementar LISA — ${name}` : name}
      className={cn(
        'p-4 border text-left cursor-pointer transition-all relative overflow-hidden block w-full',
        selected
          ? 'border-accent bg-gradient-to-br from-[rgba(46,163,155,0.12)] to-bg-card'
          : 'bg-bg-elevated border-line-strong hover:border-accent'
      )}
      style={{
        backgroundColor: selected ? undefined : 'var(--bg-elevated)'
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full transition-opacity"
        style={{
          background: color,
          opacity: selected ? 1 : 0.4
        }}
        aria-hidden="true"
      />
      <div
        className="font-display text-2xl font-light leading-none mb-2 flex items-start gap-0.5"
        style={{ color }}
      >
        {String(id).padStart(2, '0')}
        {complementar && (
          <span className="text-[10px] leading-none mt-0.5 opacity-60">*</span>
        )}
      </div>
      <div className="text-[11px] font-medium leading-snug opacity-85">
        {name}
      </div>
    </button>
  );
}

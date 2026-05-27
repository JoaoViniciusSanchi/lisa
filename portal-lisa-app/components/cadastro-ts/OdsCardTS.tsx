'use client';

import { cn } from '@/lib/utils/cn';
import { ODS_COLORS } from '@/lib/data/ods-colors';

interface OdsCardTSProps {
  id: number;
  name: string;
  selected: boolean;
  onClick: () => void;
  complementar?: boolean;
}

export function OdsCardTS({
  id,
  name,
  selected,
  onClick,
  complementar
}: OdsCardTSProps) {
  const color = ODS_COLORS[id] ?? '#888';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={complementar ? `ODS complementar LISA — ${name}` : name}
      className={cn(
        'p-4 border text-left cursor-pointer transition-all relative overflow-hidden block w-full font-nunito',
        selected
          ? 'border-ts-accent bg-gradient-to-br from-[rgba(12,113,195,0.18)] to-ts-mid'
          : 'bg-ts-mid border-white/15 hover:border-ts-accent'
      )}
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
        className="font-nunito text-2xl font-semibold leading-none mb-2 flex items-start gap-0.5"
        style={{ color }}
      >
        {String(id).padStart(2, '0')}
        {complementar && (
          <span className="text-[10px] leading-none mt-0.5 opacity-60">*</span>
        )}
      </div>
      <div className="text-[11px] font-medium leading-snug text-white/90">
        {name}
      </div>
    </button>
  );
}

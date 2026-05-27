'use client';

import { cn } from '@/lib/utils/cn';

interface CategoryCardTSProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function CategoryCardTS({
  title,
  description,
  selected,
  onClick
}: CategoryCardTSProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'p-6 border text-left cursor-pointer transition-all block w-full relative font-nunito',
        selected
          ? 'bg-gradient-to-br from-[rgba(12,113,195,0.18)] to-ts-mid border-ts-accent shadow-[inset_0_0_0_1px_#0C71C3]'
          : 'bg-ts-mid border-transparent hover:bg-ts-mid/80'
      )}
    >
      <div
        className={cn(
          'font-nunito text-xl font-semibold mb-2 transition-colors',
          selected ? 'text-ts-accent' : 'text-white'
        )}
      >
        {title}
      </div>
      {description && (
        <div className="text-xs leading-relaxed text-white/65">
          {description}
        </div>
      )}
    </button>
  );
}

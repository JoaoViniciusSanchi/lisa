'use client';

import { cn } from '@/lib/utils/cn';

interface CategoryCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Card grande com título + descrição (FORPROEX, Finalidade, Tipo Solução).
 * Multi-select toggle.
 */
export function CategoryCard({
  title,
  description,
  selected,
  onClick
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'p-6 border text-left cursor-pointer transition-all block w-full relative',
        selected
          ? 'bg-gradient-to-br from-[rgba(46,163,155,0.12)] to-bg-card border-accent shadow-[inset_0_0_0_1px_var(--accent)]'
          : 'bg-bg-elevated border-transparent hover:bg-bg-card'
      )}
    >
      <div
        className={cn(
          'font-display text-xl font-normal mb-2 transition-colors',
          selected ? 'text-accent-glow' : 'text-warm-white'
        )}
      >
        {title}
      </div>
      {description && (
        <div className="text-xs leading-relaxed opacity-60">{description}</div>
      )}
    </button>
  );
}

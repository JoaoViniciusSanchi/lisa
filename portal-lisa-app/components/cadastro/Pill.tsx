'use client';

import { cn } from '@/lib/utils/cn';

interface PillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Pill toggle multi-select. Selected: bg accent, color bg-base.
 */
export function Pill({ label, selected, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'px-6 py-3 border text-sm font-medium cursor-pointer transition-all select-none',
        selected
          ? 'bg-accent text-bg-base border-accent'
          : 'bg-bg-elevated text-warm-white border-line-strong hover:border-accent hover:text-accent-glow'
      )}
    >
      {label}
    </button>
  );
}

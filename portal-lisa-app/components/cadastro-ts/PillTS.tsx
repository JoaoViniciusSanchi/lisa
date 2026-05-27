'use client';

import { cn } from '@/lib/utils/cn';

interface PillTSProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function PillTS({ label, selected, onClick }: PillTSProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'px-6 py-3 border text-sm font-medium font-nunito cursor-pointer transition-all select-none',
        selected
          ? 'bg-ts-accent text-white border-ts-accent'
          : 'bg-ts-mid text-white border-white/15 hover:border-ts-accent hover:text-ts-accent'
      )}
    >
      {label}
    </button>
  );
}

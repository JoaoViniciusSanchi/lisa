import { cn } from '@/lib/utils/cn';

interface SectionNumProps {
  n: number | string;
  className?: string;
}

/**
 * Numeração editorial de seção — formato "[ 02 ]" em fonte tabular,
 * letter-spacing 0.15em e opacidade reduzida.
 */
export function SectionNum({ n, className }: SectionNumProps) {
  const formatted = typeof n === 'number' ? String(n).padStart(2, '0') : n;
  return (
    <span
      className={cn(
        'text-[11px] font-semibold tracking-section opacity-40 tabular-nums',
        className
      )}
    >
      [ {formatted} ]
    </span>
  );
}

import { cn } from '@/lib/utils/cn';

interface HairlineProps {
  orientation?: 'horizontal' | 'vertical';
  strong?: boolean;
  className?: string;
}

/**
 * Linha de 1px decorativa — referência DeGirum.
 * `strong` usa cor mais visível (var(--line-strong)).
 */
export function Hairline({
  orientation = 'horizontal',
  strong = false,
  className
}: HairlineProps) {
  const bg = strong ? 'bg-line-strong' : 'bg-line';
  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        bg,
        className
      )}
      aria-hidden="true"
    />
  );
}

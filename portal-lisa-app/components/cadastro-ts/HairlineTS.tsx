import { cn } from '@/lib/utils/cn';

interface HairlineTSProps {
  orientation?: 'horizontal' | 'vertical';
  strong?: boolean;
  className?: string;
}

export function HairlineTS({
  orientation = 'horizontal',
  strong = false,
  className
}: HairlineTSProps) {
  const bg = strong ? 'bg-white/20' : 'bg-white/10';
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

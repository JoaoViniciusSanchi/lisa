import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EyebrowTSProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

export function EyebrowTS({
  children,
  className,
  as: Tag = 'span'
}: EyebrowTSProps) {
  return (
    <Tag
      className={cn(
        'text-[11px] font-nunito font-bold uppercase tracking-eyebrow text-ts-accent',
        className
      )}
    >
      {children}
    </Tag>
  );
}

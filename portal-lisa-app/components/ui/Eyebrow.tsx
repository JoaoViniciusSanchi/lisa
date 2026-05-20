import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

/**
 * Eyebrow — label uppercase 11px com letter-spacing 0.18em e accent-glow.
 * Usado em títulos de seção, inputs, cards informativos.
 */
export function Eyebrow({ children, className, as: Tag = 'span' }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'text-[11px] font-bold uppercase tracking-eyebrow text-accent-glow',
        className
      )}
    >
      {children}
    </Tag>
  );
}

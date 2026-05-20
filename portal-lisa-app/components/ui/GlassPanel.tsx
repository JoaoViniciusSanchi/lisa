import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassPanelProps {
  children: ReactNode;
  variant?: 'default' | 'strong';
  as?: 'div' | 'section' | 'article' | 'aside';
  className?: string;
}

/**
 * Painel com glassmorphism — gradiente petrol + backdrop-filter.
 * Estilos detalhados em globals.css (.glass / .glass-strong).
 */
export function GlassPanel({
  children,
  variant = 'default',
  as: Tag = 'div',
  className
}: GlassPanelProps) {
  return (
    <Tag className={cn(variant === 'strong' ? 'glass-strong' : 'glass', className)}>
      {children}
    </Tag>
  );
}

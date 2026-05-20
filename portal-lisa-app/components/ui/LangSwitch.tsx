'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

interface LangSwitchProps {
  className?: string;
}

/**
 * Toggle PT / EN. Preserva a rota atual e troca apenas o locale.
 * Decisão de produto: tradução é opt-in, sem geo-detect.
 */
export function LangSwitch({ className }: LangSwitchProps) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]',
        className
      )}
    >
      <Link
        href={pathname}
        locale="pt"
        className={cn(
          'transition-opacity',
          locale === 'pt'
            ? 'text-accent-glow'
            : 'opacity-50 hover:opacity-100'
        )}
      >
        PT
      </Link>
      <span className="opacity-30" aria-hidden="true">
        /
      </span>
      <Link
        href={pathname}
        locale="en"
        className={cn(
          'transition-opacity',
          locale === 'en'
            ? 'text-accent-glow'
            : 'opacity-50 hover:opacity-100'
        )}
      >
        EN
      </Link>
    </div>
  );
}

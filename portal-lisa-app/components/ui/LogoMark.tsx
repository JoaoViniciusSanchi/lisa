import { cn } from '@/lib/utils/cn';

interface LogoMarkProps {
  size?: 'default' | 'small';
  className?: string;
}

/**
 * Marca quadrada do LISA — outline + "L" interno construído com bordas.
 * Estilos detalhados em globals.css (.logo-mark / .logo-mark-sm).
 */
export function LogoMark({ size = 'default', className }: LogoMarkProps) {
  return (
    <div
      className={cn('logo-mark', size === 'small' && 'logo-mark-sm', className)}
      aria-label="LISA"
      role="img"
    />
  );
}

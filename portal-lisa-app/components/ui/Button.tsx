import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'default' | 'small';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const baseStyles =
  'inline-flex items-center gap-3 font-semibold uppercase tracking-[0.02em] cursor-pointer border border-transparent transition-all duration-300';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-bg-base hover:bg-accent-glow hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(46,163,155,0.4)]',
  secondary:
    'bg-transparent text-warm-white border-line-strong hover:border-accent-glow hover:text-accent-glow hover:-translate-y-0.5'
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'px-8 py-[18px] text-[14px]',
  small: 'px-6 py-3 text-[12px]'
};

const disabledStyles =
  'disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

/**
 * Botão padrão do design system LISA.
 * Cantos retos, uppercase, transição suave + hover translate.
 *
 * Uso:
 *   <Button variant="primary"><span>Conectar</span><ArrowRight /></Button>
 */
export function Button({
  variant = 'primary',
  size = 'default',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabledStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'default' | 'small';

interface ButtonTSProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const baseStyles =
  'inline-flex items-center gap-3 font-nunito font-semibold uppercase tracking-[0.02em] cursor-pointer border transition-all duration-300';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-ts-accent text-white border-ts-accent hover:bg-ts-accent-hover hover:border-ts-accent-hover hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(12,113,195,0.45)]',
  secondary:
    'bg-transparent text-white border-white/25 hover:border-ts-accent hover:text-ts-accent hover:-translate-y-0.5'
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'px-8 py-[18px] text-[14px]',
  small: 'px-6 py-3 text-[12px]'
};

const disabledStyles =
  'disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

export function ButtonTS({
  variant = 'primary',
  size = 'default',
  className,
  children,
  type = 'button',
  ...props
}: ButtonTSProps) {
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

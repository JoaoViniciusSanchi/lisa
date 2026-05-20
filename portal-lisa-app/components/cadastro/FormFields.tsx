'use client';

import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldGroupProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({
  label,
  required,
  hint,
  children,
  className
}: FieldGroupProps) {
  return (
    <div className={cn('mb-8', className)}>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] opacity-85 mb-3">
        {label}
        {required && <span className="text-accent-glow ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <div className="text-xs opacity-50 mt-2 leading-relaxed">{hint}</div>
      )}
    </div>
  );
}

const fieldBase =
  'w-full px-5 py-[18px] bg-bg-elevated border border-line-strong text-warm-white text-[15px] font-normal transition-all placeholder:text-warm-white/30 focus:outline-none focus:border-accent focus:bg-bg-card focus:shadow-[0_0_0_3px_rgba(46,163,155,0.1)]';

export function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function FieldSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }
) {
  return (
    <select
      {...props}
      className={cn(
        fieldBase,
        'appearance-none cursor-pointer pr-12 bg-no-repeat',
        props.className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23F4EFE6' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundPosition: 'right 20px center'
      }}
    >
      {props.children}
    </select>
  );
}

interface FieldTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCounter?: boolean;
  maxChars?: number;
}

export function FieldTextarea({
  showCounter = true,
  maxChars = 3000,
  className,
  value,
  defaultValue,
  onChange,
  ...rest
}: FieldTextareaProps) {
  const [length, setLength] = useState(() => {
    if (typeof value === 'string') return value.length;
    if (typeof defaultValue === 'string') return defaultValue.length;
    return 0;
  });

  useEffect(() => {
    if (typeof value === 'string') setLength(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    onChange?.(e);
  };

  const warning = length >= maxChars * 0.83;
  const danger = length >= maxChars;

  return (
    <div>
      <textarea
        {...rest}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxChars}
        onChange={handleChange}
        className={cn(fieldBase, 'resize-y min-h-[120px]', className)}
      />
      {showCounter && (
        <div
          className={cn(
            'flex justify-end text-[11px] font-medium tabular-nums mt-1.5 transition-colors',
            danger
              ? 'text-danger'
              : warning
                ? 'text-warm-white/70'
                : 'text-warm-white/40'
          )}
        >
          {length.toLocaleString('pt-BR')} / {maxChars.toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}

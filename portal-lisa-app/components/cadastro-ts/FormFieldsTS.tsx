'use client';

import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes
} from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldGroupTSProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroupTS({
  label,
  required,
  hint,
  children,
  className
}: FieldGroupTSProps) {
  return (
    <div className={cn('mb-8 font-nunito', className)}>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-white/85 mb-3">
        {label}
        {required && <span className="text-ts-accent ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <div className="text-xs text-white/50 mt-2 leading-relaxed">{hint}</div>
      )}
    </div>
  );
}

const fieldBase =
  'w-full px-5 py-[18px] bg-ts-mid border border-white/15 text-white text-[15px] font-normal font-nunito transition-all placeholder:text-white/40 focus:outline-none focus:border-ts-accent focus:bg-ts-mid focus:shadow-[0_0_0_3px_rgba(12,113,195,0.15)]';

export function FieldInputTS(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function FieldSelectTS(
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
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundPosition: 'right 20px center'
      }}
    >
      {props.children}
    </select>
  );
}

interface FieldTextareaTSProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCounter?: boolean;
  maxChars?: number;
}

export function FieldTextareaTS({
  showCounter = true,
  maxChars = 3000,
  className,
  value,
  defaultValue,
  onChange,
  ...rest
}: FieldTextareaTSProps) {
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
            'flex justify-end text-[11px] font-medium tabular-nums mt-1.5 transition-colors font-nunito',
            danger
              ? 'text-danger'
              : warning
                ? 'text-white/70'
                : 'text-white/40'
          )}
        >
          {length.toLocaleString('pt-BR')} / {maxChars.toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}

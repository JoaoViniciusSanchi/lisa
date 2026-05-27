'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent
} from 'react';
import { cn } from '@/lib/utils/cn';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';
const DEFAULT_MAX_SIZE_MB = 5;

interface UploadZoneTSProps {
  title: string;
  hint: string;
  size?: 'large' | 'small';
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function UploadZoneTS({
  title,
  hint,
  size = 'small',
  file,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_SIZE_MB
}: UploadZoneTSProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const validate = useCallback(
    (f: File): string | null => {
      const allowed = accept.split(',').map((s) => s.trim().toLowerCase());
      if (!allowed.includes(f.type.toLowerCase())) {
        const exts = accept.replace(/image\//g, '').toUpperCase();
        return `Formato não aceito. Use ${exts}.`;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        return `Arquivo excede ${maxSizeMB}MB.`;
      }
      return null;
    },
    [accept, maxSizeMB]
  );

  const handleFile = useCallback(
    (f: File | null | undefined) => {
      if (!f) return;
      const err = validate(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onChange(f);
    },
    [onChange, validate]
  );

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const dropped = e.dataTransfer.files?.[0];
      handleFile(dropped);
    },
    [handleFile]
  );

  function openPicker() {
    inputRef.current?.click();
  }

  function onKeyDownZone(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  }

  function onRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (file && previewUrl) {
    return (
      <div className="bg-ts-mid border border-white/15 font-nunito">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={file.name}
            className="block w-full h-auto max-h-[320px] object-cover"
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/10">
          <div className="text-xs text-white/70 truncate flex-1">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="flex gap-4 shrink-0">
            <button
              type="button"
              onClick={openPicker}
              className="text-[11px] tracking-[0.1em] uppercase text-white/65 hover:text-ts-accent transition-colors"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="text-[11px] tracking-[0.1em] uppercase text-danger hover:opacity-80 transition-opacity"
            >
              Remover
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={title}
        onClick={openPicker}
        onKeyDown={onKeyDownZone}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'p-10 bg-ts-mid border border-dashed text-center cursor-pointer transition-all font-nunito',
          dragActive
            ? 'border-ts-accent bg-ts-mid/80'
            : 'border-white/25 hover:border-ts-accent hover:bg-ts-mid/80',
          error && !dragActive && 'border-danger'
        )}
      >
        <svg
          width={size === 'large' ? 32 : 28}
          height={size === 'large' ? 32 : 28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto mb-3 text-white/60 pointer-events-none"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div className="text-sm font-medium mb-1.5 pointer-events-none text-white">
          {title}
        </div>
        <div className="text-[11px] text-white/55 pointer-events-none">
          {hint}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
      {error && (
        <div className="mt-2 text-xs text-danger font-nunito" role="alert">
          {error}
        </div>
      )}
    </>
  );
}

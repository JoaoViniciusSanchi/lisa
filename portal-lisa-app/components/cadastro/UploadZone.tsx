'use client';

import { useCallback, useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';
const DEFAULT_MAX_SIZE_MB = 5;

interface UploadZoneProps {
  title: string;
  hint: string;
  size?: 'large' | 'small';
  /** Arquivo atualmente selecionado (controlado pelo pai). */
  file: File | null;
  /** Chamado quando o usuário escolhe ou remove um arquivo. */
  onChange: (file: File | null) => void;
  /** Mime types aceitos, separados por vírgula. */
  accept?: string;
  /** Tamanho máximo em MB. */
  maxSizeMB?: number;
}

/**
 * Drop zone de upload de imagem.
 *
 * Estratégia adotada (decisão do projeto):
 *  - Arquivo fica em memória (state do formulário) durante as etapas
 *  - Upload pro Supabase Storage acontece SÓ no submit final
 *  - Validação client-side: mime type + tamanho. Sem processamento.
 *  - Se a aba fechar antes do submit, o arquivo é perdido (esperado).
 */
export function UploadZone({
  title,
  hint,
  size = 'small',
  file,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_SIZE_MB
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Gera/limpa o ObjectURL do preview a cada mudança de arquivo
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

  // Estado preenchido — mostra preview + ações
  if (file && previewUrl) {
    return (
      <div className="bg-bg-elevated border border-line-strong">
        <div className="relative">
          <img
            src={previewUrl}
            alt={file.name}
            className="block w-full h-auto max-h-[320px] object-cover"
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-line">
          <div className="text-xs opacity-70 truncate flex-1">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="flex gap-4 shrink-0">
            <button
              type="button"
              onClick={openPicker}
              className="text-[11px] tracking-[0.1em] uppercase opacity-60 hover:opacity-100 transition-opacity"
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

  // Estado vazio — drop zone clicável
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
          'p-10 bg-bg-elevated border border-dashed text-center cursor-pointer transition-all',
          dragActive
            ? 'border-accent bg-bg-card'
            : 'border-line-brighter hover:border-accent hover:bg-bg-card',
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
          className="mx-auto mb-3 opacity-50 pointer-events-none"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div className="text-sm font-medium mb-1.5 pointer-events-none">{title}</div>
        <div className="text-[11px] opacity-50 pointer-events-none">{hint}</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
      {error && (
        <div className="mt-2 text-xs text-danger" role="alert">
          {error}
        </div>
      )}
    </>
  );
}

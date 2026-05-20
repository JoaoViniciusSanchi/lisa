'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Indicador "Rascunho salvo automaticamente" no canto inferior direito.
 * Aparece por 2s após cada save e desaparece.
 */
export function DraftIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handleSaved() {
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 2000);
    }

    window.addEventListener('lisa-draft-saved', handleSaved);
    return () => {
      window.removeEventListener('lisa-draft-saved', handleSaved);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 px-5 py-3 bg-bg-elevated border border-line-strong text-[11px] uppercase tracking-[0.1em] z-[60] flex items-center gap-2.5 transition-opacity',
        visible ? 'opacity-70' : 'opacity-0 pointer-events-none'
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="w-1.5 h-1.5 bg-accent-glow" aria-hidden="true" />
      Rascunho salvo automaticamente
    </div>
  );
}

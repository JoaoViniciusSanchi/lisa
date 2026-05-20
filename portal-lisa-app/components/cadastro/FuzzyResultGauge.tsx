'use client';

import { useEffect, useState } from 'react';
import type { FaixaFuzzy } from '@/lib/supabase/types';

interface FuzzyResultGaugeProps {
  indice: number;
  faixa: FaixaFuzzy;
}

const FAIXA_COLOR: Record<FaixaFuzzy, string> = {
  vermelho: '#E55542',
  amarelo: '#E5B842',
  verde: '#3FBDB4'
};

const FAIXA_LABEL: Record<FaixaFuzzy, string> = {
  vermelho: 'Baixo',
  amarelo: 'Médio',
  verde: 'Alto'
};

/**
 * Gauge circular SVG com animação de stroke-dashoffset.
 * Mostra Baixo / Médio / Alto no centro.
 */
export function FuzzyResultGauge({ indice, faixa }: FuzzyResultGaugeProps) {
  const [animatedIndice, setAnimatedIndice] = useState(0);

  useEffect(() => {
    // Trigger animation after mount
    const t = setTimeout(() => setAnimatedIndice(indice), 100);
    return () => clearTimeout(t);
  }, [indice]);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * animatedIndice;
  const color = FAIXA_COLOR[faixa];
  const label = FAIXA_LABEL[faixa];

  return (
    <div className="relative w-[280px] h-[280px] mx-auto mb-12">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 280 280"
        aria-hidden="true"
      >
        <circle
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={8}
          cx={140}
          cy={140}
          r={radius}
        />
        <circle
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="square"
          cx={140}
          cy={140}
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition:
              'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-display text-[64px] font-extralight tracking-[-0.04em] leading-none transition-colors"
          style={{ color }}
        >
          {label}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60 mt-3">
          Grau de aderência
        </div>
      </div>
    </div>
  );
}

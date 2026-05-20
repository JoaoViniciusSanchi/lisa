'use client';

import { cn } from '@/lib/utils/cn';

interface FuzzySliderProps {
  code: string;
  question: string;
  value: number;
  onChange: (value: number) => void;
  showScale?: boolean;
}

/**
 * Slider 0-10 com gradiente cromático vermelho/amarelo/verde.
 * Passo 0.5 (21 valores). Mostra valor numérico ao lado do código.
 */
export function FuzzySlider({
  code,
  question,
  value,
  onChange,
  showScale = false
}: FuzzySliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

  return (
    <div className="py-8 border-b border-line last:border-b-0">
      <div className="flex items-start justify-between gap-6 mb-7">
        <div>
          <div className="font-display text-[11px] font-semibold tracking-[0.15em] text-accent-glow opacity-60 mb-1.5">
            {code}
          </div>
          <div className="font-display text-xl font-light leading-[1.35] text-warm-white max-w-[600px]">
            {question}
          </div>
        </div>
        <div className="font-display text-3xl font-extralight text-accent-glow tracking-[-0.04em] tabular-nums min-w-[56px] text-right">
          {formatted}
        </div>
      </div>

      <div className="relative pt-3 pb-7">
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={value}
          onChange={handleChange}
          className={cn(
            'w-full h-1 outline-none cursor-pointer appearance-none fuzzy-slider'
          )}
          aria-label={`${code}: ${question}`}
        />
        <div className="flex justify-between mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-50">
          <span>Inexistente</span>
          <span>Plenamente manifestada</span>
        </div>
        {showScale && (
          <div className="flex justify-between mt-1 font-display text-[10px] opacity-30 tabular-nums">
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
            <span>10</span>
          </div>
        )}
      </div>
    </div>
  );
}

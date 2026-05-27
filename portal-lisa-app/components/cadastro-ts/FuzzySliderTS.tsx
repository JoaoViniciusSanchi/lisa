'use client';

import { cn } from '@/lib/utils/cn';

interface FuzzySliderTSProps {
  code: string;
  question: string;
  value: number;
  onChange: (value: number) => void;
  showScale?: boolean;
}

export function FuzzySliderTS({
  code,
  question,
  value,
  onChange,
  showScale = false
}: FuzzySliderTSProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="py-8 border-b border-white/10 last:border-b-0 font-nunito">
      <div className="mb-7">
        <div className="font-nunito text-[11px] font-bold tracking-[0.15em] text-ts-accent opacity-80 mb-1.5">
          {code}
        </div>
        <div className="font-nunito text-xl font-light leading-[1.35] text-white max-w-[600px]">
          {question}
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
            'w-full h-1 outline-none cursor-pointer appearance-none fuzzy-slider-ts'
          )}
          aria-label={`${code}: ${question}`}
        />
        <div className="flex justify-between mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
          <span>Inexistente</span>
          <span>Plenamente manifestada</span>
        </div>
        {showScale && (
          <div className="flex justify-between mt-1 text-[10px] text-white/35 tabular-nums">
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

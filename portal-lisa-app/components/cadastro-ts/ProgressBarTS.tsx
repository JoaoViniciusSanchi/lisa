'use client';

import { cn } from '@/lib/utils/cn';
import { useCadastroForm } from '@/components/cadastro/FormProvider';
import { TRIAGEM_STEPS, CADASTRO_STEPS } from '@/components/cadastro/state';

const TRIAGEM_LABELS = [
  'Participação',
  'Impacto',
  'Apropriação',
  'Sustentabilidade',
  'Replicabilidade'
];

const CADASTRO_LABELS = [
  'Identificação',
  'Experiência',
  'Macroareas',
  'CNPq+ODS',
  'Finalidade',
  'Extensão',
  'Classificações',
  'Resultados'
];

export function ProgressBarTS() {
  const { state, dispatch } = useCadastroForm();
  const step = state.currentStep;

  const isTriagem = TRIAGEM_STEPS.includes(step as never);
  const isCadastro = CADASTRO_STEPS.includes(step as never);

  if (!isTriagem && !isCadastro) return null;

  const labels = isTriagem ? TRIAGEM_LABELS : CADASTRO_LABELS;
  const stepsList = isTriagem ? TRIAGEM_STEPS : CADASTRO_STEPS;
  const indexInPhase = stepsList.indexOf(step as never);

  const phaseText = isTriagem
    ? 'Fase 1 · Triagem de Aderência'
    : 'Fase 2 · Cadastro Completo';

  const goTo = (target: number) =>
    dispatch({ type: 'SET_STEP', step: target });

  return (
    <div className="fixed top-[72px] left-0 right-0 z-40 border-b border-ts-accent/30 bg-ts-deep/95 backdrop-blur-[20px] py-5">
      <div className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-ts-accent mb-4">
        {phaseText}
      </div>
      <div className="max-w-[1100px] mx-auto px-8 flex items-center gap-3">
        {labels.map((label, i) => {
          const isActive = i === indexInPhase;
          const isCompleted = i < indexInPhase;
          const isClickable = isCadastro && !isActive;
          const targetStep = stepsList[i];

          const circle = (
            <div
              className={cn(
                'w-9 h-9 border flex items-center justify-center font-nunito text-sm font-semibold transition-all relative',
                isActive &&
                  'border-ts-accent bg-ts-accent text-white shadow-[0_0_0_4px_rgba(12,113,195,0.18),0_0_30px_rgba(12,113,195,0.35)]',
                isCompleted &&
                  'border-ts-accent bg-transparent text-ts-accent',
                !isActive &&
                  !isCompleted &&
                  'border-white/20 bg-ts-deep text-white/70',
                isClickable && 'group-hover:border-ts-accent'
              )}
            >
              {isCompleted ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="square"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                String(i + 1).padStart(2, '0')
              )}
            </div>
          );

          const labelEl = (
            <div
              className={cn(
                'hidden md:block text-[9px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-colors font-nunito',
                isActive && 'text-ts-accent',
                isCompleted && 'text-white/70',
                !isActive && !isCompleted && 'text-white/40',
                isClickable && 'group-hover:opacity-100 group-hover:text-white'
              )}
            >
              {label}
            </div>
          );

          return (
            <div key={label} className="contents">
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => goTo(targetStep)}
                  aria-label={`Ir para etapa ${i + 1}: ${label}`}
                  className="group flex flex-col items-center gap-2 flex-shrink-0 relative bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ts-deep"
                >
                  {circle}
                  {labelEl}
                </button>
              ) : (
                <div
                  className="flex flex-col items-center gap-2 flex-shrink-0 relative"
                  aria-current={isActive ? 'step' : undefined}
                >
                  {circle}
                  {labelEl}
                </div>
              )}
              {i < labels.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px min-w-[20px] mb-6',
                    isCompleted ? 'bg-ts-accent' : 'bg-white/15'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

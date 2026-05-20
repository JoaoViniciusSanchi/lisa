'use client';

import { cn } from '@/lib/utils/cn';
import { useCadastroForm } from './FormProvider';
import { TRIAGEM_STEPS, CADASTRO_STEPS } from './state';

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

/**
 * Barra de progresso fixa abaixo do header. Mostra apenas durante triagem
 * (steps 1-5) e cadastro completo (steps 7-14). Esconde no welcome, gate
 * e success.
 *
 * Na fase 2 (cadastro completo), os quadradinhos são clicáveis: o
 * coordenador pode navegar livremente entre as 8 etapas. Na fase 1
 * (triagem), são apenas indicadores — a navegação é sequencial porque
 * o resultado fuzzy só é calculado após a quinta dimensão.
 */
export function ProgressBar() {
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
    <div className="fixed top-[72px] left-0 right-0 z-40 border-b border-line bg-bg-base/85 backdrop-blur-[20px] py-5">
      <div className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-accent-glow mb-4">
        {phaseText}
      </div>
      <div className="max-w-[1100px] mx-auto px-8 flex items-center gap-3">
        {labels.map((label, i) => {
          const isActive = i === indexInPhase;
          const isCompleted = i < indexInPhase;
          // Apenas a fase 2 permite navegar pulando etapas.
          const isClickable = isCadastro && !isActive;
          const targetStep = stepsList[i];

          const circle = (
            <div
              className={cn(
                'w-9 h-9 border flex items-center justify-center font-display text-sm font-medium transition-all relative',
                isActive &&
                  'border-accent-glow bg-accent text-bg-base shadow-[0_0_0_4px_rgba(46,163,155,0.15),0_0_30px_rgba(46,163,155,0.3)]',
                isCompleted &&
                  'border-accent bg-transparent text-accent-glow',
                !isActive &&
                  !isCompleted &&
                  'border-line-strong bg-bg-base text-warm-white',
                isClickable && 'group-hover:border-accent-glow'
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
                'hidden md:block text-[9px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-colors',
                isActive && 'text-accent-glow',
                isCompleted && 'opacity-60',
                !isActive && !isCompleted && 'opacity-40',
                isClickable && 'group-hover:opacity-100 group-hover:text-warm-white'
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
                  className="group flex flex-col items-center gap-2 flex-shrink-0 relative bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
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
                    isCompleted ? 'bg-accent' : 'bg-line'
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

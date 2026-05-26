'use client';

import { useEffect } from 'react';
import { useCadastroForm } from './FormProvider';
import { CadastroHeader } from './CadastroHeader';
import { ProgressBar } from './ProgressBar';
import { DraftIndicator } from './DraftIndicator';
import { CadastroNavigation } from './CadastroNavigation';
import {
  STEPS,
  TRIAGEM_STEPS,
  CADASTRO_STEPS,
  TRIAGEM_DIMENSION_BY_STEP
} from './state';

import { WelcomeStep } from './steps/WelcomeStep';
import { TriagemStep } from './steps/TriagemStep';
import { ResultStep } from './steps/ResultStep';
import { IdentificacaoStep } from './steps/IdentificacaoStep';
import { ExperienciaStep } from './steps/ExperienciaStep';
import { MacroareaStep } from './steps/MacroareaStep';
import { ClassificacaoCnpqOdsStep } from './steps/ClassificacaoCnpqOdsStep';
import { FinalidadeSocialStep } from './steps/FinalidadeSocialStep';
import { ForproexStep } from './steps/ForproexStep';
import { OutrasClassificacoesStep } from './steps/OutrasClassificacoesStep';
import { ResultadosMateriaisStep } from './steps/ResultadosMateriaisStep';
import { SuccessStep } from './steps/SuccessStep';
import { TextoIngleStep } from './steps/TextoIngleStep';

// Passos extras para modo edição
const EDICAO_STEPS = [...CADASTRO_STEPS, STEPS.TEXTO_INGLES];

/**
 * Controller que renderiza o step atual baseado em state.currentStep.
 * Faz scroll-to-top ao trocar de step.
 * Em modo edição, pula WelcomeStep, TriagemStep e ResultStep.
 */
export function CadastroController() {
  const { state } = useCadastroForm();
  const step = state.currentStep;
  const isEdicao = state.modo === 'edicao';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const activeSteps = isEdicao ? EDICAO_STEPS : CADASTRO_STEPS;
  const isProgressPhase =
    TRIAGEM_STEPS.includes(step as never) ||
    activeSteps.includes(step as never);

  return (
    <>
      <CadastroHeader />
      <ProgressBar />

      <div
        className={`relative z-10 px-8 pb-32 ${
          isProgressPhase ? 'pt-[220px]' : 'pt-[120px]'
        }`}
      >
        <div className="max-w-[900px] mx-auto">
          {isEdicao && (
            <div className="mb-6 bg-accent/10 border border-accent/30 px-5 py-3 text-[13px] text-accent">
              ✏️ Você está editando os dados da sua experiência via link de convite.
            </div>
          )}
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.4,0,0.2,1)]">
            {renderStep(step)}
          </div>
          <CadastroNavigation />
        </div>
      </div>

      {!isEdicao && <DraftIndicator />}
    </>
  );
}

function renderStep(step: number) {
  if (step === STEPS.WELCOME) return <WelcomeStep />;
  if (TRIAGEM_STEPS.includes(step as never)) {
    const dim = TRIAGEM_DIMENSION_BY_STEP[step];
    return <TriagemStep dim={dim} />;
  }
  if (step === STEPS.RESULT) return <ResultStep />;
  if (step === STEPS.IDENTIFICACAO) return <IdentificacaoStep />;
  if (step === STEPS.EXPERIENCIA) return <ExperienciaStep />;
  if (step === STEPS.MACROAREAS) return <MacroareaStep />;
  if (step === STEPS.CNPQ_ODS) return <ClassificacaoCnpqOdsStep />;
  if (step === STEPS.FINALIDADE) return <FinalidadeSocialStep />;
  if (step === STEPS.FORPROEX) return <ForproexStep />;
  if (step === STEPS.OUTRAS_CLASS) return <OutrasClassificacoesStep />;
  if (step === STEPS.RESULTADOS_MATERIAIS) return <ResultadosMateriaisStep />;
  if (step === STEPS.TEXTO_INGLES) return <TextoIngleStep />;
  if (step === STEPS.SUCCESS) return <SuccessStep />;
  return <WelcomeStep />;
}

'use client';

import { useEffect } from 'react';
import { useCadastroForm } from '@/components/cadastro/FormProvider';
import {
  STEPS,
  TRIAGEM_STEPS,
  CADASTRO_STEPS,
  TRIAGEM_DIMENSION_BY_STEP
} from '@/components/cadastro/state';

import { CadastroHeaderTS } from './CadastroHeaderTS';
import { ProgressBarTS } from './ProgressBarTS';
import { DraftIndicatorTS } from './DraftIndicatorTS';
import { CadastroNavigationTS } from './CadastroNavigationTS';
import { FooterTS } from './FooterTS';

import { WelcomeStepTS } from './steps/WelcomeStepTS';
import { TriagemStepTS } from './steps/TriagemStepTS';
import { ResultStepTS } from './steps/ResultStepTS';
import { IdentificacaoStepTS } from './steps/IdentificacaoStepTS';
import { ExperienciaStepTS } from './steps/ExperienciaStepTS';
import { MacroareaStepTS } from './steps/MacroareaStepTS';
import { ClassificacaoCnpqOdsStepTS } from './steps/ClassificacaoCnpqOdsStepTS';
import { FinalidadeSocialStepTS } from './steps/FinalidadeSocialStepTS';
import { ForproexStepTS } from './steps/ForproexStepTS';
import { OutrasClassificacoesStepTS } from './steps/OutrasClassificacoesStepTS';
import { ResultadosMateriaisStepTS } from './steps/ResultadosMateriaisStepTS';
import { SuccessStepTS } from './steps/SuccessStepTS';
import { TextoIngleStepTS } from './steps/TextoIngleStepTS';

const EDICAO_STEPS = [...CADASTRO_STEPS, STEPS.TEXTO_INGLES];

export function CadastroControllerTS() {
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
      <CadastroHeaderTS />
      <ProgressBarTS />

      <div
        className={`relative z-10 px-8 pb-32 ${
          isProgressPhase ? 'pt-[220px]' : 'pt-[120px]'
        }`}
      >
        <div className="max-w-[900px] mx-auto">
          {isEdicao && (
            <div className="mb-6 bg-ts-accent/10 border border-ts-accent/30 px-5 py-3 text-[13px] text-ts-accent font-nunito">
              ✏️ Você está editando os dados da sua experiência via link de
              convite.
            </div>
          )}
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.4,0,0.2,1)]">
            {renderStep(step)}
          </div>
          <CadastroNavigationTS />
        </div>
      </div>

      {!isEdicao && <DraftIndicatorTS />}
      <FooterTS />
    </>
  );
}

function renderStep(step: number) {
  if (step === STEPS.WELCOME) return <WelcomeStepTS />;
  if (TRIAGEM_STEPS.includes(step as never)) {
    const dim = TRIAGEM_DIMENSION_BY_STEP[step];
    return <TriagemStepTS dim={dim} />;
  }
  if (step === STEPS.RESULT) return <ResultStepTS />;
  if (step === STEPS.IDENTIFICACAO) return <IdentificacaoStepTS />;
  if (step === STEPS.EXPERIENCIA) return <ExperienciaStepTS />;
  if (step === STEPS.MACROAREAS) return <MacroareaStepTS />;
  if (step === STEPS.CNPQ_ODS) return <ClassificacaoCnpqOdsStepTS />;
  if (step === STEPS.FINALIDADE) return <FinalidadeSocialStepTS />;
  if (step === STEPS.FORPROEX) return <ForproexStepTS />;
  if (step === STEPS.OUTRAS_CLASS) return <OutrasClassificacoesStepTS />;
  if (step === STEPS.RESULTADOS_MATERIAIS) return <ResultadosMateriaisStepTS />;
  if (step === STEPS.TEXTO_INGLES) return <TextoIngleStepTS />;
  if (step === STEPS.SUCCESS) return <SuccessStepTS />;
  return <WelcomeStepTS />;
}

'use client';

import { ButtonTS } from '../ButtonTS';
import { ArrowRight } from '@/components/ui/icons';
import { EyebrowTS } from '../EyebrowTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';
import { STEPS } from '@/components/cadastro/state';

export function WelcomeStepTS() {
  const { dispatch } = useCadastroForm();

  return (
    <div className="text-left max-w-[800px] mx-auto font-nunito">
      <EyebrowTS as="div" className="mb-6">
        Edital de Chamamento 2026 · Aberto
      </EyebrowTS>

      <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px] mb-12">
        Este formulário reúne as informações necessárias para registrar sua
        iniciativa no Catálogo 2026 de Tecnologia Social da AGIR UFF. O
        cadastro é feito em duas fases: primeiro uma{' '}
        <strong className="text-white font-semibold">
          triagem de aderência
        </strong>{' '}
        com 20 perguntas rápidas que avaliam em que grau sua experiência se
        caracteriza como tecnologia social, e depois o{' '}
        <strong className="text-white font-semibold">cadastro completo</strong>{' '}
        da experiência.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 mb-12">
        <InfoTileTS label="Duração estimada" value="25" unit="min" />
        <InfoTileTS label="Fases" value="2" unit="triagem + cadastro" />
        <InfoTileTS label="Rascunho" value="Auto" unit="salvo" />
        <InfoTileTS label="Moderação" value="7" unit="dias" />
      </div>

      <ButtonTS
        onClick={() => dispatch({ type: 'SET_STEP', step: STEPS.TRIAGEM_P })}
      >
        Começar triagem
        <ArrowRight width={16} height={16} />
      </ButtonTS>

      <p className="text-xs text-white/50 mt-8 max-w-[520px] leading-relaxed">
        Ao submeter o formulário, você concorda com o uso dos dados pela
        Coordenação de Inovação e Tecnologias Sociais (AGIR/PROPPI/UFF) para os
        fins do Catálogo de Tecnologias Sociais 2026.
      </p>
    </div>
  );
}

function InfoTileTS({
  label,
  value,
  unit
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="px-6 py-7 bg-ts-mid">
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-ts-accent mb-3">
        {label}
      </div>
      <div className="font-nunito text-[28px] font-light leading-none text-white">
        {value}
        <span className="text-xs text-white/55 ml-1 font-normal">{unit}</span>
      </div>
    </div>
  );
}

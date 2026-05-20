'use client';

import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/icons';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useCadastroForm } from '../FormProvider';
import { STEPS } from '../state';

export function WelcomeStep() {
  const { dispatch } = useCadastroForm();

  return (
    <div className="text-left max-w-[800px] mx-auto">
      <Eyebrow as="div" className="mb-6">
        Edital de Chamamento 2026 · Aberto
      </Eyebrow>

      <p className="text-lg font-light leading-relaxed opacity-70 max-w-[680px] mb-12">
        Este formulário reúne as informações necessárias para registrar sua
        iniciativa no Catálogo 2026 de Tecnologia Social da AGIR UFF. O cadastro
        é feito em duas fases: primeiro uma{' '}
        <strong>triagem de aderência</strong> com 20 perguntas rápidas que
        avaliam em que grau sua experiência se caracteriza como tecnologia
        social, e depois o <strong>cadastro completo</strong> da experiência.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line mb-12">
        <InfoTile label="Duração estimada" value="25" unit="min" />
        <InfoTile label="Fases" value="2" unit="triagem + cadastro" />
        <InfoTile label="Rascunho" value="Auto" unit="salvo" />
        <InfoTile label="Moderação" value="7" unit="dias" />
      </div>

      <Button onClick={() => dispatch({ type: 'SET_STEP', step: STEPS.TRIAGEM_P })}>
        Começar triagem
        <ArrowRight width={16} height={16} />
      </Button>

      <p className="text-xs opacity-40 mt-8 max-w-[520px] leading-relaxed">
        Ao submeter o formulário, você concorda com o uso dos dados pela
        Coordenação de Inovação e Tecnologias Sociais (AGIR/PROPPI/UFF) para os
        fins do Catálogo de Tecnologias Sociais 2026.
      </p>
    </div>
  );
}

function InfoTile({
  label,
  value,
  unit
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="px-6 py-7 bg-bg-elevated">
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-glow mb-3">
        {label}
      </div>
      <div className="font-display text-[28px] font-light leading-none">
        {value}
        <span className="text-xs opacity-50 ml-1 font-normal">{unit}</span>
      </div>
    </div>
  );
}

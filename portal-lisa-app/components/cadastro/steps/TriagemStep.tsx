'use client';

import { useCadastroForm } from '../FormProvider';
import { FuzzySlider } from '../FuzzySlider';
import { FieldGroup, FieldTextarea } from '../FormFields';
import type { DimensionKey } from '@/lib/fuzzy/types';

interface TriagemStepProps {
  dim: DimensionKey;
}

const DIMENSION_META: Record<
  DimensionKey,
  {
    index: number;
    title: string;
    intro: string;
    peso: string;
    questions: { code: string; text: string }[];
  }
> = {
  P: {
    index: 1,
    title: 'Participação Comunitária',
    intro:
      'Avalie em que grau a comunidade esteve envolvida nas decisões e no funcionamento do projeto. Arraste cada marcador para indicar sua resposta de 0 (característica inexistente) a 10 (plenamente manifestada).',
    peso: 'Peso 30%',
    questions: [
      { code: 'P1', text: 'A comunidade participa das decisões do projeto' },
      {
        code: 'P2',
        text: 'Os beneficiários influenciam diretamente o funcionamento'
      },
      { code: 'P3', text: 'Há espaços coletivos de deliberação' },
      {
        code: 'P4',
        text: 'O projeto é construído com a comunidade, e não para ela'
      }
    ]
  },
  I: {
    index: 2,
    title: 'Impacto Social',
    intro:
      'Avalie em que grau sua experiência gera transformações concretas percebidas pela comunidade beneficiada.',
    peso: 'Peso 25%',
    questions: [
      {
        code: 'I1',
        text: 'O projeto melhora as condições de vida da comunidade'
      },
      { code: 'I2', text: 'Há evidências concretas de transformação social' },
      { code: 'I3', text: 'O projeto reduz desigualdades locais' },
      { code: 'I4', text: 'O impacto é percebido pelos beneficiários' }
    ]
  },
  A: {
    index: 3,
    title: 'Apropriação Tecnológica',
    intro:
      'Avalie o grau de autonomia da comunidade sobre a tecnologia ou metodologia usada no projeto.',
    peso: 'Peso 20%',
    questions: [
      { code: 'A1', text: 'A comunidade entende como o projeto funciona' },
      {
        code: 'A2',
        text: 'Os usuários conseguem operar a tecnologia de forma autônoma'
      },
      { code: 'A3', text: 'O conhecimento técnico é compartilhado' },
      { code: 'A4', text: 'Há independência de especialistas externos' }
    ]
  },
  S: {
    index: 4,
    title: 'Sustentabilidade',
    intro:
      'Avalie a capacidade de manutenção do projeto ao longo do tempo e sua resistência a mudanças externas.',
    peso: 'Peso 15%',
    questions: [
      { code: 'S1', text: 'O projeto consegue se manter ao longo do tempo' },
      { code: 'S2', text: 'Há autonomia financeira ou organizacional' },
      { code: 'S3', text: 'O projeto resiste a mudanças externas' },
      { code: 'S4', text: 'Existem estratégias de continuidade' }
    ]
  },
  R: {
    index: 5,
    title: 'Replicabilidade',
    intro:
      'Avalie o quanto seu projeto pode ser adaptado e reaplicado em contextos diferentes do original.',
    peso: 'Peso 10%',
    questions: [
      { code: 'R1', text: 'O projeto pode ser adaptado para outros contextos' },
      { code: 'R2', text: 'A metodologia é documentada' },
      { code: 'R3', text: 'Outros grupos conseguem reproduzir a iniciativa' },
      { code: 'R4', text: 'O modelo é flexível a diferentes realidades' }
    ]
  }
};

export function TriagemStep({ dim }: TriagemStepProps) {
  const { state, dispatch } = useCadastroForm();
  const meta = DIMENSION_META[dim];
  const answers = state.fuzzyAnswers[dim];
  const justificativa = state.justificativas[dim] ?? '';

  return (
    <div>
      <div className="mb-12">
        <div className="font-display text-[11px] font-semibold tracking-[0.15em] opacity-40 mb-4">
          [ Triagem · Dimensão {meta.index} de 5 ]
        </div>
        <p className="text-lg font-light leading-relaxed opacity-70 max-w-[680px]">
          <strong>{meta.title}.</strong> {meta.intro}
        </p>
      </div>

      <div className="px-7 py-6 bg-gradient-to-br from-[rgba(46,163,155,0.06)] to-bg-elevated border-l-2 border-accent-glow mb-10">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-glow mb-2">
          Dimensão {meta.index} · {meta.peso}
        </div>
        <div className="text-sm leading-relaxed opacity-85">
          {dim === 'P' &&
            'Esta é a dimensão de maior peso no cálculo de aderência. Ela avalia se a comunidade é coautora do projeto ou apenas recebe seus resultados.'}
          {dim === 'I' &&
            'O impacto social mede se a experiência efetivamente melhora as condições de vida das pessoas envolvidas, com evidências concretas.'}
          {dim === 'A' &&
            'A apropriação tecnológica mede se a comunidade domina a ferramenta ou depende de especialistas externos para operá-la.'}
          {dim === 'S' &&
            'A sustentabilidade avalia se o projeto consegue se manter sem depender de financiamento pontual ou conjunturas específicas.'}
          {dim === 'R' &&
            'A replicabilidade avalia se outros grupos conseguiriam adaptar a iniciativa para suas próprias realidades, preservando os princípios centrais.'}
        </div>
      </div>

      {meta.questions.map((q, idx) => (
        <FuzzySlider
          key={q.code}
          code={q.code}
          question={q.text}
          value={answers[idx]}
          onChange={(value) =>
            dispatch({ type: 'SET_FUZZY_ANSWER', dim, idx, value })
          }
          showScale={idx === 0}
        />
      ))}

      <div className="mt-12">
        <FieldGroup
          label={`Conte brevemente como esta dimensão se manifesta na sua experiência (opcional)`}
          hint="Até 1.000 caracteres. Aparece no painel admin durante a moderação e pode compor o conteúdo editorial do catálogo."
        >
          <FieldTextarea
            value={justificativa}
            maxChars={1000}
            rows={4}
            onChange={(e) =>
              dispatch({
                type: 'SET_JUSTIFICATIVA',
                dim,
                texto: e.target.value
              })
            }
            placeholder="Texto opcional descrevendo como esta dimensão se manifesta..."
          />
        </FieldGroup>
      </div>
    </div>
  );
}

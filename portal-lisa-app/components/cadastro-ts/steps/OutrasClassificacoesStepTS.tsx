'use client';

import { FieldGroupTS } from '../FormFieldsTS';
import { PillTS } from '../PillTS';
import { CategoryCardTS } from '../CategoryCardTS';
import { HairlineTS } from '../HairlineTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

const PUBLICO_ALVO = [
  { code: 'CUP', label: 'Comunidades urbanas periféricas' },
  { code: 'RUR', label: 'População rural' },
  { code: 'PVT', label: 'Povos tradicionais' },
  { code: 'MUL', label: 'Mulheres' },
  { code: 'JUV', label: 'Juventude' },
  { code: 'IDO', label: 'Idosos' },
  { code: 'PCD', label: 'Pessoas com deficiência' }
];

const TIPO_SOLUCAO = [
  {
    code: 'PROC',
    title: 'Tecnologias de Processo',
    description: 'Métodos, metodologias, arranjos organizacionais'
  },
  {
    code: 'PROD',
    title: 'Tecnologias de Produto',
    description: 'Artefatos físicos (ex.: filtros, equipamentos de baixo custo)'
  },
  {
    code: 'DIG',
    title: 'Tecnologias Digitais',
    description: 'Apps, plataformas, sistemas de informação'
  },
  {
    code: 'HIB',
    title: 'Tecnologias Sociais Híbridas',
    description: 'Combinação de digital + comunitário'
  },
  {
    code: 'TRAD',
    title: 'Tecnologias Baseadas em Conhecimento Tradicional',
    description: 'Saberes locais, práticas ancestrais'
  }
];

const ARRANJO = [
  { code: 'EXT', label: 'Projeto de Extensão' },
  { code: 'PESQ', label: 'Pesquisa aplicada' },
  { code: 'ENS', label: 'Ensino (disciplinas/projetos integradores)' },
  { code: 'GOV', label: 'Parcerias com governo' },
  { code: 'ONG', label: 'Parcerias com ONGs/comunidades' },
  { code: 'INCB', label: 'Incubadoras e laboratórios sociais' }
];

export function OutrasClassificacoesStepTS() {
  const { state, dispatch } = useCadastroForm();
  const c = state.classificacoes;

  const toggle = (
    key: 'publicoAlvoCodigos' | 'tipoSolucaoCodigos' | 'arranjoCodigos',
    value: string
  ) => dispatch({ type: 'TOGGLE_CLASSIFICATION', key, value });

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 07 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Classifique sua experiência por{' '}
          <strong className="text-white font-semibold">público-alvo</strong>,{' '}
          <strong className="text-white font-semibold">tipo de solução</strong> e{' '}
          <strong className="text-white font-semibold">
            arranjo institucional
          </strong>
          . Marque todas que se aplicam.
        </p>
      </div>

      <FieldGroupTS label="Público-Alvo" required>
        <div className="flex flex-wrap gap-2.5">
          {PUBLICO_ALVO.map((p) => (
            <PillTS
              key={p.code}
              label={p.label}
              selected={c.publicoAlvoCodigos.includes(p.code)}
              onClick={() => toggle('publicoAlvoCodigos', p.code)}
            />
          ))}
        </div>
      </FieldGroupTS>

      <HairlineTS className="my-10" />

      <FieldGroupTS label="Tipo de Solução Tecnológica" required>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TIPO_SOLUCAO.map((t) => (
            <CategoryCardTS
              key={t.code}
              title={t.title}
              description={t.description}
              selected={c.tipoSolucaoCodigos.includes(t.code)}
              onClick={() => toggle('tipoSolucaoCodigos', t.code)}
            />
          ))}
        </div>
      </FieldGroupTS>

      <HairlineTS className="my-10" />

      <FieldGroupTS label="Arranjo Institucional" required>
        <div className="flex flex-wrap gap-2.5">
          {ARRANJO.map((a) => (
            <PillTS
              key={a.code}
              label={a.label}
              selected={c.arranjoCodigos.includes(a.code)}
              onClick={() => toggle('arranjoCodigos', a.code)}
            />
          ))}
        </div>
      </FieldGroupTS>
    </div>
  );
}

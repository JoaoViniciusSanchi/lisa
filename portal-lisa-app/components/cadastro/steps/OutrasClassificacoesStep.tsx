'use client';

import { FieldGroup } from '../FormFields';
import { Pill } from '../Pill';
import { CategoryCard } from '../CategoryCard';
import { Hairline } from '@/components/ui/Hairline';
import { useCadastroForm } from '../FormProvider';

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

export function OutrasClassificacoesStep() {
  const { state, dispatch } = useCadastroForm();
  const c = state.classificacoes;

  const toggle = (
    key: 'publicoAlvoCodigos' | 'tipoSolucaoCodigos' | 'arranjoCodigos',
    value: string
  ) => dispatch({ type: 'TOGGLE_CLASSIFICATION', key, value });

  return (
    <div>
      <div className="mb-12">
        <div className="font-display text-[11px] font-semibold tracking-[0.15em] opacity-40 mb-4">
          [ Cadastro · Etapa 07 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed opacity-70 max-w-[680px]">
          Classifique sua experiência por <strong>público-alvo</strong>,{' '}
          <strong>tipo de solução</strong> e{' '}
          <strong>arranjo institucional</strong>. Marque todas que se aplicam.
        </p>
      </div>

      <FieldGroup label="Público-Alvo" required>
        <div className="flex flex-wrap gap-2.5">
          {PUBLICO_ALVO.map((p) => (
            <Pill
              key={p.code}
              label={p.label}
              selected={c.publicoAlvoCodigos.includes(p.code)}
              onClick={() => toggle('publicoAlvoCodigos', p.code)}
            />
          ))}
        </div>
      </FieldGroup>

      <Hairline className="my-10" />

      <FieldGroup label="Tipo de Solução Tecnológica" required>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
          {TIPO_SOLUCAO.map((t) => (
            <CategoryCard
              key={t.code}
              title={t.title}
              description={t.description}
              selected={c.tipoSolucaoCodigos.includes(t.code)}
              onClick={() => toggle('tipoSolucaoCodigos', t.code)}
            />
          ))}
        </div>
      </FieldGroup>

      <Hairline className="my-10" />

      <FieldGroup label="Arranjo Institucional" required>
        <div className="flex flex-wrap gap-2.5">
          {ARRANJO.map((a) => (
            <Pill
              key={a.code}
              label={a.label}
              selected={c.arranjoCodigos.includes(a.code)}
              onClick={() => toggle('arranjoCodigos', a.code)}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

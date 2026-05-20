'use client';

import { FieldGroup } from '../FormFields';
import { CategoryCard } from '../CategoryCard';
import { useCadastroForm } from '../FormProvider';

const FORPROEX = [
  {
    code: 'COM',
    title: 'Comunicação',
    description:
      'Comunicação social, mídia comunitária, produção de material educativo, rádio e TV.'
  },
  {
    code: 'CUL',
    title: 'Cultura',
    description:
      'Produção cultural, memória, patrimônio, folclore, artesanato e artes.'
  },
  {
    code: 'DHJ',
    title: 'Direitos Humanos e Justiça',
    description:
      'Cidadania, ética, inclusão, assistência jurídica, combate a preconceitos.'
  },
  {
    code: 'EDU',
    title: 'Educação',
    description:
      'Educação básica, superior, profissional, popular, especial e de jovens e adultos.'
  },
  {
    code: 'AMB',
    title: 'Meio Ambiente',
    description:
      'Ecologia, desenvolvimento sustentável, recursos hídricos, gestão ambiental.'
  },
  {
    code: 'SAU',
    title: 'Saúde',
    description:
      'Saúde pública, nutrição, enfermagem, saúde do trabalhador e saúde coletiva.'
  },
  {
    code: 'TEC',
    title: 'Tecnologia e Produção',
    description:
      'Desenvolvimento tecnológico, difusão de tecnologias, desenvolvimento rural e industrial.'
  },
  {
    code: 'TRA',
    title: 'Trabalho',
    description:
      'Economia solidária, qualificação profissional, relações de trabalho.'
  }
];

export function ForproexStep() {
  const { state, dispatch } = useCadastroForm();
  const selected = state.classificacoes.forproexCodigos;

  return (
    <div>
      <div className="mb-12">
        <div className="font-display text-[11px] font-semibold tracking-[0.15em] opacity-40 mb-4">
          [ Cadastro · Etapa 05 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed opacity-70 max-w-[680px]">
          Selecione as{' '}
          <strong>Áreas Temáticas da Extensão (FORPROEX)</strong> que melhor
          caracterizam sua experiência. Padrão nacional para classificar
          projetos extensionistas. Você pode marcar mais de uma.
        </p>
      </div>

      <FieldGroup label="Áreas Temáticas FORPROEX" required>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
          {FORPROEX.map((f) => (
            <CategoryCard
              key={f.code}
              title={f.title}
              description={f.description}
              selected={selected.includes(f.code)}
              onClick={() =>
                dispatch({
                  type: 'TOGGLE_CLASSIFICATION',
                  key: 'forproexCodigos',
                  value: f.code
                })
              }
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

'use client';

import { FieldGroupTS } from '../FormFieldsTS';
import { CategoryCardTS } from '../CategoryCardTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

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

export function ForproexStepTS() {
  const { state, dispatch } = useCadastroForm();
  const selected = state.classificacoes.forproexCodigos;

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 05 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Selecione as{' '}
          <strong className="text-white font-semibold">
            Áreas Temáticas da Extensão (FORPROEX)
          </strong>{' '}
          que melhor caracterizam sua experiência. Padrão nacional para
          classificar projetos extensionistas. Você pode marcar mais de uma.
        </p>
      </div>

      <FieldGroupTS label="Áreas Temáticas FORPROEX" required>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {FORPROEX.map((f) => (
            <CategoryCardTS
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
      </FieldGroupTS>
    </div>
  );
}

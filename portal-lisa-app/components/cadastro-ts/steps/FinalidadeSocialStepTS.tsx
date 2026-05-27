'use client';

import { FieldGroupTS } from '../FormFieldsTS';
import { CategoryCardTS } from '../CategoryCardTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

const FINALIDADES = [
  {
    code: 'ISP',
    title: 'Inclusão Socioprodutiva',
    description: 'Geração de renda, cooperativismo, economia solidária'
  },
  {
    code: 'EDU',
    title: 'Educação e Formação',
    description: 'Metodologias pedagógicas, inclusão educacional, extensão'
  },
  {
    code: 'SAU',
    title: 'Saúde e Bem-estar',
    description: 'Promoção da saúde, prevenção, tecnologias comunitárias'
  },
  {
    code: 'HAB',
    title: 'Habitação e Infraestrutura',
    description: 'Moradia, saneamento, urbanismo social'
  },
  {
    code: 'AMB',
    title: 'Meio Ambiente e Sustentabilidade',
    description: 'Agroecologia, resíduos, energia social'
  },
  {
    code: 'DH',
    title: 'Direitos Humanos e Cidadania',
    description: 'Acesso à justiça, participação social'
  },
  {
    code: 'CUL',
    title: 'Cultura e Identidade',
    description: 'Patrimônio, expressões culturais, memória social'
  }
];

export function FinalidadeSocialStepTS() {
  const { state, dispatch } = useCadastroForm();
  const selected = state.classificacoes.finalidadeSocialCodigos;

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 04 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Selecione a{' '}
          <strong className="text-white font-semibold">
            finalidade social principal
          </strong>{' '}
          da sua experiência. Esta classificação é usada para organizar o
          catálogo de forma intuitiva. Você pode marcar mais de uma.
        </p>
      </div>

      <FieldGroupTS label="Finalidade Social" required>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FINALIDADES.map((f) => (
            <CategoryCardTS
              key={f.code}
              title={f.title}
              description={f.description}
              selected={selected.includes(f.code)}
              onClick={() =>
                dispatch({
                  type: 'TOGGLE_CLASSIFICATION',
                  key: 'finalidadeSocialCodigos',
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

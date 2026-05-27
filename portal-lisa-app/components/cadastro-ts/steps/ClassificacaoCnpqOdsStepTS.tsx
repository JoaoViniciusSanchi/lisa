'use client';

import { FieldGroupTS, FieldSelectTS } from '../FormFieldsTS';
import { OdsCardTS } from '../OdsCardTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

const GRANDES_AREAS = [
  'Ciências Exatas e da Terra',
  'Ciências Biológicas',
  'Engenharias',
  'Ciências da Saúde',
  'Ciências Agrárias',
  'Ciências Sociais Aplicadas',
  'Ciências Humanas',
  'Linguística, Letras e Artes',
  'Outros / Interdisciplinar'
];

const ODS_LIST: { id: number; name: string; complementar?: boolean }[] = [
  { id: 1, name: 'Erradicação da pobreza' },
  { id: 2, name: 'Fome zero' },
  { id: 3, name: 'Saúde e bem-estar' },
  { id: 4, name: 'Educação de qualidade' },
  { id: 5, name: 'Igualdade de gênero' },
  { id: 6, name: 'Água potável' },
  { id: 7, name: 'Energia limpa' },
  { id: 8, name: 'Trabalho decente' },
  { id: 9, name: 'Indústria e inovação' },
  { id: 10, name: 'Redução das desigualdades' },
  { id: 11, name: 'Cidades sustentáveis' },
  { id: 12, name: 'Consumo responsável' },
  { id: 13, name: 'Ação climática' },
  { id: 14, name: 'Vida na água' },
  { id: 15, name: 'Vida terrestre' },
  { id: 16, name: 'Paz e justiça' },
  { id: 17, name: 'Parcerias' },
  { id: 18, name: 'Igualdade Étnico-Racial', complementar: true },
  { id: 19, name: 'Arte, Cultura e Comunicação', complementar: true },
  { id: 20, name: 'Direitos dos Povos Originários', complementar: true }
];

const SUGESTOES_MACROAREA: Record<
  string,
  { cnpq: string; extensao: string; ods: string }
> = {
  MAC1: {
    cnpq: 'Ciências Humanas; Ciências Sociais Aplicadas',
    extensao: 'Direitos Humanos e Justiça; Educação; Cultura',
    ods: '1, 4, 5, 10, 16'
  },
  MAC2: {
    cnpq: 'Ciências Sociais Aplicadas; Engenharias',
    extensao: 'Trabalho; Tecnologia e Produção',
    ods: '8, 9'
  },
  MAC3: {
    cnpq: 'Ciências da Saúde; Ciências Biológicas',
    extensao: 'Saúde',
    ods: '3'
  },
  MAC4: {
    cnpq: 'Ciências Agrárias; Ciências Biológicas; Ciências Exatas e da Terra',
    extensao: 'Meio Ambiente',
    ods: '6, 7, 11, 12, 13, 14, 15'
  },
  MAC5: {
    cnpq: 'Engenharias; Ciências Sociais Aplicadas',
    extensao: 'Tecnologia e Produção; Direitos Humanos e Justiça',
    ods: '9, 11'
  },
  MAC6: {
    cnpq: 'Ciências Humanas; Linguística, Letras e Artes',
    extensao: 'Educação; Cultura; Comunicação',
    ods: '4, 10'
  },
  MAC7: {
    cnpq: 'Ciências Agrárias; Ciências da Saúde',
    extensao: 'Meio Ambiente; Saúde; Trabalho',
    ods: '2, 3, 12'
  },
  MAC8: {
    cnpq: 'Ciências Sociais Aplicadas',
    extensao: 'Direitos Humanos e Justiça',
    ods: '16, 17'
  }
};

export function ClassificacaoCnpqOdsStepTS() {
  const { state, dispatch } = useCadastroForm();
  const c = state.classificacoes;
  const sugestao = c.macroareaPrincipalCodigo
    ? SUGESTOES_MACROAREA[c.macroareaPrincipalCodigo]
    : null;

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 04 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Selecione a grande área do CNPq e os Objetivos de Desenvolvimento
          Sustentável (ODS) relacionados à sua experiência.
        </p>
        {sugestao && (
          <p className="mt-4 text-sm text-white/65 leading-relaxed max-w-[680px]">
            As sugestões abaixo são baseadas na macroarea que você escolheu.
            Você pode confirmar ou selecionar outras opções.
          </p>
        )}
      </div>

      {sugestao && (
        <div
          className="mb-10 px-5 py-4"
          style={{
            border: '1px solid rgba(12,113,195,0.3)',
            background: 'rgba(12,113,195,0.06)'
          }}
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-ts-accent mb-2">
            Sugestão baseada na macroarea selecionada
          </div>
          <div className="text-[12px] text-white/75 leading-relaxed">
            <strong className="text-white">CNPq:</strong> {sugestao.cnpq}{' '}
            &nbsp;·&nbsp; <strong className="text-white">Extensão:</strong>{' '}
            {sugestao.extensao} &nbsp;·&nbsp;{' '}
            <strong className="text-white">ODS:</strong> {sugestao.ods}
          </div>
        </div>
      )}

      <FieldGroupTS
        label="Grande área do CNPq (principal)"
        required
        hint="A subárea específica pode ser refinada pela equipe de moderação."
      >
        <FieldSelectTS
          value={c.cnpqGrandeAreaNome}
          onChange={(e) =>
            dispatch({
              type: 'SET_CLASSIFICATION',
              key: 'cnpqGrandeAreaNome',
              value: e.target.value
            })
          }
        >
          <option value="">Selecione a grande área</option>
          {GRANDES_AREAS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </FieldSelectTS>
      </FieldGroupTS>

      <FieldGroupTS
        label="Objetivos de Desenvolvimento Sustentável (ODS)"
        required
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {ODS_LIST.map((ods) => (
            <OdsCardTS
              key={ods.id}
              id={ods.id}
              name={ods.name}
              selected={c.odsIds.includes(ods.id)}
              complementar={ods.complementar}
              onClick={() =>
                dispatch({
                  type: 'TOGGLE_CLASSIFICATION',
                  key: 'odsIds',
                  value: ods.id
                })
              }
            />
          ))}
        </div>
        <p className="mt-4 text-[10px] text-white/40 leading-relaxed">
          * ODS 18, 19 e 20 são objetivos complementares do Portal LISA,
          reconhecidos pela AGIR/UFF mas não incluídos nos 17 oficiais da ONU.
        </p>
      </FieldGroupTS>
    </div>
  );
}

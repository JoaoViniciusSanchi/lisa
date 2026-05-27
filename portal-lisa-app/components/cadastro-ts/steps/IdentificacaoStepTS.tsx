'use client';

import { EyebrowTS } from '../EyebrowTS';
import { HairlineTS } from '../HairlineTS';
import {
  FieldGroupTS,
  FieldInputTS,
  FieldSelectTS
} from '../FormFieldsTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

const VINCULOS = [
  'Docente',
  'Técnico-administrativo',
  'Estudante de graduação',
  'Estudante de pós-graduação',
  'Pesquisador externo',
  'Membro da comunidade',
  'Representante de organização',
  'Outro'
];

export function IdentificacaoStepTS() {
  const { state, dispatch } = useCadastroForm();
  const i = state.identificacao;

  const set = (field: string, value: string) =>
    dispatch({ type: 'SET_FIELD', section: 'identificacao', field, value });

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 01 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Começamos pelos dados de identificação do coordenador responsável e,
          se houver, do vice-coordenador.
        </p>
      </div>

      <FieldGroupTS label="Nome completo do coordenador(a)" required>
        <FieldInputTS
          type="text"
          placeholder="Ex: Profa. Dra. Maria da Silva"
          value={i.coordNome}
          onChange={(e) => set('coordNome', e.target.value)}
        />
      </FieldGroupTS>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroupTS
          label="E-mail institucional"
          required
          hint="Preferencialmente e-mail institucional da UFF"
        >
          <FieldInputTS
            type="email"
            placeholder="coordenador@id.uff.br"
            value={i.coordEmail}
            onChange={(e) => set('coordEmail', e.target.value)}
          />
        </FieldGroupTS>

        <FieldGroupTS label="Telefone de contato">
          <FieldInputTS
            type="tel"
            placeholder="(21) 99999-9999"
            value={i.coordTelefone}
            onChange={(e) => set('coordTelefone', e.target.value)}
          />
        </FieldGroupTS>
      </div>

      <FieldGroupTS label="Link do Currículo Lattes">
        <FieldInputTS
          type="url"
          placeholder="http://lattes.cnpq.br/..."
          value={i.coordLattes}
          onChange={(e) => set('coordLattes', e.target.value)}
        />
      </FieldGroupTS>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroupTS label="Vínculo com a UFF" required>
          <FieldSelectTS
            value={i.coordVinculo}
            onChange={(e) => set('coordVinculo', e.target.value)}
          >
            <option value="">Selecione</option>
            {VINCULOS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </FieldSelectTS>
        </FieldGroupTS>

        <FieldGroupTS label="Departamento / Unidade">
          <FieldInputTS
            type="text"
            placeholder="Ex: Faculdade de Nutrição"
            value={i.coordDepartamento}
            onChange={(e) => set('coordDepartamento', e.target.value)}
          />
        </FieldGroupTS>
      </div>

      <HairlineTS className="my-10" />
      <EyebrowTS as="div" className="mb-6">
        Vice-coordenação (opcional)
      </EyebrowTS>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroupTS label="Nome do vice-coordenador(a)">
          <FieldInputTS
            type="text"
            placeholder="Nome completo"
            value={i.viceNome}
            onChange={(e) => set('viceNome', e.target.value)}
          />
        </FieldGroupTS>
        <FieldGroupTS label="E-mail do vice-coordenador(a)">
          <FieldInputTS
            type="email"
            placeholder="vice@id.uff.br"
            value={i.viceEmail}
            onChange={(e) => set('viceEmail', e.target.value)}
          />
        </FieldGroupTS>
      </div>
    </div>
  );
}

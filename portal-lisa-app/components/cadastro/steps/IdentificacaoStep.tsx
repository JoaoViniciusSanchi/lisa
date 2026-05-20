'use client';

import { Eyebrow } from '@/components/ui/Eyebrow';
import { Hairline } from '@/components/ui/Hairline';
import {
  FieldGroup,
  FieldInput,
  FieldSelect
} from '../FormFields';
import { useCadastroForm } from '../FormProvider';

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

export function IdentificacaoStep() {
  const { state, dispatch } = useCadastroForm();
  const i = state.identificacao;

  const set = (field: string, value: string) =>
    dispatch({ type: 'SET_FIELD', section: 'identificacao', field, value });

  return (
    <div>
      <div className="mb-12">
        <div className="font-display text-[11px] font-semibold tracking-[0.15em] opacity-40 mb-4">
          [ Cadastro · Etapa 01 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed opacity-70 max-w-[680px]">
          Começamos pelos dados de identificação do coordenador responsável e,
          se houver, do vice-coordenador.
        </p>
      </div>

      <FieldGroup label="Nome completo do coordenador(a)" required>
        <FieldInput
          type="text"
          placeholder="Ex: Profa. Dra. Maria da Silva"
          value={i.coordNome}
          onChange={(e) => set('coordNome', e.target.value)}
        />
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroup
          label="E-mail institucional"
          required
          hint="Preferencialmente e-mail institucional da UFF"
        >
          <FieldInput
            type="email"
            placeholder="coordenador@id.uff.br"
            value={i.coordEmail}
            onChange={(e) => set('coordEmail', e.target.value)}
          />
        </FieldGroup>

        <FieldGroup label="Telefone de contato">
          <FieldInput
            type="tel"
            placeholder="(21) 99999-9999"
            value={i.coordTelefone}
            onChange={(e) => set('coordTelefone', e.target.value)}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Link do Currículo Lattes">
        <FieldInput
          type="url"
          placeholder="http://lattes.cnpq.br/..."
          value={i.coordLattes}
          onChange={(e) => set('coordLattes', e.target.value)}
        />
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroup label="Vínculo com a UFF" required>
          <FieldSelect
            value={i.coordVinculo}
            onChange={(e) => set('coordVinculo', e.target.value)}
          >
            <option value="">Selecione</option>
            {VINCULOS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        <FieldGroup label="Departamento / Unidade">
          <FieldInput
            type="text"
            placeholder="Ex: Faculdade de Nutrição"
            value={i.coordDepartamento}
            onChange={(e) => set('coordDepartamento', e.target.value)}
          />
        </FieldGroup>
      </div>

      <Hairline className="my-10" />
      <Eyebrow as="div" className="mb-6">
        Vice-coordenação (opcional)
      </Eyebrow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroup label="Nome do vice-coordenador(a)">
          <FieldInput
            type="text"
            placeholder="Nome completo"
            value={i.viceNome}
            onChange={(e) => set('viceNome', e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="E-mail do vice-coordenador(a)">
          <FieldInput
            type="email"
            placeholder="vice@id.uff.br"
            value={i.viceEmail}
            onChange={(e) => set('viceEmail', e.target.value)}
          />
        </FieldGroup>
      </div>
    </div>
  );
}

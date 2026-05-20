'use client';

import {
  FieldGroup,
  FieldInput,
  FieldTextarea
} from '../FormFields';
import { useCadastroForm } from '../FormProvider';

export function ResultadosStep() {
  const { state, dispatch } = useCadastroForm();
  const r = state.resultados;

  const set = (field: string, value: string) =>
    dispatch({ type: 'SET_FIELD', section: 'resultados', field, value });

  return (
    <div>
      <div className="mb-12">
        <div className="font-display text-[11px] font-semibold tracking-[0.15em] opacity-40 mb-4">
          [ Cadastro · Etapa 07 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed opacity-70 max-w-[680px]">
          Descreva os resultados, impactos, desafios e perspectivas. Este
          conteúdo compõe diretamente a página da experiência no catálogo.
        </p>
      </div>

      <FieldGroup label="Resultados e impactos" required>
        <FieldTextarea
          rows={6}
          placeholder="Quais resultados concretos a experiência alcançou? Que impactos foram observados nos beneficiários e na comunidade?"
          value={r.resultadosImpactos}
          onChange={(e) => set('resultadosImpactos', e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Desafios e perspectivas" required>
        <FieldTextarea
          rows={6}
          placeholder="Quais os principais desafios enfrentados? Quais as perspectivas futuras da experiência?"
          value={r.desafiosPerspectivas}
          onChange={(e) => set('desafiosPerspectivas', e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Público beneficiado">
        <FieldTextarea
          rows={3}
          placeholder="Descreva o público atendido pela experiência..."
          value={r.publicoBeneficiado}
          onChange={(e) => set('publicoBeneficiado', e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Número estimado de pessoas atendidas">
        <FieldInput
          type="number"
          placeholder="Ex: 150"
          value={r.numPessoasAtendidas}
          onChange={(e) => set('numPessoasAtendidas', e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Fontes de financiamento">
        <FieldTextarea
          rows={3}
          placeholder="Editais, bolsas, recursos próprios, parcerias..."
          value={r.fontesFinanciamento}
          onChange={(e) => set('fontesFinanciamento', e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Parcerias">
        <FieldTextarea
          rows={3}
          placeholder="Organizações, instituições e comunidades parceiras..."
          value={r.parcerias}
          onChange={(e) => set('parcerias', e.target.value)}
        />
      </FieldGroup>
    </div>
  );
}

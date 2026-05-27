'use client';

import {
  FieldGroupTS,
  FieldInputTS,
  FieldTextareaTS,
  FieldSelectTS
} from '../FormFieldsTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

const STATUS_OPTIONS: Array<{
  value: 'em_andamento' | 'perene' | 'com_data_fim' | 'encerrada';
  label: string;
}> = [
  { value: 'em_andamento', label: 'Em andamento (sem previsão de encerramento)' },
  { value: 'perene', label: 'Perene (não tem previsão de fim por desenho)' },
  { value: 'com_data_fim', label: 'Com data de encerramento prevista' },
  { value: 'encerrada', label: 'Já encerrada' }
];

const CAMPI = [
  'Niterói',
  'Volta Redonda',
  'Campos dos Goytacazes',
  'Santo Antônio de Pádua',
  'Rio das Ostras',
  'Externa à UFF'
];

const CAMPUS_TO_LOCATION: Record<string, { municipio: string; uf: string }> = {
  Niterói: { municipio: 'Niterói', uf: 'RJ' },
  'Volta Redonda': { municipio: 'Volta Redonda', uf: 'RJ' },
  'Campos dos Goytacazes': { municipio: 'Campos dos Goytacazes', uf: 'RJ' },
  'Santo Antônio de Pádua': { municipio: 'Santo Antônio de Pádua', uf: 'RJ' },
  'Rio das Ostras': { municipio: 'Rio das Ostras', uf: 'RJ' }
};

export function ExperienciaStepTS() {
  const { state, dispatch } = useCadastroForm();
  const e = state.experiencia;

  const set = (field: string, value: string) =>
    dispatch({ type: 'SET_FIELD', section: 'experiencia', field, value });

  const isCampusUff = !!CAMPUS_TO_LOCATION[e.campus];

  function handleCampusChange(novoCampus: string) {
    set('campus', novoCampus);
    const loc = CAMPUS_TO_LOCATION[novoCampus];
    if (loc) {
      set('municipio', loc.municipio);
      set('uf', loc.uf);
    } else {
      set('municipio', '');
      set('uf', '');
    }
  }

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 02 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Apresente sua iniciativa. Esta descrição vai compor a ficha editorial
          da experiência no catálogo publicado.
        </p>
      </div>

      <FieldGroupTS label="Título da experiência" required>
        <FieldInputTS
          type="text"
          placeholder="Ex: Cozinha CuidAR: oficinas culinárias para saúde renal"
          value={e.titulo}
          onChange={(ev) => set('titulo', ev.target.value)}
        />
      </FieldGroupTS>

      <FieldGroupTS
        label="Histórico / Apresentação"
        required
        hint='Este texto aparece como "Histórico" na página da experiência no catálogo.'
      >
        <FieldTextareaTS
          rows={6}
          placeholder="Descreva o contexto, o problema social abordado, os objetivos e a descrição geral da experiência..."
          value={e.historico}
          onChange={(ev) => set('historico', ev.target.value)}
        />
      </FieldGroupTS>

      <FieldGroupTS label="Metodologia" required>
        <FieldTextareaTS
          rows={5}
          placeholder="Como a experiência funciona na prática? Descreva a abordagem metodológica e as atividades principais..."
          value={e.metodologia}
          onChange={(ev) => set('metodologia', ev.target.value)}
        />
      </FieldGroupTS>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroupTS label="Data de início" required>
          <FieldInputTS
            type="month"
            value={e.dataInicio}
            onChange={(ev) => set('dataInicio', ev.target.value)}
          />
        </FieldGroupTS>
        <FieldGroupTS label="Status da experiência" required>
          <FieldSelectTS
            value={e.statusExperiencia}
            onChange={(ev) => set('statusExperiencia', ev.target.value)}
          >
            <option value="">Selecione</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </FieldSelectTS>
        </FieldGroupTS>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FieldGroupTS
          label="Campus"
          hint={
            isCampusUff
              ? 'Município e UF foram preenchidos automaticamente.'
              : undefined
          }
        >
          <FieldSelectTS
            value={e.campus}
            onChange={(ev) => handleCampusChange(ev.target.value)}
          >
            <option value="">Selecione</option>
            {CAMPI.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FieldSelectTS>
        </FieldGroupTS>
        <FieldGroupTS label="Município">
          <FieldInputTS
            type="text"
            placeholder="Niterói"
            value={e.municipio}
            onChange={(ev) => set('municipio', ev.target.value)}
            readOnly={isCampusUff}
            aria-readonly={isCampusUff}
            className={isCampusUff ? 'opacity-70 cursor-not-allowed' : undefined}
          />
        </FieldGroupTS>
        <FieldGroupTS label="UF">
          <FieldInputTS
            type="text"
            placeholder="RJ"
            maxLength={2}
            value={e.uf}
            onChange={(ev) => set('uf', ev.target.value.toUpperCase())}
            readOnly={isCampusUff}
            aria-readonly={isCampusUff}
            className={isCampusUff ? 'opacity-70 cursor-not-allowed' : undefined}
          />
        </FieldGroupTS>
      </div>
    </div>
  );
}

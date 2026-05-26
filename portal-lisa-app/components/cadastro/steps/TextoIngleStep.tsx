'use client';

import { useState, useTransition } from 'react';
import { useCadastroForm } from '../FormProvider';

interface Field {
  key: 'titulo' | 'historico' | 'metodologia' | 'resultadosImpactos' | 'desafiosPerspectivas';
  labelPT: string;
  labelEN: string;
  multiline?: boolean;
}

const FIELDS: Field[] = [
  { key: 'titulo', labelPT: 'Título (PT)', labelEN: 'Title (EN)' },
  { key: 'historico', labelPT: 'Histórico (PT)', labelEN: 'Background (EN)', multiline: true },
  { key: 'metodologia', labelPT: 'Metodologia (PT)', labelEN: 'Methodology (EN)', multiline: true },
  { key: 'resultadosImpactos', labelPT: 'Resultados e Impactos (PT)', labelEN: 'Results and Impacts (EN)', multiline: true },
  { key: 'desafiosPerspectivas', labelPT: 'Desafios e Perspectivas (PT)', labelEN: 'Challenges and Perspectives (EN)', multiline: true }
];

// Mapeia field.key para a prop do estado experiencia (PT)
const PT_FIELD_MAP: Record<Field['key'], string> = {
  titulo: 'titulo',
  historico: 'historico',
  metodologia: 'metodologia',
  resultadosImpactos: 'resultadosImpactos',
  desafiosPerspectivas: 'desafiosPerspectivas'
};

export function TextoIngleStep() {
  const { state, dispatch } = useCadastroForm();
  const [isPending, startTransition] = useTransition();
  const [gerandoField, setGerandoField] = useState<string | null>(null);
  const [gerarErro, setGerarErro] = useState<string | null>(null);

  function getPtValue(key: Field['key']): string {
    if (key === 'titulo') return state.experiencia.titulo;
    if (key === 'historico') return state.experiencia.historico;
    if (key === 'metodologia') return state.experiencia.metodologia;
    if (key === 'resultadosImpactos') return state.resultados.resultadosImpactos;
    if (key === 'desafiosPerspectivas') return state.resultados.desafiosPerspectivas;
    return '';
  }

  function getEnValue(key: Field['key']): string {
    return state.experienciaEN[key] ?? '';
  }

  function handleChange(key: Field['key'], value: string) {
    dispatch({ type: 'SET_FIELD_EN', field: key, value });
  }

  async function handleGerarTodos() {
    setGerarErro(null);
    setGerandoField('todos');
    startTransition(async () => {
      try {
        const ptTextos = {
          titulo: getPtValue('titulo'),
          historico: getPtValue('historico'),
          metodologia: getPtValue('metodologia'),
          resultadosImpactos: getPtValue('resultadosImpactos'),
          desafiosPerspectivas: getPtValue('desafiosPerspectivas')
        };

        const res = await fetch('/api/regerar-traducao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textos: ptTextos, conviteToken: state.conviteToken })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? `Erro ${res.status}`);
        }

        const data = await res.json();
        dispatch({
          type: 'SET_EXPERIENCIA_EN',
          data: {
            titulo: data.titulo ?? '',
            historico: data.historico ?? '',
            metodologia: data.metodologia ?? '',
            resultadosImpactos: data.resultadosImpactos ?? '',
            desafiosPerspectivas: data.desafiosPerspectivas ?? ''
          }
        });
      } catch (e) {
        setGerarErro(e instanceof Error ? e.message : 'Erro ao gerar tradução');
      } finally {
        setGerandoField(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-warm-white mb-2">
          Texto em inglês
        </h2>
        <p className="text-warm-white/60 text-[14px] leading-relaxed">
          Revise e ajuste a tradução automática dos campos abaixo. Você pode usar o botão
          &ldquo;Gerar com DeepL&rdquo; para preencher campos vazios ou regenerar toda a tradução.
        </p>
      </div>

      {/* Botão gerar tudo */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleGerarTodos}
          disabled={isPending && gerandoField === 'todos'}
          className="flex items-center gap-2 bg-accent/20 border border-accent/40 text-accent px-4 py-2 text-[13px] hover:bg-accent/30 transition-colors disabled:opacity-50"
        >
          {isPending && gerandoField === 'todos' ? (
            <>
              <span className="animate-spin">⟳</span>
              Gerando…
            </>
          ) : (
            <>
              🌐 Gerar / Regenerar tudo com DeepL
            </>
          )}
        </button>
        {gerarErro && (
          <span className="text-danger text-xs">{gerarErro}</span>
        )}
      </div>

      {/* Campos side-by-side PT | EN */}
      {FIELDS.map((f) => {
        const ptVal = getPtValue(f.key);
        const enVal = getEnValue(f.key);

        return (
          <div key={f.key} className="border border-line bg-bg-elevated">
            <div className="grid grid-cols-2 divide-x divide-line">
              {/* PT — leitura */}
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 mb-2">
                  {f.labelPT}
                </div>
                {f.multiline ? (
                  <div className="text-[13px] text-warm-white/60 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                    {ptVal || <span className="italic opacity-40">(vazio)</span>}
                  </div>
                ) : (
                  <div className="text-[13px] text-warm-white/60">
                    {ptVal || <span className="italic opacity-40">(vazio)</span>}
                  </div>
                )}
              </div>

              {/* EN — editável */}
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-eyebrow text-accent/60 mb-2">
                  {f.labelEN}
                </div>
                {f.multiline ? (
                  <textarea
                    value={enVal}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    rows={Math.max(4, Math.ceil(ptVal.length / 80))}
                    placeholder="Aguardando tradução…"
                    className="w-full bg-transparent border border-line text-warm-white text-[13px] px-3 py-2 outline-none focus:border-accent resize-none transition-colors placeholder:text-warm-white/20"
                  />
                ) : (
                  <input
                    type="text"
                    value={enVal}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder="Aguardando tradução…"
                    className="w-full bg-transparent border border-line text-warm-white text-[13px] px-3 py-2 outline-none focus:border-accent transition-colors placeholder:text-warm-white/20"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-warm-white/30 text-xs">
        Os campos PT acima são somente leitura. Para alterá-los, volte às etapas anteriores.
      </p>
    </div>
  );
}

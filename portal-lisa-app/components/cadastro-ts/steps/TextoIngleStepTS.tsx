'use client';

import { useState, useTransition } from 'react';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

interface Field {
  key:
    | 'titulo'
    | 'historico'
    | 'metodologia'
    | 'resultadosImpactos'
    | 'desafiosPerspectivas';
  labelPT: string;
  labelEN: string;
  multiline?: boolean;
}

const FIELDS: Field[] = [
  { key: 'titulo', labelPT: 'Título (PT)', labelEN: 'Title (EN)' },
  {
    key: 'historico',
    labelPT: 'Histórico (PT)',
    labelEN: 'Background (EN)',
    multiline: true
  },
  {
    key: 'metodologia',
    labelPT: 'Metodologia (PT)',
    labelEN: 'Methodology (EN)',
    multiline: true
  },
  {
    key: 'resultadosImpactos',
    labelPT: 'Resultados e Impactos (PT)',
    labelEN: 'Results and Impacts (EN)',
    multiline: true
  },
  {
    key: 'desafiosPerspectivas',
    labelPT: 'Desafios e Perspectivas (PT)',
    labelEN: 'Challenges and Perspectives (EN)',
    multiline: true
  }
];

export function TextoIngleStepTS() {
  const { state, dispatch } = useCadastroForm();
  const [isPending, startTransition] = useTransition();
  const [gerandoField, setGerandoField] = useState<string | null>(null);
  const [gerarErro, setGerarErro] = useState<string | null>(null);

  function getPtValue(key: Field['key']): string {
    if (key === 'titulo') return state.experiencia.titulo;
    if (key === 'historico') return state.experiencia.historico;
    if (key === 'metodologia') return state.experiencia.metodologia;
    if (key === 'resultadosImpactos') return state.resultados.resultadosImpactos;
    if (key === 'desafiosPerspectivas')
      return state.resultados.desafiosPerspectivas;
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
          body: JSON.stringify({
            textos: ptTextos,
            conviteToken: state.conviteToken
          })
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
    <div className="space-y-6 font-nunito">
      <div>
        <h2 className="font-nunito text-xl font-bold text-white mb-2">
          Texto em inglês
        </h2>
        <p className="text-white/65 text-[14px] leading-relaxed">
          Revise e ajuste a tradução automática dos campos abaixo. Você pode
          usar o botão &ldquo;Gerar com DeepL&rdquo; para preencher campos
          vazios ou regenerar toda a tradução.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleGerarTodos}
          disabled={isPending && gerandoField === 'todos'}
          className="flex items-center gap-2 bg-ts-accent/20 border border-ts-accent/50 text-ts-accent px-4 py-2 text-[13px] hover:bg-ts-accent/30 transition-colors disabled:opacity-50 font-nunito"
        >
          {isPending && gerandoField === 'todos' ? (
            <>
              <span className="animate-spin">⟳</span>
              Gerando…
            </>
          ) : (
            <>🌐 Gerar / Regenerar tudo com DeepL</>
          )}
        </button>
        {gerarErro && <span className="text-danger text-xs">{gerarErro}</span>}
      </div>

      {FIELDS.map((f) => {
        const ptVal = getPtValue(f.key);
        const enVal = getEnValue(f.key);

        return (
          <div key={f.key} className="border border-white/10 bg-ts-mid">
            <div className="grid grid-cols-2 divide-x divide-white/10">
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-eyebrow text-white/45 mb-2">
                  {f.labelPT}
                </div>
                {f.multiline ? (
                  <div className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                    {ptVal || (
                      <span className="italic opacity-40">(vazio)</span>
                    )}
                  </div>
                ) : (
                  <div className="text-[13px] text-white/70">
                    {ptVal || (
                      <span className="italic opacity-40">(vazio)</span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="text-[11px] uppercase tracking-eyebrow text-ts-accent/80 mb-2">
                  {f.labelEN}
                </div>
                {f.multiline ? (
                  <textarea
                    value={enVal}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    rows={Math.max(4, Math.ceil(ptVal.length / 80))}
                    placeholder="Aguardando tradução…"
                    className="w-full bg-transparent border border-white/15 text-white text-[13px] px-3 py-2 outline-none focus:border-ts-accent resize-none transition-colors placeholder:text-white/25 font-nunito"
                  />
                ) : (
                  <input
                    type="text"
                    value={enVal}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder="Aguardando tradução…"
                    className="w-full bg-transparent border border-white/15 text-white text-[13px] px-3 py-2 outline-none focus:border-ts-accent transition-colors placeholder:text-white/25 font-nunito"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-white/35 text-xs">
        Os campos PT acima são somente leitura. Para alterá-los, volte às
        etapas anteriores.
      </p>
    </div>
  );
}

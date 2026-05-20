'use client';

import ExperienciaReviewCard from './ExperienciaReviewCard';
import type { ExperienciaImport } from '@/lib/import/types';

interface AnalysisError {
  index: number;
  title: string;
  message: string;
}

interface Props {
  experiences: ExperienciaImport[];
  errors?: AnalysisError[];
  onChange: (updated: ExperienciaImport[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function ReviewStep({ experiences, errors = [], onChange, onComplete, onBack }: Props) {
  if (experiences.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-16">
        <div>
          <h2 className="text-lg font-semibold text-warm-white">Passo 5 — Revisão</h2>
          <p className="text-[13px] text-warm-white/50 mt-2">
            Nenhuma experiência foi analisada com sucesso.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-950/20 border border-red-700/40 rounded p-4 text-left space-y-3">
            <div className="text-[13px] font-semibold text-red-400">
              {errors.length} {errors.length === 1 ? 'erro encontrado' : 'erros encontrados'}:
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {errors.map((err, idx) => (
                <div key={idx} className="text-[12px] border-l-2 border-red-600/40 pl-3 py-1">
                  <div className="text-red-300 font-semibold">Linha {err.index}: {err.title}</div>
                  <div className="text-red-200/70 mt-1 break-words">{err.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-yellow-950/20 border border-yellow-700/40 rounded p-3">
          <p className="text-[12px] text-yellow-300">
            💡 <strong>Dicas:</strong>
            <br/>
            • Se vir &quot;503 Service Unavailable&quot;: a API Gemini está congestionada. Tente novamente em alguns minutos.
            <br/>
            • Se vir &quot;No matching&quot;: verifique se os campos do CSV estão corretamente mapeados.
            <br/>
            • Corrija o CSV ou mapeamento e tente novamente.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-[13px] text-warm-white/50 border border-line rounded hover:text-warm-white transition-colors"
        >
          ← Voltar à análise
        </button>
      </div>
    );
  }

  const approved = experiences.filter((e) => e._meta.reviewStatus === 'approved').length;
  const removed = experiences.filter((e) => e._meta.reviewStatus === 'removed').length;
  const pending = experiences.filter((e) => e._meta.reviewStatus === 'pending').length;
  const resumidos = experiences.filter((e) =>
    Object.values(e._meta.textsResumidos).some((v) => v != null)
  ).length;

  function handleChange(idx: number, updated: ExperienciaImport) {
    const next = [...experiences];
    next[idx] = updated;
    onChange(next);
  }

  function approveAll() {
    onChange(
      experiences.map((e) =>
        e._meta.reviewStatus === 'pending' ? { ...e, _meta: { ...e._meta, reviewStatus: 'approved' } } : e
      )
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-warm-white mb-1">Passo 5 — Revisão</h2>
          <p className="text-[13px] text-warm-white/50">
            Revise cada experiência antes de gerar o SQL. Edite campos, ajuste os sliders EFITS e
            aprove ou remova cada projeto.
          </p>
        </div>

        {pending > 0 && (
          <button
            type="button"
            onClick={approveAll}
            className="text-[12px] text-accent hover:underline flex-shrink-0 ml-4"
          >
            Aprovar todos os pendentes
          </button>
        )}
      </div>

      {/* Sumário */}
      <div className="flex gap-4 text-[12px]">
        <span className="text-green-400">{approved} aprovadas</span>
        <span className="text-warm-white/40">{pending} pendentes</span>
        <span className="text-red-400/70">{removed} removidas</span>
        {resumidos > 0 && (
          <span className="text-yellow-400/80">{resumidos} com texto resumido</span>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {experiences.map((exp, idx) => (
          <ExperienciaReviewCard
            key={idx}
            exp={exp}
            onChange={(updated) => handleChange(idx, updated)}
          />
        ))}
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-4 border-t border-line sticky bottom-0 bg-bg-base py-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-[13px] text-warm-white/50 border border-line rounded hover:text-warm-white transition-colors"
        >
          Voltar
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onComplete}
          disabled={approved === 0}
          className="px-8 py-2.5 text-[13px] bg-accent text-bg-base font-semibold rounded hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Gerar SQL para {approved} experiência{approved !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { calcFuzzyIndex } from '@/lib/fuzzy/engine';
import { DEFAULT_FUZZY_CONFIG, DIMENSIONS } from '@/lib/fuzzy/types';
import type { ExperienciaImport, StatusImportado } from '@/lib/import/types';
import type { DimensionKey } from '@/lib/fuzzy/types';

interface Props {
  exp: ExperienciaImport;
  onChange: (updated: ExperienciaImport) => void;
}

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  P: 'Participação (P)',
  I: 'Impacto Social (I)',
  A: 'Apropriação (A)',
  S: 'Sustentabilidade (S)',
  R: 'Replicabilidade (R)'
};

const STATUS_OPTIONS: Array<{ value: StatusImportado; label: string }> = [
  { value: 'aprovada_ativa_em_andamento', label: 'Aprovada — Em andamento' },
  { value: 'aprovada_ativa_perene', label: 'Aprovada — Perene' },
  { value: 'aprovada_encerrada', label: 'Aprovada — Encerrada' },
  { value: 'em_moderacao', label: 'Manter em moderação' }
];

function FaixaBadge({ faixa }: { faixa: string }) {
  const cls =
    faixa === 'verde'
      ? 'bg-green-500/20 text-green-400'
      : faixa === 'amarelo'
        ? 'bg-yellow-500/20 text-yellow-400'
        : 'bg-red-500/20 text-red-400';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${cls}`}>{faixa}</span>
  );
}

export default function ExperienciaReviewCard({ exp, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'identificacao' | 'textos' | 'classificacoes' | 'efits'>(
    'identificacao'
  );

  const resumidos = exp._meta.textsResumidos;
  const hasResumidos = Object.values(resumidos).some((v) => v != null);
  const hasInsuficientes = Object.values(exp._meta.textos_insuficientes ?? {}).some(Boolean);

  function update(patch: Partial<ExperienciaImport>) {
    onChange({ ...exp, ...patch });
  }

  function updateMeta(patch: Partial<ExperienciaImport['_meta']>) {
    onChange({ ...exp, _meta: { ...exp._meta, ...patch } });
  }

  function updateSlider(dim: DimensionKey, qIdx: number, value: number) {
    const newAnswers = { ...exp.fuzzyAnswers };
    const arr = [...newAnswers[dim]] as [number, number, number, number];
    arr[qIdx] = value;
    newAnswers[dim] = arr;
    const newResult = calcFuzzyIndex(newAnswers, DEFAULT_FUZZY_CONFIG);
    onChange({ ...exp, fuzzyAnswers: newAnswers, fuzzyResult: newResult });
  }

  function handleTextField(
    field: 'historico' | 'metodologia' | 'resultadosImpactos' | 'desafiosPerspectivas',
    value: string
  ) {
    update({ [field]: value.slice(0, 3000) });
  }

  const fr = exp.fuzzyResult;
  const approved = exp._meta.reviewStatus === 'approved';
  const removed = exp._meta.reviewStatus === 'removed';

  return (
    <div
      className={`border rounded-lg transition-colors ${
        approved
          ? 'border-green-500/40 bg-green-500/5'
          : removed
            ? 'border-red-500/30 bg-red-500/5 opacity-60'
            : 'border-line bg-bg-elevated'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-warm-white truncate">
              {exp.titulo || 'Sem título'}
            </span>
            <FaixaBadge faixa={fr.faixa} />
            <span className="text-[11px] text-warm-white/40">
              EFITS {fr.indice_fuzzy.toFixed(3)}
            </span>
            {hasResumidos && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                texto resumido
              </span>
            )}
            {hasInsuficientes && (
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                ⚠ preencher textos
              </span>
            )}
          </div>
          <div className="text-[11px] text-warm-white/40 mt-0.5">
            Linha {exp._meta.csvRowIndex + 1}
            {exp._meta.docxSource && ` · ${exp._meta.docxSource}`}
          </div>
        </div>

        {/* Status / Ações */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!removed && (
            <>
              <select
                value={exp.statusImportado}
                onChange={(e) => update({ statusImportado: e.target.value as StatusImportado })}
                className="bg-bg-base border border-line rounded px-2 py-1 text-[11px] text-warm-white/70"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {!approved && (
                <button
                  type="button"
                  onClick={() => updateMeta({ reviewStatus: 'approved' })}
                  className="px-3 py-1 text-[11px] bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                >
                  Aprovar
                </button>
              )}
              {approved && (
                <button
                  type="button"
                  onClick={() => updateMeta({ reviewStatus: 'pending' })}
                  className="px-3 py-1 text-[11px] bg-green-500/30 text-green-400 rounded"
                >
                  ✓ Aprovado
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() =>
              updateMeta({
                reviewStatus: removed ? 'pending' : 'removed'
              })
            }
            className={`px-3 py-1 text-[11px] rounded transition-colors ${
              removed
                ? 'bg-white/10 text-warm-white/50 hover:bg-white/15'
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {removed ? 'Desfazer' : 'Remover'}
          </button>

          <span className="text-warm-white/30 text-[12px] select-none">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {open && !removed && (
        <div className="border-t border-line">
          {/* Tabs */}
          <div className="flex border-b border-line px-5">
            {(['identificacao', 'textos', 'classificacoes', 'efits'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-[12px] transition-colors border-b-2 -mb-px capitalize ${
                  tab === t
                    ? 'border-accent text-accent'
                    : 'border-transparent text-warm-white/40 hover:text-warm-white/70'
                }`}
              >
                {t === 'identificacao' ? 'Identificação' : t === 'textos' ? 'Textos' : t === 'classificacoes' ? 'Classificações' : 'EFITS'}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">
            {/* ---- IDENTIFICAÇÃO ---- */}
            {tab === 'identificacao' && (
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Título"
                  value={exp.titulo}
                  onChange={(v) => update({ titulo: v })}
                  className="col-span-2"
                />
                <Field
                  label="Resumo (max 280)"
                  value={exp.resumo}
                  onChange={(v) => update({ resumo: v.slice(0, 280) })}
                  className="col-span-2"
                  counter={{ current: exp.resumo.length, max: 280 }}
                />
                <Field label="E-mail de contato" value={exp.emailContato} onChange={(v) => update({ emailContato: v })} />
                <Field label="Campus UFF" value={exp.campusUff ?? ''} onChange={(v) => update({ campusUff: v })} />
                <Field label="Município" value={exp.municipio ?? ''} onChange={(v) => update({ municipio: v })} />
                <Field label="UF" value={exp.uf ?? ''} onChange={(v) => update({ uf: v })} />
                <Field label="Data início" value={exp.dataInicio ?? ''} onChange={(v) => update({ dataInicio: v || undefined })} placeholder="YYYY-MM-DD" />
                <Field label="Data fim" value={exp.dataFim ?? ''} onChange={(v) => update({ dataFim: v || undefined })} placeholder="YYYY-MM-DD" />
                <div className="flex items-center gap-2 col-span-2">
                  <input
                    type="checkbox"
                    id={`perene-${exp._meta.csvRowIndex}`}
                    checked={exp.isPerene}
                    onChange={(e) => update({ isPerene: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`perene-${exp._meta.csvRowIndex}`} className="text-[12px] text-warm-white/70">
                    Projeto perene (sem previsão de encerramento)
                  </label>
                </div>
                <Divider label="Coordenador" className="col-span-2" />
                <Field label="Nome" value={exp.coordenador.nome} onChange={(v) => update({ coordenador: { ...exp.coordenador, nome: v } })} />
                <Field label="E-mail" value={exp.coordenador.email} onChange={(v) => update({ coordenador: { ...exp.coordenador, email: v } })} />
                <Field label="Telefone" value={exp.coordenador.telefone ?? ''} onChange={(v) => update({ coordenador: { ...exp.coordenador, telefone: v || undefined } })} />
                <Field label="Lattes" value={exp.coordenador.lattes_url ?? ''} onChange={(v) => update({ coordenador: { ...exp.coordenador, lattes_url: v || undefined } })} />
                <Field label="Departamento" value={exp.coordenador.departamento ?? ''} onChange={(v) => update({ coordenador: { ...exp.coordenador, departamento: v || undefined } })} />
              </div>
            )}

            {/* ---- TEXTOS ---- */}
            {tab === 'textos' && (
              <div className="space-y-4">
                {(['historico', 'metodologia', 'resultadosImpactos', 'desafiosPerspectivas'] as const).map((f) => {
                  const resumido = resumidos[f as keyof typeof resumidos];
                  const insuficiente = exp._meta.textos_insuficientes?.[f as keyof typeof exp._meta.textos_insuficientes];
                  const labels = {
                    historico: 'Histórico',
                    metodologia: 'Metodologia',
                    resultadosImpactos: 'Resultados e Impactos',
                    desafiosPerspectivas: 'Desafios e Perspectivas'
                  };
                  const value = exp[f];
                  return (
                    <div key={f}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="text-[12px] text-warm-white/60 font-medium">
                          {labels[f]} <span className="text-warm-white/30">(max 3000)</span>
                        </label>
                        {resumido && (
                          <span
                            className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded cursor-help"
                            title={`Texto original tinha ${resumido.originalChars} caracteres. Foi resumido pela IA.`}
                          >
                            resumido · {resumido.originalChars} → {value.length} chars
                          </span>
                        )}
                        {insuficiente && (
                          <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                            ⚠ dados insuficientes
                          </span>
                        )}
                      </div>
                      {insuficiente && (
                        <div className="mb-2 px-3 py-2 rounded border border-orange-500/30 bg-orange-500/10 text-[12px] text-orange-300/80">
                          A IA não encontrou referências suficientes para gerar este campo. Preencha manualmente com base no projeto.
                        </div>
                      )}
                      <textarea
                        value={value}
                        onChange={(e) => handleTextField(f, e.target.value)}
                        rows={6}
                        className={`w-full bg-bg-base border rounded px-3 py-2 text-[12px] text-warm-white/80 resize-y ${
                          insuficiente ? 'border-orange-500/40' : 'border-line'
                        }`}
                      />
                      <div className="text-right text-[10px] text-warm-white/30 mt-0.5">
                        {value.length}/3000
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---- CLASSIFICAÇÕES ---- */}
            {tab === 'classificacoes' && (
              <div className="space-y-3 text-[12px]">
                <ClassField label="Categoria Editorial" value={exp.categoriaEditorial ?? '—'} />
                <ClassField
                  label="ODS"
                  value={exp.ods.map((o) => `${o.id}${o.isPrincipal ? ' (principal)' : ''}`).join(', ') || '—'}
                />
                <ClassField
                  label="FORPROEX"
                  value={exp.forproexCodigos.join(', ') || '—'}
                />
                <ClassField
                  label="Finalidade Social"
                  value={exp.finalidadeSocialCodigos.join(', ') || '—'}
                />
                <ClassField
                  label="Público Alvo"
                  value={exp.publicoAlvoCodigos.join(', ') || '—'}
                />
                <ClassField
                  label="Tipo Solução"
                  value={exp.tipoSolucaoCodigos.join(', ') || '—'}
                />
                <ClassField
                  label="Arranjo Institucional"
                  value={exp.arranjoCodigos.join(', ') || '—'}
                />
                <ClassField
                  label="CNPq Subareas"
                  value={exp.cnpqSubareas.map((s) => `${s.codigo}${s.isPrincipal ? ' (principal)' : ''}`).join(', ') || '—'}
                />
                <p className="text-warm-white/30 text-[11px] pt-2">
                  Edição de classificações via sliders EFITS na aba correspondente. Outras
                  classificações podem ser corrigidas no dashboard admin após a importação.
                </p>
              </div>
            )}

            {/* ---- EFITS ---- */}
            {tab === 'efits' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-2 border-b border-line">
                  <div>
                    <div className="text-[11px] text-warm-white/40 uppercase tracking-wider">Índice Fuzzy</div>
                    <div className="text-xl font-bold text-warm-white">
                      {fr.indice_fuzzy.toFixed(3)}
                    </div>
                  </div>
                  <FaixaBadge faixa={fr.faixa} />
                  <div className="ml-4 text-[11px] text-warm-white/40">
                    Linear: {fr.indice_linear.toFixed(3)}
                  </div>
                </div>

                {DIMENSIONS.map((dim) => (
                  <div key={dim}>
                    <div className="text-[12px] font-medium text-warm-white/70 mb-2">
                      {DIMENSION_LABELS[dim]}
                      <span className="ml-2 text-[11px] text-warm-white/30">
                        média: {fr.medias[dim].toFixed(1)}
                      </span>
                    </div>
                    {[0, 1, 2, 3].map((qi) => (
                      <div key={qi} className="flex items-center gap-3 mb-2">
                        <span className="text-[11px] text-warm-white/40 w-5 text-right">
                          {dim}{qi + 1}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={10}
                          step={0.5}
                          value={exp.fuzzyAnswers[dim][qi]}
                          onChange={(e) => updateSlider(dim, qi, parseFloat(e.target.value))}
                          className="flex-1 accent-accent"
                        />
                        <span className="text-[12px] text-warm-white/70 w-8 text-right">
                          {exp.fuzzyAnswers[dim][qi].toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-componentes utilitários ---

function Field({
  label,
  value,
  onChange,
  className,
  placeholder,
  counter
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  counter?: { current: number; max: number };
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] text-warm-white/50 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-base border border-line rounded px-3 py-1.5 text-[12px] text-warm-white/80"
      />
      {counter && (
        <div className="text-right text-[10px] text-warm-white/30 mt-0.5">
          {counter.current}/{counter.max}
        </div>
      )}
    </div>
  );
}

function ClassField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-warm-white/40 w-40 flex-shrink-0">{label}:</span>
      <span className="text-warm-white/70">{value}</span>
    </div>
  );
}

function Divider({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[11px] text-warm-white/40 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

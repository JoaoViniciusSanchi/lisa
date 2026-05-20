'use client';

import { useState, useCallback } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import UploadStep from '@/components/admin/importar/UploadStep';
import MatchingStep from '@/components/admin/importar/MatchingStep';
import MappingStep from '@/components/admin/importar/MappingStep';
import AnalysisStep from '@/components/admin/importar/AnalysisStep';
import ReviewStep from '@/components/admin/importar/ReviewStep';
import SqlStep from '@/components/admin/importar/SqlStep';
import { generateImportSql } from '@/lib/import/sql-generator';
import type { WizardState, CsvRow, DocxMatch, FieldMapping, ExperienciaImport } from '@/lib/import/types';

const STEP_LABELS = ['Upload', 'Associação', 'Mapeamento', 'Análise', 'Revisão', 'SQL'];
const STEP_KEYS: WizardState['step'][] = ['upload', 'matching', 'mapping', 'analysis', 'review', 'sql'];

function initialState(): WizardState {
  return {
    step: 'upload',
    csvRows: [],
    csvHeaders: [],
    docxFiles: [],
    docxMatches: [],
    fieldMapping: {},
    experiences: [],
    analysisProgress: { current: 0, total: 0, currentTitle: '' },
    generatedSql: ''
  };
}

interface AnalysisError {
  index: number;
  title: string;
  message: string;
}

export default function ImportarPage() {
  const [state, setState] = useState<WizardState>(initialState);
  const [analysisErrors, setAnalysisErrors] = useState<AnalysisError[]>([]);

  function setStep(step: WizardState['step']) {
    setState((s) => ({ ...s, step }));
  }

  // ---- Handlers de cada passo ----

  function onUploadComplete(csvRows: CsvRow[], csvHeaders: string[], docxFiles: File[]) {
    setState((s) => ({
      ...s,
      csvRows,
      csvHeaders,
      docxFiles,
      step: docxFiles.length > 0 ? 'matching' : 'mapping'
    }));
  }

  function onMatchingComplete(matches: DocxMatch[]) {
    setState((s) => ({ ...s, docxMatches: matches, step: 'mapping' }));
  }

  function onMappingComplete(mapping: FieldMapping) {
    setState((s) => ({
      ...s,
      fieldMapping: mapping,
      step: 'analysis',
      analysisProgress: { current: 0, total: s.csvRows.length, currentTitle: '' }
    }));
    setAnalysisErrors([]); // limpa erros anteriores
  }

  const onAnalysisProgress = useCallback(
    (progress: WizardState['analysisProgress']) => {
      setState((s) => ({ ...s, analysisProgress: progress }));
    },
    []
  );

  function onAnalysisComplete(experiences: ExperienciaImport[], errors?: AnalysisError[]) {
    setAnalysisErrors(errors || []);
    setState((s) => ({ ...s, experiences, step: 'review' }));
  }

  function onExperiencesChange(experiences: ExperienciaImport[]) {
    setState((s) => ({ ...s, experiences }));
  }

  async function onReviewComplete() {
    try {
      // Obtém o próximo número sequencial do banco
      const sb = createBrowserSupabase();
      const { count } = await sb.from('experiencia').select('*', { count: 'exact', head: true });
      const startSeq = (count ?? 0) + 1;

      // Gera SQL com sequência única
      const sql = generateImportSql(state.experiences, startSeq);
      setState((s) => ({ ...s, generatedSql: sql, step: 'sql' }));
    } catch (e) {
      console.error('Erro ao buscar sequência:', e);
      // Fallback: usa sequência default
      const sql = generateImportSql(state.experiences, 1);
      setState((s) => ({ ...s, generatedSql: sql, step: 'sql' }));
    }
  }

  function onReset() {
    setState(initialState());
  }

  const stepIndex = STEP_KEYS.indexOf(state.step);

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-display font-bold text-warm-white">
          Importação de Experiências
        </h1>
        <p className="text-[13px] text-warm-white/50 mt-1">
          Importe projetos do catálogo anterior (Google Sheets + .docx) para o banco de dados do
          Portal LISA.
        </p>
      </div>

      {/* Indicador de passos */}
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, idx) => {
          const isActive = idx === stepIndex;
          const isDone = idx < stepIndex;
          return (
            <div key={idx} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent/20 text-accent font-semibold'
                    : isDone
                      ? 'text-warm-white/50'
                      : 'text-warm-white/20'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isActive
                      ? 'bg-accent text-bg-base'
                      : isDone
                        ? 'bg-white/20 text-warm-white/60'
                        : 'bg-white/5 text-warm-white/20'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                {label}
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <span className="text-warm-white/20 px-1 text-[10px]">›</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Conteúdo do passo atual */}
      <div className="min-h-[400px]">
        {state.step === 'upload' && (
          <UploadStep onComplete={onUploadComplete} />
        )}

        {state.step === 'matching' && (
          <MatchingStep
            csvRows={state.csvRows}
            csvHeaders={state.csvHeaders}
            docxFiles={state.docxFiles}
            onComplete={onMatchingComplete}
            onBack={() => setStep('upload')}
          />
        )}

        {state.step === 'mapping' && (
          <MappingStep
            csvHeaders={state.csvHeaders}
            csvRows={state.csvRows}
            onComplete={onMappingComplete}
            onBack={() => setStep(state.docxFiles.length > 0 ? 'matching' : 'upload')}
          />
        )}

        {state.step === 'analysis' && (
          <AnalysisStep
            csvRows={state.csvRows}
            docxMatches={state.docxMatches}
            mapping={state.fieldMapping}
            progress={state.analysisProgress}
            onComplete={onAnalysisComplete}
            onProgress={onAnalysisProgress}
            onBack={() => setStep('mapping')}
          />
        )}

        {state.step === 'review' && (
          <ReviewStep
            experiences={state.experiences}
            errors={analysisErrors}
            onChange={onExperiencesChange}
            onComplete={onReviewComplete}
            onBack={() => setStep('analysis')}
          />
        )}

        {state.step === 'sql' && (
          <SqlStep
            sql={state.generatedSql}
            onBack={() => setStep('review')}
            onReset={onReset}
          />
        )}
      </div>
    </div>
  );
}

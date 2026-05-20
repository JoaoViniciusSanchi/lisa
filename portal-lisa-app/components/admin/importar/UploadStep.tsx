'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import type { CsvRow } from '@/lib/import/types';

interface Props {
  onComplete: (csvRows: CsvRow[], csvHeaders: string[], docxFiles: File[]) => void;
}

export default function UploadStep({ onComplete }: Props) {
  const [subStep, setSubStep] = useState<'docx' | 'csv'>('docx');
  const [docxFiles, setDocxFiles] = useState<File[]>([]);
  const [csvStatus, setCsvStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const csvRef = useRef<HTMLInputElement>(null);
  const docxRef = useRef<HTMLInputElement>(null);

  function handleDocxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.name.toLowerCase().endsWith('.docx')
    );
    setDocxFiles(files);
  }

  function handleCsvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvStatus('loading');
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        setCsvStatus('done');
        onComplete(results.data, results.meta.fields ?? [], docxFiles);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Indicador de sub-steps */}
      <div className="flex items-center gap-2 text-[12px]">
        <span
          className={`font-semibold transition-colors ${
            subStep === 'docx' ? 'text-accent' : 'text-warm-white/50'
          }`}
        >
          1a. Arquivos .docx
        </span>
        <span className="text-warm-white/20 text-[10px]">›</span>
        <span
          className={`font-semibold transition-colors ${
            subStep === 'csv' ? 'text-accent' : 'text-warm-white/20'
          }`}
        >
          1b. Planilha CSV
        </span>
      </div>

      {/* ---- SUB-STEP: DOCX ---- */}
      {subStep === 'docx' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-warm-white mb-1">
              Passo 1a — Arquivos .docx
            </h2>
            <p className="text-[13px] text-warm-white/50">
              Selecione os arquivos .docx com os textos narrativos de cada projeto. O texto de cada
              arquivo será lido e combinado com as respostas do formulário CSV para gerar os campos
              editoriais. Na próxima etapa você vai associar cada arquivo à linha correspondente no
              CSV.
            </p>
          </div>

          <div className="border border-line rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-warm-white/70 font-bold text-[13px]">ARQUIVOS .DOCX</span>
              <span className="text-[11px] text-warm-white/30">opcional</span>
            </div>
            <p className="text-[12px] text-warm-white/50">
              Selecione todos de uma vez. Cada .docx contém o texto completo de um projeto (histórico,
              metodologia, resultados, etc.).
            </p>
            <button
              type="button"
              onClick={() => docxRef.current?.click()}
              className={`w-full border border-dashed rounded-md py-8 text-center text-[13px] transition-colors ${
                docxFiles.length > 0
                  ? 'border-accent/40 text-accent/70 hover:border-accent/70'
                  : 'border-line text-warm-white/40 hover:text-warm-white/70 hover:border-accent/50'
              }`}
            >
              {docxFiles.length === 0
                ? 'Clique para selecionar os arquivos .docx (múltiplos)'
                : `${docxFiles.length} arquivo${docxFiles.length !== 1 ? 's' : ''} selecionado${docxFiles.length !== 1 ? 's' : ''} — clique para alterar`}
            </button>
            <input
              ref={docxRef}
              type="file"
              accept=".docx"
              multiple
              className="hidden"
              onChange={handleDocxChange}
            />
            {docxFiles.length > 0 && (
              <ul className="text-[11px] text-warm-white/40 space-y-0.5 max-h-32 overflow-y-auto pl-1">
                {docxFiles.map((f) => (
                  <li key={f.name} className="truncate">
                    · {f.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSubStep('csv')}
              className="px-6 py-2.5 text-[13px] bg-accent text-bg-base font-semibold rounded hover:bg-accent/90 transition-colors"
            >
              {docxFiles.length > 0
                ? `Avançar com ${docxFiles.length} arquivo${docxFiles.length !== 1 ? 's' : ''} →`
                : 'Continuar sem .docx →'}
            </button>
          </div>
        </div>
      )}

      {/* ---- SUB-STEP: CSV ---- */}
      {subStep === 'csv' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-warm-white mb-1">
              Passo 1b — Planilha CSV
            </h2>
            <p className="text-[13px] text-warm-white/50">
              Faça upload da planilha exportada do Google Sheets. O sistema lerá todas as colunas —
              incluindo perguntas do formulário e seus campos de justificativa — para alimentar a
              análise da IA.
            </p>
          </div>

          <div className="border border-line rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent font-bold text-[13px]">CSV OBRIGATÓRIO</span>
            </div>
            <p className="text-[12px] text-warm-white/50">
              Exporte o Google Sheets como{' '}
              <code className="bg-white/10 px-1 rounded text-[11px]">
                Arquivo → Fazer download → CSV (.csv)
              </code>
            </p>

            {csvStatus === 'idle' && (
              <button
                type="button"
                onClick={() => csvRef.current?.click()}
                className="w-full border border-dashed border-line rounded-md py-8 text-center text-[13px] text-warm-white/40 hover:text-warm-white/70 hover:border-accent/50 transition-colors"
              >
                Clique para selecionar o arquivo .csv
              </button>
            )}
            {csvStatus === 'loading' && (
              <div className="w-full border border-dashed border-line rounded-md py-8 text-center text-[13px] text-warm-white/40">
                Lendo arquivo CSV...
              </div>
            )}
            {csvStatus === 'done' && (
              <div className="w-full border border-dashed border-green-500/40 rounded-md py-8 text-center text-[13px] text-green-400">
                CSV carregado ✓ Prosseguindo...
              </div>
            )}
            <input
              ref={csvRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvChange}
            />
          </div>

          {docxFiles.length > 0 && (
            <p className="text-[11px] text-warm-white/30">
              {docxFiles.length} arquivo{docxFiles.length !== 1 ? 's' : ''} .docx carregado{docxFiles.length !== 1 ? 's' : ''}:{' '}
              {docxFiles.map((f) => f.name).join(', ')}
            </p>
          )}

          <button
            type="button"
            onClick={() => setSubStep('docx')}
            className="text-[12px] text-warm-white/40 hover:text-warm-white/70 transition-colors"
          >
            ← Voltar para .docx
          </button>
        </div>
      )}

      <p className="text-[11px] text-warm-white/30 text-center">
        Os arquivos são processados localmente no seu navegador — nada é enviado ao servidor nesta
        etapa.
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { suggestMatches } from '@/lib/import/fuzzy-match';
import type { CsvRow, DocxMatch } from '@/lib/import/types';

interface Props {
  csvRows: CsvRow[];
  csvHeaders: string[];
  docxFiles: File[];
  onComplete: (matches: DocxMatch[]) => void;
  onBack: () => void;
}

export default function MatchingStep({ csvRows, csvHeaders, docxFiles, onComplete, onBack }: Props) {
  // csvRowIndex -1 significa "não associado"
  const [assignments, setAssignments] = useState<number[]>(() =>
    docxFiles.map(() => -1)
  );

  // Tenta detectar a coluna de título automaticamente
  const titleCol =
    csvHeaders.find((h) => /t[ií]tulo|title|nome|name/i.test(h)) ?? csvHeaders[0] ?? '';

  const csvTitles = csvRows.map((r) => r[titleCol] ?? '');

  function handleAutoSuggest() {
    const suggestions = suggestMatches(
      csvTitles,
      docxFiles.map((f) => f.name),
      0.4
    );
    const newAssignments = [...assignments];
    for (const s of suggestions) {
      newAssignments[s.docxFileIndex] = s.csvRowIndex;
    }
    setAssignments(newAssignments);
  }

  function handleAssign(docxIdx: number, csvIdx: number) {
    setAssignments((prev) => {
      const next = [...prev];
      next[docxIdx] = csvIdx;
      return next;
    });
  }

  function handleContinue() {
    const matches: DocxMatch[] = assignments
      .map((csvIdx, docxIdx) =>
        csvIdx >= 0 ? { csvRowIndex: csvIdx, file: docxFiles[docxIdx] } : null
      )
      .filter((m): m is DocxMatch => m !== null);
    onComplete(matches);
  }

  const matched = assignments.filter((a) => a >= 0).length;

  // Pula automaticamente se não há .docx
  useEffect(() => {
    if (docxFiles.length === 0) onComplete([]);
  }, [docxFiles.length]);

  if (docxFiles.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-warm-white mb-1">Passo 2 — Associar arquivos .docx</h2>
        <p className="text-[13px] text-warm-white/50">
          Associe cada arquivo .docx ao projeto correspondente. Linhas sem .docx usarão apenas os
          dados do CSV.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-warm-white/50">
          {matched}/{docxFiles.length} arquivos associados
        </span>
        <button
          type="button"
          onClick={handleAutoSuggest}
          className="text-[12px] text-accent hover:underline"
        >
          Sugerir matches automáticos
        </button>
      </div>

      <div className="space-y-2">
        {docxFiles.map((file, di) => (
          <div
            key={di}
            className="flex items-center gap-4 bg-bg-elevated border border-line rounded-md px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-warm-white truncate">{file.name}</div>
              <div className="text-[11px] text-warm-white/30">
                {(file.size / 1024).toFixed(0)} KB
              </div>
            </div>

            <span className="text-warm-white/30 text-[12px] flex-shrink-0">→</span>

            <select
              value={assignments[di] ?? -1}
              onChange={(e) => handleAssign(di, parseInt(e.target.value))}
              className="bg-bg-base border border-line rounded px-2 py-1.5 text-[12px] text-warm-white max-w-xs"
            >
              <option value={-1}>— não associar —</option>
              {csvRows.map((row, ci) => (
                <option key={ci} value={ci}>
                  [{ci + 1}] {(row[titleCol] ?? '').slice(0, 60)}
                </option>
              ))}
            </select>

            {assignments[di] >= 0 && (
              <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded flex-shrink-0">
                ✓
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-[13px] text-warm-white/50 border border-line rounded hover:text-warm-white transition-colors"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="px-6 py-2 text-[13px] bg-accent text-bg-base font-semibold rounded hover:bg-accent/90 transition-colors"
        >
          Continuar ({matched} associados)
        </button>
      </div>
    </div>
  );
}

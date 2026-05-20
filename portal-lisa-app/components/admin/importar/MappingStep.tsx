'use client';

import { useState } from 'react';
import type { FieldMapping, LisaField, CsvRow } from '@/lib/import/types';

interface Props {
  csvHeaders: string[];
  csvRows: CsvRow[];
  onComplete: (mapping: FieldMapping) => void;
  onBack: () => void;
}

const LISA_FIELDS: Array<{ value: LisaField; label: string }> = [
  { value: 'titulo', label: 'Título do projeto' },
  { value: 'historico', label: 'Histórico / Descrição' },
  { value: 'metodologia', label: 'Metodologia' },
  { value: 'resultados_impactos', label: 'Resultados e Impactos' },
  { value: 'desafios_perspectivas', label: 'Desafios e Perspectivas' },
  { value: 'data_inicio', label: 'Data de início (YYYY-MM-DD)' },
  { value: 'data_fim', label: 'Data de fim (YYYY-MM-DD)' },
  { value: 'campus_uff', label: 'Campus UFF' },
  { value: 'municipio', label: 'Município' },
  { value: 'uf', label: 'UF (estado)' },
  { value: 'email_contato', label: 'E-mail de contato' },
  { value: 'coordenador_nome', label: 'Nome do coordenador' },
  { value: 'coordenador_email', label: 'E-mail do coordenador' },
  { value: 'coordenador_telefone', label: 'Telefone do coordenador' },
  { value: 'coordenador_lattes', label: 'Lattes do coordenador' },
  { value: 'coordenador_vinculo', label: 'Vínculo do coordenador com a UFF' },
  { value: 'coordenador_departamento', label: 'Departamento do coordenador' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'site_externo', label: 'Site / URL externo' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' }
];

// Sugestão automática com base no nome da coluna
function suggestField(header: string): LisaField | '(ignorar)' | '(ia)' {
  const h = header.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/titulo|title|nome\s*do\s*projeto/.test(h)) return 'titulo';
  if (/historico|descricao|apresentacao|sobre/.test(h)) return 'historico';
  if (/metodologia|metodo/.test(h)) return 'metodologia';
  if (/resultado|impacto/.test(h)) return 'resultados_impactos';
  if (/desafio|perspectiva/.test(h)) return 'desafios_perspectivas';
  if (/data.*inicio|inicio.*data|start/.test(h)) return 'data_inicio';
  if (/data.*fim|fim.*data|encerramento|end/.test(h)) return 'data_fim';
  if (/campus/.test(h)) return 'campus_uff';
  if (/municipio|cidade|municipality/.test(h)) return 'municipio';
  if (/\buf\b|estado/.test(h)) return 'uf';
  if (/email.*contato|contato.*email/.test(h)) return 'email_contato';
  if (/nome.*coord|coord.*nome/.test(h)) return 'coordenador_nome';
  if (/email.*coord|coord.*email/.test(h)) return 'coordenador_email';
  if (/telefone|phone/.test(h)) return 'coordenador_telefone';
  if (/lattes/.test(h)) return 'coordenador_lattes';
  if (/vinculo|natureza.*coord|coord.*natureza|vinculo.*coord|tipo.*coord/.test(h)) return 'coordenador_vinculo';
  if (/departamento|dept/.test(h)) return 'coordenador_departamento';
  if (/instagram/.test(h)) return 'instagram';
  if (/site|url|link/.test(h)) return 'site_externo';
  if (/youtube|video/.test(h)) return 'youtube';
  if (/facebook|fb/.test(h)) return 'facebook';
  return '(ia)';
}

export default function MappingStep({ csvHeaders, csvRows, onComplete, onBack }: Props) {
  const [mapping, setMapping] = useState<FieldMapping>(() => {
    const initial: FieldMapping = {};
    for (const h of csvHeaders) {
      initial[h] = suggestField(h);
    }
    return initial;
  });

  function handleChange(header: string, value: string) {
    setMapping((prev) => ({ ...prev, [header]: value as LisaField | '(ignorar)' | '(ia)' }));
  }

  const preview = csvRows[0];
  const mapped = Object.values(mapping).filter((v) => v !== '(ignorar)' && v !== '(ia)').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-warm-white mb-1">Passo 3 — Mapeamento de campos</h2>
        <p className="text-[13px] text-warm-white/50">
          Para cada coluna do CSV, indique o campo do LISA correspondente. Campos não mapeados aqui
          serão preenchidos pela IA com base no contexto.
        </p>
      </div>

      <div className="space-y-2">
        {csvHeaders.map((header) => (
          <div
            key={header}
            className="grid grid-cols-[1fr_1fr_1fr] gap-3 items-center bg-bg-elevated border border-line rounded-md px-4 py-3"
          >
            {/* Nome da coluna */}
            <div>
              <div className="text-[13px] text-warm-white font-medium">{header}</div>
              {preview && (
                <div className="text-[11px] text-warm-white/30 truncate mt-0.5">
                  ex: {String(preview[header] ?? '').slice(0, 50)}
                </div>
              )}
            </div>

            {/* Seletor */}
            <select
              value={mapping[header] ?? '(ignorar)'}
              onChange={(e) => handleChange(header, e.target.value)}
              className="bg-bg-base border border-line rounded px-2 py-1.5 text-[12px] text-warm-white"
            >
              <option value="(ignorar)">(ignorar)</option>
              <option value="(ia)">(IA vai gerar)</option>
              {LISA_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* Status indicator */}
            <div className="text-right">
              {mapping[header] === '(ignorar)' && (
                <span className="text-[11px] text-warm-white/30">ignorado</span>
              )}
              {mapping[header] === '(ia)' && (
                <span className="text-[11px] text-yellow-400/70">✦ IA</span>
              )}
              {mapping[header] !== '(ignorar)' && mapping[header] !== '(ia)' && (
                <span className="text-[11px] text-green-400/70">✓ mapeado</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-bg-elevated border border-line rounded-md p-4 text-[12px] text-warm-white/50">
        <strong className="text-warm-white/80">Sempre gerado pela IA:</strong> classificações
        (EFITS, ODS, FORPROEX, Categoria Editorial, etc.), resumo do catálogo e qualquer campo não
        mapeado acima.
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
          onClick={() => onComplete(mapping)}
          className="px-6 py-2 text-[13px] bg-accent text-bg-base font-semibold rounded hover:bg-accent/90 transition-colors"
        >
          Analisar com IA →  ({mapped} campos mapeados)
        </button>
      </div>
    </div>
  );
}

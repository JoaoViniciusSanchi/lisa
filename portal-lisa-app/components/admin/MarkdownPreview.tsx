'use client';

import { useMemo } from 'react';
import { marked } from 'marked';
import { substituirVars } from '@/lib/email/render';
import { FAKE_VARS } from '@/lib/email/defaults';

interface Props {
  corpMd: string;
  assunto: string;
  className?: string;
}

export function MarkdownPreview({ corpMd, assunto, className = '' }: Props) {
  const html = useMemo(() => {
    if (!corpMd) return '';
    const comVars = substituirVars(corpMd, FAKE_VARS);
    return marked.parse(comVars, { async: false }) as string;
  }, [corpMd]);

  const assuntoFinal = useMemo(
    () => (assunto ? substituirVars(assunto, FAKE_VARS) : ''),
    [assunto]
  );

  return (
    <div className={`border border-line bg-white text-[#1a1a1a] rounded overflow-hidden ${className}`}>
      {/* Simulação do cabeçalho LISA */}
      <div className="bg-[#1a1a1a] px-5 py-3">
        <div className="text-[#e8d97b] font-bold text-base">LISA</div>
        <div className="text-white/40 text-[10px] uppercase tracking-widest">Portal de Tecnologias Sociais — AGIR/UFF</div>
      </div>

      {/* Assunto renderizado */}
      {assuntoFinal && (
        <div className="px-5 pt-4 pb-2 border-b border-gray-200">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Assunto</div>
          <div className="text-sm font-semibold text-gray-800">{assuntoFinal}</div>
        </div>
      )}

      {/* Corpo HTML */}
      <div
        className="px-5 py-4 text-sm leading-relaxed prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Rodapé */}
      <div className="bg-[#f4f4f0] px-5 py-3 border-t border-gray-200">
        <p className="text-[11px] text-gray-400">
          Este e-mail foi enviado automaticamente pelo Portal LISA.<br />
          Coordenação de Tecnologia Social — AGIR/UFF
        </p>
      </div>
    </div>
  );
}

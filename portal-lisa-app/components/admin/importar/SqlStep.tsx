'use client';

import { useState } from 'react';

interface Props {
  sql: string;
  onBack: () => void;
  onReset: () => void;
}

export default function SqlStep({ sql, onBack, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lisa_import_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lineCount = sql.split('\n').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-warm-white mb-1">Passo 6 — SQL gerado</h2>
        <p className="text-[13px] text-warm-white/50">
          Copie o SQL abaixo e cole no{' '}
          <strong className="text-warm-white/70">Supabase → SQL Editor → New query</strong>. Execute
          e verifique se não há erros.
        </p>
      </div>

      {/* Instruções */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-1.5 text-[12px] text-warm-white/70">
        <div className="font-semibold text-accent mb-2">Instruções de execução</div>
        <div>1. Abra o <strong>SQL Editor</strong> no painel do Supabase.</div>
        <div>2. Crie uma nova query e cole o SQL abaixo.</div>
        <div>3. Clique em <strong>Run</strong>. Cada bloco DO $$ ... $$ é independente.</div>
        <div>4. Verifique a aba <strong>Experiências</strong> no admin para confirmar as importações.</div>
        <div className="text-warm-white/40 pt-1">
          ⚠ Imagens ficam em branco — adicione-as manualmente em cada experiência após a importação.
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-warm-white/40">{lineCount} linhas · {sql.length} chars</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleCopy}
          className={`px-4 py-2 text-[12px] rounded font-medium transition-colors ${
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/10 text-warm-white hover:bg-white/15'
          }`}
        >
          {copied ? '✓ Copiado!' : 'Copiar SQL'}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-[12px] bg-accent text-bg-base font-semibold rounded hover:bg-accent/90 transition-colors"
        >
          Baixar .sql
        </button>
      </div>

      {/* Textarea com o SQL */}
      <textarea
        readOnly
        value={sql}
        rows={24}
        className="w-full bg-bg-elevated border border-line rounded-lg px-4 py-3 text-[11px] text-warm-white/60 font-mono resize-y"
        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
      />

      {/* Ações finais */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-[13px] text-warm-white/50 border border-line rounded hover:text-warm-white transition-colors"
        >
          Voltar à revisão
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 text-[13px] text-warm-white/30 hover:text-warm-white/60 transition-colors"
        >
          Nova importação
        </button>
      </div>
    </div>
  );
}

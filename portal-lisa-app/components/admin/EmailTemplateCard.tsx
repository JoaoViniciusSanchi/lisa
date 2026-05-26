'use client';

import { useState, useTransition } from 'react';
import { saveConfigValue } from '@/lib/admin/actions';
import { sendTestEmail } from '@/lib/admin/email-actions';
import { EMAIL_DEFAULTS } from '@/lib/email/defaults';
import { MarkdownPreview } from './MarkdownPreview';

interface TemplateConfig {
  usar_padrao: boolean;
  assunto: string | null;
  corpo_md: string | null;
}

interface Props {
  tipo: string;
  config: TemplateConfig;
  label: string;
  badge: 'Automático' | 'Manual' | 'Agendado';
  variaveis: string[];
}

const BADGE_COLORS = {
  Automático: 'bg-green-500/20 text-green-400 border-green-500/30',
  Manual: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Agendado: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

export function EmailTemplateCard({ tipo, config, label, badge, variaveis }: Props) {
  const defaultTemplate = EMAIL_DEFAULTS[tipo];
  const [usarPadrao, setUsarPadrao] = useState(config.usar_padrao);
  const [assunto, setAssunto] = useState(
    config.assunto ?? defaultTemplate?.assunto ?? ''
  );
  const [corpoMd, setCorpoMd] = useState(
    config.corpo_md ?? defaultTemplate?.corpo_md ?? ''
  );
  const [showPreview, setShowPreview] = useState(false);
  const [salvoOk, setSalvoOk] = useState(false);
  const [testeOk, setTesteOk] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleTogglePadrao() {
    const novoValor = !usarPadrao;
    setUsarPadrao(novoValor);
    if (novoValor) {
      // Ao voltar para padrão, restaurar texto padrão nos campos
      setAssunto(defaultTemplate?.assunto ?? '');
      setCorpoMd(defaultTemplate?.corpo_md ?? '');
    }
  }

  function handleSalvar() {
    setSalvoOk(false);
    startTransition(async () => {
      await saveConfigValue(`template_email_${tipo}`, {
        usar_padrao: usarPadrao,
        assunto: usarPadrao ? null : assunto,
        corpo_md: usarPadrao ? null : corpoMd
      });
      setSalvoOk(true);
      setTimeout(() => setSalvoOk(false), 3000);
    });
  }

  function handleEnviarTeste() {
    setTesteOk(null);
    startTransition(async () => {
      const res = await sendTestEmail(tipo);
      setTesteOk(res.ok ? 'E-mail de teste enviado!' : `Erro: ${res.error}`);
      setTimeout(() => setTesteOk(null), 5000);
    });
  }

  return (
    <div className="border border-line bg-bg-elevated">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-warm-white text-[14px]">{label}</span>
          <span className={`text-[10px] px-2 py-0.5 border ${BADGE_COLORS[badge]}`}>
            {badge}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle usar padrão */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={handleTogglePadrao}
              className={`w-10 h-5 relative transition-colors ${usarPadrao ? 'bg-accent' : 'bg-line'}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-bg-base transition-all ${usarPadrao ? 'left-5' : 'left-0.5'}`}
              />
            </div>
            <span className="text-[12px] text-warm-white/50">
              {usarPadrao ? 'Texto padrão (sistema)' : 'Texto personalizado'}
            </span>
          </label>
        </div>
      </div>

      {/* Editor */}
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-eyebrow text-warm-white/40 mb-1.5">
            Assunto
          </label>
          <input
            type="text"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            disabled={usarPadrao}
            className="w-full bg-bg-base border border-line text-warm-white px-3 py-2 text-[13px] outline-none focus:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40">
              Corpo (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-[11px] text-accent hover:text-accent/80 transition-colors"
            >
              {showPreview ? 'Ocultar preview' : 'Ver preview'}
            </button>
          </div>

          <div className={`grid gap-4 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <textarea
              value={corpoMd}
              onChange={(e) => setCorpoMd(e.target.value)}
              disabled={usarPadrao}
              rows={12}
              className="w-full bg-bg-base border border-line text-warm-white px-3 py-2 text-[12px] font-mono outline-none focus:border-accent transition-colors resize-none disabled:opacity-40 disabled:cursor-not-allowed"
              placeholder="Markdown..."
            />
            {showPreview && (
              <MarkdownPreview
                corpMd={corpoMd}
                assunto={assunto}
                className="max-h-[360px] overflow-y-auto text-[12px]"
              />
            )}
          </div>
        </div>

        {/* Variáveis disponíveis */}
        {variaveis.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/30 mb-2">
              Variáveis disponíveis
            </div>
            <div className="flex flex-wrap gap-1.5">
              {variaveis.map((v) => (
                <code
                  key={v}
                  className="text-[11px] bg-bg-base border border-line px-2 py-0.5 text-accent/80 font-mono"
                >
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleEnviarTeste}
            disabled={isPending}
            className="text-[12px] text-warm-white/50 border border-line px-4 py-2 hover:text-warm-white hover:border-warm-white/40 transition-colors disabled:opacity-40"
          >
            {isPending ? 'Enviando…' : '📧 Enviar teste para meu e-mail'}
          </button>

          <div className="flex items-center gap-3">
            {testeOk && (
              <span className={`text-[12px] ${testeOk.startsWith('Erro') ? 'text-danger' : 'text-green-400'}`}>
                {testeOk}
              </span>
            )}
            {salvoOk && <span className="text-[12px] text-green-400">✓ Salvo!</span>}
            <button
              type="button"
              onClick={handleSalvar}
              disabled={isPending || usarPadrao}
              className="bg-accent text-bg-base text-[12px] font-medium px-5 py-2 hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

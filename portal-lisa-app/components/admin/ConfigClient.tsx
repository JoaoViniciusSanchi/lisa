'use client';

import { useState, useTransition } from 'react';
import { saveConfigValue } from '@/lib/admin/actions';

// =============================================================
// Toggle especial para a chave edital_atual_ativo
// Exibe botão "EDITAL ABERTO" / "EDITAL FECHADO" em vez do select
// =============================================================
function EditalAtivoToggle({ value }: { value: boolean }) {
  const [current, setCurrent] = useState(value);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !current;
    startTransition(async () => {
      await saveConfigValue('edital_atual_ativo', next);
      setCurrent(next);
    });
  }

  return (
    <div className="flex items-center gap-4 mt-2">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={[
          'flex items-center gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.18em] font-bold transition-all disabled:opacity-50',
          current
            ? 'bg-fuzzy-green text-bg-base hover:opacity-90'
            : 'bg-line-strong text-warm-white/50 hover:border-accent hover:text-accent border border-line-strong',
        ].join(' ')}
      >
        <span
          className={[
            'w-2 h-2 rounded-full',
            current ? 'bg-bg-base animate-pulse' : 'bg-warm-white/30',
          ].join(' ')}
        />
        {isPending ? 'Salvando...' : current ? 'Edital Aberto' : 'Edital Fechado'}
      </button>
      <span className="text-[11px] text-warm-white/40">
        {current
          ? 'Homepage exibe o edital ativo com prazo de submissão'
          : 'Homepage exibe CTA de cadastro sem edital aberto'}
      </span>
    </div>
  );
}

const CATEGORIA_LABELS: Record<string, string> = {
  conteudo_publico: 'Conteúdo Público',
  templates_email: 'Templates de E-mail',
  edital: 'Edital',
  scoring: 'Score Fuzzy',
  integracao: 'Integrações',
  feature_flag: 'Feature Flags',
  legal: 'Legal'
};

interface ConfigItem {
  chave: string;
  valor: unknown;
  descricao: string | null;
  categoria: string;
}

function ConfigRow({ item }: { item: ConfigItem }) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Caso especial: edital_atual_ativo usa toggle dedicado
  if (item.chave === 'edital_atual_ativo') {
    return (
      <div className="py-4 border-b border-line/50 last:border-0">
        <div className="flex items-center gap-3 mb-1">
          <code className="text-[12px] font-mono text-accent">{item.chave}</code>
        </div>
        {item.descricao && (
          <div className="text-[12px] text-warm-white/40 mb-1">{item.descricao}</div>
        )}
        <EditalAtivoToggle value={item.valor as boolean} />
      </div>
    );
  }

  const rawValue = item.valor;
  const displayValue =
    typeof rawValue === 'string'
      ? rawValue
      : typeof rawValue === 'number' || typeof rawValue === 'boolean'
      ? String(rawValue)
      : JSON.stringify(rawValue);

  const isBoolean = typeof rawValue === 'boolean';
  const isNumber = typeof rawValue === 'number';
  const isLongText = typeof rawValue === 'string' && rawValue.length > 80;

  function handleEdit() {
    setLocalValue(displayValue);
    setEditing(true);
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      let parsed: unknown = localValue;
      if (isBoolean) parsed = localValue === 'true';
      else if (isNumber) parsed = Number(localValue);

      await saveConfigValue(item.chave, parsed);
      setSaved(true);
      setEditing(false);
    });
  }

  return (
    <div className="py-4 border-b border-line/50 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <code className="text-[12px] font-mono text-accent">{item.chave}</code>
            {saved && (
              <span className="text-[11px] text-fuzzy-green">✓ Salvo</span>
            )}
          </div>
          {item.descricao && (
            <div className="text-[12px] text-warm-white/40 mb-2">{item.descricao}</div>
          )}

          {editing ? (
            <div className="flex flex-col gap-2">
              {isBoolean ? (
                <select
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  className="bg-bg-base border border-accent/50 text-warm-white text-[13px] px-3 py-2 outline-none w-32"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : isLongText ? (
                <textarea
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  rows={5}
                  className="bg-bg-base border border-accent/50 text-warm-white text-[13px] px-3 py-2 outline-none resize-y w-full max-w-xl"
                />
              ) : (
                <input
                  type={isNumber ? 'number' : 'text'}
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  step={isNumber ? 'any' : undefined}
                  className="bg-bg-base border border-accent/50 text-warm-white text-[13px] px-3 py-2 outline-none w-64"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="text-[11px] uppercase tracking-widest bg-accent text-bg-base px-4 py-1.5 hover:bg-accent-glow transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-[11px] uppercase tracking-widest border border-line-strong px-4 py-1.5 text-warm-white/50 hover:border-line-brighter transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-warm-white/70 font-mono bg-bg-base border border-line px-3 py-2 max-w-xl truncate">
              {displayValue}
            </div>
          )}
        </div>

        {!editing && (
          <button
            onClick={handleEdit}
            className="text-[11px] uppercase tracking-widest border border-line-strong px-3 py-1.5 text-warm-white/40 hover:border-accent hover:text-accent transition-colors flex-shrink-0"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConfigClient({ configs }: { configs: ConfigItem[] }) {
  // Agrupar por categoria
  const groups: Record<string, ConfigItem[]> = {};
  for (const item of configs) {
    if (!groups[item.categoria]) groups[item.categoria] = [];
    groups[item.categoria].push(item);
  }

  const categoriaOrder = ['templates_email', 'scoring', 'edital', 'feature_flag', 'conteudo_publico', 'integracao', 'legal'];

  return (
    <div className="space-y-8">
      {categoriaOrder
        .filter((cat) => groups[cat]?.length > 0)
        .map((cat) => (
          <div key={cat} className="bg-bg-elevated border border-line">
            <div className="px-6 py-4 border-b border-line">
              <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40">
                {CATEGORIA_LABELS[cat] ?? cat}
              </div>
            </div>
            <div className="px-6">
              {groups[cat].map((item) => (
                <ConfigRow key={item.chave} item={item} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

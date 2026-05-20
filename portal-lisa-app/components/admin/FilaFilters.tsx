'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const STATUS_OPTIONS = [
  { value: 'em_moderacao', label: 'Em moderação' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'aprovada_ativa_em_andamento', label: 'Em andamento' },
  { value: 'aprovada_ativa_perene', label: 'Perene' },
  { value: 'aprovada_encerrada', label: 'Encerrada' },
  { value: 'aguardando_confirmacao_coordenador', label: 'Aguardando' },
  { value: 'inativa_nao_confirmada', label: 'Inativa' },
  { value: 'rejeitada', label: 'Rejeitada' }
];

const FAIXA_OPTIONS = [
  { value: 'verde', label: 'Verde (≥ 0.7)' },
  { value: 'amarelo', label: 'Amarelo (0.3–0.7)' },
  { value: 'vermelho', label: 'Vermelho (< 0.3)' }
];

const ORDER_OPTIONS = [
  { value: 'fuzzy_desc', label: 'Índice fuzzy (maior primeiro)' },
  { value: 'data_asc', label: 'Data de submissão (mais antiga)' },
  { value: 'titulo_asc', label: 'Título (A–Z)' }
];

interface FilterOptionGroup {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
}

interface Props {
  campi: string[];
  finalidades: { id: string; nome: string }[];
  grandesAreas: { id: string; nome: string }[];
  forproex: { id: string; nome: string; codigo: string }[];
}

export function FilaFilters({ campi, finalidades, grandesAreas, forproex }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const current = (key: string) => searchParams.get(key) ?? '';

  const groups: FilterOptionGroup[] = [
    { label: 'Status', paramKey: 'status', options: STATUS_OPTIONS },
    { label: 'Faixa Fuzzy', paramKey: 'faixa', options: FAIXA_OPTIONS },
    {
      label: 'Finalidade Social',
      paramKey: 'finalidade_id',
      options: finalidades.map((f) => ({ value: f.id, label: f.nome }))
    },
    {
      label: 'Grande Área CNPq',
      paramKey: 'grande_area_id',
      options: grandesAreas.map((g) => ({ value: g.id, label: g.nome }))
    },
    {
      label: 'Área FORPROEX',
      paramKey: 'forproex_id',
      options: forproex.map((f) => ({ value: f.id, label: `${f.codigo} — ${f.nome}` }))
    },
    {
      label: 'Campus',
      paramKey: 'campus',
      options: campi.map((c) => ({ value: c, label: c }))
    }
  ];

  return (
    <aside className="w-52 flex-shrink-0 bg-bg-elevated border-r border-line overflow-y-auto p-4">
      <div className="text-[10px] uppercase tracking-eyebrow text-warm-white/40 mb-4">Filtros</div>

      {/* Ordenação */}
      <div className="mb-5">
        <div className="text-[11px] text-warm-white/60 mb-2">Ordenar por</div>
        <select
          value={current('orderBy')}
          onChange={(e) => setParam('orderBy', e.target.value || null)}
          className="w-full bg-bg-base border border-line-strong text-[12px] text-warm-white py-2 px-2 outline-none focus:border-accent"
        >
          <option value="">Padrão</option>
          {ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grupos de filtro */}
      {groups.map((group) => (
        <div key={group.paramKey} className="mb-5">
          <div className="text-[11px] text-warm-white/60 mb-2">{group.label}</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={group.paramKey}
                value=""
                checked={current(group.paramKey) === ''}
                onChange={() => setParam(group.paramKey, null)}
                className="accent-[#2EA39B]"
              />
              <span className="text-[12px] text-warm-white/50">Todos</span>
            </label>
            {group.options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={group.paramKey}
                  value={opt.value}
                  checked={current(group.paramKey) === opt.value}
                  onChange={() => setParam(group.paramKey, opt.value)}
                  className="accent-[#2EA39B]"
                />
                <span className="text-[12px] text-warm-white/70 leading-tight">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Limpar */}
      <button
        onClick={() => router.push(pathname)}
        className="w-full text-[11px] uppercase tracking-widest text-warm-white/40 border border-line-strong py-2 hover:border-danger/50 hover:text-danger transition-colors mt-2"
      >
        Limpar filtros
      </button>
    </aside>
  );
}

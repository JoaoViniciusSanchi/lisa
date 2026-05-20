// @ts-nocheck
'use client';

import { useState, useTransition, useMemo } from 'react';
import { getExperienciaDetailsAction } from '@/lib/admin/actions';
import { ExperienciaDrawer } from './ExperienciaDrawer';
import { FuzzyBadge } from './FuzzyBadge';

interface OdsItem {
  id: number;
  nome: string;
  cor_hex: string | null;
}

interface Props {
  experiencias: unknown[];
  odsList: OdsItem[];
  isInterna: boolean;
}

export default function ExperienciasClient({ experiencias, odsList, isInterna }: Props) {
  const [search, setSearch] = useState('');
  const [odsFilter, setOdsFilter] = useState<number | ''>('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof getExperienciaDetailsAction>> | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return (experiencias as Record<string, unknown>[]).filter((exp) => {
      const titulo = (exp.titulo as string).toLowerCase();
      const matchTitle = !search || titulo.includes(search.toLowerCase());

      const expOds = (exp.experiencia_ods as Record<string, unknown>[]) ?? [];
      const matchOds = !odsFilter || expOds.some(
        (eo) => eo.ods_id === odsFilter
      );

      return matchTitle && matchOds;
    });
  }, [experiencias, search, odsFilter]);

  function handleOpen(id: string) {
    setOpenId(id);
    startTransition(async () => {
      const d = await getExperienciaDetailsAction(id);
      setDetails(d);
    });
  }

  const statusLabel: Record<string, string> = {
    aprovada_ativa_perene: 'Perene',
    aprovada_ativa_em_andamento: 'Em andamento'
  };

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors placeholder:text-warm-white/30"
        />
        <select
          value={odsFilter}
          onChange={(e) => setOdsFilter(e.target.value ? Number(e.target.value) : '')}
          className="bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors min-w-[220px]"
        >
          <option value="">Todos os ODS</option>
          {odsList.map((ods) => (
            <option key={ods.id} value={ods.id}>
              ODS {ods.id} — {ods.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Contagem */}
      <div className="text-[12px] text-warm-white/40 mb-4">
        {filtered.length} {filtered.length === 1 ? 'experiência' : 'experiências'}
        {(search || odsFilter) && (
          <button
            onClick={() => { setSearch(''); setOdsFilter(''); }}
            className="ml-3 text-accent/70 hover:text-accent underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-warm-white/30">
          <div className="text-3xl mb-2">◎</div>
          <div className="text-[14px]">Nenhuma experiência encontrada</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((raw) => {
            const exp = raw as Record<string, unknown>;
            const expOds = (exp.experiencia_ods as Record<string, unknown>[]) ?? [];

            return (
              <button
                key={exp.id as string}
                onClick={() => handleOpen(exp.id as string)}
                className="w-full text-left bg-bg-elevated border border-line hover:border-accent/40 p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Badge de origem */}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${
                          isInterna
                            ? 'bg-accent/15 text-accent'
                            : 'bg-white/8 text-warm-white/40 border border-line/60'
                        }`}
                      >
                        {isInterna ? 'UFF' : 'EXT'}
                      </span>
                      <div className="font-medium text-[14px] text-warm-white truncate">
                        {exp.titulo as string}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-warm-white/45">
                      <span>{(exp.campus_uff as string) || 'Campus não informado'}</span>
                      {exp.aprovada_em && (
                        <>
                          <span>·</span>
                          <span>Aprovada em {new Date(exp.aprovada_em as string).toLocaleDateString('pt-BR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <FuzzyBadge
                      faixa={exp.faixa_fuzzy_atual as 'verde' | 'amarelo' | 'vermelho' | null}
                      indice={typeof exp.indice_fuzzy === 'number' ? exp.indice_fuzzy : null}
                      showBar={false}
                    />
                    {exp.status && (
                      <span className="text-[10px] uppercase tracking-widest text-warm-white/30 border border-line/50 px-2 py-1">
                        {statusLabel[exp.status as string] ?? (exp.status as string)}
                      </span>
                    )}
                  </div>
                </div>

                {/* ODS badges */}
                {expOds.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {expOds.slice(0, 6).map((eo, i) => {
                      const ods = eo.ods as Record<string, unknown> | null;
                      return (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 font-mono text-bg-base"
                          style={{ backgroundColor: (ods?.cor_hex as string) ?? '#2EA39B' }}
                        >
                          ODS {eo.ods_id as number}
                        </span>
                      );
                    })}
                    {expOds.length > 6 && (
                      <span className="text-[10px] px-2 py-0.5 text-warm-white/40 border border-line/40">
                        +{expOds.length - 6}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Drawer de detalhe */}
      {openId && (
        <ExperienciaDrawer
          details={isPending ? null : details}
          onClose={() => { setOpenId(null); setDetails(null); }}
          showActions={false}
        />
      )}
    </>
  );
}

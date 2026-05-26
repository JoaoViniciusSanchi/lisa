// @ts-nocheck
'use client';

import { useState, useTransition, useMemo } from 'react';
import { getExperienciaDetailsAction } from '@/lib/admin/actions';
import { requestUpdateBulk } from '@/lib/admin/email-actions';
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
  const [apenasImportadas, setApenasImportadas] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof getExperienciaDetailsAction>> | null>(null);
  const [isPending, startTransition] = useTransition();

  // Seleção múltipla para validação em lote
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (experiencias as Record<string, unknown>[]).filter((exp) => {
      const titulo = (exp.titulo as string).toLowerCase();
      const matchTitle = !search || titulo.includes(search.toLowerCase());

      const expOds = (exp.experiencia_ods as Record<string, unknown>[]) ?? [];
      const matchOds = !odsFilter || expOds.some(
        (eo) => eo.ods_id === odsFilter
      );

      // Filtro de importadas: protocolo começa com 'IMP-'
      const protocolo = (exp.submissao_formulario as Record<string, unknown>[])?.[0]?.protocolo as string ?? '';
      const matchImportadas = !apenasImportadas || protocolo.startsWith('IMP-');

      return matchTitle && matchOds && matchImportadas;
    });
  }, [experiencias, search, odsFilter, apenasImportadas]);

  function handleOpen(id: string) {
    setOpenId(id);
    startTransition(async () => {
      const d = await getExperienciaDetailsAction(id);
      setDetails(d);
    });
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((e) => (e as Record<string, unknown>).id as string)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleSolicitarValidacao(ids: string[]) {
    setBulkStatus(null);
    startTransition(async () => {
      const res = await requestUpdateBulk(ids);
      const ok = res.resultados.filter((r) => r.ok).length;
      const fail = res.resultados.filter((r) => !r.ok).length;
      setBulkStatus(
        fail === 0
          ? `✓ ${ok} convite${ok !== 1 ? 's' : ''} enviado${ok !== 1 ? 's' : ''} com sucesso.`
          : `${ok} enviados, ${fail} com erro.`
      );
      clearSelection();
    });
  }

  const statusLabel: Record<string, string> = {
    aprovada_ativa_perene: 'Perene',
    aprovada_ativa_em_andamento: 'Em andamento',
    aguardando_confirmacao_coordenador: 'Aguard. confirmação'
  };

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors placeholder:text-warm-white/30"
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
        {/* Filtro importadas */}
        <label className="flex items-center gap-2 px-3 py-2.5 bg-bg-elevated border border-line cursor-pointer hover:border-accent/40 transition-colors">
          <input
            type="checkbox"
            checked={apenasImportadas}
            onChange={(e) => setApenasImportadas(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-[13px] text-warm-white/70 whitespace-nowrap">
            Apenas importadas
          </span>
        </label>
      </div>

      {/* Barra de seleção múltipla */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 mb-4 bg-accent/10 border border-accent/30 px-4 py-3">
          <span className="text-[13px] text-accent">
            {selectedIds.size} selecionada{selectedIds.size !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => handleSolicitarValidacao(Array.from(selectedIds))}
            disabled={isPending}
            className="text-[12px] bg-accent text-bg-base px-4 py-1.5 hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Enviando…' : '📧 Solicitar validação'}
          </button>
          <button
            onClick={clearSelection}
            className="text-[12px] text-warm-white/40 hover:text-warm-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={selectAll}
            className="text-[12px] text-warm-white/40 hover:text-warm-white transition-colors ml-auto"
          >
            Selecionar todos ({filtered.length})
          </button>
        </div>
      )}

      {/* Status de bulk */}
      {bulkStatus && (
        <div className={`mb-4 px-4 py-2.5 text-[13px] border ${bulkStatus.startsWith('✓') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-danger/10 border-danger/30 text-danger'}`}>
          {bulkStatus}
        </div>
      )}

      {/* Contagem */}
      <div className="text-[12px] text-warm-white/40 mb-4">
        {filtered.length} {filtered.length === 1 ? 'experiência' : 'experiências'}
        {(search || odsFilter || apenasImportadas) && (
          <button
            onClick={() => { setSearch(''); setOdsFilter(''); setApenasImportadas(false); }}
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
            const id = exp.id as string;
            const isSelected = selectedIds.has(id);

            return (
              <div
                key={id}
                className={`w-full text-left bg-bg-elevated border transition-colors ${
                  isSelected ? 'border-accent' : 'border-line hover:border-accent/40'
                }`}
              >
                <div className="flex items-stretch">
                  {/* Checkbox de seleção */}
                  <button
                    onClick={(e) => toggleSelect(id, e)}
                    className={`flex-shrink-0 w-10 flex items-center justify-center border-r border-line/40 hover:bg-accent/10 transition-colors ${
                      isSelected ? 'bg-accent/10 text-accent' : 'text-warm-white/20'
                    }`}
                    title="Selecionar"
                  >
                    {isSelected ? '✓' : '○'}
                  </button>

                  {/* Conteúdo principal */}
                  <button
                    onClick={() => handleOpen(id)}
                    className="flex-1 text-left p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
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
                        {/* Botão individual de solicitar validação */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSolicitarValidacao([id]);
                          }}
                          disabled={isPending}
                          title="Solicitar validação"
                          className="text-[11px] text-warm-white/30 border border-line/40 px-2 py-1 hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40"
                        >
                          📧
                        </button>
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
                </div>
              </div>
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

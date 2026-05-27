// @ts-nocheck
'use client';

import { useState, useMemo, useTransition } from 'react';
import { getExperienciaDetailsAction } from '@/lib/admin/actions';
import { ExperienciaDrawer } from './ExperienciaDrawer';

interface Coordenador {
  nome_completo: string;
  departamento: string | null;
  vinculo: string | null;
}

interface GrandeArea {
  id: string;
  nome: string;
}

interface Subarea {
  id: string;
  nome: string;
  grande_area_id: string;
  grande_area: GrandeArea | null;
}

interface ExperienciaCnpq {
  subarea_id: string;
  subarea: Subarea | null;
}

interface ExperienciaPessoa {
  papel: string;
  pessoa: Coordenador | null;
}

interface Experiencia {
  id: string;
  titulo: string;
  campus_uff: string | null;
  status: string;
  aprovada_em: string | null;
  data_inicio: string | null;
  /** true = compõe o Catálogo de Tecnologias Sociais */
  catalogo_ts: boolean | null;
  /** Nome do edital durante o qual foi cadastrada */
  edital_origem: string | null;
  experiencia_pessoa: ExperienciaPessoa[] | null;
  experiencia_cnpq: ExperienciaCnpq[] | null;
}

type SortField = 'titulo' | 'coordenador' | 'campus_uff' | 'macro_area' | 'data_inicio' | 'status';
type SortOrder = 'asc' | 'desc';

interface Props {
  experiencias: Experiencia[];
}

export default function ExperienciasTableClient({ experiencias }: Props) {
  const [sortField, setSortField] = useState<SortField>('titulo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen(id: string) {
    setOpenId(id);
    startTransition(async () => {
      const d = await getExperienciaDetailsAction(id);
      setDetails(d);
    });
  }

  const sorted = useMemo(() => {
    // Filter to only include coordinators
    let data = experiencias
      .map((exp) => ({
        ...exp,
        experiencia_pessoa: (exp.experiencia_pessoa ?? []).filter(
          (ep) => ep.papel === 'coordenador'
        ),
      }))
      .filter((exp) => exp.experiencia_pessoa.length > 0);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((exp) =>
        exp.titulo.toLowerCase().includes(term) ||
        (exp.experiencia_pessoa[0]?.pessoa?.nome_completo?.toLowerCase().includes(term)) ||
        (exp.campus_uff?.toLowerCase().includes(term))
      );
    }

    data.sort((a, b) => {
      let aVal: string | null = null;
      let bVal: string | null = null;

      if (sortField === 'titulo') {
        aVal = a.titulo;
        bVal = b.titulo;
      } else if (sortField === 'coordenador') {
        aVal = a.experiencia_pessoa[0]?.pessoa.nome_completo || '';
        bVal = b.experiencia_pessoa[0]?.pessoa.nome_completo || '';
      } else if (sortField === 'campus_uff') {
        aVal = a.campus_uff || '';
        bVal = b.campus_uff || '';
      } else if (sortField === 'macro_area') {
        const aCnpqs = a.experiencia_cnpq ?? [];
        const bCnpqs = b.experiencia_cnpq ?? [];
        aVal = aCnpqs[0]?.subarea?.grande_area?.nome || '';
        bVal = bCnpqs[0]?.subarea?.grande_area?.nome || '';
      } else if (sortField === 'data_inicio') {
        aVal = a.data_inicio || '';
        bVal = b.data_inicio || '';
      } else if (sortField === 'status') {
        aVal = getStatusLabel(a.status);
        bVal = getStatusLabel(b.status);
      }

      if (!aVal || !bVal) return 0;

      const comparison = aVal.localeCompare(bVal, 'pt-BR');
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return data;
  }, [experiencias, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      aprovada_ativa_em_andamento: 'Em andamento',
      aprovada_ativa_perene: 'Perene',
      aprovada_encerrada: 'Encerrada',
    };
    return labels[status] || status;
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getCoordinator = (exp: Experiencia) => {
    const pessoas = exp.experiencia_pessoa ?? [];
    if (pessoas.length === 0) return null;
    return pessoas[0]?.pessoa || null;
  };

  const getMacroArea = (exp: Experiencia) => {
    const cnpqs = exp.experiencia_cnpq ?? [];
    if (cnpqs.length === 0) return '—';
    const firstCnpq = cnpqs[0];
    if (!firstCnpq?.subarea?.grande_area) return '—';
    return firstCnpq.subarea.grande_area.nome || '—';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'aprovada_ativa_em_andamento':
        return {
          border: 'border-l-accent',
          badge: 'border-accent/50 text-accent bg-accent/10',
        };
      case 'aprovada_ativa_perene':
        return {
          border: 'border-l-accent',
          badge: 'border-accent/30 text-accent/70 bg-accent/5',
        };
      case 'aprovada_encerrada':
        return {
          border: 'border-l-warm-white/25',
          badge: 'border-line-strong text-warm-white/40',
        };
      default:
        return {
          border: 'border-l-line-strong',
          badge: 'border-line/50 text-warm-white/40',
        };
    }
  };

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por título, coordenador ou campus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors placeholder:text-warm-white/30"
        />
      </div>

      {/* Count */}
      <div className="text-[12px] text-warm-white/40 mb-4">
        {sorted.length} {sorted.length === 1 ? 'experiência' : 'experiências'}
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="ml-3 text-accent/70 hover:text-accent underline"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-warm-white/30">
          <div className="text-3xl mb-2">◎</div>
          <div className="text-[14px]">Nenhuma experiência encontrada</div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-[13px]">
            <thead className="bg-bg-elevated border-b border-line">
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium text-warm-white/70 cursor-pointer hover:text-warm-white transition-colors"
                  onClick={() => handleSort('titulo')}
                >
                  Nome da Experiência{getSortIndicator('titulo')}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-warm-white/70 cursor-pointer hover:text-warm-white transition-colors"
                  onClick={() => handleSort('coordenador')}
                >
                  Coordenador{getSortIndicator('coordenador')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-warm-white/70">
                  Vínculo
                </th>
                <th className="px-4 py-3 text-left font-medium text-warm-white/70">
                  Departamento
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-warm-white/70 cursor-pointer hover:text-warm-white transition-colors"
                  onClick={() => handleSort('campus_uff')}
                >
                  Campus{getSortIndicator('campus_uff')}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-warm-white/70 cursor-pointer hover:text-warm-white transition-colors"
                  onClick={() => handleSort('macro_area')}
                >
                  Macro Área{getSortIndicator('macro_area')}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-warm-white/70 cursor-pointer hover:text-warm-white transition-colors"
                  onClick={() => handleSort('data_inicio')}
                >
                  Data de Início{getSortIndicator('data_inicio')}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-warm-white/70 cursor-pointer hover:text-warm-white transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status{getSortIndicator('status')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-warm-white/70 whitespace-nowrap">
                  Catálogo TS
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((exp, idx) => {
                const coord = getCoordinator(exp);
                const macroArea = getMacroArea(exp);
                const statusLabel = getStatusLabel(exp.status);

                return (
                  <tr
                    key={exp.id}
                    onClick={() => handleOpen(exp.id)}
                    className={`border-b border-line/40 border-l-2 ${getStatusStyle(exp.status).border} hover:bg-accent/5 transition-colors cursor-pointer ${
                      idx % 2 === 0 ? 'bg-bg-base' : 'bg-bg-elevated/20'
                    }`}
                  >
                    <td className="px-4 py-3 text-warm-white font-medium truncate max-w-xs">
                      {exp.titulo}
                    </td>
                    <td className="px-4 py-3 text-warm-white/60">
                      {coord?.nome_completo || '—'}
                    </td>
                    <td className="px-4 py-3 text-warm-white/50">
                      {coord?.vinculo ? formatVinculo(coord.vinculo) : '—'}
                    </td>
                    <td className="px-4 py-3 text-warm-white/50">
                      {coord?.departamento || '—'}
                    </td>
                    <td className="px-4 py-3 text-warm-white/50">
                      {exp.campus_uff || '—'}
                    </td>
                    <td className="px-4 py-3 text-warm-white/50">
                      {macroArea}
                    </td>
                    <td className="px-4 py-3 text-warm-white/50">
                      {formatDate(exp.data_inicio)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] uppercase tracking-widest font-medium px-2 py-1 border inline-block ${getStatusStyle(exp.status).badge}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {exp.catalogo_ts ? (
                        <span
                          className="text-[11px] uppercase tracking-widest font-medium px-2 py-1 border border-fuzzy-green/50 text-fuzzy-green bg-fuzzy-green/10 inline-block whitespace-nowrap"
                          title={exp.edital_origem ? `Edital: ${exp.edital_origem}` : undefined}
                        >
                          Catálogo TS
                        </span>
                      ) : (
                        <span className="text-[11px] uppercase tracking-widest font-medium px-2 py-1 border border-line/40 text-warm-white/30 inline-block whitespace-nowrap">
                          Só LISA
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {openId && details && (
        <ExperienciaDrawer
          details={details as any}
          onClose={() => setOpenId(null)}
          showActions={false}
        />
      )}
    </>
  );
}

function formatVinculo(vinculo: string): string {
  const labels: Record<string, string> = {
    docente: 'Docente',
    tecnico_administrativo: 'Técnico-Administrativo',
    estudante_graduacao: 'Estudante (Graduação)',
    estudante_pos: 'Estudante (Pós-Graduação)',
    pesquisador_externo: 'Pesquisador Externo',
    membro_comunidade: 'Membro da Comunidade',
    representante_organizacao: 'Representante de Organização',
    outro: 'Outro',
  };
  return labels[vinculo] || vinculo;
}

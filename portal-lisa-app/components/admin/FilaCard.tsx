import { FuzzyBadge, DimBar } from './FuzzyBadge';

const STATUS_LABELS: Record<string, string> = {
  em_moderacao: 'Em moderação',
  rascunho: 'Rascunho',
  aprovada_ativa_em_andamento: 'Em andamento',
  aprovada_ativa_perene: 'Perene',
  aprovada_encerrada: 'Encerrada',
  aguardando_confirmacao_coordenador: 'Aguardando',
  inativa_nao_confirmada: 'Inativa',
  rejeitada: 'Rejeitada'
};

interface Pill {
  label: string;
  value: string;
}

interface FilaCardData {
  id: string;
  titulo: string;
  campus_uff: string | null;
  submetida_em: string;
  status: string;
  is_interna: boolean;
  faixa_fuzzy_atual: 'verde' | 'amarelo' | 'vermelho' | null;
  indice_fuzzy: number | null;
  categoria_editorial: { nome: string } | null;
  experiencia_forproex: { area_tematica_forproex: { nome: string; codigo: string } }[];
  experiencia_cnpq: { subarea_cnpq: { nome: string; grande_area_cnpq: { nome: string } } }[];
  experiencia_ods: { ods_id: number }[];
  experiencia_finalidade_social: { finalidade_social: { nome: string } }[];
  avaliacao?: {
    media_participacao: number | null;
    media_impacto: number | null;
    media_apropriacao: number | null;
    media_sustentabilidade: number | null;
    media_replicabilidade: number | null;
  } | null;
}

interface FilaCardProps {
  data: FilaCardData;
  onOpen: (id: string) => void;
}

export function FilaCard({ data, onOpen }: FilaCardProps) {
  const dt = new Date(data.submetida_em);
  const dateStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const forproexNames = data.experiencia_forproex?.map((f) => f.area_tematica_forproex?.nome).filter(Boolean) ?? [];
  const odsIds = data.experiencia_ods?.map((o) => o.ods_id) ?? [];

  return (
    <div className="bg-bg-elevated border border-line hover:border-line-strong transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] uppercase tracking-[0.12em] text-warm-white/30 border border-line-strong px-2 py-0.5">
              {STATUS_LABELS[data.status] ?? data.status}
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${
                data.is_interna
                  ? 'bg-accent/15 text-accent'
                  : 'bg-white/8 text-warm-white/40 border border-line/60'
              }`}
            >
              {data.is_interna ? 'UFF' : 'EXT'}
            </span>
            {data.campus_uff && (
              <span className="text-[11px] text-warm-white/40">{data.campus_uff}</span>
            )}
          </div>
          <h3 className="font-display text-[15px] font-semibold leading-snug truncate">{data.titulo}</h3>
          <div className="text-[12px] text-warm-white/40 mt-1">Submetida em {dateStr}</div>
        </div>
        <FuzzyBadge
          faixa={data.faixa_fuzzy_atual}
          indice={data.indice_fuzzy}
          showBar
          className="flex-shrink-0 w-32"
        />
      </div>

      {/* Dimensões fuzzy */}
      {data.avaliacao && (
        <div className="px-5 py-3 border-b border-line grid grid-cols-5 gap-3">
          <DimBar label="P" value={data.avaliacao.media_participacao} />
          <DimBar label="I" value={data.avaliacao.media_impacto} />
          <DimBar label="A" value={data.avaliacao.media_apropriacao} />
          <DimBar label="S" value={data.avaliacao.media_sustentabilidade} />
          <DimBar label="R" value={data.avaliacao.media_replicabilidade} />
        </div>
      )}

      {/* Tags */}
      <div className="px-5 py-3 border-b border-line flex flex-wrap gap-2">
        {data.categoria_editorial?.nome && (
          <span className="text-[11px] text-accent border border-accent/30 px-2 py-0.5">
            {data.categoria_editorial.nome}
          </span>
        )}
        {forproexNames.slice(0, 2).map((n) => (
          <span key={n} className="text-[11px] text-warm-white/50 border border-line-strong px-2 py-0.5">
            {n}
          </span>
        ))}
        {odsIds.slice(0, 6).map((id) => (
          <span key={id} className="text-[10px] font-mono bg-line-strong px-1.5 py-0.5 text-warm-white/60">
            ODS {id}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 flex gap-2">
        <button
          onClick={() => onOpen(data.id)}
          className="flex-1 text-[12px] uppercase tracking-widest border border-accent text-accent py-2 hover:bg-accent hover:text-bg-base transition-colors"
        >
          Abrir
        </button>
      </div>
    </div>
  );
}

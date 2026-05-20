import { cn } from '@/lib/utils/cn';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  rascunho_api_gerado: 'Rascunho API',
  em_primeira_revisao: '1ª revisão',
  primeira_revisao_concluida: '1ª revisão OK',
  em_segunda_revisao: '2ª revisão',
  publicavel: 'Publicável',
  publicada: 'Publicada',
  nao_aplicavel: 'N/A'
};

const STATUS_COLOR: Record<string, string> = {
  rascunho_api_gerado: 'text-[#E5B842] border-[#E5B842]/30 bg-[#E5B842]/10',
  em_primeira_revisao: 'text-accent border-accent/30 bg-accent/10',
  primeira_revisao_concluida: 'text-accent-glow border-accent-glow/30 bg-accent-glow/10',
  em_segunda_revisao: 'text-[#3FBDB4] border-[#3FBDB4]/30 bg-[#3FBDB4]/10'
};

const CAMPOS = ['historico', 'metodologia', 'resultados_impactos', 'desafios_perspectivas'];
const CAMPO_LABELS: Record<string, string> = {
  historico: 'Histórico',
  metodologia: 'Metodologia',
  resultados_impactos: 'Resultados',
  desafios_perspectivas: 'Desafios'
};

interface TraducaoItemProps {
  item: {
    traducao_id: string;
    titulo_pt: string;
    idioma: string;
    status_global: string;
    status_por_campo: Record<string, string> | null;
    criada_em: string;
    api_chamada_em: string | null;
  };
  onOpen: (id: string) => void;
}

export function TraducaoItem({ item, onOpen }: TraducaoItemProps) {
  const statusColor = STATUS_COLOR[item.status_global] ?? 'text-warm-white/40 border-line-strong';
  const campos = item.status_por_campo ?? {};

  return (
    <div className="bg-bg-elevated border border-line hover:border-line-strong transition-colors">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={cn('text-[11px] uppercase tracking-[0.12em] font-semibold px-2 py-0.5 border', statusColor)}>
              {STATUS_LABELS[item.status_global] ?? item.status_global}
            </span>
            <span className="text-[11px] text-warm-white/30 border border-line-strong px-2 py-0.5">
              {item.idioma.toUpperCase()}
            </span>
          </div>
          <div className="font-display text-[14px] font-semibold truncate">{item.titulo_pt}</div>
          {item.api_chamada_em && (
            <div className="text-[11px] text-warm-white/30 mt-1">
              API chamada: {new Date(item.api_chamada_em).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>

        {/* Status por campo */}
        <div className="flex gap-1.5 flex-shrink-0">
          {CAMPOS.map((campo) => {
            const st = campos[campo] ?? 'pendente';
            const ok = st !== 'pendente';
            return (
              <div
                key={campo}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 border',
                  ok
                    ? 'border-accent/40 text-accent bg-accent/10'
                    : 'border-line-strong text-warm-white/30'
                )}
                title={`${CAMPO_LABELS[campo]}: ${st}`}
              >
                {CAMPO_LABELS[campo].slice(0, 3)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-4">
        <button
          onClick={() => onOpen(item.traducao_id)}
          className="text-[12px] uppercase tracking-widest border border-accent text-accent px-4 py-1.5 hover:bg-accent hover:text-bg-base transition-colors"
        >
          Abrir para revisar
        </button>
      </div>
    </div>
  );
}

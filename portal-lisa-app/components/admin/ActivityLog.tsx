const ACTION_LABELS: Record<string, string> = {
  visualizou_experiencia: 'Visualizou',
  abriu_para_moderacao: 'Abriu para moderação',
  aprovou_experiencia: 'Aprovou',
  rejeitou_experiencia: 'Rejeitou',
  editou_conteudo_pt: 'Editou conteúdo PT',
  editou_conteudo_en: 'Editou conteúdo EN',
  regenerou_traducao_api: 'Regenerou tradução',
  aprovou_traducao_primeira_revisao: 'Revisão 1 tradução',
  aprovou_traducao_segunda_revisao: 'Revisão 2 tradução',
  publicou_no_catalogo: 'Publicou',
  despublicou_do_catalogo: 'Despublicou',
  alterou_categorizacao: 'Alterou config',
  exportou_dados: 'Exportou CSV',
  acessou_painel: 'Acessou painel'
};

interface LogEntry {
  id: string;
  acao: string;
  ocorrido_em: string;
  experiencia: { titulo: string } | null;
  admin_perfil: { nome_completo: string } | null;
}

export function ActivityLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="bg-bg-elevated border border-line">
      <div className="px-6 py-4 border-b border-line text-[11px] uppercase tracking-eyebrow text-warm-white/40">
        Atividade Recente
      </div>
      {entries.length === 0 ? (
        <div className="px-6 py-8 text-center text-warm-white/30 text-sm">Nenhuma atividade registrada</div>
      ) : (
        <div>
          {entries.map((entry) => {
            const dt = new Date(entry.ocorrido_em);
            const dateStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-6 py-3 border-b border-line/40 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="text-[11px] font-mono text-warm-white/30 pt-0.5 w-20 flex-shrink-0">
                  <div>{dateStr}</div>
                  <div>{timeStr}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12px] text-accent font-medium">
                      {ACTION_LABELS[entry.acao] ?? entry.acao}
                    </span>
                    <span className="text-warm-white/30 text-[11px]">·</span>
                    <span className="text-[11px] text-warm-white/40">
                      {entry.admin_perfil?.nome_completo ?? 'Sistema'}
                    </span>
                  </div>
                  {entry.experiencia?.titulo && (
                    <div className="text-[12px] text-warm-white/50 truncate">
                      {entry.experiencia.titulo}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

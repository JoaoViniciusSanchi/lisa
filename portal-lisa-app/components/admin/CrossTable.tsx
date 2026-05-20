import Link from 'next/link';

const DISPLAY_STATUSES = [
  { key: 'aprovada_ativa_em_andamento', label: 'Em andamento' },
  { key: 'aprovada_ativa_perene', label: 'Perene' },
  { key: 'em_moderacao', label: 'Moderação' },
  { key: 'rascunho', label: 'Rascunho' }
];

interface Props {
  finalidades: { id: string; nome: string }[];
  matrix: Record<string, Record<string, number>>;
}

export function CrossTable({ finalidades, matrix }: Props) {
  return (
    <div className="bg-bg-elevated border border-line overflow-x-auto">
      <div className="px-6 py-4 border-b border-line text-[11px] uppercase tracking-eyebrow text-warm-white/40">
        Finalidade Social × Status
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left px-6 py-3 text-warm-white/40 font-normal">Finalidade</th>
            {DISPLAY_STATUSES.map((s) => (
              <th key={s.key} className="text-center px-4 py-3 text-warm-white/40 font-normal">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {finalidades.map((f, i) => (
            <tr
              key={f.id}
              className={`border-b border-line/50 hover:bg-white/[0.02] transition-colors ${
                i % 2 === 0 ? '' : 'bg-white/[0.015]'
              }`}
            >
              <td className="px-6 py-3 text-warm-white/70">{f.nome}</td>
              {DISPLAY_STATUSES.map((s) => {
                const count = matrix[f.id]?.[s.key] ?? 0;
                return (
                  <td key={s.key} className="text-center px-4 py-3">
                    {count > 0 ? (
                      <Link
                        href={`/admin-lisa-xyz/fila?status=${s.key}&finalidade_id=${f.id}`}
                        className="inline-block px-2 py-0.5 font-mono text-accent hover:bg-accent/10 transition-colors"
                      >
                        {count}
                      </Link>
                    ) : (
                      <span className="text-warm-white/20">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {finalidades.length === 0 && (
            <tr>
              <td colSpan={DISPLAY_STATUSES.length + 1} className="text-center py-8 text-warm-white/30">
                Sem dados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const ACCENT = '#2EA39B';
const MUTED = '#3FBDB4';
const GRID_COLOR = 'rgba(244,239,230,0.07)';

const TOOLTIP_STYLE = {
  background: '#16161A',
  border: '1px solid rgba(244,239,230,0.16)',
  borderRadius: 0,
  color: '#F4EFE6',
  fontSize: 12
};

const STATUS_COLORS: Record<string, string> = {
  aprovada_ativa_em_andamento: '#2EA39B',
  aprovada_ativa_perene: '#3FBDB4',
  aprovada_encerrada: '#143B47',
  em_moderacao: '#E5B842',
  rascunho: '#8a8a8a',
  aguardando_confirmacao_coordenador: '#E59042',
  inativa_nao_confirmada: '#E55542',
  rejeitada: '#852010'
};

const STATUS_LABELS: Record<string, string> = {
  aprovada_ativa_em_andamento: 'Em andamento',
  aprovada_ativa_perene: 'Perene',
  aprovada_encerrada: 'Encerrada',
  em_moderacao: 'Em moderação',
  rascunho: 'Rascunho',
  aguardando_confirmacao_coordenador: 'Aguardando',
  inativa_nao_confirmada: 'Inativa',
  rejeitada: 'Rejeitada'
};

function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-elevated border border-line p-6">
      <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 mb-5">{title}</div>
      {children}
    </div>
  );
}

// Eixo Y com texto curto
function truncate(str: string, n = 18) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

interface BarData { nome: string; count: number; codigo?: string }
interface StatusData { status: string; count: number }
interface OdsData { id: number; nome: string; count: number }

interface Props {
  finalidades: BarData[];
  cnpq: BarData[];
  forproex: BarData[];
  statusDist: StatusData[];
  odsUnder: OdsData[];
}

export default function DashboardCharts({ finalidades, cnpq, forproex, statusDist, odsUnder }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Row 1: Finalidade + CNPq */}
      <div className="grid grid-cols-2 gap-6">
        <ChartSection title="Experiências por finalidade social">
          {finalidades.length === 0 ? (
            <div className="text-warm-white/30 text-sm py-8 text-center">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={finalidades} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: 'rgba(244,239,230,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fill: 'rgba(244,239,230,0.6)', fontSize: 11 }} tickFormatter={(v) => truncate(v)} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: GRID_COLOR }} />
                <Bar dataKey="count" name="Experiências" fill={ACCENT} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>

        <ChartSection title="Experiências por grande área CNPq">
          {cnpq.length === 0 ? (
            <div className="text-warm-white/30 text-sm py-8 text-center">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cnpq} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: 'rgba(244,239,230,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fill: 'rgba(244,239,230,0.6)', fontSize: 11 }} tickFormatter={(v) => truncate(v)} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: GRID_COLOR }} />
                <Bar dataKey="count" name="Experiências" fill={MUTED} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      </div>

      {/* Row 2: FORPROEX + Status donut */}
      <div className="grid grid-cols-2 gap-6">
        <ChartSection title="Experiências por área FORPROEX">
          {forproex.length === 0 ? (
            <div className="text-warm-white/30 text-sm py-8 text-center">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={forproex} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: 'rgba(244,239,230,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fill: 'rgba(244,239,230,0.6)', fontSize: 11 }} tickFormatter={(v) => truncate(v)} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: GRID_COLOR }} />
                <Bar dataKey="count" name="Experiências" fill={ACCENT} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>

        <ChartSection title="Distribuição por status">
          {statusDist.length === 0 ? (
            <div className="text-warm-white/30 text-sm py-8 text-center">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {statusDist.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? '#555'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) => [value, STATUS_LABELS[name as string] ?? name]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: 'rgba(244,239,230,0.6)' }}>
                      {STATUS_LABELS[value] ?? value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      </div>

      {/* Row 3: ODS sub-representados */}
      <ChartSection title="ODS com menos de 3 experiências vinculadas">
        {odsUnder.length === 0 ? (
          <div className="text-warm-white/30 text-sm py-4 text-center">Todos os ODS têm 3 ou mais experiências</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, odsUnder.length * 28)}>
            <BarChart data={odsUnder} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 3]} ticks={[0, 1, 2, 3]} tick={{ fill: 'rgba(244,239,230,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="id" tick={{ fill: 'rgba(244,239,230,0.6)', fontSize: 11 }} tickFormatter={(id) => `ODS ${id}`} width={50} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: GRID_COLOR }}
                formatter={(value, _name, props) => [value, props.payload?.nome]}
              />
              <Bar dataKey="count" name="Experiências" fill="rgba(229,85,66,0.5)" maxBarSize={16}>
                {odsUnder.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.count === 0 ? '#E55542' : entry.count === 1 ? '#E59042' : '#E5B842'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartSection>
    </div>
  );
}

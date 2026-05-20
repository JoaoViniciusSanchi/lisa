'use client';

import { useEffect, useState } from 'react';
import {
  getDashboardStats,
  getExperienciasByFinalidade,
  getExperienciasByCnpq,
  getExperienciasByForproex,
  getExperienciasByStatus,
  getOdsUnderrepresented,
  getCrossTableData,
  getRecentActivity
} from '@/lib/admin/queries';
import { StatCard, FaixaBar } from '@/components/admin/StatCard';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { CrossTable } from '@/components/admin/CrossTable';
import { ActivityLog } from '@/components/admin/ActivityLog';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [finalidades, setFinalidades] = useState<any[]>([]);
  const [cnpq, setCnpq] = useState<any[]>([]);
  const [forproex, setForproex] = useState<any[]>([]);
  const [statusDist, setStatusDist] = useState<any[]>([]);
  const [odsUnder, setOdsUnder] = useState<any[]>([]);
  const [crossData, setCrossData] = useState<any>({ finalidades: [], matrix: {} });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getExperienciasByFinalidade(),
      getExperienciasByCnpq(),
      getExperienciasByForproex(),
      getExperienciasByStatus(),
      getOdsUnderrepresented(),
      getCrossTableData(),
      getRecentActivity(10)
    ]).then(([s, f, c, fp, sd, ou, cd, a]) => {
      setStats(s);
      setFinalidades(f);
      setCnpq(c);
      setForproex(fp);
      setStatusDist(sd);
      setOdsUnder(ou);
      setCrossData(cd);
      setActivity(a);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse text-warm-white/30 p-8">Carregando dashboard...</div>;
  }

  const totalAprovadas = (stats?.total_aprovadas ?? 0);

  return (
    <div className="max-w-[1400px]">
      {/* Eyebrow */}
      <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">[ 01 ]</div>
      <h1 className="font-display text-2xl font-bold mb-8">Dashboard</h1>

      {/* Seção A — Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Experiências aprovadas"
          value={stats?.total_aprovadas ?? 0}
          accent
        />
        <StatCard
          label="Na fila de moderação"
          value={stats?.fila_moderacao ?? 0}
        />
        <StatCard
          label="Aguardando coordenador"
          value={stats?.aguardando_resposta ?? 0}
        />
        <StatCard
          label="Inativas não confirmadas"
          value={stats?.inativas ?? 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <StatCard
          label="Índice fuzzy médio (aprovadas)"
          value={stats?.indice_medio_aprovadas != null ? Number(stats.indice_medio_aprovadas).toFixed(3) : '—'}
          sub="Escala 0–1"
        />
        <FaixaBar
          verde={stats?.aprovadas_verde ?? 0}
          amarelo={stats?.aprovadas_amarelo ?? 0}
          vermelho={stats?.aprovadas_vermelho ?? 0}
          total={totalAprovadas}
        />
      </div>

      {/* Seção B — Gráficos */}
      <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">[ 02 ]</div>
      <h2 className="font-display text-lg font-bold mb-1">Gráficos</h2>
      <DashboardCharts
        finalidades={finalidades}
        cnpq={cnpq}
        forproex={forproex}
        statusDist={statusDist}
        odsUnder={odsUnder}
      />

      {/* Seção C — Tabela cruzada */}
      <div className="mt-10 mb-2">
        <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">[ 03 ]</div>
        <h2 className="font-display text-lg font-bold mb-4">Tabela Cruzada</h2>
      </div>
      <CrossTable
        finalidades={crossData.finalidades}
        matrix={crossData.matrix}
      />

      {/* Seção D — Atividade */}
      <div className="mt-10 mb-4">
        <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">[ 04 ]</div>
        <h2 className="font-display text-lg font-bold mb-4">Atividade Recente</h2>
      </div>
      <ActivityLog entries={activity as unknown as Parameters<typeof ActivityLog>[0]['entries']} />
    </div>
  );
}

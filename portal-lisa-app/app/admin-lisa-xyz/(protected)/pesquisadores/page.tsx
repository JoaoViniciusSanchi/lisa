'use client';

import { useEffect, useState } from 'react';
import {
  listExpertsAction,
  getForproexAreasAction,
  getGrandesAreasCnpqAction,
} from '@/lib/admin/expertActions';
import PesquisadorClient from '@/components/admin/PesquisadorClient';

export default function PesquisadoresPage() {
  const [experts, setExperts] = useState<any>([]);
  const [forproexAreas, setForproexAreas] = useState<any>([]);
  const [grandesAreas, setGrandesAreas] = useState<any>([]);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000';
    setShareUrl(`${origin}/pt/cadastrar-pesquisador`);

    Promise.all([
      listExpertsAction(),
      getForproexAreasAction(),
      getGrandesAreasCnpqAction(),
    ]).then(([exp, forproex, grandes]) => {
      setExperts(exp);
      setForproexAreas(forproex as { id: string; nome: string; codigo?: string }[]);
      setGrandesAreas(grandes as { id: string; nome: string }[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse text-warm-white/30 p-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-1">Rede de Especialistas</div>
        <h1 className="font-display font-bold text-[22px]">Pesquisadores e Experts</h1>
        <p className="text-[13px] text-warm-white/50 mt-1">
          Especialistas que podem ser contactados quando uma demanda não tiver solução no catálogo.
        </p>
      </div>
      <PesquisadorClient
        experts={experts}
        forproexAreas={forproexAreas}
        grandesAreas={grandesAreas}
        shareUrl={shareUrl}
      />
    </div>
  );
}

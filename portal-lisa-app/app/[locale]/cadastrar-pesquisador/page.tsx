import { createServiceRoleClient } from '@/lib/supabase/server';
import CadastrarPesquisadorForm from './CadastrarPesquisadorForm';

export const metadata = {
  robots: 'noindex, nofollow',
};

export default async function CadastrarPesquisadorPage() {
  const sb = createServiceRoleClient();
  const { data: forproexAreas } = await sb
    .from('area_tematica_forproex')
    .select('id, nome, codigo')
    .order('ordem');

  return (
    <main className="min-h-screen bg-bg-base flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-[620px]">
        {/* Cabeçalho */}
        <div className="mb-10">
          <div className="logo-mark logo-mark-sm mb-6" />
          <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-2">
            Rede de Especialistas — LISA
          </div>
          <h1 className="font-display font-bold text-[28px] leading-tight mb-3">
            Cadastro de Pesquisador
          </h1>
          <p className="text-[14px] text-warm-white/60 leading-relaxed">
            Registre-se como pesquisador ou especialista para ser contactado quando uma demanda social
            corresponder à sua área de atuação. O cadastro passa por ativação da equipe LISA antes de
            entrar na rede ativa.
          </p>
        </div>

        <CadastrarPesquisadorForm
          forproexAreas={(forproexAreas ?? []) as { id: string; nome: string; codigo: string }[]}
        />
      </div>
    </main>
  );
}

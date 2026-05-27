import { unstable_noStore as noStore } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { FormProvider } from '@/components/cadastro/FormProvider';
import { CadastroController } from '@/components/cadastro/CadastroController';
import type { TipoOrigem } from '@/components/cadastro/state';

// Sempre dinâmico: depende do estado do edital e do searchParam ?tipo=
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cadastrar Experiência · LISA',
  description:
    'Cadastre sua experiência de tecnologia social no Portal LISA. Triagem de aderência + cadastro completo em 8 etapas.'
};

interface PageProps {
  searchParams: Promise<{ tipo?: string }>;
}

/**
 * Página de cadastro de experiência.
 * Determina o tipoOrigem a partir do estado do edital (DB) e do searchParam ?tipo=.
 *
 * Quando edital está ATIVO:     tipoOrigem = 'interna_edital' (independente de ?tipo=)
 * Quando edital está INATIVO:   tipoOrigem = 'interna' (default) ou 'externa' (se ?tipo=externa)
 */
export default async function CadastrarPage({ searchParams }: PageProps) {
  noStore(); // Estado do edital nunca deve vir do cache
  const { tipo } = await searchParams;

  // Buscar estado do edital no banco
  let editalAtivo = false;
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from('configuracao_sistema')
      .select('valor')
      .eq('chave', 'edital_atual_ativo')
      .single();
    if (typeof data?.valor === 'boolean') editalAtivo = data.valor;
  } catch {
    // Falha silenciosa — assume inativo
  }

  // Calcular tipo de origem
  let tipoOrigem: TipoOrigem;
  if (editalAtivo) {
    // Edital ativo: sempre interna + compõe catálogo TS
    tipoOrigem = 'interna_edital';
  } else if (tipo === 'externa') {
    tipoOrigem = 'externa';
  } else {
    tipoOrigem = 'interna';
  }

  return (
    <FormProvider tipoOrigem={tipoOrigem}>
      <CadastroController />
    </FormProvider>
  );
}

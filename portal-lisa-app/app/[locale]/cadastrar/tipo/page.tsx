import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Hairline } from '@/components/ui/Hairline';
import { TipoExperienciaCards } from '@/components/cadastro/TipoExperienciaCards';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cadastrar Experiência · Tipo · LISA',
  description:
    'Selecione o tipo de experiência que você deseja cadastrar no Portal LISA: interna (UFF) ou externa.'
};

/**
 * Página intermediária de seleção de tipo de experiência.
 * Exibida apenas quando o edital está INATIVO.
 * Se o edital estiver ativo, redireciona direto para /cadastrar.
 */
export default async function TipoCadastrarPage() {
  noStore(); // Estado do edital nunca deve vir do cache
  // Verificar estado do edital
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

  // Se edital estiver ativo, não há necessidade de selecionar tipo
  if (editalAtivo) {
    const locale = await getLocale();
    redirect(`/${locale}/cadastrar`);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-base pt-32 pb-24">
        <div className="max-w-[1600px] mx-auto px-8">
          {/* Cabeçalho */}
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-4 mb-8">
              <Hairline className="!w-16" strong />
              <Eyebrow>Cadastro de Experiência · Portal LISA</Eyebrow>
            </div>
            <h1 className="font-display font-extralight text-[clamp(36px,5vw,72px)] leading-[0.92] tracking-[-0.03em] mb-6">
              Que tipo de{' '}
              <span className="font-medium">experiência</span>
              <br />
              você deseja{' '}
              <span className="italic font-thin text-accent-glow">cadastrar?</span>
            </h1>
            <p className="text-base opacity-60 leading-relaxed">
              Selecione o tipo que melhor descreve sua iniciativa. Ambos os tipos
              passam pelo processo de moderação da equipe LISA antes de serem
              publicados no catálogo.
            </p>
          </div>

          {/* Cards de seleção */}
          <TipoExperienciaCards />

          {/* Nota de rodapé */}
          <div className="max-w-3xl mt-12 mx-auto">
            <Hairline className="mb-6" />
            <p className="text-[12px] text-warm-white/30 text-center leading-relaxed">
              Ao submeter uma experiência você concorda com os termos de uso do Portal LISA.
              Todas as submissões são avaliadas pela equipe do laboratório antes de qualquer publicação.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

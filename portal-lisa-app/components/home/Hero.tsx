import { unstable_noStore as noStore } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Hairline } from '@/components/ui/Hairline';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ArrowRight } from '@/components/ui/icons';
import { DotGrid } from './DotGrid';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Hero principal — h1 grande, dot grid interativo de fundo,
 * coluna direita com cards de meta-info (edital, atualização, status).
 * Server Component: busca o estado do edital diretamente do banco.
 *
 * noStore() garante que o Next.js nunca sirva os dados do edital
 * a partir do Data Cache — o estado precisa ser sempre lido do banco.
 */
export async function Hero() {
  // Opt-out explícito do Data Cache do Next.js para este componente.
  // force-dynamic no page.tsx bloqueia o Full Route Cache, mas não
  // garante que as chamadas fetch() individuais de componentes filhos
  // ignorem o Data Cache. noStore() resolve isso de forma definitiva.
  noStore();

  const t = await getTranslations('home.hero');

  // Buscar configurações do edital no banco
  let editalAtivo = false;
  let editalNome = 'Chamamento 2026';
  let editalDeadline = 'Submissões abertas até 30 de junho';

  try {
    const supabase = createServiceRoleClient();
    const { data: configs } = await supabase
      .from('configuracao_sistema')
      .select('chave, valor')
      .in('chave', ['edital_atual_ativo', 'edital_atual_nome', 'edital_atual_deadline']);

    if (configs) {
      const map = Object.fromEntries(configs.map((c) => [c.chave, c.valor]));
      if (typeof map['edital_atual_ativo'] === 'boolean') editalAtivo = map['edital_atual_ativo'];
      if (typeof map['edital_atual_nome'] === 'string') editalNome = map['edital_atual_nome'];
      if (typeof map['edital_atual_deadline'] === 'string') editalDeadline = map['edital_atual_deadline'];
    }
  } catch {
    // Falha silenciosa — usa valores padrão acima
  }

  const cadastrarHref = editalAtivo ? '/cadastrar' : '/cadastrar/tipo';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <DotGrid />

      {/* Gradient overlay radial — esconde dots nas bordas */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, var(--bg-base) 80%)'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1600px] mx-auto px-8 w-full">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Coluna esquerda */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-4 mb-12">
              <Hairline className="!w-16" strong />
              <Eyebrow>{t('eyebrow')}</Eyebrow>
            </div>

            <h1 className="font-display font-extralight text-[clamp(48px,8vw,128px)] leading-[0.88] tracking-[-0.04em] mb-10">
              {t('titleLine1')}
              <br />
              <span className="font-medium">{t('titleLine2a')}</span>{' '}
              {t('titleLine2b')}
              <br />
              {t('titleLine3')}
              <br />
              <span className="italic font-thin text-accent-glow">
                {t('titleLine4')}
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl opacity-70 font-light leading-relaxed mb-12">
              {t('description')}
            </p>

            <div className="flex flex-wrap gap-4">
              {/* CTA principal — destino dinâmico conforme estado do edital */}
              <Link
                href={cadastrarHref}
                className="inline-flex items-center gap-3 font-semibold uppercase tracking-[0.02em] cursor-pointer border border-transparent transition-all duration-300 bg-accent text-bg-base hover:bg-accent-glow hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(46,163,155,0.4)] px-8 py-[18px] text-[14px]"
              >
                {t('ctaPrimary')}
                <ArrowRight width={16} height={16} />
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 font-semibold uppercase tracking-[0.02em] cursor-pointer border border-transparent transition-all duration-300 bg-transparent text-warm-white border-line-strong hover:border-accent-glow hover:text-accent-glow hover:-translate-y-0.5 px-8 py-[18px] text-[14px]"
              >
                {t('ctaSecondary')}
              </Link>
            </div>

            <p className="text-sm opacity-50 max-w-xl mt-6 leading-relaxed">
              {t('caption')}
            </p>
          </div>

          {/* Coluna direita — meta cards */}
          <div className="hidden lg:block col-span-4">
            <GlassPanel className="p-8 space-y-8">
              {editalAtivo ? (
                /* ── Edital ABERTO ── */
                <Link href="/cadastrar" className="block group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <Eyebrow>{t('meta.editalLabel')}</Eyebrow>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent-glow animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.18em] text-accent-glow font-bold">
                        {t('meta.editalStatus')}
                      </span>
                    </div>
                  </div>
                  <div className="font-display text-2xl font-light mb-1 group-hover:text-accent-glow transition-colors">
                    {editalNome}
                  </div>
                  <div className="text-sm opacity-60 mb-4">
                    {editalDeadline}
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-glow font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('meta.editalCta')}
                    <ArrowRight width={12} height={12} />
                  </div>
                </Link>
              ) : (
                /* ── Edital FECHADO — CTA de cadastro livre ── */
                <Link href="/cadastrar/tipo" className="block group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <Eyebrow>{t('meta.cadastreSe')}</Eyebrow>
                  </div>
                  <div className="font-display text-2xl font-light mb-1 group-hover:text-accent-glow transition-colors">
                    {t('meta.cadastreCta')}
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-glow font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                    {t('meta.cadastreSeCta')}
                    <ArrowRight width={12} height={12} />
                  </div>
                </Link>
              )}

              <Hairline />

              <div>
                <Eyebrow>{t('meta.updateLabel')}</Eyebrow>
                <div className="font-display text-2xl font-light mb-1 mt-3">
                  {t('meta.updateDate')}
                </div>
                <div className="text-sm opacity-60">
                  {t('meta.updateDescription')}
                </div>
              </div>

              <Hairline />

              <div>
                <Eyebrow>{t('meta.statusLabel')}</Eyebrow>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-accent-glow animate-pulse" />
                  <div className="font-display text-lg font-light">
                    {t('meta.statusValue')}
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-12 left-8 flex items-center gap-4">
          <Hairline className="!w-12" />
          <span className="text-[10px] uppercase tracking-[0.18em] opacity-50">
            {t('scrollHint')}
          </span>
        </div>
      </div>
    </section>
  );
}

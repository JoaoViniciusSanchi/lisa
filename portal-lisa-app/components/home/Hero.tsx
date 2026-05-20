'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Hairline } from '@/components/ui/Hairline';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ArrowRight } from '@/components/ui/icons';
import { DotGrid } from './DotGrid';

/**
 * Hero principal — h1 grande, dot grid interativo de fundo,
 * coluna direita com cards de meta-info (edital, atualização, status).
 */
export function Hero() {
  const t = useTranslations('home.hero');

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
              <Button>
                {t('ctaPrimary')}
                <ArrowRight width={16} height={16} />
              </Button>
              <Button variant="secondary">{t('ctaSecondary')}</Button>
            </div>

            <p className="text-sm opacity-50 max-w-xl mt-6 leading-relaxed">
              {t('caption')}
            </p>
          </div>

          {/* Coluna direita — meta cards */}
          <div className="hidden lg:block col-span-4">
            <GlassPanel className="p-8 space-y-8">
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
                  {t('meta.editalName')}
                </div>
                <div className="text-sm opacity-60 mb-4">
                  {t('meta.editalDeadline')}
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-glow font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('meta.editalCta')}
                  <ArrowRight width={12} height={12} />
                </div>
              </Link>

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

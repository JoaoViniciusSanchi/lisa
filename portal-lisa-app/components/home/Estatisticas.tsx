'use client'

'use client'

import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionNum } from '@/components/ui/SectionNum';
import { Hairline } from '@/components/ui/Hairline';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatCounter } from './StatCounter';
import { statTotals } from '@/lib/mock/home-content';

const STATS = [
  { key: 'experiencias', target: statTotals.experiencias },
  { key: 'cnpq', target: statTotals.grandesAreasCnpq },
  { key: 'ods', target: statTotals.ods },
  { key: 'campi', target: statTotals.campi }
] as const;

export function Estatisticas() {
  const t = useTranslations('home.estatisticas');

  return (
    <section className="relative py-32 border-t border-line overflow-hidden">
      {/* Algarismo decorativo gigante de fundo */}
      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 font-display font-thin pointer-events-none select-none"
        style={{
          fontSize: 'clamp(160px, 20vw, 280px)',
          lineHeight: '0.8',
          color: 'var(--bg-elevated)',
          opacity: 0.6,
          letterSpacing: '-0.08em'
        }}
        aria-hidden="true"
      >
        03
      </div>

      <div className="relative max-w-[1600px] mx-auto px-8">
        <div className="flex items-start gap-6 mb-20">
          <SectionNum n={3} />
          <Eyebrow>{t('label')}</Eyebrow>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
          {STATS.map((stat) => (
            <GlassPanel key={stat.key} className="p-10">
              <StatCounter target={stat.target} />
              <Hairline className="my-6" />
              <div className="text-sm uppercase tracking-[0.18em] opacity-60 font-medium">
                {t(`items.${stat.key}`)}
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
}



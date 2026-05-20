'use client'

'use client'

import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionNum } from '@/components/ui/SectionNum';
import { Button } from '@/components/ui/Button';
import { CatalogCard } from './CatalogCard';
import { catalogHighlights } from '@/lib/mock/home-content';

export function CatalogoDestaque() {
  const t = useTranslations('home.catalogo');

  return (
    <section id="catalogo" className="relative py-32 border-t border-line">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-start gap-6 mb-12">
          <SectionNum n={5} />
          <Eyebrow>{t('label')}</Eyebrow>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-8 mb-16">
          <h2 className="font-display text-[clamp(36px,5vw,72px)] font-extralight leading-[1.05] tracking-[-0.04em] max-w-3xl">
            {t('titlePart1')}{' '}
            <span className="italic font-thin text-accent-glow">
              {t('titleAccent')}
            </span>{' '}
            {t('titlePart2')}
          </h2>
          <Button variant="secondary">{t('cta')} â†’</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
          {catalogHighlights.map((card) => (
            <CatalogCard key={card.index} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}



'use client';

import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionNum } from '@/components/ui/SectionNum';
import { GlassPanel } from '@/components/ui/GlassPanel';

const CONCEPTS = ['demanda', 'construcao', 'reaplicabilidade'] as const;

export function Apresentacao() {
  const t = useTranslations('home.apresentacao');

  return (
    <section className="relative py-32 border-t border-line">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-start gap-6 mb-20">
          <SectionNum n={2} />
          <Eyebrow>{t('label')}</Eyebrow>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <h2 className="font-display text-[clamp(36px,5vw,72px)] font-extralight leading-[1.05] tracking-[-0.04em] mb-12">
              {t('titlePart1')}{' '}
              <span className="italic font-thin text-accent-glow">
                {t('titleAccent1')}
              </span>{' '}
              {t('titlePart2')}
              <br />
              {t('titlePart3')}{' '}
              <span className="font-medium">{t('titleAccent2')}</span>{' '}
              {t('titlePart4')}
            </h2>

            <div className="space-y-6 text-lg font-light leading-relaxed opacity-75 max-w-2xl">
              <p>{t('paragraph1')}</p>
              <p>{t('paragraph2')}</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-px">
            {CONCEPTS.map((key, idx) => (
              <GlassPanel key={key} className="p-8">
                <div className="flex items-start gap-4">
                  <span className="font-display text-3xl font-extralight text-accent-glow">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-medium mb-2">
                      {t(`concepts.${key}.title`)}
                    </h3>
                    <p className="text-sm opacity-65 leading-relaxed">
                      {t(`concepts.${key}.description`)}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

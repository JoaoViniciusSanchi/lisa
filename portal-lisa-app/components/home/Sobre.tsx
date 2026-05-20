'use client'

'use client'

import { useTranslations } from 'next-intl';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionNum } from '@/components/ui/SectionNum';
import { Hairline } from '@/components/ui/Hairline';
import { GlassPanel } from '@/components/ui/GlassPanel';

const PARTNERS = ['UFF', 'PROPPI', 'AGIR', 'FAPERJ', 'CAPES', 'CNPq'];

export function Sobre() {
  const t = useTranslations('home.sobre');

  return (
    <section id="sobre" className="relative py-32 border-t border-line">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-start gap-6 mb-20">
          <SectionNum n={6} />
          <Eyebrow>{t('label')}</Eyebrow>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <h2 className="font-display text-[clamp(36px,5vw,72px)] font-extralight leading-[1.05] tracking-[-0.04em] mb-12">
              {t('titlePart1')}{' '}
              <span className="italic font-thin text-accent-glow">
                {t('titleAccent')}
              </span>
              <br />
              {t('titlePart2')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <Eyebrow as="div" className="mb-4">
                  {t('block1.label')}
                </Eyebrow>
                <h3 className="font-display text-2xl font-medium mb-3">
                  {t('block1.title')}
                </h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  {t('block1.description')}
                </p>
              </div>

              <div>
                <Eyebrow as="div" className="mb-4">
                  {t('block2.label')}
                </Eyebrow>
                <h3 className="font-display text-2xl font-medium mb-3">
                  {t('block2.title')}
                </h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  {t('block2.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <GlassPanel variant="strong" className="p-10 space-y-6">
              <div>
                <Eyebrow as="div" className="mb-3">
                  {t('contact.coordLabel')}
                </Eyebrow>
                <div className="font-display text-xl font-medium">
                  {t('contact.coordName')}
                </div>
                <div className="text-sm opacity-60 mt-1">
                  {t('contact.coordRole')}
                </div>
              </div>
              <Hairline />
              <div>
                <Eyebrow as="div" className="mb-3">
                  {t('contact.addressLabel')}
                </Eyebrow>
                <div className="text-sm opacity-80 leading-relaxed whitespace-pre-line">
                  {t('contact.address')}
                </div>
              </div>
              <Hairline />
              <div>
                <Eyebrow as="div" className="mb-3">
                  {t('contact.emailLabel')}
                </Eyebrow>
                <a
                  href={`mailto:${t('contact.email')}`}
                  className="text-sm text-accent-glow hover:underline"
                >
                  {t('contact.email')}
                </a>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Logos parceiros */}
        <div className="mt-24 pt-12 border-t border-line">
          <Eyebrow as="div" className="mb-8">
            {t('partners.label')}
          </Eyebrow>
          <div className="flex flex-wrap items-center gap-12 opacity-50">
            {PARTNERS.map((p) => (
              <div key={p} className="font-display text-2xl font-light">
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



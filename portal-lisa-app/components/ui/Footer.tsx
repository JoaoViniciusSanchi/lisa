'use client'

import { useTranslations } from 'next-intl';
import { LogoMark } from './LogoMark';
import { Eyebrow } from './Eyebrow';
import { Hairline } from './Hairline';
import { LangSwitch } from './LangSwitch';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer
      id="contato"
      className="relative border-t border-line py-20 z-[1]"
    >
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center gap-3 mb-8">
              <LogoMark />
              <div>
                <div className="font-display text-xl font-medium">LISA</div>
                <div className="text-[9px] uppercase tracking-[0.18em] opacity-50">
                  {t('subtitle')}
                </div>
              </div>
            </div>
            <p className="text-sm opacity-60 leading-relaxed max-w-md">
              {t('description')}
            </p>
          </div>

          <div className="col-span-6 md:col-span-3">
            <Eyebrow as="div" className="mb-6">
              {t('navigation.label')}
            </Eyebrow>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-accent-glow transition-colors"
                >
                  {t('navigation.connect')}
                </a>
              </li>
              <li>
                <a
                  href="#catalogo"
                  className="hover:text-accent-glow transition-colors"
                >
                  {t('navigation.catalog')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-accent-glow transition-colors"
                >
                  {t('navigation.edital')}
                </a>
              </li>
              <li>
                <a
                  href="#sobre"
                  className="hover:text-accent-glow transition-colors"
                >
                  {t('navigation.about')}
                </a>
              </li>
              <li>
                <a
                  href="#contato"
                  className="hover:text-accent-glow transition-colors"
                >
                  {t('navigation.contact')}
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <Eyebrow as="div" className="mb-6">
              {t('social.label')}
            </Eyebrow>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-accent-glow transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-accent-glow transition-colors"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-accent-glow transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-2">
            <Eyebrow as="div" className="mb-6">
              {t('language.label')}
            </Eyebrow>
            <LangSwitch />
          </div>
        </div>

        <Hairline className="mb-8" />

        <div className="flex flex-wrap justify-between items-center gap-4 text-xs opacity-50">
          <div>{t('copyright')}</div>
          <div>{t('version')}</div>
        </div>
      </div>
    </footer>
  );
}


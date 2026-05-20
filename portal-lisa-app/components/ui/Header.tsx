'use client'

'use client'

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LogoMark } from './LogoMark';
import { LangSwitch } from './LangSwitch';
import { Button } from './Button';
import { ArrowRight } from './icons';

/**
 * Header global fixo com blur. ContÃ©m logo, navegaÃ§Ã£o, lang switch e CTA.
 * Server Component â€” LangSwitch Ã© Client e fica isolado.
 *
 * Em Fase 1 os links de nav sÃ£o placeholders (#) â€” em Fase 2 viram Ã¢ncoras
 * reais da home, em Fase 4 viram rotas para /catalogo etc.
 */
export function Header() {
  const t = useTranslations('header');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-line backdrop-blur-[20px] backdrop-saturate-[120%] bg-bg-base/75">
      <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-3 group">
          <LogoMark size="small" />
          <div>
            <div className="font-display text-xl font-medium tracking-tight">
              LISA
            </div>
            <div className="text-[9px] uppercase tracking-[0.18em] opacity-50">
              {t('subtitle')}
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <a
            href="#catalogo"
            className="text-sm font-medium hover:text-accent-glow transition-colors"
          >
            {t('nav.catalog')}
          </a>
          <a
            href="#sobre"
            className="text-sm font-medium hover:text-accent-glow transition-colors"
          >
            {t('nav.about')}
          </a>
          <a
            href="#contato"
            className="text-sm font-medium hover:text-accent-glow transition-colors"
          >
            {t('nav.contact')}
          </a>
        </nav>

        <div className="flex items-center gap-6">
          <LangSwitch />
          <Button size="small">
            {t('cta')}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </header>
  );
}



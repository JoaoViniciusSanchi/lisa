// Helper para generateStaticParams com next-intl
// Usado em páginas dinâmicas [locale] para static export

import { routing } from '@/i18n/routing';

export function generateLocaleStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export type LocaleParams = Awaited<ReturnType<typeof generateLocaleStaticParams>>[number];

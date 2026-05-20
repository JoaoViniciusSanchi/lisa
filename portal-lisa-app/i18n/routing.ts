import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  // Decisão de produto: tradução é opt-in, não baseada em geo/Accept-Language
  localeDetection: false
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let requested: string | undefined;
  try {
    requested = await requestLocale;
  } catch {
    // During static generation, requestLocale may fail
    // Use default locale as fallback
    requested = undefined;
  }

  const locale: Locale =
    requested && (routing.locales as readonly string[]).includes(requested)
      ? (requested as Locale)
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

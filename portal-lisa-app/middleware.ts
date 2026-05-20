import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Aplica apenas em rotas públicas — exclui admin, API, assets e arquivos estáticos
  matcher: ['/((?!api|_next|_vercel|admin-lisa-xyz|atualizar|.*\\..*).*)']
};

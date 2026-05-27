import Image from 'next/image';
import { Link } from '@/i18n/routing';

/**
 * Header do formulário /cadastrar-ts.
 * Fundo branco, logo TS à esquerda, "Voltar ao portal" à direita.
 */
export function CadastroHeaderTS() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-ts-accent">
      <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo_ts.svg"
            alt="Tecnologia Social"
            width={300}
            height={72}
            priority
            className="h-[72px] w-auto"
          />
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-sm text-ts-mid font-medium">
            Edital{' '}
            <span className="text-ts-accent font-semibold">
              Chamamento 2026
            </span>
          </div>
          <div className="hidden md:block w-px h-6 bg-ts-mid/30" aria-hidden="true" />
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-ts-mid hover:text-ts-accent transition-colors"
          >
            ← Voltar ao portal
          </Link>
        </div>
      </div>
    </header>
  );
}

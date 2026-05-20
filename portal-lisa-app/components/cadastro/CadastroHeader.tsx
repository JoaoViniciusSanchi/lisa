import { Link } from '@/i18n/routing';
import { LogoMark } from '@/components/ui/LogoMark';

/**
 * Header específico do cadastro — substitui o header global por um
 * minimalista com logo + voltar ao portal.
 */
export function CadastroHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-line backdrop-blur-[20px] backdrop-saturate-[120%] bg-bg-base/85">
      <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size="small" />
          <div>
            <div className="font-display text-xl font-medium tracking-tight">
              LISA
            </div>
            <div className="text-[9px] uppercase tracking-[0.18em] opacity-50">
              Cadastro de Experiência
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-xs opacity-50">
            Edital{' '}
            <span className="text-accent-glow">Chamamento 2026</span>
          </div>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            ← Voltar ao portal
          </Link>
        </div>
      </div>
    </header>
  );
}

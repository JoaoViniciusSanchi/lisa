'use client';

import { Link } from '@/i18n/routing';
import { ArrowRight } from '@/components/ui/icons';

/**
 * Dois cards de seleção de tipo de experiência.
 * Exibidos quando o edital está inativo e o usuário tenta cadastrar.
 *
 * Interna  → vinculada à UFF (projetos, extensão, pesquisa, etc.)
 * Externa  → desenvolvida fora da UFF mas relevante para o catálogo LISA
 *
 * Ambas passam pela fila de moderação.
 */
export function TipoExperienciaCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
      {/* Card Interna */}
      <Link
        href="/cadastrar?tipo=interna"
        className="group relative flex flex-col gap-4 p-8 border border-line bg-bg-elevated hover:border-accent transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        {/* Ícone representativo */}
        <div className="w-10 h-10 flex items-center justify-center border border-line group-hover:border-accent transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
            <path d="M10 2L2 7v11h16V7L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="7" y="12" width="6" height="7" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-warm-white/40 mb-2">
            Tipo de Experiência
          </div>
          <div className="font-display text-2xl font-light mb-3 group-hover:text-accent-glow transition-colors">
            Experiência Interna
          </div>
          <p className="text-sm text-warm-white/60 leading-relaxed">
            Projeto, laboratório, programa de extensão ou pesquisa desenvolvido
            dentro da Universidade Federal Fluminense (UFF) ou por pesquisadores
            e comunidades vinculados à universidade.
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-line/50">
          <div className="text-[11px] text-warm-white/40 mb-1">
            Será revisada pela equipe LISA antes de publicação.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-glow font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Iniciar cadastro
          <ArrowRight width={12} height={12} />
        </div>
      </Link>

      {/* Card Externa */}
      <Link
        href="/cadastrar?tipo=externa"
        className="group relative flex flex-col gap-4 p-8 border border-line bg-bg-elevated hover:border-accent transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        {/* Ícone representativo */}
        <div className="w-10 h-10 flex items-center justify-center border border-line group-hover:border-accent transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 2c-2.5 3-3 5-3 8s.5 5 3 8M10 2c2.5 3 3 5 3 8s-.5 5-3 8M2 10h16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-warm-white/40 mb-2">
            Tipo de Experiência
          </div>
          <div className="font-display text-2xl font-light mb-3 group-hover:text-accent-glow transition-colors">
            Experiência Externa
          </div>
          <p className="text-sm text-warm-white/60 leading-relaxed">
            Iniciativa de tecnologia social desenvolvida fora da UFF — por
            organizações da sociedade civil, governos locais, empresas sociais ou
            outras universidades — mas com relevância para o catálogo LISA.
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-line/50">
          <div className="text-[11px] text-warm-white/40 mb-1">
            Será revisada pela equipe LISA antes de publicação.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-glow font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Iniciar cadastro
          <ArrowRight width={12} height={12} />
        </div>
      </Link>
    </div>
  );
}

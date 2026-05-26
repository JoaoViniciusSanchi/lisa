'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavChild {
  href: string;
  label: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: boolean;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  { href: '/admin-lisa-xyz', label: 'Dashboard', icon: '◈' },
  { href: '/admin-lisa-xyz/fila', label: 'Fila de Moderação', icon: '◉', badge: true },
  {
    href: '/admin-lisa-xyz/experiencias',
    label: 'Experiências',
    icon: '◆',
    children: [
      { href: '/admin-lisa-xyz/experiencias/internas', label: 'Internas (UFF)' },
      { href: '/admin-lisa-xyz/experiencias/externas', label: 'Externas' },
    ],
  },
  { href: '/admin-lisa-xyz/pesquisadores', label: 'Pesquisadores', icon: '◍' },
  { href: '/admin-lisa-xyz/traducoes', label: 'Traduções', icon: '◎' },
  { href: '/admin-lisa-xyz/emails', label: 'E-mails', icon: '✉' },
  { href: '/admin-lisa-xyz/importar', label: 'Importar Experiência', icon: '⇧' },
  { href: '/admin-lisa-xyz/config', label: 'Configurações', icon: '◇' },
];

export default function AdminSidebar({ filaCount }: { filaCount: number }) {
  const pathname = usePathname();
  const [experienciasOpen, setExperienciasOpen] = useState(
    pathname.startsWith('/admin-lisa-xyz/experiencias')
  );

  function isActive(href: string) {
    if (href === '/admin-lisa-xyz') return pathname === '/admin-lisa-xyz';
    return pathname.startsWith(href);
  }

  function isChildActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const linkClass = (active: boolean) =>
    `flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] mb-1 transition-colors border-l-2 pl-[10px] ${
      active
        ? 'bg-accent/10 text-accent border-accent'
        : 'text-warm-white/60 hover:text-warm-white hover:bg-white/5 border-transparent'
    }`;

  return (
    <aside className="w-60 flex-shrink-0 bg-bg-elevated border-r border-line flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-line">
        <div className="logo-mark logo-mark-sm flex-shrink-0" />
        <div>
          <div className="text-[10px] uppercase tracking-eyebrow text-accent-glow">Admin</div>
          <div className="font-display font-bold text-[15px] tracking-tight">LISA</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        {NAV.map((item) => {
          if (item.children) {
            const groupActive = isActive(item.href);
            const isOpen = item.href === '/admin-lisa-xyz/experiencias'
              ? experienciasOpen
              : groupActive;

            return (
              <div key={item.href}>
                <button
                  onClick={() => setExperienciasOpen((v) => !v)}
                  className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] mb-1 transition-colors border-l-2 pl-[10px] ${
                    groupActive
                      ? 'text-accent border-accent'
                      : 'text-warm-white/60 hover:text-warm-white hover:bg-white/5 border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[16px]">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-warm-white/30">
                    {isOpen ? '▴' : '▾'}
                  </span>
                </button>

                {isOpen && (
                  <div className="mb-1 ml-5 border-l border-line/40 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-2 py-2 text-[12px] mb-0.5 transition-colors ${
                          isChildActive(child.href)
                            ? 'text-accent'
                            : 'text-warm-white/50 hover:text-warm-white'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(active)}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-[16px]">{item.icon}</span>
                {item.label}
              </span>
              {item.badge && filaCount > 0 && (
                <span className="bg-accent text-bg-base text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center">
                  {filaCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-line">
        <Link
          href="/pt"
          className="flex items-center gap-2 px-3 py-2 text-[12px] text-warm-white/40 hover:text-warm-white/60 transition-colors"
        >
          <span>←</span>
          <span>Voltar ao site</span>
        </Link>
      </div>
    </aside>
  );
}

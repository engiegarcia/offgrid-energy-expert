'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EstadoBackend } from '@/components/EstadoBackend';
import { LogoMark } from '@/components/icons';
import { cn } from '@/lib/cn';

const ENLACES = [
  { href: '/', label: 'Evaluar' },
  { href: '/reglas', label: 'Reglas' },
] as const;

/** Banda oscura que continúa en el héroe de cada página. */
export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="bg-night">
      <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="focus-ring-dark flex items-center gap-2.5 rounded-md py-1 pr-1 font-display text-base font-semibold text-white"
          >
            <LogoMark className="h-8 w-8 shrink-0" />
            <span className="hidden min-[400px]:inline">Energía off-grid</span>
          </Link>
          <nav aria-label="Principal">
            <ul className="flex items-center gap-1">
              {ENLACES.map(({ href, label }) => {
                const activo = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={activo ? 'page' : undefined}
                      className={cn(
                        'focus-ring-dark inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors',
                        activo
                          ? 'bg-white text-night'
                          : 'text-white/75 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <EstadoBackend />
      </div>
    </header>
  );
}

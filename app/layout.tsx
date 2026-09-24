import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/jetbrains-mono';
import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Providers } from '@/components/Providers';
import { SiteHeader } from '@/components/SiteHeader';
import { COLORES_BASE, VIABILIDAD_COLORES } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Energía off-grid · Sistema experto',
    template: '%s · Energía off-grid',
  },
  description:
    'Sistema experto para seleccionar fuentes de energía renovable off-grid en comunidades rurales.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: COLORES_BASE.night,
};

/** Toasts (sonner) con la paleta del proyecto. */
const estiloToaster = {
  '--normal-bg': COLORES_BASE.surface,
  '--normal-border': COLORES_BASE.line,
  '--normal-text': COLORES_BASE.ink,
  '--error-bg': VIABILIDAD_COLORES.inviable.soft,
  '--error-border': VIABILIDAD_COLORES.inviable.solid,
  '--error-text': COLORES_BASE.ink,
  '--border-radius': '10px',
  fontFamily: 'inherit',
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="focus-ring sr-only rounded-md bg-surface px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-overlay"
        >
          Saltar al contenido
        </a>
        <Providers>
          <SiteHeader />
          <div id="contenido" className="flex-1">
            {children}
          </div>
          <footer className="bg-night py-8">
            <p className="mx-auto w-full max-w-page px-4 text-sm text-white/70 sm:px-6">
              Proyecto del curso Sistemas Inteligentes, UNMSM.
            </p>
          </footer>
        </Providers>
        <Toaster position="bottom-right" richColors style={estiloToaster} />
      </body>
    </html>
  );
}

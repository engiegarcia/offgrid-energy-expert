'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { DURACION, EASE } from '@/lib/constants';

/**
 * - React Query: caché y ciclo de vida de las peticiones.
 * - MotionConfig: easing/duración por defecto de todo framer-motion y respeto
 *   automático de `prefers-reduced-motion`.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <MotionConfig reducedMotion="user" transition={{ duration: DURACION.base, ease: [...EASE] }}>
        {children}
      </MotionConfig>
    </QueryClientProvider>
  );
}

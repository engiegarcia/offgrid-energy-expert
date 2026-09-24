'use client';

import { useQuery } from '@tanstack/react-query';
import { obtenerReglas } from '@/lib/api';

/** Reglas del motor. Son estáticas: se piden una sola vez por sesión. */
export function useReglas(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['reglas'],
    queryFn: () => obtenerReglas(),
    enabled: options.enabled ?? true,
    staleTime: Infinity,
    retry: 1,
  });
}

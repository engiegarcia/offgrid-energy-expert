'use client';

import { useQuery } from '@tanstack/react-query';
import { verificarSalud } from '@/lib/api';

/** Sondeo ligero de GET /health para el indicador del encabezado. */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: verificarSalud,
    refetchInterval: 30_000,
    retry: false,
    staleTime: 15_000,
  });
}

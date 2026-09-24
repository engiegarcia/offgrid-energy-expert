'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiNetworkError, ApiServerError, evaluarZona, type ApiError } from '@/lib/api';
import type { EvaluacionRequest, EvaluacionResponse } from '@/types/api';

/**
 * Envuelve `evaluarZona` en una mutación de React Query.
 *
 * Por qué React Query y no `useState` + `useEffect`: la evaluación es un POST
 * (no una lectura cacheable), pero la mutación entrega gratis `isPending`,
 * `error` tipado, `reset` y un ciclo de vida predecible (cancelación al
 * desmontar, sin condiciones de carrera al reenviar).
 *
 * Los toasts cubren los errores de infraestructura (red/servidor). El 422 no
 * lleva toast: se pinta junto a cada campo en el formulario.
 */
export function useEvaluarZona() {
  return useMutation<EvaluacionResponse, ApiError, EvaluacionRequest>({
    mutationFn: evaluarZona,
    onError: (error) => {
      if (error instanceof ApiNetworkError) {
        toast.error(
          error.reason === 'timeout'
            ? 'El motor no respondió a tiempo'
            : 'No hay conexión con el motor',
          { description: 'Revisa que el backend esté en línea y vuelve a intentarlo.' },
        );
      } else if (error instanceof ApiServerError) {
        toast.error('El motor tuvo un problema', {
          description: 'Tus datos no se perdieron. Puedes reintentar la evaluación.',
        });
      }
    },
  });
}

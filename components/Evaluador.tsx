'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorResultado } from '@/components/ErrorResultado';
import { EstadoInicial } from '@/components/EstadoVacio';
import { EvaluacionForm } from '@/components/EvaluacionForm';
import { ResultadosEvaluacion } from '@/components/ResultadosEvaluacion';
import { ResultadosSkeleton } from '@/components/ResultadosSkeleton';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEvaluarZona } from '@/hooks/useEvaluarZona';
import { ApiValidationError } from '@/lib/api';
import { NIVELES_ORDEN, RECURSOS, VALOR_ORDINAL } from '@/lib/constants';
import type { Coordenadas, EvaluacionRequest, NivelViabilidad } from '@/types/api';

/**
 * Leaflet lee `window` al importarse: se carga solo en el cliente.
 * El skeleton reserva el mismo espacio para que el layout no salte.
 */
const MapaComunidad = dynamic(() => import('@/components/MapaComunidad'), {
  ssr: false,
  loading: () => <MapaSkeleton />,
});

function MapaSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full max-w-prose" />
      </CardHeader>
      <CardBody>
        <Skeleton className="h-72 w-full sm:h-80" />
      </CardBody>
    </Card>
  );
}

export function Evaluador() {
  const { mutate, isPending, isError, error, data } = useEvaluarZona();

  // Ubicación solo visual. NO forma parte del payload (ver MapaComunidad.tsx).
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);

  const ultimoPayload = useRef<EvaluacionRequest | null>(null);
  const resultados = useRef<HTMLDivElement>(null);

  const evaluar = useCallback(
    (payload: EvaluacionRequest) => {
      ultimoPayload.current = payload;
      mutate(payload);
    },
    [mutate],
  );

  const reintentar = useCallback(() => {
    if (ultimoPayload.current) mutate(ultimoPayload.current);
  }, [mutate]);

  // 422 del backend → mensajes junto a cada campo.
  const erroresServidor = useMemo(
    () => (error instanceof ApiValidationError ? error.fieldErrors() : undefined),
    [error],
  );

  // En pantallas de una columna, lleva la vista a los resultados al enviar.
  useEffect(() => {
    if (!isPending || window.matchMedia('(min-width: 1024px)').matches) return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultados.current?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
  }, [isPending]);

  // El marcador toma el color del mejor nivel de viabilidad del resultado.
  const mejorNivel: NivelViabilidad | undefined = useMemo(() => {
    if (!data?.viabilidades) return undefined;
    const max = Math.max(
      ...RECURSOS.map((r) => VALOR_ORDINAL[data.viabilidades[r] ?? 'inviable'] ?? 0),
    );
    return NIVELES_ORDEN[max] ?? 'inviable';
  }, [data]);

  const anuncio = isPending
    ? 'Evaluando la zona…'
    : data
      ? `Evaluación lista: ${data.recomendaciones.length} recomendaciones.`
      : '';

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-workspace lg:items-start">
      <EvaluacionForm onSubmit={evaluar} isPending={isPending} serverErrors={erroresServidor} />

      <div ref={resultados} className="flex min-w-0 scroll-mt-6 flex-col gap-6">
        <p role="status" className="sr-only">
          {anuncio}
        </p>
        {isPending ? (
          <ResultadosSkeleton />
        ) : isError && error ? (
          <ErrorResultado error={error} onRetry={reintentar} />
        ) : data ? (
          <ResultadosEvaluacion data={data} />
        ) : (
          <EstadoInicial />
        )}
        <MapaComunidad value={ubicacion} onChange={setUbicacion} nivel={mejorNivel} />
      </div>
    </div>
  );
}

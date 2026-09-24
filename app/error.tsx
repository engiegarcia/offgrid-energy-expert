'use client';

import { useEffect } from 'react';
import { IconAlert } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/** Error boundary global: errores de render no capturados en ninguna ruta. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-page px-4 py-16 sm:px-6">
      <Card role="alert" className="flex max-w-prose flex-col items-start gap-4 p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-viab-inviable-soft text-viab-inviable-ink">
          <IconAlert />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-xl font-semibold text-ink">
            Algo salió mal en esta página
          </h1>
          <p className="text-sm text-ink-muted">
            Ocurrió un error inesperado. Puedes intentar cargarla de nuevo; si persiste, recarga el
            navegador.
          </p>
          {error.digest ? (
            <p className="mt-1 font-mono text-xs text-ink-subtle">Referencia: {error.digest}</p>
          ) : null}
        </div>
        <Button onClick={reset}>Reintentar</Button>
      </Card>
    </main>
  );
}

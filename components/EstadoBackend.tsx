'use client';

import { useHealth } from '@/hooks/useHealth';
import { cn } from '@/lib/cn';

/** Indicador discreto de GET /health en el encabezado. */
export function EstadoBackend() {
  const { data, isPending, isError } = useHealth();
  const estado = isPending ? 'comprobando' : isError || data?.status !== 'ok' ? 'caido' : 'ok';
  const etiqueta = {
    comprobando: 'Comprobando el motor',
    ok: 'Motor en línea',
    caido: 'Motor sin conexión',
  }[estado];

  return (
    <p
      role="status"
      className="flex h-8 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-medium text-white/85 ring-1 ring-inset ring-white/15"
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-2 w-2 rounded-full transition-colors',
          estado === 'ok' && 'bg-[#5FD394]',
          estado === 'caido' && 'bg-[#F0857C]',
          estado === 'comprobando' && 'animate-breathe bg-white/50',
        )}
      />
      <span className="sr-only sm:not-sr-only">{etiqueta}</span>
    </p>
  );
}

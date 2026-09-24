'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useId, useState } from 'react';
import { IconChevronDown, iconoDeTecnologia } from '@/components/icons';
import { badgeClasses } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useReglas } from '@/hooks/useReglas';
import { CAPA_LABEL, DURACION, EASE } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { itemVariants } from '@/lib/motion';
import type { RecomendacionItem } from '@/types/api';

/**
 * Card de una recomendación. El badge con el código de la regla abre un panel
 * inline con su detalle (datos de GET /api/reglas, pedidos solo al abrir).
 * Debe renderizarse dentro de un `motion.ul` con `listaVariants` para el stagger.
 */
export function RecomendacionCard({ recomendacion }: { recomendacion: RecomendacionItem }) {
  const [abierto, setAbierto] = useState(false);
  const panelId = useId();
  const { data: reglas, isPending, isError, refetch } = useReglas({ enabled: abierto });
  const regla = reglas?.find((r) => r.codigo === recomendacion.regla_origen);
  const Icono = iconoDeTecnologia(recomendacion.tecnologia);

  return (
    <motion.li variants={itemVariants}>
      <Card className="flex flex-col gap-3 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-night text-sun">
            <Icono className="h-6 w-6" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-display text-lg font-semibold text-ink">
                {recomendacion.tecnologia}
              </h4>
              <button
                type="button"
                aria-expanded={abierto}
                aria-controls={panelId}
                aria-label={`Regla ${recomendacion.regla_origen}: ver detalle`}
                onClick={() => setAbierto((v) => !v)}
                className={badgeClasses(
                  'accent',
                  cn(
                    'focus-ring shrink-0 cursor-pointer gap-1 pr-1.5 font-mono hover:bg-accent hover:text-white',
                    abierto && 'bg-accent text-white',
                  ),
                )}
              >
                {recomendacion.regla_origen}
                <IconChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform', abierto && 'rotate-180')}
                />
              </button>
            </div>
            <p className="max-w-prose text-sm text-ink-muted">{recomendacion.justificacion}</p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {abierto ? (
            <motion.div
              id={panelId}
              role="region"
              aria-label={`Detalle de la regla ${recomendacion.regla_origen}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DURACION.base, ease: [...EASE] }}
              className="overflow-hidden"
            >
              <div className="ml-15 flex flex-col gap-3 border-t border-line pt-3">
                {isPending ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : isError ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-ink-muted">
                      No se pudo cargar el detalle de la regla.
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                      Reintentar
                    </Button>
                  </div>
                ) : regla ? (
                  <>
                    <p className="text-xs font-medium text-ink-subtle">
                      {CAPA_LABEL[regla.capa] ?? `Capa ${regla.capa}`}
                    </p>
                    <p className="text-sm text-ink">{regla.descripcion}</p>
                    <p className="rounded-md bg-ground px-3 py-2 font-mono text-xs leading-5 text-ink-muted ring-1 ring-inset ring-line">
                      {regla.condicion}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">
                    El backend no devolvió metadatos para {recomendacion.regla_origen}.
                  </p>
                )}
                <Link
                  href={`/reglas?q=${encodeURIComponent(recomendacion.regla_origen)}`}
                  className="focus-ring w-fit rounded-sm text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline"
                >
                  Ver en la lista de reglas
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
    </motion.li>
  );
}

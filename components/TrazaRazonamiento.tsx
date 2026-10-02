'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useState } from 'react';
import {
  IconChevronDown,
  IconMaximize,
  IconMinimize,
} from '@/components/icons';
import { TablaSecuencia } from '@/components/TablaSecuencia';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { generarFilasSecuencia } from '@/lib/explicabilidad';
import type { EvaluacionRequest, EvaluacionResponse } from '@/types/api';

const ArbolInferencia = dynamic(() => import('@/components/ArbolInferencia'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center rounded-xl border border-line bg-surface/50 text-xs text-ink-muted">
      Cargando árbol interactivo de inferencia…
    </div>
  ),
});

interface TrazaRazonamientoProps {
  data: EvaluacionResponse;
  request?: EvaluacionRequest | null;
}

export function TrazaRazonamiento({ data, request }: TrazaRazonamientoProps) {
  const [abierto, setAbierto] = useState(true);
  const [vista, setVista] = useState<'arbol' | 'secuencia'>('arbol');
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);
  const contenidoId = useId();

  // Controlar tecla Escape para salir de pantalla completa y bloquear scroll del body
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && esPantallaCompleta) {
        setEsPantallaCompleta(false);
      }
    }
    if (esPantallaCompleta) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [esPantallaCompleta]);

  if (!request) {
    return null;
  }

  const filasSecuencia = generarFilasSecuencia(request, data);

  return (
    <Card
      className={cn(
        'overflow-hidden border-line transition-all',
        esPantallaCompleta
          ? 'fixed inset-0 z-50 flex h-screen w-screen flex-col rounded-none bg-surface shadow-2xl p-0'
          : '',
      )}
    >
      <CardHeader className="border-b border-line/70 bg-ground/40 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full bg-night px-2.5 font-mono text-xs font-semibold text-sun">
                XAI
              </span>
              <h3 className="font-display text-base font-semibold text-ink">
                Cadena de Inferencia del Sistema Experto
              </h3>
            </div>
            <p className="text-xs text-ink-muted">
              Visualización interactiva del encadenamiento deductivo (Forward Chaining) ejecutado por CLIPS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {abierto ? (
              <div className="flex items-center rounded-lg border border-line bg-surface p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setVista('arbol')}
                  className={cn(
                    'rounded-md px-2.5 py-1 transition-colors',
                    vista === 'arbol'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  Árbol Interactivo
                </button>
                <button
                  type="button"
                  onClick={() => setVista('secuencia')}
                  className={cn(
                    'rounded-md px-2.5 py-1 transition-colors',
                    vista === 'secuencia'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  Secuencia (Tabla)
                </button>
              </div>
            ) : null}

            {/* Botón Ampliar / Restaurar Pantalla Completa */}
            {abierto ? (
              <button
                type="button"
                title={esPantallaCompleta ? 'Salir de pantalla completa (Esc)' : 'Ampliar a pantalla completa'}
                aria-label={esPantallaCompleta ? 'Salir de pantalla completa' : 'Ampliar a pantalla completa'}
                onClick={() => setEsPantallaCompleta((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ground"
              >
                {esPantallaCompleta ? (
                  <>
                    <IconMinimize className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline">Restaurar</span>
                  </>
                ) : (
                  <>
                    <IconMaximize className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline">Ampliar</span>
                  </>
                )}
              </button>
            ) : null}

            {/* Botón Ocultar / Ver */}
            {!esPantallaCompleta ? (
              <button
                type="button"
                aria-expanded={abierto}
                aria-controls={contenidoId}
                onClick={() => setAbierto((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ground"
              >
                <span>{abierto ? 'Ocultar' : 'Ver'}</span>
                <IconChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform duration-200', abierto && 'rotate-180')}
                />
              </button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      {abierto ? (
        <CardBody
          id={contenidoId}
          className={cn(
            'flex flex-col gap-6 pt-5',
            esPantallaCompleta ? 'flex-1 overflow-y-auto min-h-0 pb-6' : '',
          )}
        >
          {vista === 'arbol' ? (
            <div className={cn('flex flex-col gap-2', esPantallaCompleta ? 'flex-1 min-h-0' : '')}>
              <ArbolInferencia
                data={data}
                request={request}
                className={esPantallaCompleta ? 'flex-1 h-full min-h-[480px]' : 'h-[560px]'}
              />
              <p className="text-center text-[11px] text-ink-subtle">
                💡 Pista: Haz clic y arrastra cualquier nodo para reorganizar el árbol a tu gusto. Usa la rueda del ratón para hacer zoom{esPantallaCompleta ? ' (Presiona Esc para salir).' : '.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <TablaSecuencia filas={filasSecuencia} />
              <p className="text-center text-xs text-ink-subtle sm:text-left">
                Traza de encadenamiento hacia adelante: pasos de deducción cronológica ejecutados sobre el motor Rete.
              </p>
            </div>
          )}
        </CardBody>
      ) : null}
    </Card>
  );
}

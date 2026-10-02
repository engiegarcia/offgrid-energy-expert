'use client';

import { Badge } from '@/components/ui/Badge';
import type { FilaSecuencia } from '@/lib/explicabilidad';

interface TablaSecuenciaProps {
  filas: FilaSecuencia[];
}

export function TablaSecuencia({ filas }: TablaSecuenciaProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-raised">
      <div className="overflow-x-auto">
        <table className="w-full min-w-table border-collapse text-left text-sm">
          <thead>
            <tr className="bg-night text-white">
              <th
                scope="col"
                className="w-14 px-3 py-3 text-center font-display text-xs font-semibold tracking-wider text-white/90 sm:w-16 sm:px-4"
              >
                N
              </th>
              <th
                scope="col"
                className="w-24 px-3 py-3 text-center font-display text-xs font-semibold tracking-wider text-white/90 sm:w-28 sm:px-4"
              >
                Regla
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-display text-xs font-semibold tracking-wider text-white/90 sm:px-6"
              >
                Acción
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-display text-xs font-semibold tracking-wider text-white/90 sm:px-6"
              >
                Resultado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {filas.map((f) => (
              <tr
                key={f.paso}
                className="transition-colors hover:bg-ground/50"
              >
                {/* Paso / Índice */}
                <td className="px-3 py-3.5 text-center font-mono text-xs font-bold text-ink-muted sm:px-4">
                  {f.paso}
                </td>

                {/* Código de regla con el badge oficial de la app */}
                <td className="px-3 py-3.5 text-center sm:px-4">
                  <span className="inline-block rounded-sm bg-accent-soft px-2 py-0.5 font-mono text-xs font-bold text-accent">
                    {f.regla}
                  </span>
                </td>

                {/* Acción (Condición en código mono con ring mineral) */}
                <td className="px-4 py-3.5 sm:px-6">
                  <code className="inline-block rounded-sm bg-ground px-2.5 py-1 font-mono text-xs leading-5 text-ink-muted ring-1 ring-inset ring-line">
                    {f.accion}
                  </code>
                </td>

                {/* Resultado coherente con badges de viabilidad o nombre de tecnología */}
                <td className="px-4 py-3.5 sm:px-6">
                  {f.tipo === 'viabilidad' && f.nivelViabilidad ? (
                    <div className="flex flex-wrap items-center gap-1.5 font-sans text-xs text-ink">
                      <span className="text-ink-muted">viabilidad {f.recursoNombre} =</span>
                      <Badge tone={f.nivelViabilidad} dot className="capitalize">
                        {f.nivelViabilidad}
                      </Badge>
                    </div>
                  ) : f.tipo === 'demanda' ? (
                    <div className="flex flex-wrap items-center gap-1.5 font-sans text-xs text-ink">
                      <span className="text-ink-muted">demanda =</span>
                      <Badge tone="accent" className="capitalize">
                        {f.resultado.replace('demanda = ', '')}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xs font-semibold text-ink sm:text-sm">
                        {f.resultado}
                      </span>
                      {f.resultado !== 'Ninguna tecnología viable' ? (
                        <Badge tone="accent">Prescripción</Badge>
                      ) : null}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default TablaSecuencia;

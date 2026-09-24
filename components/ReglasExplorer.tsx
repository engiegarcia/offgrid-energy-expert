'use client';

import { useMemo, useState } from 'react';
import { IconSearch } from '@/components/icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CAPA_LABEL } from '@/lib/constants';
import type { ReglaMetadata } from '@/types/api';

/** Minúsculas y sin tildes, para que "hidraulico" encuentre "hidráulico". */
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function ReglasExplorer({
  reglas,
  initialQuery = '',
}: {
  reglas: ReglaMetadata[];
  initialQuery?: string;
}) {
  const [consulta, setConsulta] = useState(initialQuery);
  const [capa, setCapa] = useState<'todas' | number>('todas');

  const capas = useMemo(
    () => [...new Set(reglas.map((r) => r.capa))].sort((a, b) => a - b),
    [reglas],
  );

  const filtradas = useMemo(() => {
    const q = normalizar(consulta.trim());
    return reglas
      .filter((r) => capa === 'todas' || r.capa === capa)
      .filter(
        (r) =>
          q === '' ||
          normalizar(
            `${r.codigo} ${r.tecnologia_asociada} ${r.descripcion} ${r.condicion}`,
          ).includes(q),
      )
      .sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true }));
  }, [reglas, consulta, capa]);

  const limpiar = () => {
    setConsulta('');
    setCapa('todas');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <Input
            type="search"
            label="Buscar"
            help="Por código, tecnología o texto de la regla."
            icon={<IconSearch className="h-4 w-4" />}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div
          role="group"
          aria-label="Filtrar por capa"
          className="flex w-fit gap-1 rounded-lg border border-line bg-surface p-1 shadow-raised"
        >
          {(['todas', ...capas] as const).map((c) => (
            <Button
              key={c}
              size="sm"
              variant={capa === c ? 'primary' : 'ghost'}
              aria-pressed={capa === c}
              onClick={() => setCapa(c)}
            >
              {c === 'todas' ? 'Todas' : `Capa ${c}`}
            </Button>
          ))}
        </div>
      </div>

      <p role="status" className="text-sm text-ink-muted">
        {filtradas.length} de {reglas.length} reglas
      </p>

      {filtradas.length === 0 ? (
        <Card className="flex flex-col items-start gap-3 border-dashed border-line-strong bg-surface/60 p-6 shadow-none">
          <p className="font-display text-lg font-semibold text-ink">Ninguna regla coincide</p>
          <p className="text-sm text-ink-muted">
            Prueba con otro código o quita el filtro de capa.
          </p>
          <Button variant="secondary" onClick={limpiar}>
            Limpiar filtros
          </Button>
        </Card>
      ) : (
        capas
          .filter((c) => filtradas.some((r) => r.capa === c))
          .map((c) => {
            const delaCapa = filtradas.filter((r) => r.capa === c);
            return (
              <Card key={c} className="overflow-hidden">
                <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
                  <CardTitle as="h2" className="text-lg">
                    {CAPA_LABEL[c] ?? `Capa ${c}`}
                  </CardTitle>
                  <Badge>{delaCapa.length === 1 ? '1 regla' : `${delaCapa.length} reglas`}</Badge>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-table table-fixed text-left text-sm">
                    <thead>
                      <tr className="bg-ground/70 text-xs text-ink-muted">
                        <th scope="col" className="w-24 px-5 py-2.5 font-medium">
                          Código
                        </th>
                        <th scope="col" className="w-1/4 px-3 py-2.5 font-medium">
                          Descripción
                        </th>
                        <th scope="col" className="w-1/3 px-3 py-2.5 font-medium">
                          Condición
                        </th>
                        <th scope="col" className="px-5 py-2.5 font-medium">
                          Tecnología
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {delaCapa.map((r) => (
                        <tr
                          key={r.codigo}
                          id={r.codigo}
                          className="scroll-mt-6 border-t border-line align-top transition-colors target:bg-accent-soft hover:bg-ground/50"
                        >
                          <th scope="row" className="px-5 py-3.5">
                            <span className="rounded-sm bg-accent-soft px-2 py-1 font-mono text-xs font-medium text-accent">
                              {r.codigo}
                            </span>
                          </th>
                          <td className="px-3 py-3.5 text-ink">{r.descripcion}</td>
                          <td className="px-3 py-3.5">
                            <code className="inline-block rounded-sm bg-ground px-2 py-1 font-mono text-xs leading-5 text-ink-muted ring-1 ring-inset ring-line">
                              {r.condicion}
                            </code>
                          </td>
                          <td className="px-5 py-3.5">
                            {r.tecnologia_asociada ? (
                              <Badge tone="accent">{r.tecnologia_asociada}</Badge>
                            ) : (
                              <span className="text-ink-subtle">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })
      )}
    </div>
  );
}

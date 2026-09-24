'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  COLORES_BASE,
  DURACION,
  NIVEL_CLASES,
  NIVEL_LABEL,
  NIVELES_ORDEN,
  RECURSO_LABEL,
  RECURSOS,
  VALOR_ORDINAL,
  VIABILIDAD_COLORES,
} from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { NivelViabilidad, ViabilidadesPorRecurso } from '@/types/api';

interface Dato {
  etiqueta: string;
  nivel: NivelViabilidad;
  nivelTexto: string;
  valor: number;
}

function TooltipViabilidad({ active, payload }: TooltipProps<number, string>) {
  const dato = payload?.[0]?.payload as Dato | undefined;
  if (!active || !dato) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-sm shadow-overlay">
      <p className="font-medium text-ink">{dato.etiqueta}</p>
      <p className="flex items-center gap-2 text-ink-muted">
        <span
          aria-hidden="true"
          className={cn('h-2 w-2 rounded-full', NIVEL_CLASES[dato.nivel].dot)}
        />
        Viabilidad {dato.nivelTexto.toLowerCase()}
      </p>
    </div>
  );
}

/**
 * Pista de cada barra. Recharts le pasa el rectángulo completo (x, y, ancho, alto)
 * y los campos del dato; el nivel se escribe justo a la derecha, en una columna fija.
 */
function Pista(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  nivelTexto?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, nivelTexto = '' } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} fill={COLORES_BASE.ground} />
      <text
        x={x + width + 14}
        y={y + height / 2}
        dominantBaseline="central"
        fill={COLORES_BASE.ink}
        fontSize={13}
        fontWeight={600}
      >
        {nivelTexto}
      </text>
    </g>
  );
}

/**
 * Viabilidad ordinal por recurso (inviable=0 … alta=3), en barras horizontales
 * sobre una pista. Cada barra lleva su nivel escrito a la derecha y hay una
 * clave de color debajo: el color nunca es el único portador de información.
 * Las barras crecen desde cero al montar y transicionan al cambiar los datos.
 */
export function GraficoViabilidad({ viabilidades }: { viabilidades: ViabilidadesPorRecurso }) {
  const datos: Dato[] = RECURSOS.map((recurso) => {
    const nivel = viabilidades[recurso];
    return {
      etiqueta: RECURSO_LABEL[recurso],
      nivel,
      nivelTexto: NIVEL_LABEL[nivel],
      valor: VALOR_ORDINAL[nivel],
    };
  });

  const resumen = datos.map((d) => `${d.etiqueta}: ${d.nivelTexto.toLowerCase()}`).join('; ');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Viabilidad por recurso</CardTitle>
        <CardDescription>Nivel que el motor asignó a cada fuente con estos datos.</CardDescription>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div
          role="img"
          aria-label={`Gráfico de viabilidad por recurso. ${resumen}.`}
          className="h-60 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={datos}
              margin={{ top: 4, right: 76, bottom: 4, left: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid horizontal={false} stroke={COLORES_BASE.line} strokeDasharray="2 5" />
              <XAxis type="number" domain={[0, 3]} ticks={[0, 1, 2, 3]} hide />
              <YAxis
                type="category"
                dataKey="etiqueta"
                width={92}
                tickLine={false}
                axisLine={false}
                tick={{ fill: COLORES_BASE.ink, fontSize: 14, fontWeight: 500 }}
              />
              <Tooltip
                content={<TooltipViabilidad />}
                cursor={{ fill: COLORES_BASE.ink, fillOpacity: 0.03 }}
              />
              <Bar
                dataKey="valor"
                barSize={24}
                radius={8}
                minPointSize={6}
                background={<Pista />}
                isAnimationActive
                animationDuration={DURACION.grafico * 1000}
                animationEasing="ease-out"
              >
                {datos.map((d) => (
                  <Cell key={d.etiqueta} fill={VIABILIDAD_COLORES[d.nivel].solid} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ul
          aria-label="Clave de colores"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-ink-muted"
        >
          {NIVELES_ORDEN.map((nivel) => (
            <li key={nivel} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn('h-2.5 w-2.5 rounded-full', NIVEL_CLASES[nivel].dot)}
              />
              {NIVEL_LABEL[nivel]}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

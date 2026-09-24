'use client';

import { motion } from 'framer-motion';
import { EstadoVacio } from '@/components/EstadoVacio';
import { GraficoViabilidad } from '@/components/GraficoViabilidad';
import { RecomendacionCard } from '@/components/RecomendacionCard';
import { DEMANDA_INFO } from '@/lib/constants';
import { listaVariants } from '@/lib/motion';
import type { EvaluacionResponse } from '@/types/api';

export function ResultadosEvaluacion({ data }: { data: EvaluacionResponse }) {
  const demanda = DEMANDA_INFO[data.demanda_clasificada];
  const total = data.recomendaciones.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="break-words font-display text-2xl font-semibold text-ink">
          Resultados para {data.id_comunidad}
        </h2>
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          Demanda clasificada como
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-medium text-accent">
            {demanda.label.toLowerCase()}
          </span>
        </p>
        <p className="max-w-prose text-sm text-ink-muted">{demanda.descripcion}</p>
      </header>

      {total === 0 ? (
        <EstadoVacio viabilidades={data.viabilidades} />
      ) : (
        <section aria-labelledby="titulo-recomendaciones" className="flex flex-col gap-3">
          <h3 id="titulo-recomendaciones" className="font-display text-lg font-semibold text-ink">
            {total === 1 ? 'Tecnología recomendada' : `${total} tecnologías recomendadas`}
          </h3>
          <motion.ul
            variants={listaVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            {data.recomendaciones.map((r) => (
              <RecomendacionCard key={`${r.regla_origen}-${r.tecnologia}`} recomendacion={r} />
            ))}
          </motion.ul>
        </section>
      )}

      <GraficoViabilidad viabilidades={data.viabilidades} />
    </div>
  );
}

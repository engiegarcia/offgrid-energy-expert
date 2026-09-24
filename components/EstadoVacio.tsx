import { Card } from '@/components/ui/Card';
import { IconSun } from '@/components/icons';
import { NIVEL_LABEL, RECURSO_LABEL, RECURSOS, VALOR_ORDINAL } from '@/lib/constants';
import type { ViabilidadesPorRecurso } from '@/types/api';

function Mensaje({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="flex items-start gap-4 border-dashed border-line-strong bg-surface/60 p-6 shadow-none">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-night text-sun">
        <IconSun />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-lg font-semibold text-ink">{titulo}</p>
        <div className="max-w-prose text-sm text-ink-muted">{children}</div>
      </div>
    </Card>
  );
}

/** Ninguna regla de la Capa 2 se disparó: no es un error, es un resultado. */
export function EstadoVacio({ viabilidades }: { viabilidades: ViabilidadesPorRecurso }) {
  const mejor = Math.max(...RECURSOS.map((r) => VALOR_ORDINAL[viabilidades[r]]));
  const lideres = RECURSOS.filter((r) => VALOR_ORDINAL[viabilidades[r]] === mejor);
  const nivel = lideres[0] ? NIVEL_LABEL[viabilidades[lideres[0]]].toLowerCase() : '';
  const nombres = lideres.map((r) => RECURSO_LABEL[r]).join(' y ');

  return (
    <Mensaje titulo="Ninguna tecnología es viable con estos datos">
      <p>
        El motor no activó ninguna regla de selección. Esto no es un error: significa que los
        recursos y el presupuesto ingresados no alcanzan para recomendar una tecnología.
      </p>
      <p className="mt-2">
        {mejor === 0
          ? 'Todos los recursos resultaron inviables.'
          : `El mejor nivel es ${nivel} (${nombres}).`}{' '}
        Revisa el gráfico de viabilidad para ver el detalle y prueba con otros valores o un
        presupuesto mayor.
      </p>
    </Mensaje>
  );
}

/** Estado inicial, antes de la primera evaluación. */
export function EstadoInicial() {
  return (
    <Mensaje titulo="Aún no hay resultados">
      <p>
        Completa los datos de la comunidad y presiona «Evaluar zona». Aquí verás las tecnologías
        recomendadas, la regla que las justifica y la viabilidad de cada recurso.
      </p>
    </Mensaje>
  );
}

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconAlert, IconOffline, IconServer } from '@/components/icons';
import { ApiNetworkError, ApiServerError, ApiValidationError, type ApiError } from '@/lib/api';

interface Props {
  error: ApiError;
  onRetry: () => void;
}

/**
 * Tres errores, tres tratamientos:
 *  - red (caído/CORS/timeout): se puede reintentar tal cual;
 *  - validación 422: hay que corregir datos, reintentar no sirve;
 *  - servidor 5xx: mensaje genérico + reintentar.
 */
export function ErrorResultado({ error, onRetry }: Props) {
  let icono = <IconAlert />;
  let titulo = 'No se pudo completar la evaluación';
  let cuerpo: React.ReactNode = error.message;
  let reintentar = true;

  if (error instanceof ApiNetworkError) {
    icono = <IconOffline />;
    titulo = 'No se pudo conectar con el motor';
    cuerpo =
      error.reason === 'timeout'
        ? 'El servidor tardó más de 10 segundos en responder.'
        : 'Revisa que el backend esté en línea y que permita el origen de esta página (CORS).';
  } else if (error instanceof ApiValidationError) {
    titulo = 'El motor rechazó algunos datos';
    reintentar = false;
    const generales = error.generalErrors();
    cuerpo = (
      <>
        <p>Corrige los campos marcados en el formulario y vuelve a evaluar.</p>
        {generales.length > 0 ? (
          <ul className="mt-2 list-disc pl-5">
            {generales.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}
      </>
    );
  } else if (error instanceof ApiServerError) {
    icono = <IconServer />;
    titulo = 'El motor tuvo un problema';
    cuerpo = (
      <>
        <p>Tus datos siguen en el formulario. Intenta de nuevo en unos segundos.</p>
        {error.errorCode ? (
          <p className="mt-2 font-mono text-xs text-ink-subtle">Código: {error.errorCode}</p>
        ) : null}
      </>
    );
  }

  return (
    <Card role="alert" className="flex flex-col items-start gap-3 p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-viab-inviable-soft text-viab-inviable-ink">
        {icono}
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg font-semibold text-ink">{titulo}</p>
        <div className="max-w-prose text-sm text-ink-muted">{cuerpo}</div>
      </div>
      {reintentar ? (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </Card>
  );
}

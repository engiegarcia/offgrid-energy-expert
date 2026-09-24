import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/** Misma silueta que `ResultadosEvaluacion`: encabezado, dos cards y gráfico. */
export function ResultadosSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Evaluando la zona">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full max-w-prose" />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <Card key={i} className="flex flex-col gap-3 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </CardHeader>
        <CardBody>
          <Skeleton className="h-60 w-full" />
        </CardBody>
      </Card>
    </div>
  );
}

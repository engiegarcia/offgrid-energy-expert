import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/Hero';
import { ReglasExplorer } from '@/components/ReglasExplorer';
import { buttonClasses } from '@/components/ui/button-styles';
import { Card } from '@/components/ui/Card';
import { obtenerReglas } from '@/lib/api';
import type { ReglaMetadata } from '@/types/api';

export const metadata: Metadata = { title: 'Reglas del motor' };

/**
 * Server Component: los datos llegan en el HTML inicial (sin waterfall en el
 * cliente) y el filtrado interactivo vive en `ReglasExplorer` (Client Component).
 *
 * `force-dynamic` evita que `next build` intente pre-renderizar la página
 * contra un backend que puede no estar disponible en CI/Vercel; el fetch se
 * cachea 5 minutos (`revalidate`) porque las reglas cambian muy rara vez.
 * Las tarjetas de recomendación, en cambio, piden las reglas desde el cliente
 * (React Query) solo cuando el usuario abre el detalle.
 */
export const dynamic = 'force-dynamic';

export default async function ReglasPage({
  searchParams,
}: {
  searchParams: { q?: string | string[] };
}) {
  let reglas: ReglaMetadata[] | null = null;
  try {
    reglas = await obtenerReglas({ next: { revalidate: 300 } });
  } catch (error) {
    console.error('No se pudieron cargar las reglas', error);
  }

  const q = typeof searchParams.q === 'string' ? searchParams.q : '';

  return (
    <main>
      <PageHero title="Reglas del motor">
        <p>
          Cada recomendación cita la regla que la produjo. Aquí está el conjunto completo para
          auditar cómo razona el sistema.
        </p>
      </PageHero>
      <div className="mx-auto w-full max-w-page px-4 pb-16 sm:px-6">
        {reglas ? (
          <ReglasExplorer reglas={reglas} initialQuery={q} />
        ) : (
          <Card role="alert" className="flex max-w-prose flex-col items-start gap-3 p-5">
            <p className="text-base font-semibold text-ink">No se pudieron cargar las reglas</p>
            <p className="text-sm text-ink-muted">
              El backend no respondió. Verifica que esté en línea e inténtalo de nuevo.
            </p>
            <Link href="/reglas" prefetch={false} className={buttonClasses('secondary')}>
              Reintentar
            </Link>
          </Card>
        )}
      </div>
    </main>
  );
}

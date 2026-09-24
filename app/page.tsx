import { Evaluador } from '@/components/Evaluador';
import { PageHero } from '@/components/Hero';

export default function HomePage() {
  return (
    <main>
      <PageHero title="Qué energía le conviene a una comunidad sin red eléctrica" fuentes>
        <p>
          Ingresa las mediciones del sitio. El motor indica qué fuentes de energía renovable son
          viables sin conexión a la red y con qué regla llegó a cada conclusión.
        </p>
      </PageHero>
      <div className="mx-auto w-full max-w-page px-4 pb-16 sm:px-6">
        <Evaluador />
      </div>
    </main>
  );
}

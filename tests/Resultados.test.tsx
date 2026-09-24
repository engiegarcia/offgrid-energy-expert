import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultadosEvaluacion } from '@/components/ResultadosEvaluacion';
import type { EvaluacionResponse } from '@/types/api';

const RESPUESTA: EvaluacionResponse = {
  id_comunidad: 'San-Marcos-Test',
  recomendaciones: [
    {
      tecnologia: 'Micro Central Hidráulica Banki-Michell',
      justificacion: 'Caudal y salto suficientes.',
      regla_origen: 'R23',
    },
    {
      tecnologia: 'Biodigestor Tubular con Invernadero',
      justificacion: 'Estiércol suficiente.',
      regla_origen: 'R24',
    },
  ],
  viabilidades: { solar: 'baja', eolico: 'inviable', hidraulico: 'media', biomasa: 'media' },
  demanda_clasificada: 'medio_transicion',
};

const REGLAS = [
  {
    codigo: 'R23',
    capa: 2,
    descripcion: 'Hidráulica media con presupuesto medio',
    condicion: 'hidraulico == media',
    tecnologia_asociada: 'Micro Central Hidráulica Banki-Michell',
  },
];

function conProviders(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

beforeEach(() => {
  // recharts (ResponsiveContainer) necesita ResizeObserver, que jsdom no trae.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

describe('ResultadosEvaluacion', () => {
  it('muestra una card por recomendación, la demanda y el gráfico con nombre accesible', () => {
    render(conProviders(<ResultadosEvaluacion data={RESPUESTA} />));

    expect(
      screen.getByRole('heading', { name: 'Resultados para San-Marcos-Test' }),
    ).toBeInTheDocument();
    expect(screen.getByText('transición')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Micro Central Hidráulica Banki-Michell' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Biodigestor Tubular con Invernadero' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Regla R23/ })).toBeInTheDocument();

    const grafico = screen.getByRole('img', { name: /Gráfico de viabilidad por recurso/ });
    expect(grafico).toHaveAccessibleName(
      /Solar: baja; Eólico: inviable; Hidráulico: media; Biomasa: media/,
    );
  });

  it('el badge de regla abre el detalle con los datos de /api/reglas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(REGLAS), { status: 200 })),
    );
    const user = userEvent.setup();
    render(conProviders(<ResultadosEvaluacion data={RESPUESTA} />));

    const badge = screen.getByRole('button', { name: /Regla R23/ });
    expect(badge).toHaveAttribute('aria-expanded', 'false');
    await user.click(badge);
    expect(badge).toHaveAttribute('aria-expanded', 'true');

    const detalle = await screen.findByRole('region', { name: 'Detalle de la regla R23' });
    expect(
      await within(detalle).findByText('Hidráulica media con presupuesto medio'),
    ).toBeInTheDocument();
    expect(
      within(detalle).getByRole('link', { name: /Ver en la lista de reglas/ }),
    ).toHaveAttribute('href', '/reglas?q=R23');
  });

  it('con recomendaciones = [] muestra el estado vacío y sigue mostrando el gráfico', () => {
    render(
      conProviders(
        <ResultadosEvaluacion
          data={{
            ...RESPUESTA,
            recomendaciones: [],
            viabilidades: {
              solar: 'baja',
              eolico: 'inviable',
              hidraulico: 'inviable',
              biomasa: 'inviable',
            },
          }}
        />,
      ),
    );
    expect(screen.getByText('Ninguna tecnología es viable con estos datos')).toBeInTheDocument();
    expect(screen.getByText(/El mejor nivel es baja \(Solar\)/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Regla/ })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Gráfico de viabilidad/ })).toBeInTheDocument();
  });
});

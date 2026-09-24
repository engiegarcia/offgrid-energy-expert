import { expect, test, type Page, type Route } from '@playwright/test';

const API = 'http://localhost:8000';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

/** Responde a la petición real y al preflight CORS (el front y la API son orígenes distintos). */
async function responder(route: Route, status: number, body: unknown) {
  if (route.request().method() === 'OPTIONS') {
    return route.fulfill({ status: 204, headers: CORS });
  }
  return route.fulfill({
    status,
    headers: CORS,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

const RESPUESTA_EJEMPLO = {
  id_comunidad: 'San-Marcos-Test',
  recomendaciones: [
    {
      tecnologia: 'Micro Central Hidráulica Banki-Michell',
      justificacion: 'Caudal y salto suficientes para una turbina de flujo cruzado.',
      regla_origen: 'R23',
    },
    {
      tecnologia: 'Biodigestor Tubular con Invernadero',
      justificacion: 'La masa de estiércol diaria sostiene un biodigestor tubular.',
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
    condicion: 'hidraulico == media AND presupuesto == medio',
    tecnologia_asociada: 'Micro Central Hidráulica Banki-Michell',
  },
];

async function mockearApi(page: Page, evaluar: (route: Route) => Promise<void>) {
  await page.route(`${API}/health`, (r) => responder(r, 200, { status: 'ok' }));
  await page.route(`${API}/api/reglas`, (r) => responder(r, 200, REGLAS));
  await page.route(`${API}/api/evaluar-zona`, evaluar);
  // Sin red real para las teselas del mapa.
  await page.route('https://tile.openstreetmap.org/**', (r) => r.abort());
}

async function completarFormulario(page: Page) {
  await page.getByRole('button', { name: 'Usar ejemplo' }).click();
  await expect(page.getByLabel('Nombre o código')).toHaveValue('San-Marcos-Test');
}

test('evalúa San-Marcos-Test y muestra recomendaciones, gráfico y mapa', async ({ page }) => {
  let cuerpoEnviado: unknown;
  await mockearApi(page, async (route) => {
    if (route.request().method() === 'POST') cuerpoEnviado = route.request().postDataJSON();
    await responder(route, 200, RESPUESTA_EJEMPLO);
  });

  await page.goto('/');
  await completarFormulario(page);
  await page.getByRole('button', { name: 'Evaluar zona' }).click();

  await expect(
    page.getByRole('heading', { name: 'Micro Central Hidráulica Banki-Michell' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Biodigestor Tubular con Invernadero' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Regla R23/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Regla R24/ })).toBeVisible();

  const grafico = page.getByRole('img', { name: /Gráfico de viabilidad por recurso/ });
  await expect(grafico).toBeVisible();
  await expect(grafico).toHaveAccessibleName(/Hidráulico: media.*Biomasa: media/);
  await expect(grafico.locator('svg.recharts-surface')).toBeVisible();

  // El payload coincide con el contrato y NO incluye coordenadas.
  expect(cuerpoEnviado).toEqual({
    id_comunidad: 'San-Marcos-Test',
    radiacion: 4.8,
    velocidad_viento: 1.5,
    hay_curso_agua: 'si',
    caudal: 75,
    salto_neto: 14,
    masa_estiercol: 6,
    consumo_diario: 4200,
    presupuesto: 'medio',
  });
});

test('click en el mapa fija la ubicación visual y se muestra como texto', async ({ page }) => {
  await mockearApi(page, (r) => responder(r, 200, RESPUESTA_EJEMPLO));
  await page.goto('/');

  await expect(page.getByText('Sin ubicación marcada')).toBeVisible();
  await page.locator('.leaflet-container').click({ position: { x: 200, y: 120 } });
  await expect(page.getByText(/Latitud -?\d+\.\d{5}, longitud -?\d+\.\d{5}/)).toBeVisible();

  await page.getByRole('button', { name: 'Quitar marcador' }).click();
  await expect(page.getByText('Sin ubicación marcada')).toBeVisible();
});

test('el badge de regla abre el detalle desde /api/reglas', async ({ page }) => {
  await mockearApi(page, (r) => responder(r, 200, RESPUESTA_EJEMPLO));
  await page.goto('/');
  await completarFormulario(page);
  await page.getByRole('button', { name: 'Evaluar zona' }).click();

  await page.getByRole('button', { name: /Regla R23/ }).click();
  const detalle = page.getByRole('region', { name: 'Detalle de la regla R23' });
  await expect(detalle.getByText('Hidráulica media con presupuesto medio')).toBeVisible();
});

test('sin recomendaciones muestra el estado vacío (no un error)', async ({ page }) => {
  await mockearApi(page, (r) =>
    responder(r, 200, {
      ...RESPUESTA_EJEMPLO,
      recomendaciones: [],
      viabilidades: {
        solar: 'baja',
        eolico: 'inviable',
        hidraulico: 'inviable',
        biomasa: 'inviable',
      },
    }),
  );
  await page.goto('/');
  await completarFormulario(page);
  await page.getByRole('button', { name: 'Evaluar zona' }).click();

  await expect(page.getByText('Ninguna tecnología es viable con estos datos')).toBeVisible();
  await expect(page.getByRole('img', { name: /Gráfico de viabilidad/ })).toBeVisible();
});

test('error 500: mensaje genérico y reintento que funciona', async ({ page }) => {
  let intentos = 0;
  await mockearApi(page, async (route) => {
    if (route.request().method() === 'OPTIONS') return responder(route, 204, {});
    intentos += 1;
    if (intentos === 1) return responder(route, 500, { detail: 'boom', error_code: 'INTERNAL' });
    return responder(route, 200, RESPUESTA_EJEMPLO);
  });
  await page.goto('/');
  await completarFormulario(page);
  await page.getByRole('button', { name: 'Evaluar zona' }).click();

  await expect(
    page.getByRole('alert').filter({ hasText: 'El motor tuvo un problema' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Micro Central Hidráulica Banki-Michell' }),
  ).toBeVisible();
});

test('backend caído: error de red diferenciado', async ({ page }) => {
  await mockearApi(page, async (route) => {
    if (route.request().method() === 'OPTIONS') return responder(route, 204, {});
    await route.abort('connectionrefused');
  });
  await page.goto('/');
  await completarFormulario(page);
  await page.getByRole('button', { name: 'Evaluar zona' }).click();

  await expect(page.getByText('No se pudo conectar con el motor')).toBeVisible();
});

test('la validación del cliente bloquea el envío sin llamar a la API', async ({ page }) => {
  let llamadas = 0;
  await mockearApi(page, async (route) => {
    if (route.request().method() === 'POST') llamadas += 1;
    await responder(route, 200, RESPUESTA_EJEMPLO);
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Evaluar zona' }).click();

  await expect(page.getByRole('alert').first()).toBeVisible();
  expect(llamadas).toBe(0);
});

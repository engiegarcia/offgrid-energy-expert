import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  ApiNetworkError,
  ApiServerError,
  ApiValidationError,
  evaluarZona,
  obtenerReglas,
} from '@/lib/api';
import { EJEMPLO_SAN_MARCOS } from '@/lib/constants';

function mockFetch(impl: () => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('lib/api', () => {
  it('evaluarZona hace POST con JSON y devuelve la respuesta tipada', async () => {
    const respuesta = {
      id_comunidad: 'X',
      recomendaciones: [],
      viabilidades: { solar: 'alta', eolico: 'baja', hidraulico: 'media', biomasa: 'inviable' },
      demanda_clasificada: 'bajo_basico',
    };
    const fetchMock = mockFetch(async () => json(respuesta));

    await expect(evaluarZona(EJEMPLO_SAN_MARCOS)).resolves.toEqual(respuesta);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/evaluar-zona$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(EJEMPLO_SAN_MARCOS);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('422 → ApiValidationError con errores por campo y generales', async () => {
    mockFetch(async () =>
      json(
        {
          detail: [
            { loc: ['body', 'radiacion'], msg: 'Input should be <= 10', type: 'less_than_equal' },
            { loc: ['body', 'radiacion'], msg: 'segundo mensaje', type: 'x' },
            { loc: ['body'], msg: 'Value error, caudal debe ser 0', type: 'value_error' },
          ],
        },
        422,
      ),
    );

    const error = await evaluarZona(EJEMPLO_SAN_MARCOS).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiValidationError);
    expect(error).toBeInstanceOf(ApiError);
    const v = error as ApiValidationError;
    expect(v.fieldErrors()).toEqual({ radiacion: 'Input should be <= 10' });
    expect(v.generalErrors()).toEqual(['Value error, caudal debe ser 0']);
  });

  it('500 → ApiServerError con status y error_code', async () => {
    mockFetch(async () => json({ detail: 'boom', error_code: 'INTERNAL' }, 500));
    const error = await evaluarZona(EJEMPLO_SAN_MARCOS).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiServerError);
    expect((error as ApiServerError).status).toBe(500);
    expect((error as ApiServerError).errorCode).toBe('INTERNAL');
  });

  it('500 con cuerpo no JSON sigue siendo ApiServerError', async () => {
    mockFetch(async () => new Response('<html>Bad gateway</html>', { status: 502 }));
    await expect(evaluarZona(EJEMPLO_SAN_MARCOS)).rejects.toBeInstanceOf(ApiServerError);
  });

  it('200 con forma inesperada → ApiServerError (no rompe la UI)', async () => {
    mockFetch(async () => json({ hola: 'mundo' }));
    await expect(evaluarZona(EJEMPLO_SAN_MARCOS)).rejects.toBeInstanceOf(ApiServerError);
  });

  it('fallo de red (backend caído / CORS) → ApiNetworkError', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    const error = await evaluarZona(EJEMPLO_SAN_MARCOS).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiNetworkError);
    expect((error as ApiNetworkError).reason).toBe('network');
  });

  it('timeout de 10 s aborta la petición → ApiNetworkError("timeout")', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );

    const pendiente = evaluarZona(EJEMPLO_SAN_MARCOS).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(10_000);
    const error = await pendiente;
    expect(error).toBeInstanceOf(ApiNetworkError);
    expect((error as ApiNetworkError).reason).toBe('timeout');
  });

  it('obtenerReglas devuelve el arreglo del backend', async () => {
    const reglas = [
      { codigo: 'R1', capa: 1, descripcion: 'd', condicion: 'c', tecnologia_asociada: '' },
    ];
    mockFetch(async () => json(reglas));
    await expect(obtenerReglas()).resolves.toEqual(reglas);
  });
});

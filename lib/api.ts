import { API_TIMEOUT_MS } from './constants';
import type {
  ApiServerErrorBody,
  ApiValidationErrorBody,
  EvaluacionRequest,
  EvaluacionResponse,
  FastApiValidationIssue,
  HealthResponse,
  NivelViabilidad,
  ReglaMetadata,
  ViabilidadesPorRecurso,
} from '../types/api';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

/* --------------------------------------------------------------- Errores */

/** Base común para poder hacer `error instanceof ApiError`. */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Backend caído, CORS, sin red o timeout: no hubo respuesta HTTP utilizable. */
export class ApiNetworkError extends ApiError {
  readonly reason: 'timeout' | 'network';
  constructor(reason: 'timeout' | 'network') {
    super(
      reason === 'timeout'
        ? 'El servidor tardó demasiado en responder.'
        : 'No se pudo conectar con el servidor.',
    );
    this.reason = reason;
  }
}

/** 422: el backend rechazó la petición (formato estándar de FastAPI). */
export class ApiValidationError extends ApiError {
  readonly issues: FastApiValidationIssue[];
  constructor(issues: FastApiValidationIssue[]) {
    super('El servidor rechazó los datos enviados.');
    this.issues = issues;
  }

  /** Primer mensaje por campo (`loc = ["body", campo]`). */
  fieldErrors(): Partial<Record<keyof EvaluacionRequest, string>> {
    const out: Partial<Record<keyof EvaluacionRequest, string>> = {};
    for (const issue of this.issues) {
      const [origen, campo] = issue.loc;
      if (origen === 'body' && typeof campo === 'string' && !(campo in out)) {
        out[campo as keyof EvaluacionRequest] = issue.msg;
      }
    }
    return out;
  }

  /** Mensajes que no pertenecen a un campo concreto (validadores a nivel de modelo). */
  generalErrors(): string[] {
    return this.issues
      .filter((i) => i.loc.length < 2 || typeof i.loc[1] !== 'string')
      .map((i) => i.msg);
  }
}

/** 5xx (o cualquier respuesta no exitosa distinta de 422). */
export class ApiServerError extends ApiError {
  readonly status: number;
  readonly errorCode: string | undefined;
  constructor(status: number, errorCode?: string) {
    super('El servidor tuvo un problema al procesar la evaluación.');
    this.status = status;
    this.errorCode = errorCode;
  }
}

/* -------------------------------------------------------------- Helpers */

function esRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function leerJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

/** fetch con timeout; traduce fallos de transporte a `ApiNetworkError`. */
async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
  } catch (e) {
    const abortado = e instanceof DOMException && e.name === 'AbortError';
    throw new ApiNetworkError(abortado ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}

/** Convierte respuestas no-2xx en errores tipados. */
async function lanzarSiError(res: Response): Promise<void> {
  if (res.ok) return;
  const body = await leerJson(res);
  if (res.status === 422 && esRecord(body) && Array.isArray(body.detail)) {
    throw new ApiValidationError((body as unknown as ApiValidationErrorBody).detail);
  }
  const errorCode =
    esRecord(body) && typeof (body as Partial<ApiServerErrorBody>).error_code === 'string'
      ? (body as unknown as ApiServerErrorBody).error_code
      : undefined;
  throw new ApiServerError(res.status, errorCode);
}

function esEvaluacionResponse(v: unknown): v is EvaluacionResponse {
  return (
    esRecord(v) &&
    typeof v.id_comunidad === 'string' &&
    Array.isArray(v.recomendaciones) &&
    esRecord(v.viabilidades) &&
    typeof v.demanda_clasificada === 'string'
  );
}

function normalizarViabilidades(raw: Record<string, unknown>): ViabilidadesPorRecurso {
  const get = (...keys: string[]): NivelViabilidad => {
    for (const k of keys) {
      const val = raw[k];
      if (
        typeof val === 'string' &&
        (val === 'alta' || val === 'media' || val === 'baja' || val === 'inviable')
      ) {
        return val;
      }
    }
    return 'inviable';
  };

  return {
    solar: get('solar'),
    eolico: get('eolico', 'eolica'),
    hidraulico: get('hidraulico', 'hidraulica'),
    biomasa: get('biomasa'),
  };
}

/* ---------------------------------------------------------- Endpoints */

export async function evaluarZona(payload: EvaluacionRequest): Promise<EvaluacionResponse> {
  const res = await request('/api/evaluar-zona', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  await lanzarSiError(res);
  const data = await leerJson(res);
  if (!esEvaluacionResponse(data)) throw new ApiServerError(res.status, 'RESPUESTA_INVALIDA');
  return {
    ...data,
    viabilidades: normalizarViabilidades(data.viabilidades as Record<string, unknown>),
  };
}

export async function obtenerReglas(init: RequestInit = {}): Promise<ReglaMetadata[]> {
  const res = await request('/api/reglas', { headers: { Accept: 'application/json' }, ...init });
  await lanzarSiError(res);
  const data = await leerJson(res);
  if (!Array.isArray(data)) throw new ApiServerError(res.status, 'RESPUESTA_INVALIDA');
  return data as ReglaMetadata[];
}

export async function verificarSalud(): Promise<HealthResponse> {
  const res = await request('/health', { headers: { Accept: 'application/json' } });
  await lanzarSiError(res);
  const data = await leerJson(res);
  return esRecord(data) && data.status === 'ok' ? { status: 'ok' } : { status: 'error' };
}

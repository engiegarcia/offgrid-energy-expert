/**
 * Contrato del backend FastAPI (espejo de los modelos Pydantic).
 * No modificar sin sincronizar con el backend.
 */

export type HayCursoAgua = 'si' | 'no';
export type Presupuesto = 'bajo' | 'medio' | 'alto';
export type NivelViabilidad = 'alta' | 'media' | 'baja' | 'inviable';
export type DemandaClasificada = 'bajo_basico' | 'medio_transicion' | 'alto_productivo';
export type Recurso = 'solar' | 'eolico' | 'hidraulico' | 'biomasa';

/** POST /api/evaluar-zona — cuerpo de la petición. */
export interface EvaluacionRequest {
  /** 1-100 caracteres. */
  id_comunidad: string;
  /** 0-10, kWh/m²/día. */
  radiacion: number;
  /** 0-30, m/s a 10-30 m de altura. */
  velocidad_viento: number;
  hay_curso_agua: HayCursoAgua;
  /** >= 0, l/s. Debe ser 0 si hay_curso_agua = "no". */
  caudal: number;
  /** >= 0, metros. Debe ser 0 si hay_curso_agua = "no". */
  salto_neto: number;
  /** >= 0, kg/día. */
  masa_estiercol: number;
  /** >= 0, Wh/día. */
  consumo_diario: number;
  presupuesto: Presupuesto;
}

export interface RecomendacionItem {
  tecnologia: string;
  justificacion: string;
  /** Código de la regla que se disparó, p. ej. "R23". */
  regla_origen: string;
}

export type ViabilidadesPorRecurso = Record<Recurso, NivelViabilidad>;

/** POST /api/evaluar-zona — respuesta 200. */
export interface EvaluacionResponse {
  id_comunidad: string;
  /** Puede ser [] si ninguna regla de Capa 2 se disparó. */
  recomendaciones: RecomendacionItem[];
  viabilidades: ViabilidadesPorRecurso;
  demanda_clasificada: DemandaClasificada;
}

/** GET /api/reglas — 30 entradas. */
export interface ReglaMetadata {
  codigo: string;
  capa: number;
  descripcion: string;
  condicion: string;
  tecnologia_asociada: string;
}

/** GET /health */
export interface HealthResponse {
  status: 'ok' | 'error';
}

/** Un elemento de `detail` en un 422 estándar de FastAPI. */
export interface FastApiValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: unknown;
}

/** 422 — validación. */
export interface ApiValidationErrorBody {
  detail: FastApiValidationIssue[];
}

/** 500 — error interno. */
export interface ApiServerErrorBody {
  detail: string;
  error_code: string;
}

/**
 * Coordenadas elegidas en el mapa. SOLO estado local de UI:
 * el contrato del backend no incluye latitud/longitud.
 */
export interface Coordenadas {
  lat: number;
  lng: number;
}

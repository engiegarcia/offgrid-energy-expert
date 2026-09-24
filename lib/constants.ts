/**
 * Tokens compartidos: paleta de viabilidad, easing, etiquetas y ejemplos.
 *
 * Este archivo lo importa también `tailwind.config.ts`, por eso:
 *  - no importa nada en runtime (solo tipos, que se borran al compilar);
 *  - usa rutas relativas.
 */
import type {
  DemandaClasificada,
  EvaluacionRequest,
  NivelViabilidad,
  Presupuesto,
  Recurso,
} from '../types/api';

/* ---------------------------------------------------------------- Motion */

/** Ease-out pronunciado. Única curva del proyecto (framer-motion + CSS). */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Duraciones en segundos (framer-motion). Nada supera 350 ms. */
export const DURACION = {
  rapida: 0.15,
  base: 0.2,
  entrada: 0.3,
  grafico: 0.35,
} as const;

/** Desfase entre cards al entrar (s). */
export const STAGGER = 0.05;

/* --------------------------------------------------------------- Colores */

/** Neutros y acento. `tailwind.config.ts` los consume; recharts/leaflet los usan directo. */
export const COLORES_BASE = {
  ground: '#EDF0EC',
  surface: '#FFFFFF',
  ink: '#12282E',
  inkMuted: '#42565C',
  inkSubtle: '#566A6F',
  line: '#D9E0DC',
  lineStrong: '#BCC7C3',
  accent: '#17565F',
  accentHover: '#0F434B',
  accentSoft: '#DDEBE9',
  /** Cielo del amanecer: cabecera, héroe y pie. */
  night: '#10303A',
  nightDeep: '#0B2229',
  /** Sol. Solo decorativo (logo y héroe): no lleva texto encima. */
  sun: '#F6B24A',
} as const;

/* ------------------------------------------------------------ Viabilidad */

export interface ColoresNivel {
  /** Relleno sólido (barras, marcador del mapa, puntos). */
  solid: string;
  /** Fondo suave (badges). */
  soft: string;
  /** Texto sobre `soft` (contraste AA). */
  ink: string;
}

export const VIABILIDAD_COLORES: Record<NivelViabilidad, ColoresNivel> = {
  alta: { solid: '#2E8B57', soft: '#E4F2EA', ink: '#1B5E3A' },
  media: { solid: '#DDB021', soft: '#FAF1D0', ink: '#6E5200' },
  baja: { solid: '#E07B2A', soft: '#FCEADB', ink: '#8F440C' },
  inviable: { solid: '#C8483E', soft: '#F8E2DF', ink: '#8A261E' },
};

/**
 * Clases Tailwind completas (no construir nombres dinámicamente:
 * el compilador de Tailwind solo ve strings literales).
 */
export const NIVEL_CLASES: Record<NivelViabilidad, { badge: string; dot: string }> = {
  alta: { badge: 'bg-viab-alta-soft text-viab-alta-ink', dot: 'bg-viab-alta' },
  media: { badge: 'bg-viab-media-soft text-viab-media-ink', dot: 'bg-viab-media' },
  baja: { badge: 'bg-viab-baja-soft text-viab-baja-ink', dot: 'bg-viab-baja' },
  inviable: { badge: 'bg-viab-inviable-soft text-viab-inviable-ink', dot: 'bg-viab-inviable' },
};

/** Orden ascendente de viabilidad. */
export const NIVELES_ORDEN: readonly NivelViabilidad[] = ['inviable', 'baja', 'media', 'alta'];

/** Valor ordinal para el eje Y del gráfico. */
export const VALOR_ORDINAL: Record<NivelViabilidad, number> = {
  inviable: 0,
  baja: 1,
  media: 2,
  alta: 3,
};

export const NIVEL_LABEL: Record<NivelViabilidad, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
  inviable: 'Inviable',
};

export const RECURSOS: readonly Recurso[] = ['solar', 'eolico', 'hidraulico', 'biomasa'];

export const RECURSO_LABEL: Record<Recurso, string> = {
  solar: 'Solar',
  eolico: 'Eólico',
  hidraulico: 'Hidráulico',
  biomasa: 'Biomasa',
};

/* ------------------------------------------------- Demanda y presupuesto */

/** Etiquetas de la clasificación de demanda (marco de niveles de acceso). */
export const DEMANDA_INFO: Record<DemandaClasificada, { label: string; descripcion: string }> = {
  bajo_basico: {
    label: 'Básica',
    descripcion: 'Consumo bajo: iluminación, carga de celulares y radio.',
  },
  medio_transicion: {
    label: 'Transición',
    descripcion: 'Consumo medio: electrodomésticos pequeños y primeros usos productivos.',
  },
  alto_productivo: {
    label: 'Productiva',
    descripcion: 'Consumo alto: molienda, refrigeración y otros usos productivos.',
  },
};

export const PRESUPUESTO_LABEL: Record<Presupuesto, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
};

/**
 * Etiquetas de capa. Inferidas del contrato: la Capa 2 es la que produce
 * `recomendaciones`; la Capa 1 deriva la viabilidad por recurso.
 */
export const CAPA_LABEL: Record<number, string> = {
  1: 'Capa 1: viabilidad por recurso',
  2: 'Capa 2: selección de tecnología',
};

/* ----------------------------------------------------------------- Mapa */

/** Vista inicial del mapa: Perú. */
export const MAPA_CENTRO_INICIAL = { lat: -9.19, lng: -75.015 } as const;
export const MAPA_ZOOM_INICIAL = 5;

/* --------------------------------------------------------------- Ejemplo */

/** Mismo ejemplo del backend ("San-Marcos-Test"). */
export const EJEMPLO_SAN_MARCOS: EvaluacionRequest = {
  id_comunidad: 'San-Marcos-Test',
  radiacion: 4.8,
  velocidad_viento: 1.5,
  hay_curso_agua: 'si',
  caudal: 75,
  salto_neto: 14,
  masa_estiercol: 6,
  consumo_diario: 4200,
  presupuesto: 'medio',
};

/* ----------------------------------------------------------------- Red */

export const API_TIMEOUT_MS = 10_000;

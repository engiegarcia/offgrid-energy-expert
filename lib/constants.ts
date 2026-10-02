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

/* --------------------------------------------------------------- Ejemplos */

export interface EjemploComunidad {
  id: string;
  nombre: string;
  descripcion: string;
  badge: string;
  datos: EvaluacionRequest;
}

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

export const EJEMPLO_PUNO: EvaluacionRequest = {
  id_comunidad: 'Puno-Alta-Solar',
  radiacion: 6.1,
  velocidad_viento: 2.5,
  hay_curso_agua: 'no',
  caudal: 0,
  salto_neto: 0,
  masa_estiercol: 3.0,
  consumo_diario: 900,
  presupuesto: 'bajo',
};

export const EJEMPLO_JUNIN: EvaluacionRequest = {
  id_comunidad: 'Junin-Hidraulica',
  radiacion: 3.2,
  velocidad_viento: 5.0,
  hay_curso_agua: 'si',
  caudal: 120.0,
  salto_neto: 25.0,
  masa_estiercol: 8.0,
  consumo_diario: 4500,
  presupuesto: 'medio',
};

export const EJEMPLO_CUSCO: EvaluacionRequest = {
  id_comunidad: 'Cusco-Hibrido',
  radiacion: 6.5,
  velocidad_viento: 7.2,
  hay_curso_agua: 'si',
  caudal: 150.0,
  salto_neto: 30.0,
  masa_estiercol: 25.0,
  consumo_diario: 5200,
  presupuesto: 'alto',
};

export const EJEMPLO_AYACUCHO: EvaluacionRequest = {
  id_comunidad: 'Ayacucho-Biomasa',
  radiacion: 4.6,
  velocidad_viento: 3.5,
  hay_curso_agua: 'no',
  caudal: 0,
  salto_neto: 0,
  masa_estiercol: 18.0,
  consumo_diario: 2500,
  presupuesto: 'medio',
};

export const EJEMPLO_SIN_RECURSOS: EvaluacionRequest = {
  id_comunidad: 'Sin-Recursos',
  radiacion: 1.0,
  velocidad_viento: 1.0,
  hay_curso_agua: 'no',
  caudal: 0,
  salto_neto: 0,
  masa_estiercol: 1.0,
  consumo_diario: 500,
  presupuesto: 'bajo',
};

export const EJEMPLO_PREDETERMINADO: EjemploComunidad = {
  id: 'san-marcos',
  nombre: 'San Marcos (Test)',
  descripcion: 'Caso base · Hidro y biomasa moderados (4.8 kWh/m², 75 l/s)',
  badge: 'Base',
  datos: EJEMPLO_SAN_MARCOS,
};

export const EJEMPLOS_COMUNIDADES: EjemploComunidad[] = [
  EJEMPLO_PREDETERMINADO,
  {
    id: 'puno',
    nombre: 'Puno - Alta Solar',
    descripcion: 'Alta radiación (6.1 kWh/m²) · Sin agua · Bajo presupuesto',
    badge: 'Solar',
    datos: EJEMPLO_PUNO,
  },
  {
    id: 'junin',
    nombre: 'Junín - Hidráulica',
    descripcion: 'Alto caudal (120 l/s, salto 25 m) · Presupuesto medio',
    badge: 'Hidro',
    datos: EJEMPLO_JUNIN,
  },
  {
    id: 'cusco',
    nombre: 'Cusco - Híbrido',
    descripcion: 'Solar (6.5) + Hidro (150 l/s, 30 m) · Alto presupuesto',
    badge: 'Híbrido',
    datos: EJEMPLO_CUSCO,
  },
  {
    id: 'ayacucho',
    nombre: 'Ayacucho - Biomasa',
    descripcion: 'Biomasa destacada (18 kg/día) · Sin agua · Presupuesto medio',
    badge: 'Biomasa',
    datos: EJEMPLO_AYACUCHO,
  },
  {
    id: 'sin-recursos',
    nombre: 'Sin Recursos',
    descripcion: 'Baja radiación (1.0), sin agua ni viento · Caso inviable',
    badge: 'Inviable',
    datos: EJEMPLO_SIN_RECURSOS,
  },
];

/* ----------------------------------------------------------------- Red */

export const API_TIMEOUT_MS = 10_000;

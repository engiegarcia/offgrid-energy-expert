import { z } from 'zod';

/**
 * Espejo de `EvaluacionRequest` (Pydantic). Mismos rangos, mismos enums y la
 * misma regla cruzada: sin curso de agua, `caudal` y `salto_neto` deben ser 0.
 * Mensajes en español para validación instantánea sin roundtrip.
 */

const numero = (nombre: string) =>
  z.number({
    required_error: `${nombre} es obligatorio`,
    invalid_type_error: `${nombre} debe ser un número`,
  });

export const evaluacionRequestSchema = z
  .object({
    id_comunidad: z
      .string({ required_error: 'El nombre de la comunidad es obligatorio' })
      .trim()
      .min(1, 'El nombre de la comunidad es obligatorio')
      .max(100, 'Máximo 100 caracteres'),
    radiacion: numero('La radiación')
      .min(0, 'La radiación no puede ser negativa')
      .max(10, 'La radiación debe ser como máximo 10 kWh/m²/día'),
    velocidad_viento: numero('La velocidad del viento')
      .min(0, 'La velocidad del viento no puede ser negativa')
      .max(30, 'La velocidad del viento debe ser como máximo 30 m/s'),
    hay_curso_agua: z.enum(['si', 'no'], {
      errorMap: () => ({ message: 'Indica si hay curso de agua' }),
    }),
    caudal: numero('El caudal').min(0, 'El caudal no puede ser negativo'),
    salto_neto: numero('El salto neto').min(0, 'El salto neto no puede ser negativo'),
    masa_estiercol: numero('La masa de estiércol').min(
      0,
      'La masa de estiércol no puede ser negativa',
    ),
    consumo_diario: numero('El consumo diario').min(0, 'El consumo diario no puede ser negativo'),
    presupuesto: z.enum(['bajo', 'medio', 'alto'], {
      errorMap: () => ({ message: 'Selecciona un nivel de presupuesto' }),
    }),
  })
  .refine((d) => d.hay_curso_agua === 'si' || d.caudal === 0, {
    path: ['caudal'],
    message: 'Sin curso de agua, el caudal debe ser 0',
  })
  .refine((d) => d.hay_curso_agua === 'si' || d.salto_neto === 0, {
    path: ['salto_neto'],
    message: 'Sin curso de agua, el salto neto debe ser 0',
  });

export type EvaluacionFormValues = z.infer<typeof evaluacionRequestSchema>;

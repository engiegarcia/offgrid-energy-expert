import { describe, expect, it } from 'vitest';
import { EJEMPLO_SAN_MARCOS } from '@/lib/constants';
import { evaluacionRequestSchema } from '@/lib/schemas';

const valido = { ...EJEMPLO_SAN_MARCOS };

/** Mensajes del primer issue que apunta a `campo`. */
function errorEn(datos: unknown, campo: string): string | undefined {
  const r = evaluacionRequestSchema.safeParse(datos);
  if (r.success) return undefined;
  return r.error.issues.find((i) => i.path[0] === campo)?.message;
}

describe('evaluacionRequestSchema', () => {
  it('acepta el ejemplo San-Marcos-Test', () => {
    expect(evaluacionRequestSchema.safeParse(valido).success).toBe(true);
  });

  it('recorta espacios en id_comunidad', () => {
    const r = evaluacionRequestSchema.parse({ ...valido, id_comunidad: '  Comunidad  ' });
    expect(r.id_comunidad).toBe('Comunidad');
  });

  describe('id_comunidad', () => {
    it('rechaza vacío y solo espacios', () => {
      expect(errorEn({ ...valido, id_comunidad: '' }, 'id_comunidad')).toMatch(/obligatorio/);
      expect(errorEn({ ...valido, id_comunidad: '   ' }, 'id_comunidad')).toMatch(/obligatorio/);
    });
    it('acepta 100 caracteres y rechaza 101', () => {
      expect(errorEn({ ...valido, id_comunidad: 'a'.repeat(100) }, 'id_comunidad')).toBeUndefined();
      expect(errorEn({ ...valido, id_comunidad: 'a'.repeat(101) }, 'id_comunidad')).toMatch(/100/);
    });
  });

  describe('rangos', () => {
    it.each([
      ['radiacion', 0, 10],
      ['velocidad_viento', 0, 30],
    ] as const)('%s acepta los bordes %s y %s', (campo, min, max) => {
      expect(errorEn({ ...valido, [campo]: min }, campo)).toBeUndefined();
      expect(errorEn({ ...valido, [campo]: max }, campo)).toBeUndefined();
    });

    it.each([
      ['radiacion', -0.1, 10.1],
      ['velocidad_viento', -0.1, 30.1],
    ] as const)('%s rechaza fuera de rango', (campo, bajo, alto) => {
      expect(errorEn({ ...valido, [campo]: bajo }, campo)).toMatch(/negativa/);
      expect(errorEn({ ...valido, [campo]: alto }, campo)).toMatch(/máximo/);
    });

    it.each(['caudal', 'salto_neto', 'masa_estiercol', 'consumo_diario'] as const)(
      '%s acepta 0 y rechaza negativos',
      (campo) => {
        const base = { ...valido, [campo]: 0 };
        expect(errorEn(base, campo)).toBeUndefined();
        expect(errorEn({ ...valido, [campo]: -1 }, campo)).toMatch(/negativ/);
      },
    );

    it('rechaza NaN y valores ausentes con mensajes en español', () => {
      expect(errorEn({ ...valido, radiacion: NaN }, 'radiacion')).toMatch(/número/);
      const { consumo_diario: _omitido, ...sinConsumo } = valido;
      expect(errorEn(sinConsumo, 'consumo_diario')).toMatch(/obligatorio/);
    });
  });

  describe('enums', () => {
    it('rechaza hay_curso_agua y presupuesto inválidos', () => {
      expect(errorEn({ ...valido, hay_curso_agua: 'quizás' }, 'hay_curso_agua')).toMatch(
        /curso de agua/,
      );
      expect(errorEn({ ...valido, hay_curso_agua: '' }, 'hay_curso_agua')).toMatch(/curso de agua/);
      expect(errorEn({ ...valido, presupuesto: 'enorme' }, 'presupuesto')).toMatch(/presupuesto/);
    });
    it.each(['bajo', 'medio', 'alto'])('acepta presupuesto %s', (presupuesto) => {
      expect(evaluacionRequestSchema.safeParse({ ...valido, presupuesto }).success).toBe(true);
    });
  });

  describe('regla cruzada: sin curso de agua, caudal y salto_neto deben ser 0', () => {
    const sinAgua = { ...valido, hay_curso_agua: 'no' as const };

    it('acepta caudal = 0 y salto_neto = 0', () => {
      expect(
        evaluacionRequestSchema.safeParse({ ...sinAgua, caudal: 0, salto_neto: 0 }).success,
      ).toBe(true);
    });

    it('rechaza caudal > 0 (error en el campo caudal)', () => {
      const datos = { ...sinAgua, caudal: 10, salto_neto: 0 };
      expect(errorEn(datos, 'caudal')).toBe('Sin curso de agua, el caudal debe ser 0');
      expect(errorEn(datos, 'salto_neto')).toBeUndefined();
    });

    it('rechaza salto_neto > 0 (error en el campo salto_neto)', () => {
      const datos = { ...sinAgua, caudal: 0, salto_neto: 5 };
      expect(errorEn(datos, 'salto_neto')).toBe('Sin curso de agua, el salto neto debe ser 0');
      expect(errorEn(datos, 'caudal')).toBeUndefined();
    });

    it('reporta ambos campos cuando los dos son distintos de 0', () => {
      const r = evaluacionRequestSchema.safeParse({ ...sinAgua, caudal: 10, salto_neto: 5 });
      expect(r.success).toBe(false);
      if (!r.success) {
        expect(r.error.issues.map((i) => i.path[0]).sort()).toEqual(['caudal', 'salto_neto']);
      }
    });

    it('con curso de agua permite cualquier caudal ≥ 0', () => {
      expect(
        evaluacionRequestSchema.safeParse({
          ...valido,
          hay_curso_agua: 'si',
          caudal: 0,
          salto_neto: 0,
        }).success,
      ).toBe(true);
    });
  });
});

import type {
  DemandaClasificada,
  EvaluacionRequest,
  EvaluacionResponse,
  NivelViabilidad,
  Recurso,
} from '@/types/api';

export interface DeduccionCapa1 {
  recurso: Recurso;
  nombre: string;
  regla: string;
  condicion: string;
  nivel: NivelViabilidad;
  valorFormateado: string;
}

export interface DeduccionDemanda {
  regla: string;
  condicion: string;
  nivel: DemandaClasificada;
  consumoFormateado: string;
}

export interface FilaSecuencia {
  paso: number;
  regla: string;
  accion: string;
  resultado: string;
  tipo: 'viabilidad' | 'demanda' | 'tecnologia';
  nivelViabilidad?: NivelViabilidad;
  recursoNombre?: string;
}

const CONDICIONES_CAPA2: Record<string, string> = {
  R17: 'solar=alta ∧ presupuesto=bajo',
  R18: 'solar=alta ∧ demanda=bajo_basico',
  R19: 'solar=alta ∧ demanda=alto_productivo ∧ presupuesto∈{medio,alto}',
  R20: 'eólica=alta ∧ solar=baja',
  R21: 'eólica=alta ∧ demanda=alto_productivo ∧ presupuesto∈{medio,alto}',
  R22: 'hidráulica=alta ∧ presupuesto∈{medio,alto}',
  R23: 'hidráulica=media ∧ demanda=alto_productivo',
  R24: 'biomasa∈{alta,media} ∧ presupuesto∈{medio,bajo}',
  R25: 'biomasa=alta ∧ demanda=alto_productivo',
  R26: 'solar=media ∧ eólica=media ∧ presupuesto=bajo',
  R27: 'solar=alta ∧ eólica=alta ∧ presupuesto∈{medio,alto}',
  R28: 'solar∈{alta,media} ∧ hidráulica∈{alta,media} ∧ demanda=alto_productivo',
  R29: 'eólica=alta ∧ hidráulica=alta ∧ presupuesto∈{medio,alto}',
  R30: 'solar=alta ∧ eólica=alta ∧ demanda=alto_productivo',
};

/**
 * Reconstruye las reglas de Capa 1 (salience 20, R01-R16) evaluadas por el motor CLIPS
 * a partir de las mediciones brutas suministradas por el usuario.
 */
export function deducirCapa1(request: EvaluacionRequest): {
  recursos: DeduccionCapa1[];
  demanda: DeduccionDemanda;
} {
  // 1. Solar (R01 - R03)
  let solarRegla = 'R03';
  let solarNivel: NivelViabilidad = 'baja';
  let solarCond = 'radiación < 4.5 kWh/m²/día';
  if (request.radiacion > 5.5) {
    solarRegla = 'R01';
    solarNivel = 'alta';
    solarCond = 'radiación > 5.5 kWh/m²/día';
  } else if (request.radiacion >= 4.5) {
    solarRegla = 'R02';
    solarNivel = 'media';
    solarCond = '4.5 <= radiación <= 5.5 kWh/m²/día';
  }

  // 2. Eólica (R04 - R06)
  let eolicoRegla = 'R06';
  let eolicoNivel: NivelViabilidad = 'inviable';
  let eolicoCond = 'velocidad viento < 4.0 m/s';
  if (request.velocidad_viento > 6.0) {
    eolicoRegla = 'R04';
    eolicoNivel = 'alta';
    eolicoCond = 'velocidad viento > 6.0 m/s';
  } else if (request.velocidad_viento >= 4.0) {
    eolicoRegla = 'R05';
    eolicoNivel = 'media';
    eolicoCond = '4.0 <= velocidad viento <= 6.0 m/s';
  }

  // 3. Hidráulica (R07 - R10)
  let hidraulicoRegla = 'R10';
  let hidraulicoNivel: NivelViabilidad = 'inviable';
  let hidraulicoCond = 'hay_curso_agua = no';
  if (request.hay_curso_agua === 'si') {
    if (request.caudal > 100 && request.salto_neto > 20) {
      hidraulicoRegla = 'R07';
      hidraulicoNivel = 'alta';
      hidraulicoCond = 'caudal > 100 l/s ∧ salto > 20 m';
    } else if (request.caudal < 20 || request.salto_neto < 5) {
      hidraulicoRegla = 'R09';
      hidraulicoNivel = 'baja';
      hidraulicoCond = 'caudal < 20 l/s ∨ salto < 5 m';
    } else {
      hidraulicoRegla = 'R08';
      hidraulicoNivel = 'media';
      hidraulicoCond = 'caudal >= 20 l/s ∧ salto >= 5 m';
    }
  }

  // 4. Biomasa (R11 - R13)
  let biomasaRegla = 'R13';
  let biomasaNivel: NivelViabilidad = 'inviable';
  let biomasaCond = 'masa estiércol < 5.0 kg/día';
  if (request.masa_estiercol > 20) {
    biomasaRegla = 'R11';
    biomasaNivel = 'alta';
    biomasaCond = 'masa estiércol > 20.0 kg/día';
  } else if (request.masa_estiercol >= 5) {
    biomasaRegla = 'R12';
    biomasaNivel = 'media';
    biomasaCond = '5.0 <= masa estiércol <= 20.0 kg/día';
  }

  // 5. Demanda MTF (R14 - R16)
  let demandaRegla = 'R14';
  let demandaNivel: DemandaClasificada = 'bajo_basico';
  let demandaCond = 'consumo diario <= 1000 Wh/día';
  if (request.consumo_diario > 3300) {
    demandaRegla = 'R16';
    demandaNivel = 'alto_productivo';
    demandaCond = 'consumo diario > 3300 Wh/día';
  } else if (request.consumo_diario > 1000) {
    demandaRegla = 'R15';
    demandaNivel = 'medio_transicion';
    demandaCond = '1000 < consumo diario <= 3300 Wh/día';
  }

  return {
    recursos: [
      {
        recurso: 'solar',
        nombre: 'Solar',
        regla: solarRegla,
        condicion: solarCond,
        nivel: solarNivel,
        valorFormateado: `${request.radiacion} kWh/m²/día`,
      },
      {
        recurso: 'eolico',
        nombre: 'Eólico',
        regla: eolicoRegla,
        condicion: eolicoCond,
        nivel: eolicoNivel,
        valorFormateado: `${request.velocidad_viento} m/s`,
      },
      {
        recurso: 'hidraulico',
        nombre: 'Hidráulico',
        regla: hidraulicoRegla,
        condicion: hidraulicoCond,
        nivel: hidraulicoNivel,
        valorFormateado:
          request.hay_curso_agua === 'si'
            ? `Q=${request.caudal} l/s, H=${request.salto_neto} m`
            : 'Sin curso de agua',
      },
      {
        recurso: 'biomasa',
        nombre: 'Biomasa',
        regla: biomasaRegla,
        condicion: biomasaCond,
        nivel: biomasaNivel,
        valorFormateado: `${request.masa_estiercol} kg/día`,
      },
    ],
    demanda: {
      regla: demandaRegla,
      condicion: demandaCond,
      nivel: demandaNivel,
      consumoFormateado: `${request.consumo_diario.toLocaleString('es-PE')} Wh/día`,
    },
  };
}

/**
 * Genera la secuencia paso a paso en formato tabular plano (i, Regla, Acción, Resultado)
 * que refleja la traza de ejecución forward chaining del motor experto.
 */
export function generarFilasSecuencia(
  request: EvaluacionRequest,
  data: EvaluacionResponse,
): FilaSecuencia[] {
  const { recursos, demanda } = deducirCapa1(request);
  const filas: FilaSecuencia[] = [];
  let i = 1;

  // 1. Solar
  const solar = recursos.find((r) => r.recurso === 'solar')!;
  filas.push({
    paso: i++,
    regla: solar.regla,
    accion: solar.condicion,
    resultado: `viabilidad solar = ${solar.nivel}`,
    tipo: 'viabilidad',
    nivelViabilidad: solar.nivel,
    recursoNombre: 'solar',
  });

  // 2. Eólica
  const eolico = recursos.find((r) => r.recurso === 'eolico')!;
  filas.push({
    paso: i++,
    regla: eolico.regla,
    accion: eolico.condicion,
    resultado: `viabilidad eólica = ${eolico.nivel}`,
    tipo: 'viabilidad',
    nivelViabilidad: eolico.nivel,
    recursoNombre: 'eólica',
  });

  // 3. Hidráulica
  const hidro = recursos.find((r) => r.recurso === 'hidraulico')!;
  filas.push({
    paso: i++,
    regla: hidro.regla,
    accion: hidro.condicion,
    resultado: `viabilidad hidráulica = ${hidro.nivel}`,
    tipo: 'viabilidad',
    nivelViabilidad: hidro.nivel,
    recursoNombre: 'hidráulica',
  });

  // 4. Biomasa
  const bio = recursos.find((r) => r.recurso === 'biomasa')!;
  filas.push({
    paso: i++,
    regla: bio.regla,
    accion: bio.condicion,
    resultado: `viabilidad biomasa = ${bio.nivel}`,
    tipo: 'viabilidad',
    nivelViabilidad: bio.nivel,
    recursoNombre: 'biomasa',
  });

  // 5. Demanda MTF
  const etiquetaDemanda =
    demanda.nivel === 'bajo_basico'
      ? 'básica'
      : demanda.nivel === 'medio_transicion'
        ? 'transición'
        : 'productiva';

  filas.push({
    paso: i++,
    regla: demanda.regla,
    accion: demanda.condicion,
    resultado: `demanda = ${etiquetaDemanda}`,
    tipo: 'demanda',
  });

  // 6+. Capa 2 (Recomendaciones)
  if (data.recomendaciones.length > 0) {
    data.recomendaciones.forEach((rec) => {
      filas.push({
        paso: i++,
        regla: rec.regla_origen,
        accion: CONDICIONES_CAPA2[rec.regla_origen] ?? rec.justificacion,
        resultado: rec.tecnologia,
        tipo: 'tecnologia',
      });
    });
  } else {
    filas.push({
      paso: i++,
      regla: 'R17–R30',
      accion: 'solar=baja ∧ eólica=inviable ∧ hidráulica=inviable ∧ biomasa=inviable',
      resultado: 'Ninguna tecnología viable',
      tipo: 'tecnologia',
    });
  }

  return filas;
}

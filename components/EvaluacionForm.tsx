'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { IconBolt, IconChevronDown, IconDrop, IconLeaf, IconSun, IconUsers } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';
import { EJEMPLOS_COMUNIDADES, type EjemploComunidad, PRESUPUESTO_LABEL } from '@/lib/constants';
import { evaluacionRequestSchema, type EvaluacionFormValues } from '@/lib/schemas';
import type { EvaluacionRequest } from '@/types/api';

type CampoNumerico =
  'radiacion' | 'velocidad_viento' | 'caudal' | 'salto_neto' | 'masa_estiercol' | 'consumo_diario';

/** Etiquetas, unidades y ayuda contextual (alineadas con los `Field()` del backend). */
const CAMPOS: Record<
  CampoNumerico,
  { label: string; unit: string; help: string; placeholder: string }
> = {
  radiacion: {
    label: 'Radiación solar',
    unit: 'kWh/m²/día',
    help: 'Promedio diario. Entre 0 y 10.',
    placeholder: '4.8',
  },
  velocidad_viento: {
    label: 'Velocidad del viento',
    unit: 'm/s',
    help: 'Media medida a 10–30 m de altura. Entre 0 y 30.',
    placeholder: '1.5',
  },
  caudal: {
    label: 'Caudal',
    unit: 'l/s',
    help: 'Caudal disponible del curso de agua. Mínimo 0.',
    placeholder: '75',
  },
  salto_neto: {
    label: 'Salto neto',
    unit: 'm',
    help: 'Desnivel aprovechable entre la toma y la turbina. Mínimo 0.',
    placeholder: '14',
  },
  masa_estiercol: {
    label: 'Estiércol disponible',
    unit: 'kg/día',
    help: 'Masa diaria para un biodigestor. Mínimo 0.',
    placeholder: '6',
  },
  consumo_diario: {
    label: 'Consumo diario',
    unit: 'Wh/día',
    help: 'Energía que la comunidad usa en un día. Mínimo 0.',
    placeholder: '4200',
  },
};

/** Campo vacío → `undefined` (mensaje "es obligatorio"); si no, número. */
const aNumero = (v: unknown): number | undefined =>
  v === '' || v === null || v === undefined ? undefined : Number(v);

/** Título de grupo con un icono: identifica el recurso de un vistazo. */
function Grupo({
  titulo,
  icono,
  children,
}: {
  titulo: string;
  icono: ReactNode;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0 border-t border-line">
      <legend className="mb-4 flex items-center gap-2.5 p-0 font-display text-base font-semibold text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
          {icono}
        </span>
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

export type ErroresServidor = Partial<Record<keyof EvaluacionRequest, string>>;

export interface EvaluacionFormProps {
  onSubmit: (payload: EvaluacionRequest) => void;
  isPending: boolean;
  /** Errores 422 del backend, mostrados junto a cada campo. */
  serverErrors?: ErroresServidor | undefined;
}

export function EvaluacionForm({ onSubmit, isPending, serverErrors }: EvaluacionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    resetField,
    clearErrors,
    setError,
    reset,
    formState: { errors },
  } = useForm<EvaluacionFormValues>({
    resolver: zodResolver(evaluacionRequestSchema),
    mode: 'onTouched',
    defaultValues: { id_comunidad: '' },
  });

  const hayCursoAgua = watch('hay_curso_agua');
  const sinAgua = hayCursoAgua === 'no';
  const previo = useRef(hayCursoAgua);

  // Sin curso de agua, caudal y salto se fijan en 0 (regla cruzada del backend).
  // Al volver a "sí", se vacían solo si seguían en 0, para no pisar datos reales.
  useEffect(() => {
    if (sinAgua) {
      setValue('caudal', 0);
      setValue('salto_neto', 0);
      clearErrors(['caudal', 'salto_neto']);
    } else if (previo.current === 'no') {
      if (getValues('caudal') === 0) resetField('caudal');
      if (getValues('salto_neto') === 0) resetField('salto_neto');
    }
    previo.current = hayCursoAgua;
  }, [sinAgua, hayCursoAgua, setValue, getValues, resetField, clearErrors]);

  // Errores devueltos por el backend (422) que el cliente no detectó.
  useEffect(() => {
    if (!serverErrors) return;
    for (const [campo, message] of Object.entries(serverErrors)) {
      setError(campo as keyof EvaluacionFormValues, { type: 'server', message });
    }
  }, [serverErrors, setError]);

  const [ejemploActivo, setEjemploActivo] = useState<EjemploComunidad>(EJEMPLOS_COMUNIDADES[0]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAbierto) return;
    const clickAfuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    };
    const presionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAbierto(false);
    };
    document.addEventListener('mousedown', clickAfuera);
    document.addEventListener('keydown', presionarTecla);
    return () => {
      document.removeEventListener('mousedown', clickAfuera);
      document.removeEventListener('keydown', presionarTecla);
    };
  }, [menuAbierto]);

  const cargarEjemplo = (ejemplo: EjemploComunidad) => {
    setEjemploActivo(ejemplo);
    reset(ejemplo.datos, { keepDefaultValues: true });
    setMenuAbierto(false);
  };

  const enviar = handleSubmit((values) => {
    onSubmit(sinAgua ? { ...values, caudal: 0, salto_neto: 0 } : values);
  });

  const numerico = (name: CampoNumerico, opciones: { disabled?: boolean } = {}) => {
    const c = CAMPOS[name];
    return (
      <Input
        label={c.label}
        unit={c.unit}
        help={opciones.disabled ? 'Sin curso de agua: se envía 0.' : c.help}
        placeholder={c.placeholder}
        type="number"
        inputMode="decimal"
        step="any"
        mono
        disabled={opciones.disabled}
        error={errors[name]?.message}
        onWheel={(e) => e.currentTarget.blur()}
        {...register(name, { setValueAs: aNumero })}
      />
    );
  };

  const grupo = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1';

  const icono = 'h-4 w-4';

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle as="h2" className="text-xl">
            Datos de la comunidad
          </CardTitle>
          <p className="text-sm text-ink-muted">Mediciones de campo y contexto socioeconómico.</p>
        </div>
        <div className="relative inline-flex items-center rounded-md shadow-xs shrink-0" ref={menuRef}>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-r-none border-r-0 focus:z-10"
            onClick={() => cargarEjemplo(ejemploActivo)}
            title={`Cargar ejemplo: ${ejemploActivo.nombre}`}
          >
            Usar ejemplo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-l-none px-2 focus:z-10"
            aria-label="Seleccionar caso de ejemplo"
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((prev) => !prev)}
          >
            <IconChevronDown
              className={cn('h-3.5 w-3.5 transition-transform duration-150', menuAbierto && 'rotate-180')}
            />
          </Button>

          {menuAbierto && (
            <div
              role="menu"
              aria-label="Casos de ejemplo"
              className="absolute right-0 top-full mt-1.5 z-50 w-72 origin-top-right rounded-xl border border-line bg-surface p-1.5 shadow-overlay animate-fade-in"
            >
              <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Casos de ejemplo
              </div>
              <div className="flex flex-col gap-0.5">
                {EJEMPLOS_COMUNIDADES.map((ej) => {
                  const seleccionado = ej.id === ejemploActivo.id;
                  return (
                    <button
                      key={ej.id}
                      role="menuitem"
                      type="button"
                      onClick={() => cargarEjemplo(ej)}
                      className={cn(
                        'group flex flex-col items-start gap-1 rounded-lg px-2.5 py-2 text-left transition-colors',
                        seleccionado
                          ? 'bg-accent-soft text-ink font-medium'
                          : 'text-ink hover:bg-ground hover:text-ink',
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="font-display text-xs font-semibold text-ink group-hover:text-accent">
                          {ej.nombre}
                        </span>
                        <span className="rounded bg-line/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                          {ej.badge}
                        </span>
                      </div>
                      <p className="text-[11px] leading-tight text-ink-muted">
                        {ej.descripcion}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={enviar} noValidate className="flex flex-col gap-7">
          <Grupo titulo="Comunidad" icono={<IconUsers className={icono} />}>
            <Input
              label="Nombre o código"
              help="Cómo identificas a la comunidad. Máximo 100 caracteres."
              placeholder="San-Marcos-Test"
              autoComplete="off"
              error={errors.id_comunidad?.message}
              {...register('id_comunidad')}
            />
          </Grupo>

          <Grupo titulo="Recursos del sitio" icono={<IconSun className={icono} />}>
            <div className={grupo}>
              {numerico('radiacion')}
              {numerico('velocidad_viento')}
            </div>
          </Grupo>

          <Grupo titulo="Agua" icono={<IconDrop className={icono} />}>
            <div className={grupo}>
              <Select
                label="¿Hay curso de agua?"
                help="Río, quebrada o canal aprovechable."
                placeholder="Selecciona"
                error={errors.hay_curso_agua?.message}
                className="sm:col-span-2 lg:col-span-1"
                {...register('hay_curso_agua')}
              >
                <option value="si">Sí</option>
                <option value="no">No</option>
              </Select>
              {numerico('caudal', { disabled: sinAgua })}
              {numerico('salto_neto', { disabled: sinAgua })}
            </div>
          </Grupo>

          <Grupo titulo="Biomasa" icono={<IconLeaf className={icono} />}>
            {numerico('masa_estiercol')}
          </Grupo>

          <Grupo titulo="Demanda y presupuesto" icono={<IconBolt className={icono} />}>
            <div className={grupo}>
              {numerico('consumo_diario')}
              <Select
                label="Presupuesto"
                help="Capacidad de inversión para el sistema."
                placeholder="Selecciona"
                error={errors.presupuesto?.message}
                {...register('presupuesto')}
              >
                {Object.entries(PRESUPUESTO_LABEL).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </Select>
            </div>
          </Grupo>

          {/* Siempre a mano: el formulario es largo, el botón se queda pegado abajo. */}
          <div className="sticky bottom-0 z-10 -mx-5 -mb-5 rounded-b-xl border-t border-line bg-surface/95 px-5 py-4 backdrop-blur">
            <Button type="submit" loading={isPending} className="w-full">
              {isPending ? 'Evaluando…' : 'Evaluar zona'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

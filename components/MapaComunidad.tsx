'use client';

/**
 * Mapa de referencia visual de la comunidad.
 *
 * ⚠️ Las coordenadas viven SOLO en el estado local del cliente. El contrato
 * actual del backend (`EvaluacionRequest`) no incluye latitud/longitud, así
 * que NO se envían ni se persisten. Si el backend se extiende, agregar los
 * campos al schema zod y al payload de `evaluarZona`.
 *
 * Se importa con `next/dynamic` y `{ ssr: false }` desde `Evaluador.tsx`:
 * Leaflet accede a `window` al cargarse y rompería el render en servidor.
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useId, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  COLORES_BASE,
  MAPA_CENTRO_INICIAL,
  MAPA_ZOOM_INICIAL,
  NIVEL_LABEL,
  VIABILIDAD_COLORES,
} from '@/lib/constants';
import type { Coordenadas, NivelViabilidad } from '@/types/api';

interface MapaComunidadProps {
  value: Coordenadas | null;
  onChange: (coordenadas: Coordenadas | null) => void;
  /** Mejor nivel de viabilidad del resultado; tiñe el marcador con la misma paleta. */
  nivel?: NivelViabilidad | undefined;
}

function ColocarConClic({ onChange }: { onChange: (c: Coordenadas) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Alternativa de teclado: con el mapa enfocado, Enter marca el centro de la vista. */
function ColocarConTeclado({
  onChange,
  descripcionId,
}: {
  onChange: (c: Coordenadas) => void;
  descripcionId: string;
}) {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Mapa para ubicar la comunidad');
    el.setAttribute('aria-describedby', descripcionId);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && ev.target === el) {
        ev.preventDefault();
        const c = map.getCenter();
        onChange({ lat: c.lat, lng: c.lng });
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [map, onChange, descripcionId]);
  return null;
}

const fmt = (n: number) => n.toFixed(5);

export default function MapaComunidad({ value, onChange, nivel }: MapaComunidadProps) {
  const descripcionId = useId();
  const color = nivel ? VIABILIDAD_COLORES[nivel].solid : COLORES_BASE.accent;

  const icon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<span class="marker-pin" style="background:${color}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    [color],
  );

  const eventHandlers = useMemo(
    () => ({
      dragend: (e: L.LeafletEvent) => {
        const { lat, lng } = (e.target as L.Marker).getLatLng();
        onChange({ lat, lng });
      },
    }),
    [onChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ubicación de la comunidad</CardTitle>
        <CardDescription>
          Solo referencia visual: estas coordenadas no se envían al motor de inferencia.
        </CardDescription>
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        <div className="group relative isolate overflow-hidden rounded-lg border border-line">
          <MapContainer
            center={[MAPA_CENTRO_INICIAL.lat, MAPA_CENTRO_INICIAL.lng]}
            zoom={MAPA_ZOOM_INICIAL}
            scrollWheelZoom={false}
            className="h-72 w-full sm:h-80"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ColocarConClic onChange={onChange} />
            <ColocarConTeclado onChange={onChange} descripcionId={descripcionId} />
            {value ? (
              <Marker
                position={[value.lat, value.lng]}
                icon={icon}
                draggable
                keyboard={false}
                eventHandlers={eventHandlers}
              />
            ) : null}
          </MapContainer>
          {/* Mira central: solo visible con el mapa enfocado por teclado. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-overlay h-4 w-4 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100"
          >
            <span className="absolute left-1/2 top-0 h-full w-px bg-ink" />
            <span className="absolute left-0 top-1/2 h-px w-full bg-ink" />
          </div>
        </div>

        <p id={descripcionId} className="text-xs text-ink-subtle">
          Haz clic para colocar el marcador y arrástralo para ajustarlo. Con teclado: enfoca el
          mapa, muévelo con las flechas y presiona Enter para marcar el centro.
        </p>

        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="font-mono text-sm tabular-nums text-ink">
            {value
              ? `Latitud ${fmt(value.lat)}, longitud ${fmt(value.lng)}`
              : 'Sin ubicación marcada'}
            {value && nivel ? (
              <span className="ml-2 font-sans text-xs text-ink-subtle">
                Marcador: viabilidad {NIVEL_LABEL[nivel].toLowerCase()}
              </span>
            ) : null}
          </p>
          <Button variant="ghost" size="sm" disabled={!value} onClick={() => onChange(null)}>
            Quitar marcador
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

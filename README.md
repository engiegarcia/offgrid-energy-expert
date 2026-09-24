# Energía off-grid · Frontend del sistema experto

Frontend web (Next.js 14, App Router) del sistema experto de selección de fuentes de energía renovable
off-grid para comunidades rurales (proyecto UNMSM, curso Sistemas Inteligentes). Consume el backend
FastAPI: el usuario ingresa mediciones biofísicas y socioeconómicas y recibe las tecnologías
recomendadas, la regla que justifica cada una y la viabilidad por recurso.

**Gestor de paquetes: `pnpm`** (usa `pnpm install --frozen-lockfile` en CI).

## Puesta en marcha

```bash
cp .env.local.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:8000
pnpm install
pnpm dev                              # http://localhost:3000
```

| Comando                 | Qué hace                                                    |
| ----------------------- | ----------------------------------------------------------- |
| `pnpm lint`             | ESLint (Next, `@typescript-eslint`, `jsx-a11y`), 0 warnings |
| `pnpm typecheck`        | `tsc --noEmit` (strict + `noUncheckedIndexedAccess`)        |
| `pnpm format:check`     | Prettier (con orden de clases de Tailwind)                  |
| `pnpm test`             | Vitest + React Testing Library                              |
| `pnpm test:e2e`         | Playwright (build de producción + API mockeada)             |
| `pnpm build`            | Build de producción                                         |

Primera vez con e2e: `pnpm exec playwright install --with-deps chromium`.

## Despliegue en Vercel

Zero-config: no hace falta `vercel.json` para un proyecto Next.js estándar.

1. Importa el repositorio en Vercel.
2. En _Project Settings → Environment Variables_ define `NEXT_PUBLIC_API_URL` con la URL del backend
   desplegado (sin barra final). Es una variable `NEXT_PUBLIC_`: se incrusta en el build, así que hay que
   **redeployar** tras cambiarla.
3. ⚠️ **Agrega el dominio de Vercel a `cors_allowed_origins` del backend** (p. ej.
   `https://tu-proyecto.vercel.app`). Sin esto el navegador bloquea las peticiones y la UI mostrará
   «No se pudo conectar con el motor». Ver el prompt/README del backend.

## Contrato con el backend

No se modifica el backend; los tipos (`types/api.ts`) y el schema zod (`lib/schemas.ts`) lo espejan.

- `POST /api/evaluar-zona` → 200 · 422 (`detail: [...]`) · 500 (`{ detail, error_code }`)
- `GET /api/reglas` → 30 reglas
- `GET /health` → indicador «Motor en línea» del encabezado

El schema zod replica los rangos de Pydantic y la regla cruzada (`hay_curso_agua = "no"` ⇒ `caudal = 0` y
`salto_neto = 0`) con mensajes en español. En la UI, esos dos campos se deshabilitan y se fijan en 0.

## Decisiones de arquitectura

- **Las coordenadas del mapa NO se envían al backend.** `EvaluacionRequest` no tiene latitud/longitud,
  así que el mapa es contexto visual: el estado `{ lat, lng }` vive en `Evaluador.tsx` y no entra al
  payload ni al schema. La UI lo dice explícitamente. Para persistirlas habría que extender el contrato
  en ambos lados. (Está documentado en `MapaComunidad.tsx`.)
- **Mapa con `next/dynamic` + `{ ssr: false }`.** Leaflet accede a `window` al importarse; en servidor
  rompería el render. El `loading` es un skeleton con la misma altura para evitar saltos de layout. El
  marcador es un `divIcon` propio (los íconos por defecto de Leaflet no se resuelven bien con el
  bundler de Next) y toma el color del mejor nivel de viabilidad del resultado.
- **React Query (`useMutation`) en vez de estado local.** Da `isPending`, error tipado y ciclo de vida
  sin condiciones de carrera al reenviar. Los errores de red/servidor disparan un toast desde el hook;
  el 422 se pinta junto a cada campo.
- **`/reglas` es Server Component** (datos en el HTML inicial, sin waterfall) con el filtrado en un
  Client Component. Usa `force-dynamic` para que `next build` no dependa de que el backend esté
  disponible, y cachea el fetch 5 min. Las cards de recomendación, en cambio, piden las reglas desde el
  cliente (React Query, `staleTime: Infinity`) solo cuando se abre el detalle de un badge.
- **Errores diferenciados:** red/CORS/timeout (`ApiNetworkError`, reintentable), validación 422
  (`ApiValidationError`, no reintentable: hay que corregir datos) y servidor (`ApiServerError`, mensaje
  genérico + reintentar). Todas las peticiones tienen timeout de 10 s (`AbortController`).
- **Accesibilidad del mapa:** las coordenadas se muestran como texto; con el mapa enfocado, las flechas
  lo mueven y **Enter** marca el centro (aparece una mira). Colores nunca como único canal: cada barra del
  gráfico lleva su nivel escrito y el gráfico tiene un `aria-label` con todos los valores.

## Decisiones estéticas

- **Concepto: un amanecer sobre los Andes.** Cabecera y héroe forman una banda oscura que termina en una
  cordillera de capas planas (cada vez más claras, como niebla de valle) hasta fundirse con el terreno de
  la página. El sol sale por detrás de la primera capa (`animate-sunrise`, 1,6 s, una sola vez al cargar):
  es el único movimiento que ocurre solo. `components/Hero.tsx`.
- **Paleta** (`lib/constants.ts` → `tailwind.config.ts`, fuente única): terreno mineral `ground #EDF0EC`,
  tinta `ink #12282E`, noche andina `night #10303A` (cabecera, héroe, pie, tiles de icono), acción teal
  `accent #17565F` y oro `sun #F6B24A` (solo decorativo: logo y héroe, nunca lleva texto). Viabilidad:
  verde `#2E8B57`, amarillo `#DDB021`, naranja `#E07B2A`, rojo `#C8483E`, cada uno con variante suave y
  tinta AA para badges. Se reutiliza en gráfico, marcador del mapa, badges y puntos.
- **Tipografía:** Bricolage Grotesque (`font-display`: títulos, nombres de tecnología) + Instrument Sans
  (texto) + JetBrains Mono (solo condiciones de reglas, códigos y coordenadas). Se sirven con
  `@fontsource-variable` (sin depender de Google Fonts en build). Escala cerrada: 12/14/16/20/24/32/44 px.
- **Espaciado:** grilla de 4 px (escala por defecto de Tailwind, más `15` = 60 px para alinear el detalle
  de la regla bajo el título de la card).
- **Radios y elevación:** `rounded-md` (8 px) controles, `rounded-lg` (12 px) cards internas,
  `rounded-xl` (18 px) paneles. Dos sombras teñidas con la tinta del proyecto: `raised` y `overlay`.
- **Formulario:** cada grupo (Comunidad, Recursos, Agua, Biomasa, Demanda) lleva un icono y un filete; el
  botón «Evaluar zona» queda pegado al borde inferior porque el formulario es largo.
- **Resultados:** cada tecnología lleva el icono de su fuente; la viabilidad es un gráfico de barras
  horizontales sobre una pista, con el nivel escrito a la derecha y una clave de color debajo.
- **Motion:** una sola curva `[0.16, 1, 0.3, 1]` (`EASE`) para framer-motion y CSS. Las respuestas a
  acciones nada superan 350 ms (stagger de 50 ms en las recomendaciones, barras que crecen desde 0,
  panel de regla que se expande); la excepción es el amanecer del héroe. `prefers-reduced-motion`
  respetado (`MotionConfig` + CSS).
- **Carga:** skeletons con la silueta del resultado; el spinner queda solo en el botón de envío.
- **Foco:** anillo propio (`.focus-ring`, `.focus-ring-dark` sobre fondos oscuros, `.focus-field`).
- **Toasts:** `sonner`, un único `<Toaster />` en `app/layout.tsx`, abajo a la derecha.

## Supuestos a revisar

- Los textos de ayuda de cada campo están redactados a partir del contrato (unidades y rangos), no
  copiados de los `Field()` reales del backend; ajústalos en `components/EvaluacionForm.tsx` (`CAMPOS`).
- Las etiquetas de capa («viabilidad por recurso» / «selección de tecnología») se infieren del contrato
  (la Capa 2 produce las recomendaciones). Editables en `CAPA_LABEL`.
- Versiones fijadas a Next 14 / React 18: implica `react-leaflet@4`, `recharts@2` y `sonner@1`.

## Estructura

```
app/            layout, páginas (/, /reglas), error boundary, estilos globales
components/     Evaluador (composición), formulario, resultados, gráfico, mapa, estados
components/ui/  mini design-system: Button, Input, Select, Card, Badge, Spinner, Skeleton
hooks/          useEvaluarZona (mutation), useReglas, useHealth
lib/            api (fetch tipado + errores), schemas (zod), constants (tokens), motion
types/          contrato de la API
tests/          Vitest: schema, formulario, cliente API, resultados
e2e/            Playwright con API mockeada (page.route)
```

## CI

`.github/workflows/ci.yml`: en cada push/PR corre ESLint, Prettier, `tsc`, Vitest y `next build`;
Playwright corre en un job separado que depende del primero.

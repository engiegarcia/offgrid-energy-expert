import type { ReactNode } from 'react';
import { IconDrop, IconLeaf, IconSun, IconWind } from '@/components/icons';
import { RECURSO_LABEL } from '@/lib/constants';
import { cn } from '@/lib/cn';

/**
 * Cordilleras en capas, cada vez más claras hacia abajo (niebla de valle) hasta
 * fundirse con el color del terreno. El sol sale por detrás de la primera capa:
 * es el único movimiento que ocurre solo, una vez, al cargar la página.
 */
function Cordillera() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none relative block h-auto min-h-[180px] w-full"
    >
      <g className="animate-sunrise">
        <circle cx="840" cy="128" r="88" fill="none" stroke="#F6B24A" strokeOpacity="0.35" />
        <circle cx="840" cy="128" r="58" fill="#F6B24A" />
      </g>
      <path
        d="M0 190 90 150 170 178 260 118 340 160 430 132 520 176 610 104 700 158 780 138 870 184 960 146 1050 96 1140 152 1230 128 1320 170 1440 122V300H0Z"
        fill="#1B4A56"
      />
      <path
        d="M0 226 110 184 200 212 300 160 390 204 500 172 590 218 690 168 790 210 890 186 990 224 1090 176 1190 214 1300 180 1440 216V300H0Z"
        fill="#4A7F86"
      />
      <path
        d="M0 258 130 226 240 250 350 214 470 252 590 232 710 262 830 228 950 254 1070 224 1190 256 1310 232 1440 258V300H0Z"
        fill="#A9C4C3"
      />
      <path
        d="M0 284 160 268 320 282 500 262 680 284 860 270 1040 286 1220 268 1440 284V300H0Z"
        fill="#EDF0EC"
      />
    </svg>
  );
}

const FUENTES = [
  { icon: IconSun, label: RECURSO_LABEL.solar },
  { icon: IconWind, label: RECURSO_LABEL.eolico },
  { icon: IconDrop, label: RECURSO_LABEL.hidraulico },
  { icon: IconLeaf, label: RECURSO_LABEL.biomasa },
];

interface PageHeroProps {
  title: string;
  children: ReactNode;
  /** Muestra las cuatro fuentes que evalúa el motor. */
  fuentes?: boolean;
  className?: string;
}

/** Continúa la cabecera oscura y termina en la cordillera. */
export function PageHero({ title, children, fuentes = false, className }: PageHeroProps) {
  return (
    <section className={cn('relative isolate overflow-hidden bg-night', className)}>
      <div className="relative z-10 mx-auto w-full max-w-page px-4 pb-8 pt-6 sm:px-6">
        <h1 className="max-w-[24ch] text-balance font-display text-2xl font-semibold text-white sm:text-3xl">
          {title}
        </h1>
        <div className="mt-4 max-w-prose text-base text-white/80">{children}</div>
        {fuentes ? (
          <ul aria-label="Fuentes que evalúa el motor" className="mt-6 flex flex-wrap gap-2">
            {FUENTES.map(({ icon: Icono, label }) => (
              <li
                key={label}
                className="flex h-9 items-center gap-2 rounded-full bg-white/10 pl-3 pr-4 text-sm font-medium text-white ring-1 ring-inset ring-white/15"
              >
                <Icono className="h-4 w-4 text-sun" />
                {label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {/* La cordillera sube un poco sobre el texto; el -1px evita la costura del subpíxel. */}
      <div className="-mb-px -mt-4 sm:-mt-16">
        <Cordillera />
      </div>
    </section>
  );
}

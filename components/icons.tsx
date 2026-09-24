import type { SVGProps } from 'react';

/** Iconos de trazo (24×24, 1.5 px). Decorativos: siempre `aria-hidden`. */
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
      {...props}
    />
  );
}

export const IconChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const IconOffline = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M8.5 16.4a5 5 0 0 1 7 0" />
    <path d="M5 12.9a10 10 0 0 1 3.3-2.1" />
    <path d="M10.7 5.1A15 15 0 0 1 22 8.8" />
    <path d="M2 8.8a15 15 0 0 1 3-2.1" />
    <path d="M12 20h.01" />
  </Icon>
);

export const IconAlert = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4.5" />
    <path d="M12 17.5h.01" />
  </Icon>
);

export const IconServer = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
    <path d="M7 7h.01M7 17h.01" />
  </Icon>
);

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);

export const IconPin = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.25" />
  </Icon>
);

export const IconSun = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </Icon>
);

export const IconWind = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 9h10.5a2.5 2.5 0 1 0-2.4-3.2" />
    <path d="M3 13.5h15a2.75 2.75 0 1 1-2.6 3.6" />
    <path d="M3 18h6.5" />
  </Icon>
);

export const IconDrop = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3.5s6 6.3 6 10.5a6 6 0 0 1-12 0c0-4.2 6-10.5 6-10.5Z" />
    <path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.4" />
  </Icon>
);

export const IconLeaf = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M5 19c0-8 4.5-13.5 14-14 0 9-5 14-13 14" />
    <path d="M5 19c2-4 5-7 9-9" />
  </Icon>
);

export const IconBolt = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z" />
  </Icon>
);

export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19c.4-3 2.6-4.8 5.5-4.8s5.1 1.8 5.5 4.8" />
    <path d="M15.5 5.7a3 3 0 0 1 0 5.6M17 14.5c2 .5 3.2 2 3.5 4.5" />
  </Icon>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

/** Sol sobre una cordillera: la marca del proyecto. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className ?? 'h-8 w-8'}>
      <circle cx="19.5" cy="13" r="5.5" fill="#F6B24A" />
      <path d="M2 27 11 13.5l4.5 6.5 3-4L30 27H2Z" fill="#DDEBE9" />
      <path d="M2 27 8 20l3 3.5 4-5.5 4.5 9H2Z" fill="#7FA9AC" />
    </svg>
  );
}

/** Icono según la tecnología recomendada (por palabras clave del nombre). */
export function iconoDeTecnologia(nombre: string): (p: SVGProps<SVGSVGElement>) => JSX.Element {
  const n = nombre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
  if (/solar|fotovolt|panel/.test(n)) return IconSun;
  if (/eolic|aerogen|viento/.test(n)) return IconWind;
  if (/hidraul|hidro|turbina|banki|pelton|agua/.test(n)) return IconDrop;
  if (/biodig|biogas|biomasa|estiercol/.test(n)) return IconLeaf;
  return IconBolt;
}

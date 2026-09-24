import type { Config } from 'tailwindcss';
import { COLORES_BASE as C, EASE_CSS, VIABILIDAD_COLORES } from './lib/constants';

/**
 * Design tokens.
 *  - Tipografía: escala cerrada (12/14/16/20/24/32). Sin tamaños sueltos.
 *  - Espaciado: la escala por defecto de Tailwind ya es una grilla de 4 px.
 *  - Radios: md (8 px) controles · lg (12 px) tarjetas · xl (18 px) paneles principales.
 *  - Elevación: solo dos niveles (`raised`, `overlay`).
 *  - Easing: una sola curva, compartida con framer-motion vía `lib/constants.ts`.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.ts'],
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
      xl: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
      '2xl': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
      '3xl': ['2.75rem', { lineHeight: '3rem', letterSpacing: '-0.03em' }],
    },
    borderRadius: {
      none: '0',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '18px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      raised: '0 1px 2px 0 rgb(16 48 58 / 0.05), 0 8px 20px -10px rgb(16 48 58 / 0.14)',
      overlay: '0 12px 28px -10px rgb(16 48 58 / 0.28), 0 1px 2px 0 rgb(16 48 58 / 0.08)',
    },
    extend: {
      colors: {
        ground: C.ground,
        surface: C.surface,
        night: { DEFAULT: C.night, deep: C.nightDeep },
        sun: C.sun,
        ink: {
          DEFAULT: C.ink,
          muted: C.inkMuted,
          subtle: C.inkSubtle,
        },
        line: {
          DEFAULT: C.line,
          strong: C.lineStrong,
        },
        accent: {
          DEFAULT: C.accent,
          hover: C.accentHover,
          soft: C.accentSoft,
        },
        viab: {
          alta: {
            DEFAULT: VIABILIDAD_COLORES.alta.solid,
            soft: VIABILIDAD_COLORES.alta.soft,
            ink: VIABILIDAD_COLORES.alta.ink,
          },
          media: {
            DEFAULT: VIABILIDAD_COLORES.media.solid,
            soft: VIABILIDAD_COLORES.media.soft,
            ink: VIABILIDAD_COLORES.media.ink,
          },
          baja: {
            DEFAULT: VIABILIDAD_COLORES.baja.solid,
            soft: VIABILIDAD_COLORES.baja.soft,
            ink: VIABILIDAD_COLORES.baja.ink,
          },
          inviable: {
            DEFAULT: VIABILIDAD_COLORES.inviable.solid,
            soft: VIABILIDAD_COLORES.inviable.soft,
            ink: VIABILIDAD_COLORES.inviable.ink,
          },
        },
      },
      fontFamily: {
        sans: [
          '"Instrument Sans Variable"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
        display: [
          '"Bricolage Grotesque Variable"',
          '"Instrument Sans Variable"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      spacing: {
        15: '3.75rem',
      },
      gridTemplateColumns: {
        workspace: 'minmax(0, 27rem) minmax(0, 1fr)',
      },
      minWidth: {
        table: '56rem',
      },
      maxWidth: {
        page: '72rem',
        prose: '62ch',
      },
      zIndex: {
        overlay: '1000',
      },
      transitionTimingFunction: {
        DEFAULT: EASE_CSS,
        out: EASE_CSS,
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        sunrise: {
          from: { transform: 'translateY(64px)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 1.6s ease-in-out infinite',
        sunrise: `sunrise 1600ms ${EASE_CSS} 150ms both`,
        'fade-in': `fade-in 200ms ${EASE_CSS} both`,
      },
    },
  },
  plugins: [],
};

export default config;

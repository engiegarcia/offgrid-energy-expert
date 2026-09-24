import { cn } from '@/lib/cn';

/**
 * Estilos del botón en un módulo SIN 'use client', para que también los
 * puedan usar Server Components (p. ej. un <Link> con apariencia de botón).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const VARIANTES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white shadow-raised hover:bg-accent-hover',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-ground',
  ghost: 'text-ink-muted hover:bg-ground hover:text-ink',
};

const TAMANOS: Record<ButtonSize, string> = {
  sm: 'h-8 px-3',
  md: 'h-11 px-5',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(
    'focus-ring inline-flex select-none items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
    VARIANTES[variant],
    TAMANOS[size],
    className,
  );
}

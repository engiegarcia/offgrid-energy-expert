import type { HTMLAttributes } from 'react';
import { NIVEL_CLASES } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { NivelViabilidad } from '@/types/api';

export type BadgeTone = 'neutral' | 'accent' | NivelViabilidad;

const TONOS: Record<'neutral' | 'accent', string> = {
  neutral: 'bg-ground text-ink-muted ring-1 ring-inset ring-line',
  accent: 'bg-accent-soft text-accent',
};

export function badgeClasses(tone: BadgeTone = 'neutral', className?: string): string {
  const color = tone === 'neutral' || tone === 'accent' ? TONOS[tone] : NIVEL_CLASES[tone].badge;
  return cn(
    'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors',
    color,
    className,
  );
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Punto de color previo al texto (refuerza el nivel sin depender solo del color). */
  dot?: boolean;
}

export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={badgeClasses(tone, className)} {...props}>
      {dot && tone !== 'neutral' && tone !== 'accent' ? (
        <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', NIVEL_CLASES[tone].dot)} />
      ) : null}
      {children}
    </span>
  );
}

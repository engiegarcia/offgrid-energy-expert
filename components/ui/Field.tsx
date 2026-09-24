import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const helpId = (id: string) => `${id}-help`;
export const errorId = (id: string) => `${id}-error`;
export const unitId = (id: string) => `${id}-unit`;

/** Construye `aria-describedby` con solo los elementos presentes. */
export function describedBy(
  id: string,
  parts: { help?: boolean; error?: boolean; unit?: boolean },
): string | undefined {
  const ids = [
    parts.unit ? unitId(id) : null,
    parts.help ? helpId(id) : null,
    parts.error ? errorId(id) : null,
  ].filter((v): v is string => v !== null);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

interface FieldProps {
  id: string;
  label: string;
  help?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/** Envoltorio común: label → control → ayuda → error (con `role="alert"`). */
export function Field({ id, label, help, error, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {help ? (
        <p id={helpId(id)} className="text-xs text-ink-subtle">
          {help}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId(id)}
          role="alert"
          className="animate-fade-in text-xs font-medium text-viab-inviable-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlBase =
  'focus-field h-11 w-full rounded-md border bg-surface px-3.5 text-base text-ink shadow-[inset_0_1px_1px_rgb(16_48_58/0.04)] transition-colors placeholder:text-ink-subtle/60 disabled:cursor-not-allowed disabled:bg-ground disabled:text-ink-subtle';

export const controlBorde = (error: boolean) =>
  error ? 'border-viab-inviable' : 'border-line-strong hover:border-ink-subtle';

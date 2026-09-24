import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { controlBase, controlBorde, describedBy, Field, unitId } from './Field';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string;
  label: string;
  help?: string;
  error?: string;
  /** Unidad mostrada dentro del campo, p. ej. "l/s". */
  unit?: string;
  /** Valores numéricos con cifras tabulares. */
  mono?: boolean;
  /** Icono decorativo al inicio del campo (p. ej. una lupa). */
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, help, error, unit, mono, icon, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} help={help} error={error}>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-subtle">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, {
            unit: Boolean(unit),
            help: Boolean(help),
            error: Boolean(error),
          })}
          className={cn(
            controlBase,
            controlBorde(Boolean(error)),
            mono && 'tabular-nums',
            unit && 'pr-28',
            icon && 'pl-10',
            className,
          )}
          {...props}
        />
        {unit ? (
          <span
            id={unitId(inputId)}
            className="pointer-events-none absolute inset-y-1.5 right-1.5 flex items-center rounded-sm bg-ground px-2 text-xs font-medium text-ink-muted"
          >
            {unit}
          </span>
        ) : null}
      </div>
    </Field>
  );
});

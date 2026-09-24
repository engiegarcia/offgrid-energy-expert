import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { IconChevronDown } from '@/components/icons';
import { cn } from '@/lib/cn';
import { controlBase, controlBorde, describedBy, Field } from './Field';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string;
  label: string;
  help?: string;
  error?: string;
  /** Opción inicial sin valor; obliga a elegir de forma explícita. */
  placeholder?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, help, error, placeholder, className, children, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <Field id={selectId} label={label} help={help} error={error}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, { help: Boolean(help), error: Boolean(error) })}
          className={cn(
            controlBase,
            controlBorde(Boolean(error)),
            'cursor-pointer appearance-none pr-10',
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {children}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      </div>
    </Field>
  );
});

'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';
import { DURACION, EASE } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button-styles';
import { Spinner } from './Spinner';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const inactivo = Boolean(disabled) || loading;
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={inactivo}
      aria-busy={loading || undefined}
      whileHover={inactivo ? undefined : { scale: 1.01 }}
      whileTap={inactivo ? undefined : { scale: 0.98 }}
      transition={{ duration: DURACION.rapida, ease: EASE }}
      className={buttonClasses(
        variant,
        size,
        cn(
          loading ? 'cursor-progress' : 'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        ),
      )}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </motion.button>
  );
});

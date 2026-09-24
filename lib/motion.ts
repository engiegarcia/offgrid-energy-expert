import type { Variants } from 'framer-motion';
import { DURACION, EASE, STAGGER } from './constants';

/** Contenedor: escalona la entrada de sus hijos. */
export const listaVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren: 0.02 } },
};

/** Elemento de lista: sube 8 px mientras aparece. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: DURACION.entrada, ease: [...EASE] } },
};

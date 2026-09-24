import { cn } from '@/lib/cn';

/** Placeholder con el mismo layout que el contenido final. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-breathe rounded-md bg-line', className)} />;
}

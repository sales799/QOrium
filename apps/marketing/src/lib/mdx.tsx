import * as React from 'react';
import { cn } from '@/lib/cn';

type Props<T extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[T];

export const mdxComponents = {
  h1: ({ className, ...p }: Props<'h1'>) => (
    <h1
      className={cn(
        'mt-10 scroll-mt-24 font-sans text-3xl font-semibold text-foreground',
        className,
      )}
      {...p}
    />
  ),
  h2: ({ className, ...p }: Props<'h2'>) => (
    <h2
      className={cn(
        'mt-10 scroll-mt-24 font-sans text-2xl font-semibold text-foreground',
        className,
      )}
      {...p}
    />
  ),
  h3: ({ className, ...p }: Props<'h3'>) => (
    <h3
      className={cn('mt-8 scroll-mt-24 font-sans text-xl font-semibold text-foreground', className)}
      {...p}
    />
  ),
  p: ({ className, ...p }: Props<'p'>) => (
    <p
      className={cn('mt-5 font-serif text-lg leading-relaxed text-foreground/90', className)}
      {...p}
    />
  ),
  ul: ({ className, ...p }: Props<'ul'>) => (
    <ul
      className={cn(
        'mt-5 list-disc space-y-2 pl-6 font-serif text-lg text-foreground/90',
        className,
      )}
      {...p}
    />
  ),
  ol: ({ className, ...p }: Props<'ol'>) => (
    <ol
      className={cn(
        'mt-5 list-decimal space-y-2 pl-6 font-serif text-lg text-foreground/90',
        className,
      )}
      {...p}
    />
  ),
  blockquote: ({ className, ...p }: Props<'blockquote'>) => (
    <blockquote
      className={cn(
        'mt-6 border-l-4 border-signal-500 bg-surface-1 px-6 py-4 font-serif text-lg italic text-foreground/90',
        className,
      )}
      {...p}
    />
  ),
  a: ({ className, ...p }: Props<'a'>) => (
    <a className={cn('text-signal-300 underline-offset-4 hover:underline', className)} {...p} />
  ),
  code: ({ className, ...p }: Props<'code'>) => (
    <code
      className={cn(
        'rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm text-signal-300',
        className,
      )}
      {...p}
    />
  ),
  pre: ({ className, ...p }: Props<'pre'>) => (
    <pre
      className={cn(
        'mt-6 overflow-x-auto rounded-lg border border-border bg-surface-1 p-4 font-mono text-sm leading-relaxed text-foreground/90',
        className,
      )}
      {...p}
    />
  ),
  hr: ({ className, ...p }: Props<'hr'>) => (
    <hr className={cn('my-10 border-border', className)} {...p} />
  ),
};

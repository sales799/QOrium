'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/site/Logo';
import { MaxWidth } from '@/components/site/MaxWidth';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Marketing site error:', error);
    }
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border/60">
        <MaxWidth as="div" className="flex h-16 items-center">
          <Link href="/" aria-label="Qorium home">
            <Logo />
          </Link>
        </MaxWidth>
      </header>
      <MaxWidth as="div" className="flex flex-1 flex-col items-start justify-center gap-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warning">Something broke</p>
        <h1 className="text-display-2 font-semibold text-balance">A question retrieval failed.</h1>
        <p className="max-w-xl text-pretty text-muted-foreground">
          The page hit an unexpected error. We&rsquo;ve logged it. Try again, or head home.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
      </MaxWidth>
    </main>
  );
}

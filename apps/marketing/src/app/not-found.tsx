import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/site/Logo';
import { MaxWidth } from '@/components/site/MaxWidth';

export const metadata: Metadata = {
  title: '404 — Question not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col bg-ink text-graphite-50">
      <header className="border-b border-border/60">
        <MaxWidth as="div" className="flex h-16 items-center">
          <Link href="/" aria-label="Qorium home">
            <Logo />
          </Link>
        </MaxWidth>
      </header>
      <MaxWidth as="div" className="flex flex-1 flex-col items-start justify-center gap-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">404</p>
        <h1 className="text-display-2 font-semibold text-balance">
          That question isn&rsquo;t in the bank.
        </h1>
        <p className="max-w-xl text-pretty text-muted-foreground">
          The page you wanted got rotated, retired, or never existed. Try one of these instead.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/product">See the platform</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/blog">Read the blog</Link>
          </Button>
        </div>
      </MaxWidth>
    </main>
  );
}

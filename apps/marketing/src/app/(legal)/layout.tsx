import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Logo } from '@/components/site/Logo';
import { MaxWidth } from '@/components/site/MaxWidth';
import { siteConfig } from '@/content/site.config';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <Link href="/" aria-label="Qorium home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </header>
      <main id="main" className="bg-background">
        <MaxWidth as="div" className="py-16">
          <div className="mx-auto max-w-3xl">{children}</div>
        </MaxWidth>
      </main>
      <footer className="border-t border-border/60 bg-surface-1">
        <MaxWidth as="div" className="py-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.legalEntity}.
          </p>
        </MaxWidth>
      </footer>
    </>
  );
}

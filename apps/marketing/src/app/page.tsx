import Link from 'next/link';
import { siteConfig } from '@/content/site.config';

export default function HomePage() {
  return (
    <main id="main" className="relative min-h-screen overflow-hidden bg-ink text-graphite-50">
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-content px-6 py-24 lg:py-32">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">
          Question-Bank-as-a-Service · Pre-launch
        </p>
        <h1 className="mt-6 font-sans text-display-1 font-semibold text-balance">
          {siteConfig.tagline}
        </h1>
        <p className="mt-8 max-w-3xl text-lg text-graphite-300 text-pretty">
          {siteConfig.description}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/demo"
            className="rounded-md bg-signal-500 px-5 py-2.5 text-sm font-medium text-ink hover:bg-signal-300 transition-colors"
          >
            Book a demo
          </Link>
          <Link
            href="/product"
            className="rounded-md border border-border-subtle px-5 py-2.5 text-sm font-medium text-graphite-100 hover:bg-surface-2 transition-colors"
          >
            See the platform
          </Link>
        </div>
        <p className="mt-12 font-mono text-xs text-graphite-500">
          Site under construction — full pages ship in Sprints 2-10.
        </p>
      </div>
    </main>
  );
}

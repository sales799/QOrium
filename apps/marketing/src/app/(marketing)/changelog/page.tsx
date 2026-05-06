import type { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { CHANGELOG } from '@/content/changelog';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What we shipped, when. Append-only, grounded in commits and ratified docs.',
};

const CATEGORY_COLOR: Record<string, string> = {
  site: 'text-secondary',
  platform: 'text-positive',
  governance: 'text-warning',
  content: 'text-signal-300',
  sales: 'text-foreground',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ChangelogPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-4">
            <Badge>Changelog</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              What we shipped, when.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              Append-only. Every entry grounds in a specific commit, doc ratification, or
              operational milestone. We don&apos;t ship aspirational entries.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-16">
        <MaxWidth as="div">
          <SectionHeading
            eyebrow="Timeline"
            title="Latest first."
            description="Five categories: site (the marketing surface), platform (ReadyBank API + auth + db), governance (constitutional artifacts), content (validated question waves), sales (Bali ops + customer wins)."
          />
          <Stagger className="mt-10 space-y-4">
            {CHANGELOG.map((entry) => (
              <StaggerItem key={`${entry.date}-${entry.title}`}>
                <article className="grid gap-4 rounded-lg border border-border bg-surface-1 p-5 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {fmtDate(entry.date)}
                    </p>
                    <p
                      className={`mt-1 font-mono text-xs uppercase tracking-[0.18em] ${
                        CATEGORY_COLOR[entry.category] ?? 'text-foreground'
                      }`}
                    >
                      {entry.category}
                    </p>
                  </div>
                  <div className="md:col-span-9">
                    <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.body}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-12 text-xs text-muted-foreground">
            Subscribe to{' '}
            <a href="/rss.xml" className="text-secondary hover:underline">
              RSS
            </a>{' '}
            for blog + changelog updates.
          </p>
        </MaxWidth>
      </section>
    </>
  );
}

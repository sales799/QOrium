import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { listBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Field notes from building the assessment-content layer.',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink py-20 text-graphite-50">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-4">
            <Badge>Blog</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Field notes from building the assessment-content layer.
            </h1>
            <p className="max-w-2xl text-pretty text-graphite-300">
              How the engine works under the hood, what we learn from the panel, what we got wrong
              and fixed.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-16">
        <MaxWidth as="div">
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-surface-1 p-6 transition-colors hover:border-signal-500/50"
                >
                  <p className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <Calendar className="size-3" /> {fmtDate(p.date)}
                  </p>
                  <h2 className="text-xl font-semibold text-foreground">{p.title}</h2>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  {p.tags?.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded-pill border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-signal-300 transition-transform group-hover:translate-x-1">
                    Read post <ArrowRight className="size-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet — check back soon.</p>
          ) : null}
        </MaxWidth>
      </section>
    </>
  );
}

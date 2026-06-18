import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { listBlogPosts } from '@/lib/blog';
import { WebPageJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Field notes from QOrium on skills assessments, anti-leak question banks, role graphs, calibration, staffing workflows, and defensible hiring evidence.',
  alternates: { canonical: '/blog' },
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
      <WebPageJsonLd
        name="QOrium blog"
        description="Articles on skills assessment, hiring, and psychometrics from QOrium."
        url={`${siteConfig.url}/blog`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]}
      />
      <section className="relative isolate overflow-hidden relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-4">
            <Badge>Blog</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Field notes from building the assessment-content layer.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
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

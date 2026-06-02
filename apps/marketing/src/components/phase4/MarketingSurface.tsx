import Link from 'next/link';
import type React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Network,
  ShieldCheck,
  Target,
} from 'lucide-react';

import { MaxWidth } from '@/components/site/MaxWidth';
import { cn } from '@/lib/cn';

export function PageHero({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="w-full border-b border-border bg-background">
      <MaxWidth as="div" className="grid gap-8 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <p className="font-mono text-xs uppercase text-secondary">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-normal md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
          {cta ? (
            <Link
              href={cta.href}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cta.label}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
        <div className="flex flex-col justify-between gap-8 rounded-lg border border-border bg-card p-5 md:min-h-80">
          <div>
            <p className="font-mono text-xs uppercase text-muted-foreground">
              Enterprise buyer path
            </p>
            <dl className="mt-5 grid gap-4">
              {[
                ['Question answered', 'What evidence does this page create?'],
                ['Proof discipline', 'Evidence-gated, no unsupported metrics'],
                ['Next action', 'Library, trust review, or proof run'],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-3">
            {[
              'Connected to sitemap and internal journey',
              'Mapped to trust, library, or demo intent',
              'Built for HR, talent, legal, and platform buyers',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <ShieldCheck className="size-4 text-secondary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </MaxWidth>
    </section>
  );
}

type JourneyLink = {
  label: string;
  href: string;
  body: string;
};

const defaultJourneyLinks: JourneyLink[] = [
  {
    label: 'Open library evidence',
    href: '/library',
    body: 'Move from the page topic into public skill, role, stack, and calibration context.',
  },
  {
    label: 'Review trust shell',
    href: '/trust',
    body: 'Check security, DPDP, responsible AI, method, science, and anti-leak posture.',
  },
  {
    label: 'Plan proof run',
    href: '/demo',
    body: 'Turn the buyer question into a scoped walkthrough, sample pack, or Stack-Vault discussion.',
  },
];

export function EnterpriseJourneyBand({
  eyebrow = 'Connected buyer journey',
  title = 'What this page helps the buyer decide.',
  description = 'Every QOrium page now resolves into a clear enterprise decision path: assess the role, understand the evidence, check the trust posture, and choose the next action.',
  proofPoints = [
    'Role, stack, or skill context is linked back to the library graph.',
    'Claims stay evidence-gated so public pages do not overstate capability.',
    'Next-step CTAs route to demo, trust review, sample packs, or related pages.',
  ],
  links = defaultJourneyLinks,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  proofPoints?: string[];
  links?: JourneyLink[];
}) {
  return (
    <section className="w-full border-y border-border bg-muted/35 py-16">
      <MaxWidth as="div" className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-xs font-semibold uppercase text-secondary">{eyebrow}</p>
          <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold md:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
          <div className="mt-6 grid gap-3">
            {proofPoints.map((item) => (
              <div key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {links.map((link, index) => {
            const Icon = index === 0 ? Network : index === 1 ? ShieldCheck : Target;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon className="size-5 text-secondary" />
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{link.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{link.body}</p>
              </Link>
            );
          })}
        </div>
      </MaxWidth>
    </section>
  );
}

export function CardGrid({
  children,
  columns = 'md:grid-cols-3',
}: {
  children: React.ReactNode;
  columns?: string;
}) {
  return <div className={cn('grid gap-4', columns)}>{children}</div>;
}

export function SurfaceCard({
  title,
  children,
  href,
}: {
  title: string;
  children: React.ReactNode;
  href?: string | undefined;
}) {
  const body = (
    <div className="h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60">
      <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div>
      {href ? (
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-secondary">
          Open page
          <ArrowRight className="size-4" />
        </span>
      ) : null}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export function SectionBand({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full py-16">
      <MaxWidth as="div">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-normal">{title}</h2>
          {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
        </div>
        {children}
      </MaxWidth>
    </section>
  );
}

export function EvidenceList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function MetaRow({
  duration,
  calibration,
  category,
}: {
  duration: string;
  calibration: string;
  category: string;
}) {
  return (
    <div className="grid gap-3 text-sm md:grid-cols-3">
      <div className="rounded-md border border-border bg-card p-4">
        <Clock className="mb-2 size-4 text-secondary" />
        {duration}
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <FileText className="mb-2 size-4 text-secondary" />
        {category}
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <ShieldCheck className="mb-2 size-4 text-secondary" />
        {calibration}
      </div>
    </div>
  );
}

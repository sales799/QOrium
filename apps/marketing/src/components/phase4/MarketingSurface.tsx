import Link from 'next/link';
import type React from 'react';
import { ArrowRight, CheckCircle2, Clock, FileText, ShieldCheck } from 'lucide-react';

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
            <p className="font-mono text-xs uppercase text-muted-foreground">Proof posture</p>
            <dl className="mt-5 grid gap-4">
              {[
                ['Claims', 'Evidence-gated'],
                ['Search', 'Schema-ready'],
                ['Compliance', 'DPDP-aligned'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-3">
            {[
              'DPDP-aligned language',
              'No unsupported public metrics',
              'Schema and sitemap ready',
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

export function WorkflowSteps({
  eyebrow,
  title,
  description,
  steps,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  steps: Array<{ title: string; body: string }>;
}) {
  return (
    <section className="w-full border-y border-border bg-surface-1 py-16">
      <MaxWidth as="div" className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-mono text-xs uppercase text-secondary">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h2>
          {description ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="grid gap-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="grid gap-3 rounded-lg border border-border bg-background p-5 md:grid-cols-[3rem_1fr]"
            >
              <div className="flex size-10 items-center justify-center rounded-md border border-border bg-card font-mono text-xs text-secondary">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-normal">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </MaxWidth>
    </section>
  );
}

export function EvidenceRuleGrid({ rules }: { rules: Array<{ title: string; body: string }> }) {
  return (
    <CardGrid>
      {rules.map((rule) => (
        <SurfaceCard key={rule.title} title={rule.title}>
          {rule.body}
        </SurfaceCard>
      ))}
    </CardGrid>
  );
}

export function RelatedRoutes({
  links,
}: {
  links: Array<{ label: string; href: string; body: string }>;
}) {
  return (
    <CardGrid>
      {links.map((link) => (
        <SurfaceCard key={`${link.href}-${link.label}`} title={link.label} href={link.href}>
          {link.body}
        </SurfaceCard>
      ))}
    </CardGrid>
  );
}

export function ComparisonTable({
  columns,
  rows,
}: {
  columns: [string, string, string, string];
  rows: Array<[string, string, string, string]>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead className="bg-card text-left">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-border p-4 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${index}`}
                  className={cn(
                    'border-b border-border p-4 align-top',
                    index === 0 ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  FileText,
  FlaskConical,
  LockKeyhole,
  Radar,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { EvidenceProofBand } from '@/components/marketing/EvidenceProof';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { MaxWidth } from '@/components/site/MaxWidth';
import {
  trustHub,
  trustNavigation,
  type Citation,
  type TrustPageContent,
  type TrustPageSlug,
  type TrustStatus,
} from '@/content/trust';
import { cn } from '@/lib/cn';

const pageIcons: Record<TrustPageSlug, LucideIcon> = {
  trust: ShieldCheck,
  security: LockKeyhole,
  'compliance-dpdp': Scale,
  'responsible-ai': BrainCircuit,
  science: FlaskConical,
  method: BookOpenCheck,
  'anti-leak': Radar,
  authoring: FileText,
};

const statusLabels: Record<TrustStatus, string> = {
  shipped: 'Shipped',
  beta: 'Beta',
  roadmap: 'Roadmap',
  'self-attested': 'Self-attested',
  'evidence-held': 'Evidence held',
  'not-claimed': 'Not claimed',
};

const statusStyles: Record<TrustStatus, string> = {
  shipped: 'border-product-500/45 bg-product-100 text-product-500',
  beta: 'border-signal-500/45 bg-signal-100 text-signal-700',
  roadmap: 'border-india-500/45 bg-india-100 text-india-700',
  'self-attested': 'border-signal-500/45 bg-signal-100 text-signal-700',
  'evidence-held': 'border-product-500/45 bg-product-100 text-product-500',
  'not-claimed': 'border-border bg-muted text-muted-foreground',
};

function StatusPill({ status }: { status: TrustStatus }) {
  return (
    <span
      className={cn(
        'inline-flex w-max items-center rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function TrustHero({
  eyebrow,
  title,
  description,
  facts,
}: {
  eyebrow: string;
  title: string;
  description: string;
  facts: readonly { label: string; value: string }[];
}) {
  return (
    <section className="surface-shell evidence-ledger border-b border-white/10">
      <MaxWidth as="div" className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <Reveal>
          <div>
            <p className="font-mono text-xs font-semibold uppercase text-signal-300">{eyebrow}</p>
            <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">{description}</p>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
            <p className="font-mono text-xs font-semibold uppercase text-signal-300">
              Evidence posture
            </p>
            <dl className="mt-5 grid gap-4">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid gap-2 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <dt className="font-mono text-xs uppercase text-shell-muted">{fact.label}</dt>
                  <dd className="text-base font-semibold text-white">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </MaxWidth>
    </section>
  );
}

function TrustRail({ active }: { active: TrustPageSlug }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <nav aria-label="Trust pages" className="grid gap-1">
        {trustNavigation.map((item) => {
          const Icon = pageIcons[item.slug];
          const isActive = item.slug === active;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex gap-3 rounded-md border p-3 transition-colors',
                isActive
                  ? 'border-secondary/60 bg-card text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:bg-card',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-md border',
                  isActive
                    ? 'border-secondary/40 bg-signal-100 text-signal-700'
                    : 'border-border bg-background text-muted-foreground group-hover:text-secondary',
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-5">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function ControlTable({ page }: { page: TrustPageContent }) {
  const hasFlags = page.rows.some((row) => Boolean(row.flag));

  return (
    <section id="ledger" className="scroll-mt-24">
      <Reveal>
        <div className="mb-6 max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase text-secondary">
            Evidence ledger
          </p>
          <h2 className="mt-3 text-3xl font-semibold">{page.rowsHeading}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{page.rowsDescription}</p>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="max-w-full overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Control
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                {hasFlags ? (
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Flag
                  </th>
                ) : null}
                <th scope="col" className="px-4 py-3 font-semibold">
                  Evidence
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Owner
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Verified
                </th>
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-4 align-top font-semibold text-foreground">{row.label}</td>
                  <td className="px-4 py-4 align-top">
                    <StatusPill status={row.status} />
                  </td>
                  {hasFlags ? (
                    <td className="px-4 py-4 align-top font-mono text-xs text-muted-foreground">
                      {row.flag ? (
                        <span>
                          {row.flag}
                          {row.flagState ? (
                            <span className="mt-1 block uppercase">{row.flagState}</span>
                          ) : null}
                          {row.flagSource ? (
                            <span className="mt-1 block normal-case">{row.flagSource}</span>
                          ) : null}
                        </span>
                      ) : (
                        <span>n/a</span>
                      )}
                    </td>
                  ) : null}
                  <td className="max-w-md px-4 py-4 align-top leading-6 text-muted-foreground">
                    {row.evidenceUrl ? (
                      <Link href={row.evidenceUrl} className="font-semibold text-secondary">
                        {row.evidence}
                      </Link>
                    ) : (
                      row.evidence
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground">{row.owner}</td>
                  <td className="px-4 py-4 align-top font-mono text-xs text-muted-foreground">
                    {row.lastVerified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}

function DetailSections({ page }: { page: TrustPageContent }) {
  return (
    <section id="details" className="scroll-mt-24">
      <Stagger className="grid gap-4 md:grid-cols-3">
        {page.sections.map((section) => (
          <StaggerItem key={section.id}>
            <article className="h-full rounded-lg border border-border bg-card p-5">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p>
              <ul className="mt-5 space-y-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-secondary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function CitationStrip({ citations }: { citations: readonly Citation[] }) {
  return (
    <section id="sources" className="scroll-mt-24 rounded-lg border border-border bg-muted p-5">
      <p className="font-mono text-xs font-semibold uppercase text-muted-foreground">Sources</p>
      <ol className="mt-4 grid gap-3">
        {citations.map((citation, index) => (
          <li
            key={`${citation.label}-${index}`}
            className="text-sm leading-6 text-muted-foreground"
          >
            <span className="font-semibold text-foreground">
              [{index + 1}] {citation.label}
            </span>
            <span> - {citation.detail}</span>
            {citation.href ? (
              <Link
                href={citation.href}
                className="ml-2 inline-flex items-center gap-1 font-semibold text-secondary"
              >
                Open
                <ArrowRight className="size-3" />
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TrustHubPage() {
  return (
    <>
      <TrustHero
        eyebrow={trustHub.eyebrow}
        title={trustHub.title}
        description={trustHub.description}
        facts={trustHub.facts}
      />
      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div" className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <TrustRail active="trust" />
          <div className="grid min-w-0 gap-10">
            <Reveal>
              <div className="max-w-3xl">
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Trust destinations
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  Start with the reviewer question, then open the evidence.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Each destination keeps source notes and status labels visible, so sales copy and
                  governance evidence do not drift apart.
                </p>
              </div>
            </Reveal>
            <Stagger className="grid gap-4 md:grid-cols-2">
              {trustHub.links.map((item) => {
                const Icon = pageIcons[item.slug];

                return (
                  <StaggerItem key={item.href}>
                    <Link
                      href={item.href}
                      className="group block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60"
                    >
                      <Icon className="size-5 text-secondary" />
                      <h2 className="mt-4 text-xl font-semibold">{item.label}</h2>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                        Open page
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
            <EvidenceProofBand surface="trust" className="rounded-lg" />
            <CitationStrip citations={trustHub.citations} />
          </div>
        </MaxWidth>
      </section>
    </>
  );
}

export function TrustDetailPage({ page }: { page: TrustPageContent }) {
  const Icon = pageIcons[page.slug];

  return (
    <>
      <TrustHero
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        facts={page.facts}
      />
      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div" className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <TrustRail active={page.slug} />
          <div className="grid min-w-0 gap-12">
            <Reveal>
              <div className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <span
                  className="inline-flex size-12 items-center justify-center rounded-md border border-secondary/35 bg-signal-100 text-signal-700"
                  aria-hidden="true"
                >
                  <Icon className="size-6" />
                </span>
                <div>
                  <p className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                    Evidence policy
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Shipped rows need evidence. Beta rows need owner and date. Roadmap rows do not
                    masquerade as live product.
                  </p>
                </div>
                <Link
                  href="/demo"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Request review pack
                  <Sparkles className="size-4" />
                </Link>
              </div>
            </Reveal>
            <ControlTable page={page} />
            <DetailSections page={page} />
            <CitationStrip citations={page.citations} />
          </div>
        </MaxWidth>
      </section>
    </>
  );
}

export function getTrustPageMeta(page: TrustPageContent) {
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.route },
  };
}

import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, LineChart, ShieldCheck } from 'lucide-react';

import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { MaxWidth } from '@/components/site/MaxWidth';
import { getRenderableProofPopulation } from '@/content/proof.server';
import { proofPopulation, proofPopulationPolicy } from '@/content/proof';
import { cn } from '@/lib/cn';

type EvidenceProofBandProps = {
  className?: string;
  surface: 'home' | 'trust' | 'readybank' | 'jd-forge' | 'stack-vault' | string;
};

export function EvidenceLogoRail() {
  const items = getRenderableProofPopulation().logoRail;

  if (items.length === 0) {
    return null;
  }

  return (
    <div data-proof-module="logo-rail" className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Building2 className="size-5 text-secondary" />
        <h3 className="text-lg font-semibold">Customer logos</h3>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.evidenceId} className="rounded-md border border-border bg-background p-4">
            <p className="text-base font-semibold">{item.name}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EvidenceCaseStudyStrip() {
  const items = getRenderableProofPopulation().caseStudies;

  if (items.length === 0) {
    return null;
  }

  return (
    <div data-proof-module="case-studies" className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.evidenceId}
          href={item.href}
          className="group block rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60"
        >
          <BadgeCheck className="size-5 text-secondary" />
          <p className="mt-4 font-mono text-xs font-semibold uppercase text-muted-foreground">
            {item.buyer}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
            Read case study
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function EvidenceOutcomeStats() {
  const items = getRenderableProofPopulation().outcomeStats;

  if (items.length === 0) {
    return null;
  }

  return (
    <div data-proof-module="outcome-stats" className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.evidenceId} className="rounded-lg border border-border bg-card p-5">
          <LineChart className="size-5 text-secondary" />
          <p className="mt-4 text-3xl font-semibold">{item.value}</p>
          <p className="mt-2 text-sm font-semibold">{item.label}</p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.context}</p>
        </div>
      ))}
    </div>
  );
}

export function EvidenceProofBand({ className, surface }: EvidenceProofBandProps) {
  const renderable = getRenderableProofPopulation();
  const hasProof =
    renderable.logoRail.length > 0 ||
    renderable.caseStudies.length > 0 ||
    renderable.outcomeStats.length > 0;

  if (!hasProof) {
    return null;
  }

  return (
    <section
      data-proof-surface={surface}
      className={cn('border-b border-border bg-background py-16 md:py-20', className)}
    >
      <MaxWidth as="div">
        <Reveal>
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase text-secondary">
              Evidence populated
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
              Customer proof appears only after the source clears.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              These modules are already wired, but the public build shows only records with a live
              feature flag and approved evidence metadata.
            </p>
          </div>
        </Reveal>

        <Stagger className="grid gap-5">
          <StaggerItem>
            <EvidenceLogoRail />
          </StaggerItem>
          <StaggerItem>
            <EvidenceOutcomeStats />
          </StaggerItem>
          <StaggerItem>
            <EvidenceCaseStudyStrip />
          </StaggerItem>
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-6 rounded-lg border border-border bg-muted p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-secondary" />
              <p className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                Proof release policy
              </p>
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground">
              {proofPopulationPolicy.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </MaxWidth>
    </section>
  );
}

export const proofPopulationManifest = proofPopulation;

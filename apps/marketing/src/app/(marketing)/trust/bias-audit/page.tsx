import type { Metadata } from 'next';

import {
  CardGrid,
  EvidenceList,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Bias-audit methodology',
  description:
    'QOrium publishes its adverse-impact methodology and commits to an independent Indian bias audit. Status: methodology published; independent audit scheduled.',
  alternates: { canonical: '/trust/bias-audit' },
};

export default function BiasAuditPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Trust', path: '/trust' },
          { name: 'Bias audit', path: '/trust/bias-audit' },
        ]}
      />
      <WebPageJsonLd
        name="QOrium Bias-Audit Methodology"
        description="Adverse-impact methodology; independent audit scheduled (not yet conducted)."
        url={`${siteConfig.url}/trust/bias-audit`}
        type="WebPage"
      />
      <main>
        <PageHero
          eyebrow="Trust / Bias audit"
          title="Our bias-audit methodology — published before the audit, not after."
          description="Status: methodology published; independent audit scheduled. QOrium does not claim a passed or independent bias audit. Review what we test, how, and what is honestly still pending."
          cta={{ label: 'Talk to us about fairness', href: '/contact' }}
        />

        <SectionBand
          title="Status (honest)"
          description="We separate what is committed from what is complete."
        >
          <CardGrid columns="md:grid-cols-3">
            <SurfaceCard title="Methodology">
              Published below — what we measure and how.
            </SurfaceCard>
            <SurfaceCard title="Independent audit">
              Scheduled. An independent Indian auditor (e.g. NASSCOM-affiliated / academic
              psychometrician) is to be engaged. Not yet conducted.
            </SurfaceCard>
            <SurfaceCard title="What we never say">
              We do not say &ldquo;passed&rdquo; or &ldquo;independently audited&rdquo; until a real
              third-party letter exists.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>

        <SectionBand
          title="Adverse-impact methodology"
          description="What QOrium commits to test, where data lawfully allows."
        >
          <CardGrid columns="md:grid-cols-2">
            <SurfaceCard title="Four-Fifths (80%) rule">
              Selection/pass-rate ratios across protected groups (where lawfully collectable) are
              checked against the 80% threshold.
            </SurfaceCard>
            <SurfaceCard title="Score-distribution parity">
              Mean and standard deviation of scores by group; we flag standardized mean differences
              greater than 0.2.
            </SurfaceCard>
            <SurfaceCard title="Item-level DIF">
              Differential Item Functioning analysis once per-item response data exists — flags
              items that behave differently for equally-able candidates across groups.
            </SurfaceCard>
            <SurfaceCard title="Reasoning-trace review">
              Because every grade carries a reasoning trace, bias reviewers can inspect why a score
              was given, not just the number.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>

        <SectionBand
          title="The honest constraint"
          description="Real fairness statistics need real data."
        >
          <SurfaceCard title="Why the audit is scheduled, not done">
            <EvidenceList
              items={[
                'Adverse-impact statistics require real candidate response data and voluntary, lawful demographic data — the same dependency as empirical IRT calibration.',
                'Until that data exists, QOrium publishes methodology and commits to an independent Indian auditor.',
                'An internal self-assessment is labelled as such — it is never presented as an independent or third-party audit.',
              ]}
            />
          </SurfaceCard>
        </SectionBand>

        <p className="mx-auto max-w-3xl px-6 pb-16 text-center text-xs text-muted-foreground">
          Draft fairness copy — pending counsel / NYAYA review. Statuses stay
          &ldquo;scheduled&rdquo;/&ldquo;in progress&rdquo; until real auditor letters exist.
        </p>
      </main>
    </>
  );
}

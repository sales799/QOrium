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
  title: 'Security & data residency',
  description:
    'QOrium candidate data is stored in India (Mumbai region). Verified data residency, data-flow, and the controls behind defensible assessment scoring.',
  alternates: { canonical: '/trust/security' },
};

export default function TrustSecurityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Trust', path: '/trust' },
          { name: 'Security', path: '/trust/security' },
        ]}
      />
      <WebPageJsonLd
        name="QOrium Security & Data Residency"
        description="Verified India data residency (Mumbai), data-flow, and security controls."
        url={`${siteConfig.url}/trust/security`}
        type="WebPage"
      />
      <main>
        <PageHero
          eyebrow="Trust / Security"
          title="Candidate data is stored in India (Mumbai region)."
          description="QOrium is India-resident and DPDP-native. Below is the verified residency position, the data-flow, and where to find the full security control ledger."
          cta={{ label: 'See the full control ledger', href: '/security' }}
        />

        <SectionBand
          title="India data residency — verified"
          description="Candidate data-at-rest is physically in India. This is a verified technical fact, not a marketing claim."
        >
          <CardGrid columns="md:grid-cols-2">
            <SurfaceCard title="Where candidate data lives">
              <EvidenceList
                items={[
                  'Primary database: PostgreSQL (candidate PII, responses, assessments).',
                  'Hosting: Hostinger KVM, Mumbai, Maharashtra, IN (AS47583).',
                  'Data directory: /var/lib/postgresql/16/main.',
                  'No candidate media/object storage outside India exists today.',
                ]}
              />
            </SurfaceCard>
            <SurfaceCard title="Residency commitments">
              <EvidenceList
                items={[
                  'Backups remain India-region.',
                  'When candidate video ships, object storage will use an India region (e.g. Mumbai).',
                  'Sub-processor regions are disclosed on /trust/sub-processors.',
                ]}
              />
            </SurfaceCard>
          </CardGrid>
        </SectionBand>

        <SectionBand
          title="Data-flow"
          description="A candidate assessment moves through India-resident processing end to end."
        >
          <CardGrid columns="md:grid-cols-3">
            <SurfaceCard title="1 · Capture">
              Candidate consent is captured at assessment start; only assessment-relevant data is
              collected.
            </SurfaceCard>
            <SurfaceCard title="2 · Process & store">
              Responses are graded and stored in the India-resident Postgres database (Mumbai).
              Every score carries a reasoning trace.
            </SurfaceCard>
            <SurfaceCard title="3 · Access & rights">
              Access, correction, and erasure requests route through the grievance officer; actions
              are recorded in the audit log.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>

        <SectionBand title="Honest labels" description="QOrium states only what it can support.">
          <CardGrid columns="md:grid-cols-2">
            <SurfaceCard title="Certifications">
              ISO 27001 and SOC 2 controls are implemented/aligned where noted — never described as
              certified until an accredited body issues a certificate. See the full ledger on{' '}
              <span className="text-foreground">/security</span>.
            </SurfaceCard>
            <SurfaceCard title="Scoring">
              Item statistics are model-estimated · calibrating with live use — not empirically
              calibrated, and not certified.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}

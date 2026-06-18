import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Sub-processors',
  description:
    'QOrium sub-processor list: the third parties that process data on our behalf, their purpose, and region posture. India-resident candidate data by default.',
  alternates: { canonical: '/trust/sub-processors' },
};

type SubProcessor = {
  name: string;
  purpose: string;
  region: string;
};

// DRAFT — pending counsel review. Region reflects current configuration.
const subProcessors: SubProcessor[] = [
  {
    name: 'Hostinger International',
    purpose: 'Primary application + database hosting (candidate data-at-rest).',
    region: 'India — Mumbai (AS47583)',
  },
  {
    name: 'Cloudflare',
    purpose: 'CDN, DNS, and edge caching for the public marketing site.',
    region: 'Global edge (no candidate data store)',
  },
  {
    name: 'Resend',
    purpose: 'Transactional email delivery (demo, support, lead capture).',
    region: 'US — business contact data only',
  },
  {
    name: 'Plausible Analytics',
    purpose: 'Privacy-friendly, cookieless website analytics (no personal data).',
    region: 'EU',
  },
  {
    name: 'Sentry',
    purpose: 'Application error monitoring for the marketing site.',
    region: 'US — diagnostic data only',
  },
  {
    name: 'Calendly',
    purpose: 'Demo scheduling, when a visitor books a call.',
    region: 'US — business contact data only',
  },
];

export default function SubProcessorsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Trust', path: '/trust' },
          { name: 'Sub-processors', path: '/trust/sub-processors' },
        ]}
      />
      <WebPageJsonLd
        name="QOrium Sub-processors"
        description="Third-party processors, their purpose, and region posture."
        url={`${siteConfig.url}/trust/sub-processors`}
        type="WebPage"
      />
      <>
        <PageHero
          eyebrow="Trust / Sub-processors"
          title="The third parties that process data on our behalf."
          description="Candidate assessment data is India-resident (Mumbai). The processors below support hosting, delivery, and analytics; those that touch any personal data handle business-contact data only, not candidate assessment payloads."
          cta={{ label: 'DPDP compliance', href: '/compliance-dpdp' }}
        />

        <SectionBand
          title="Current sub-processors"
          description="Purpose-limited, with region posture shown."
        >
          <CardGrid columns="md:grid-cols-2">
            {subProcessors.map((sp) => (
              <SurfaceCard key={sp.name} title={sp.name}>
                <p>{sp.purpose}</p>
                <p className="mt-3 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Region: {sp.region}
                </p>
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>

        <p className="mx-auto max-w-3xl px-6 pb-16 text-center text-xs text-muted-foreground">
          Draft sub-processor disclosure — pending counsel review. Grievance officer: Bhaskar Anand,
          bhaskar@talpro.in. We update this list before onboarding a new processor that touches
          personal data.
        </p>
      </>
    </>
  );
}

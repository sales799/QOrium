import type { Metadata } from 'next';

import {
  CardGrid,
  EvidenceList,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { phase4Faqs } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'QOrium pricing starts with a free Customer-Zero tier. Paid tier numbers are founder-locked and currently Talk to sales.',
  alternates: { canonical: '/pricing' },
};

const tiers = [
  [
    'Customer-Zero',
    'Free forever',
    'Solo founders and talent ops teams experimenting with skills-first screening.',
    '10 assessments per month|1 user seat|QOrium branding|No API access',
  ],
  [
    'Growth',
    'Talk to sales',
    'SMB hiring teams that need repeatable shortlists.',
    '500 assessments per month target|5 seats target|JD-Forge v1 when released|Email support',
  ],
  [
    'Scale',
    'Talk to sales',
    'Mid-market teams with larger hiring operations.',
    '5,000 assessments per month target|20 seats target|IRT report exports when released|Priority support',
  ],
  [
    'Enterprise',
    'Custom',
    'High-volume and regulated teams.',
    'Custom limits|SLA and onboarding|SSO/API roadmap|Audit logs roadmap',
  ],
] as const;

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ]}
      />
      <ProductJsonLd
        name="QOrium Pricing"
        description="Free Customer-Zero tier and sales-led paid tiers for skills assessment hiring teams."
        url={`${siteConfig.url}/pricing`}
      />
      <FAQPageJsonLd questions={phase4Faqs} />
      <main>
        <PageHero
          eyebrow="Pricing"
          title="Start free. Move to paid tiers when your assessment volume is real."
          description="Paid tier numbers are not public until founder approval. Until then, QOrium keeps the free Customer-Zero tier clear and routes Growth, Scale, and Enterprise to sales."
          cta={{ label: 'Book pricing call', href: '/demo' }}
        />
        <SectionBand title="Plans">
          <CardGrid columns="md:grid-cols-4">
            {tiers.map(([name, price, fit, features]) => (
              <SurfaceCard
                key={name}
                title={name}
                href={name === 'Customer-Zero' ? '/demo' : '/contact'}
              >
                <p className="text-xl font-semibold text-foreground">{price}</p>
                <p className="mt-2">{fit}</p>
                <div className="mt-4">
                  <EvidenceList items={features.split('|')} />
                </div>
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}

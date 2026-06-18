import type { Metadata } from 'next';

import {
  CardGrid,
  EvidenceList,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import {
  BreadcrumbJsonLd,
  FAQPageJsonLd,
  OfferCatalogJsonLd,
  ProductJsonLd,
} from '@/components/seo/JsonLd';
import { phase4Faqs } from '@/content/phase4';
import { siteConfig } from '@/content/site.config';
import { analyticsEvents } from '@/lib/analytics';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'QOrium pricing: Customer-Zero free forever, Growth ₹4,999/mo, Scale ₹19,999/mo, Enterprise custom. Transparent INR pricing for India-first skills assessment.',
  alternates: { canonical: '/pricing' },
};

const tiers = [
  [
    'Customer-Zero',
    'Free forever',
    'Solo founders and talent ops teams experimenting with skills-first screening.',
    '10 assessments per month|1 user seat|QOrium branding|No JD-Forge / API',
  ],
  [
    'Growth',
    '₹4,999/mo',
    'SMB hiring teams that need repeatable shortlists.',
    '500 assessments per month|5 seats|JD-Forge v1|Email support',
  ],
  [
    'Scale',
    '₹19,999/mo',
    'Mid-market teams with larger hiring operations.',
    '5,000 assessments per month|20 seats|JD-Forge + IRT report exports|ATS · SSO · priority support',
  ],
  [
    'Enterprise',
    'Custom',
    'High-volume and regulated teams.',
    'Unlimited assessments|SLA + onboarding|Residency · audit logs · API|SSO + dedicated support',
  ],
] as const;

// Product + Offer JSON-LD source (PHASE_B pack, RATIFIED 2026-06-03).
const pricingOffers = [
  {
    name: 'Customer-Zero',
    description: 'Free forever — 10 assessments/mo, 1 seat.',
    price: '0',
    priceCurrency: 'INR',
  },
  {
    name: 'Growth',
    description: '500 assessments/mo, 5 seats, JD-Forge v1.',
    price: '4999',
    priceCurrency: 'INR',
  },
  {
    name: 'Scale',
    description: '5,000 assessments/mo, 20 seats, IRT exports, ATS, SSO.',
    price: '19999',
    priceCurrency: 'INR',
  },
  {
    name: 'Enterprise',
    description: 'Custom limits, SLA, residency, audit logs, API.',
    priceCurrency: 'INR',
  },
];

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
        description="Transparent INR pricing: Customer-Zero free, Growth ₹4,999/mo, Scale ₹19,999/mo, Enterprise custom."
        url={`${siteConfig.url}/pricing`}
      />
      <OfferCatalogJsonLd url={`${siteConfig.url}/pricing`} offers={pricingOffers} />
      <FAQPageJsonLd questions={phase4Faqs} />
      <main>
        <PageHero
          eyebrow="Pricing"
          title="Transparent INR pricing. Start free, scale when your volume is real."
          description="Customer-Zero is free forever. Growth is ₹4,999/mo and Scale is ₹19,999/mo, billed in INR. Enterprise is custom for high-volume and regulated teams. No hidden quote-only gate."
          cta={{
            label: 'Book pricing call',
            href: '/demo',
            event: analyticsEvents.pricingCtaClick,
            eventProps: { surface: 'pricing_hero' },
          }}
        />
        <SectionBand title="Plans">
          <CardGrid columns="md:grid-cols-4">
            {tiers.map(([name, price, fit, features]) => (
              <SurfaceCard
                key={name}
                title={name}
                href={name === 'Enterprise' ? '/contact' : '/demo'}
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

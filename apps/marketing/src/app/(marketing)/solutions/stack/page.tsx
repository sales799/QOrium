import type { Metadata } from 'next';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd';
import { stackPages } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Stack Solutions',
  description:
    'India-enterprise stack assessment pages for SAP, Oracle, BFSI, embedded, and legacy systems.',
  alternates: { canonical: '/solutions/stack' },
};

export default function StackHubPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Stack Solutions', path: '/solutions/stack' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="QOrium Stack Solutions"
        description="India-stack skill modules for enterprise hiring."
        url={`${siteConfig.url}/solutions/stack`}
      />
      <main>
        <PageHero
          eyebrow="India-stack solutions"
          title="Enterprise stacks generic libraries miss"
          description={`${stackPages.length} stack pages link roles, skill modules, and India-relevant enterprise context.`}
          cta={{ label: 'Scope Stack-Vault', href: '/platform/stack-vault' }}
        />
        <SectionBand title="Stack pages">
          <CardGrid>
            {stackPages.map((stack) => (
              <SurfaceCard key={stack.slug} title={stack.name} href={stack.path}>
                {stack.indiaCallout}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
      </main>
    </>
  );
}

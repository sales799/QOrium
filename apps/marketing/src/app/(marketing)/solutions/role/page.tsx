import type { Metadata } from 'next';

import {
  CardGrid,
  EnterpriseJourneyBand,
  PageHero,
  SectionBand,
  SurfaceCard,
} from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd';
import { rolePages } from '@/content/seo-graph';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Role Solutions',
  description: 'Role-specific QOrium assessment batteries mapped to skills, stacks, and seniority.',
  alternates: { canonical: '/solutions/role' },
};

export default function RoleHubPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Role Solutions', path: '/solutions/role' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="QOrium Role Solutions"
        description="Role-specific assessment batteries for evidence-first hiring."
        url={`${siteConfig.url}/solutions/role`}
      />
      <main>
        <PageHero
          eyebrow="Role solutions"
          title="Assessment batteries by hiring role"
          description={`${rolePages.length} role pages connect core skills, recommended skills, stack context, and ReadyBank calls-to-action.`}
          cta={{ label: 'Open ReadyBank', href: '/platform/readybank' }}
        />
        <SectionBand title="Role pages">
          <CardGrid>
            {rolePages.map((role) => (
              <SurfaceCard key={role.slug} title={role.name} href={role.path}>
                {role.description}
              </SurfaceCard>
            ))}
          </CardGrid>
        </SectionBand>
        <EnterpriseJourneyBand
          title="Role pages convert hiring intent into assessment evidence."
          description="The role hub now explains how QOrium moves from job family to core skills, stack context, calibration labels, and a proof run that can be defended by the hiring team."
          proofPoints={[
            `${rolePages.length} role pages connect skills, seniority, and stack context.`,
            'Each role page routes to library evidence instead of stopping at a generic persona.',
            'Enterprise buyers can move from role discovery to ReadyBank or demo with context intact.',
          ]}
        />
      </main>
    </>
  );
}

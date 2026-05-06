import type { Metadata } from 'next';
import { SolutionPageLayout } from '@/components/site/SolutionPageLayout';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { staffingCopy } from '@/content/copy/solutions';

export const metadata: Metadata = {
  title: 'For staffing firms',
  description: staffingCopy.hero.sub,
};

export default function StaffingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/staffing' },
          { name: 'Staffing firms', path: '/solutions/staffing' },
        ]}
      />
      <SolutionPageLayout copy={staffingCopy} />
    </>
  );
}

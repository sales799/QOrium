import type { Metadata } from 'next';
import { SolutionPageLayout } from '@/components/site/SolutionPageLayout';
import { enterprisesCopy } from '@/content/copy/solutions';

export const metadata: Metadata = {
  title: 'For enterprises & GCCs',
  description: enterprisesCopy.hero.sub,
};

export default function EnterprisesPage() {
  return <SolutionPageLayout copy={enterprisesCopy} />;
}

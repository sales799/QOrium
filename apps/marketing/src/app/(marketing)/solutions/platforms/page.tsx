import type { Metadata } from 'next';
import { SolutionPageLayout } from '@/components/site/SolutionPageLayout';
import { platformsCopy } from '@/content/copy/solutions';

export const metadata: Metadata = {
  title: 'For assessment platforms',
  description: platformsCopy.hero.sub,
};

export default function PlatformsPage() {
  return <SolutionPageLayout copy={platformsCopy} />;
}

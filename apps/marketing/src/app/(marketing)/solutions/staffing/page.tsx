import type { Metadata } from 'next';
import { SolutionPageLayout } from '@/components/site/SolutionPageLayout';
import { staffingCopy } from '@/content/copy/solutions';

export const metadata: Metadata = {
  title: 'For staffing firms',
  description: staffingCopy.hero.sub,
};

export default function StaffingPage() {
  return <SolutionPageLayout copy={staffingCopy} />;
}

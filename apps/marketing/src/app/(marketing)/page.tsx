import type { Metadata } from 'next';

import { HomeV2Page } from '@/components/marketing/PhaseTwoPages';
import { FAQPageJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd';
import { phase4Faqs } from '@/content/phase4';

export const metadata: Metadata = {
  title: {
    absolute: 'QOrium - Skills assessments you can defend in an audit.',
  },
  description:
    'QOrium is an India-built assessment content platform with ReadyBank, JD-Forge, Stack-Vault, anti-leak positioning, and evidence-gated trust surfaces.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <WebsiteJsonLd />
      <FAQPageJsonLd questions={phase4Faqs} />
      <HomeV2Page />
    </>
  );
}

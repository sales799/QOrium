import type { Metadata } from 'next';

import { PlatformProductPage } from '@/components/marketing/PhaseTwoPages';
import { BreadcrumbJsonLd, FAQPageJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { readybankProduct } from '@/content/copy/phase2';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'ReadyBank - A library that does not leak',
  description: readybankProduct.description,
  alternates: { canonical: readybankProduct.route },
};

export default function ReadyBankPlatformPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Platform', path: '/platform' },
          { name: 'ReadyBank', path: readybankProduct.route },
        ]}
      />
      <ProductJsonLd
        name={readybankProduct.name}
        description={readybankProduct.description}
        url={`${siteConfig.url}${readybankProduct.route}`}
      />
      <FAQPageJsonLd questions={[...readybankProduct.faq]} />
      <PlatformProductPage product={readybankProduct} />
    </>
  );
}

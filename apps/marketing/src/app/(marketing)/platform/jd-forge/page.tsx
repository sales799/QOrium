import type { Metadata } from 'next';

import { PlatformProductPage } from '@/components/marketing/PhaseTwoPages';
import { BreadcrumbJsonLd, FAQPageJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { jdForgeProduct } from '@/content/copy/phase2';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'JD-Forge - From JD to assessment',
  description: jdForgeProduct.description,
  alternates: { canonical: jdForgeProduct.route },
};

export default function JdForgePlatformPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Platform', path: '/platform' },
          { name: 'JD-Forge', path: jdForgeProduct.route },
        ]}
      />
      <ProductJsonLd
        name={jdForgeProduct.name}
        description={jdForgeProduct.description}
        url={`${siteConfig.url}${jdForgeProduct.route}`}
      />
      <FAQPageJsonLd questions={[...jdForgeProduct.faq]} />
      <PlatformProductPage product={jdForgeProduct} />
    </>
  );
}

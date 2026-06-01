import type { Metadata } from 'next';

import { PlatformProductPage } from '@/components/marketing/PhaseTwoPages';
import { BreadcrumbJsonLd, FAQPageJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { stackVaultProduct } from '@/content/copy/phase2';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Stack-Vault - Your private assessment vault',
  description: stackVaultProduct.description,
  alternates: { canonical: stackVaultProduct.route },
};

export default function StackVaultPlatformPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Platform', path: '/platform' },
          { name: 'Stack-Vault', path: stackVaultProduct.route },
        ]}
      />
      <ProductJsonLd
        name={stackVaultProduct.name}
        description={stackVaultProduct.description}
        url={`${siteConfig.url}${stackVaultProduct.route}`}
      />
      <FAQPageJsonLd questions={[...stackVaultProduct.faq]} />
      <PlatformProductPage product={stackVaultProduct} />
    </>
  );
}

import type { Metadata } from 'next';

import { JdForgeDemo } from '@/components/interactive-proof/JdForgeDemo';
import { PlatformProductPage } from '@/components/marketing/PhaseTwoPages';
import { MaxWidth } from '@/components/site/MaxWidth';
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
      <section className="surface-product border-t border-border py-16 md:py-20">
        <MaxWidth as="div">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase text-secondary">
              Product proof
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-5xl">
              Run the JD-Forge assessment planner.
            </h2>
            <p className="mt-4 text-muted-foreground">
              The public wrapper exposes the real role-graph mapping behavior with honest
              low-confidence output when the JD is weak.
            </p>
          </div>
          <JdForgeDemo />
        </MaxWidth>
      </section>
    </>
  );
}

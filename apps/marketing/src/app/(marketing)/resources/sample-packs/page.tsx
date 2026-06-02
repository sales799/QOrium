import type { Metadata } from 'next';

import { SamplePackHub } from '@/components/interactive-proof/SamplePacks';
import { ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { MaxWidth } from '@/components/site/MaxWidth';
import { listSamplePacks } from '@/content/interactive-proof';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Sample Packs',
  description:
    'Download real QOrium sample assessment packs for India-stack and senior technical roles.',
  alternates: { canonical: '/resources/sample-packs' },
};

export default function SamplePacksPage() {
  const packs = listSamplePacks();

  return (
    <>
      <WebPageJsonLd
        name="Sample Packs"
        description={metadata.description ?? ''}
        url={`${siteConfig.url}/resources/sample-packs`}
        type="CollectionPage"
      />
      <ItemListJsonLd
        name="QOrium sample assessment packs"
        url={`${siteConfig.url}/resources/sample-packs`}
        items={packs.map((pack) => ({
          name: pack.title,
          url: `${siteConfig.url}/resources/sample-packs/${pack.slug}`,
          description: pack.summary,
        }))}
      />
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <p className="font-mono text-xs font-semibold uppercase text-signal-300">Sample packs</p>
          <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
            Real question-pack depth, shown before the sales call.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
            Browse 13 authored packs. Each pack opens with a preview and offers the deeper pack
            after email capture.
          </p>
        </MaxWidth>
      </section>
      <section className="surface-product py-16 md:py-20">
        <MaxWidth as="div">
          <SamplePackHub />
        </MaxWidth>
      </section>
    </>
  );
}

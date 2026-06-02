import type { Metadata } from 'next';

import { GradedAnswerViewer } from '@/components/interactive-proof/GradedAnswerViewer';
import { TrustDetailPage, getTrustPageMeta } from '@/components/marketing/TrustShellPages';
import { WebPageJsonLd } from '@/components/seo/JsonLd';
import { MaxWidth } from '@/components/site/MaxWidth';
import { siteConfig } from '@/content/site.config';
import { trustPages } from '@/content/trust';

const page = trustPages.method;

export const metadata: Metadata = getTrustPageMeta(page);

export default function MethodPage() {
  return (
    <>
      <WebPageJsonLd
        name={page.title}
        description={page.description}
        url={`${siteConfig.url}${page.route}`}
        type={page.jsonLdType}
      />
      <TrustDetailPage page={page} />
      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase text-secondary">Grader proof</p>
            <h2 className="mt-3 text-3xl font-semibold">
              The rubric, score, and reasoning trace stay visible.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              These public exemplars are curated fixtures with audit metadata, not private candidate
              responses.
            </p>
          </div>
          <GradedAnswerViewer embedded />
        </MaxWidth>
      </section>
    </>
  );
}

import type { Metadata } from 'next';

import { JdForgeDemo } from '@/components/interactive-proof/JdForgeDemo';
import { MaxWidth } from '@/components/site/MaxWidth';

export const metadata: Metadata = {
  title: 'Try JD-Forge',
  description: 'Paste a job description and see QOrium map it into a defensible assessment plan.',
  alternates: { canonical: '/try/jd-forge' },
};

export default function TryJdForgePage() {
  return (
    <>
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <p className="font-mono text-xs font-semibold uppercase text-signal-300">Try JD-Forge</p>
          <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
            Paste a JD. Watch the assessment plan take shape.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
            This public proof surface uses QOrium's seeded role graph and shows the honest
            low-confidence state when a job description does not map cleanly.
          </p>
        </MaxWidth>
      </section>
      <section className="surface-product py-16 md:py-20">
        <MaxWidth as="div">
          <JdForgeDemo />
        </MaxWidth>
      </section>
    </>
  );
}

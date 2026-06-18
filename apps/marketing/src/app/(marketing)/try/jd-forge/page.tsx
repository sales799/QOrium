import type { Metadata } from 'next';

import { JdForgeDemo } from '@/components/interactive-proof/JdForgeDemo';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { MaxWidth } from '@/components/site/MaxWidth';

export const metadata: Metadata = {
  title: 'Try JD-Forge',
  description:
    'Enter a job title or paste a job description and see QOrium map it into a defensible assessment plan.',
  alternates: { canonical: '/try/jd-forge' },
};

export default function TryJdForgePage() {
  return (
    <>
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <FadeIn>
            <p className="font-mono text-xs font-semibold uppercase text-signal-300">
              Try JD-Forge
            </p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
              Enter a role. Watch the assessment plan take shape.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
              This public proof surface researches a job title into a JD draft, maps pasted JDs into
              QOrium's role graph, and shows the honest low-confidence state when text does not map
              cleanly.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>
      <section className="surface-product py-16 md:py-20">
        <MaxWidth as="div">
          <Reveal>
            <JdForgeDemo />
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}

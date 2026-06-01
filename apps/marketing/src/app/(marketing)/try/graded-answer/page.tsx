import type { Metadata } from 'next';

import { GradedAnswerViewer } from '@/components/interactive-proof/GradedAnswerViewer';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { MaxWidth } from '@/components/site/MaxWidth';

export const metadata: Metadata = {
  title: 'Try Graded Answer Viewer',
  description:
    'Inspect a real QOrium grader exemplar with rubric, score breakdown, and audit metadata.',
  alternates: { canonical: '/try/graded-answer' },
};

export default function TryGradedAnswerPage() {
  return (
    <main>
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <FadeIn>
            <p className="font-mono text-xs font-semibold uppercase text-signal-300">
              Graded-answer viewer
            </p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
              See the rubric, the score, and the reasoning trace.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
              Curated public exemplars prove the grader is auditable without exposing private
              candidate responses.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>
      <section className="bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <Reveal>
            <GradedAnswerViewer />
          </Reveal>
        </MaxWidth>
      </section>
    </main>
  );
}

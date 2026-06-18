import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardCheck,
  FileSearch,
  Fingerprint,
  Route,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { MaxWidth } from '@/components/site/MaxWidth';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Try QOrium - Interactive proof hub',
  description:
    'Try QOrium proof surfaces for JD-to-assessment planning and auditable AI grading. Inspect how hiring inputs become skills, rubrics, scores, and replay-safe evidence.',
  alternates: { canonical: '/try' },
};

const heroStats = [
  { value: '2', label: 'live buyer demos' },
  { value: '0', label: 'private records required' },
  { value: '1', label: 'audit trail per output' },
] as const;

type DemoCard = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  proofPoints: readonly string[];
};

const demoCards = [
  {
    title: 'JD-Forge',
    eyebrow: 'JD to plan',
    description:
      'Paste a job description or enter a role title and watch QOrium convert hiring intent into a defensible assessment plan.',
    href: '/try/jd-forge',
    cta: 'Try JD-Forge',
    icon: Sparkles,
    proofPoints: [
      'Researches new job titles into a usable JD draft',
      'Maps pasted JDs into skills, weights, and item mix',
      'Flags low-confidence inputs instead of inventing certainty',
      'Prepares an email-gated PDF plan for follow-up',
    ],
  },
  {
    title: 'Graded Answer Viewer',
    eyebrow: 'Answer to evidence',
    description:
      'Open a public grading packet and inspect how a candidate answer becomes scores, reasoning, feedback, and replay-safe audit metadata.',
    href: '/try/graded-answer',
    cta: 'Inspect graded answer',
    icon: ClipboardCheck,
    proofPoints: [
      'Shows the answer, rubric, criterion scores, and reasoning trace',
      'Uses synthetic public exemplars, not private candidate data',
      'Displays privacy-safe fingerprints for buyer review',
      'Records feedback on whether the grade feels defensible',
    ],
  },
] satisfies readonly DemoCard[];

const proofFlow = [
  {
    title: 'Start from buyer input',
    body: 'Use a role title, pasted JD, or sample answer rather than a polished sales slide.',
    icon: FileSearch,
  },
  {
    title: 'Expose the reasoning layer',
    body: 'QOrium shows the skills, rubrics, weights, scores, and confidence notes that shaped the result.',
    icon: Route,
  },
  {
    title: 'Leave replayable evidence',
    body: 'Each demo ends with a plan or grade packet that can be reviewed before a customer shares real hiring data.',
    icon: Fingerprint,
  },
] as const;

const trustNotes = [
  'Public demos use safe examples',
  'No candidate PII required',
  'Outputs are built for SME review',
] as const;

export default function TryIndexPage() {
  return (
    <>
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div" className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <FadeIn>
            <p className="font-mono text-xs font-semibold uppercase text-signal-300">
              Interactive proof hub
            </p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
              Try QOrium proof surfaces before a sales call.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
              Paste a JD, inspect an AI grade, and see how QOrium turns hiring inputs into auditable
              assessment evidence. These public demos show the mechanism without asking you to
              expose private candidate or customer data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/try/jd-forge">
                  Build an assessment plan
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/try/graded-answer">Audit a graded answer</Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center border border-white/10 bg-black/20 text-signal-300">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                    What a buyer can validate
                  </p>
                  <p className="mt-3 text-sm leading-6 text-shell-muted">
                    QOrium is not asking the market to trust a black box. The demo hub lets buyers
                    check plan generation, skill extraction, grading trace, metadata posture, and
                    human-review boundaries in one place.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="border border-white/10 bg-black/20 p-4">
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm leading-5 text-shell-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="surface-product border-b border-border py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Choose a proof surface
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                  Two hands-on paths for the buying team.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">
                Start with the input your team already has. QOrium should explain what it extracted,
                where confidence is strong, and where a human reviewer should stay in the loop.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {demoCards.map((demo) => {
                const Icon = demo.icon;
                return (
                  <article key={demo.title} className="border border-border bg-card p-6">
                    <div className="flex items-start gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center border border-product-500/25 bg-product-100 text-product-500">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-mono text-xs font-semibold uppercase text-secondary">
                          {demo.eyebrow}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">{demo.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {demo.description}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-6 grid gap-3 text-sm leading-6 text-muted-foreground">
                      {demo.proofPoints.map((point) => (
                        <li key={point} className="flex gap-3">
                          <ShieldCheck className="mt-1 size-4 shrink-0 text-secondary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="mt-7 w-full sm:w-auto">
                      <Link href={demo.href}>
                        {demo.cta}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="bg-background py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Buyer audit path
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                  What the page is meant to prove.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  The try hub is the bridge between marketing claims and usable evidence. It should
                  help a hiring leader, TA operator, or technical SME decide whether QOrium is worth
                  testing on their own role.
                </p>
              </div>

              <div className="grid gap-3">
                {proofFlow.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-[4rem_1fr]"
                    >
                      <div className="flex items-center gap-3 sm:block">
                        <span className="flex size-11 items-center justify-center border border-border bg-background font-mono text-xs text-secondary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <Icon className="size-5 text-secondary sm:mt-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-shell border-t border-white/10 py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                  Ready for a real role
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
                  Bring your own JD to the demo conversation.
                </h2>
                <div className="mt-5 grid gap-2 text-sm text-shell-muted sm:grid-cols-3">
                  {trustNotes.map((note) => (
                    <div key={note} className="flex items-center gap-2">
                      <ShieldCheck className="size-4 shrink-0 text-signal-300" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Button asChild size="lg">
                  <Link href="/demo">Book a demo</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/resources/docs">View API docs</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}

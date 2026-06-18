import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileSearch,
  Fingerprint,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { FlickeringGrid } from '@/components/magicui/FlickeringGrid';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd';
import { MaxWidth } from '@/components/site/MaxWidth';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/content/site.config';

const pageDescription =
  'Try QOrium as a public proof lab for JD-to-assessment planning, AI grading audit trails, skill extraction, confidence notes, and privacy-safe buyer evidence.';

export const metadata: Metadata = {
  title: 'Try QOrium - Public proof lab',
  description: pageDescription,
  alternates: { canonical: '/try' },
};

const heroStats = [
  { value: '2', label: 'live proof labs' },
  { value: '4', label: 'evidence layers' },
  { value: '0', label: 'private records required' },
] as const;

const demoRun = [
  {
    label: 'Input',
    title: 'Role title, pasted JD, or sample answer',
    body: 'Start with messy buyer material instead of a polished sales script.',
    icon: FileSearch,
  },
  {
    label: 'Plan',
    title: 'Skills, weights, item mix, confidence',
    body: 'JD-Forge shows what it understood and where SME review should stay active.',
    icon: Sparkles,
  },
  {
    label: 'Grade',
    title: 'Rubric, scores, reasoning, replay metadata',
    body: 'The grading viewer makes the answer audit visible before production data is involved.',
    icon: Scale,
  },
  {
    label: 'Handoff',
    title: 'Demo-ready plan for your real role',
    body: 'Bring the output into a buyer call, PDF handoff, or API discussion.',
    icon: Fingerprint,
  },
] as const;

type DemoCard = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  output: string;
  proofPoints: readonly string[];
};

const demoCards = [
  {
    title: 'JD-Forge',
    eyebrow: 'Role input to assessment plan',
    description:
      'Enter a job title or paste a custom JD. QOrium researches the role shape, extracts skills, weights coverage, and publishes a plan buyers can inspect.',
    href: '/try/jd-forge',
    cta: 'Open JD-Forge lab',
    icon: Sparkles,
    output: 'Assessment plan with skills, item mix, confidence, and PDF handoff.',
    proofPoints: [
      'Handles defined samples and custom job descriptions',
      'Maps role evidence into skill clusters and weights',
      'Marks weak inputs instead of pretending certainty',
      'Keeps buyer follow-up tied to a plan ID and input hash',
    ],
  },
  {
    title: 'Graded Answer Viewer',
    eyebrow: 'Answer output to audit trail',
    description:
      'Inspect a synthetic graded answer with rubric criteria, score reasoning, feedback capture, and safe metadata buyers can share with internal reviewers.',
    href: '/try/graded-answer',
    cta: 'Open grading lab',
    icon: ClipboardCheck,
    output: 'Review packet with answer, rubric, score trace, and privacy-safe fingerprints.',
    proofPoints: [
      'Shows the visible answer and rubric side by side',
      'Breaks the grade into criterion-level evidence',
      'Uses public examples, not candidate or customer records',
      'Lets reviewers respond when a grade feels wrong',
    ],
  },
] satisfies readonly DemoCard[];

const proofMatrix = [
  {
    title: 'For hiring leaders',
    body: 'Can QOrium turn a real role into a useful assessment plan without asking for private data first?',
    icon: Route,
  },
  {
    title: 'For technical SMEs',
    body: 'Are the extracted skills, weights, and rubrics specific enough to review before candidates see the test?',
    icon: BadgeCheck,
  },
  {
    title: 'For compliance teams',
    body: 'Does the output leave a replayable trail with clear privacy boundaries and no hidden candidate record exposure?',
    icon: ShieldCheck,
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
      <WebPageJsonLd
        name="Try QOrium public proof lab"
        description={pageDescription}
        url={`${siteConfig.url}/try`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Try QOrium', path: '/try' },
        ]}
      />
      <ItemListJsonLd
        name="QOrium public proof demos"
        url={`${siteConfig.url}/try`}
        items={demoCards.map((demo) => ({
          name: demo.title,
          description: demo.description,
          url: `${siteConfig.url}${demo.href}`,
        }))}
      />

      <section className="surface-shell evidence-ledger relative isolate overflow-hidden border-b border-white/10">
        <FlickeringGrid
          className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_74%)]"
          squareSize={3}
          gridGap={7}
          flickerChance={0.1}
          maxOpacity={0.14}
          color="var(--secondary)"
        />
        <MaxWidth as="div" className="py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <FadeIn>
              <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                Public proof lab
              </p>
              <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
                Try the QOrium proof chain before the buyer call.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
                Start with a role, a pasted JD, or a graded answer. QOrium shows the plan, rubric,
                confidence posture, and audit metadata a buyer needs before trusting an assessment
                engine with real hiring work.
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
              <dl className="mt-10 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-3xl font-semibold text-white">{stat.value}</dt>
                    <dd className="mt-1 text-sm leading-5 text-shell-muted">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/20 text-signal-300">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                      Buyer validation path
                    </p>
                    <p className="mt-3 text-sm leading-6 text-shell-muted">
                      The hub is designed like a proof room: inputs stay visible, model output is
                      inspectable, and every demo ends with a reviewable artifact.
                    </p>
                  </div>
                </div>
                <ol className="mt-6 divide-y divide-white/10">
                  {demoRun.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <li key={step.title} className="grid gap-3 py-4 sm:grid-cols-[3rem_1fr]">
                        <div className="flex items-center gap-3 sm:block">
                          <span className="flex size-9 items-center justify-center rounded-md border border-white/10 bg-black/20 font-mono text-xs text-signal-300">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <Icon className="size-5 text-signal-300 sm:mt-3" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                            {step.label}
                          </p>
                          <h2 className="mt-1 text-base font-semibold text-white">{step.title}</h2>
                          <p className="mt-2 text-sm leading-6 text-shell-muted">{step.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </FadeIn>
          </div>
        </MaxWidth>
      </section>

      <section className="surface-product border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <Reveal>
            <div className="mb-8 grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Choose a proof lab
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                  Two ways to test the promise.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">
                QOrium should work when the input is imperfect. These demos are intentionally
                public, inspectable, and bounded so buyers can see the mechanism before sharing
                sensitive data.
              </p>
            </div>
          </Reveal>

          <Stagger className="grid gap-4 lg:grid-cols-2">
            {demoCards.map((demo) => {
              const Icon = demo.icon;
              return (
                <StaggerItem key={demo.title}>
                  <article className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-secondary/60">
                    <div className="flex items-start gap-4">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-product-500/25 bg-product-100 text-product-500">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold uppercase text-secondary">
                          {demo.eyebrow}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">{demo.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {demo.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 border-y border-border py-4">
                      <p className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                        Output
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                        {demo.output}
                      </p>
                    </div>
                    <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted-foreground">
                      {demo.proofPoints.map((point) => (
                        <li key={point} className="flex gap-3">
                          <ShieldCheck className="mt-1 size-4 shrink-0 text-secondary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="mt-7 w-full sm:w-fit">
                      <Link href={demo.href}>
                        {demo.cta}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  What this page must prove
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                  A demo hub for buyers, SMEs, and compliance review.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  The page is not a toy drawer. It is the short path from public marketing claim to
                  concrete assessment evidence.
                </p>
              </div>

              <Stagger className="grid gap-3 sm:grid-cols-3">
                {proofMatrix.map((item) => {
                  const Icon = item.icon;
                  return (
                    <StaggerItem key={item.title}>
                      <article className="h-full rounded-lg border border-border bg-card p-5">
                        <Icon className="size-5 text-secondary" />
                        <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
                      </article>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-shell py-14 md:py-16">
        <MaxWidth as="div">
          <Reveal>
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                  Ready for a real role
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
                  Bring your own JD into a founder-led walkthrough.
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

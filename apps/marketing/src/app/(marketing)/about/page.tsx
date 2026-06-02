import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';

export const metadata: Metadata = {
  title: 'About',
  description: "QOrium's mission, founder note, and why we're based in India.",
  alternates: { canonical: '/about' },
};

// SOURCE: 04-Blueprint §1 (vision/mission), governance/Investor-Brief §1 (founder voice)
const PARAGRAPHS = [
  'After 15 years running Talpro India staffing, I watched the same thing happen every year. Hiring teams paid HackerRank or Mettl ₹15-25K/year for assessment libraries that leaked in days. By Friday, every Senior Java question was on Reddit. The 95%-on-screen candidate flunked the technical interview. The hiring manager called me, frustrated.',
  "The assessment platforms knew this. They just didn't solve it — their moat was the platform. Content was always somebody else's problem.",
  'QOrium fixes the content layer. Three SKUs — ReadyBank, JD-Forge, Stack-Vault — over one engine. Same library you can buy commodity, generate fresh, or contractually own. AI authors fast; humans validate; the panel calibrates; the engine watches for leaks and rotates.',
  "We are headquartered in India because the world's largest assessment-volume market sits in our backyard, our cost-to-validate is half the global average, and the Talpro Universe network is our distribution and SME pool from Day 1.",
];

// SOURCE: 04-Blueprint §11 (5-Year North Star)
const VISION = {
  short: 'Mission',
  long: 'Make QOrium the obvious, defensible answer to "where does your platform get its content?" for at least 50 assessment platforms, 200 enterprise customers, and 500 staffing firms by FY2029.',
};

// SOURCE: 04-Blueprint §6 (12-month roadmap)
const MILESTONES = [
  {
    date: 'M0 · May 2026',
    label: '530 questions validated',
    detail: 'Wave 1 + Wave 2 across Tech Core + India Stack',
  },
  {
    date: 'M3',
    label: '5,000 questions, 8 logos',
    detail: 'Customer Zero (Talpro) + first 7 platforms / staffing firms',
  },
  {
    date: 'M9',
    label: 'JD-Forge GA, Anti-Leak Engine v1',
    detail: 'Quarterly rotation cadence in production',
  },
  {
    date: 'M12',
    label: '25,000 questions, 66 logos, ₹3.5 Cr ARR',
    detail: 'Y1 trajectory; Stack-Vault first 5 logos',
  },
  {
    date: 'M21',
    label: 'Pre-A close ₹6-8 Cr',
    detail: 'Series A trajectory: 200+ logos, $7M ARR by Y3',
  },
];

// SOURCE: 04-Blueprint §7 (team plan)
const VALUES = [
  {
    title: 'No marketing fluff',
    body: "We've codified the rules in a Constitution and quality bars (zero TS errors, RFC 7807 errors, ≥80% coverage). The product is the proof.",
  },
  {
    title: 'Earn the certifications',
    body: "We don't claim SOC 2 we haven't earned. The /security page shows what's ready and what's roadmap.",
  },
  {
    title: 'India-first, global-ready',
    body: 'India hires 5M technical roles per year. We fluently support Hindi, Tamil, Telugu, etc. — and India-stack content the global incumbents ignore.',
  },
  {
    title: 'Customer Zero is us',
    body: "Talpro India eats the dogfood. If a SKU isn't good enough for our own staffing business, it's not good enough to ship.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-[60%] opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-5">
            <Badge>About</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              The content layer the assessment industry was missing.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              QOrium is a Talpro Universe product line. Pre-revenue, post-Day-0, building toward a
              Pre-A round in M21 (Q3 Y2).
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* FOUNDER NOTE */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div" className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
                Founder note
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">Bhaskar Anand · CEO</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Founder &amp; CEO, Talpro Universe.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <FadeIn className="space-y-5 font-serif text-lg leading-relaxed text-foreground/90">
              {PARAGRAPHS.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </FadeIn>
          </div>
        </MaxWidth>
      </section>

      {/* MISSION */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div" className="text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">
              {VISION.short}
            </p>
            <p className="mx-auto mt-6 max-w-3xl font-serif text-2xl leading-relaxed text-foreground text-balance">
              {VISION.long}
            </p>
          </Reveal>
        </MaxWidth>
      </section>

      {/* MILESTONES */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Trajectory" title="Where we are. Where we're going." />
          </Reveal>
          <Stagger className="mt-10 space-y-3">
            {MILESTONES.map((m) => (
              <StaggerItem key={m.date}>
                <div className="grid gap-2 rounded-lg border border-border bg-surface-1 p-5 md:grid-cols-12 md:items-center">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal-300 md:col-span-3">
                    {m.date}
                  </p>
                  <p className="text-base font-semibold text-foreground md:col-span-3">{m.label}</p>
                  <p className="text-sm text-muted-foreground md:col-span-6">{m.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* VALUES */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Operating principles" title="What we don't compromise on." />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-2">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="rounded-lg border border-border bg-background p-5">
                  <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <MaxWidth as="div" className="text-center">
          <Reveal>
            <h2 className="text-display-2 font-semibold">Ready to talk?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              We respond to every inbound within one business day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="primary" size="lg">
                <Link href="/demo">Book a demo</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Send a message</Link>
              </Button>
            </div>
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}

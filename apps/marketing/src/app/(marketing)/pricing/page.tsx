import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { RoiCalculator } from '@/components/site/RoiCalculator';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { pricingCopy } from '@/content/copy/pricing';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Pricing',
  description: pricingCopy.hero.sub,
};

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink py-24 text-graphite-50">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-30" />
        <MaxWidth as="div" className="relative z-10 text-center">
          <FadeIn className="space-y-5">
            <Badge>{pricingCopy.hero.eyebrow}</Badge>
            <h1 className="mx-auto max-w-3xl text-display-2 font-semibold text-balance">
              {pricingCopy.hero.title}
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-graphite-300">
              {pricingCopy.hero.sub}
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* TIER CARDS */}
      <section className="border-t border-border/60 bg-background py-16">
        <MaxWidth as="div">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {pricingCopy.tiers.map((t) => (
              <StaggerItem key={t.name}>
                <article
                  className={cn(
                    'relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border bg-surface-1 p-6',
                    t.featured ? 'border-signal-500/60' : 'border-border',
                  )}
                >
                  {t.featured ? <BorderBeam /> : null}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">{t.name}</h2>
                    {t.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-signal-500/10 px-2.5 py-0.5 text-xs text-signal-300">
                        <Sparkles className="size-3" /> Most asked
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{t.tagline}</p>
                  <ul className="space-y-1 font-mono text-sm">
                    {Object.entries(t.pricing).map(([k, v]) => (
                      <li key={k} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="text-foreground">{v}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-2 space-y-2 text-sm">
                    {t.includes.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-positive" />
                        <span className="text-foreground/85">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4">
                    <Button
                      asChild
                      variant={t.featured ? 'primary' : 'secondary'}
                      className="w-full"
                    >
                      <Link href={t.cta.href}>{t.cta.label}</Link>
                    </Button>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* ROI CALCULATOR */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow={pricingCopy.roi.eyebrow}
              title={pricingCopy.roi.title}
              description={pricingCopy.roi.body}
            />
          </Reveal>
          <FadeIn className="mt-10">
            <RoiCalculator />
          </FadeIn>
        </MaxWidth>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <h2 className="text-display-2 font-semibold">{pricingCopy.faq.title}</h2>
          </Reveal>
          <FadeIn className="mx-auto mt-8 max-w-3xl">
            <Accordion type="single" collapsible>
              {pricingCopy.faq.items.map((it, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger>{it.q}</AccordionTrigger>
                  <AccordionContent>{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-ink py-24 text-graphite-50">
        <MaxWidth as="div" className="text-center">
          <h2 className="text-display-2 font-semibold text-balance">
            Talk to us about your stack.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-graphite-300">
            Tell us your hiring volume, the formats you need, and the leaks you're seeing. We'll
            pick the SKU and tier that fit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/contact">Book a scoping call</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/product">See the platform</Link>
            </Button>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}

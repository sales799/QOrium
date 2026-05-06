import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { DemoForm } from '@/components/site/DemoForm';
import { CalendlyEmbed } from '@/components/site/CalendlyEmbed';
import { FadeIn } from '@/components/motion/FadeIn';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { mailerStatus } from '@/lib/mailer';

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';

export const metadata: Metadata = {
  title: 'Book a demo',
  description: 'A 30-minute walk-through of the platform, the three SKUs, and one of your JDs.',
};

const AGENDA = [
  'Walkthrough: the 7-stage Content Engine and how it flexes per SKU.',
  'Live JD-Forge generation against one JD you provide.',
  'ReadyBank API + bulk export examples for your platform.',
  'Stack-Vault scoping if your hiring volume warrants it.',
  'Pricing scoped against your hiring volume.',
];

export default function DemoPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-4">
            <Badge>Demo</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Bring a JD. Watch the engine run.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              30 minutes. We show the full pipeline, not slides. If you have a real JD with you,
              we'll generate a pack live and walk through the result line by line.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-20">
        <MaxWidth as="div" className="grid gap-12 md:grid-cols-12">
          <aside className="md:col-span-4">
            <FadeIn className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">
                  Agenda
                </p>
                <ul className="mt-4 space-y-3">
                  {AGENDA.map((line) => (
                    <li key={line} className="flex gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {mailerStatus === 'console-fallback' ? (
                <p className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
                  Pre-launch: requests are logged for manual scheduling until the mail provider is
                  configured.
                </p>
              ) : null}
              <p className="rounded-md border border-border bg-surface-1 p-4 text-xs text-muted-foreground">
                Booking your slot triggers a calendar invite via email. We confirm same-day if
                received before 14:00 IST.
              </p>
            </FadeIn>
          </aside>
          <div className="md:col-span-8">
            <FadeIn>
              {CALENDLY_URL ? (
                <CalendlyEmbed url={CALENDLY_URL} />
              ) : (
                <div className="rounded-lg border border-border bg-surface-1 p-6 md:p-8">
                  <DemoForm />
                </div>
              )}
            </FadeIn>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}

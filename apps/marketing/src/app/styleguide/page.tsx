import type { Metadata } from 'next';
import { CircleCheck, Database, Sparkles, ShieldCheck } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { NumberTicker } from '@/components/magicui/NumberTicker';
import { Marquee } from '@/components/magicui/Marquee';
import { ShimmerButton } from '@/components/magicui/ShimmerButton';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';
import { AuroraBackground } from '@/components/aceternity/AuroraBackground';
import { BentoGrid, BentoCard } from '@/components/aceternity/BentoGrid';

export const metadata: Metadata = {
  title: 'Styleguide',
  description: 'Internal: design tokens and primitives.',
  robots: { index: false, follow: false },
};

const TOKENS = [
  { token: 'graphite-50', value: 'hsl(220 14% 96%)' },
  { token: 'graphite-300', value: 'hsl(216 12% 70%)' },
  { token: 'graphite-500', value: 'hsl(220 9% 46%)' },
  { token: 'graphite-700', value: 'hsl(217 19% 27%)' },
  { token: 'graphite-900', value: 'hsl(222 47% 11%)' },
  { token: 'signal-300', value: 'hsl(192 90% 70%)' },
  { token: 'signal-500', value: 'hsl(192 95% 50%)' },
  { token: 'signal-700', value: 'hsl(192 100% 32%)' },
  { token: 'positive', value: 'hsl(152 60% 45%)' },
  { token: 'warning', value: 'hsl(38 92% 52%)' },
  { token: 'danger', value: 'hsl(0 72% 55%)' },
];

export default function StyleguidePage() {
  return (
    <main id="main" className="relative min-h-screen bg-background py-16">
      <MaxWidth as="section" className="space-y-24">
        <header className="space-y-4">
          <Badge>Internal · v1</Badge>
          <h1 className="text-display-2 font-semibold">Qorium Styleguide</h1>
          <p className="max-w-2xl text-muted-foreground">
            Locks the design system before page work. Every primitive on this site renders here.
          </p>
        </header>

        {/* COLORS */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Tokens" title="Color system" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {TOKENS.map((t) => (
              <div key={t.token} className="overflow-hidden rounded-md border border-border">
                <div className="h-16 w-full" style={{ background: t.value }} />
                <div className="p-3 font-mono text-xs">
                  <div className="text-foreground">{t.token}</div>
                  <div className="text-muted-foreground">{t.value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Tokens" title="Typography" />
          <div className="space-y-4">
            <p className="text-display-1 font-sans">The world&rsquo;s question bank</p>
            <p className="text-display-2 font-sans">Display 2 — Geist Sans</p>
            <p className="text-2xl font-sans">H1 — Geist Sans 24px</p>
            <p className="text-base">
              Body — Geist Sans. Sentences ≤ 22 words. Concrete claims with numbers.
            </p>
            <p className="font-mono text-sm">Mono — Geist Mono · 530 questions · &lt;200ms p95</p>
            <p className="font-serif text-lg">
              Long-read — Source Serif 4. Used on legal pages and blog body for sustained reading.
            </p>
          </div>
        </section>

        {/* BUTTONS */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Primitives" title="Buttons" />
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <ShimmerButton>Shimmer CTA</ShimmerButton>
          </div>
        </section>

        {/* FORM CONTROLS */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Primitives" title="Form controls" />
          <div className="grid max-w-xl gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@company.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" placeholder="Tell us about your hiring volume and stack." />
            </div>
          </div>
        </section>

        {/* TABS / ACCORDION */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Primitives" title="Tabs & Accordion" />
          <Tabs defaultValue="api">
            <TabsList>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="bulk">Bulk export</TabsTrigger>
              <TabsTrigger value="widget">Embedded widget</TabsTrigger>
            </TabsList>
            <TabsContent value="api">
              REST + SDKs. <Badge variant="positive">90%+ margin</Badge>
            </TabsContent>
            <TabsContent value="bulk">CSV / JSON / HackerRank YAML / Mettl XLSX.</TabsContent>
            <TabsContent value="widget">Drop-in JS widget for the recruiter tier.</TabsContent>
          </Tabs>

          <Accordion type="single" collapsible className="max-w-2xl">
            <AccordionItem value="q1">
              <AccordionTrigger>What is anti-leak rotation?</AccordionTrigger>
              <AccordionContent>
                Continuous monitoring of public sources. When a question surfaces, an AI variant is
                generated, SME validated, and released as v2; the original retires.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>How is difficulty calibrated?</AccordionTrigger>
              <AccordionContent>
                Every question is sampled against the QOrium Reference Panel; difficulty is an IRT
                estimate, refined as more data accrues.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* DIALOG */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Primitives" title="Dialog" />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open compare modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compare SKUs</DialogTitle>
                <DialogDescription>
                  ReadyBank vs JD-Forge vs Stack-Vault — pick the right shape for your hiring
                  volume.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </section>

        {/* MOTION */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Motion" title="Reveal primitives" />
          <FadeIn>
            <p className="text-muted-foreground">FadeIn — fades up 12px on viewport entry.</p>
          </FadeIn>
          <Reveal direction="left">
            <p className="text-muted-foreground">Reveal — slides in from the left.</p>
          </Reveal>
          <Stagger className="grid gap-2 sm:grid-cols-3">
            {['IRT', 'Anti-leak', 'Role-graph'].map((s) => (
              <StaggerItem
                key={s}
                className="rounded-md border border-border bg-surface-1 p-4 text-sm"
              >
                {s}
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* MAGIC UI */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Magic UI" title="Number ticker · Marquee · Border beam" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-md border border-border bg-surface-1 p-6">
              <NumberTicker value={530} className="text-5xl text-signal-500" />
              <p className="mt-2 text-sm text-muted-foreground">questions validated · M0</p>
            </div>
            <div className="rounded-md border border-border bg-surface-1 p-6">
              <NumberTicker value={30} prefix="$" suffix="B" className="text-5xl text-signal-500" />
              <p className="mt-2 text-sm text-muted-foreground">assessment-content TAM</p>
            </div>
            <div className="relative overflow-hidden rounded-md border border-border bg-surface-1 p-6">
              <p className="text-sm text-muted-foreground">Border beam</p>
              <p className="mt-2 text-2xl font-semibold">CTA card</p>
              <BorderBeam />
            </div>
          </div>
          <Marquee className="[--duration:30s]">
            {['Talpro India', 'Enterprise GCC (in discovery)', 'Wave 1 SMEs', 'Wave 2 SMEs'].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-md border border-border bg-surface-1 px-4 py-2 font-mono text-sm text-muted-foreground"
                >
                  {label}
                </span>
              ),
            )}
          </Marquee>
        </section>

        {/* ACETERNITY */}
        <section className="space-y-6">
          <SectionHeading eyebrow="Aceternity" title="Backgrounds & Bento" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative h-56 overflow-hidden rounded-md border border-border bg-background">
              <Spotlight className="left-1/2 top-0" />
              <div className="relative z-10 p-6 text-foreground">Spotlight</div>
            </div>
            <div className="relative h-56 overflow-hidden rounded-md border border-border bg-background">
              <BackgroundBeams />
              <div className="relative z-10 p-6 text-foreground">Background beams</div>
            </div>
            <div className="relative h-56 overflow-hidden rounded-md border border-border bg-background md:col-span-2">
              <AuroraBackground />
              <div className="relative z-10 p-6 text-foreground">Aurora background</div>
            </div>
          </div>

          <BentoGrid>
            <BentoCard
              title="ReadyBank"
              description="Shared, IRT-calibrated, anti-leak-rotated."
              icon={<Database className="size-5" />}
            />
            <BentoCard
              title="JD-Forge"
              description="On-demand custom packs in 30 seconds."
              icon={<Sparkles className="size-5" />}
            />
            <BentoCard
              title="Stack-Vault"
              description="Customer-exclusive, watermarked private library."
              icon={<ShieldCheck className="size-5" />}
            />
          </BentoGrid>
        </section>

        <Separator />

        <footer className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleCheck className="size-4 text-positive" /> Internal — not indexed
        </footer>
      </MaxWidth>
    </main>
  );
}

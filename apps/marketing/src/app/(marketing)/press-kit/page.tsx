import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Mail, ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { EmailText } from '@/components/site/EmailText';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';

export const metadata: Metadata = {
  title: 'Press kit',
  description: 'Brand assets, boilerplate, founder note. Everything you need to mention us.',
  alternates: { canonical: '/press-kit' },
};

// SOURCE: Constitution §1.1 — locked USP, verbatim
const LOCKED_USP =
  "QOrium is the world's first enterprise-grade Question-Bank-as-a-Service. We deliver an IRT-calibrated, anti-leak-rotated, watermark-per-candidate library — across general tech, India-stack, and AI-era assessment formats — to assessment platforms (API), enterprise hiring teams (Stack-Vault), and recruiters (subscription).";

// SOURCE: Blueprint §1 + Investor Brief §1
const BOILERPLATE =
  'QOrium is the world’s first enterprise-grade Question-Bank-as-a-Service, headquartered in India. We supply IRT-calibrated, anti-leak-rotated question libraries to assessment platforms, enterprise hiring teams, and recruiters — across general tech, India-stack, and AI-era assessment formats. The Talpro Universe network is our distribution and SME pool from Day 1.';

// SOURCE: Investor Brief §1 — founder paragraph
const FOUNDER_NOTE =
  'Bhaskar Anand, CEO. Built and scaled Talpro Universe across IT staffing in India. The leak problem in assessments is operational, not theoretical — we watched it happen weekly. QOrium is the answer we wanted to buy.';

const ASSETS = [
  {
    name: 'Logo (mark only, SVG)',
    href: '/api/brand/logo.svg',
    note: 'Square mark, 280px viewBox. Use for app icons, social avatars, favicons.',
  },
  {
    name: 'Wordmark (mark + Qorium, SVG)',
    href: '/api/brand/wordmark.svg',
    note: 'Horizontal lockup. Use in headers, presentations, mastheads.',
  },
  {
    name: 'Open Graph card (auto-generated)',
    href: '/opengraph-image',
    note: 'Default OG image for any link to qorium.online. Generated at request time.',
  },
];

export default function PressKitPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-4">
            <Badge>Press kit</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Everything you need to mention us.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              Brand assets, boilerplate, founder note. Use freely. Attribution appreciated, not
              required.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* USP */}
      <section className="border-t border-border/60 bg-background py-16">
        <MaxWidth as="div">
          <SectionHeading
            eyebrow="The locked sentence"
            title="Three sentences. Verbatim. Don't paraphrase."
            description="Per Constitution §1.1 + Standing Order #2, this is the canonical USP across all external materials."
          />
          <FadeIn>
            <blockquote className="mt-8 rounded-lg border border-border bg-surface-1 p-6 font-serif text-xl leading-relaxed text-foreground text-balance">
              &ldquo;{LOCKED_USP}&rdquo;
            </blockquote>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* Boilerplate */}
      <section className="border-t border-border/60 bg-surface-1 py-16">
        <MaxWidth as="div">
          <SectionHeading
            eyebrow="Boilerplate"
            title="A 75-word About paragraph for press releases."
          />
          <FadeIn>
            <div className="mt-8 rounded-lg border border-border bg-background p-6">
              <p className="text-sm leading-relaxed text-foreground/85">{BOILERPLATE}</p>
            </div>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* Brand assets */}
      <section className="border-t border-border/60 bg-background py-16">
        <MaxWidth as="div">
          <SectionHeading
            eyebrow="Brand assets"
            title="SVG only. No bitmap raster files yet."
            description="Current SVG assets are the production-approved interim set while the full brand identity system is finalized."
          />
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {ASSETS.map((asset) => (
              <StaggerItem key={asset.href}>
                <Link
                  href={asset.href}
                  className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface-1 p-5 transition-colors hover:border-secondary/60"
                >
                  <Download className="size-5 text-secondary" />
                  <h3 className="text-base font-semibold text-foreground">{asset.name}</h3>
                  <p className="text-xs text-muted-foreground">{asset.note}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* Founder + Press contact */}
      <section className="border-t border-border/60 bg-surface-1 py-16">
        <MaxWidth as="div" className="grid gap-8 md:grid-cols-2">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-secondary">Founder</p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-foreground">
              &ldquo;{FOUNDER_NOTE}&rdquo;
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              — Bhaskar Anand, CEO &middot; Talpro Universe
            </p>
          </FadeIn>
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-secondary">
              Press contact
            </p>
            <p className="mt-4 text-lg text-foreground">
              <Mail className="mr-2 inline size-4 align-text-bottom text-secondary" />
              <EmailText address="press@qorium.online" />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Same-day response IST hours; next-day otherwise.
            </p>
            <p className="mt-6 text-sm">
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-secondary hover:underline"
              >
                Read the longer About page <ExternalLink className="size-3" />
              </Link>
            </p>
          </FadeIn>
        </MaxWidth>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileWarning,
  Network,
  Eye,
  Cog,
  FlaskConical,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { SectionHeading } from '@/components/site/SectionHeading';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { Spotlight } from '@/components/aceternity/Spotlight';

export const metadata: Metadata = {
  title: 'Security & Trust',
  description:
    'How QOrium protects customer data, watermarks Stack-Vault content, and earns enterprise trust.',
  alternates: { canonical: '/security' },
};

const COMPLIANCE = [
  { label: 'DPDPA (India)', status: 'Ready', detail: 'Data Protection rules followed by design' },
  {
    label: 'GDPR (EU)',
    status: 'Ready',
    detail: 'Data subject rights honored; EU sub-processors flagged',
  },
  { label: 'SOC 2 Type II', status: 'In progress', detail: 'Audit window: H2 FY2026' },
  { label: 'ISO 27001', status: 'Roadmap', detail: 'Targeted FY2027 alongside Series A' },
];

const POSTURE = [
  {
    icon: KeyRound,
    title: 'Authentication',
    body: 'OAuth2 (admin via NextAuth), HMAC-SHA256 API keys (machine), JWT (sessions). Per-customer signed keys; rotation tooling exposed in console.',
  },
  {
    icon: Network,
    title: 'Transport',
    body: 'TLS 1.3 everywhere. HSTS preload. Modern cipher suites only.',
  },
  {
    icon: ShieldCheck,
    title: 'Data at rest',
    body: 'PostgreSQL with at-rest encryption. Customer-isolated schemas for Stack-Vault. R2 object storage for exports + watermarked artifacts.',
  },
  {
    icon: Eye,
    title: 'Audit logging',
    body: 'Pino structured logs, 90-day retention. Every API key call audit-logged with immutable trail.',
  },
  {
    icon: FileWarning,
    title: 'Anti-leak',
    body: 'Continuous crawl + semantic similarity match. Quarterly rotation cadence (continuous tier available). Leak alerts via webhook.',
  },
  {
    icon: Lock,
    title: 'Watermarking',
    body: 'Cryptographic per-customer marker injected into Stack-Vault test cases and problem statements. Forensic attribution if a leak crosses contractual boundary.',
  },
  {
    icon: Cog,
    title: 'Engineering hygiene',
    body: 'Zero-TS-error CI gate. Test coverage ≥80% on changed files. RFC 7807 errors. gitleaks pre-commit + CI. CSP/HSTS/X-Frame on every response.',
  },
  {
    icon: FlaskConical,
    title: 'Reproducibility',
    body: 'Every shipped question has a SME-validation record, IRT calibration timestamp, and rotation history. Audit any decision back to source.',
  },
];

const SUBPROCESSORS = [
  { name: 'Anthropic', purpose: 'AI generation (primary)', region: 'US' },
  { name: 'OpenAI', purpose: 'AI generation (fallback)', region: 'US' },
  { name: 'Cloudflare R2', purpose: 'Object storage for exports', region: 'Global edge' },
  { name: 'Resend', purpose: 'Transactional email', region: 'US/EU' },
  { name: 'Razorpay', purpose: 'Payments (India)', region: 'India' },
  { name: 'Stripe', purpose: 'Payments (international)', region: 'US' },
  { name: 'Hostinger KVM', purpose: 'Application hosting', region: 'Asia' },
];

export default function SecurityPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden relative py-24 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <Spotlight className="left-1/2 top-0 -translate-x-[60%] opacity-30" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-5">
            <Badge>
              <ShieldCheck className="size-3" /> Security
            </Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Trust posture for the people who buy on it.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              We build for hiring teams at GCCs, BFSI majors, and IT services giants. Their security
              review is non-negotiable. Below: the controls in place, the certifications in motion,
              and the sub-processors that handle your data.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* COMPLIANCE STATUS */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading
              eyebrow="Compliance"
              title="Where we stand. No vague claims."
              description="Below: status on the four certifications enterprise buyers ask about. We don't claim what we haven't earned."
            />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMPLIANCE.map((c) => (
              <StaggerItem key={c.label}>
                <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-surface-1 p-5">
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <Badge variant={c.status === 'Ready' ? 'positive' : 'outline'}>{c.status}</Badge>
                  <p className="text-xs text-muted-foreground">{c.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* POSTURE GRID */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Controls" title="The architecture behind the SLAs." />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {POSTURE.map((p) => (
              <StaggerItem key={p.title}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-5">
                  <p.icon className="size-5 text-signal-500" />
                  <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      {/* DATA FLOW */}
      <section className="border-t border-border/60 bg-background py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Data flow" title="What enters, where it lives, what leaves." />
          </Reveal>
          <FadeIn className="mt-10">
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface-1 p-6 font-mono text-xs leading-relaxed text-foreground/85">
              {`Customer (browser / SDK)
  ↓ TLS 1.3 + signed API key
Nginx → Express API gateway
  ↓ rate-limit + auth + audit-log
Service layer
  ├── ReadyBank service     ──┐
  ├── JD-Forge service       │
  └── Stack-Vault service    ├── Content engine ─→ Anthropic / OpenAI
                              │                    (system prompt-only;
                              │                     no PII forwarded)
                              ↓
PostgreSQL 16  (per-customer schema for Stack-Vault)
Redis 7        (cache, rate limit, queue)
Cloudflare R2  (export artifacts, watermarked PDFs)

Egress: Resend (email), Razorpay/Stripe (billing),
        Plausible (analytics, no PII).`}
            </pre>
          </FadeIn>
        </MaxWidth>
      </section>

      {/* SUB-PROCESSORS */}
      <section className="border-t border-border/60 bg-surface-1 py-24">
        <MaxWidth as="div">
          <Reveal>
            <SectionHeading eyebrow="Sub-processors" title="Who else touches your data." />
          </Reveal>
          <div className="mt-10 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-background">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Provider</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Purpose</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Region</th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((s) => (
                  <tr key={s.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 align-top font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-4 align-top text-foreground/80">{s.purpose}</td>
                    <td className="px-4 py-4 align-top font-mono text-xs text-muted-foreground">
                      {s.region}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            We notify customers in writing 30 days before adding a new sub-processor handling
            personal data.
          </p>
        </MaxWidth>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 relative py-20 [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,oklch(54.65%_0.246_262.87/0.18)_100%)]">
        <MaxWidth as="div" className="text-center">
          <Reveal>
            <h2 className="text-display-2 font-semibold">Need our DPA or security review pack?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              We share full architecture diagrams, sub-processor list, and pen-test summaries under
              NDA on request.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="primary" size="lg">
                <Link href="/contact">Request the pack</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/dpa">Read the DPA</Link>
              </Button>
            </div>
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}

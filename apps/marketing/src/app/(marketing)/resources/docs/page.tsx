import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Braces, KeyRound, ShieldCheck, Webhook } from 'lucide-react';

import { CardGrid, PageHero, SectionBand, SurfaceCard } from '@/components/phase4/MarketingSurface';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';
import { publicApiBaseUrl, publicApiDocsUpdated, publicApiGroups } from '@/content/api-docs';
import { phase4Faqs } from '@/content/phase4';

export const metadata: Metadata = {
  title: 'QOrium API Documentation',
  description:
    'Public-preview QOrium API documentation with OpenAPI 3.1 contracts for live proof and demo endpoints.',
  alternates: { canonical: '/resources/docs' },
};

export default function ApiDocsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
          { name: 'API Documentation', path: '/resources/docs' },
        ]}
      />
      <FAQPageJsonLd questions={phase4Faqs.slice(0, 2)} />
      <main>
        <PageHero
          eyebrow="API documentation"
          title="QOrium API contracts are public-preview ready."
          description="OpenAPI 3.1 docs expose the buyer-facing public proof contracts for JD-Forge, sample packs, grader exemplars, and trust evidence. Customer APIs stay out of this page until their public routes are live."
          cta={{ label: 'Open OpenAPI JSON', href: '/openapi.json' }}
        />

        <SectionBand
          title="Base URL and access"
          description={`Updated ${publicApiDocsUpdated}. API keys are issued during early-access onboarding.`}
        >
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-mono text-xs uppercase text-secondary">Base URL</p>
              <code className="mt-3 block overflow-x-auto rounded-md border border-border bg-muted p-4 text-sm">
                {publicApiBaseUrl}
              </code>
              <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                <p>Authorization: Bearer qor_live_...</p>
                <p>X-Qorium-Idempotency-Key: client-generated UUID for mutating requests</p>
                <p>X-Request-ID is returned on every API response for support tracing.</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-mono text-xs uppercase text-secondary">Use the spec</p>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/openapi.json"
                  className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-semibold"
                >
                  Download OpenAPI JSON
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-semibold"
                >
                  Request API key
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </SectionBand>

        <SectionBand
          title="Endpoint families"
          description="Every listed contract maps to the generated OpenAPI JSON and carries an availability label."
        >
          <div className="grid gap-5">
            {publicApiGroups.map((group) => (
              <div key={group.name} className="rounded-lg border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-normal">{group.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold">
                    {group.endpoints.length} endpoints
                  </span>
                </div>
                <div className="mt-5 grid gap-3">
                  {group.endpoints.map((endpoint) => (
                    <div
                      key={`${endpoint.method}-${endpoint.path}`}
                      className="grid gap-3 rounded-md border border-border bg-background p-3 text-sm md:grid-cols-[5rem_1fr_8rem]"
                    >
                      <span className="font-mono text-xs font-semibold text-secondary">
                        {endpoint.method}
                      </span>
                      <div>
                        <code className="text-foreground">{endpoint.path}</code>
                        <p className="mt-1 text-muted-foreground">{endpoint.summary}</p>
                      </div>
                      <span className="h-fit rounded-md border border-border bg-muted px-2 py-1 text-xs">
                        {endpoint.availability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionBand>

        <SectionBand title="Integration guardrails">
          <CardGrid>
            <SurfaceCard title="Bearer API keys">
              <span className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-muted text-secondary">
                <KeyRound className="size-4" />
              </span>
              API keys are tenant-scoped and should be stored server-side only.
            </SurfaceCard>
            <SurfaceCard title="Signed webhooks">
              <span className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-muted text-secondary">
                <Webhook className="size-4" />
              </span>
              Webhook payloads use HMAC-SHA256 signatures and idempotent delivery identifiers.
            </SurfaceCard>
            <SurfaceCard title="Evidence-gated claims">
              <span className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-muted text-secondary">
                <ShieldCheck className="size-4" />
              </span>
              Early-access contracts are labelled separately from operational public-preview routes.
            </SurfaceCard>
          </CardGrid>
        </SectionBand>

        <SectionBand title="Minimal request example">
          <pre className="overflow-x-auto rounded-lg border border-border bg-card p-5 text-sm leading-6">
            <code>{`curl ${publicApiBaseUrl}/readybank/questions \\
  -H "Authorization: Bearer qor_live_..." \\
  -H "X-Qorium-Idempotency-Key: 018f-api-docs-proof"`}</code>
          </pre>
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Braces className="size-4 text-secondary" />
            The full machine-readable public proof contract is served at /openapi.json.
          </div>
        </SectionBand>
      </main>
    </>
  );
}

import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { FeaturePageLayout } from '@/components/site/FeaturePageLayout';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { jdforgeCopy } from '@/content/copy/features';

export const metadata: Metadata = {
  title: 'JD-Forge — custom packs from any JD in 30 seconds',
  description: jdforgeCopy.hero.sub,
  alternates: { canonical: '/features/jd-forge' },
};

export default function JdForgePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'JD-Forge', path: '/features/jd-forge' },
        ]}
      />
      <FeaturePageLayout
        copy={jdforgeCopy}
        hereVisual={
          <div className="space-y-4 rounded-lg border border-border-subtle bg-surface-1/80 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <Sparkles className="size-4 text-signal-500" />
              <span className="font-mono text-xs text-muted-foreground">JD upload</span>
            </div>
            <div className="rounded-md border border-border-subtle bg-background/40 p-3">
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-foreground">Title:</span> Senior Salesforce Developer (5+ yrs)
                <br />
                <span className="text-foreground">Must-have:</span> Apex triggers, Lightning Web
                Components, Health Cloud
                <br />
                <span className="text-foreground">Stack:</span> Apex, LWC, SOQL, Flow
              </p>
            </div>
            <div className="grid gap-2 font-mono text-xs">
              {[
                { t: 'Parsing', s: '0.4s' },
                { t: 'Spec', s: '0.6s' },
                { t: 'AI draft × 20', s: '11s' },
                { t: 'Self-critique', s: '8s' },
                { t: 'Pack ready', s: '20.4s' },
              ].map((row) => (
                <div
                  key={row.t}
                  className="flex items-center justify-between rounded border border-border-subtle bg-background/40 px-3 py-1.5"
                >
                  <span className="text-foreground">{row.t}</span>
                  <span className="text-signal-300">{row.s}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Standard tier · AI-only · returns to your console + JSON webhook
            </p>
          </div>
        }
      />
    </>
  );
}

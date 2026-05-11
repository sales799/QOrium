import type { Metadata } from 'next';
import { ShieldCheck, Lock } from 'lucide-react';
import { FeaturePageLayout } from '@/components/site/FeaturePageLayout';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { stackvaultCopy } from '@/content/copy/features';

export const metadata: Metadata = {
  title: 'Stack-Vault — customer-exclusive, watermarked private library',
  description: stackvaultCopy.hero.sub,
  alternates: { canonical: '/features/stack-vault' },
};

export default function StackVaultPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Stack-Vault', path: '/features/stack-vault' },
        ]}
      />
      <FeaturePageLayout
        copy={stackvaultCopy}
        hereVisual={
          <div className="space-y-4 rounded-lg border border-border-subtle bg-surface-1/80 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <ShieldCheck className="size-4 text-signal-500" />
              <span className="font-mono text-xs text-muted-foreground">
                Private namespace · /sv/bosch-india
              </span>
            </div>
            <div className="grid gap-2 font-mono text-xs">
              <div className="rounded border border-border-subtle bg-background/40 p-3">
                <p className="flex items-center gap-1.5 text-foreground">
                  <Lock className="size-3 text-positive" /> Watermark verified
                </p>
                <p className="mt-1 text-muted-foreground">
                  customer_id=bosch-india · candidate_id=c_29F1A · issued=2026-04-30T11:21Z
                </p>
              </div>
              <div className="rounded border border-border-subtle bg-background/40 p-3">
                <p className="text-foreground">Library</p>
                <p className="mt-1 text-muted-foreground">
                  2,000 questions · 25 role families · 4 quarterly refreshes
                </p>
              </div>
              <div className="rounded border border-border-subtle bg-background/40 p-3">
                <p className="text-foreground">Exclusivity contract</p>
                <p className="mt-1 text-muted-foreground">
                  Not in ReadyBank · not in any other vault · not in any JD-Forge output
                </p>
              </div>
            </div>
          </div>
        }
      />
    </>
  );
}

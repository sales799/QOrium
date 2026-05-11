import type { Metadata } from 'next';
import { FeaturePageLayout } from '@/components/site/FeaturePageLayout';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { readybankCopy } from '@/content/copy/features';

export const metadata: Metadata = {
  title: 'ReadyBank — shared, IRT-calibrated, anti-leak-rotated',
  description: readybankCopy.hero.sub,
  alternates: { canonical: '/features/readybank' },
};

const SAMPLE_RESPONSE = `{
  "pack_id": "rb_pkg_01HXY7Z3K9V",
  "role": "Senior Backend Engineer (Java Spring Boot, 5+ yrs)",
  "questions": [
    {
      "uuid": "rb_q_01HXY8M2P5R",
      "format": "Coding-fn",
      "skill": "java.spring.transactional",
      "difficulty_band": 4,
      "irt_calibrated_at": "2026-04-22T07:40:11Z",
      "anti_leak_scan": { "last": "2026-04-29", "status": "clean" }
    },
    { "uuid": "rb_q_01HXY8M9Q1Z", "format": "SJT", "skill": "java.system.idempotency", "difficulty_band": 4 },
    { "uuid": "rb_q_01HXY8N4D8X", "format": "MCQ", "skill": "java.spring.security", "difficulty_band": 3 }
  ],
  "watermark": { "customer_id": "talpro-india", "issued_at": "2026-05-04T03:21:00Z" }
}`;

export default function ReadyBankPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'ReadyBank', path: '/features/readybank' },
        ]}
      />
      <FeaturePageLayout
        copy={readybankCopy}
        hereVisual={
          <div className="rounded-lg border border-border-subtle bg-surface-1/80 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
              <span className="size-2 rounded-full bg-danger" />
              <span className="size-2 rounded-full bg-warning" />
              <span className="size-2 rounded-full bg-positive" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                POST /v1/packs/generate
              </span>
            </div>
            <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-foreground/85">
              {SAMPLE_RESPONSE}
            </pre>
          </div>
        }
      />
    </>
  );
}

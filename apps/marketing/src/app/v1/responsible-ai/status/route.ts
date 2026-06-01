import { NextResponse } from 'next/server';

import { resolveResponsibleAiRows } from '@/content/trust-flags';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      data: {
        capabilities: resolveResponsibleAiRows().map((capability) => ({
          name: capability.label,
          status: capability.status,
          flag: capability.flag,
          flagState: capability.flagState,
          flagSource: capability.flagSource,
          liveAsOf: capability.lastVerified,
          owner: capability.owner,
          evidenceUrl: capability.evidenceUrl,
          evidence: capability.evidence,
        })),
      },
      error: null,
    },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } },
  );
}

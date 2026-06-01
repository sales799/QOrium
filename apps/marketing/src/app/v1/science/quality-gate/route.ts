import { NextResponse } from 'next/server';

import { qualityGateSnapshot } from '@/content/trust';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      data: { latestRun: qualityGateSnapshot },
      error: null,
    },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } },
  );
}

import { NextResponse } from 'next/server';

import { pipelineStats } from '@/content/trust';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      data: pipelineStats,
      error: null,
    },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } },
  );
}

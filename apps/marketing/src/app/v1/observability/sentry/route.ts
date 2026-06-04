import { NextResponse } from 'next/server';

import { getSentryConfig } from '@/lib/sentry';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  const config = getSentryConfig();

  return NextResponse.json(
    {
      ok: true,
      data: {
        provider: 'sentry',
        enabled: config.enabled,
        environment: config.env,
        dsnConfigured: config.dsn.length > 0,
      },
      error: null,
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}

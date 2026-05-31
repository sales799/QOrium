import { NextResponse } from 'next/server';

const startedAt = Date.now();

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'qorium-marketing',
      version: process.env['NEXT_PUBLIC_APP_VERSION'] ?? 'marketing-1',
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

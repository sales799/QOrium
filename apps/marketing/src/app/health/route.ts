import { NextResponse } from 'next/server';

const startedAt = Date.now();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  const now = new Date();
  const timestamp = now.toISOString();

  return NextResponse.json(
    {
      status: 'ok',
      service: 'qorium-marketing',
      version: process.env['NEXT_PUBLIC_APP_VERSION'] ?? 'marketing-1',
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      timestamp,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        ETag: `W/"qorium-marketing-${timestamp}"`,
        'Last-Modified': now.toUTCString(),
      },
    },
  );
}

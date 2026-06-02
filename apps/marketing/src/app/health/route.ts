import { NextResponse } from 'next/server';

const startedAt = Date.now();
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://assets.calendly.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://plausible.io https://api.resend.com https://calendly.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
    "frame-src 'self' https://calendly.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

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
        ...securityHeaders,
        'Cache-Control': 'no-store, max-age=0',
        ETag: `W/"qorium-marketing-${timestamp}"`,
        'Last-Modified': now.toUTCString(),
      },
    },
  );
}

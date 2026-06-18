import { NextResponse, type NextRequest } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_BURST = 30;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function middleware(request: NextRequest) {
  const rateLimit = checkRateLimit(request);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        type: 'https://qorium.online/problems/rate-limit-exceeded',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Too many requests from this client. Try again shortly.',
        instance: request.nextUrl.pathname,
        retry_after_seconds: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rateLimit),
          'Content-Type': 'application/problem+json',
          'Cache-Control': 'no-store, max-age=0',
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.json(
      {
        type: 'https://qorium.online/problems/unauthorized',
        title: 'Authentication required',
        status: 401,
        detail: 'Administrative routes require authenticated access.',
        instance: request.nextUrl.pathname,
      },
      {
        status: 401,
        headers: {
          ...rateLimitHeaders(rateLimit),
          'Content-Type': 'application/problem+json',
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  }

  const staleLeadCaptureRewrite = leadCaptureRewrite(request);
  if (staleLeadCaptureRewrite) {
    for (const [key, value] of Object.entries(rateLimitHeaders(rateLimit))) {
      staleLeadCaptureRewrite.headers.set(key, value);
    }
    return staleLeadCaptureRewrite;
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(rateLimitHeaders(rateLimit))) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png).*)'],
};

function checkRateLimit(request: NextRequest) {
  const now = Date.now();
  const key = clientKey(request);
  const current = buckets.get(key);
  const bucket =
    current && current.resetAt > now
      ? current
      : {
          count: 0,
          resetAt: now + RATE_LIMIT_WINDOW_MS,
        };

  bucket.count += 1;
  buckets.set(key, bucket);
  pruneBuckets(now);

  const limit = RATE_LIMIT_MAX + RATE_LIMIT_BURST;
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    allowed: bucket.count <= limit,
    limit,
    remaining,
    resetSeconds: retryAfterSeconds,
    retryAfterSeconds,
  };
}

function clientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  return cfIp || forwardedFor || realIp || 'unknown';
}

function leadCaptureRewrite(request: NextRequest): NextResponse | null {
  if (request.method !== 'POST') {
    return null;
  }

  const intent =
    request.nextUrl.pathname === '/demo'
      ? 'demo'
      : request.nextUrl.pathname === '/contact'
        ? 'contact'
        : null;

  if (!intent) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = '/api/lead-capture';
  url.searchParams.set('intent', intent);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-qorium-lead-intent', intent);

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

function rateLimitHeaders(limit: ReturnType<typeof checkRateLimit>) {
  return {
    'RateLimit-Limit': String(limit.limit),
    'RateLimit-Remaining': String(limit.remaining),
    'RateLimit-Reset': String(limit.resetSeconds),
    'X-RateLimit-Policy': `${RATE_LIMIT_MAX}r/m + ${RATE_LIMIT_BURST} burst`,
  };
}

function pruneBuckets(now: number): void {
  if (buckets.size < 10_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
          'Content-Type': 'application/problem+json',
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

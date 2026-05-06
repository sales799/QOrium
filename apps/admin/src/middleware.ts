import { auth } from '@/auth';

export default auth;

export const config = {
  // Match every page route except Next.js internals + static assets
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|healthz).*)'],
};

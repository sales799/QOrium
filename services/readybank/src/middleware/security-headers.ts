import helmet from 'helmet';
import type { RequestHandler } from 'express';

/**
 * Per CTO Architecture §8.4 + 92-pt Quality Gate Pillar B:
 * HSTS, X-Content-Type-Options, X-Frame-Options, CSP on every response.
 *
 * Helmet's defaults cover all four. CSP is explicitly configured to forbid
 * inline scripts (no `unsafe-inline`) per Pillar B item "CSP policy".
 */
export function securityHeaders(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'object-src': ["'none'"],
      },
    },
    strictTransportSecurity: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'no-referrer' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    xFrameOptions: { action: 'deny' },
  });
}

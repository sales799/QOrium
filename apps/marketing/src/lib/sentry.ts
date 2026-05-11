/**
 * Sentry scaffold — env-gated.
 *
 * Authority: TD-007 paydown in `cto/tech-debt.md`. Wires the API surface
 * for Sentry error tracking; off-by-default until BOTH:
 *   1. `NEXT_PUBLIC_SENTRY_DSN` is provisioned in repo secrets and
 *      injected via `deploy-marketing.yml` (per ADR 0005)
 *   2. `@sentry/nextjs` is installed as a dependency
 *
 * Why split: installing @sentry/nextjs without a DSN adds bundle weight
 * for zero benefit. This stub keeps the API surface stable so feature
 * code (`actions/contact.ts`, `actions/demo.ts`, future routes) can call
 * `captureException(err)` from day 1; activation is a single PR away
 * when DSN lands.
 *
 * Constitutional anchor: SO-15 (env-driven config), SO-16 (Documentation
 * as Code — this stub IS the spec for the eventual real impl).
 */

import type { Severity } from './sentry-types';

const DSN = process.env['NEXT_PUBLIC_SENTRY_DSN'] ?? '';
const ENV = process.env['NEXT_PUBLIC_SENTRY_ENV'] ?? 'production';

export const sentryEnabled = DSN.length > 0;

/**
 * Capture a non-fatal exception with optional context.
 * No-op until DSN+@sentry/nextjs both land.
 */
export async function captureException(
  err: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!sentryEnabled) {
    if (process.env['NODE_ENV'] === 'development') {
      // In dev, log to console so the developer sees the error
      console.error('[sentry-stub] captureException:', err, context);
    }
    return;
  }

  // ACTIVATION (when DSN + @sentry/nextjs install land in same PR):
  //
  //   const Sentry = await import('@sentry/nextjs');
  //   if (context) {
  //     Sentry.withScope((scope) => {
  //       Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
  //       Sentry.captureException(err);
  //     });
  //   } else {
  //     Sentry.captureException(err);
  //   }
  //
  // Until then, fall through to the dev-mode console branch above.
}

/**
 * Capture a non-error message (e.g., "user did unusual thing").
 * No-op until DSN+@sentry/nextjs both land.
 */
export async function captureMessage(message: string, severity: Severity = 'info'): Promise<void> {
  if (!sentryEnabled) {
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`[sentry-stub] captureMessage [${severity}]:`, message);
    }
    return;
  }
  // ACTIVATION: const Sentry = await import('@sentry/nextjs');
  //             Sentry.captureMessage(message, severity);
}

/**
 * Set the current user for error context.
 * No-op until DSN+@sentry/nextjs both land.
 *
 * IMPORTANT: only pass non-PII identifiers (hashed user-id, etc.) per
 * DPDPA + the privacy posture documented at `qorium.online/security`.
 */
export async function setUser(user: { id: string; segment?: string } | null): Promise<void> {
  if (!sentryEnabled) return;
  // ACTIVATION: const Sentry = await import('@sentry/nextjs');
  //             Sentry.setUser(user);
  void user;
}

export function getSentryConfig(): { enabled: boolean; env: string; dsn: string } {
  return {
    enabled: sentryEnabled,
    env: ENV,
    dsn: DSN ? `${DSN.substring(0, 12)}...` : '', // Redacted for safety
  };
}

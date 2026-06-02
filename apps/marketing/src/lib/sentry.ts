import type { Severity } from './sentry-types';

const DSN = process.env['NEXT_PUBLIC_SENTRY_DSN'] ?? process.env['SENTRY_DSN'] ?? '';
const ENV = process.env['NEXT_PUBLIC_SENTRY_ENV'] ?? process.env['SENTRY_ENV'] ?? 'production';

export const sentryEnabled = DSN.length > 0;

/**
 * Capture a non-fatal exception with optional context.
 * No-op until a Sentry DSN is present in the runtime environment.
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

  const Sentry = await import('@sentry/nextjs');
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
      Sentry.captureException(err);
    });
    return;
  }

  Sentry.captureException(err);
}

/**
 * Capture a non-error message (e.g., "user did unusual thing").
 * No-op until a Sentry DSN is present in the runtime environment.
 */
export async function captureMessage(message: string, severity: Severity = 'info'): Promise<void> {
  if (!sentryEnabled) {
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`[sentry-stub] captureMessage [${severity}]:`, message);
    }
    return;
  }

  const Sentry = await import('@sentry/nextjs');
  Sentry.captureMessage(message, severity);
}

/**
 * Set the current user for error context.
 * No-op until a Sentry DSN is present in the runtime environment.
 *
 * IMPORTANT: only pass non-PII identifiers (hashed user-id, etc.) per
 * DPDPA + the privacy posture documented at `qorium.online/security`.
 */
export async function setUser(user: { id: string; segment?: string } | null): Promise<void> {
  if (!sentryEnabled) return;

  const Sentry = await import('@sentry/nextjs');
  Sentry.setUser(user);
}

export function getSentryConfig(): { enabled: boolean; env: string; dsnConfigured: boolean } {
  return {
    enabled: sentryEnabled,
    env: ENV,
    dsnConfigured: DSN.length > 0,
  };
}

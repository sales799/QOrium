/**
 * Internal-only types for the Sentry scaffold (`./sentry.ts`).
 *
 * Mirrors the small severity union this app exposes through `lib/sentry.ts`.
 * Keeping it local avoids leaking SDK-specific types into feature code.
 */

export type Severity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

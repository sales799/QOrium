// N11 candidate UX slice 3: decide what the candidate landing page shows for an
// invitation, without exposing answer keys or scores. Pure and deterministic so
// it is unit-testable without a DOM or a real clock. The API stays the hard
// source of truth for whether an invitation is usable; the landing page also
// defends against a time-expired invitation slipping through (clock skew, or one
// fetched moments before its deadline) by gating on expires_at locally, so the
// candidate sees an honest expired notice instead of starting an attempt the API
// would then reject.

export type InvitationGate = 'open' | 'submitted' | 'expired';

const SUBMITTED_STATUSES = new Set(['submitted', 'completed', 'graded']);
const EXPIRED_STATUSES = new Set(['expired', 'revoked', 'cancelled', 'canceled']);

/**
 * Decide the landing state for an invitation.
 * - "submitted" already completed; show thank-you (terminal, wins over expiry)
 * - "expired" past its deadline or revoked; show expired notice
 * - "open" still takeable; show consent and Start
 *
 * Unknown statuses are treated as takeable. A missing or unparseable expiresAt
 * is treated as non-expiring (the API stays the hard gate). now is injectable
 * for tests and defaults to the current time.
 */
export function invitationGate(input: {
  status: string;
  expiresAt?: string | null;
  now?: Date;
}): InvitationGate {
  const status = (input.status ?? '').trim().toLowerCase();
  if (SUBMITTED_STATUSES.has(status)) return 'submitted';
  if (EXPIRED_STATUSES.has(status)) return 'expired';

  if (input.expiresAt) {
    const deadline = Date.parse(input.expiresAt);
    const now = (input.now ?? new Date()).getTime();
    if (Number.isFinite(deadline) && deadline <= now) return 'expired';
  }
  return 'open';
}

import { describe, expect, it } from 'vitest';
import { invitationGate } from '../src/lib/invitation-gate';

const FUTURE = '2999-01-01T00:00:00.000Z';
const PAST = '2000-01-01T00:00:00.000Z';
const NOW = new Date('2026-06-11T00:00:00.000Z');

describe('invitationGate', () => {
  it('returns open for a pending invitation that has not expired', () => {
    expect(invitationGate({ status: 'pending', expiresAt: FUTURE, now: NOW })).toBe('open');
  });

  it('returns submitted for a completed invitation, even past expiry', () => {
    expect(invitationGate({ status: 'submitted', expiresAt: PAST, now: NOW })).toBe('submitted');
    expect(invitationGate({ status: 'graded', expiresAt: FUTURE, now: NOW })).toBe('submitted');
  });

  it('returns expired when the deadline has passed', () => {
    expect(invitationGate({ status: 'pending', expiresAt: PAST, now: NOW })).toBe('expired');
  });

  it('returns expired for a revoked or expired status regardless of deadline', () => {
    expect(invitationGate({ status: 'revoked', expiresAt: FUTURE, now: NOW })).toBe('expired');
    expect(invitationGate({ status: 'EXPIRED', expiresAt: FUTURE, now: NOW })).toBe('expired');
  });

  it('treats a missing or unparseable expiresAt as non-expiring', () => {
    expect(invitationGate({ status: 'pending', now: NOW })).toBe('open');
    expect(invitationGate({ status: 'pending', expiresAt: 'not-a-date', now: NOW })).toBe('open');
  });

  it('normalizes status casing and whitespace', () => {
    expect(invitationGate({ status: ' Submitted ', expiresAt: FUTURE, now: NOW })).toBe(
      'submitted',
    );
  });

  it('treats the exact deadline instant as expired', () => {
    expect(invitationGate({ status: 'pending', expiresAt: NOW.toISOString(), now: NOW })).toBe(
      'expired',
    );
  });
});

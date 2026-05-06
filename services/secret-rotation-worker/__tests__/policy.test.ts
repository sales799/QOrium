import { describe, expect, it } from 'vitest';
import { DEFAULT_POLICY_DAYS, evaluatePolicy, nextDueDate } from '../src/policy';

const NOW = new Date('2026-05-03T00:00:00Z');

describe('evaluatePolicy', () => {
  it('no_op when paused', () => {
    const out = evaluatePolicy({
      status: 'paused',
      nextRotationDue: new Date('2026-04-01T00:00:00Z'),
      now: () => NOW,
    });
    expect(out.action).toBe('no_op');
  });

  it('no_op when within healthy window', () => {
    const out = evaluatePolicy({
      status: 'scheduled',
      nextRotationDue: new Date('2026-08-01T00:00:00Z'),
      now: () => NOW,
    });
    expect(out.action).toBe('no_op');
  });

  it('send_reminder when within reminder lead', () => {
    const out = evaluatePolicy({
      status: 'scheduled',
      nextRotationDue: new Date('2026-05-08T00:00:00Z'), // 5 days out
      now: () => NOW,
      reminderLeadDays: 7,
    });
    expect(out.action).toBe('send_reminder');
    if (out.action === 'send_reminder') expect(out.daysUntilDue).toBe(5);
  });

  it('no_op when reminder already sent', () => {
    const out = evaluatePolicy({
      status: 'reminder_sent',
      nextRotationDue: new Date('2026-05-08T00:00:00Z'),
      now: () => NOW,
    });
    expect(out.action).toBe('no_op');
  });

  it('mark_overdue when past due', () => {
    const out = evaluatePolicy({
      status: 'scheduled',
      nextRotationDue: new Date('2026-05-01T00:00:00Z'), // 2 days ago
      now: () => NOW,
    });
    expect(out.action).toBe('mark_overdue');
    if (out.action === 'mark_overdue') expect(out.daysOverdue).toBe(2);
  });

  it('no_op when already overdue', () => {
    const out = evaluatePolicy({
      status: 'overdue',
      nextRotationDue: new Date('2026-05-01T00:00:00Z'),
      now: () => NOW,
    });
    expect(out.action).toBe('no_op');
  });

  it('honours overdueGraceDays', () => {
    const out = evaluatePolicy({
      status: 'reminder_sent',
      nextRotationDue: new Date('2026-05-02T00:00:00Z'), // 1 day past due
      now: () => NOW,
      overdueGraceDays: 3,
    });
    expect(out.action).toBe('no_op');
  });
});

describe('nextDueDate', () => {
  it('uses DEFAULT_POLICY_DAYS for known types', () => {
    const due = nextDueDate('database_url', NOW);
    expect((due.getTime() - NOW.getTime()) / 86_400_000).toBe(90);
  });

  it('falls back to 180 days for unknown types', () => {
    const due = nextDueDate('made_up_type', NOW);
    expect((due.getTime() - NOW.getTime()) / 86_400_000).toBe(180);
  });

  it('honours an explicit override', () => {
    const due = nextDueDate('database_url', NOW, 30);
    expect((due.getTime() - NOW.getTime()) / 86_400_000).toBe(30);
  });
});

describe('DEFAULT_POLICY_DAYS catalogue', () => {
  it('matches B6 §2 cadences', () => {
    expect(DEFAULT_POLICY_DAYS.database_url).toBe(90);
    expect(DEFAULT_POLICY_DAYS.api_key).toBe(180);
    expect(DEFAULT_POLICY_DAYS.tls_certificate).toBe(60);
    expect(DEFAULT_POLICY_DAYS.storage_credentials).toBe(90);
  });
});

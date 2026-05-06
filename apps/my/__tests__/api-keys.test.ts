import { describe, expect, it } from 'vitest';
import { aggregatePortfolio, maskKey, toDisplayState, type ApiKeyRow } from '../src/lib/api-keys';

const NOW = Date.parse('2026-05-04T12:00:00Z');
const DAY = 86_400_000;

const baseKey = (overrides: Partial<ApiKeyRow> = {}): ApiKeyRow => ({
  id: 'k-1',
  prefix: 'qor_live_acme1234567890ab',
  name: 'Acme primary',
  scopes: ['questions:read', 'packs:read'],
  rateLimitPerMin: 60,
  rotationDueAt: new Date(NOW + 90 * DAY).toISOString(),
  lastRotatedAt: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('maskKey', () => {
  it('shows the prefix + last four characters with an ellipsis', () => {
    expect(maskKey('qor_live_abcdef1234567890')).toBe('qor_live…7890');
  });

  it('handles short prefixes by appending ellipsis only', () => {
    expect(maskKey('qor_test')).toBe('qor_test…');
  });
});

describe('toDisplayState', () => {
  it('reports active status when rotation is far in the future', () => {
    const state = toDisplayState(baseKey(), NOW);
    expect(state.status).toBe('active');
    expect(state.dueInDays).toBe(90);
  });

  it('flags expiring when rotation is within 14 days', () => {
    const state = toDisplayState(
      baseKey({ rotationDueAt: new Date(NOW + 7 * DAY).toISOString() }),
      NOW,
    );
    expect(state.status).toBe('expiring');
  });

  it('flags rotation_due when rotationDueAt is past now', () => {
    const state = toDisplayState(
      baseKey({ rotationDueAt: new Date(NOW - DAY).toISOString() }),
      NOW,
    );
    expect(state.status).toBe('rotation_due');
  });

  it('flags expired when expiresAt is past now', () => {
    const state = toDisplayState(baseKey({ expiresAt: new Date(NOW - DAY).toISOString() }), NOW);
    expect(state.status).toBe('expired');
  });

  it('flags revoked when revokedAt is set', () => {
    const state = toDisplayState(baseKey({ revokedAt: '2026-04-01T00:00:00Z' }), NOW);
    expect(state.status).toBe('revoked');
  });

  it('uses prefix when name is null', () => {
    const state = toDisplayState(baseKey({ name: null }), NOW);
    expect(state.label).toBe(baseKey().prefix);
  });

  it('formats the rate badge', () => {
    const state = toDisplayState(baseKey({ rateLimitPerMin: 120 }), NOW);
    expect(state.rateBadge).toBe('120/min');
  });
});

describe('aggregatePortfolio', () => {
  it('counts each status correctly', () => {
    const rows: ApiKeyRow[] = [
      baseKey({ id: 'a' }), // active
      baseKey({ id: 'b', rotationDueAt: new Date(NOW + 5 * DAY).toISOString() }), // expiring
      baseKey({ id: 'c', rotationDueAt: new Date(NOW - DAY).toISOString() }), // rotation_due
      baseKey({ id: 'd', expiresAt: new Date(NOW - 1).toISOString() }), // expired
      baseKey({ id: 'e', revokedAt: '2026-04-01T00:00:00Z' }), // revoked
    ];
    const portfolio = aggregatePortfolio(rows, NOW);
    expect(portfolio.active).toBe(1);
    expect(portfolio.expiring).toBe(1);
    expect(portfolio.rotationDue).toBe(1);
    expect(portfolio.expired).toBe(1);
    expect(portfolio.revoked).toBe(1);
  });

  it('returns the soonest non-expired/non-revoked rotation date', () => {
    const rows: ApiKeyRow[] = [
      baseKey({ id: 'far', rotationDueAt: new Date(NOW + 90 * DAY).toISOString() }),
      baseKey({ id: 'near', rotationDueAt: new Date(NOW + 7 * DAY).toISOString() }),
      baseKey({
        id: 'gone',
        rotationDueAt: new Date(NOW + 1 * DAY).toISOString(),
        revokedAt: '2026-04-01T00:00:00Z',
      }),
    ];
    const portfolio = aggregatePortfolio(rows, NOW);
    expect(portfolio.nextRotationDate).toBe(new Date(NOW + 7 * DAY).toISOString());
  });

  it('returns null for empty portfolios', () => {
    const portfolio = aggregatePortfolio([], NOW);
    expect(portfolio.nextRotationDate).toBe(null);
    expect(portfolio.active).toBe(0);
  });
});

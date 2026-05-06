import { describe, expect, it } from 'vitest';
import {
  buildAdminUser,
  buildLoginRedirect,
  isEmailAllowed,
  isProtectedPath,
  isWellFormedEmail,
  parseEmailAllowlist,
} from '../src/auth-config';

describe('parseEmailAllowlist', () => {
  it('returns empty array for undefined / empty input', () => {
    expect(parseEmailAllowlist(undefined)).toEqual([]);
    expect(parseEmailAllowlist('')).toEqual([]);
    expect(parseEmailAllowlist('   ')).toEqual([]);
  });

  it('splits, trims, and lower-cases entries', () => {
    expect(parseEmailAllowlist('Alice@Talpro.in, BOB@talpro.in ,  carol@talpro.in')).toEqual([
      'alice@talpro.in',
      'bob@talpro.in',
      'carol@talpro.in',
    ]);
  });

  it('drops empty fragments from leading/trailing/double commas', () => {
    expect(parseEmailAllowlist(',a@x.io,,b@x.io,')).toEqual(['a@x.io', 'b@x.io']);
  });
});

describe('isWellFormedEmail', () => {
  it.each([
    ['user@host.com', true],
    ['first.last+tag@sub.domain.io', true],
    ['UPPER@example.IO', true],
    ['no-at-symbol', false],
    ['two@@host.com', false],
    ['user@host', false],
    ['user@.com', false],
    ['', false],
    ['  spaced @host.com', false],
  ])('classifies %s', (input, expected) => {
    expect(isWellFormedEmail(input)).toBe(expected);
  });
});

describe('isEmailAllowed', () => {
  const allowlist = ['alice@talpro.in', 'bob@talpro.in'];

  it('returns false on empty allowlist regardless of input', () => {
    expect(isEmailAllowed('alice@talpro.in', [])).toBe(false);
  });

  it('returns false for null/undefined/non-string emails', () => {
    expect(isEmailAllowed(null, allowlist)).toBe(false);
    expect(isEmailAllowed(undefined, allowlist)).toBe(false);
    // @ts-expect-error — runtime guard test
    expect(isEmailAllowed(42, allowlist)).toBe(false);
  });

  it('returns false for malformed emails even when present in allowlist', () => {
    expect(isEmailAllowed('not-an-email', [...allowlist, 'not-an-email'])).toBe(false);
  });

  it('matches case-insensitively and trims whitespace', () => {
    expect(isEmailAllowed('  Alice@Talpro.IN ', allowlist)).toBe(true);
    expect(isEmailAllowed('BOB@TALPRO.IN', allowlist)).toBe(true);
  });

  it('returns false for emails not in the allowlist', () => {
    expect(isEmailAllowed('eve@talpro.in', allowlist)).toBe(false);
    expect(isEmailAllowed('alice@example.com', allowlist)).toBe(false);
  });
});

describe('buildAdminUser', () => {
  it('normalises email and derives a name from the local part', () => {
    expect(buildAdminUser('Bhaskar.Anand@talpro.IN')).toEqual({
      id: 'bhaskar.anand@talpro.in',
      email: 'bhaskar.anand@talpro.in',
      name: 'bhaskar.anand',
    });
  });
});

describe('isProtectedPath', () => {
  it.each([
    ['/admin', true],
    ['/admin/queue', true],
    ['/admin/calibration', true],
    ['/admin/queue/123', true],
    ['/login', false],
    ['/api/auth/callback/credentials', false],
    ['/healthz', false],
    ['/', false],
    ['/administrate', false],
  ])('classifies %s', (input, expected) => {
    expect(isProtectedPath(input)).toBe(expected);
  });
});

describe('buildLoginRedirect', () => {
  it('encodes the from path with query string', () => {
    expect(buildLoginRedirect('/admin/queue', '')).toBe('/login?from=%2Fadmin%2Fqueue');
    expect(buildLoginRedirect('/admin/queue', '?cursor=abc')).toBe(
      '/login?from=%2Fadmin%2Fqueue%3Fcursor%3Dabc',
    );
  });

  it('omits from when the source is /login itself (avoids loops)', () => {
    expect(buildLoginRedirect('/login', '')).toBe('/login');
  });

  it('omits from when pathname is empty', () => {
    expect(buildLoginRedirect('', '')).toBe('/login');
  });
});

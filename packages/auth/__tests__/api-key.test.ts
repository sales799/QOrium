import { describe, expect, it } from 'vitest';
import {
  hashApiKey,
  InvalidApiKeyFormatError,
  parseApiKey,
  timingSafeEqualHex,
} from '../src/api-key.js';

const PEPPER = 'test_pepper_must_be_at_least_thirty_two_chars_long_yo';

describe('parseApiKey', () => {
  it('parses qor_live_*', () => {
    const parsed = parseApiKey('qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1');
    expect(parsed.family).toBe('live');
    expect(parsed.prefix).toBe('qor_live');
  });

  it('parses qor_test_*', () => {
    const parsed = parseApiKey('qor_test_9e2d7c4b1f8a3e5d6c9a2b1e4f7c8d3a');
    expect(parsed.family).toBe('test');
    expect(parsed.prefix).toBe('qor_test');
  });

  it('parses qor_internal_<tenant>_<32hex>', () => {
    const parsed = parseApiKey('qor_internal_talind001_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1');
    expect(parsed.family).toBe('internal');
    expect(parsed.prefix).toBe('qor_intern');
  });

  it('rejects empty input', () => {
    expect(() => parseApiKey('')).toThrow(InvalidApiKeyFormatError);
  });

  it('rejects non-qor prefix', () => {
    expect(() => parseApiKey('hk_live_abcdef1234567890')).toThrow(InvalidApiKeyFormatError);
  });

  it('rejects wrong family', () => {
    expect(() => parseApiKey('qor_admin_abcdef1234567890')).toThrow(InvalidApiKeyFormatError);
  });

  it('rejects key too short', () => {
    expect(() => parseApiKey('qor_live_short')).toThrow(InvalidApiKeyFormatError);
  });

  it('rejects key over 256 chars', () => {
    const long = 'qor_live_' + 'a'.repeat(300);
    expect(() => parseApiKey(long)).toThrow(InvalidApiKeyFormatError);
  });
});

describe('hashApiKey', () => {
  it('produces a 64-char hex digest', () => {
    const hash = hashApiKey('qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1', PEPPER);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic for the same input + pepper', () => {
    const a = hashApiKey('qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1', PEPPER);
    const b = hashApiKey('qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1', PEPPER);
    expect(a).toBe(b);
  });

  it('differs for different inputs', () => {
    const a = hashApiKey('qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1', PEPPER);
    const b = hashApiKey('qor_live_b7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1', PEPPER);
    expect(a).not.toBe(b);
  });

  it('differs for different peppers', () => {
    const otherPepper = 'different_pepper_at_least_thirty_two_chars_long!!!!!';
    const a = hashApiKey('qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1', PEPPER);
    const b = hashApiKey('qor_live_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1', otherPepper);
    expect(a).not.toBe(b);
  });

  it('rejects short pepper', () => {
    expect(() => hashApiKey('qor_live_x', 'short')).toThrow(/at least 32 characters/);
  });
});

describe('timingSafeEqualHex', () => {
  it('returns true for equal hex strings', () => {
    expect(timingSafeEqualHex('abcdef0123456789', 'abcdef0123456789')).toBe(true);
  });

  it('returns false for different lengths', () => {
    expect(timingSafeEqualHex('abcdef', 'abcdef0123456789')).toBe(false);
  });

  it('returns false for different content', () => {
    expect(timingSafeEqualHex('abcdef0123456789', 'abcdef0123456788')).toBe(false);
  });

  it('returns false for non-hex input', () => {
    expect(timingSafeEqualHex('not-hex!', 'not-hex!')).toBe(false);
  });
});

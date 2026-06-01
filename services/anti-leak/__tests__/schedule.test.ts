import { describe, expect, it } from 'vitest';

import { parseScanIntervalMs } from '../src/schedule.js';

describe('parseScanIntervalMs', () => {
  it('accepts bounded duration units for the persistent worker', () => {
    expect(parseScanIntervalMs('90s')).toBe(90_000);
    expect(parseScanIntervalMs('15m')).toBe(15 * 60_000);
    expect(parseScanIntervalMs('2h')).toBe(2 * 60 * 60_000);
    expect(parseScanIntervalMs('1d')).toBe(24 * 60 * 60_000);
  });

  it('falls back for invalid, too-short, and too-long intervals', () => {
    const fallback = 123_456;

    expect(parseScanIntervalMs('soon', fallback)).toBe(fallback);
    expect(parseScanIntervalMs('30s', fallback)).toBe(fallback);
    expect(parseScanIntervalMs('8d', fallback)).toBe(fallback);
  });
});

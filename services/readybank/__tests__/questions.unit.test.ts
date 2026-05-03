import { describe, expect, it } from 'vitest';
import { difficultyBToBand, bandToBRange } from '../src/types/question.js';
import { decodeCursor, encodeCursor, InvalidCursorError } from '../src/types/cursor.js';

describe('difficultyBToBand', () => {
  it('returns null for null b', () => {
    expect(difficultyBToBand(null)).toBeNull();
  });

  it('returns null for NaN', () => {
    expect(difficultyBToBand(Number.NaN)).toBeNull();
  });

  it('maps -3.5 → 1 (Easy)', () => {
    expect(difficultyBToBand(-3.5)).toBe(1);
  });

  it('maps -1.5 → 2 (Foundational)', () => {
    expect(difficultyBToBand(-1.5)).toBe(2);
  });

  it('maps 0 → 3 (Proficient)', () => {
    expect(difficultyBToBand(0)).toBe(3);
  });

  it('maps 1.5 → 4 (Advanced)', () => {
    expect(difficultyBToBand(1.5)).toBe(4);
  });

  it('maps 3.0 → 5 (Expert)', () => {
    expect(difficultyBToBand(3.0)).toBe(5);
  });

  it('boundary -2.4 → 2 (start of band 2)', () => {
    expect(difficultyBToBand(-2.4)).toBe(2);
  });

  it('boundary 0.8 → 4 (start of band 4)', () => {
    expect(difficultyBToBand(0.8)).toBe(4);
  });
});

describe('bandToBRange', () => {
  it('round-trips: every b in band(N) range maps back to N', () => {
    for (let band = 1 as 1 | 2 | 3 | 4 | 5; band <= 5; band = (band + 1) as typeof band) {
      const range = bandToBRange(band);
      // Test min and just-below-max
      const samples = [range.min, (range.min + range.maxExclusive) / 2];
      for (const b of samples) {
        expect(difficultyBToBand(b)).toBe(band);
      }
      if (band === 5) break;
    }
  });
});

describe('cursor encode/decode', () => {
  const cursor = {
    released_at: '2026-05-03T12:34:56.789Z',
    id: '11111111-1111-1111-1111-111111111111',
  };

  it('round-trips', () => {
    const encoded = encodeCursor(cursor);
    expect(decodeCursor(encoded)).toEqual(cursor);
  });

  it('rejects non-base64 garbage', () => {
    expect(() => decodeCursor('!!!not-base64!!!')).toThrow(InvalidCursorError);
  });

  it('rejects valid base64 of non-JSON', () => {
    const bad = Buffer.from('not json at all').toString('base64url');
    expect(() => decodeCursor(bad)).toThrow(InvalidCursorError);
  });

  it('rejects JSON missing required fields', () => {
    const bad = Buffer.from('{"r":"only-released-at"}').toString('base64url');
    expect(() => decodeCursor(bad)).toThrow(InvalidCursorError);
  });

  it('rejects non-UUID id', () => {
    const bad = Buffer.from(
      JSON.stringify({ r: '2026-05-03T00:00:00Z', i: 'not-a-uuid' }),
    ).toString('base64url');
    expect(() => decodeCursor(bad)).toThrow(InvalidCursorError);
  });

  it('rejects invalid timestamp', () => {
    const bad = Buffer.from(
      JSON.stringify({ r: 'not-a-date', i: '11111111-1111-1111-1111-111111111111' }),
    ).toString('base64url');
    expect(() => decodeCursor(bad)).toThrow(InvalidCursorError);
  });
});

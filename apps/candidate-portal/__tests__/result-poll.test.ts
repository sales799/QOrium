import { describe, expect, it } from 'vitest';
import { DEFAULT_DELAY_MS, DEFAULT_MAX_POLLS, nextPoll } from '../src/lib/result-poll';

describe('nextPoll', () => {
  it('polls on first mount with the configured delay', () => {
    const d = nextPoll(0);
    expect(d.poll).toBe(true);
    expect(d.delayMs).toBe(DEFAULT_DELAY_MS);
    expect(d.attempt).toBe(1);
  });

  it('keeps polling and increments the attempt counter up to the cap', () => {
    for (let done = 0; done < DEFAULT_MAX_POLLS; done += 1) {
      const d = nextPoll(done);
      expect(d.poll).toBe(true);
      expect(d.attempt).toBe(done + 1);
    }
  });

  it('stops polling once the cap is reached', () => {
    const d = nextPoll(DEFAULT_MAX_POLLS);
    expect(d.poll).toBe(false);
    expect(d.delayMs).toBe(0);
    expect(d.attempt).toBe(0);
  });

  it('respects a custom cap and delay', () => {
    expect(nextPoll(1, 2, 5_000)).toEqual({ poll: true, delayMs: 5_000, attempt: 2 });
    expect(nextPoll(2, 2, 5_000)).toEqual({ poll: false, delayMs: 0, attempt: 0 });
  });

  it('coerces invalid inputs safely', () => {
    expect(nextPoll(-3).poll).toBe(true);
    expect(nextPoll(Number.NaN).attempt).toBe(1);
    expect(nextPoll(0, 0).poll).toBe(false);
    expect(nextPoll(0, 3, -100).delayMs).toBe(0);
  });
});

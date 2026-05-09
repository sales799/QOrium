import { describe, expect, it } from 'vitest';
import { applyFieldMapping, type FieldMapping } from '../src/field-mapper.js';

describe('applyFieldMapping', () => {
  it('renames a top-level field', () => {
    const out = applyFieldMapping({ email_address: 'a@b.co' }, { email: 'email_address' });
    expect(out['email']).toBe('a@b.co');
  });

  it('resolves a dotted path', () => {
    const out = applyFieldMapping(
      { profile: { name: { first: 'Anu' } } },
      { first_name: 'profile.name.first' },
    );
    expect(out['first_name']).toBe('Anu');
  });

  it('falls back to default when source is null/undefined', () => {
    const out = applyFieldMapping({ name: null }, { name: { source: 'name', default: 'Unknown' } });
    expect(out['name']).toBe('Unknown');
  });

  it('returns null when source is missing and no default', () => {
    const out = applyFieldMapping({}, { name: { source: 'name' } });
    expect(out['name']).toBeNull();
  });

  it('coerces string → number', () => {
    const out = applyFieldMapping(
      { score: '92.5' },
      { score: { source: 'score', type: 'number' } },
    );
    expect(out['score']).toBe(92.5);
  });

  it('coerces invalid string → number to null', () => {
    const out = applyFieldMapping(
      { score: 'not-a-number' },
      { score: { source: 'score', type: 'number' } },
    );
    expect(out['score']).toBeNull();
  });

  it('coerces date strings to ISO 8601', () => {
    const out = applyFieldMapping(
      { ts: 'May 9 2026 10:00 UTC' },
      { ts: { source: 'ts', type: 'date' } },
    );
    expect(typeof out['ts']).toBe('string');
    expect(Date.parse(out['ts'] as string)).not.toBeNaN();
  });

  it('passes through arbitrary types when type is omitted', () => {
    const out = applyFieldMapping({ meta: { foo: 1 } }, { meta: 'meta' });
    expect(out['meta']).toEqual({ foo: 1 });
  });

  it('handles boolean coercion', () => {
    const m: FieldMapping = { active: { source: 'active', type: 'boolean' } };
    expect(applyFieldMapping({ active: 'yes' }, m)['active']).toBe(true);
    expect(applyFieldMapping({ active: 'false' }, m)['active']).toBe(false);
    expect(applyFieldMapping({ active: 1 }, m)['active']).toBe(true);
    expect(applyFieldMapping({ active: 0 }, m)['active']).toBe(false);
  });
});

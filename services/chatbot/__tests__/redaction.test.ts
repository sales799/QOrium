import { describe, expect, it } from 'vitest';
import { hashValue, redactPii } from '../src/privacy.js';

describe('chatbot privacy helpers', () => {
  it('redacts email addresses and phone numbers from stored text', () => {
    const redacted = redactPii('Email me at bhaskar@example.com or call +91 98765 43210.');

    expect(redacted).not.toContain('bhaskar@example.com');
    expect(redacted).not.toContain('98765');
    expect(redacted).toContain('[email]');
    expect(redacted).toContain('[phone]');
  });

  it('hashes PII deterministically without exposing the original', () => {
    const first = hashValue('person@example.com');
    const second = hashValue('person@example.com');

    expect(first).toBe(second);
    expect(first).not.toContain('person@example.com');
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});

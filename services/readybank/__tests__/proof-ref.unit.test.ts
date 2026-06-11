import { describe, expect, it } from 'vitest';
import { buildProofRef } from '../src/lib/proof-ref.js';
import { issueProofCode } from '../src/lib/proof-code.js';

const SECRET = 'z'.repeat(40);
const ATTEMPT = 'f5fee843-0000-4000-8000-000000000099';

describe('buildProofRef', () => {
  it('returns null when the attempt is not graded', () => {
    expect(buildProofRef('in_progress', ATTEMPT, SECRET)).toBeNull();
    expect(buildProofRef('submitted', ATTEMPT, SECRET)).toBeNull();
  });

  it('returns null when no proof secret is configured', () => {
    expect(buildProofRef('graded', ATTEMPT, undefined)).toBeNull();
    expect(buildProofRef('graded', ATTEMPT, null)).toBeNull();
    expect(buildProofRef('graded', ATTEMPT, '')).toBeNull();
  });

  it('returns null (inert, no throw) when the secret is too short', () => {
    expect(buildProofRef('graded', ATTEMPT, 'x'.repeat(31))).toBeNull();
  });

  it('returns the proof code and public paths for a graded attempt', () => {
    const ref = buildProofRef('graded', ATTEMPT, SECRET);
    expect(ref).not.toBeNull();
    const code = issueProofCode(ATTEMPT, SECRET);
    expect(ref?.proof_code).toBe(code);
    const enc = encodeURIComponent(code);
    expect(ref?.proof_view_path).toBe(`/v1/proof/${enc}/view`);
    expect(ref?.proof_badge_path).toBe(`/v1/proof/${enc}/badge.svg`);
  });

  it('is deterministic for the same attempt + secret', () => {
    expect(buildProofRef('graded', ATTEMPT, SECRET)?.proof_code).toBe(
      buildProofRef('graded', ATTEMPT, SECRET)?.proof_code,
    );
  });
});

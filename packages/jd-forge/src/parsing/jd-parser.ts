/**
 * JD parser — extracts ParsedJobDescription from raw JD text.
 *
 * Production: calls Claude via @qorium/saml-style injectable client.
 * Tests: caller supplies a mock `extract` function.
 *
 * This module is just the contract + validator. The LLM call itself
 * is cred-bound (ANTHROPIC_API_KEY) and lives in services/jd-forge
 * once cred-drop happens.
 */

import type { ParsedJobDescription, RoleFamily, Seniority } from '../types.js';

export type LlmExtractor = (jdText: string) => Promise<unknown>;

const VALID_ROLE_FAMILIES = new Set<RoleFamily>([
  'engineering',
  'data',
  'design',
  'product',
  'sales',
  'ops',
  'other',
]);

const VALID_SENIORITIES = new Set<Seniority>(['junior', 'mid', 'senior', 'staff', 'principal']);

export class ParseError extends Error {
  constructor(
    public readonly path: string,
    message: string,
  ) {
    super(`${path}: ${message}`);
    this.name = 'ParseError';
  }
}

/**
 * Validate + narrow an unknown blob into ParsedJobDescription.
 * Throws ParseError on shape violations.
 */
export function validateParsed(raw: unknown): ParsedJobDescription {
  if (typeof raw !== 'object' || raw === null) {
    throw new ParseError('$', 'must be an object');
  }
  const obj = raw as Record<string, unknown>;

  const role_title = stringField(obj, 'role_title', 1, 200);
  const role_family_raw = stringField(obj, 'role_family');
  if (!VALID_ROLE_FAMILIES.has(role_family_raw as RoleFamily)) {
    throw new ParseError('role_family', `must be one of ${[...VALID_ROLE_FAMILIES].join('|')}`);
  }
  const seniority_raw = stringField(obj, 'seniority');
  if (!VALID_SENIORITIES.has(seniority_raw as Seniority)) {
    throw new ParseError('seniority', `must be one of ${[...VALID_SENIORITIES].join('|')}`);
  }
  const required_skills = skillArray(obj, 'required_skills');
  if (required_skills.length === 0) {
    throw new ParseError('required_skills', 'must have at least 1 entry');
  }
  const nice_to_have_skills = skillArray(obj, 'nice_to_have_skills', /* allowEmpty */ true);
  const tech_stack = stringArray(obj, 'tech_stack');
  const domain = stringField(obj, 'domain', 1, 100);
  const yoe = obj['years_of_experience'];
  if (typeof yoe !== 'number' || yoe < 0 || yoe > 60) {
    throw new ParseError('years_of_experience', 'must be number in [0, 60]');
  }
  const must_haves = stringArray(obj, 'must_haves', true);
  const nice_to_haves = stringArray(obj, 'nice_to_haves', true);

  return {
    role_title,
    role_family: role_family_raw as RoleFamily,
    seniority: seniority_raw as Seniority,
    required_skills,
    nice_to_have_skills,
    tech_stack,
    domain,
    years_of_experience: yoe,
    must_haves,
    nice_to_haves,
  };
}

/**
 * Production parser: runs the LLM, validates, retries once on shape failure.
 * Tests: pass a fake `extract`.
 */
export async function parseJobDescription(
  jdText: string,
  extract: LlmExtractor,
): Promise<ParsedJobDescription> {
  if (!jdText || jdText.trim().length < 50) {
    throw new ParseError('$', 'JD text too short (minimum 50 chars)');
  }
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let raw: unknown;
    try {
      raw = await extract(jdText);
    } catch (err) {
      lastErr = err;
      continue;
    }
    try {
      return validateParsed(raw);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`extractor failed: ${String(lastErr)}`);
}

// ── helpers ──

function stringField(obj: Record<string, unknown>, key: string, min = 0, max = 1024): string {
  const v = obj[key];
  if (typeof v !== 'string') {
    throw new ParseError(key, 'must be string');
  }
  if (v.length < min || v.length > max) {
    throw new ParseError(key, `length must be in [${min}, ${max}]`);
  }
  return v;
}

function stringArray(obj: Record<string, unknown>, key: string, allowEmpty = false): string[] {
  const v = obj[key];
  if (!Array.isArray(v)) throw new ParseError(key, 'must be array');
  if (!allowEmpty && v.length === 0) {
    throw new ParseError(key, 'must have at least 1 entry');
  }
  for (let i = 0; i < v.length; i++) {
    if (typeof v[i] !== 'string') throw new ParseError(`${key}[${i}]`, 'must be string');
  }
  return v as string[];
}

function skillArray(
  obj: Record<string, unknown>,
  key: string,
  allowEmpty = false,
): Array<{ skill: string; weight: number }> {
  const v = obj[key];
  if (!Array.isArray(v)) throw new ParseError(key, 'must be array');
  if (!allowEmpty && v.length === 0) {
    throw new ParseError(key, 'must have at least 1 entry');
  }
  return v.map((entry, i) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new ParseError(`${key}[${i}]`, 'must be object');
    }
    const e = entry as Record<string, unknown>;
    if (typeof e['skill'] !== 'string' || (e['skill'] as string).length === 0) {
      throw new ParseError(`${key}[${i}].skill`, 'must be non-empty string');
    }
    if (
      typeof e['weight'] !== 'number' ||
      (e['weight'] as number) < 0 ||
      (e['weight'] as number) > 1
    ) {
      throw new ParseError(`${key}[${i}].weight`, 'must be number in [0, 1]');
    }
    return { skill: e['skill'] as string, weight: e['weight'] as number };
  });
}

import { describe, it, expect } from 'vitest';
import { parseJobDescription, validateParsed, ParseError } from '../src/parsing/jd-parser.js';

const VALID = {
  role_title: 'Senior Salesforce Developer',
  role_family: 'engineering',
  seniority: 'senior',
  required_skills: [
    { skill: 'Salesforce LWC', weight: 1.0 },
    { skill: 'Apex', weight: 0.95 },
  ],
  nice_to_have_skills: [{ skill: 'Health Cloud', weight: 0.5 }],
  tech_stack: ['Salesforce', 'JavaScript'],
  domain: 'BFSI',
  years_of_experience: 5,
  must_haves: ['LWC'],
  nice_to_haves: ['Marketing Cloud'],
};

describe('validateParsed — happy path', () => {
  it('accepts a complete valid JD', () => {
    const parsed = validateParsed(VALID);
    expect(parsed.role_title).toBe('Senior Salesforce Developer');
    expect(parsed.required_skills).toHaveLength(2);
  });

  it('accepts empty nice_to_have_skills array', () => {
    const parsed = validateParsed({ ...VALID, nice_to_have_skills: [] });
    expect(parsed.nice_to_have_skills).toEqual([]);
  });
});

describe('validateParsed — rejections', () => {
  it('rejects non-object', () => {
    expect(() => validateParsed('string')).toThrow(ParseError);
    expect(() => validateParsed(null)).toThrow(ParseError);
  });

  it('rejects unknown role_family', () => {
    expect(() => validateParsed({ ...VALID, role_family: 'wizard' })).toThrow(/role_family/);
  });

  it('rejects unknown seniority', () => {
    expect(() => validateParsed({ ...VALID, seniority: 'overlord' })).toThrow(/seniority/);
  });

  it('rejects empty required_skills', () => {
    expect(() => validateParsed({ ...VALID, required_skills: [] })).toThrow(/required_skills/);
  });

  it('rejects skill weight out of range', () => {
    expect(() =>
      validateParsed({
        ...VALID,
        required_skills: [{ skill: 'X', weight: 1.5 }],
      }),
    ).toThrow(/weight/);
  });

  it('rejects negative years_of_experience', () => {
    expect(() => validateParsed({ ...VALID, years_of_experience: -1 })).toThrow(
      /years_of_experience/,
    );
  });

  it('rejects missing required field', () => {
    const { role_title: _, ...incomplete } = VALID;
    expect(() => validateParsed(incomplete)).toThrow(/role_title/);
  });
});

describe('parseJobDescription — extractor injection', () => {
  it('returns valid result on first attempt', async () => {
    const extract = async (): Promise<unknown> => VALID;
    const out = await parseJobDescription(
      'A long enough JD text 1234567890 1234567890 1234567890',
      extract,
    );
    expect(out.role_title).toBe('Senior Salesforce Developer');
  });

  it('retries once on shape failure', async () => {
    let attempt = 0;
    const extract = async (): Promise<unknown> => {
      attempt++;
      if (attempt === 1) return { foo: 'bar' };
      return VALID;
    };
    const out = await parseJobDescription(
      'A long enough JD text 1234567890 1234567890 1234567890',
      extract,
    );
    expect(attempt).toBe(2);
    expect(out.role_title).toBe('Senior Salesforce Developer');
  });

  it('throws after 2 attempts of bad output', async () => {
    const extract = async (): Promise<unknown> => ({ broken: true });
    await expect(
      parseJobDescription('Long enough JD text 1234567890 1234567890 1234567890', extract),
    ).rejects.toBeInstanceOf(ParseError);
  });

  it('rejects too-short JD before calling extractor', async () => {
    let called = false;
    const extract = async (): Promise<unknown> => {
      called = true;
      return VALID;
    };
    await expect(parseJobDescription('short', extract)).rejects.toThrow(/JD text too short/);
    expect(called).toBe(false);
  });
});

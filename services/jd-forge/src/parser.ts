/**
 * Stage 1 — JD parsing per spec §3.1.
 *
 * v0 ships two implementations behind a common `JdParser` interface:
 *
 *   - `StubJdParser`   — deterministic shape inferred from a small
 *                        keyword dictionary; used in unit tests and in
 *                        local dev when ANTHROPIC_API_KEY is unset.
 *   - `AnthropicJdParser` — real implementation that calls the Anthropic
 *                        Messages API. Throws on construction if no key
 *                        is provided (gated by CTO-DELTA-jdforge-anthropic-deferred.md).
 *
 * Both implementations return the same `ParsedJd` shape so the orchestrator
 * is provider-agnostic.
 */

import type { ParsedJd, SkillExtract } from './types.js';

export interface JdParser {
  readonly id: string;
  parse(jdText: string): Promise<ParsedJd>;
}

const SENIORITY_RX: Array<{ rx: RegExp; level: ParsedJd['seniority'] }> = [
  { rx: /\b(principal|distinguished)\b/i, level: 'principal' },
  { rx: /\bstaff\b/i, level: 'staff' },
  { rx: /\b(senior|sr\.?|lead)\b/i, level: 'senior' },
  { rx: /\b(mid|intermediate|ii\b|iii\b)\b/i, level: 'mid' },
  { rx: /\b(junior|jr\.?|entry|graduate|fresher)\b/i, level: 'junior' },
];

const DOMAIN_RX: Array<{ rx: RegExp; domain: string }> = [
  { rx: /\b(salesforce|crm|service cloud)\b/i, domain: 'CRM' },
  { rx: /\b(banking|fintech|bfsi|payments?)\b/i, domain: 'BFSI' },
  { rx: /\b(retail|ecommerce|shopify|magento)\b/i, domain: 'Retail' },
  { rx: /\b(health|hipaa|pharma|epic|cerner)\b/i, domain: 'Healthcare' },
  { rx: /\b(insur|underwrit|claim)\b/i, domain: 'Insurance' },
];

const STOPWORDS = new Set([
  'we',
  'the',
  'and',
  'for',
  'with',
  'are',
  'will',
  'this',
  'that',
  'have',
  'work',
  'team',
  'role',
  'looking',
  'must',
  'should',
  'years',
  'experience',
  'requirements',
  'responsibilities',
  'about',
  'company',
  'job',
  'description',
  'job description',
]);

function dedupedSkills(skills: string[]): SkillExtract[] {
  const seen = new Map<string, number>();
  for (const s of skills) {
    const key = s.toLowerCase().trim();
    if (key.length === 0 || STOPWORDS.has(key)) continue;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  // Score by mentions; cap at 1.0
  const max = Math.max(1, ...seen.values());
  return Array.from(seen.entries())
    .map(([skill, count]) => ({ skill, weight: Math.min(1, 0.5 + (count / max) * 0.5) }))
    .sort((a, b) => b.weight - a.weight);
}

const TECH_TOKENS = [
  'salesforce',
  'apex',
  'soql',
  'lwc',
  'lightning web components',
  'java',
  'python',
  'typescript',
  'javascript',
  'react',
  'next.js',
  'node.js',
  'go',
  'rust',
  'kafka',
  'postgres',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
  'docker',
  'kubernetes',
  'aws',
  'gcp',
  'azure',
  'terraform',
  'ci/cd',
  'graphql',
  'rest',
  'grpc',
  'spring boot',
  'django',
  'flask',
  'express',
  'pytorch',
  'tensorflow',
];

export class StubJdParser implements JdParser {
  readonly id = 'stub';

  async parse(jdText: string): Promise<ParsedJd> {
    if (typeof jdText !== 'string' || jdText.trim().length === 0) {
      throw new Error('jdText is required');
    }
    const lower = jdText.toLowerCase();

    const seniority = SENIORITY_RX.find((s) => s.rx.test(lower))?.level ?? 'unknown';
    const domain = DOMAIN_RX.find((d) => d.rx.test(lower))?.domain ?? null;

    const techStack = TECH_TOKENS.filter((t) => lower.includes(t));
    const yearsMatch = lower.match(/(\d+)\s*\+?\s*years?/);
    const yearsOfExperience = yearsMatch?.[1] ? Number.parseInt(yearsMatch[1], 10) : null;

    const requiredSkills = dedupedSkills(techStack);
    // Naive title pull: first non-empty line truncated.
    const firstLine = (
      jdText.split(/\r?\n/).find((l) => l.trim().length > 0) ?? 'Untitled Role'
    ).trim();
    const roleTitle = firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine;

    const roleFamily = inferRoleFamily(lower);

    return {
      roleTitle,
      roleFamily,
      seniority,
      requiredSkills,
      niceToHaveSkills: [],
      techStack,
      domain,
      yearsOfExperience,
      mustHaves: requiredSkills.slice(0, 5).map((s) => s.skill),
      niceToHaves: [],
    };
  }
}

function inferRoleFamily(lower: string): string {
  if (/\b(devops|sre|reliability|infra)\b/.test(lower)) return 'devops';
  if (/\b(data|ml|ai|machine learning)\b/.test(lower)) return 'data';
  if (/\b(design|ux|ui|product designer)\b/.test(lower)) return 'design';
  if (/\b(product manager|pm\b)\b/.test(lower)) return 'product';
  if (/\b(marketing|growth|content)\b/.test(lower)) return 'marketing';
  if (/\b(sales|account|business development)\b/.test(lower)) return 'sales';
  return 'engineering';
}

export interface AnthropicJdParserOptions {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
  endpoint?: string;
  timeoutMs?: number;
}

interface AnthropicMessageContent {
  type: string;
  text?: string;
}

interface AnthropicMessageResponse {
  content?: AnthropicMessageContent[];
}

const DEFAULT_ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_ANTHROPIC_MODEL = 'claude-opus-4-7';

const PARSE_SYSTEM_PROMPT = `You are a job-description parser. Extract structured metadata as
JSON. Always return valid JSON matching this schema (no prose, no markdown):
{
  "roleTitle": string,
  "roleFamily": "engineering"|"data"|"design"|"product"|"marketing"|"sales"|"devops",
  "seniority": "junior"|"mid"|"senior"|"staff"|"principal"|"unknown",
  "requiredSkills": [{"skill": string, "weight": number 0-1}],
  "niceToHaveSkills": [{"skill": string, "weight": number 0-1}],
  "techStack": [string],
  "domain": string|null,
  "yearsOfExperience": number|null,
  "mustHaves": [string],
  "niceToHaves": [string]
}`;

export class AnthropicJdParser implements JdParser {
  readonly id = 'anthropic';
  private readonly apiKey: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(opts: AnthropicJdParserOptions) {
    if (!opts.apiKey) {
      throw new Error('AnthropicJdParser requires an apiKey — REQUEST ANTHROPIC_API_KEY from CEO');
    }
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? DEFAULT_ANTHROPIC_MODEL;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.endpoint = opts.endpoint ?? DEFAULT_ANTHROPIC_ENDPOINT;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
  }

  async parse(jdText: string): Promise<ParsedJd> {
    if (typeof jdText !== 'string' || jdText.trim().length === 0) {
      throw new Error('jdText is required');
    }
    const ctrl = new AbortController();
    const timer = setTimeout(
      () => ctrl.abort(new Error('parse request timed out')),
      this.timeoutMs,
    );
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system: PARSE_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: jdText }],
        }),
        signal: ctrl.signal,
      });
      if (!response.ok) {
        throw new Error(`anthropic ${response.status} ${response.statusText}`);
      }
      const payload = (await response.json()) as AnthropicMessageResponse;
      const text = (payload.content ?? [])
        .filter((c) => c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text as string)
        .join('');
      return parseJdJson(text);
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Exported for tests + for the AnthropicJdParser to share JSON-parsing logic. */
export function parseJdJson(raw: string): ParsedJd {
  const stripped = raw.trim().replace(/^```json\s*|\s*```$/g, '');
  const parsed = JSON.parse(stripped) as Partial<ParsedJd>;
  return {
    roleTitle: stringOr(parsed.roleTitle, 'Untitled Role'),
    roleFamily: stringOr(parsed.roleFamily, 'engineering'),
    seniority: (parsed.seniority as ParsedJd['seniority']) ?? 'unknown',
    requiredSkills: arrayOfSkills(parsed.requiredSkills),
    niceToHaveSkills: arrayOfSkills(parsed.niceToHaveSkills),
    techStack: arrayOfStrings(parsed.techStack),
    domain: typeof parsed.domain === 'string' ? parsed.domain : null,
    yearsOfExperience:
      typeof parsed.yearsOfExperience === 'number' ? parsed.yearsOfExperience : null,
    mustHaves: arrayOfStrings(parsed.mustHaves),
    niceToHaves: arrayOfStrings(parsed.niceToHaves),
  };
}

function stringOr(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.length > 0 ? v : fallback;
}
function arrayOfStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
}
function arrayOfSkills(v: unknown): SkillExtract[] {
  if (!Array.isArray(v)) return [];
  const out: SkillExtract[] = [];
  for (const item of v) {
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.skill !== 'string') continue;
    const weight = typeof obj.weight === 'number' ? clampWeight(obj.weight) : 0.5;
    out.push({ skill: obj.skill, weight });
  }
  return out;
}
function clampWeight(v: number): number {
  if (!Number.isFinite(v)) return 0.5;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

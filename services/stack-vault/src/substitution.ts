/**
 * Pure-logic body rewriting that injects forensic markers per
 * `infra/Anti-Leak-Engine-v0-Design.md` §3.
 *
 * Five markers (per `@qorium/leak-crawler::VariantMarkers`):
 *   1. variableSuffix       — append 2 hex chars to identifier names in code
 *   2. testValuePercent     — scale non-critical numeric test values
 *   3. synonymIndex         — adjective synonym swap in scenario prose
 *   4. commentStyle         — swap "// foo" with "/(star) foo (star)/"
 *   5. helperReorderParity  — reverse top-level helper function order
 *
 * The 5th marker (helperReorderParity) ships as a no-op in v0 because
 * safely reordering helpers needs AST-level dependency analysis — see
 * `infra/CTO-deltas/CTO-DELTA-stackvault-marker-substitution-deferred.md`
 * for the deferral note. Markers 1–4 are real and reversible in code.
 *
 * Substitution is **idempotent for a given (seed, master)**: replays
 * produce the same output, so the forensics step can compare a leaked
 * fragment to (master, vault) → derived variant deterministically.
 */

import type { VariantMarkers } from '@qorium/leak-crawler';

/** Reserved words / known-API identifiers we never rename. */
const NEVER_RENAME = new Set([
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'return',
  'function',
  'class',
  'const',
  'let',
  'var',
  'true',
  'false',
  'null',
  'undefined',
  'new',
  'this',
  'super',
  'import',
  'export',
  'from',
  'as',
  'in',
  'of',
  'try',
  'catch',
  'finally',
  'throw',
  'typeof',
  'instanceof',
  'void',
  'static',
  'public',
  'private',
  'protected',
  'interface',
  'type',
  'enum',
  'async',
  'await',
  'yield',
  'default',
  'extends',
  'implements',
  'console',
  'log',
  'error',
  'warn',
  'debug',
  'String',
  'Number',
  'Boolean',
  'Array',
  'Object',
  'Map',
  'Set',
  'Promise',
  'Math',
  'Date',
  'JSON',
  'RegExp',
  'main',
  'init',
  'def',
  'self',
  'lambda',
  'pass',
  'None',
  'True',
  'False',
  'print',
  'len',
  'range',
  'list',
  'dict',
  'tuple',
  'int',
  'float',
  'str',
  'public_static_void',
  'System',
  'out',
  'println',
]);

const IDENTIFIER_RX = /\b([a-z_][a-zA-Z0-9_]{2,})\b/g;
const NUMBER_RX = /(?<![A-Za-z_])(\d+(?:\.\d+)?)(?![A-Za-z_])/g;

/**
 * Apply marker #1: append the 2-char hex suffix to user-defined
 * identifiers in code blocks within the body. Skips fenced markdown
 * code blocks' language tag. Skips identifiers in NEVER_RENAME.
 */
export function applyVariableSuffix(text: string, suffix: string): string {
  if (!/^[0-9a-f]{2}$/i.test(suffix)) return text;
  return rewriteCodeBlocks(text, (code) =>
    code.replace(IDENTIFIER_RX, (m, name: string) => {
      if (NEVER_RENAME.has(name)) return m;
      // Avoid double-suffix on replays.
      if (new RegExp(`_${suffix}$`).test(name)) return m;
      return `${name}_${suffix}`;
    }),
  );
}

/**
 * Apply marker #2: scale numeric test-case values by `1 + percent/100`.
 * Operates on a structured list of test cases (the format the
 * orchestrator uses); strings inside test cases that look like
 * decimal numbers are rewritten in place.
 */
export function applyTestValuePerturbation(
  testCases: Array<Record<string, unknown>> | null,
  percent: number,
): Array<Record<string, unknown>> | null {
  if (!testCases || percent === 0) return testCases;
  const factor = 1 + percent / 100;
  return testCases.map((tc) =>
    mapStrings(tc, (s) =>
      s.replace(NUMBER_RX, (m, num: string) => {
        const n = Number.parseFloat(num);
        if (!Number.isFinite(n)) return m;
        // Preserve integer-vs-decimal shape.
        const scaled = n * factor;
        return num.includes('.')
          ? scaled.toFixed(num.split('.')[1]?.length ?? 2)
          : String(Math.round(scaled));
      }),
    ),
  );
}

const SYNONYM_TABLE: Record<string, string[]> = {
  fast: [
    'quick',
    'rapid',
    'speedy',
    'swift',
    'brisk',
    'expeditious',
    'prompt',
    'hasty',
    'fleet',
    'agile',
  ],
  large: [
    'big',
    'huge',
    'sizeable',
    'substantial',
    'massive',
    'vast',
    'great',
    'enormous',
    'immense',
    'considerable',
  ],
  small: [
    'tiny',
    'little',
    'minor',
    'compact',
    'modest',
    'slight',
    'limited',
    'petite',
    'diminutive',
    'minute',
  ],
  important: [
    'critical',
    'crucial',
    'vital',
    'essential',
    'key',
    'significant',
    'major',
    'pivotal',
    'central',
    'cardinal',
  ],
  good: [
    'fine',
    'solid',
    'sound',
    'capable',
    'reliable',
    'effective',
    'commendable',
    'adequate',
    'acceptable',
    'satisfactory',
  ],
  bad: [
    'poor',
    'inferior',
    'flawed',
    'weak',
    'subpar',
    'deficient',
    'lacking',
    'inadequate',
    'unsatisfactory',
    'mediocre',
  ],
  efficient: [
    'lean',
    'streamlined',
    'optimal',
    'thrifty',
    'economical',
    'productive',
    'effective',
    'tight',
    'frugal',
    'spare',
  ],
  simple: [
    'basic',
    'plain',
    'easy',
    'straightforward',
    'uncomplicated',
    'clear',
    'direct',
    'unfussy',
    'elementary',
    'modest',
  ],
  complex: [
    'intricate',
    'complicated',
    'elaborate',
    'involved',
    'detailed',
    'multifaceted',
    'compound',
    'sophisticated',
    'layered',
    'tangled',
  ],
};

/** Apply marker #3: synonym swap on adjectives in scenario prose. */
export function applySynonymRewrite(text: string, synonymIndex: number): string {
  if (synonymIndex < 0 || synonymIndex > 9) return text;
  return rewriteOutsideCodeBlocks(text, (prose) =>
    prose.replace(/\b([A-Za-z][a-z]+)\b/g, (m, word: string) => {
      const lower = word.toLowerCase();
      const synonyms = SYNONYM_TABLE[lower];
      if (!synonyms) return m;
      const replacement = synonyms[synonymIndex] ?? lower;
      return preserveCase(word, replacement);
    }),
  );
}

/** Apply marker #4: swap line-style and block-style comments in code blocks. */
export function applyCommentStyleSwap(text: string, style: 'cpp' | 'c'): string {
  return rewriteCodeBlocks(text, (code) => {
    if (style === 'cpp') {
      // Convert /* foo */ → // foo
      return code.replace(/\/\*\s?([^*\n][^*]*?)\s?\*\//g, '// $1');
    }
    // Convert // foo (to end of line) → /* foo */
    return code.replace(/\/\/\s?([^\n]+)/g, '/* $1 */');
  });
}

/**
 * Marker #5 — helperReorderParity: no-op in v0. AST-level dependency
 * analysis is the safe path; doing this regex-based risks breaking
 * cross-function references. Documented in CTO-DELTA #17.
 */
export function applyHelperReorder<T>(value: T, _parity: 0 | 1): T {
  return value;
}

export interface SubstitutionInputs {
  bodyMd: string;
  testCases: Array<Record<string, unknown>> | null;
  markers: VariantMarkers;
}

export interface SubstitutionOutputs {
  bodyMd: string;
  testCases: Array<Record<string, unknown>> | null;
  /** Which markers actually changed the output (true if anything was touched). */
  appliedMarkers: {
    variableSuffix: boolean;
    testValuePercent: boolean;
    synonymIndex: boolean;
    commentStyle: boolean;
    helperReorderParity: boolean;
  };
}

export function applyAllMarkers(inputs: SubstitutionInputs): SubstitutionOutputs {
  let body = inputs.bodyMd;
  const beforeBody = body;
  body = applyCommentStyleSwap(body, inputs.markers.commentStyle);
  const beforeSyn = body;
  body = applySynonymRewrite(body, inputs.markers.synonymIndex);
  const beforeSuffix = body;
  body = applyVariableSuffix(body, inputs.markers.variableSuffix);
  const newTestCases = applyTestValuePerturbation(
    inputs.testCases,
    inputs.markers.testValuePercent,
  );
  return {
    bodyMd: body,
    testCases: newTestCases,
    appliedMarkers: {
      variableSuffix: body !== beforeSuffix,
      testValuePercent: newTestCases !== inputs.testCases,
      synonymIndex: beforeSyn !== beforeBody ? body !== beforeSuffix : beforeSyn !== beforeBody,
      commentStyle: beforeSyn !== beforeBody,
      helperReorderParity: false,
    },
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const BT = String.fromCharCode(96);
const FENCE_RX = new RegExp('(' + BT + '{3}[a-zA-Z0-9_-]*\\n)([\\s\\S]*?)(\\n' + BT + '{3})', 'g');
const INLINE_CODE_RX = new RegExp('(' + BT + ')([^' + BT + '\\n]+?)(' + BT + ')', 'g');

function rewriteCodeBlocks(text: string, transform: (code: string) => string): string {
  let next = text.replace(
    FENCE_RX,
    (_m, open: string, body: string, close: string) => `${open}${transform(body)}${close}`,
  );
  next = next.replace(
    INLINE_CODE_RX,
    (_m, open: string, body: string, close: string) => `${open}${transform(body)}${close}`,
  );
  return next;
}

function rewriteOutsideCodeBlocks(text: string, transform: (prose: string) => string): string {
  const segments: string[] = [];
  let lastIdx = 0;
  const matches: Array<{ start: number; end: number; preserved: string }> = [];
  for (const m of text.matchAll(FENCE_RX)) {
    const start = m.index ?? 0;
    matches.push({ start, end: start + m[0].length, preserved: m[0] });
  }
  for (const m of text.matchAll(INLINE_CODE_RX)) {
    const start = m.index ?? 0;
    // Don't double-cover ranges already inside a fence.
    if (matches.some((mm) => mm.start <= start && mm.end >= start + m[0].length)) continue;
    matches.push({ start, end: start + m[0].length, preserved: m[0] });
  }
  matches.sort((a, b) => a.start - b.start);
  for (const seg of matches) {
    if (seg.start > lastIdx) segments.push(transform(text.slice(lastIdx, seg.start)));
    segments.push(seg.preserved);
    lastIdx = seg.end;
  }
  if (lastIdx < text.length) segments.push(transform(text.slice(lastIdx)));
  return segments.join('');
}

function mapStrings<T>(value: T, fn: (s: string) => string): T {
  if (typeof value === 'string') return fn(value) as unknown as T;
  if (Array.isArray(value))
    return (value as unknown[]).map((v) => mapStrings(v, fn)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = mapStrings(v, fn);
    }
    return out as unknown as T;
  }
  return value;
}

function preserveCase(source: string, replacement: string): string {
  if (source[0] && source[0] === source[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

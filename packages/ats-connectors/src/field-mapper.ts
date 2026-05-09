/**
 * ATS Connector Framework v0 — generic field mapper.
 *
 * Per spec §2.3 each adapter translates platform fields to the canonical
 * QOrium model. The mapper supports:
 *   - direct rename: `{ "candidate.email_address": "email" }`
 *   - dotted-path source resolution
 *   - default values
 *   - type coercion (string ↔ number, ISO date passthrough)
 *
 * Per-tenant overrides in `ats.connections.config_json.field_mappings`
 * layer on top of the adapter's defaults.
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'passthrough';

export interface FieldRule {
  /** Dotted path into the source object, e.g. "candidate.profile.email". */
  source: string;
  /** Default value when source is null/undefined; omit to surface null. */
  default?: unknown;
  /** Coercion to apply before writing the target. */
  type?: FieldType;
}

export type FieldMapping = Record<string, FieldRule | string>;

function getByPath(obj: unknown, path: string): unknown {
  if (obj === null || obj === undefined) return undefined;
  const segments = path.split('.');
  let cur: unknown = obj;
  for (const seg of segments) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

function coerce(value: unknown, type: FieldType | undefined): unknown {
  if (value === null || value === undefined) return value;
  switch (type) {
    case 'string':
      return typeof value === 'string' ? value : String(value);
    case 'number':
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const n = Number.parseFloat(value);
        return Number.isNaN(n) ? null : n;
      }
      return null;
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
      return Boolean(value);
    case 'date':
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'string') {
        const ms = Date.parse(value);
        return Number.isNaN(ms) ? null : new Date(ms).toISOString();
      }
      return null;
    case 'passthrough':
    case undefined:
      return value;
  }
}

/**
 * Apply `mapping` to `source` and return a new object keyed by mapping
 * targets. A string value in the mapping is shorthand for
 * `{ source: <string>, type: 'passthrough' }`.
 */
export function applyFieldMapping(source: unknown, mapping: FieldMapping): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [target, ruleRaw] of Object.entries(mapping)) {
    const rule: FieldRule =
      typeof ruleRaw === 'string' ? { source: ruleRaw, type: 'passthrough' } : ruleRaw;
    const raw = getByPath(source, rule.source);
    const coerced = coerce(raw, rule.type);
    if (coerced === null || coerced === undefined) {
      out[target] = rule.default !== undefined ? rule.default : null;
    } else {
      out[target] = coerced;
    }
  }
  return out;
}

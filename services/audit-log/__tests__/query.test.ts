import { describe, expect, it } from 'vitest';
import { buildListSql, buildSummarySql, parseListInputs } from '../src/query.js';

const TENANT = '11111111-2222-3333-4444-555555555555';

describe('parseListInputs', () => {
  it('clamps limit to maxLimit', () => {
    const out = parseListInputs({ tenantId: TENANT, limit: 9999, defaultLimit: 50, maxLimit: 200 });
    expect(out.limit).toBe(200);
  });
  it('falls back to defaultLimit when omitted', () => {
    const out = parseListInputs({ tenantId: TENANT, defaultLimit: 50, maxLimit: 200 });
    expect(out.limit).toBe(50);
    expect(out.offset).toBe(0);
  });
  it('rejects malformed start_date', () => {
    const out = parseListInputs({
      tenantId: TENANT,
      startDate: 'yesterday',
      defaultLimit: 50,
      maxLimit: 200,
    });
    expect(out.errors).toContain('start_date is not a valid ISO-8601 timestamp');
  });
  it('rejects start_date >= end_date', () => {
    const out = parseListInputs({
      tenantId: TENANT,
      startDate: '2026-05-02T00:00:00Z',
      endDate: '2026-05-01T00:00:00Z',
      defaultLimit: 50,
      maxLimit: 200,
    });
    expect(out.errors).toContain('start_date must be before end_date');
  });
});

describe('buildListSql', () => {
  it('always scopes by tenant_id and orders by occurred_at DESC', () => {
    const built = buildListSql({ tenantId: TENANT, limit: 50, offset: 0 });
    expect(built.sql).toContain('tenant_id = $1');
    expect(built.sql).toContain('ORDER BY occurred_at DESC');
    expect(built.params[0]).toBe(TENANT);
  });
  it('supports filtering by action + resourceType + actorId', () => {
    const built = buildListSql({
      tenantId: TENANT,
      action: 'question.viewed',
      resourceType: 'question',
      actorId: '99999999-aaaa-bbbb-cccc-dddddddddddd',
      limit: 10,
      offset: 5,
    });
    expect(built.sql).toContain('event_type = $');
    expect(built.sql).toContain('entity_type = $');
    expect(built.sql).toContain('actor_id = $');
    expect(built.params).toContain('question.viewed');
    expect(built.params).toContain('question');
    expect(built.params[built.params.length - 2]).toBe(10);
    expect(built.params[built.params.length - 1]).toBe(5);
  });
  it('emits matching count SQL with the same WHERE clause params', () => {
    const built = buildListSql({
      tenantId: TENANT,
      action: 'security.leak_detected',
      limit: 100,
      offset: 0,
    });
    expect(built.countSql).toContain('SELECT COUNT(*)');
    expect(built.countParams).toEqual([TENANT, 'security.leak_detected']);
  });
  it('handles a date range', () => {
    const built = buildListSql({
      tenantId: TENANT,
      startDate: '2026-05-01T00:00:00Z',
      endDate: '2026-06-01T00:00:00Z',
      limit: 50,
      offset: 0,
    });
    expect(built.sql).toContain('occurred_at >= $2');
    expect(built.sql).toContain('occurred_at < $3');
  });
});

describe('buildSummarySql', () => {
  it('groups by event_type and clamps topN', () => {
    const built = buildSummarySql({ tenantId: TENANT, topN: 9999 });
    expect(built.sql).toContain('GROUP BY event_type');
    expect(built.params[built.params.length - 1]).toBe(50);
  });
  it('falls back to default topN bound', () => {
    const built = buildSummarySql({ tenantId: TENANT, topN: 5 });
    expect(built.params[built.params.length - 1]).toBe(5);
  });
});

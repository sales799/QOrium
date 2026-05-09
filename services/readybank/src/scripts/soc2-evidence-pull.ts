#!/usr/bin/env node
/**
 * Sprint 5.1 — SOC 2 evidence-pull script (skeleton).
 *
 * Generates the quarterly evidence package described in
 * `governance/soc2/evidence-collection.md`. Reads from `audit.events`
 * and subordinate tables; writes a single JSON document.
 *
 * Usage:
 *   ts-node soc2-evidence-pull.ts --start 2026-01-01 --end 2026-03-31 --out /tmp/q1.json
 *
 * v0 ships the SQL queries + JSON shape. Sprint 5.1.1 adds the
 * cron schedule + S3 upload + Object-Lock immutability.
 *
 * The script is purely read-only and tenant-agnostic at the org level
 * (auditors review across tenants); when invoked with --tenant <uuid>
 * it filters to a single customer.
 */

import { resolveDatabaseUrl, createPool } from '@qorium/db';

interface Args {
  start: string;
  end: string;
  out: string;
  tenantId: string | undefined;
}

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | undefined => {
    const idx = argv.indexOf(`--${name}`);
    if (idx === -1 || idx === argv.length - 1) return undefined;
    return argv[idx + 1];
  };
  const start = get('start');
  const end = get('end');
  const out = get('out');
  const tenantId = get('tenant');
  if (!start || !end || !out) {
    throw new Error('usage: --start YYYY-MM-DD --end YYYY-MM-DD --out <path> [--tenant <uuid>]');
  }
  if (Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end))) {
    throw new Error('--start and --end must be valid ISO dates');
  }
  if (Date.parse(start) >= Date.parse(end)) {
    throw new Error('--start must be before --end');
  }
  return { start, end, out, tenantId };
}

interface AuditCategoryCounts {
  auth: number;
  leak: number;
  api_key_rotation: number;
  stack_vault: number;
  compliance: number;
  other: number;
}

interface EvidencePackage {
  window: { start: string; end: string };
  generated_at: string;
  scope: { tenant_id: string | null };
  audit_summary: {
    total_events: number;
    by_category: AuditCategoryCounts;
  };
  api_keys: {
    total_active: number;
    rotated_in_window: number;
    expired_revoked: number;
  };
  migrations_applied: string[];
  hash_chain_verifications: {
    tenants_verified: number;
    breaks_detected: number;
    unmaterialized_rows: number;
  };
}

const CATEGORY_PREFIXES: Array<{ prefix: string; bucket: keyof AuditCategoryCounts }> = [
  { prefix: 'auth.', bucket: 'auth' },
  { prefix: 'leak.', bucket: 'leak' },
  { prefix: 'api_key.', bucket: 'api_key_rotation' },
  { prefix: 'stack_vault.', bucket: 'stack_vault' },
  { prefix: 'compliance.', bucket: 'compliance' },
];

export function classifyEventType(eventType: string): keyof AuditCategoryCounts {
  for (const c of CATEGORY_PREFIXES) {
    if (eventType.startsWith(c.prefix)) return c.bucket;
  }
  return 'other';
}

interface AuditCountRow {
  event_type: string;
  n: string;
}

export async function pullEvidence(
  pool: import('@qorium/db').Pool,
  args: Args,
): Promise<EvidencePackage> {
  const tenantClause = args.tenantId ? 'AND tenant_id = $3' : '';
  const params: unknown[] = [args.start, args.end];
  if (args.tenantId) params.push(args.tenantId);

  const auditCounts = await pool.query<AuditCountRow>(
    `SELECT event_type, COUNT(*)::text AS n
       FROM audit.events
      WHERE occurred_at >= $1 AND occurred_at <= $2 ${tenantClause}
      GROUP BY event_type`,
    params,
  );

  const by_category: AuditCategoryCounts = {
    auth: 0,
    leak: 0,
    api_key_rotation: 0,
    stack_vault: 0,
    compliance: 0,
    other: 0,
  };
  let total_events = 0;
  for (const row of auditCounts.rows) {
    const n = Number.parseInt(row.n, 10);
    total_events += n;
    by_category[classifyEventType(row.event_type)] += n;
  }

  // API key activity is org-wide (no tenant scope at this query level).
  const apiKey = await pool.query<{
    total_active: string;
    rotated_in_window: string;
    expired_revoked: string;
  }>(
    `SELECT
        (SELECT COUNT(*)::text FROM app.api_keys
          WHERE revoked_at IS NULL
            AND (expires_at IS NULL OR expires_at > NOW())) AS total_active,
        (SELECT COUNT(*)::text FROM audit.events
          WHERE event_type = 'api_key.rotated'
            AND occurred_at >= $1 AND occurred_at <= $2) AS rotated_in_window,
        (SELECT COUNT(*)::text FROM app.api_keys
          WHERE revoked_at >= $1 AND revoked_at <= $2) AS expired_revoked`,
    [args.start, args.end],
  );
  const apiKeyRow = apiKey.rows[0] ?? {
    total_active: '0',
    rotated_in_window: '0',
    expired_revoked: '0',
  };

  // Migrations: read public.pgmigrations (the runner's tracking table).
  const migrations = await pool.query<{ name: string }>(
    `SELECT name FROM public.pgmigrations
      WHERE run_on >= $1 AND run_on <= $2
      ORDER BY id ASC`,
    [args.start, args.end],
  );

  return {
    window: { start: args.start, end: args.end },
    generated_at: new Date().toISOString(),
    scope: { tenant_id: args.tenantId ?? null },
    audit_summary: { total_events, by_category },
    api_keys: {
      total_active: Number.parseInt(apiKeyRow.total_active, 10),
      rotated_in_window: Number.parseInt(apiKeyRow.rotated_in_window, 10),
      expired_revoked: Number.parseInt(apiKeyRow.expired_revoked, 10),
    },
    migrations_applied: migrations.rows.map((r) => r.name),
    // Hash-chain verifications: shipped in Sprint 4.4.3 GET /v1/audit/verify.
    // The script could call verifyAuditChain directly per tenant, but doing
    // so requires walking every tenant's chain — out of scope for v0.
    // Sprint 5.1.1 wires this in via a parallel per-tenant query.
    hash_chain_verifications: {
      tenants_verified: 0,
      breaks_detected: 0,
      unmaterialized_rows: 0,
    },
  };
}

// Top-level invocation guard so `import` from tests doesn't run main().
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const url = resolveDatabaseUrl();
  const pool = createPool({ connectionString: url });
  try {
    const evidence = await pullEvidence(pool, args);
    const fs = await import('node:fs/promises');
    await fs.writeFile(args.out, JSON.stringify(evidence, null, 2), 'utf8');
    process.stdout.write(`wrote ${args.out}\n`);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && /soc2-evidence-pull/.test(process.argv[1])) {
  main().catch((err: unknown) => {
    process.stderr.write(String(err) + '\n');
    process.exit(1);
  });
}

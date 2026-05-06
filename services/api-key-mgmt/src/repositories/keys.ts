import type { Pool } from '@qorium/db';

export interface ApiKeyRecord {
  id: string;
  tenantId: string;
  name: string | null;
  prefix: string;
  scopes: string[];
  rateLimitPerMin: number;
  rateLimitBurst: number;
  rotationDueAt: string | null;
  lastRotatedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

interface RawRow {
  id: string;
  tenant_id: string;
  name: string | null;
  prefix: string;
  scopes: string[];
  rate_limit_per_min: number;
  rate_limit_burst: number;
  rotation_due_at: Date | null;
  last_rotated_at: Date | null;
  expires_at: Date | null;
  revoked_at: Date | null;
  created_at: Date;
}

const SELECT = `
  SELECT id, tenant_id, name, prefix, scopes, rate_limit_per_min,
         rate_limit_burst, rotation_due_at, last_rotated_at,
         expires_at, revoked_at, created_at
    FROM app.api_keys
`;

function toRow(r: RawRow): ApiKeyRecord {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    name: r.name,
    prefix: r.prefix,
    scopes: r.scopes,
    rateLimitPerMin: r.rate_limit_per_min,
    rateLimitBurst: r.rate_limit_burst,
    rotationDueAt: r.rotation_due_at?.toISOString() ?? null,
    lastRotatedAt: r.last_rotated_at?.toISOString() ?? null,
    expiresAt: r.expires_at?.toISOString() ?? null,
    revokedAt: r.revoked_at?.toISOString() ?? null,
    createdAt: r.created_at.toISOString(),
  };
}

export interface InsertKeyInput {
  tenantId: string;
  name: string | null;
  prefix: string;
  hashedKey: string;
  scopes: string[];
  rateLimitPerMin: number;
  rateLimitBurst: number;
  rotationDueAt: Date;
  expiresAt: Date | null;
  metadata?: Record<string, unknown>;
}

export async function insertKey(pool: Pool, input: InsertKeyInput): Promise<ApiKeyRecord> {
  const result = await pool.query<RawRow>(
    `INSERT INTO app.api_keys
       (tenant_id, name, prefix, hashed_key, scopes, rate_limit_per_min,
        rate_limit_burst, rotation_due_at, expires_at, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, tenant_id, name, prefix, scopes, rate_limit_per_min,
               rate_limit_burst, rotation_due_at, last_rotated_at,
               expires_at, revoked_at, created_at`,
    [
      input.tenantId,
      input.name,
      input.prefix,
      input.hashedKey,
      input.scopes,
      input.rateLimitPerMin,
      input.rateLimitBurst,
      input.rotationDueAt,
      input.expiresAt,
      input.metadata ?? {},
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('insertKey: insert returned no row');
  return toRow(row);
}

export async function listKeys(
  pool: Pool,
  tenantId: string,
  opts: { includeRevoked?: boolean } = {},
): Promise<ApiKeyRecord[]> {
  const where = opts.includeRevoked ? 'tenant_id = $1' : 'tenant_id = $1 AND revoked_at IS NULL';
  const result = await pool.query<RawRow>(`${SELECT} WHERE ${where} ORDER BY created_at DESC`, [
    tenantId,
  ]);
  return result.rows.map(toRow);
}

export async function revokeKey(
  pool: Pool,
  tenantId: string,
  id: string,
): Promise<ApiKeyRecord | null> {
  const result = await pool.query<RawRow>(
    `UPDATE app.api_keys SET revoked_at = NOW()
      WHERE tenant_id = $1 AND id = $2 AND revoked_at IS NULL
      RETURNING id, tenant_id, name, prefix, scopes, rate_limit_per_min,
                rate_limit_burst, rotation_due_at, last_rotated_at,
                expires_at, revoked_at, created_at`,
    [tenantId, id],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function listKeysDueForRotation(pool: Pool, cutoff: Date): Promise<ApiKeyRecord[]> {
  const result = await pool.query<RawRow>(
    `${SELECT} WHERE revoked_at IS NULL AND rotation_due_at IS NOT NULL
                AND rotation_due_at <= $1
       ORDER BY rotation_due_at ASC`,
    [cutoff],
  );
  return result.rows.map(toRow);
}

import type { Pool } from '@qorium/db';

export interface SecretRotationRow {
  id: string;
  resourceKey: string;
  resourceType: string;
  owner: string;
  rotationPolicyDays: number;
  lastRotatedAt: string | null;
  lastRotatedBy: string | null;
  nextRotationDue: string;
  status: string;
  attemptCount: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface RawRow {
  id: string;
  resource_key: string;
  resource_type: string;
  owner: string;
  rotation_policy_days: number;
  last_rotated_at: Date | null;
  last_rotated_by: string | null;
  next_rotation_due: Date;
  status: string;
  attempt_count: number;
  last_attempt_at: Date | null;
  last_error: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

const SELECT = `
  SELECT id, resource_key, resource_type, owner, rotation_policy_days,
         last_rotated_at, last_rotated_by, next_rotation_due, status,
         attempt_count, last_attempt_at, last_error, metadata,
         created_at, updated_at
    FROM app.secret_rotations
`;

function toRow(r: RawRow): SecretRotationRow {
  return {
    id: r.id,
    resourceKey: r.resource_key,
    resourceType: r.resource_type,
    owner: r.owner,
    rotationPolicyDays: r.rotation_policy_days,
    lastRotatedAt: r.last_rotated_at?.toISOString() ?? null,
    lastRotatedBy: r.last_rotated_by,
    nextRotationDue: r.next_rotation_due.toISOString(),
    status: r.status,
    attemptCount: r.attempt_count,
    lastAttemptAt: r.last_attempt_at?.toISOString() ?? null,
    lastError: r.last_error,
    metadata: r.metadata ?? {},
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export async function listDueOrSoon(pool: Pool, cutoff: Date): Promise<SecretRotationRow[]> {
  const result = await pool.query<RawRow>(
    `${SELECT}
      WHERE status != 'paused'
        AND next_rotation_due <= $1
      ORDER BY next_rotation_due ASC`,
    [cutoff],
  );
  return result.rows.map(toRow);
}

export async function listAll(pool: Pool): Promise<SecretRotationRow[]> {
  const result = await pool.query<RawRow>(`${SELECT} ORDER BY next_rotation_due ASC`);
  return result.rows.map(toRow);
}

export async function markStatus(
  pool: Pool,
  id: string,
  next: { status: string; nextRotationDue?: Date; lastError?: string | null },
): Promise<SecretRotationRow | null> {
  const result = await pool.query<RawRow>(
    `UPDATE app.secret_rotations
        SET status = $1,
            next_rotation_due = COALESCE($2, next_rotation_due),
            last_error = $3,
            last_attempt_at = NOW(),
            updated_at = NOW()
      WHERE id = $4
      RETURNING id, resource_key, resource_type, owner, rotation_policy_days,
                last_rotated_at, last_rotated_by, next_rotation_due, status,
                attempt_count, last_attempt_at, last_error, metadata,
                created_at, updated_at`,
    [next.status, next.nextRotationDue ?? null, next.lastError ?? null, id],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function markRotated(
  pool: Pool,
  id: string,
  next: { newDueDate: Date; rotatedBy: string },
): Promise<SecretRotationRow | null> {
  const result = await pool.query<RawRow>(
    `UPDATE app.secret_rotations
        SET status = 'scheduled',
            next_rotation_due = $1,
            last_rotated_at = NOW(),
            last_rotated_by = $2,
            attempt_count = 0,
            last_error = NULL,
            last_attempt_at = NOW(),
            updated_at = NOW()
      WHERE id = $3
      RETURNING id, resource_key, resource_type, owner, rotation_policy_days,
                last_rotated_at, last_rotated_by, next_rotation_due, status,
                attempt_count, last_attempt_at, last_error, metadata,
                created_at, updated_at`,
    [next.newDueDate, next.rotatedBy, id],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function emitLog(
  pool: Pool,
  rotationId: string,
  event: string,
  payload: unknown = {},
): Promise<void> {
  await pool.query(
    `INSERT INTO app.secret_rotation_log (rotation_id, event, payload)
     VALUES ($1, $2, $3)`,
    [rotationId, event, payload],
  );
}

/**
 * `app.stack_vaults` reader. Resolves a tenant_id → vault row.
 */

import type { Pool } from '@qorium/db';

export interface VaultRow {
  id: string;
  tenantId: string;
  tier: 'department' | 'enterprise' | 'group';
  librarySize: number;
  watermarkSecret: string;
  status: 'provisioning' | 'active' | 'suspended' | 'churned';
  contractStartDate: string | null;
  contractEndDate: string | null;
  refreshNewPerQuarter: number;
  refreshRetiredPerQuarter: number;
}

interface VaultRawRow {
  id: string;
  tenant_id: string;
  tier: VaultRow['tier'];
  library_size: number;
  watermark_secret: string;
  status: VaultRow['status'];
  contract_start_date: Date | null;
  contract_end_date: Date | null;
  refresh_new_per_quarter: number;
  refresh_retired_per_quarter: number;
}

function toRow(r: VaultRawRow): VaultRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    tier: r.tier,
    librarySize: r.library_size,
    watermarkSecret: r.watermark_secret,
    status: r.status,
    contractStartDate: r.contract_start_date?.toISOString().slice(0, 10) ?? null,
    contractEndDate: r.contract_end_date?.toISOString().slice(0, 10) ?? null,
    refreshNewPerQuarter: r.refresh_new_per_quarter,
    refreshRetiredPerQuarter: r.refresh_retired_per_quarter,
  };
}

export async function getVaultByTenant(pool: Pool, tenantId: string): Promise<VaultRow | null> {
  const result = await pool.query<VaultRawRow>(
    `SELECT id, tenant_id, tier, library_size, watermark_secret, status,
            contract_start_date, contract_end_date,
            refresh_new_per_quarter, refresh_retired_per_quarter
       FROM app.stack_vaults
      WHERE tenant_id = $1
      LIMIT 1`,
    [tenantId],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export interface VaultPublicView {
  id: string;
  tenantId: string;
  tier: VaultRow['tier'];
  librarySize: number;
  status: VaultRow['status'];
  contractStartDate: string | null;
  contractEndDate: string | null;
  refresh: { newPerQuarter: number; retiredPerQuarter: number };
}

/** Strips the `watermark_secret` from a vault row before exposing to the API. */
export function toPublicView(row: VaultRow): VaultPublicView {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tier: row.tier,
    librarySize: row.librarySize,
    status: row.status,
    contractStartDate: row.contractStartDate,
    contractEndDate: row.contractEndDate,
    refresh: {
      newPerQuarter: row.refreshNewPerQuarter,
      retiredPerQuarter: row.refreshRetiredPerQuarter,
    },
  };
}

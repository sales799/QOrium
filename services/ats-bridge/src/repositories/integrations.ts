/**
 * Integration + webhook-log readers/writers per migration 0009.
 *
 * Token decryption is the deployment's responsibility — these helpers
 * surface the cipher fields verbatim. The bridge service decrypts at
 * the use site (with whatever KMS adapter prod settings provide) so we
 * never accidentally log plaintext credentials.
 */

import type { Pool } from '@qorium/db';
import type { AtsPlatform, IntegrationCredentials } from '@qorium/ats-connectors';

export interface IntegrationRow {
  id: string;
  tenantId: string;
  atsPlatform: AtsPlatform;
  status: 'pending' | 'active' | 'auth_required' | 'degraded' | 'suspended';
  sandboxMode: boolean;
  accessTokenCipher: string | null;
  refreshTokenCipher: string | null;
  apiKeyCipher: string | null;
  webhookSecretCipher: string | null;
  tenantConfig: Record<string, unknown>;
}

interface IntegrationRawRow {
  id: string;
  tenant_id: string;
  ats_platform: AtsPlatform;
  status: IntegrationRow['status'];
  sandbox_mode: boolean;
  access_token_cipher: string | null;
  refresh_token_cipher: string | null;
  api_key_cipher: string | null;
  webhook_secret_cipher: string | null;
  tenant_config: Record<string, unknown> | null;
}

function toRow(r: IntegrationRawRow): IntegrationRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    atsPlatform: r.ats_platform,
    status: r.status,
    sandboxMode: r.sandbox_mode,
    accessTokenCipher: r.access_token_cipher,
    refreshTokenCipher: r.refresh_token_cipher,
    apiKeyCipher: r.api_key_cipher,
    webhookSecretCipher: r.webhook_secret_cipher,
    tenantConfig: r.tenant_config ?? {},
  };
}

const SELECT_INTEGRATION = `
  SELECT id, tenant_id, ats_platform, status, sandbox_mode,
         access_token_cipher, refresh_token_cipher, api_key_cipher,
         webhook_secret_cipher, tenant_config
    FROM app.ats_integrations
`;

export async function getIntegrationByTenantPlatform(
  pool: Pool,
  tenantId: string,
  platform: AtsPlatform,
): Promise<IntegrationRow | null> {
  const result = await pool.query<IntegrationRawRow>(
    `${SELECT_INTEGRATION} WHERE tenant_id = $1 AND ats_platform = $2 LIMIT 1`,
    [tenantId, platform],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function getIntegrationById(
  pool: Pool,
  integrationId: string,
): Promise<IntegrationRow | null> {
  const result = await pool.query<IntegrationRawRow>(
    `${SELECT_INTEGRATION} WHERE id = $1 LIMIT 1`,
    [integrationId],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

/**
 * Pure helper: trivial pass-through "decryption" used by tests and dev.
 * Production deployments pass a real KMS-backed decoder.
 */
export type CipherDecoder = (cipher: string) => string;

export function plaintextDecoder(cipher: string): string {
  return cipher;
}

export function toCredentials(
  row: IntegrationRow,
  decode: CipherDecoder = plaintextDecoder,
): IntegrationCredentials {
  const out: IntegrationCredentials = {
    tenantConfig: row.tenantConfig,
  };
  if (row.accessTokenCipher) out.accessToken = decode(row.accessTokenCipher);
  if (row.refreshTokenCipher) out.refreshToken = decode(row.refreshTokenCipher);
  if (row.apiKeyCipher) out.apiKey = decode(row.apiKeyCipher);
  if (row.webhookSecretCipher) out.webhookSecret = decode(row.webhookSecretCipher);
  return out;
}

/** Insert a webhook log row. Returns true if newly recorded, false on duplicate. */
export async function recordWebhook(
  pool: Pool,
  input: {
    integrationId: string;
    atsPlatform: AtsPlatform;
    idempotencyKey: string;
    eventType: string;
    signatureValid: boolean;
    payload: unknown;
  },
): Promise<{ inserted: boolean; logId: string | null }> {
  const insert = await pool.query<{ id: string }>(
    `INSERT INTO app.ats_webhook_log
       (integration_id, ats_platform, idempotency_key, event_type,
        signature_valid, status, payload)
     VALUES ($1, $2, $3, $4, $5,
             CASE WHEN $5 THEN 'received' ELSE 'failed' END,
             $6::jsonb)
     ON CONFLICT (integration_id, idempotency_key) DO NOTHING
     RETURNING id`,
    [
      input.integrationId,
      input.atsPlatform,
      input.idempotencyKey,
      input.eventType,
      input.signatureValid,
      JSON.stringify(input.payload),
    ],
  );
  if ((insert.rowCount ?? 0) === 0) {
    return { inserted: false, logId: null };
  }
  return { inserted: true, logId: insert.rows[0]?.id ?? null };
}

export async function markWebhookProcessed(
  pool: Pool,
  logId: string,
  responseStatus: number,
  errorMessage: string | null = null,
): Promise<void> {
  await pool.query(
    `UPDATE app.ats_webhook_log
        SET status = CASE WHEN $1 THEN 'processed' ELSE 'failed' END,
            response_status = $2,
            error_message = $3,
            processed_at = NOW()
      WHERE id = $4`,
    [errorMessage === null && responseStatus < 400, responseStatus, errorMessage, logId],
  );
}

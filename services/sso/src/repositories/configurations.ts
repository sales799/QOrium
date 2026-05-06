import type { Pool } from '@qorium/db';

export type SsoProtocol = 'saml' | 'oidc';
export type SsoIdpType =
  | 'okta'
  | 'azure_ad'
  | 'google_workspace'
  | 'ping'
  | 'jumpcloud'
  | 'onelogin'
  | 'custom';
export type SsoStatus = 'draft' | 'test_mode' | 'active' | 'disabled';

export interface SsoConfigRow {
  id: string;
  tenantId: string;
  protocol: SsoProtocol;
  idpType: SsoIdpType;
  metadataUrl: string | null;
  entityId: string | null;
  ssoEndpointUrl: string | null;
  sloEndpointUrl: string | null;
  idpCertificate: string | null;
  oidcIssuer: string | null;
  oidcClientId: string | null;
  attributeMapping: Record<string, unknown>;
  status: SsoStatus;
  createdAt: string;
  updatedAt: string;
}

interface RawRow {
  id: string;
  tenant_id: string;
  protocol: SsoProtocol;
  idp_type: SsoIdpType;
  metadata_url: string | null;
  entity_id: string | null;
  sso_endpoint_url: string | null;
  slo_endpoint_url: string | null;
  idp_certificate: string | null;
  oidc_issuer: string | null;
  oidc_client_id: string | null;
  attribute_mapping: Record<string, unknown> | null;
  status: SsoStatus;
  created_at: Date;
  updated_at: Date;
}

const SELECT = `
  SELECT id, tenant_id, protocol, idp_type, metadata_url, entity_id,
         sso_endpoint_url, slo_endpoint_url, idp_certificate, oidc_issuer,
         oidc_client_id, attribute_mapping, status, created_at, updated_at
    FROM sso.configurations
`;

function toRow(r: RawRow): SsoConfigRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    protocol: r.protocol,
    idpType: r.idp_type,
    metadataUrl: r.metadata_url,
    entityId: r.entity_id,
    ssoEndpointUrl: r.sso_endpoint_url,
    sloEndpointUrl: r.slo_endpoint_url,
    idpCertificate: r.idp_certificate,
    oidcIssuer: r.oidc_issuer,
    oidcClientId: r.oidc_client_id,
    attributeMapping: r.attribute_mapping ?? {},
    status: r.status,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export async function getConfigByTenantId(
  pool: Pool,
  tenantId: string,
): Promise<SsoConfigRow | null> {
  const result = await pool.query<RawRow>(`${SELECT} WHERE tenant_id = $1 LIMIT 1`, [tenantId]);
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function getConfigById(pool: Pool, id: string): Promise<SsoConfigRow | null> {
  const result = await pool.query<RawRow>(`${SELECT} WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export interface UpsertSsoConfigInput {
  tenantId: string;
  protocol: SsoProtocol;
  idpType: SsoIdpType;
  metadataUrl?: string | null;
  entityId?: string | null;
  ssoEndpointUrl?: string | null;
  sloEndpointUrl?: string | null;
  idpCertificate?: string | null;
  oidcIssuer?: string | null;
  oidcClientId?: string | null;
  oidcClientSecret?: string | null;
  attributeMapping?: Record<string, unknown>;
  status?: SsoStatus;
}

export async function upsertConfig(pool: Pool, input: UpsertSsoConfigInput): Promise<SsoConfigRow> {
  const result = await pool.query<RawRow>(
    `INSERT INTO sso.configurations
       (tenant_id, protocol, idp_type, metadata_url, entity_id, sso_endpoint_url,
        slo_endpoint_url, idp_certificate, oidc_issuer, oidc_client_id,
        oidc_client_secret_cipher, attribute_mapping, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (tenant_id) DO UPDATE SET
       protocol = EXCLUDED.protocol,
       idp_type = EXCLUDED.idp_type,
       metadata_url = EXCLUDED.metadata_url,
       entity_id = EXCLUDED.entity_id,
       sso_endpoint_url = EXCLUDED.sso_endpoint_url,
       slo_endpoint_url = EXCLUDED.slo_endpoint_url,
       idp_certificate = EXCLUDED.idp_certificate,
       oidc_issuer = EXCLUDED.oidc_issuer,
       oidc_client_id = EXCLUDED.oidc_client_id,
       oidc_client_secret_cipher = COALESCE(EXCLUDED.oidc_client_secret_cipher,
                                            sso.configurations.oidc_client_secret_cipher),
       attribute_mapping = EXCLUDED.attribute_mapping,
       status = EXCLUDED.status,
       updated_at = NOW()
     RETURNING id, tenant_id, protocol, idp_type, metadata_url, entity_id,
               sso_endpoint_url, slo_endpoint_url, idp_certificate, oidc_issuer,
               oidc_client_id, attribute_mapping, status, created_at, updated_at`,
    [
      input.tenantId,
      input.protocol,
      input.idpType,
      input.metadataUrl ?? null,
      input.entityId ?? null,
      input.ssoEndpointUrl ?? null,
      input.sloEndpointUrl ?? null,
      input.idpCertificate ?? null,
      input.oidcIssuer ?? null,
      input.oidcClientId ?? null,
      input.oidcClientSecret ?? null,
      input.attributeMapping ?? {},
      input.status ?? 'draft',
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('upsertConfig: insert returned no row');
  return toRow(row);
}

export async function setStatus(
  pool: Pool,
  tenantId: string,
  status: SsoStatus,
): Promise<SsoConfigRow | null> {
  const result = await pool.query<RawRow>(
    `UPDATE sso.configurations SET status = $1, updated_at = NOW()
      WHERE tenant_id = $2
      RETURNING id, tenant_id, protocol, idp_type, metadata_url, entity_id,
                sso_endpoint_url, slo_endpoint_url, idp_certificate, oidc_issuer,
                oidc_client_id, attribute_mapping, status, created_at, updated_at`,
    [status, tenantId],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

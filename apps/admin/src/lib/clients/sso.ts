import { callService, resolveServiceUrls, type FetchOptions, type FetchResult } from './services';

export interface SsoConfigDto {
  id: string;
  tenantId: string;
  protocol: 'saml' | 'oidc';
  idpType: 'okta' | 'azure_ad' | 'google_workspace' | 'ping' | 'jumpcloud' | 'onelogin' | 'custom';
  metadataUrl: string | null;
  entityId: string | null;
  ssoEndpointUrl: string | null;
  sloEndpointUrl: string | null;
  idpCertificate: string | null;
  oidcIssuer: string | null;
  oidcClientId: string | null;
  attributeMapping: Record<string, unknown>;
  status: 'draft' | 'test_mode' | 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSsoConfigPayload {
  protocol: 'saml' | 'oidc';
  idp_type: SsoConfigDto['idpType'];
  metadata_url?: string | null;
  entity_id?: string | null;
  sso_endpoint_url?: string | null;
  slo_endpoint_url?: string | null;
  idp_certificate?: string | null;
  oidc_issuer?: string | null;
  oidc_client_id?: string | null;
  oidc_client_secret?: string | null;
  attribute_mapping?: Record<string, unknown>;
  status?: SsoConfigDto['status'];
}

export function getConfig(
  tenantId: string,
  opts?: FetchOptions,
): Promise<FetchResult<SsoConfigDto>> {
  return callService<SsoConfigDto>(resolveServiceUrls().sso, '/v1/sso/configurations', {
    tenantId,
    ...opts,
  });
}

export function upsertConfig(
  tenantId: string,
  body: UpsertSsoConfigPayload,
  opts?: FetchOptions,
): Promise<FetchResult<SsoConfigDto>> {
  return callService<SsoConfigDto>(resolveServiceUrls().sso, '/v1/sso/configurations', {
    tenantId,
    method: 'PUT',
    body,
    ...opts,
  });
}

export function fetchSpMetadata(opts?: FetchOptions): Promise<FetchResult<string>> {
  return callService<string>(resolveServiceUrls().sso, '/v1/auth/saml/metadata', opts);
}

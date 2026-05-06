'use server';

import { revalidatePath } from 'next/cache';
import { upsertConfig, type UpsertSsoConfigPayload } from '@/lib/clients/sso';
import { resolveAdminTenantId } from '@/lib/tenant';

export interface SsoActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

const IDP_TYPES = new Set([
  'okta',
  'azure_ad',
  'google_workspace',
  'ping',
  'jumpcloud',
  'onelogin',
  'custom',
]);
const STATUSES = new Set(['draft', 'test_mode', 'active', 'disabled']);

function readString(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

export async function upsertSsoAction(
  _prev: SsoActionState,
  formData: FormData,
): Promise<SsoActionState> {
  const tenantId = resolveAdminTenantId();
  if (!tenantId) {
    return { status: 'error', message: 'ADMIN_DEFAULT_TENANT_ID is not configured.' };
  }

  const protocol = readString(formData, 'protocol');
  if (protocol !== 'saml' && protocol !== 'oidc') {
    return { status: 'error', message: 'Invalid protocol.' };
  }
  const idpType = readString(formData, 'idp_type');
  if (!idpType || !IDP_TYPES.has(idpType)) {
    return { status: 'error', message: 'Invalid IdP type.' };
  }
  const statusValue = (readString(formData, 'status') ?? 'draft') as
    | 'draft'
    | 'test_mode'
    | 'active'
    | 'disabled';
  if (!STATUSES.has(statusValue)) {
    return { status: 'error', message: 'Invalid status.' };
  }

  let attributeMapping: Record<string, unknown> | undefined;
  const mappingRaw = readString(formData, 'attribute_mapping');
  if (mappingRaw) {
    try {
      const parsed = JSON.parse(mappingRaw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        attributeMapping = parsed as Record<string, unknown>;
      } else {
        return { status: 'error', message: 'attribute_mapping must be a JSON object.' };
      }
    } catch {
      return { status: 'error', message: 'attribute_mapping is not valid JSON.' };
    }
  }

  const payload: UpsertSsoConfigPayload = {
    protocol,
    idp_type: idpType as UpsertSsoConfigPayload['idp_type'],
    status: statusValue,
  };
  const metadataUrl = readString(formData, 'metadata_url');
  if (metadataUrl !== undefined) payload.metadata_url = metadataUrl;
  const entityId = readString(formData, 'entity_id');
  if (entityId !== undefined) payload.entity_id = entityId;
  const ssoEndpointUrl = readString(formData, 'sso_endpoint_url');
  if (ssoEndpointUrl !== undefined) payload.sso_endpoint_url = ssoEndpointUrl;
  const sloEndpointUrl = readString(formData, 'slo_endpoint_url');
  if (sloEndpointUrl !== undefined) payload.slo_endpoint_url = sloEndpointUrl;
  const idpCertificate = readString(formData, 'idp_certificate');
  if (idpCertificate !== undefined) payload.idp_certificate = idpCertificate;
  const oidcIssuer = readString(formData, 'oidc_issuer');
  if (oidcIssuer !== undefined) payload.oidc_issuer = oidcIssuer;
  const oidcClientId = readString(formData, 'oidc_client_id');
  if (oidcClientId !== undefined) payload.oidc_client_id = oidcClientId;
  const oidcClientSecret = readString(formData, 'oidc_client_secret');
  if (oidcClientSecret !== undefined) payload.oidc_client_secret = oidcClientSecret;
  if (attributeMapping !== undefined) payload.attribute_mapping = attributeMapping;

  const result = await upsertConfig(tenantId, payload);
  if (!result.ok) {
    return {
      status: 'error',
      message: `SSO service rejected the update: ${result.error ?? `HTTP ${result.status}`}`,
    };
  }
  revalidatePath('/admin/sso');
  return { status: 'success', message: 'SSO configuration saved.' };
}

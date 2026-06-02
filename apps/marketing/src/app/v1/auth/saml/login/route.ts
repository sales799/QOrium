import { createSamlAuthnRequest } from '@qorium/saml';
import { NextResponse } from 'next/server';

import { rateLimitResponse } from '../../../_proof-response';
import { getSamlProofTenant, resolveRelayPath } from '../_config';
import { samlProblem } from '../_response';
import { rememberSamlAuthnRequest } from '../_state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, 'saml-login-minute', { max: 20, windowMs: 60 * 1000 });
  if (limited) return limited;

  const url = new URL(request.url);
  const tenant = getSamlProofTenant(url.searchParams.get('tenant'));
  if (!tenant) {
    return samlProblem(
      404,
      'Unknown SAML tenant',
      'No public SAML proof tenant is configured for this tenant slug.',
    );
  }

  const relay = resolveRelayPath(
    url.searchParams.get('return_to'),
    tenant.config.defaultRedirectPath,
  );
  if (!relay.ok) return samlProblem(400, 'Invalid RelayState target', relay.message);

  const authnRequest = createSamlAuthnRequest({
    tenant: tenant.config,
    spEntityId: tenant.spEntityId,
    spAcsUrl: tenant.spAcsUrl,
    relayState: relay.path,
    forceAuthn: url.searchParams.get('force') === 'true',
  });
  await rememberSamlAuthnRequest(authnRequest.id, {
    tenantSlug: tenant.slug,
    tenantId: tenant.config.tenantId,
    relayState: relay.path,
  });

  const response = NextResponse.redirect(authnRequest.redirectUrl, 302);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Qorium-Saml-Request-Id', authnRequest.id);
  response.headers.set('X-Qorium-Saml-Tenant', tenant.slug);
  return response;
}

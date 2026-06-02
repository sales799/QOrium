import { buildSamlServiceProviderMetadata } from '@qorium/saml';

import { getPublicSigningCerts, getSamlProofTenant } from '../_config';
import { samlProblem } from '../_response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const url = new URL(request.url);
  const tenant = getSamlProofTenant(url.searchParams.get('tenant'));
  if (!tenant) {
    return samlProblem(
      404,
      'Unknown SAML tenant',
      'No public SAML proof tenant is configured for this tenant slug.',
    );
  }

  const metadata = buildSamlServiceProviderMetadata({
    spEntityId: tenant.spEntityId,
    spAcsUrl: tenant.spAcsUrl,
    signingCerts: getPublicSigningCerts(),
    ...(tenant.spSloUrl ? { spSloUrl: tenant.spSloUrl } : {}),
  });

  return new Response(metadata, {
    status: 200,
    headers: {
      'Content-Type': 'application/samlmetadata+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Qorium-Saml-Tenant': tenant.slug,
    },
  });
}

import {
  extractStableEmail,
  validateAssertion,
  verifyAndParseSamlResponse,
  type ValidationFailureCode,
} from '@qorium/saml';
import { NextResponse } from 'next/server';

import { rateLimitResponse } from '../../../_proof-response';
import { getSamlProofTenants, resolveRelayPath, type SamlProofTenant } from '../_config';
import { samlProblem } from '../_response';
import { createSamlSession, samlSessionCookie } from '../_session';
import {
  consumeSamlAuthnRequest,
  getSamlAuthnRequestState,
  hasSeenSamlAssertion,
  rememberSamlAssertion,
} from '../_state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface VerifiedTenantResponse {
  tenant: SamlProofTenant;
  verified: Extract<ReturnType<typeof verifyAndParseSamlResponse>, { ok: true }>['data'];
}

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, 'saml-acs-minute', { max: 30, windowMs: 60 * 1000 });
  if (limited) return limited;

  const form = await readSamlForm(request);
  if (!form.ok) return samlProblem(400, 'Invalid SAML ACS request', form.message);

  const matched = verifyAgainstConfiguredTenants(form.samlResponse);
  if (!matched) {
    return samlProblem(
      401,
      'Invalid SAML response',
      'No configured tenant could verify the SAML assertion signature.',
    );
  }

  const state = matched.verified.assertion.inResponseTo
    ? await getSamlAuthnRequestState(
        matched.verified.assertion.inResponseTo,
        matched.tenant.slug,
        matched.tenant.config.tenantId,
      )
    : null;
  const hasConsumedAssertion = await hasSeenSamlAssertion(
    matched.verified.assertion.id,
    matched.tenant.config.tenantId,
  );
  const validation = validateAssertion(matched.verified.assertion, {
    tenant: matched.tenant.config,
    spEntityId: matched.tenant.spEntityId,
    spAcsUrl: matched.tenant.spAcsUrl,
    maxClockSkewSeconds: 300,
    now: new Date(),
    knownAuthnRequestIds:
      matched.verified.assertion.inResponseTo && state
        ? new Set([matched.verified.assertion.inResponseTo])
        : new Set(),
    seenAssertionIds: hasConsumedAssertion ? new Set([matched.verified.assertion.id]) : new Set(),
  });
  if (!validation.ok) {
    return samlProblem(
      statusForValidationFailure(validation.code),
      'SAML assertion rejected',
      validation.message,
    );
  }

  const email = extractStableEmail(validation.assertion);
  if (!email) {
    return samlProblem(
      403,
      'SAML assertion rejected',
      'SAML assertion did not include a stable email subject.',
    );
  }

  const relay = resolveRelayPath(
    form.relayState,
    state?.relayState ?? matched.tenant.config.defaultRedirectPath,
  );
  if (!relay.ok) return samlProblem(400, 'Invalid RelayState target', relay.message);

  if (validation.assertion.inResponseTo) {
    const consumed = await consumeSamlAuthnRequest(
      validation.assertion.inResponseTo,
      matched.tenant.slug,
      matched.tenant.config.tenantId,
    );
    if (!consumed) {
      return samlProblem(
        401,
        'SAML assertion rejected',
        `InResponseTo ${validation.assertion.inResponseTo} was already consumed or expired`,
      );
    }
  }
  const rememberedAssertion = await rememberSamlAssertion(
    validation.assertion.id,
    matched.tenant.config.tenantId,
    validation.assertion.notOnOrAfter,
  );
  if (!rememberedAssertion) {
    return samlProblem(
      401,
      'SAML assertion rejected',
      `Assertion ID ${validation.assertion.id} has already been consumed`,
    );
  }

  const session = createSamlSession({
    tenant: matched.tenant,
    assertion: validation.assertion,
    email,
  });
  const response = NextResponse.json(
    {
      ok: true,
      data: {
        tenant: matched.tenant.slug,
        email,
        redirectPath: relay.path,
        assertionId: validation.assertion.id,
        responseId: matched.verified.responseId,
        idpInitiated: validation.idpInitiated,
        session: {
          cookie: 'qor_session',
          recruiterId: session.payload.recruiterId,
          expiresAt: new Date(session.payload.exp).toISOString(),
          roles: session.payload.roles,
        },
        trustedCertificateSha256: matched.verified.trustedCertificateSha256,
      },
      error: null,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
  response.headers.set(
    'Set-Cookie',
    samlSessionCookie(session.token, session.maxAgeSeconds, isSecureRequest(request)),
  );
  return response;
}

async function readSamlForm(
  request: Request,
): Promise<
  { ok: true; samlResponse: string; relayState: string | null } | { ok: false; message: string }
> {
  try {
    const form = await request.formData();
    const samlResponse = form.get('SAMLResponse');
    const relayState = form.get('RelayState');
    if (typeof samlResponse !== 'string' || samlResponse.length === 0) {
      return { ok: false, message: 'SAMLResponse form field is required.' };
    }
    if (samlResponse.length > 200_000) return { ok: false, message: 'SAMLResponse is too large.' };
    return {
      ok: true,
      samlResponse,
      relayState: typeof relayState === 'string' && relayState.length > 0 ? relayState : null,
    };
  } catch {
    return { ok: false, message: 'ACS request must be a form post.' };
  }
}

function verifyAgainstConfiguredTenants(samlResponse: string): VerifiedTenantResponse | null {
  for (const tenant of getSamlProofTenants()) {
    const trustedCertificates = [
      tenant.config.idpSigningCert,
      tenant.config.idpSigningCertNext,
    ].filter((cert): cert is string => !!cert);
    const verified = verifyAndParseSamlResponse({ samlResponse, trustedCertificates });
    if (verified.ok) return { tenant, verified: verified.data };
  }
  return null;
}

function isSecureRequest(request: Request): boolean {
  const forwardedProtocol = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase();
  return (
    new URL(request.url).protocol === 'https:' ||
    forwardedProtocol === 'https' ||
    process.env.NODE_ENV === 'production'
  );
}

function statusForValidationFailure(code: ValidationFailureCode): number {
  switch (code) {
    case 'saml/issuer-mismatch':
    case 'saml/audience-mismatch':
    case 'saml/recipient-mismatch':
    case 'saml/jit-disabled':
    case 'saml/missing-attribute':
      return 403;
    case 'saml/replay-or-stale':
    case 'saml/idp-init-disabled':
    case 'saml/in-response-to-unknown':
    case 'saml/clock-skew':
      return 401;
  }
}

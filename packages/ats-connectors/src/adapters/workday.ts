/**
 * Workday adapter per spec §3.2.
 *
 * Workday is the most complex ATS in the v0 set. Spec §8.4 places live
 * launch at M9 (after a 4–12 week certification process). v0 ships an
 * interface-compliant skeleton:
 *
 *   - Webhook signature: signed JWT in header (Workday-specific scheme;
 *     v0 verifier returns `valid: false` with a clear reason until the
 *     real certificate-based check is wired)
 *   - Webhook mapper: handles only the canonical "candidate" payload
 *     shape; everything else is `noop` with the reason recorded
 *   - Outbound: `notImplemented` for v0; the real REST/SOAP fallback
 *     ships during certification
 *
 * The CTO-DELTA `CTO-DELTA-ats-workday-certification-deferred.md`
 * captures the certification timeline and the "do not flip on without
 * certification" guardrail.
 */

import type {
  AtsConnector,
  Candidate,
  IntegrationCredentials,
  InboundEvent,
  InboundWebhook,
  PostScoreInput,
  PostScoreOutcome,
  SignatureVerificationResult,
} from '../types.js';

export class WorkdayAdapter implements AtsConnector {
  readonly platform = 'workday' as const;

  verifySignature(_webhook: InboundWebhook, _secret: string): SignatureVerificationResult {
    // Workday uses signed JWTs (RS256 with Workday's public key). Until
    // certification ships the verifier rejects all webhooks. Fail loud.
    return {
      valid: false,
      reason: 'Workday signature verification deferred until M9 certification',
    };
  }

  receiveWebhook(webhook: InboundWebhook): InboundEvent {
    const body = webhook.parsedBody;
    if (typeof body !== 'object' || body === null) {
      return { kind: 'error', reason: 'webhook body is not an object' };
    }
    const obj = body as Record<string, unknown>;
    const eventClass = typeof obj.eventClass === 'string' ? obj.eventClass : undefined;
    const candidatePayload = (obj.candidate as Record<string, unknown> | undefined) ?? {};
    if (eventClass === 'Recruiting.Candidate.Created') {
      const c = mapCandidate(candidatePayload);
      if (!c) return { kind: 'error', reason: 'malformed Workday candidate payload' };
      return { kind: 'assessment-trigger', candidate: c };
    }
    if (eventClass === 'Recruiting.Candidate.Updated') {
      const c = mapCandidate(candidatePayload);
      if (!c) return { kind: 'error', reason: 'malformed Workday candidate payload' };
      return { kind: 'candidate', candidate: c };
    }
    return { kind: 'noop', reason: `unhandled Workday eventClass: ${eventClass ?? 'unknown'}` };
  }

  postScore(_creds: IntegrationCredentials, input: PostScoreInput): Promise<PostScoreOutcome> {
    return Promise.resolve(notImplemented(input.externalCandidateId));
  }

  postAssessmentUrl(
    _creds: IntegrationCredentials,
    externalCandidateId: string,
    _url: string,
  ): Promise<PostScoreOutcome> {
    return Promise.resolve(notImplemented(externalCandidateId));
  }
}

function mapCandidate(data: Record<string, unknown>): Candidate | null {
  const externalId = typeof data.candidateId === 'string' ? data.candidateId : null;
  const email = typeof data.email === 'string' ? data.email : null;
  if (!externalId || !email) return null;
  const firstName = typeof data.firstName === 'string' ? data.firstName : '';
  const lastName = typeof data.lastName === 'string' ? data.lastName : '';
  return {
    externalId,
    email,
    firstName,
    lastName,
    assessmentStatus: 'pending',
  };
}

function notImplemented(externalCandidateId: string): PostScoreOutcome {
  return {
    ok: false,
    status: 501,
    externalCandidateId,
    responseBody:
      'Workday outbound calls deferred to M9 — see CTO-DELTA-ats-workday-certification-deferred.md',
    recovery: 'permanent',
  };
}

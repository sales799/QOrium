/**
 * Ashby adapter per spec §3.3.
 *
 * Ashby has the cleanest API of the v0 set; webhook signatures are
 * HMAC-SHA256 over the raw body with header `Ashby-Signature: sha256=<hex>`.
 * Outbound: POST `/candidates.update` with the candidate id + custom-field
 * patch.
 *
 * v0 ships the webhook mapper + signature verifier. Outbound API call
 * signatures are stubbed (return `recovery: 'permanent'`) until Ashby
 * customer rollout (M7 per spec §8.2) when we wire the real client.
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
import { verifyHmacSignature } from '../signature.js';

export class AshbyAdapter implements AtsConnector {
  readonly platform = 'ashby' as const;

  verifySignature(webhook: InboundWebhook, secret: string): SignatureVerificationResult {
    const valid = verifyHmacSignature({
      rawBody: webhook.rawBody,
      signatureHeader: webhook.headers['ashby-signature'] ?? webhook.headers['x-ashby-signature'],
      secret,
      prefix: 'sha256=',
    });
    if (!valid) return { valid: false, reason: 'HMAC mismatch or missing Ashby-Signature header' };
    return { valid: true };
  }

  receiveWebhook(webhook: InboundWebhook): InboundEvent {
    const body = webhook.parsedBody;
    if (typeof body !== 'object' || body === null) {
      return { kind: 'error', reason: 'webhook body is not an object' };
    }
    const obj = body as Record<string, unknown>;
    const eventType = typeof obj.eventType === 'string' ? obj.eventType : undefined;
    const data = (obj.data as Record<string, unknown> | undefined) ?? {};
    if (eventType === 'candidate.created' || eventType === 'application.created') {
      const c = mapCandidate(data);
      if (!c) return { kind: 'error', reason: 'malformed candidate payload' };
      return { kind: 'assessment-trigger', candidate: c };
    }
    if (eventType === 'candidate.updated') {
      const c = mapCandidate(data);
      if (!c) return { kind: 'error', reason: 'malformed candidate payload' };
      return { kind: 'candidate', candidate: c };
    }
    return { kind: 'noop', reason: `unhandled eventType: ${eventType ?? 'unknown'}` };
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
  const externalJobId = typeof data.jobId === 'string' ? data.jobId : undefined;
  const candidate: Candidate = {
    externalId,
    email,
    firstName,
    lastName,
    assessmentStatus: 'pending',
  };
  if (externalJobId !== undefined) candidate.externalJobId = externalJobId;
  return candidate;
}

function notImplemented(externalCandidateId: string): PostScoreOutcome {
  return {
    ok: false,
    status: 501,
    externalCandidateId,
    responseBody: 'Ashby outbound calls deferred to M7 — see CTO-DELTA-ats-real-oauth-deferred.md',
    recovery: 'permanent',
  };
}

/**
 * Darwinbox adapter per spec §3.4.
 *
 * Darwinbox uses an API-key flow (header `apiKey`) and a webhook secret
 * agreed at registration. Like Ashby, signatures are HMAC-SHA256 over
 * the raw body. v0 ships the webhook mapper + signature verifier;
 * outbound calls return `notImplemented` until M8 rollout per spec §8.3.
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

export class DarwinboxAdapter implements AtsConnector {
  readonly platform = 'darwinbox' as const;

  verifySignature(webhook: InboundWebhook, secret: string): SignatureVerificationResult {
    const valid = verifyHmacSignature({
      rawBody: webhook.rawBody,
      signatureHeader:
        webhook.headers['x-darwinbox-signature'] ?? webhook.headers['x-webhook-signature'],
      secret,
    });
    if (!valid)
      return { valid: false, reason: 'HMAC mismatch or missing Darwinbox signature header' };
    return { valid: true };
  }

  receiveWebhook(webhook: InboundWebhook): InboundEvent {
    const body = webhook.parsedBody;
    if (typeof body !== 'object' || body === null) {
      return { kind: 'error', reason: 'webhook body is not an object' };
    }
    const obj = body as Record<string, unknown>;
    const event = typeof obj.event === 'string' ? obj.event : undefined;
    const candidatePayload = (obj.candidate as Record<string, unknown> | undefined) ?? {};
    if (event === 'candidate.added' || event === 'candidate.created') {
      const c = mapCandidate(candidatePayload);
      if (!c) return { kind: 'error', reason: 'malformed Darwinbox candidate payload' };
      return { kind: 'assessment-trigger', candidate: c };
    }
    if (event === 'candidate.updated') {
      const c = mapCandidate(candidatePayload);
      if (!c) return { kind: 'error', reason: 'malformed Darwinbox candidate payload' };
      return { kind: 'candidate', candidate: c };
    }
    return { kind: 'noop', reason: `unhandled Darwinbox event: ${event ?? 'unknown'}` };
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
  const externalId =
    typeof data.candidateId === 'string'
      ? data.candidateId
      : typeof data.id === 'string'
        ? data.id
        : null;
  const email =
    typeof data.emailId === 'string'
      ? data.emailId
      : typeof data.email === 'string'
        ? data.email
        : null;
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
    responseBody:
      'Darwinbox outbound calls deferred to M8 — see CTO-DELTA-ats-real-oauth-deferred.md',
    recovery: 'permanent',
  };
}

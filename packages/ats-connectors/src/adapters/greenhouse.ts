/**
 * Greenhouse Harvest API adapter per spec §3.1.
 *
 * Inbound webhooks: HMAC-SHA256 over the raw body, header
 * `Signature: sha256=<hex>`. Greenhouse fires `candidate.created` /
 * `candidate.updated` / `application.created` / `job.opened` events.
 *
 * Outbound: PATCH /v1/candidates/{id} with custom-field updates. The
 * Harvest API uses Basic auth with the OAuth token as the username and
 * an empty password; we wrap that in the Authorization header.
 *
 * Real activation requires an OAuth client id + secret + tenant
 * authorization (CEO action). v0 ships the adapter wired against an
 * injectable `fetch` so unit tests cover the contract end-to-end.
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

export interface GreenhouseAdapterOptions {
  fetchImpl?: typeof fetch;
  baseUrl?: string;
  /** Per-request timeout (ms). Default 15s. */
  timeoutMs?: number;
}

const DEFAULT_BASE_URL = 'https://harvest.greenhouse.io';
const DEFAULT_TIMEOUT_MS = 15_000;

export class GreenhouseAdapter implements AtsConnector {
  readonly platform = 'greenhouse' as const;
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(opts: GreenhouseAdapterOptions = {}) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  verifySignature(webhook: InboundWebhook, secret: string): SignatureVerificationResult {
    const valid = verifyHmacSignature({
      rawBody: webhook.rawBody,
      signatureHeader: webhook.headers['signature'] ?? webhook.headers['x-signature'],
      secret,
      prefix: 'sha256=',
    });
    if (!valid) return { valid: false, reason: 'HMAC mismatch or missing signature header' };
    return { valid: true };
  }

  receiveWebhook(webhook: InboundWebhook): InboundEvent {
    const body = webhook.parsedBody;
    if (typeof body !== 'object' || body === null) {
      return { kind: 'error', reason: 'webhook body is not an object' };
    }
    const obj = body as Record<string, unknown>;
    const action = typeof obj.action === 'string' ? obj.action : undefined;
    const payload = (obj.payload as Record<string, unknown> | undefined) ?? {};

    if (action === 'candidate.created' || action === 'application.created') {
      const candidate = mapCandidatePayload(payload);
      if (candidate === null) return { kind: 'error', reason: 'malformed candidate payload' };
      return { kind: 'assessment-trigger', candidate };
    }
    if (action === 'candidate.updated') {
      const candidate = mapCandidatePayload(payload);
      if (candidate === null) return { kind: 'error', reason: 'malformed candidate payload' };
      return { kind: 'candidate', candidate };
    }
    if (action === 'job.opened' || action === 'job.updated') {
      const job = mapJobPayload(payload);
      if (job === null) return { kind: 'error', reason: 'malformed job payload' };
      return { kind: 'job', job };
    }
    return { kind: 'noop', reason: `unhandled action: ${action ?? 'unknown'}` };
  }

  async postScore(creds: IntegrationCredentials, input: PostScoreInput): Promise<PostScoreOutcome> {
    const body = {
      custom_fields: {
        qorium_assessment_score: input.score,
        qorium_assessment_status: input.status,
        ...(input.assessmentUrl !== undefined
          ? { qorium_assessment_url: input.assessmentUrl }
          : {}),
      },
    };
    return this.patchCandidate(creds, input.externalCandidateId, body);
  }

  async postAssessmentUrl(
    creds: IntegrationCredentials,
    externalCandidateId: string,
    url: string,
  ): Promise<PostScoreOutcome> {
    const body = {
      custom_fields: {
        qorium_assessment_url: url,
        qorium_assessment_status: 'invited',
      },
    };
    return this.patchCandidate(creds, externalCandidateId, body);
  }

  private async patchCandidate(
    creds: IntegrationCredentials,
    externalCandidateId: string,
    body: Record<string, unknown>,
  ): Promise<PostScoreOutcome> {
    const token = creds.accessToken ?? creds.apiKey;
    if (!token) {
      return {
        ok: false,
        status: 401,
        externalCandidateId,
        recovery: 'reauth',
      };
    }
    const url = `${this.baseUrl}/v1/candidates/${encodeURIComponent(externalCandidateId)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(
      () => ctrl.abort(new Error('greenhouse request timed out')),
      this.timeoutMs,
    );
    try {
      const response = await this.fetchImpl(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
          'Content-Type': 'application/json',
          accept: 'application/json',
          ...(creds.tenantConfig && typeof creds.tenantConfig['onBehalfOf'] === 'string'
            ? { 'On-Behalf-Of': String(creds.tenantConfig['onBehalfOf']) }
            : {}),
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const responseBody = await response.text();
      if (response.ok) {
        return { ok: true, status: response.status, externalCandidateId, responseBody };
      }
      return {
        ok: false,
        status: response.status,
        externalCandidateId,
        responseBody,
        recovery: recoveryFor(response.status),
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        externalCandidateId,
        responseBody: err instanceof Error ? err.message : String(err),
        recovery: 'retry',
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

function recoveryFor(status: number): NonNullable<PostScoreOutcome['recovery']> {
  if (status === 401 || status === 403) return 'reauth';
  if (status === 404 || status === 422) return 'permanent';
  if (status >= 500 || status === 429) return 'retry';
  return 'permanent';
}

function mapCandidatePayload(payload: Record<string, unknown>): Candidate | null {
  const id = stringFrom(payload, 'id', 'candidate_id');
  const email = stringFrom(payload, 'email_addresses[0].value', 'email');
  if (!id || !email) return null;
  const firstName = stringFrom(payload, 'first_name') ?? '';
  const lastName = stringFrom(payload, 'last_name') ?? '';
  const externalJobId = stringFrom(payload, 'application.jobs[0].id', 'job_id');
  const application = (payload.application as Record<string, unknown> | undefined) ?? {};
  const status =
    stringFrom(application, 'status') === 'hired'
      ? 'completed'
      : stringFrom(application, 'status') === 'rejected'
        ? 'opted_out'
        : 'pending';
  const candidate: Candidate = {
    externalId: id,
    email,
    firstName,
    lastName,
    assessmentStatus: status,
  };
  if (externalJobId !== undefined) candidate.externalJobId = externalJobId;
  return candidate;
}

function mapJobPayload(
  payload: Record<string, unknown>,
): { externalId: string; title: string; status: 'open' | 'closed' | 'on_hold' } | null {
  const id = stringFrom(payload, 'id', 'job_id');
  const title = stringFrom(payload, 'name', 'title');
  if (!id || !title) return null;
  const greenhouseStatus = stringFrom(payload, 'status') ?? 'open';
  const status: 'open' | 'closed' | 'on_hold' =
    greenhouseStatus === 'closed' ? 'closed' : greenhouseStatus === 'on_hold' ? 'on_hold' : 'open';
  return { externalId: id, title, status };
}

function stringFrom(obj: unknown, ...paths: string[]): string | undefined {
  for (const path of paths) {
    const value = readPath(obj, path);
    if (typeof value === 'string' && value.length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return undefined;
}

function readPath(obj: unknown, path: string): unknown {
  const segments = path.split('.');
  let cur: unknown = obj;
  for (const seg of segments) {
    if (cur === null || cur === undefined) return undefined;
    const arrayMatch = seg.match(/^([^[]+)\[(\d+)\]$/);
    if (arrayMatch) {
      const key = arrayMatch[1];
      const idx = Number.parseInt(arrayMatch[2] ?? '0', 10);
      const next =
        typeof cur === 'object' && key !== undefined
          ? (cur as Record<string, unknown>)[key]
          : undefined;
      cur = Array.isArray(next) ? next[idx] : undefined;
      continue;
    }
    cur = typeof cur === 'object' ? (cur as Record<string, unknown>)[seg] : undefined;
  }
  return cur;
}

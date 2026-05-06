/**
 * Universal ATS abstraction per `infra/ATS-Connector-Framework-v0.md` §2.3.
 *
 * Each per-vendor adapter implements `AtsConnector`. Adapters translate
 * vendor payloads into the canonical `Candidate` / `AssessmentResult` /
 * `Job` shapes; the bridge service operates exclusively on the canonical
 * forms.
 */

export type AtsPlatform =
  | 'greenhouse'
  | 'ashby'
  | 'darwinbox'
  | 'workday'
  | 'lever'
  | 'bamboohr'
  | 'successfactors'
  | 'icims'
  | 'smartrecruiters'
  | 'workable'
  | 'recruitee';

export type AssessmentStatus =
  | 'pending'
  | 'invited'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'opted_out';

export interface Candidate {
  externalId: string;
  email: string;
  firstName: string;
  lastName: string;
  externalJobId?: string | undefined;
  assessmentStatus: AssessmentStatus;
  assessmentScore?: number | undefined;
  assessmentUrl?: string | undefined;
  assessmentCompletedAt?: string | undefined;
}

export interface Job {
  externalId: string;
  title: string;
  status: 'open' | 'closed' | 'on_hold';
  externalUrl?: string | undefined;
}

export interface AssessmentResult {
  candidateExternalId: string;
  externalJobId?: string | undefined;
  score: number;
  timeSpentMs?: number | undefined;
  completedAt: string;
  metadata?: Record<string, unknown> | undefined;
}

export interface IntegrationCredentials {
  accessToken?: string | undefined;
  refreshToken?: string | undefined;
  apiKey?: string | undefined;
  /** Webhook signing secret provided by the ATS for inbound verification. */
  webhookSecret?: string | undefined;
  /** Tenant-specific config (URLs, custom-field mappings, etc.). */
  tenantConfig?: Record<string, unknown> | undefined;
}

export interface InboundWebhook {
  /** Raw body bytes — needed for signature verification. */
  rawBody: Buffer;
  parsedBody: unknown;
  headers: Record<string, string | string[] | undefined>;
}

export interface SignatureVerificationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Result of mapping an inbound webhook into a domain event the bridge
 * service can act on. Adapters return one of:
 *
 *   - `{ kind: 'candidate', candidate }` — create / update a candidate
 *   - `{ kind: 'assessment-trigger', candidate }` — invite the candidate
 *   - `{ kind: 'job', job }` — sync a job
 *   - `{ kind: 'noop' }` — recognised event but no action required (e.g.
 *     ping / heartbeat / unrelated event-type)
 *   - `{ kind: 'error', reason }` — payload could not be mapped
 */
export type InboundEvent =
  | { kind: 'candidate'; candidate: Candidate }
  | { kind: 'assessment-trigger'; candidate: Candidate }
  | { kind: 'job'; job: Job }
  | { kind: 'noop'; reason: string }
  | { kind: 'error'; reason: string };

export interface PostScoreInput {
  externalCandidateId: string;
  score: number;
  assessmentUrl?: string | undefined;
  status: AssessmentStatus;
  /** Optional metadata to surface on the ATS candidate profile (e.g.,
   * tier name, sub-skill rollups). */
  metadata?: Record<string, unknown> | undefined;
}

export interface PostScoreOutcome {
  ok: boolean;
  status: number;
  externalCandidateId: string;
  /** ATS-side response (the bridge service can persist to ats_webhook_log). */
  responseBody?: string | undefined;
  /** When `ok=false`, what the adapter recommends the orchestrator do next. */
  recovery?: 'retry' | 'reauth' | 'permanent';
}

export interface AtsConnector {
  readonly platform: AtsPlatform;
  /** Map an inbound webhook into a canonical domain event. */
  receiveWebhook(webhook: InboundWebhook): InboundEvent;
  /** Verify the inbound webhook's signature using the shared secret. */
  verifySignature(webhook: InboundWebhook, secret: string): SignatureVerificationResult;
  /** Post an assessment score back to the ATS (outbound). */
  postScore(creds: IntegrationCredentials, input: PostScoreInput): Promise<PostScoreOutcome>;
  /** Post an assessment URL onto the candidate's ATS record (inbound side
   * of the §5.1 round-trip). */
  postAssessmentUrl(
    creds: IntegrationCredentials,
    externalCandidateId: string,
    url: string,
  ): Promise<PostScoreOutcome>;
}

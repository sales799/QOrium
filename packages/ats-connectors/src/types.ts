/**
 * ATS Connector Framework v0 — universal data abstraction per spec §2.3.
 *
 * Each connector adapter translates the platform's native model to/from
 * these shapes. Hub-and-spoke design (spec §2.1): QOrium is the single
 * source of truth; adapters are thin readers + writers.
 */

export type AtsPlatform = 'lever' | 'greenhouse' | 'workday' | 'ashby' | 'darwinbox';

export type AssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Candidate {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  /** ATS-provided id; used for idempotent upserts. */
  external_id: string | null;
  assessment_status: AssessmentStatus;
  assessment_score: number | null;
  assessment_url: string | null;
  assessment_completed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface Job {
  id: string;
  external_id: string | null;
  title: string;
  department: string | null;
  location: string | null;
  status: 'open' | 'closed' | 'draft';
  metadata: Record<string, unknown>;
}

export interface AssessmentResult {
  candidate_id: string;
  assessment_id: string;
  score: number;
  time_spent_ms: number;
  answers: Record<string, unknown>;
  metadata: {
    ats_platform: AtsPlatform;
    job_id: string;
    external_candidate_id: string;
  };
}

export interface SyncCursor {
  /** Opaque per-platform; e.g., timestamp, page token, or offset. */
  value: string;
}

export interface SyncPage<T> {
  rows: T[];
  next_cursor: SyncCursor | null;
}

/**
 * ConnectorAdapter — every per-ATS adapter implements this surface.
 * Sprint 4.6 v0 ships the LeverAdapter stub; Sprint 4.6.1+ adds live
 * fetch + Greenhouse/Workday/Ashby/Darwinbox per spec §3.
 */
export interface ConnectorAdapter {
  readonly platform: AtsPlatform;

  /** Test the credential by issuing a minimal authenticated request. */
  ping(): Promise<{ ok: true } | { ok: false; reason: string }>;

  /** Walk candidates updated since the cursor (forward-only). */
  syncCandidates(cursor?: SyncCursor): Promise<SyncPage<Candidate>>;

  /** Walk jobs updated since the cursor. */
  syncJobs(cursor?: SyncCursor): Promise<SyncPage<Job>>;

  /** Push an assessment result back to the ATS. */
  postAssessmentResult(
    result: AssessmentResult,
  ): Promise<{ ok: true } | { ok: false; reason: string }>;

  /**
   * OAuth-only: refresh the access token. Returns new expiry. Connector
   * implementations using static API tokens may return a no-op success.
   */
  authRefresh(): Promise<{ ok: true; expires_at: string | null } | { ok: false; reason: string }>;
}

export interface ConnectorCredentials {
  kind: 'api_token' | 'oauth';
  /** Raw token (or OAuth access token). Adapters never log it. */
  token: string;
  /** OAuth-only. */
  refresh_token?: string;
  /** OAuth-only; ISO 8601. */
  expires_at?: string;
}

export interface ConnectorConfig {
  base_url?: string;
  /** Field-mapping overrides per tenant. */
  field_mappings?: Record<string, string>;
}

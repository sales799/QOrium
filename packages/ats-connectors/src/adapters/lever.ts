import type {
  AssessmentResult,
  Candidate,
  ConnectorAdapter,
  ConnectorConfig,
  ConnectorCredentials,
  Job,
  SyncCursor,
  SyncPage,
} from '../types.js';
import { applyFieldMapping, type FieldMapping } from '../field-mapper.js';

/**
 * LeverAdapter — Sprint 4.6 v0 stub.
 *
 * v0 ships the field mappings + interface compliance + a deterministic
 * mock fetcher seeded with sample Lever-shaped payloads (so downstream
 * sync-engine tests can run end-to-end without a real Lever account).
 * Sprint 4.6.1 swaps `fetcher` for the real `https://api.lever.co/v1`
 * client + auth refresh.
 *
 * Per spec §3 (Lever subsection): API token auth, paginated by
 * `?limit=100&offset=N`, fields per Lever's documented schema.
 */

const LEVER_CANDIDATE_MAPPING: FieldMapping = {
  external_id: 'id',
  email: { source: 'emails.0', type: 'string', default: '' },
  first_name: { source: 'firstName', type: 'string', default: '' },
  last_name: { source: 'lastName', type: 'string', default: '' },
  assessment_status: { source: 'stage.text', type: 'passthrough' },
};

const LEVER_JOB_MAPPING: FieldMapping = {
  external_id: 'id',
  title: { source: 'text', type: 'string' },
  department: { source: 'categories.department', type: 'string' },
  location: { source: 'categories.location', type: 'string' },
  status: { source: 'state', type: 'passthrough' },
};

export interface LeverFetcher {
  candidates(
    cursor: SyncCursor | undefined,
  ): Promise<{ rows: unknown[]; next_cursor: SyncCursor | null }>;
  jobs(
    cursor: SyncCursor | undefined,
  ): Promise<{ rows: unknown[]; next_cursor: SyncCursor | null }>;
  postResult(result: AssessmentResult): Promise<{ ok: true } | { ok: false; reason: string }>;
  ping(): Promise<{ ok: true } | { ok: false; reason: string }>;
}

const STAGE_TO_STATUS: Record<string, Candidate['assessment_status']> = {
  'New lead': 'pending',
  'Reached out': 'pending',
  'Phone screen': 'in_progress',
  Onsite: 'in_progress',
  Offer: 'completed',
  Hired: 'completed',
  Archived: 'cancelled',
};

function normaliseAssessmentStatus(raw: unknown): Candidate['assessment_status'] {
  if (typeof raw !== 'string') return 'pending';
  return STAGE_TO_STATUS[raw] ?? 'pending';
}

const LEVER_JOB_STATUS: Record<string, Job['status']> = {
  published: 'open',
  internal: 'open',
  closed: 'closed',
  draft: 'draft',
};

function normaliseJobStatus(raw: unknown): Job['status'] {
  if (typeof raw !== 'string') return 'draft';
  return LEVER_JOB_STATUS[raw] ?? 'draft';
}

export interface LeverAdapterOptions {
  credentials: ConnectorCredentials;
  config?: ConnectorConfig;
  fetcher: LeverFetcher;
}

export class LeverAdapter implements ConnectorAdapter {
  readonly platform = 'lever' as const;
  private readonly fetcher: LeverFetcher;
  private readonly config: ConnectorConfig;

  constructor(opts: LeverAdapterOptions) {
    if (!opts.credentials.token) throw new Error('LeverAdapter requires a credential token');
    this.fetcher = opts.fetcher;
    this.config = opts.config ?? {};
  }

  async ping() {
    return this.fetcher.ping();
  }

  async syncCandidates(cursor?: SyncCursor): Promise<SyncPage<Candidate>> {
    const page = await this.fetcher.candidates(cursor);
    const merged: FieldMapping = {
      ...LEVER_CANDIDATE_MAPPING,
      ...(this.config.field_mappings ?? {}),
    };
    const rows: Candidate[] = page.rows.map((raw) => {
      const mapped = applyFieldMapping(raw, merged);
      return {
        id: '', // populated by upsert; QOrium-side
        email: String(mapped['email'] ?? ''),
        first_name: String(mapped['first_name'] ?? ''),
        last_name: String(mapped['last_name'] ?? ''),
        external_id: typeof mapped['external_id'] === 'string' ? mapped['external_id'] : null,
        assessment_status: normaliseAssessmentStatus(mapped['assessment_status']),
        assessment_score: null,
        assessment_url: null,
        assessment_completed_at: null,
        metadata: { lever_raw_keys: Object.keys((raw ?? {}) as object) },
      };
    });
    return { rows, next_cursor: page.next_cursor };
  }

  async syncJobs(cursor?: SyncCursor): Promise<SyncPage<Job>> {
    const page = await this.fetcher.jobs(cursor);
    const merged: FieldMapping = {
      ...LEVER_JOB_MAPPING,
      ...(this.config.field_mappings ?? {}),
    };
    const rows: Job[] = page.rows.map((raw) => {
      const mapped = applyFieldMapping(raw, merged);
      return {
        id: '',
        external_id: typeof mapped['external_id'] === 'string' ? mapped['external_id'] : null,
        title: String(mapped['title'] ?? ''),
        department: typeof mapped['department'] === 'string' ? mapped['department'] : null,
        location: typeof mapped['location'] === 'string' ? mapped['location'] : null,
        status: normaliseJobStatus(mapped['status']),
        metadata: {},
      };
    });
    return { rows, next_cursor: page.next_cursor };
  }

  async postAssessmentResult(result: AssessmentResult) {
    return this.fetcher.postResult(result);
  }

  async authRefresh() {
    // Lever uses static API tokens (no refresh). Always returns success
    // without an explicit expiry.
    return { ok: true as const, expires_at: null };
  }
}

/**
 * Builds a deterministic mock fetcher useful for tests + dry-run sync.
 * Real fetcher (Sprint 4.6.1) replaces this with axios+retry against
 * https://api.lever.co/v1.
 */
export function createMockLeverFetcher(seed: {
  candidates: unknown[];
  jobs: unknown[];
}): LeverFetcher {
  return {
    async ping() {
      return { ok: true };
    },
    async candidates() {
      return { rows: seed.candidates, next_cursor: null };
    },
    async jobs() {
      return { rows: seed.jobs, next_cursor: null };
    },
    async postResult() {
      return { ok: true };
    },
  };
}

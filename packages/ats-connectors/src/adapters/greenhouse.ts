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

const GREENHOUSE_CANDIDATE_MAPPING: FieldMapping = {
  external_id: 'id',
  email: { source: 'email_addresses.0.value', type: 'string', default: '' },
  first_name: { source: 'first_name', type: 'string', default: '' },
  last_name: { source: 'last_name', type: 'string', default: '' },
  assessment_status: { source: 'application.status', type: 'passthrough' },
};

const GREENHOUSE_JOB_MAPPING: FieldMapping = {
  external_id: 'id',
  title: { source: 'name', type: 'string' },
  department: { source: 'departments.0.name', type: 'string' },
  location: { source: 'offices.0.name', type: 'string' },
  status: { source: 'status', type: 'passthrough' },
};

export interface GreenhouseFetcher {
  candidates(
    cursor: SyncCursor | undefined,
  ): Promise<{ rows: unknown[]; next_cursor: SyncCursor | null }>;
  jobs(
    cursor: SyncCursor | undefined,
  ): Promise<{ rows: unknown[]; next_cursor: SyncCursor | null }>;
  postResult(result: AssessmentResult): Promise<{ ok: true } | { ok: false; reason: string }>;
  ping(): Promise<{ ok: true } | { ok: false; reason: string }>;
}

const GREENHOUSE_APPLICATION_STATUS: Record<string, Candidate['assessment_status']> = {
  active: 'pending',
  prospect: 'pending',
  hired: 'completed',
  rejected: 'cancelled',
};

function normaliseAssessmentStatus(raw: unknown): Candidate['assessment_status'] {
  if (typeof raw !== 'string') return 'pending';
  return GREENHOUSE_APPLICATION_STATUS[raw.toLowerCase()] ?? 'pending';
}

function normaliseJobStatus(raw: unknown): Job['status'] {
  if (typeof raw !== 'string') return 'draft';
  if (raw.toLowerCase() === 'open') return 'open';
  if (raw.toLowerCase() === 'closed') return 'closed';
  return 'draft';
}

export interface GreenhouseAdapterOptions {
  credentials: ConnectorCredentials;
  config?: ConnectorConfig;
  fetcher: GreenhouseFetcher;
}

export class GreenhouseAdapter implements ConnectorAdapter {
  readonly platform = 'greenhouse' as const;
  private readonly fetcher: GreenhouseFetcher;
  private readonly config: ConnectorConfig;

  constructor(opts: GreenhouseAdapterOptions) {
    if (!opts.credentials.token) throw new Error('GreenhouseAdapter requires a credential token');
    this.fetcher = opts.fetcher;
    this.config = opts.config ?? {};
  }

  async ping() {
    return this.fetcher.ping();
  }

  async syncCandidates(cursor?: SyncCursor): Promise<SyncPage<Candidate>> {
    const page = await this.fetcher.candidates(cursor);
    const merged: FieldMapping = {
      ...GREENHOUSE_CANDIDATE_MAPPING,
      ...(this.config.field_mappings ?? {}),
    };
    const rows: Candidate[] = page.rows.map((raw) => {
      const mapped = applyFieldMapping(raw, merged);
      return {
        id: '',
        email: String(mapped['email'] ?? ''),
        first_name: String(mapped['first_name'] ?? ''),
        last_name: String(mapped['last_name'] ?? ''),
        external_id: typeof mapped['external_id'] === 'string' ? mapped['external_id'] : null,
        assessment_status: normaliseAssessmentStatus(mapped['assessment_status']),
        assessment_score: null,
        assessment_url: null,
        assessment_completed_at: null,
        metadata: { greenhouse_raw_keys: Object.keys((raw ?? {}) as object) },
      };
    });
    return { rows, next_cursor: page.next_cursor };
  }

  async syncJobs(cursor?: SyncCursor): Promise<SyncPage<Job>> {
    const page = await this.fetcher.jobs(cursor);
    const merged: FieldMapping = {
      ...GREENHOUSE_JOB_MAPPING,
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
    return { ok: true as const, expires_at: null };
  }
}

export function createMockGreenhouseFetcher(seed: {
  candidates: unknown[];
  jobs: unknown[];
}): GreenhouseFetcher {
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

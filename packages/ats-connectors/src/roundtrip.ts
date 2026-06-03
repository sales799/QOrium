import type { AssessmentResult, Candidate, ConnectorAdapter, Job } from './types.js';

export interface AtsRoundTripInput {
  assessmentId: string;
  assessmentBaseUrl: string;
  score: number;
  timeSpentMs: number;
}

export interface AtsRoundTripResult {
  platform: ConnectorAdapter['platform'];
  ok: boolean;
  candidate: Candidate;
  job: Job;
  assessmentUrl: string;
  resultPosted: boolean;
  reason?: string;
}

function externalIdOrFallback(value: string | null, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export async function runAtsRoundTrip(
  adapter: ConnectorAdapter,
  input: AtsRoundTripInput,
): Promise<AtsRoundTripResult> {
  const credential = await adapter.ping();
  if (!credential.ok) {
    return {
      platform: adapter.platform,
      ok: false,
      candidate: emptyCandidate(),
      job: emptyJob(),
      assessmentUrl: '',
      resultPosted: false,
      reason: credential.reason,
    };
  }

  const [candidates, jobs] = await Promise.all([adapter.syncCandidates(), adapter.syncJobs()]);
  const candidate = candidates.rows[0];
  const job = jobs.rows[0];
  if (!candidate || !job) {
    return {
      platform: adapter.platform,
      ok: false,
      candidate: candidate ?? emptyCandidate(),
      job: job ?? emptyJob(),
      assessmentUrl: '',
      resultPosted: false,
      reason: 'sandbox did not return at least one candidate and one job',
    };
  }

  const externalCandidateId = externalIdOrFallback(candidate.external_id, candidate.id);
  const jobId = externalIdOrFallback(job.external_id, job.id);
  const assessmentUrl = `${input.assessmentBaseUrl.replace(/\/$/, '')}/${adapter.platform}/${externalCandidateId}`;
  const result: AssessmentResult = {
    candidate_id: candidate.id || `qorium:${adapter.platform}:${externalCandidateId}`,
    assessment_id: input.assessmentId,
    score: input.score,
    time_spent_ms: input.timeSpentMs,
    answers: { round_trip: true },
    metadata: {
      ats_platform: adapter.platform,
      job_id: jobId,
      external_candidate_id: externalCandidateId,
    },
  };

  const posted = await adapter.postAssessmentResult(result);
  if (!posted.ok) {
    return {
      platform: adapter.platform,
      ok: false,
      candidate: { ...candidate, assessment_url: assessmentUrl },
      job,
      assessmentUrl,
      resultPosted: false,
      reason: posted.reason,
    };
  }

  return {
    platform: adapter.platform,
    ok: true,
    candidate: {
      ...candidate,
      assessment_status: 'completed',
      assessment_score: input.score,
      assessment_url: assessmentUrl,
      assessment_completed_at: new Date(0).toISOString(),
    },
    job,
    assessmentUrl,
    resultPosted: true,
  };
}

function emptyCandidate(): Candidate {
  return {
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    external_id: null,
    assessment_status: 'pending',
    assessment_score: null,
    assessment_url: null,
    assessment_completed_at: null,
    metadata: {},
  };
}

function emptyJob(): Job {
  return {
    id: '',
    external_id: null,
    title: '',
    department: null,
    location: null,
    status: 'draft',
    metadata: {},
  };
}

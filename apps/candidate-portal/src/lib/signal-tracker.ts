/**
 * Pure-logic signal accumulator for the candidate session UX.
 *
 * The candidate-portal page wires editor + chat events into this
 * reducer; submit time, the accumulated state is forwarded verbatim to
 * `services/ai-pair-coding-orchestrator` for grading.
 *
 * Per `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` §3.3.
 */

import type { SessionSignalsInput } from './orchestrator-client.js';

export interface TrackerState {
  typedChars: number;
  pastedChars: number;
  editTestCycles: number;
  candidateMessageCount: number;
  acceptedVerbatimCount: number;
  acceptedModifiedCount: number;
  rejectedCount: number;
  seededErrorsCaught: number;
  seededErrorsTotal: number;
  codeQualityScore: number;
  timeToFirstCodeSec: number;
  durationSec: number;
  startedAtMs: number;
  firstCodeAtMs: number | null;
}

export type TrackerEvent =
  | { kind: 'typed'; chars: number; nowMs?: number }
  | { kind: 'pasted'; chars: number; nowMs?: number }
  | { kind: 'edit_test_cycle' }
  | { kind: 'candidate_message' }
  | { kind: 'accepted_verbatim' }
  | { kind: 'accepted_modified' }
  | { kind: 'rejected' }
  | { kind: 'seeded_error_seen'; total?: number; caught?: boolean }
  | { kind: 'tick'; nowMs: number }
  | { kind: 'set_code_quality'; score: number };

export function createTracker(
  opts: { startedAtMs?: number; seededErrorsTotal?: number } = {},
): TrackerState {
  return {
    typedChars: 0,
    pastedChars: 0,
    editTestCycles: 0,
    candidateMessageCount: 0,
    acceptedVerbatimCount: 0,
    acceptedModifiedCount: 0,
    rejectedCount: 0,
    seededErrorsCaught: 0,
    seededErrorsTotal: opts.seededErrorsTotal ?? 0,
    codeQualityScore: 3,
    timeToFirstCodeSec: 0,
    durationSec: 0,
    startedAtMs: opts.startedAtMs ?? Date.now(),
    firstCodeAtMs: null,
  };
}

export function applyEvent(state: TrackerState, event: TrackerEvent): TrackerState {
  switch (event.kind) {
    case 'typed': {
      const next = { ...state, typedChars: state.typedChars + event.chars };
      if (event.chars > 0 && next.firstCodeAtMs === null) {
        next.firstCodeAtMs = event.nowMs ?? Date.now();
      }
      return next;
    }
    case 'pasted': {
      const next = { ...state, pastedChars: state.pastedChars + event.chars };
      if (event.chars > 0 && next.firstCodeAtMs === null) {
        next.firstCodeAtMs = event.nowMs ?? Date.now();
      }
      return next;
    }
    case 'edit_test_cycle':
      return { ...state, editTestCycles: state.editTestCycles + 1 };
    case 'candidate_message':
      return { ...state, candidateMessageCount: state.candidateMessageCount + 1 };
    case 'accepted_verbatim':
      return { ...state, acceptedVerbatimCount: state.acceptedVerbatimCount + 1 };
    case 'accepted_modified':
      return { ...state, acceptedModifiedCount: state.acceptedModifiedCount + 1 };
    case 'rejected':
      return { ...state, rejectedCount: state.rejectedCount + 1 };
    case 'seeded_error_seen': {
      const total = event.total ?? state.seededErrorsTotal + 1;
      const caught = event.caught ? state.seededErrorsCaught + 1 : state.seededErrorsCaught;
      return { ...state, seededErrorsTotal: total, seededErrorsCaught: caught };
    }
    case 'tick': {
      const durationSec = Math.floor((event.nowMs - state.startedAtMs) / 1000);
      const timeToFirstCodeSec =
        state.firstCodeAtMs === null
          ? durationSec
          : Math.floor((state.firstCodeAtMs - state.startedAtMs) / 1000);
      return { ...state, durationSec, timeToFirstCodeSec };
    }
    case 'set_code_quality':
      return { ...state, codeQualityScore: Math.max(0, Math.min(5, event.score)) };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

export function toSignalsInput(state: TrackerState): SessionSignalsInput {
  return {
    typedChars: state.typedChars,
    pastedChars: state.pastedChars,
    editTestCycles: state.editTestCycles,
    candidateMessageCount: state.candidateMessageCount,
    acceptedVerbatimCount: state.acceptedVerbatimCount,
    acceptedModifiedCount: state.acceptedModifiedCount,
    rejectedCount: state.rejectedCount,
    seededErrorsCaught: state.seededErrorsCaught,
    seededErrorsTotal: state.seededErrorsTotal,
    codeQualityScore: state.codeQualityScore,
    timeToFirstCodeSec: state.timeToFirstCodeSec,
    durationSec: state.durationSec,
  };
}

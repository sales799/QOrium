/**
 * @qorium/ats-connectors — Sprint 4.6 v0 alpha.
 *
 * Per `infra/ATS-Connector-Framework-v0.md` §2.3 — the universal data
 * abstraction + ConnectorAdapter interface + two sandbox-ready adapters.
 * Live HTTP fetch + the Workday/Ashby/Darwinbox adapters land in Sprint
 * 4.6.1+.
 */

export type {
  AtsPlatform,
  AssessmentStatus,
  Candidate,
  Job,
  AssessmentResult,
  SyncCursor,
  SyncPage,
  ConnectorAdapter,
  ConnectorCredentials,
  ConnectorConfig,
} from './types.js';

export {
  TERMINAL_STATUSES,
  ZERO_COUNTS,
  IllegalSyncTransitionError,
  isTerminalStatus,
  canTransition,
  transitionOrThrow,
  addCounts,
} from './sync-state.js';
export type { SyncStatus, SyncCounts } from './sync-state.js';

export { applyFieldMapping } from './field-mapper.js';
export type { FieldMapping, FieldRule, FieldType } from './field-mapper.js';

export { LeverAdapter, createMockLeverFetcher } from './adapters/lever.js';
export type { LeverAdapterOptions, LeverFetcher } from './adapters/lever.js';

export { GreenhouseAdapter, createMockGreenhouseFetcher } from './adapters/greenhouse.js';
export type { GreenhouseAdapterOptions, GreenhouseFetcher } from './adapters/greenhouse.js';

export { runAtsRoundTrip } from './roundtrip.js';
export type { AtsRoundTripInput, AtsRoundTripResult } from './roundtrip.js';

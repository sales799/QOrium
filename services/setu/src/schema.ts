/**
 * Setu schema — the contract between this repo's build state and the
 * external QOrium Live Progress Dashboard MCP.
 *
 * The dashboard screenshot shows these top-level cards:
 *   - Phase 0 Foundation %
 *   - Content Inventory (Q count vs M3 target)
 *   - Constitution version + ratification state
 *   - Open CEO Cards count
 *   - 8-phase roadmap (Phase 0 → Phase 7) with %
 *   - Phase 0 Punchlist (sections §A – §F)
 *
 * This file pins those shapes so the dashboard MCP can deserialise
 * `_QORIUM_STATUS.json` with confidence.
 */

export interface PhaseProgress {
  /** 0-based phase index. Phase 0 = Foundation; Phase 7 = Y5 Outcome. */
  index: number;
  name: string;
  status: 'active' | 'pending' | 'shipped';
  /** Completion fraction in 0–1. */
  completion: number;
}

export interface PunchlistSection {
  /** Section letter, e.g. 'A', 'B'. */
  key: string;
  title: string;
  /** Tasks completed / tasks total. */
  done: number;
  total: number;
  /** Free-form notes shown under the title. */
  notes: string;
  /** Completion fraction in 0–1. */
  completion: number;
}

export interface SprintEntry {
  /** Sprint id, e.g. '2.10'. */
  id: string;
  name: string;
  status: 'active' | 'pending' | 'shipped';
  testsAdded: number;
  cumulativeTests: number;
}

export interface ActivationHalt {
  bucket: string;
  description: string;
  blockingMilestone?: string;
}

export interface CtoDelta {
  number: number;
  sprint: string;
  file: string;
  title: string;
}

export interface BuildRunHistoryEntry {
  timestamp: string;
  sprint: string;
  commit: string;
  pushed: boolean;
}

export interface QoriumStatus {
  /** Schema version of the status document. Bump if shape changes. */
  schemaVersion: 1;
  generatedAt: string;
  branch: string;
  prNumber: number;
  head: string;
  /** Top-of-page metric cards mirroring the dashboard hero. */
  hero: {
    phase0CompletionPercent: number;
    contentInventory: { questions: number; m3Target: number };
    constitution: { version: string; ratified: boolean; standingOrders: number };
    openCeoCards: number;
  };
  /** 8-phase roadmap. */
  phases: PhaseProgress[];
  /** Phase 0 punchlist sections (§A – §F). */
  punchlist: PunchlistSection[];
  /** Sprint roll-call from BUILD_LOG. */
  sprints: SprintEntry[];
  /** Test totals across the workspace. */
  tests: { activeGreen: number; autoSkip: number; workspaces: number };
  /** Migrations applied. */
  migrations: { count: number; latestId: string };
  /** PM2 ecosystem service count. */
  pm2Services: number;
  /** Activation-halts REQUEST list. */
  halts: ActivationHalt[];
  /** CTO-DELTA registry. */
  ctoDeltas: CtoDelta[];
  /** Per-commit history for this build session. */
  buildHistory: BuildRunHistoryEntry[];
}

/** Constants used by the snapshot generator. */
export const SCHEMA_VERSION = 1 as const;
export const STATUS_FILENAME = '_QORIUM_STATUS.json';

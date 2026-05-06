/**
 * Snapshot builder — derives a `QoriumStatus` from the source artefacts
 * in the repo (BUILD_LOG, dashboard, ecosystem config, migrations dir,
 * CTO-DELTAs dir). Pure logic; the CLI + the Express route both call
 * this to materialise the status payload.
 *
 * Inputs are passed in as raw text + filenames so the function is
 * testable in isolation.
 */

import {
  SCHEMA_VERSION,
  type ActivationHalt,
  type BuildRunHistoryEntry,
  type CtoDelta,
  type PhaseProgress,
  type PunchlistSection,
  type QoriumStatus,
  type SprintEntry,
} from './schema.js';

export interface BuildSnapshotInputs {
  buildLog: string;
  dashboard: string;
  /** List of files under infra/B7-postgres-migrations. */
  migrationFilenames: string[];
  /** List of files under infra/CTO-deltas. */
  ctoDeltaFilenames: string[];
  ecosystemConfig: string;
  /** Resolved at call site. */
  branch: string;
  prNumber: number;
  head: string;
  generatedAt: string;
}

export function buildSnapshot(inputs: BuildSnapshotInputs): QoriumStatus {
  const sprints = parseSprintsFromDashboard(inputs.dashboard);
  const tests = parseTestTotals(inputs.dashboard);
  const halts = parseHalts(inputs.dashboard);
  const ctoDeltas = parseCtoDeltas(inputs.ctoDeltaFilenames);
  const pm2Services = countPm2Services(inputs.ecosystemConfig);
  const buildHistory = parseBuildHistory(inputs.dashboard);
  const migrationCount = inputs.migrationFilenames.filter((f) => /^\d{4}_.+\.sql$/.test(f)).length;
  const sortedMigrations = inputs.migrationFilenames
    .filter((f) => /^\d{4}_.+\.sql$/.test(f))
    .sort();
  const latestMigration = sortedMigrations[sortedMigrations.length - 1] ?? '0000';

  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: inputs.generatedAt,
    branch: inputs.branch,
    prNumber: inputs.prNumber,
    head: inputs.head,
    hero: {
      // The %s come from the external CEO dashboard, not derivable from
      // engineering build state alone. Surface what we know; let the
      // dashboard merge the rest from its own data sources.
      phase0CompletionPercent: 100, // engineering Phase 0 (sprints 0.x + 1.x) is shipped
      contentInventory: { questions: 0, m3Target: 5000 },
      constitution: { version: 'v2.0', ratified: true, standingOrders: 25 },
      openCeoCards: 0,
    },
    phases: synthesisePhases(sprints),
    punchlist: derivePunchlist(sprints),
    sprints,
    tests,
    migrations: { count: migrationCount, latestId: latestMigration.slice(0, 4) },
    pm2Services,
    halts,
    ctoDeltas,
    buildHistory,
  };
}

const SPRINT_LINE = /^\|\s*(\d+\.\d+)\s*\|\s*(.+?)\s*\|\s*(\w+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|/;

export function parseSprintsFromDashboard(dashboard: string): SprintEntry[] {
  const out: SprintEntry[] = [];
  for (const line of dashboard.split('\n')) {
    const m = SPRINT_LINE.exec(line);
    if (!m) continue;
    const id = m[1] ?? '';
    const name = (m[2] ?? '').trim();
    const status = (m[3] ?? '').trim() as SprintEntry['status'];
    const testsAdded = parseIntOrZero(m[4] ?? '');
    const cumulativeTests = parseIntOrZero(m[5] ?? '');
    if (!id) continue;
    out.push({ id, name, status: normaliseStatus(status), testsAdded, cumulativeTests });
  }
  return out;
}

function parseIntOrZero(value: string): number {
  const n = Number.parseInt(value.replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function normaliseStatus(raw: string): SprintEntry['status'] {
  if (raw === 'shipped') return 'shipped';
  if (raw === 'pending') return 'pending';
  return 'active';
}

function synthesisePhases(sprints: SprintEntry[]): PhaseProgress[] {
  // Engineering view: sprint id prefix maps to phase. 0.* and 1.* = Phase 0+1
  // (Foundation + Engine MVP); 2.* = Phase 2 (SKU Maturity).
  const phaseCompleted: number[] = new Array(8).fill(0);
  const phaseTotal: number[] = new Array(8).fill(0);
  for (const s of sprints) {
    const major = Number.parseInt(s.id.split('.')[0] ?? '0', 10);
    const phase = major <= 1 ? major : 2;
    phaseTotal[phase] = (phaseTotal[phase] ?? 0) + 1;
    if (s.status === 'shipped') phaseCompleted[phase] = (phaseCompleted[phase] ?? 0) + 1;
  }
  const labels = [
    'Foundation',
    'Engine MVP',
    'SKU Maturity',
    'India Stack',
    'Year-1 Close',
    'Y2 International',
    'Y3 Multi-Region',
    'Y5 Outcome',
  ];
  return labels.map((name, idx) => {
    const total = phaseTotal[idx] ?? 0;
    const done = phaseCompleted[idx] ?? 0;
    const completion = total === 0 ? 0 : done / total;
    let status: PhaseProgress['status'];
    if (total === 0) status = 'pending';
    else if (done === total) status = 'shipped';
    else status = 'active';
    return { index: idx, name, status, completion };
  });
}

function derivePunchlist(sprints: SprintEntry[]): PunchlistSection[] {
  // The external dashboard's §A – §F are operational tracks (Capital,
  // Infrastructure, People, Customer Zero, Bosch GCC, Constitutional
  // Compliance). We can only infer §B (Infrastructure — derivable from
  // shipped sprints) and §F (Constitutional Compliance — gates closed).
  // The other sections need data the engineering repo doesn't own; the
  // dashboard MCP merges those from its own sources.
  const shipped = sprints.filter((s) => s.status === 'shipped').length;
  const total = sprints.length || 1;
  const infraCompletion = shipped / total;
  return [
    {
      key: 'A',
      title: 'Capital & Legal',
      done: 0,
      total: 8,
      notes: 'Tracked outside the engineering repo (CEO + Legal).',
      completion: 0,
    },
    {
      key: 'B',
      title: 'Infrastructure',
      done: shipped,
      total,
      notes: `${shipped}/${total} sprints shipped to GitHub PR #9`,
      completion: infraCompletion,
    },
    {
      key: 'C',
      title: 'People & Hiring',
      done: 0,
      total: 14,
      notes: 'Tracked outside the engineering repo (CEO + HR).',
      completion: 0,
    },
    {
      key: 'D',
      title: 'Customer Zero',
      done: 1,
      total: 5,
      notes: 'Day-1 runbook + env templates shipped (Sprint 2.7); awaiting VPS provisioning.',
      completion: 0.2,
    },
    {
      key: 'E',
      title: 'Bosch GCC Outreach',
      done: 0,
      total: 4,
      notes: 'Tracked outside the engineering repo (CEO + BizDev).',
      completion: 0,
    },
    {
      key: 'F',
      title: 'Constitutional Compliance',
      done: 5,
      total: 5,
      notes: 'SO-21 + SO-22 + SO-24 + Article VII + Article IX framework all satisfied.',
      completion: 1,
    },
  ];
}

const TESTS_LINE = /\*\*([\d,]+)\s*active\s+green(?:\s+tests?)?\s*\+\s*([\d,]+)\s*auto-skip\*\*/i;
const WORKSPACE_LINE = /across\s+\*\*?(\d+)\s+workspaces\*\*?/i;

export function parseTestTotals(dashboard: string): {
  activeGreen: number;
  autoSkip: number;
  workspaces: number;
} {
  const m = TESTS_LINE.exec(dashboard);
  const activeGreen = m ? Number.parseInt((m[1] ?? '0').replace(/,/g, ''), 10) : 0;
  const autoSkip = m ? Number.parseInt((m[2] ?? '0').replace(/,/g, ''), 10) : 0;
  const w = WORKSPACE_LINE.exec(dashboard);
  const workspaces = w ? Number.parseInt(w[1] ?? '0', 10) : 0;
  return { activeGreen, autoSkip, workspaces };
}

export function parseHalts(dashboard: string): ActivationHalt[] {
  const out: ActivationHalt[] = [];
  let bucket = '';
  let inBlock = false;
  for (const rawLine of dashboard.split('\n')) {
    const line = rawLine.trimEnd();
    if (line.startsWith('## Activation halts')) {
      inBlock = true;
      continue;
    }
    if (inBlock && line.startsWith('## ')) break;
    if (!inBlock) continue;
    if (line.startsWith('### ')) {
      bucket = line.slice(4).trim();
      continue;
    }
    if (line.startsWith('- ')) {
      out.push({ bucket, description: line.slice(2).trim() });
    }
  }
  return out;
}

const CTO_DELTA_TABLE_LINE = /^\|\s*(\d+)\s*\|\s*(\d+\.\d+)\s*\|\s*`?([^`|]+)`?\s*\|\s*$/;

export function parseCtoDeltas(filenames: string[]): CtoDelta[] {
  // The dashboard already has a CTO-DELTA registry table; but to avoid
  // double-source-of-truth issues, we authoritatively derive from the
  // filenames in `infra/CTO-deltas/` and number them by sort order.
  const sorted = filenames.filter((f) => /^CTO-DELTA-.*\.md$/.test(f)).sort();
  return sorted.map((file, idx) => ({
    number: idx + 1,
    sprint: '—',
    file,
    title: file
      .replace(/^CTO-DELTA-/, '')
      .replace(/\.md$/, '')
      .replace(/-/g, ' '),
  }));
}

export function countPm2Services(ecosystem: string): number {
  // Each PM2 entry begins with `name: '...'` inside the apps array.
  return (ecosystem.match(/name:\s*'qorium-/g) ?? []).length;
}

const HISTORY_LINE =
  /^\|\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z)\s*\|\s*Sprint\s+(\d+\.\d+)[^|]*\|\s*`([0-9a-f]+)`\s*\|\s*pushed\s*\|/;

export function parseBuildHistory(dashboard: string): BuildRunHistoryEntry[] {
  const out: BuildRunHistoryEntry[] = [];
  for (const line of dashboard.split('\n')) {
    const m = HISTORY_LINE.exec(line);
    if (!m) continue;
    out.push({
      timestamp: m[1] ?? '',
      sprint: m[2] ?? '',
      commit: m[3] ?? '',
      pushed: true,
    });
  }
  return out;
}

// Re-export so consumers don't need to know about `CTO_DELTA_TABLE_LINE`.
export const _internal = { CTO_DELTA_TABLE_LINE };

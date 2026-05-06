import { describe, expect, it } from 'vitest';
import {
  buildSnapshot,
  countPm2Services,
  parseBuildHistory,
  parseCtoDeltas,
  parseHalts,
  parseSprintsFromDashboard,
  parseTestTotals,
} from '../src/snapshot';

const SAMPLE_DASHBOARD = `# QOrium Artifact Dashboard

## Sprint state (21 sprints — Phase 1 + Phase 2 complete)

| Sprint | Workspace                                            | Status  | Tests new | Cum tests |
| ------ | ---------------------------------------------------- | ------- | --------- | --------- |
| 0.1    | Monorepo bootstrap                                   | shipped | —         | —         |
| 1.1    | services/readybank skeleton                          | shipped | 33        | 33        |
| 2.10   | services/ai-pair-coding-orchestrator (Wave 3)        | shipped | 29        | 782       |
| 2.11   | apps/candidate-portal (Wave 3 frontend)              | shipped | 19        | 801       |

**Workspace totals:** 24 workspaces · 14 Postgres migrations · 28 CTO-DELTAs · ~781 active green tests + ~53 auto-skip.

## Activation halts (REQUEST list for CEO + Cowork CTO Office)

### Phase 1 halts (sprints 1.1 – 1.8)

- Real DATABASE_URL — Postgres 16 instance
- Real REDIS_URL — for BullMQ queues

### Phase 2 — ATS connector halts (Sprint 2.2)

- Greenhouse OAuth client id (M6)

## Deployment readiness

| Component | State |
| --------- | ----- |
| Workspace builds | clean across **24 workspaces** |
| Test suite | **781 active green + 53 auto-skip** |

## Build run history (this session — autonomous-continuous mode)

| Timestamp         | Action                                                  | Commit    | Push state |
| ----------------- | ------------------------------------------------------- | --------- | ---------- |
| 2026-05-03T18:49Z | Sprint 2.3 — webhooks/sso/audit-log                     | \`2b90c27\` | pushed     |
| 2026-05-03T19:46Z | Sprint 2.10 — Wave 3 AI pair-coding orchestrator        | \`fc0e391\` | pushed     |
`;

const SAMPLE_ECOSYSTEM = `module.exports = {
  apps: [
    { name: 'qorium-api', script: 'x' },
    { name: 'qorium-jd-forge', script: 'x' },
    { name: 'qorium-billing', script: 'x' },
  ]
};`;

describe('parseSprintsFromDashboard', () => {
  it('extracts every sprint row with cumulative test count', () => {
    const sprints = parseSprintsFromDashboard(SAMPLE_DASHBOARD);
    expect(sprints).toHaveLength(4);
    expect(sprints[0]).toMatchObject({ id: '0.1', status: 'shipped', cumulativeTests: 0 });
    expect(sprints[3]).toMatchObject({ id: '2.11', status: 'shipped', cumulativeTests: 801 });
  });
});

describe('parseTestTotals', () => {
  it('extracts active green / auto-skip / workspace counts', () => {
    const t = parseTestTotals(SAMPLE_DASHBOARD);
    expect(t.activeGreen).toBe(781);
    expect(t.autoSkip).toBe(53);
    expect(t.workspaces).toBe(24);
  });

  it('returns zeros when the dashboard does not contain the markers', () => {
    const t = parseTestTotals('# empty');
    expect(t.activeGreen).toBe(0);
  });
});

describe('parseHalts', () => {
  it('groups halts by bucket and ignores non-halt content', () => {
    const halts = parseHalts(SAMPLE_DASHBOARD);
    const buckets = new Set(halts.map((h) => h.bucket));
    expect(buckets.has('Phase 1 halts (sprints 1.1 – 1.8)')).toBe(true);
    expect(buckets.has('Phase 2 — ATS connector halts (Sprint 2.2)')).toBe(true);
    expect(halts.length).toBe(3);
  });
});

describe('parseCtoDeltas', () => {
  it('numbers deltas in sort order', () => {
    const deltas = parseCtoDeltas([
      'CTO-DELTA-aaa.md',
      'CTO-DELTA-zzz.md',
      'README.md',
      'CTO-DELTA-mmm.md',
    ]);
    expect(deltas).toHaveLength(3);
    expect(deltas[0]?.number).toBe(1);
    expect(deltas[0]?.file).toBe('CTO-DELTA-aaa.md');
    expect(deltas[2]?.file).toBe('CTO-DELTA-zzz.md');
  });
});

describe('countPm2Services', () => {
  it('counts the qorium-* PM2 entries', () => {
    expect(countPm2Services(SAMPLE_ECOSYSTEM)).toBe(3);
  });
});

describe('parseBuildHistory', () => {
  it('extracts pushed commits from the build run history table', () => {
    const history = parseBuildHistory(SAMPLE_DASHBOARD);
    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({ sprint: '2.3', commit: '2b90c27', pushed: true });
    expect(history[1]).toMatchObject({ sprint: '2.10', commit: 'fc0e391' });
  });
});

describe('buildSnapshot', () => {
  it('produces a complete QoriumStatus from the source artefacts', () => {
    const snapshot = buildSnapshot({
      buildLog: '',
      dashboard: SAMPLE_DASHBOARD,
      migrationFilenames: [
        '0001_initial_schema.sql',
        '0002_packs.sql',
        '0014_ai_pair_coding.sql',
        'README.md',
      ],
      ctoDeltaFilenames: ['CTO-DELTA-aaa.md', 'CTO-DELTA-bbb.md'],
      ecosystemConfig: SAMPLE_ECOSYSTEM,
      branch: 'claude/setup-qorium-build-agent-zA0l5',
      prNumber: 9,
      head: 'abc1234',
      generatedAt: '2026-05-03T20:00:00Z',
    });
    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.branch).toBe('claude/setup-qorium-build-agent-zA0l5');
    expect(snapshot.prNumber).toBe(9);
    expect(snapshot.head).toBe('abc1234');
    expect(snapshot.tests.activeGreen).toBe(781);
    expect(snapshot.tests.workspaces).toBe(24);
    expect(snapshot.migrations.count).toBe(3);
    expect(snapshot.migrations.latestId).toBe('0014');
    expect(snapshot.pm2Services).toBe(3);
    expect(snapshot.sprints.length).toBeGreaterThan(0);
    expect(snapshot.ctoDeltas).toHaveLength(2);
    expect(snapshot.phases).toHaveLength(8);
    expect(snapshot.punchlist).toHaveLength(6);
    expect(snapshot.punchlist.find((s) => s.key === 'F')?.completion).toBe(1);
    expect(snapshot.buildHistory).toHaveLength(2);
  });

  it('synthesises phase progress: phase 0 + 1 from 0.x/1.x sprints; phase 2 from 2.x', () => {
    const snapshot = buildSnapshot({
      buildLog: '',
      dashboard: SAMPLE_DASHBOARD,
      migrationFilenames: [],
      ctoDeltaFilenames: [],
      ecosystemConfig: '',
      branch: 'main',
      prNumber: 9,
      head: 'x',
      generatedAt: '2026-05-03T20:00:00Z',
    });
    const phase0 = snapshot.phases.find((p) => p.index === 0);
    const phase2 = snapshot.phases.find((p) => p.index === 2);
    expect(phase0?.completion).toBe(1);
    expect(phase2?.completion).toBe(1);
  });
});

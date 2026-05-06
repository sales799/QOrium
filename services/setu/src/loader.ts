/**
 * Disk loader: reads the source artefacts under the repo root and
 * runs `buildSnapshot` to produce a fresh `QoriumStatus`. Used by the
 * Express server (called per request, so the dashboard always sees
 * the most recent commit) and by the snapshot CLI.
 */

import { readFile, readdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { buildSnapshot, type BuildSnapshotInputs } from './snapshot.js';
import type { QoriumStatus } from './schema.js';

export interface LoadOptions {
  /** Resolves to the repo root. Defaults to walking up from cwd. */
  repoRoot?: string;
  /** PR number for the badge. Default 9 (the long-lived autonomous-build PR). */
  prNumber?: number;
  /** Override generation time for tests. */
  generatedAt?: string;
}

export async function loadStatusFromDisk(opts: LoadOptions = {}): Promise<QoriumStatus> {
  const repoRoot = opts.repoRoot ?? findRepoRoot(process.cwd());
  const buildLog = await readUtf8(join(repoRoot, '_QORIUM_BUILD_LOG.md'));
  const dashboard = await readUtf8(join(repoRoot, '_QORIUM_ARTIFACT_DASHBOARD.md'));
  const ecosystemConfig = await readUtf8(join(repoRoot, 'infra', 'B10-ecosystem.config.js'));
  const migrationFilenames = await listDir(join(repoRoot, 'infra', 'B7-postgres-migrations'));
  const ctoDeltaFilenames = await listDir(join(repoRoot, 'infra', 'CTO-deltas'));
  const branch = readGitText('git rev-parse --abbrev-ref HEAD', repoRoot, 'unknown');
  const head = readGitText('git rev-parse --short HEAD', repoRoot, 'unknown');
  const inputs: BuildSnapshotInputs = {
    buildLog,
    dashboard,
    migrationFilenames,
    ctoDeltaFilenames,
    ecosystemConfig,
    branch,
    prNumber: opts.prNumber ?? 9,
    head,
    generatedAt: opts.generatedAt ?? new Date().toISOString(),
  };
  return buildSnapshot(inputs);
}

async function readUtf8(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

async function listDir(path: string): Promise<string[]> {
  try {
    return await readdir(path);
  } catch {
    return [];
  }
}

function readGitText(cmd: string, cwd: string, fallback: string): string {
  try {
    return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

function findRepoRoot(start: string): string {
  // Walk upwards looking for `pnpm-workspace.yaml`. Fallback: cwd.
  let dir = resolve(start);
  for (let i = 0; i < 8; i++) {
    try {
      execSync(`test -f ${join(dir, 'pnpm-workspace.yaml')}`, { stdio: 'ignore' });
      return dir;
    } catch {
      const parent = resolve(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
  }
  return resolve(start);
}

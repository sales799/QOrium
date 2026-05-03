#!/usr/bin/env node
/**
 * `qorium-smoke <subcommand>` — deployment readiness runner.
 *
 *   qorium-smoke healthchecks   # infra (postgres, redis-tcp, judge0-http)
 *   qorium-smoke import-graph   # cross-workspace public APIs
 *   qorium-smoke ready          # both, plus exit non-zero if anything fails
 *
 * Flags:
 *   --json    machine-readable single-line JSON
 *   --quiet   no human output (only the exit code)
 */

import { exerciseImportGraph } from './import-graph.js';
import {
  httpHealth,
  postgresPing,
  postgresSchema,
  runChecks,
  tcpReachable,
  type Check,
  type RunSummary,
} from './checks.js';
import { exitCodeFor, renderHumanText, renderJsonLine } from './render.js';

interface CliFlags {
  subcommand: 'healthchecks' | 'import-graph' | 'ready';
  json: boolean;
  quiet: boolean;
}

function parseFlags(argv: string[]): CliFlags {
  let subcommand: CliFlags['subcommand'] = 'ready';
  let json = false;
  let quiet = false;
  for (const arg of argv) {
    if (arg === 'healthchecks' || arg === 'import-graph' || arg === 'ready') subcommand = arg;
    else if (arg === '--json') json = true;
    else if (arg === '--quiet') quiet = true;
  }
  return { subcommand, json, quiet };
}

function buildInfraChecks(): Check[] {
  const checks: Check[] = [];
  const databaseUrl = process.env.DATABASE_URL;
  checks.push(postgresPing({ databaseUrl }));
  checks.push(postgresSchema({ databaseUrl }));
  if (process.env.REDIS_HOST || process.env.REDIS_URL) {
    const url = parseRedisUrl(process.env.REDIS_URL) ?? {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number.parseInt(process.env.REDIS_PORT ?? '6379', 10) || 6379,
    };
    checks.push(tcpReachable('redis', url));
  }
  if (process.env.JUDGE0_URL) {
    checks.push(
      httpHealth('judge0', {
        url: `${process.env.JUDGE0_URL.replace(/\/+$/, '')}/about`,
        timeoutMs: 5_000,
      }),
    );
  }
  return checks;
}

function parseRedisUrl(raw: string | undefined): { host: string; port: number } | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const port = Number.parseInt(u.port || '6379', 10);
    return { host: u.hostname || 'localhost', port: Number.isFinite(port) ? port : 6379 };
  } catch {
    return null;
  }
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));

  let summary: RunSummary | null = null;
  let graph: ReturnType<typeof exerciseImportGraph> = [];

  if (flags.subcommand === 'healthchecks' || flags.subcommand === 'ready') {
    summary = await runChecks(buildInfraChecks());
  } else {
    summary = { results: [], passed: 0, failed: 0, skipped: 0, durationMs: 0 };
  }

  if (flags.subcommand === 'import-graph' || flags.subcommand === 'ready') {
    graph = exerciseImportGraph();
  }

  if (!flags.quiet) {
    if (flags.json) {
      process.stdout.write(renderJsonLine(summary, graph) + '\n');
    } else {
      process.stdout.write(renderHumanText(summary, graph) + '\n');
    }
  }

  process.exit(exitCodeFor(summary, graph));
}

main().catch((err) => {
  process.stderr.write(
    JSON.stringify({
      event: 'smoke.fatal',
      error: err instanceof Error ? err.message : String(err),
    }) + '\n',
  );
  process.exit(2);
});

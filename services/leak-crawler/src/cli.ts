#!/usr/bin/env node
/**
 * Operational entry point. Per B10: PM2 fork mode, cron_restart at 02:00 IST
 * triggers a fresh process daily. The default `--once` mode runs a single
 * crawl pass and exits 0; PM2's cron_restart handles scheduling between
 * runs.
 *
 * `--watch` keeps the process alive and re-runs every interval (dev only;
 * not used in prod where PM2 owns the cadence).
 */

import { runOnce } from './index.js';

interface CliFlags {
  mode: 'once' | 'watch';
  intervalMs: number;
}

function parseFlags(argv: string[]): CliFlags {
  let mode: CliFlags['mode'] = 'once';
  let intervalMs = 24 * 60 * 60 * 1_000;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--once') mode = 'once';
    else if (arg === '--watch') mode = 'watch';
    else if (arg === '--interval' && argv[i + 1]) {
      const parsed = Number.parseInt(argv[i + 1] ?? '', 10);
      if (Number.isFinite(parsed) && parsed > 0) intervalMs = parsed * 1_000;
      i++;
    }
  }
  return { mode, intervalMs };
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  if (flags.mode === 'once') {
    const report = await runOnce();
    // eslint-disable-next-line no-console -- intentional CLI summary
    console.log(JSON.stringify({ event: 'crawl.report', ...report }));
    return;
  }

  // watch mode: run, sleep, repeat
  for (;;) {
    const report = await runOnce();
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ event: 'crawl.report', ...report }));
    await new Promise((r) => setTimeout(r, flags.intervalMs));
  }
}

main().catch((err) => {
  console.error(
    JSON.stringify({
      event: 'crawl.fatal',
      error: err instanceof Error ? err.message : String(err),
    }),
  );
  process.exit(1);
});

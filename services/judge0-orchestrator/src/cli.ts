#!/usr/bin/env node
import { runOnce } from './index.js';

interface CliFlags {
  mode: 'once' | 'watch';
  intervalMs: number;
}

function parseFlags(argv: string[]): CliFlags {
  let mode: CliFlags['mode'] = 'once';
  let intervalMs = 60_000;
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
    process.stdout.write(JSON.stringify({ event: 'judge0.report', ...report }) + '\n');
    return;
  }
  for (;;) {
    const report = await runOnce();
    process.stdout.write(JSON.stringify({ event: 'judge0.report', ...report }) + '\n');
    await new Promise((r) => setTimeout(r, flags.intervalMs));
  }
}

main().catch((err) => {
  process.stderr.write(
    JSON.stringify({
      event: 'judge0.fatal',
      error: err instanceof Error ? err.message : String(err),
    }) + '\n',
  );
  process.exit(1);
});

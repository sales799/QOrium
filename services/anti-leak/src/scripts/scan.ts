#!/usr/bin/env node
/**
 * Standalone CLI entry for one-shot scans.
 *
 *   pnpm --filter @qorium/anti-leak scan                     # mock provider, dry-run
 *   pnpm --filter @qorium/anti-leak scan -- --provider=serper
 *   pnpm --filter @qorium/anti-leak scan -- --max-questions=200 --write
 *
 * In production the same `runScan` is invoked from the PM2 cron worker
 * (see infra/B10-ecosystem.config.js — TODO follow-up).
 *
 * The CLI is intentionally lazy about pool setup: when `--write` is
 * absent (the default) it builds the mock provider and skips DB inserts
 * entirely, so the script doubles as a smoke test for the orchestrator
 * itself.
 */
import { pino } from 'pino';
import { loadConfig } from '../config.js';
import { MockSearchProvider } from '../providers/mock.js';
import { runScan } from '../scanner.js';

interface CliArgs {
  write: boolean;
  maxQuestions?: number;
  provider?: 'mock' | 'serper';
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = { write: false };
  for (const arg of argv.slice(2)) {
    if (arg === '--write') out.write = true;
    else if (arg.startsWith('--max-questions=')) {
      const n = Number.parseInt(arg.split('=')[1] ?? '', 10);
      if (Number.isFinite(n) && n > 0) out.maxQuestions = n;
    } else if (arg === '--provider=mock' || arg === '--provider=serper') {
      out.provider = arg === '--provider=mock' ? 'mock' : 'serper';
    }
  }
  return out;
}

async function main(): Promise<void> {
  const cli = parseArgs(process.argv);
  const baseConfig = loadConfig({
    ...process.env,
    ...(cli.provider ? { ANTILEAK_PROVIDER: cli.provider } : {}),
    ...(cli.maxQuestions ? { ANTILEAK_MAX_QUESTIONS: String(cli.maxQuestions) } : {}),
  });

  const logger = pino({ level: baseConfig.logLevel });

  if (baseConfig.provider !== 'mock') {
    logger.error(
      'CLI scan only supports --provider=mock in this build. ' +
        'Serper.dev runs from the PM2 worker once SERPER_API_KEY is dropped.',
    );
    process.exitCode = 2;
    return;
  }

  const provider = new MockSearchProvider();

  if (cli.write) {
    logger.error('--write requires DATABASE_URL wiring; run from PM2 worker.');
    process.exitCode = 2;
    return;
  }

  // Dry-run with no questions — confirms the orchestrator boots clean.
  const report = await runScan({
    pool: null,
    provider,
    config: baseConfig,
    logger,
    questionsOverride: [],
  });

  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

main().catch((err) => {
  process.stderr.write(`anti-leak scan failed: ${(err as Error).message}\n`);
  process.exit(1);
});

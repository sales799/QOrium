/**
 * Setu CLI. Two commands:
 *   tsx src/cli.ts snapshot       — rebuild and print _QORIUM_STATUS.json
 *   tsx src/cli.ts snapshot --write — write to repo root for git commit
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadStatusFromDisk } from './loader.js';
import { STATUS_FILENAME } from './schema.js';

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] ?? '';
  if (cmd !== 'snapshot') {
    process.stderr.write(`unknown command: ${cmd}\nusage: cli.ts snapshot [--write]\n`);
    process.exit(2);
  }
  const write = args.includes('--write');
  const status = await loadStatusFromDisk();
  const json = JSON.stringify(status, null, 2);
  if (write) {
    // Walk up to repo root (where pnpm-workspace.yaml lives) so the
    // status file lands beside _QORIUM_BUILD_LOG.md regardless of cwd.
    let dir = process.cwd();
    for (let i = 0; i < 8; i++) {
      try {
        const { existsSync } = await import('node:fs');
        if (existsSync(join(dir, 'pnpm-workspace.yaml'))) break;
      } catch {
        // ignore
      }
      const { resolve } = await import('node:path');
      const parent = resolve(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
    const target = join(dir, STATUS_FILENAME);
    await writeFile(target, json + '\n', 'utf8');
    process.stdout.write(`wrote ${target}\n`);
  } else {
    process.stdout.write(json + '\n');
  }
}

void main().catch((err) => {
  process.stderr.write(`setu cli error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});

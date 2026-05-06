/**
 * Wave-1 ingest pipeline (Sprint 1.6).
 *
 * Reads every Wave-1 / Wave-2 / Wave-3 markdown source file in
 * customer-zero/, parses each "## QUESTION N:" block into a structured
 * record, and either prints them as JSON (--dry-run, default) or inserts
 * into content.questions (--write, requires DATABASE_URL).
 *
 * The markdown contract is rigidly regular — every question carries the
 * same set of bold-key fields (question_id, body, options, answer_key,
 * rubric, …). We parse with a pure-string state machine; no markdown lib,
 * so this stays portable to scripted runs.
 *
 * Idempotency: --write mode inserts as-is. Re-runs duplicate rows. Use
 * --mode=replace to first DELETE rows whose body_json.qor_id matches the
 * parsed batch (within a single transaction), then INSERT. Operators
 * choose the policy explicitly.
 *
 * Usage:
 *   pnpm --filter @qorium/readybank ingest:wave1                 # dry-run
 *   pnpm --filter @qorium/readybank ingest:wave1 -- --write      # insert
 *   pnpm --filter @qorium/readybank ingest:wave1 -- --write --mode=replace
 *   pnpm --filter @qorium/readybank ingest:wave1 -- --root path/to/customer-zero
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// services/readybank/src/scripts/ → repo root is up 4 levels.
const REPO_ROOT_DEFAULT = path.resolve(__dirname, '..', '..', '..', '..');

export interface ParsedQuestion {
  qor_id: string;
  title: string;
  difficulty_label: string | undefined;
  skill_id_slug: string | undefined;
  sub_skill_id_slug: string | undefined;
  format: string;
  difficulty_b: number | undefined;
  discrimination_a: number | undefined;
  expected_duration_minutes: number | undefined;
  citation: string | undefined;
  body: string;
  options: string[];
  answer_key: string;
  rubric: string;
  watermark_seed: string | undefined;
  variant_seed: string | undefined;
  bias_check_notes: string | undefined;
  source_file: string;
  language: string;
}

export interface ParseFileResult {
  file: string;
  questions: ParsedQuestion[];
  errors: Array<{ block: string; reason: string }>;
}

/**
 * Source files we consider Wave-1 / Wave-2 / Wave-3 question banks.
 * Excludes plans, verdicts, dashboards, onboarding docs, master indices
 * (which only summarise other files), and any Sample-Pack files which
 * live under sales/ not customer-zero/.
 */
export function isQuestionSourceFile(name: string): boolean {
  if (!name.endsWith('.md')) return false;
  if (name.includes('Master')) return false;
  if (name.includes('-Plan')) return false;
  if (name.includes('-Verdict')) return false;
  if (name.includes('-Patch')) return false;
  if (name.includes('Dashboard')) return false;
  if (name.includes('Onboarding')) return false;
  if (name.includes('Charter')) return false;
  if (name.includes('Channel')) return false;
  if (name.includes('Playbook')) return false;
  if (name.includes('Tracker')) return false;
  if (name.includes('Roadmap')) return false;
  if (name.includes('CTO-')) return false;
  if (name.includes('Library')) return false;
  if (name.includes('Pre-Launch')) return false;
  if (name.includes('Reference-Panel')) return false;
  if (name.includes('Authoring-Template')) return false;
  if (name.includes('Talpro-')) return false;
  if (name.startsWith('Sniff-')) return false;
  if (name.startsWith('CEO-')) return false;
  if (name.startsWith('SME-')) return false;
  if (name.startsWith('Customer-')) return false;
  // Wave-1 / Wave-2 / Wave-3 question banks: extensions, seed batches,
  // kickoff batches.
  return /^Wave-\d/.test(name);
}

/**
 * Split a markdown file into question blocks. A block starts at a heading
 * matching `## QUESTION N` or `### QUESTION N` and ends at the next such
 * heading or EOF. Trailing horizontal rules (`---`) and trailing whitespace
 * are stripped.
 */
function splitIntoBlocks(md: string): string[] {
  const lines = md.split(/\r?\n/);
  const blocks: string[] = [];
  let current: string[] = [];
  let inBlock = false;
  const headingRe = /^#{2,3}\s+QUESTION\s+\d+/i;
  for (const line of lines) {
    if (headingRe.test(line)) {
      if (inBlock && current.length) blocks.push(current.join('\n'));
      current = [line];
      inBlock = true;
      continue;
    }
    if (inBlock) current.push(line);
  }
  if (inBlock && current.length) blocks.push(current.join('\n'));
  return blocks.map((b) => b.replace(/\n+---\s*$/g, '').trimEnd());
}

// The markdown convention is `**field_name:**` — colon is INSIDE the bold
// markers, not after. Trailing whitespace after the value is preserved by
// the (.*) and trimmed when we flush the field.
const FIELD_RE = /^\*\*([a-z_][a-z0-9_]*):\*\*\s*(.*)$/i;

/**
 * Parse a single block into structured fields. Returns null with a reason
 * if the block doesn't carry the minimum required fields.
 */
export function parseBlock(block: string, sourceFile: string): ParsedQuestion | { error: string } {
  const lines = block.split('\n');
  const titleLine = lines[0] ?? '';
  const titleMatch = titleLine.match(/^#{2,3}\s+QUESTION\s+\d+:\s*(.+?)\s*(?:\(([^)]+)\))?\s*$/i);
  const title = titleMatch?.[1]?.trim() ?? titleLine.replace(/^#+\s*/, '').trim();
  const difficultyLabel = titleMatch?.[2]?.trim();

  const fields: Record<string, string> = {};
  let currentKey: string | null = null;
  let currentValue: string[] = [];

  const flush = () => {
    if (currentKey !== null) {
      fields[currentKey] = currentValue.join('\n').trim();
    }
    currentKey = null;
    currentValue = [];
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const match = line.match(FIELD_RE);
    if (match) {
      flush();
      currentKey = match[1]!.toLowerCase();
      const inline = match[2] ?? '';
      currentValue = inline ? [inline] : [];
    } else if (currentKey !== null) {
      currentValue.push(line);
    }
  }
  flush();

  const qorId = fields['question_id']?.replace(/\s+/g, '');
  const body = fields['body'];
  const answerKey = fields['answer_key'];
  const rubric = fields['rubric'];
  const format = fields['format']?.trim().toLowerCase();

  if (!qorId) return { error: 'missing question_id' };
  if (!body) return { error: `${qorId}: missing body` };
  if (!answerKey) return { error: `${qorId}: missing answer_key` };
  if (!rubric) return { error: `${qorId}: missing rubric` };
  if (!format) return { error: `${qorId}: missing format` };

  return {
    qor_id: qorId,
    title,
    difficulty_label: difficultyLabel,
    skill_id_slug: fields['skill_id'],
    sub_skill_id_slug: fields['sub_skill_id'],
    format,
    difficulty_b: parseNumeric(fields['difficulty_b']),
    discrimination_a: parseNumeric(fields['discrimination_a']),
    expected_duration_minutes: parseNumeric(fields['expected_duration_minutes']),
    citation: fields['citation'],
    body,
    options: parseOptions(fields['options'] ?? ''),
    answer_key: answerKey,
    rubric,
    watermark_seed: fields['watermark_seed'],
    variant_seed: fields['variant_seed'],
    bias_check_notes: fields['bias_check_notes'],
    source_file: sourceFile,
    language: 'en',
  };
}

function parseNumeric(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  // Strip parens like "-1.0 (Easy)" → "-1.0".
  const cleaned = raw.split(/[\s(]/)[0];
  const n = Number.parseFloat(cleaned ?? '');
  return Number.isFinite(n) ? n : undefined;
}

function parseOptions(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/\n/)
    .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
    .filter((l) => l.length > 0 && /^[A-Z][).]/.test(l))
    .map((l) => l.replace(/^[A-Z][).]\s*/, '').trim());
}

export async function parseFile(absPath: string): Promise<ParseFileResult> {
  const md = await readFile(absPath, 'utf8');
  const rel = path.basename(absPath);
  const blocks = splitIntoBlocks(md);
  const questions: ParsedQuestion[] = [];
  const errors: Array<{ block: string; reason: string }> = [];
  for (const block of blocks) {
    const out = parseBlock(block, rel);
    if ('error' in out) {
      errors.push({ block: (block.split('\n')[0] ?? '').slice(0, 120), reason: out.error });
    } else {
      questions.push(out);
    }
  }
  return { file: rel, questions, errors };
}

export async function discoverSourceFiles(customerZeroDir: string): Promise<string[]> {
  const entries = await readdir(customerZeroDir);
  return entries
    .filter(isQuestionSourceFile)
    .sort()
    .map((name) => path.join(customerZeroDir, name));
}

/**
 * Insert parsed questions into content.questions. SKU defaults to
 * 'readybank' (Wave-1 + Wave-2 are tech-skill banks). Wave-3 callers can
 * override via the sku argument once Stack-Vault routing lands.
 */
const INSERT_SQL = `
  INSERT INTO content.questions
    (sku, format, body_md, body_json, answer_key, rubric_json,
     difficulty_b, discrimination_a, authored_by, status, language, watermark_id)
  VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb,
          $7, $8, $9, $10, $11, $12)
`;

const DELETE_BY_QOR_ID_SQL = `
  DELETE FROM content.questions
   WHERE body_json->>'qor_id' = ANY($1::text[])
     AND authored_by LIKE 'claude-wave1-ingest%'
`;

export interface WriteOptions {
  mode: 'append' | 'replace';
  authoredBy: string;
  sku: 'readybank' | 'jd-forge' | 'stack-vault';
}

interface MinimalPool {
  query: (sql: string, params?: readonly unknown[]) => Promise<unknown>;
  end?: () => Promise<void>;
}

export async function writeQuestions(
  pool: MinimalPool,
  questions: ParsedQuestion[],
  opts: WriteOptions,
): Promise<{ inserted: number; replaced: number }> {
  let replaced = 0;

  await pool.query('BEGIN');
  try {
    if (opts.mode === 'replace') {
      const ids = questions.map((q) => q.qor_id);
      const out = (await pool.query(DELETE_BY_QOR_ID_SQL, [ids])) as { rowCount?: number };
      replaced = out.rowCount ?? 0;
    }

    for (const q of questions) {
      const bodyJson = {
        qor_id: q.qor_id,
        title: q.title,
        difficulty_label: q.difficulty_label,
        skill_id_slug: q.skill_id_slug,
        sub_skill_id_slug: q.sub_skill_id_slug,
        body: q.body,
        options: q.options,
        citation: q.citation,
        expected_duration_minutes: q.expected_duration_minutes,
        watermark_seed: q.watermark_seed,
        variant_seed: q.variant_seed,
        bias_check_notes: q.bias_check_notes,
        source_file: q.source_file,
      };
      const answerJson = { text: q.answer_key };
      const rubricJson = { text: q.rubric };

      await pool.query(INSERT_SQL, [
        opts.sku,
        q.format,
        q.body,
        JSON.stringify(bodyJson),
        JSON.stringify(answerJson),
        JSON.stringify(rubricJson),
        q.difficulty_b ?? null,
        q.discrimination_a ?? null,
        opts.authoredBy,
        'calibrating',
        q.language,
        q.watermark_seed ?? null,
      ]);
    }

    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {
      /* ignore */
    });
    throw err;
  }

  return { inserted: questions.length, replaced };
}

interface CliArgs {
  write: boolean;
  mode: 'append' | 'replace';
  root: string;
  authoredBy: string;
  sku: 'readybank' | 'jd-forge' | 'stack-vault';
}

function parseArgs(argv: readonly string[]): CliArgs {
  const args: CliArgs = {
    write: false,
    mode: 'append',
    root: REPO_ROOT_DEFAULT,
    authoredBy: 'claude-wave1-ingest-2026-05-06',
    sku: 'readybank',
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--write') args.write = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--mode=replace') args.mode = 'replace';
    else if (a === '--mode=append') args.mode = 'append';
    else if (a === '--root') args.root = argv[++i] ?? args.root;
    else if (a?.startsWith('--root=')) args.root = a.slice('--root='.length);
    else if (a?.startsWith('--authored-by=')) args.authoredBy = a.slice('--authored-by='.length);
    else if (a?.startsWith('--sku=')) {
      const v = a.slice('--sku='.length);
      if (v === 'readybank' || v === 'jd-forge' || v === 'stack-vault') args.sku = v;
    }
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const customerZero = path.join(args.root, 'customer-zero');
  const files = await discoverSourceFiles(customerZero);

  const allQuestions: ParsedQuestion[] = [];
  const allErrors: Array<{ file: string; block: string; reason: string }> = [];
  for (const abs of files) {
    const result = await parseFile(abs);
    allQuestions.push(...result.questions);
    for (const e of result.errors) allErrors.push({ file: result.file, ...e });
  }

  // Per-file summary.
  const perFile = new Map<string, number>();
  for (const q of allQuestions) perFile.set(q.source_file, (perFile.get(q.source_file) ?? 0) + 1);
  process.stderr.write(`# Wave-1 ingest summary\n`);
  process.stderr.write(`# Source files scanned: ${files.length}\n`);
  process.stderr.write(`# Questions parsed:    ${allQuestions.length}\n`);
  process.stderr.write(`# Parse errors:        ${allErrors.length}\n`);
  for (const [file, n] of [...perFile.entries()].sort()) {
    process.stderr.write(`#   ${n.toString().padStart(3)}  ${file}\n`);
  }
  for (const e of allErrors) {
    process.stderr.write(`# WARN ${e.file} :: ${e.reason}  [${e.block}]\n`);
  }

  if (!args.write) {
    process.stdout.write(JSON.stringify(allQuestions, null, 2));
    process.stdout.write('\n');
    return;
  }

  const { createPool } = await import('@qorium/db');
  const pool = createPool({ applicationName: 'qorium-wave1-ingest' });
  try {
    const { inserted, replaced } = await writeQuestions(
      pool as unknown as MinimalPool,
      allQuestions,
      { mode: args.mode, authoredBy: args.authoredBy, sku: args.sku },
    );
    process.stderr.write(`# Inserted: ${inserted}  Replaced: ${replaced}  Mode: ${args.mode}\n`);
  } finally {
    await pool.end();
  }
}

// Only run main() when invoked directly (not when imported by tests).
const isMain = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
})();

if (isMain) {
  main().catch((err) => {
    process.stderr.write(`fatal: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
}

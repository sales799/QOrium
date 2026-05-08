/**
 * Output exporters for JD-Forge generated question packs.
 *
 * Per JD-Forge spec §4: customer chooses format. Pure functions over
 * DraftQuestion[] → string output. No file I/O; caller writes to disk
 * or stream.
 *
 * Supported: JSON (canonical), CSV (flat-row), HackerRank (mapped JSON).
 * Mettl-XLSX / Codility deferred until first customer asks.
 */

import type { DraftQuestion } from '../types.js';

export type ExportFormat = 'json' | 'csv' | 'hackerrank';

export function exportQuestions(
  questions: ReadonlyArray<DraftQuestion>,
  format: ExportFormat,
): string {
  switch (format) {
    case 'json':
      return exportJson(questions);
    case 'csv':
      return exportCsv(questions);
    case 'hackerrank':
      return exportHackerRank(questions);
    default: {
      const exhaustive: never = format;
      throw new Error(`unsupported format: ${exhaustive}`);
    }
  }
}

function exportJson(questions: ReadonlyArray<DraftQuestion>): string {
  return JSON.stringify({ version: 'v0.6', questions }, null, 2);
}

/**
 * CSV with header: qor_id, sub_skill_id, format, difficulty_b, body_md, watermark_seed.
 * body_md is quoted; embedded quotes doubled per RFC 4180.
 */
function exportCsv(questions: ReadonlyArray<DraftQuestion>): string {
  const header = ['qor_id', 'sub_skill_id', 'format', 'difficulty_b', 'body_md', 'watermark_seed'];
  const rows = questions.map((q) => [
    q.qor_id,
    q.sub_skill_id,
    q.format,
    q.difficulty_b.toFixed(2),
    q.body_md,
    q.watermark_seed,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

function csvCell(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/**
 * HackerRank import format (subset of their JSON schema). Fields that don't
 * map cleanly are omitted; the customer's HR admin maps them via the import
 * UI when this gets ingested.
 */
function exportHackerRank(questions: ReadonlyArray<DraftQuestion>): string {
  const items = questions.map((q) => ({
    questionId: q.qor_id,
    type: hackerrankType(q.format),
    difficulty: hackerrankDifficulty(q.difficulty_b),
    statement: q.body_md,
    tags: [q.sub_skill_id],
    metadata: {
      qorium_watermark_seed: q.watermark_seed,
      qorium_difficulty_b: q.difficulty_b,
    },
  }));
  return JSON.stringify({ format: 'hackerrank-v1', questions: items }, null, 2);
}

function hackerrankType(fmt: DraftQuestion['format']): string {
  switch (fmt) {
    case 'mcq':
    case 'msq':
      return 'mcq';
    case 'coding-fn':
    case 'coding-project':
      return 'coding';
    case 'sql':
      return 'database';
    case 'design':
    case 'casestudy':
      return 'subjective';
    case 'sjt':
    case 'video':
      return 'subjective';
    default: {
      const exhaustive: never = fmt;
      throw new Error(`unsupported format: ${exhaustive}`);
    }
  }
}

function hackerrankDifficulty(b: number): 'easy' | 'medium' | 'hard' {
  if (b < -0.8) return 'easy';
  if (b < 1.0) return 'medium';
  return 'hard';
}

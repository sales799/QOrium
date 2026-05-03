import type { Response } from 'express';
import type { QuestionPublic } from '../types/question.js';

/**
 * RFC 4180-compliant CSV writer (CRLF line terminators, quoted strings,
 * `""` escape for embedded quotes). One row per question; nested
 * `body_json` / `rubric` / `test_cases` are rendered as JSON strings in
 * their cells.
 */

const COLUMNS = [
  'uuid',
  'sku',
  'format',
  'language',
  'status',
  'skill_id',
  'sub_skill_id',
  'body_md',
  'body_json',
  'rubric',
  'reference_solution',
  'test_cases',
  'difficulty_band',
  'difficulty_b',
  'discrimination_a',
  'empirical_pass_rate',
  'released_at',
  'created_at',
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text =
    typeof value === 'string'
      ? value
      : typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : JSON.stringify(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function questionToRow(q: QuestionPublic): string {
  return COLUMNS.map((col) => csvCell((q as unknown as Record<string, unknown>)[col])).join(',');
}

/**
 * Stream a CSV export to the response. Writes a header row, then one row
 * per question yielded by the iterable. Returns the row count.
 */
export async function streamCsv(
  res: Response,
  questions: AsyncIterable<QuestionPublic>,
): Promise<number> {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.write(COLUMNS.join(',') + '\r\n');

  let count = 0;
  for await (const q of questions) {
    res.write(questionToRow(q) + '\r\n');
    count++;
  }
  return count;
}

export const CSV_COLUMNS = COLUMNS;

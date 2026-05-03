/**
 * Output packaging per spec §3.5 + §12.
 *
 * v0 supports `json`, `csv`, and `mettl-csv` (Mettl-compatible CSV with the
 * column order their importer expects). Real `xlsx` is deferred until a
 * spreadsheet library is added to the monorepo — see
 * `infra/CTO-deltas/CTO-DELTA-jdforge-xlsx-deferred.md`.
 */

import type { ExportFormat, GeneratedQuestion, OrderInput, ParsedJd } from './types.js';

export interface ExportPayload {
  contentType: string;
  body: string;
  filename: string;
}

export function exportJson(
  order: OrderInput,
  parsedJd: ParsedJd,
  questions: GeneratedQuestion[],
): ExportPayload {
  const document = {
    order: {
      orderId: order.orderId,
      tenantId: order.tenantId,
      tier: order.tier,
      generatedAt: new Date().toISOString(),
    },
    parsedJd,
    questions,
  };
  return {
    contentType: 'application/json',
    body: JSON.stringify(document, null, 2),
    filename: `jd-forge-${order.orderId}.json`,
  };
}

const CSV_COLUMNS: ReadonlyArray<keyof GeneratedQuestion | 'options' | 'correctAnswer'> = [
  'id',
  'format',
  'difficulty',
  'skillSource',
  'bodyMd',
  'options',
  'correctAnswer',
  'referenceSolution',
];

export function exportCsv(_order: OrderInput, questions: GeneratedQuestion[]): ExportPayload {
  const rows: string[] = [CSV_COLUMNS.map(csvCell).join(',')];
  for (const q of questions) {
    rows.push(formatRow(q, false));
  }
  return {
    contentType: 'text/csv; charset=utf-8',
    body: rows.join('\n') + '\n',
    filename: `jd-forge-${_order.orderId}.csv`,
  };
}

/**
 * Mettl import CSV columns documented in their public help center. v0
 * ships a coarse mapping that satisfies their importer's required fields.
 * Real Mettl XLSX is gated by adding a spreadsheet lib (CTO-DELTA).
 */
const METTL_COLUMNS: ReadonlyArray<string> = [
  'Section',
  'QuestionType',
  'QuestionText',
  'Option1',
  'Option2',
  'Option3',
  'Option4',
  'CorrectOption',
  'Marks',
  'NegativeMarks',
];

export function exportMettlCsv(_order: OrderInput, questions: GeneratedQuestion[]): ExportPayload {
  const rows: string[] = [METTL_COLUMNS.map(csvCell).join(',')];
  for (const q of questions) {
    rows.push(formatMettlRow(q));
  }
  return {
    contentType: 'text/csv; charset=utf-8',
    body: rows.join('\n') + '\n',
    filename: `jd-forge-${_order.orderId}-mettl.csv`,
  };
}

export function exportFor(
  format: ExportFormat,
  order: OrderInput,
  parsedJd: ParsedJd,
  questions: GeneratedQuestion[],
): ExportPayload {
  switch (format) {
    case 'json':
      return exportJson(order, parsedJd, questions);
    case 'csv':
      return exportCsv(order, questions);
    case 'mettl-csv':
      return exportMettlCsv(order, questions);
    case 'pdf':
      throw new Error('PDF export deferred to v1 (needs PDF library); use JSON or CSV in v0');
    case 'hackerrank-yaml':
      throw new Error(
        'HackerRank YAML export lives in services/readybank for shared-library packs; use JSON in JD-Forge v0',
      );
    default:
      throw new Error(`unsupported export format: ${String(format)}`);
  }
}

function formatRow(q: GeneratedQuestion, _useMettl: boolean): string {
  const opts = optionsFromBody(q);
  const correctAnswer = correctAnswerFromBody(q);
  return CSV_COLUMNS.map((col) => {
    if (col === 'options') return csvCell(opts.join(' | '));
    if (col === 'correctAnswer') return csvCell(correctAnswer);
    if (col === 'id') return csvCell(q.id);
    if (col === 'format') return csvCell(q.format);
    if (col === 'difficulty') return csvCell(q.difficulty);
    if (col === 'skillSource') return csvCell(q.skillSource);
    if (col === 'bodyMd') return csvCell(q.bodyMd);
    if (col === 'referenceSolution') return csvCell(q.referenceSolution ?? '');
    return csvCell('');
  }).join(',');
}

function formatMettlRow(q: GeneratedQuestion): string {
  const opts = optionsFromBody(q);
  const correctIndex = correctIndexFromBody(q);
  const correctOption = correctIndex !== null ? `Option${correctIndex + 1}` : '';
  const sectionFor = (format: string): string => {
    if (format === 'mcq' || format === 'msq' || format === 'truefalse') return 'MCQ';
    if (format === 'coding') return 'Coding';
    return 'Free Response';
  };
  const cells: Record<string, string> = {
    Section: sectionFor(q.format),
    QuestionType:
      q.format === 'mcq' ? 'SingleChoice' : q.format === 'msq' ? 'MultipleChoice' : q.format,
    QuestionText: q.bodyMd,
    Option1: opts[0] ?? '',
    Option2: opts[1] ?? '',
    Option3: opts[2] ?? '',
    Option4: opts[3] ?? '',
    CorrectOption: correctOption,
    Marks: '1',
    NegativeMarks: '0',
  };
  return METTL_COLUMNS.map((col) => csvCell(cells[col] ?? '')).join(',');
}

function optionsFromBody(q: GeneratedQuestion): string[] {
  const opts = (q.bodyJson as { options?: unknown }).options;
  if (!Array.isArray(opts)) return [];
  return opts.filter((o): o is string => typeof o === 'string');
}

function correctIndexFromBody(q: GeneratedQuestion): number | null {
  const idx = (q.bodyJson as { correctIndex?: unknown }).correctIndex;
  return typeof idx === 'number' ? idx : null;
}

function correctAnswerFromBody(q: GeneratedQuestion): string {
  const opts = optionsFromBody(q);
  const idx = correctIndexFromBody(q);
  if (idx !== null && opts[idx]) return opts[idx];
  const ak = q.answerKey ?? {};
  return JSON.stringify(ak);
}

/** RFC 4180 CSV cell quoting. */
function csvCell(value: string): string {
  if (typeof value !== 'string') value = String(value ?? '');
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

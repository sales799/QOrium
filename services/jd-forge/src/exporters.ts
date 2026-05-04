/**
 * Output packaging per spec §3.5 + §12.
 *
 * v0 supports `json`, `csv`, `mettl-csv`, `xlsx` (Sprint 2.16) and
 * `mettl-xlsx` (Sprint 2.16). XLSX is produced by a hand-rolled OOXML
 * writer (`xlsx-writer.ts`) — no external library; see CTO-DELTA #16
 * for the original deferral and the rationale for closing it now.
 */

import type { ExportFormat, GeneratedQuestion, OrderInput, ParsedJd } from './types.js';
import { buildXlsx, type CellValue } from './xlsx-writer.js';

export interface ExportPayload {
  contentType: string;
  body: string | Buffer;
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

/** Single-sheet XLSX with the canonical JD-Forge column set. */
export function exportXlsx(order: OrderInput, questions: GeneratedQuestion[]): ExportPayload {
  const rows: CellValue[][] = [Array.from(CSV_COLUMNS)];
  for (const q of questions) rows.push(buildCanonicalXlsxRow(q));
  return {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: buildXlsx({ sheet: { name: 'JD-Forge', rows } }),
    filename: `jd-forge-${order.orderId}.xlsx`,
  };
}

/** Mettl-compatible XLSX matching the column order their importer expects. */
export function exportMettlXlsx(order: OrderInput, questions: GeneratedQuestion[]): ExportPayload {
  const rows: CellValue[][] = [METTL_COLUMNS.slice()];
  for (const q of questions) rows.push(buildMettlXlsxRow(q));
  return {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: buildXlsx({ sheet: { name: 'Mettl Import', rows } }),
    filename: `jd-forge-${order.orderId}-mettl.xlsx`,
  };
}

function buildCanonicalXlsxRow(q: GeneratedQuestion): CellValue[] {
  const opts = optionsFromBody(q);
  const correctAnswer = correctAnswerFromBody(q);
  return CSV_COLUMNS.map((col): CellValue => {
    if (col === 'options') return opts.join(' | ');
    if (col === 'correctAnswer') return correctAnswer;
    if (col === 'id') return q.id;
    if (col === 'format') return q.format;
    if (col === 'difficulty') return q.difficulty;
    if (col === 'skillSource') return q.skillSource;
    if (col === 'bodyMd') return q.bodyMd;
    if (col === 'referenceSolution') return q.referenceSolution ?? '';
    return '';
  });
}

function buildMettlXlsxRow(q: GeneratedQuestion): CellValue[] {
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
  return METTL_COLUMNS.map((col) => cells[col] ?? '');
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
    case 'xlsx':
      return exportXlsx(order, questions);
    case 'mettl-xlsx':
      return exportMettlXlsx(order, questions);
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

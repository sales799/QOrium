#!/usr/bin/env node
/**
 * ingest-wave1-full.mjs — Sprint 1.6 Track C
 *
 * Walks the Wave-1 corpus across 24 markdown source files, parses 480 v0.6
 * questions across 8 sub-skills (60 Qs each), emits a manifest JSON, and
 * (with --apply) idempotently UPSERTs into content.questions.
 *
 * Usage:
 *   node ingest-wave1-full.mjs --root /opt/apps/qorium/corpus --dry-run
 *   node ingest-wave1-full.mjs --root /opt/apps/qorium/corpus --apply
 *
 * Env: standard libpq vars (PGHOST/PGUSER/PGDATABASE/PGPASSWORD) OR DATABASE_URL.
 *
 * Exit codes:
 *   0   success (dry-run or apply)
 *   2   bad usage
 *   3   parse failure (< 460 questions found)
 *   4   DB failure during apply
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
if (!args.root) {
  console.error('Usage: ingest-wave1-full.mjs --root <corpusRoot> [--dry-run | --apply] [--out <manifest.json>]');
  process.exit(2);
}

const SUB_SKILLS = [
  { id: 'senior-java', prefix: 'QOR-JAVA', files: [
    'sales/Sample-Pack-v0.5-Senior-Java-Populated.md',
    'customer-zero/Wave-1-Seed-Batch-Java-Extension.md',
    'customer-zero/Wave-1-Java-Extension-021-040.md',
    'customer-zero/Wave-1-Java-Extension-041-060.md',
  ]},
  { id: 'senior-react', prefix: 'QOR-REACT', files: [
    'sales/Sample-Pack-v0.5-Senior-React-Populated.md',
    'customer-zero/Wave-1-Seed-Batch-React-Extension.md',
    'customer-zero/Wave-1-React-Extension-021-040.md',
    'customer-zero/Wave-1-React-Extension-041-060.md',
  ]},
  { id: 'senior-sql-data', prefix: 'QOR-SQL', files: [
    'sales/Sample-Pack-v0.5-Senior-SQL-Data-Populated.md',
    'customer-zero/Wave-1-Seed-Batch-SQL-Data-Extension.md',
    'customer-zero/Wave-1-SQL-Data-Extension-021-040.md',
    'customer-zero/Wave-1-SQL-Data-Extension-041-060.md',
  ]},
  { id: 'devops-sre', prefix: 'QOR-DEVOPS', files: [
    'sales/Sample-Pack-v0.5-DevOps-SRE-Populated.md',
    'customer-zero/Wave-1-Seed-Batch-DevOps-SRE-Extension.md',
    'customer-zero/Wave-1-DevOps-SRE-Extension-021-040.md',
    'customer-zero/Wave-1-DevOps-SRE-Extension-041-060.md',
  ]},
  { id: 'senior-salesforce', prefix: 'QOR-SFDC', files: [
    'sales/Sample-Pack-v0.5-Senior-Salesforce-Populated.md',
    'customer-zero/Wave-1-Salesforce-Extension-021-040.md',
    'customer-zero/Wave-1-Salesforce-Extension-041-060.md',
  ]},
  { id: 'senior-python', prefix: 'QOR-PYTHON', files: [
    'sales/Sample-Pack-v0.5-Senior-Python-Populated.md',
    'customer-zero/Wave-1-Python-Extension-021-040.md',
    'customer-zero/Wave-1-Python-Extension-041-060.md',
  ]},
  { id: 'senior-aws', prefix: 'QOR-AWS', files: [
    'sales/Sample-Pack-v0.5-Senior-AWS-Populated.md',
    'customer-zero/Wave-1-AWS-Extension-021-040.md',
    'customer-zero/Wave-1-AWS-Extension-041-060.md',
  ]},
  { id: 'senior-ai-prompt-engineering', prefix: 'QOR-AIPE', files: [
    'sales/Sample-Pack-v0.5-Senior-AI-Prompt-Engineering-Populated.md',
    'customer-zero/Wave-1-AIPE-Extension-021-040.md',
    'customer-zero/Wave-1-AIPE-Extension-041-060.md',
  ]},
];

const HEADING_RE = /^(#{2,4})\s+(?:QUESTION|Question)\s+(\d+)\s*[:.\-]/;
const FIELD_RE = /^\*\*([a-z_]+):\*\*\s+(.*)$/i;

function parseArgs(argv) {
  const out = { dryRun: false, apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') out.root = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--apply') out.apply = true;
    else if (a === '--out')   out.outManifest = argv[++i];
  }
  if (!out.dryRun && !out.apply) out.dryRun = true;
  if (!out.outManifest) out.outManifest = 'wave1-manifest.json';
  return out;
}

function readSafe(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

function parseFile(absPath, relPath, subSkill) {
  const txt = readSafe(absPath);
  if (txt == null) return { records: [], skipped: true, reason: 'file-missing' };
  const lines = txt.split(/\r?\n/);
  const records = [];
  let cur = null;
  let bodyBuf = []; let optionsBuf = []; let codeBuf = [];
  let inOptions = false; let inCode = false;

  function flush() {
    if (!cur) return;
    const body = bodyBuf.join('\n').trim();
    const options = parseOptions(optionsBuf.join('\n'));
    const rec = {
      question_id: cur.fields.question_id || null,
      skill_id: subSkill.id,
      sub_skill_id: cur.fields.sub_skill_id || null,
      format: normalizeFormat(cur.fields.format, options.length > 0),
      difficulty_b: numOrNull(cur.fields.difficulty_b),
      discrimination_a: numOrNull(cur.fields.discrimination_a),
      expected_duration_minutes: numOrNull(cur.fields.expected_duration_minutes),
      citation: cur.fields.citation || null,
      body,
      options,
      answer_key: extractAnswerKey(cur.fields),
      answer_explanation: cur.fields.answer_key || null,
      rubric: parseRubric(cur.fields, options.length > 0),
      watermark_seed: cur.fields.watermark_seed || null,
      variant_seed: cur.fields.variant_seed || null,
      code: codeBuf.length ? codeBuf.join('\n') : null,
      source_file: relPath,
      source_heading_line: cur.line,
    };
    if (rec.question_id && rec.question_id.startsWith(subSkill.prefix + '-')) {
      records.push(rec);
    }
    cur = null; bodyBuf = []; optionsBuf = []; codeBuf = []; inOptions = false; inCode = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(HEADING_RE);
    if (m) { flush(); cur = { fields: {}, line: i + 1 }; continue; }
    if (!cur) continue;

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) { inCode = !inCode; continue; }
    if (inCode) { codeBuf.push(line); continue; }

    const fm = line.match(FIELD_RE);
    if (fm) {
      const key = fm[1].toLowerCase().trim();
      cur.fields[key] = fm[2].trim();
      inOptions = (key === 'options');
      continue;
    }
    if (line.trim().toLowerCase() === '**options:**') { inOptions = true; continue; }
    if (line.trim().toLowerCase() === '**body:**')   { inOptions = false; continue; }

    if (inOptions) optionsBuf.push(line);
    else           bodyBuf.push(line);
  }
  flush();
  return { records, skipped: false };
}

function parseOptions(txt) {
  const out = [];
  for (const raw of txt.split(/\r?\n/)) {
    const m = raw.match(/^\s*[-*]\s*([A-D])\s*[\)\.\:]\s*(.+?)\s*$/);
    if (m) out.push({ key: m[1], text: m[2].trim() });
  }
  return out;
}
function numOrNull(s) {
  if (!s) return null;
  const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}
function normalizeFormat(s, hasOptions) {
  if (!s) return hasOptions ? 'mcq_single' : 'design_essay';
  const v = String(s).toLowerCase().trim();
  if (v.includes('mcq')) return 'mcq_single';
  if (v.includes('code')) return 'code_write';
  if (v.includes('design')) return 'design_essay';
  if (v.includes('case')) return 'case_study';
  return hasOptions ? 'mcq_single' : 'design_essay';
}
function extractAnswerKey(fields) {
  const a = fields.answer_key || '';
  const m = String(a).match(/^([A-D])\b/);
  return m ? m[1] : null;
}
function parseRubric(fields, hasOptions) {
  if (hasOptions) return { type: 'mcq_single', max_points: 5 };
  const r = fields.rubric || '';
  if (/3-tier/i.test(r)) return { type: 'tier_3', max_points: 5 };
  if (/5-tier/i.test(r)) return { type: 'tier_5', max_points: 5 };
  if (/7-tier/i.test(r)) return { type: 'tier_7', max_points: 7 };
  return { type: 'rubric_open', max_points: 5 };
}

async function main() {
  const records = [];
  const bySub = {};
  for (const ss of SUB_SKILLS) {
    bySub[ss.id] = { expected: 60, actual: 0, missing_ids: [], skipped_files: [] };
    const seen = new Set();
    for (const f of ss.files) {
      const abs = path.join(args.root, f);
      const r = parseFile(abs, f, ss);
      if (r.skipped) { bySub[ss.id].skipped_files.push(f); continue; }
      for (const rec of r.records) {
        if (!seen.has(rec.question_id)) {
          seen.add(rec.question_id);
          records.push(rec);
          bySub[ss.id].actual++;
        }
      }
    }
    for (let n = 1; n <= 60; n++) {
      const id = `${ss.prefix}-${String(n).padStart(3, '0')}`;
      if (!seen.has(id)) bySub[ss.id].missing_ids.push(id);
    }
  }

  const manifest = {
    $schema: 'https://qorium.online/schemas/wave1-manifest-v0.1.json',
    manifest_version: 'v0.1',
    wave: 1,
    generated_at_utc: new Date().toISOString(),
    expected_total: 480,
    actual_total: records.length,
    by_subskill: bySub,
    questions: records,
  };

  writeFileSync(args.outManifest, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written: ${args.outManifest}`);
  console.log(`Total parsed: ${records.length} / 480`);
  for (const [k, v] of Object.entries(bySub)) {
    console.log(`  ${k.padEnd(32)}  ${v.actual}/60` +
      (v.missing_ids.length ? `  (missing: ${v.missing_ids.length})` : '') +
      (v.skipped_files.length ? `  (skipped: ${v.skipped_files.length})` : ''));
  }

  if (records.length < 460) {
    console.error(`\nABORT: parsed ${records.length} records, threshold 460. Inspect manifest before --apply.`);
    process.exit(3);
  }

  if (args.dryRun) {
    console.log('\nDry-run mode. No DB writes. Re-run with --apply to ingest.');
    return;
  }

  // Apply mode — dynamic import keeps `pg` optional during dry-run on machines without DB driver.
  let pg;
  try { pg = (await import('pg')).default; }
  catch (e) {
    console.error('ERROR: --apply requires "pg" package. Install with: pnpm add pg');
    process.exit(4);
  }
  const { Pool } = pg;
  const pool = new Pool();
  let inserted = 0, updated = 0;
  try {
    for (const r of records) {
      const sql = `
        INSERT INTO content.questions (
          question_id, skill_id, sub_skill_id, format,
          difficulty_b, discrimination_a, expected_duration_minutes,
          citation, body, options_json, answer_key, answer_explanation,
          rubric_json, watermark_seed, variant_seed, status, metadata_json
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14,$15,
          'authored', $16::jsonb
        )
        ON CONFLICT (question_id) DO UPDATE SET
          skill_id = EXCLUDED.skill_id,
          sub_skill_id = EXCLUDED.sub_skill_id,
          format = EXCLUDED.format,
          difficulty_b = EXCLUDED.difficulty_b,
          discrimination_a = EXCLUDED.discrimination_a,
          expected_duration_minutes = EXCLUDED.expected_duration_minutes,
          citation = EXCLUDED.citation,
          body = EXCLUDED.body,
          options_json = EXCLUDED.options_json,
          answer_key = EXCLUDED.answer_key,
          answer_explanation = EXCLUDED.answer_explanation,
          rubric_json = EXCLUDED.rubric_json,
          watermark_seed = EXCLUDED.watermark_seed,
          variant_seed = EXCLUDED.variant_seed,
          metadata_json = EXCLUDED.metadata_json,
          updated_at = now()
        RETURNING xmax = 0 AS inserted;`;
      const params = [
        r.question_id, r.skill_id, r.sub_skill_id, r.format,
        r.difficulty_b, r.discrimination_a, r.expected_duration_minutes,
        r.citation, r.body, JSON.stringify(r.options || []),
        r.answer_key, r.answer_explanation,
        JSON.stringify(r.rubric || {}),
        r.watermark_seed, r.variant_seed,
        JSON.stringify({
          source_file: r.source_file,
          source_heading_line: r.source_heading_line,
          code: r.code,
        }),
      ];
      const res = await pool.query(sql, params);
      if (res.rows[0]?.inserted) inserted++; else updated++;
    }
    console.log(`\nApply complete. inserted=${inserted}  updated=${updated}  total=${inserted + updated}`);
  } catch (e) {
    console.error('DB error:', e.message);
    process.exit(4);
  } finally {
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

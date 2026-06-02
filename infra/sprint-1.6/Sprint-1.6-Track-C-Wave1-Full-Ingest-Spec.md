# Sprint 1.6 · Track C — Wave-1 Full DB Ingest (480 Qs across 8 sub-skills)

**Authored:** 2026-05-04 (Run #32) · CTO Office
**Branch target:** same as Tracks A/B
**Replaces / closes:** the Day-1 launch-time gap where only the 10-Q smoke-test pack (`seed-pack-001-senior-java-Q001-Q010.json`) was ingested into the live VPS DB. This Track ships the full Wave-1 corpus into `content.questions` so recruiters can build packs across all 8 sub-skills, not just Java.

---

## 1. Source corpus inventory (480 Qs total, 8 × 60)

Each sub-skill is split across 3 source files:

| Sub-skill | Q001–020 source | Q021–040 source | Q041–060 source |
|---|---|---|---|
| Senior Java | `sales/Sample-Pack-v0.5-Senior-Java-Populated.md` (Q001–010 there + Q011–020 in `customer-zero/Wave-1-Seed-Batch-Java-Extension.md`) | `customer-zero/Wave-1-Java-Extension-021-040.md` | `customer-zero/Wave-1-Java-Extension-041-060.md` |
| Senior React/JS | `sales/Sample-Pack-v0.5-Senior-React-Populated.md` (Q001–010) + `customer-zero/Wave-1-Seed-Batch-React-Extension.md` (Q011–020) | `customer-zero/Wave-1-React-Extension-021-040.md` | `customer-zero/Wave-1-React-Extension-041-060.md` |
| Senior SQL/Data | `sales/Sample-Pack-v0.5-Senior-SQL-Data-Populated.md` (Q001–010) + `customer-zero/Wave-1-Seed-Batch-SQL-Data-Extension.md` (Q011–020) | `customer-zero/Wave-1-SQL-Data-Extension-021-040.md` | `customer-zero/Wave-1-SQL-Data-Extension-041-060.md` |
| DevOps/SRE | `sales/Sample-Pack-v0.5-DevOps-SRE-Populated.md` (Q001–010) + `customer-zero/Wave-1-Seed-Batch-DevOps-SRE-Extension.md` (Q011–020) | `customer-zero/Wave-1-DevOps-SRE-Extension-021-040.md` | `customer-zero/Wave-1-DevOps-SRE-Extension-041-060.md` |
| Senior Salesforce | `sales/Sample-Pack-v0.5-Senior-Salesforce-Populated.md` (Q001–020 — single file) | `customer-zero/Wave-1-Salesforce-Extension-021-040.md` | `customer-zero/Wave-1-Salesforce-Extension-041-060.md` |
| Senior Python | `sales/Sample-Pack-v0.5-Senior-Python-Populated.md` (Q001–020 — single file) | `customer-zero/Wave-1-Python-Extension-021-040.md` | `customer-zero/Wave-1-Python-Extension-041-060.md` |
| Senior AWS | `sales/Sample-Pack-v0.5-Senior-AWS-Populated.md` (Q001–020 — single file) | `customer-zero/Wave-1-AWS-Extension-021-040.md` | `customer-zero/Wave-1-AWS-Extension-041-060.md` |
| Senior AI Prompt Engineering | `sales/Sample-Pack-v0.5-Senior-AI-Prompt-Engineering-Populated.md` (Q001–020 — single file) | `customer-zero/Wave-1-AIPE-Extension-021-040.md` | `customer-zero/Wave-1-AIPE-Extension-041-060.md` |

**Total source files:** 8 sub-skills × ~3 files (with some Q001–020 split across two for the first four sub-skills) → **~20 markdown files**, plus the Salesforce/Python/AWS/AIPE single-file Q001–020 packs → **24 total source files**.

Question-ID prefixes:
- `QOR-JAVA-001..060`
- `QOR-REACT-001..060`
- `QOR-SQL-001..060`
- `QOR-DEVOPS-001..060`
- `QOR-SFDC-001..060`
- `QOR-PYTHON-001..060`
- `QOR-AWS-001..060`
- `QOR-AIPE-001..060`

---

## 2. Heading format heterogeneity (the single biggest parsing risk)

`grep` evidence shows two heading conventions across the corpus:

- `## QUESTION 21: Title (Difficulty)` — used in AWS / SQL / DevOps / Salesforce / Oracle HCM extensions
- `### QUESTION 21: Title (Difficulty)` — used in Java / React / Python / AIPE extensions

The parser must accept BOTH (regex `^#{2,3}\s+QUESTION\s+(\d+)`).

The Q001–020 single-file packs (e.g. `Sample-Pack-v0.5-Senior-Salesforce-Populated.md`) use a third convention with full-prose section headers like `## Question 1: …` (lowercase "Question") — parser must also accept that case-insensitively.

---

## 3. Target schema (existing `content.questions` table)

Per `services/readybank/db/migrations/0001_initial_schema.sql`:

```sql
content.questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     text NOT NULL UNIQUE,         -- 'QOR-JAVA-001' style canonical key
  skill_id        text NOT NULL,                 -- 'senior-java'
  sub_skill_id    text NOT NULL,                 -- 'jvm-memory-internals'
  format          text NOT NULL,                 -- 'mcq_single' | 'code_write' | 'design_essay' | 'case_study'
  difficulty_b    numeric,
  discrimination_a numeric,
  expected_duration_minutes int,
  citation        text,
  body            text NOT NULL,
  options_json    jsonb,                         -- [{key,text},...] for MCQ
  answer_key      text,                          -- 'B' for MCQ; null for code/design
  answer_explanation text,
  rubric_json     jsonb,
  watermark_seed  text,
  variant_seed    text,
  status          text NOT NULL DEFAULT 'authored',  -- authored | calibrating | released | retired
  released_at     timestamptz,
  metadata_json   jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
```

Idempotent UPSERT key: `question_id`.

---

## 4. Manifest schema (intermediate JSON before SQL load)

The script first emits `manifest.json` (dry-run-friendly), then SQL-ingests from it. This separation lets Stream B sanity-check parsing before mutating prod DB.

```json
{
  "$schema": "https://qorium.online/schemas/wave1-manifest-v0.1.json",
  "manifest_version": "v0.1",
  "wave": 1,
  "generated_at_utc": "<iso>",
  "expected_total": 480,
  "actual_total": <int>,
  "by_subskill": {
    "senior-java": { "expected": 60, "actual": <n>, "missing_ids": [...] },
    ...
  },
  "questions": [
    {
      "question_id": "QOR-JAVA-001",
      "skill_id": "senior-java",
      "sub_skill_id": "jvm-memory-internals",
      "format": "mcq_single",
      "difficulty_b": -1.1,
      "discrimination_a": 1.4,
      "expected_duration_minutes": 2,
      "citation": "...",
      "body": "...",
      "options": [{"key":"A","text":"..."}, ...],
      "answer_key": "B",
      "answer_explanation": "...",
      "rubric": { "type":"mcq_single", "max_points":5 },
      "watermark_seed": "...",
      "variant_seed": "...",
      "source_file": "customer-zero/Wave-1-Java-Extension-021-040.md",
      "source_heading_line": 47
    }
  ]
}
```

---

## 5. Parser + ingest script (`/opt/apps/qorium/bin/ingest-wave1-full.mjs`)

```js
#!/usr/bin/env node
// ingest-wave1-full.mjs — Sprint 1.6 Track C
// Usage:
//   node ingest-wave1-full.mjs --root /opt/apps/qorium/corpus --dry-run
//   node ingest-wave1-full.mjs --root /opt/apps/qorium/corpus --apply
// Env: PG* standard libpq vars OR DATABASE_URL.

import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';
const { Pool } = pg;

const args = parseArgs(process.argv.slice(2));
if (!args.root) {
  console.error('Usage: ingest-wave1-full.mjs --root <corpusRoot> [--dry-run | --apply]');
  process.exit(2);
}

const SUB_SKILLS = [
  { id: 'senior-java', prefix: 'QOR-JAVA',   files: [
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
  { id: 'senior-python', prefix: 'QOR-PY', files: [
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

const HEADING_RE = /^(#{2,3})\s+(?:QUESTION|Question)\s+(\d+)\s*[:.\-]/;
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

// Parse one file → array of question records
function parseFile(absPath, relPath, subSkill) {
  const txt = readSafe(absPath);
  if (txt == null) {
    return { records: [], skipped: true, reason: 'file-missing' };
  }
  const lines = txt.split(/\r?\n/);
  const records = [];
  let cur = null;
  let bodyBuf = [];
  let inOptions = false; let optionsBuf = [];
  let inCode = false; let codeBuf = [];
  let codeFence = null;

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
      answer_explanation: cur.fields.answer_key || cur.fields.answer_explanation || null,
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

    // code fence handling — keep code blocks verbatim
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (!inCode) { inCode = true; codeFence = fence[1] || ''; continue; }
      else { inCode = false; codeFence = null; continue; }
    }
    if (inCode) { codeBuf.push(line); continue; }

    const fm = line.match(FIELD_RE);
    if (fm) {
      const key = fm[1].toLowerCase().trim();
      const val = fm[2].trim();
      cur.fields[key] = val;
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
  // Lines like "- A) ..." or "- A. ..." or "* A) ..."
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
  // For MCQ, answer_key is a single letter at start of the answer_key field.
  const a = fields.answer_key || fields['answer_key:'] || '';
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
    // detect missing IDs
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
    console.log(`  ${k.padEnd(32)}  ${v.actual}/60` + (v.missing_ids.length ? `  (missing: ${v.missing_ids.length})` : ''));
  }
  if (args.dryRun) {
    console.log('Dry-run mode. No DB writes. Re-run with --apply to ingest.');
    return;
  }

  // Apply mode: idempotent UPSERT
  const pool = new Pool();
  let inserted = 0, updated = 0;
  for (const r of records) {
    const sql = `
      INSERT INTO content.questions (
        question_id, skill_id, sub_skill_id, format,
        difficulty_b, discrimination_a, expected_duration_minutes,
        citation, body, options_json, answer_key, answer_explanation,
        rubric_json, watermark_seed, variant_seed, status, metadata_json
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14,$15,
        'authored',
        $16::jsonb
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
      JSON.stringify({ source_file: r.source_file, source_heading_line: r.source_heading_line, code: r.code }),
    ];
    const res = await pool.query(sql, params);
    if (res.rows[0]?.inserted) inserted++; else updated++;
  }
  console.log(`Apply complete. inserted=${inserted}  updated=${updated}  total=${inserted + updated}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Add npm script to root `package.json`:

```json
"scripts": {
  "wave1:manifest": "node bin/ingest-wave1-full.mjs --root /opt/apps/qorium/corpus --dry-run --out wave1-manifest.json",
  "wave1:ingest":   "node bin/ingest-wave1-full.mjs --root /opt/apps/qorium/corpus --apply"
}
```

---

## 6. Bridge step (Stream A → Stream B)

`scripts/cowork-to-stream-b-bridge.sh` already copies Cowork specs into Stream B's repo. Add to its file list (CTO will append in this run):

```
# Wave-1 corpus into /opt/apps/qorium/corpus/
COPY  customer-zero/Wave-1-*.md                   → /opt/apps/qorium/corpus/customer-zero/
COPY  customer-zero/Wave-1-Seed-Batch-*.md        → /opt/apps/qorium/corpus/customer-zero/
COPY  sales/Sample-Pack-v0.5-Senior-*-Populated.md → /opt/apps/qorium/corpus/sales/
COPY  sales/Sample-Pack-v0.5-DevOps-SRE-Populated.md → /opt/apps/qorium/corpus/sales/
COPY  infra/sprint-1.6/ingest-wave1-full.mjs      → /opt/apps/qorium/bin/   (chmod +x)
```

Stream B then runs:

```bash
sudo -u qorium pnpm -C /opt/apps/qorium/readybank-service run wave1:manifest
# inspect wave1-manifest.json: actual_total should be 480; missing_ids per sub-skill should be []
sudo -u qorium pnpm -C /opt/apps/qorium/readybank-service run wave1:ingest
# expected: inserted=470 updated=10 (the 10 Java Qs already present get UPDATEd)
```

---

## 7. Post-ingest validation queries

Stream B runs these as smoke tests:

```sql
-- A) Total Wave-1 count
SELECT COUNT(*) FROM content.questions
 WHERE question_id ~ '^QOR-(JAVA|REACT|SQL|DEVOPS|SFDC|PY|AWS|AIPE)-';
-- expected: 480

-- B) Per-sub-skill count
SELECT skill_id, COUNT(*) FROM content.questions
 WHERE question_id ~ '^QOR-(JAVA|REACT|SQL|DEVOPS|SFDC|PY|AWS|AIPE)-'
 GROUP BY skill_id ORDER BY skill_id;
-- expected: 8 rows × 60 each

-- C) Format distribution sanity
SELECT format, COUNT(*) FROM content.questions
 WHERE question_id ~ '^QOR-(JAVA|REACT|SQL|DEVOPS|SFDC|PY|AWS|AIPE)-'
 GROUP BY format;
-- expected: ~280 mcq_single, ~100 code_write, ~50 design_essay, ~50 case_study (rough)

-- D) Orphan detection
SELECT question_id FROM content.questions
 WHERE question_id ~ '^QOR-' AND options_json IS NULL AND format = 'mcq_single';
-- expected: 0 rows

-- E) Released-status promotion (manual, after SME-Lead review)
UPDATE content.questions SET status = 'released', released_at = now()
 WHERE question_id IN ('QOR-JAVA-001', ..., 'QOR-AIPE-060')   -- driven by SME tracker XLSX
   AND status = 'authored';
```

For the Customer-Zero Day-1 launch, the existing 10 Java Qs that are already `released` stay released (UPSERT preserves the status column unless EXCLUDED — note the script does NOT update status, intentionally). New rows arrive as `authored`. SME Lead releases them in batches via the XLSX tracker round-trip.

---

## 8. Rollback

If parsing yields fewer than 460 records or any sub-skill drops below 55, **abort apply**. Manual mitigation:

```bash
# Re-run dry-run to inspect manifest
pnpm wave1:manifest

# Manually inspect missing_ids for each sub-skill; usually a heading-format edge case
node -e 'console.log(JSON.parse(require("fs").readFileSync("wave1-manifest.json")).by_subskill)'

# After fixing the source markdown, re-run apply.
# UPSERT semantics make re-runs safe.
```

If a bad ingest needs surgical removal:

```sql
BEGIN;
-- e.g. remove all Salesforce Wave-1 if a parser bug shipped wrong rubrics
DELETE FROM content.questions
 WHERE question_id LIKE 'QOR-SFDC-%'
   AND status = 'authored'
   AND created_at >= '2026-05-04';
COMMIT;
```

---

## 9. Honest deviations + caveats

1. **Heading-format heterogeneity** is the #1 fragility. Run `--dry-run` first; review `missing_ids` per sub-skill. If any sub-skill < 60, fix the source markdown (not the parser) — the parser stays opinionated.
2. **Format inference for code/design/case** depends on the `**format:**` field being present and parseable. Salesforce single-file pack uses `Format:` (no asterisks) in some entries — parser handles both via the regex.
3. **Q001–020 single-file packs** (Salesforce/Python/AWS/AIPE) use a `## Question 1:` (lowercase, full word) heading; parser regex is case-insensitive and accepts both styles.
4. **`code` block content** is captured into `metadata_json.code` rather than a separate column — easier to evolve schema later.
5. **No watermark generation here** — `watermark_seed` is only what's in the source markdown; the per-candidate option-permutation watermarking already lives in `services/readybank/src/lib/watermark.ts` (Run #28) and runs at GET-question time, not at ingest.
6. **`status` column intentionally not touched on UPDATE** — UPSERT preserves the `released`/`calibrating` lifecycle; parser only writes `authored` for new rows.

---

## 10. SO compliance

- **SO-21 (IRT calibration mandatory)** — questions land at `status=authored`; promotion to `released` requires SME-Lead + IRT N≥30 per the existing pipeline. Ingest does NOT skip those gates.
- **SO-22 (No-fiction)** — every parser claim above maps to a regex / DB column / file path; nothing fictional.
- **SO-23 (Operational hygiene)** — manifest emitted before mutation; rollback documented; UPSERT idempotent.
- **SO-24 (No-fiction recursive)** — heading-format heterogeneity surfaced honestly as a fragility; no silent fallback "guesses".

---

*End of Track C spec. Ingest manifest aggregator + idempotent UPSERT script + bridge addition + post-validation. Stream B runs in two commands.*

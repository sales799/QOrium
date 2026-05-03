// Ingest a QOrium seed pack JSON into content.* tables.
// Usage:  node --env-file=.env ingest-seed-pack.mjs <path-to-pack.json>
import { createPool } from '@qorium/db';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packPath = process.argv[2];
if (!packPath) {
  console.error('usage: ingest-seed-pack.mjs <pack.json>');
  process.exit(2);
}
const pack = JSON.parse(readFileSync(resolve(packPath), 'utf8'));
const c = createPool({ applicationName: 'ingest-seed-pack' });

await c.query('BEGIN');
try {
  // 1. Upsert skill
  const sk = await c.query(
    'INSERT INTO content.skills (slug, name, family, depth) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id',
    [pack.skill.id, pack.skill.label, 'tech', 1],
  );
  const skillId = sk.rows[0].id;
  console.log('[ingest] skill ' + pack.skill.id + ' -> ' + skillId);

  // 2. Upsert sub-skills
  const subSkillCache = {};
  for (const q of pack.questions) {
    if (subSkillCache[q.sub_skill_id]) continue;
    const niceName = q.sub_skill_id.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    const ss = await c.query(
      'INSERT INTO content.sub_skills (skill_id, slug, name) VALUES ($1,$2,$3) ON CONFLICT (skill_id, slug) DO UPDATE SET name=EXCLUDED.name RETURNING id',
      [skillId, q.sub_skill_id, niceName],
    );
    subSkillCache[q.sub_skill_id] = ss.rows[0].id;
  }
  console.log('[ingest] ' + Object.keys(subSkillCache).length + ' sub-skills upserted');

  // 3. Insert each question (idempotent on watermark_id)
  let inserted = 0,
    skipped = 0;
  for (const q of pack.questions) {
    if (q.watermark_seed) {
      const existing = await c.query('SELECT id FROM content.questions WHERE watermark_id=$1', [
        q.watermark_seed,
      ]);
      if (existing.rowCount > 0) {
        skipped++;
        continue;
      }
    }

    const bodyJson = {
      title: q.title,
      body: q.body,
      options: q.options,
      citation: q.citation,
      tags: q.tags || [],
      external_id: q.question_id,
      pack_id: pack.pack_id,
    };
    const answerKey = q.answer_key
      ? { correct: q.answer_key, explanation: q.answer_explanation }
      : null;
    const rubricJson = q.rubric || null;

    await c.query(
      'INSERT INTO content.questions (sku, format, skill_id, sub_skill_id, body_md, body_json, answer_key, rubric_json, difficulty_b, discrimination_a, authored_by, source_corpus, status, watermark_id, language, released_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())',
      [
        'readybank',
        q.format,
        skillId,
        subSkillCache[q.sub_skill_id],
        q.body || '',
        JSON.stringify(bodyJson),
        answerKey ? JSON.stringify(answerKey) : null,
        rubricJson ? JSON.stringify(rubricJson) : null,
        q.difficulty_b,
        q.discrimination_a,
        'ai_generated',
        pack.pack_id,
        'released',
        q.watermark_seed || null,
        'en',
      ],
    );
    inserted++;
  }
  console.log('[ingest] questions: inserted=' + inserted + ' skipped=' + skipped);

  await c.query('COMMIT');
  console.log('[ingest] commit OK');
} catch (e) {
  await c.query('ROLLBACK');
  console.error('[ingest] FAIL:', e.message);
  process.exit(3);
} finally {
  await c.end();
}

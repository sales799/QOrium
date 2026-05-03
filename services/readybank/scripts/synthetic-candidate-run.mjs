// Synthetic Customer Zero candidate run — proves end-to-end flow before first real candidate.
// Inserts content.responses rows for a demo candidate against the 6-MCQ smoke-test subset.
//
// Usage: node --env-file=.env synthetic-candidate-run.mjs
import { createPool } from '@qorium/db';

const SMOKE_SUBSET = [
  'QOR-JAVA-001',
  'QOR-JAVA-002',
  'QOR-JAVA-003',
  'QOR-JAVA-004',
  'QOR-JAVA-005',
  'QOR-JAVA-006',
];
const CANDIDATE_ID = 'QORIUM-DEMO-001';
const TENANT_SLUG = 'talpro-india-customer-zero';

// Synthetic candidate: gets 4/6 correct
const SYNTH_RESPONSES = {
  'QOR-JAVA-001': 'B', // correct
  'QOR-JAVA-002': 'B', // correct
  'QOR-JAVA-003': 'B', // correct
  'QOR-JAVA-004': 'C', // wrong (correct is A)
  'QOR-JAVA-005': 'B', // correct
  'QOR-JAVA-006': 'D', // wrong (correct is A)
};

const c = createPool({ applicationName: 'synthetic-candidate-run' });
const t = await c.query('SELECT id FROM app.tenants WHERE slug=$1', [TENANT_SLUG]);
if (t.rowCount === 0) {
  console.error('tenant not found');
  process.exit(2);
}
const tenantId = t.rows[0].id;

let totalScore = 0,
  totalMax = 0,
  perQ = [];
const startedAt = new Date(Date.now() - 19 * 60 * 1000); // pretend started 19 min ago

await c.query('BEGIN');
try {
  for (const extId of SMOKE_SUBSET) {
    const qres = await c.query(
      "SELECT id, answer_key, body_json FROM content.questions WHERE body_json->>'external_id'=$1",
      [extId],
    );
    if (qres.rowCount === 0) {
      console.error('question not found:', extId);
      continue;
    }
    const q = qres.rows[0];
    const correct = q.answer_key?.correct;
    const selected = SYNTH_RESPONSES[extId];
    const isCorrect = selected === correct;
    const score = isCorrect ? 5 : 0;
    totalScore += score;
    totalMax += 5;
    perQ.push({ ext: extId, selected, correct, score });

    const responseBody = {
      external_question_id: extId,
      selected_option: selected,
      is_correct: isCorrect,
      submitted_via: 'qorium-customer-zero-day-1-synthetic',
    };
    const timeMs = 30000 + Math.floor(Math.random() * 60000); // 30-90 sec per Q

    await c.query(
      'INSERT INTO content.responses (question_id, tenant_id, candidate_id, response_body, score, time_taken_ms, started_at, submitted_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())',
      [
        q.id,
        tenantId,
        CANDIDATE_ID,
        JSON.stringify(responseBody),
        score,
        timeMs,
        startedAt.toISOString(),
      ],
    );
  }
  await c.query('COMMIT');

  console.log('=== Synthetic Customer Zero run ===');
  console.log('  candidate_id:    ' + CANDIDATE_ID);
  console.log('  tenant:          ' + TENANT_SLUG);
  console.log('  questions:       ' + SMOKE_SUBSET.length);
  console.log(
    '  total score:     ' +
      totalScore +
      ' / ' +
      totalMax +
      ' (' +
      Math.round((totalScore / totalMax) * 100) +
      '%)',
  );
  console.log('  passmark (21/30): ' + (totalScore >= 21 ? 'PASS ✓' : 'FAIL ✗'));
  console.log();
  console.log('  Per-question:');
  for (const r of perQ) {
    console.log(
      '    ' + r.ext + '  selected=' + r.selected + '  correct=' + r.correct + '  +' + r.score,
    );
  }
  console.log();
  console.log('  All ' + SMOKE_SUBSET.length + ' response rows persisted to content.responses.');
} catch (e) {
  await c.query('ROLLBACK');
  console.error('FAIL:', e.message);
  process.exit(3);
} finally {
  await c.end();
}

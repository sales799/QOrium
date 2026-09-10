import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { mkdtemp, cp, appendFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate } from '../scripts/db-migrate.mjs';
const postgres = createRequire(new URL('../packages/db/package.json', import.meta.url))('postgres');
const testUrl = process.env.QORIUM_TEST_DATABASE_URL;

async function isolated(run) {
  const admin = postgres(testUrl, { max: 1, onnotice: () => {} });
  const name = `qorium_test_${randomUUID().replaceAll('-', '')}`;
  let db;
  const directory = await mkdtemp(join(tmpdir(), 'qorium-migrations-'));
  try {
    await admin.unsafe(`CREATE DATABASE ${name}`);
    const url = new URL(testUrl); url.pathname = `/${name}`;
    db = postgres(url.toString(), { max: 1, onnotice: () => {} });
    await cp(new URL('../packages/migrations/', import.meta.url), directory, { recursive: true });
    await run(url.toString(), db, directory);
  } finally {
    if (db) await db.end();
    await admin.unsafe(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
    await admin.end();
    await rm(directory, { recursive: true, force: true });
  }
}
const check = (name, run) => test(name, { skip: !testUrl }, () => isolated(run));
check('fresh schema and concurrent runners apply each migration exactly once', async (url, db, directory) => {
  const results = await Promise.all([migrate(url, directory), migrate(url, directory)]);
  assert.equal(results.flat().length, 3);
  assert.deepEqual(await migrate(url, directory), []);
  assert.equal((await db`SELECT * FROM schema_migrations`).length, 3);
});
check('changed applied SQL is rejected before any new migration', async (url, db, directory) => {
  await migrate(url, directory);
  await appendFile(join(directory, '0001_phase1_core.sql'), '\n-- changed\n');
  await writeFile(join(directory, '0004_marker.sql'), 'CREATE TABLE should_not_exist (id int);');
  await assert.rejects(migrate(url, directory), /history mismatch/);
  assert.equal((await db`SELECT to_regclass('should_not_exist') AS name`)[0].name, null);
});
check('a failed update rolls back schema and migration history', async (url, db, directory) => {
  await migrate(url, directory);
  await writeFile(join(directory, '0004_failure.sql'), 'CREATE TABLE rollback_probe (id int); SELECT missing_column FROM rollback_probe;');
  await assert.rejects(migrate(url, directory));
  assert.equal((await db`SELECT to_regclass('rollback_probe') AS name`)[0].name, null);
  assert.equal((await db`SELECT * FROM schema_migrations`).length, 3);
});
check('untracked and legacy schemas are refused without changing existing data', async (url, db, directory) => {
  await db`CREATE TABLE existing_content (body text)`;
  await db`INSERT INTO existing_content VALUES ('keep this')`;
  await assert.rejects(migrate(url, directory), /untracked schema/);
  assert.equal((await db`SELECT body FROM existing_content`)[0].body, 'keep this');
  assert.equal((await db`SELECT to_regclass('schema_migrations') AS name`)[0].name, null);
  await db`CREATE TABLE schema_migrations (filename text PRIMARY KEY, applied_at timestamptz)`;
  await assert.rejects(migrate(url, directory), /no checksums/);
});
check('tracked existing data survives the additive payload migration', async (url, db, directory) => {
  const file = join(directory, '0003_question_payload_fields.sql');
  const { readFile } = await import('node:fs/promises');
  const third = await readFile(file); await rm(file);
  await migrate(url, directory);
  await db`INSERT INTO skill (id,kind,name,slug) VALUES ('custom','skill','Custom','custom')`;
  await db`INSERT INTO question (id,skill_id,type,stem,correct_answer,explanation) VALUES ('authored','custom','mcq','Keep authored text','1','Keep explanation')`;
  await writeFile(file, third); await migrate(url, directory);
  const [question] = await db`SELECT * FROM question WHERE id = 'authored'`;
  assert.equal(question.stem, 'Keep authored text');
  assert.equal(question.correct_answer, 1);
  assert.equal(question.difficulty, 1);
  assert.deepEqual(question.tags, []);
});

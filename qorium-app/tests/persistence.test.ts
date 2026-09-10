import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
const postgres = createRequire(new URL("../packages/db/package.json", import.meta.url))("postgres");
import { createRepository, type QoriumRepository } from "../apps/api/src/store.js";
import { libraryQuestions } from "../packages/taxonomy/src/index.js";
import { migrate } from "../scripts/db-migrate.mjs";

const url = process.env.QORIUM_TEST_DATABASE_URL;
describe.skipIf(!url)("PostgreSQL persistence", () => {
  let admin: ReturnType<typeof postgres>;
  let db: ReturnType<typeof postgres>;
  let repository: QoriumRepository;
  let databaseUrl: string;
  const name = `qorium_test_${crypto.randomUUID().replaceAll("-", "")}`;
  beforeAll(async () => {
    admin = postgres(url!, { max: 1 });
    await admin.unsafe(`CREATE DATABASE ${name}`);
    const parsed = new URL(url!); parsed.pathname = `/${name}`;
    databaseUrl = parsed.toString();
    await migrate(databaseUrl);
    db = postgres(databaseUrl, { max: 1 });
    vi.stubEnv("DATABASE_URL", databaseUrl);
    repository = createRepository();
    await repository.getSkillStats();
  }, 30000);
  afterAll(async () => {
    if (repository) await repository.close();
    if (db) await db.end();
    if (admin) {
      await admin.unsafe(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await admin.end();
    }
    vi.unstubAllEnvs();
  });
  it("round trips complete question payloads and submitted answer order", async () => {
    const code = libraryQuestions.find((question) => question.type === "code-question")!;
    const persisted = await repository.listLibraryQuestions(code.skillId);
    expect(persisted.find((question) => question.id === code.id)).toMatchObject({
      difficulty: code.difficulty, tags: code.tags, starterCode: code.starterCode,
      languageHints: code.languageHints, testExpectation: code.testExpectation
    });
    const assessment = await repository.createAssessment({ title: "Persistence contract", candidateEmail: "synthetic@example.test", skillIds: [code.skillId], questionsPerSkill: 3, expiresAt: new Date(Date.now() + 60000) });
    expect((await repository.getAssessment(assessment.id))?.questions).toEqual(assessment.questions);
    const answers = assessment.questions.slice().reverse().map((question, index) => ({questionId: question.id, response: `answer ${index}`, grade: 1, confidence: 1, reasoningTraceRef: `trace-${index}`}));
    const attempt = await repository.createAttempt({ assessmentId: assessment.id, candidateEmail: assessment.candidateEmail, answers });
    expect((await repository.getAttempt(attempt.id))?.answers).toEqual(answers);
  });
  it("rolls back the parent when saving an answer fails", async () => {
    const assessment = await repository.createAssessment({ title: "Rollback", candidateEmail: "synthetic@example.test", skillIds: ["engineering.java"], questionsPerSkill: 1, expiresAt: new Date() });
    const before = await db`SELECT count(*)::int AS count FROM attempt`;
    await expect(repository.createAttempt({ assessmentId: assessment.id, candidateEmail: assessment.candidateEmail, answers: [{questionId: "nonexistent-question", response: "test"}] })).rejects.toThrow();
    expect(await db`SELECT count(*)::int AS count FROM attempt`).toEqual(before);
  });
  it("rolls back the assessment when a duplicate question link fails", async () => {
    const before = await db`SELECT count(*)::int AS count FROM assessment`;
    await expect(repository.createAssessment({title: "Duplicate", candidateEmail: "synthetic@example.test", skillIds: ["engineering.java", "engineering.java"], questionsPerSkill: 1, expiresAt: new Date()})).rejects.toThrow();
    expect(await db`SELECT count(*)::int AS count FROM assessment`).toEqual(before);
  });
  it("never overwrites existing authored content when a new repository seeds", async () => {
    const id = libraryQuestions[0]!.id;
    await db`UPDATE question SET stem = 'Curated content', difficulty = 4, tags = '["curated"]' WHERE id = ${id}`;
    await repository.close();
    repository = createRepository();
    await repository.getSkillStats();
    const [row] = await db`SELECT stem, difficulty, tags FROM question WHERE id = ${id}`;
    expect(row).toEqual({stem: "Curated content", difficulty: 4, tags: ["curated"]});
  });
});

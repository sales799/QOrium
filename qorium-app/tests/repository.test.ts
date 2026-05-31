import { afterEach, describe, expect, it, vi } from "vitest";
import { createRepository } from "../apps/api/src/store.js";

describe("QOrium repository", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("persists assessment, attempt, and audit rows in the local fallback", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const repository = createRepository();

    const stats = await repository.getSkillStats();
    expect(stats.total).toBeGreaterThanOrEqual(150);

    const assessment = await repository.createAssessment({
      title: "Repository contract",
      candidateEmail: "candidate@example.com",
      skillIds: ["engineering.java"],
      questionsPerSkill: 2,
      expiresAt: new Date(Date.now() + 60_000)
    });
    expect(assessment.questions).toHaveLength(2);
    await repository.audit("assessment.created", { title: assessment.title }, { assessmentId: assessment.id });

    const attempt = await repository.createAttempt({
      assessmentId: assessment.id,
      candidateEmail: assessment.candidateEmail,
      answers: [{ questionId: assessment.questions[0]?.id ?? "missing", response: 0, grade: 1, confidence: 1 }]
    });

    await expect(repository.getAssessment(assessment.id)).resolves.toMatchObject({ id: assessment.id });
    await expect(repository.getAttempt(attempt.id)).resolves.toMatchObject({ id: attempt.id });
    await expect(repository.getAuditSample()).resolves.toHaveLength(1);
    await repository.close();
  });
});

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
      orgId: "demo-org",
      title: "Repository contract",
      candidateEmail: "candidate@example.com",
      skillIds: ["engineering.java"],
      questionsPerSkill: 2,
      expiresAt: new Date(Date.now() + 60_000)
    });
    expect(assessment.questions).toHaveLength(2);
    await repository.audit("assessment.created", { title: assessment.title }, { assessmentId: assessment.id }, undefined, "demo-org");

    const attempt = await repository.createAttempt({
      orgId: "demo-org",
      assessmentId: assessment.id,
      candidateEmail: assessment.candidateEmail,
      answers: [{ questionId: assessment.questions[0]?.id ?? "missing", response: 0, grade: 1, confidence: 1 }]
    });

    await expect(repository.getAssessment(assessment.id, "demo-org")).resolves.toMatchObject({ id: assessment.id });
    await expect(repository.getAttempt(attempt.id, "demo-org")).resolves.toMatchObject({ id: attempt.id });
    await expect(repository.getAuditSample()).resolves.toHaveLength(1);
    await repository.close();
  });

  it("prevents cross-tenant reads in the local fallback repository", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const repository = createRepository();

    const tenantA = await repository.createAssessment({
      orgId: "tenant-a",
      title: "Tenant A assessment",
      candidateEmail: "candidate-a@example.com",
      skillIds: ["engineering.java"],
      questionsPerSkill: 1,
      expiresAt: new Date(Date.now() + 60_000)
    });
    const tenantAAttempt = await repository.createAttempt({
      orgId: "tenant-a",
      assessmentId: tenantA.id,
      candidateEmail: tenantA.candidateEmail,
      answers: [{ questionId: tenantA.questions[0]?.id ?? "missing", response: 0, grade: 1, confidence: 1 }]
    });

    await expect(repository.getAssessment(tenantA.id, "tenant-a")).resolves.toMatchObject({ id: tenantA.id });
    await expect(repository.getAssessment(tenantA.id, "tenant-b")).resolves.toBeNull();
    await expect(repository.getAttempt(tenantAAttempt.id, "tenant-a")).resolves.toMatchObject({ id: tenantAAttempt.id });
    await expect(repository.getAttempt(tenantAAttempt.id, "tenant-b")).resolves.toBeNull();

    await repository.close();
  });
});

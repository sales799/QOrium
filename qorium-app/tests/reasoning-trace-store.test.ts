import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ReasoningTraceStore } from "../apps/api/src/reasoning-trace-store.js";

const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("ReasoningTraceStore", () => {
  it("writes grader reasoning as a persistent object and reads it by ref", async () => {
    const dir = await mkdtemp(join(tmpdir(), "qorium-reasoning-"));
    dirs.push(dir);
    const store = new ReasoningTraceStore(dir);

    const ref = await store.write({
      assessmentId: "assessment-1",
      questionId: "question-1",
      score: 0.75,
      confidence: 0.9,
      reasoning: "Rubric matched the expected production-grade answer.",
      grader: "m4",
      createdAt: "2026-05-31T00:00:00.000Z"
    });

    expect(ref).toMatch(/^file:\/\//);
    await expect(store.readReasoning(ref)).resolves.toBe("Rubric matched the expected production-grade answer.");
  });
});

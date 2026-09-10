import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildServer } from "../apps/api/src/server.js";
import { ReasoningTraceStore } from "../apps/api/src/reasoning-trace-store.js";

const forbidden = new Set(["correctAnswer", "explanation", "irt", "rubric", "testExpectation", "languageHints", "reasoning", "reasoningTraceRef", "response", "grade", "confidence", "score"]);
function assertPublic(value: unknown) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    expect(forbidden.has(key), `Public response contains ${key}`).toBe(false);
    assertPublic(child);
  }
}
let app: ReturnType<typeof buildServer>;
let folder: string;
let cookie: string;
beforeEach(async () => {
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("OPENROUTER_API_KEY", "");
  folder = await mkdtemp(join(tmpdir(), "qorium-privacy-"));
  vi.stubEnv("QORIUM_REASONING_TRACE_DIR", folder);
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network prohibited in this test")));
  app = buildServer();
  const login = await app.inject({ method: "POST", url: "/api/v1/recruiter/login", payload: { email: "recruiter@example.com", password: "dev-recruiter-password" } });
  cookie = String(login.headers["set-cookie"]);
});
afterEach(async () => {
  await app.close();
  await rm(folder, { recursive: true, force: true });
  vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals();
});
async function create(clone = false) {
  const res = await app.inject({ method: "POST", url: clone ? "/api/v1/assessments/clone" : "/api/v1/assessments", headers: { cookie }, payload: clone ? { skillId: "engineering.java", candidateEmail: "candidate@example.test" } : { title: "Privacy contract", candidateEmail: "candidate@example.test", skillIds: ["engineering.java"] } });
  expect(res.statusCode).toBe(201);
  return res.json();
}
describe("public assessment data boundary", () => {
  it("never exposes grading fields in the public library", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/library/questions" });
    expect(res.statusCode).toBe(200); expect(res.json().data.length).toBeGreaterThan(0); assertPublic(res.json());
  });
  it("protects create, clone and token responses while retaining candidate questions", async () => {
    for (const clone of [false, true]) {
      const data = await create(clone); assertPublic(data);
      expect(data.assessment.questions[0].stem).toBeTruthy();
      for (const url of [`/api/v1/assessments/by-token/${encodeURIComponent(data.token)}`, `/api/v1/assessments/by-token?token=${encodeURIComponent(data.token)}`]) {
        const res = await app.inject({ method: "GET", url }); expect(res.statusCode).toBe(200); assertPublic(res.json());
      }
    }
  });
  it("returns receipts while preserving internal grading traces", async () => {
    const trace = vi.spyOn(ReasoningTraceStore.prototype, "write");
    const data = await create();
    const submit = await app.inject({ method: "POST", url: "/api/v1/attempts/submit", payload: { token: data.token, candidateEmail: "candidate@example.test", answers: [{ questionId: data.assessment.questions[0].id, response: 0 }] } });
    expect(submit.statusCode).toBe(201); assertPublic(submit.json());
    expect(trace).toHaveBeenCalledWith(expect.objectContaining({ reasoning: expect.any(String), score: expect.any(Number) }));
    const result = await app.inject({ method: "GET", url: `/api/v1/attempts/${submit.json().attempt.id}/result` });
    expect(result.statusCode).toBe(200); assertPublic(result.json());
    expect(result.json().attempt.answerCount).toBe(1);
    expect(result.body).not.toContain("candidate@example.test");
  });
  it("does not expose the audit sample to public or ordinary recruiter callers", async () => {
    expect((await app.inject({ method: "GET", url: "/api/v1/audit-log/sample" })).statusCode).toBe(401);
    expect((await app.inject({ method: "GET", url: "/api/v1/audit-log/sample", headers: { cookie } })).statusCode).toBe(403);
  });
});

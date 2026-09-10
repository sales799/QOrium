import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildServer } from "../apps/api/src/server.js";
import { signRecruiterToken } from "../packages/auth/src/index.js";
let app: ReturnType<typeof buildServer>;
let folder: string;
const authorization = (orgId: string, scopes = ["assessment:write", "audit:read"]) => `Bearer ${signRecruiterToken({orgId, scopes, email: "test@example.test", recruiterId: "synthetic", exp: Date.now() + 60000})}`;
beforeEach(async () => {
  vi.stubEnv("DATABASE_URL", process.env.QORIUM_ORG_TEST_DATABASE_URL ?? "");
  vi.stubEnv("OPENROUTER_API_KEY", "");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network prohibited")));
  folder = await mkdtemp(join(tmpdir(), "qorium-org-"));
  vi.stubEnv("QORIUM_REASONING_TRACE_DIR", folder);
  app = buildServer();
});
afterEach(async () => {
  await app.close(); await rm(folder, { recursive: true, force: true });
  vi.unstubAllGlobals(); vi.unstubAllEnvs();
});
const payload = {title: "Organization contract", candidateEmail: "synthetic@example.test", skillIds: ["engineering.java"], orgId: "forged-org"};
describe("organization access boundaries", () => {
  it("keeps create, clone and grading audit records in the authenticated organization", async () => {
    const ids: Record<string, string[]> = {"org-a": [], "org-b": []};
    for (const org of Object.keys(ids)) {
      for (const clone of [false, true]) {
        const result = await app.inject({method: "POST", url: clone ? "/api/v1/assessments/clone" : "/api/v1/assessments", headers: {authorization: authorization(org)}, payload: clone ? {...payload, skillId: "engineering.java"} : payload});
        expect(result.statusCode).toBe(201);
        const data = result.json(); ids[org]!.push(data.assessment.id);
        if (!clone) {
          const submission = await app.inject({method: "POST", url: "/api/v1/attempts/submit", payload: {token: data.token, candidateEmail: payload.candidateEmail, answers: [{questionId: data.assessment.questions[0].id, response: 0}]}});
          expect(submission.statusCode).toBe(201);
        }
      }
    }
    for (const org of Object.keys(ids)) {
      const result = await app.inject({method: "GET", url: "/api/v1/audit-log/sample", headers: {authorization: authorization(org)}});
      expect(result.statusCode).toBe(200);
      const rows = result.json().data;
      expect(rows.length).toBeGreaterThanOrEqual(4);
      expect(rows.every((row: {orgId: string}) => row.orgId === org)).toBe(true);
      expect(rows.every((row: {refs: {assessmentId: string}}) => ids[org]!.includes(row.refs.assessmentId))).toBe(true);
      expect(rows.map((row: {event: string}) => row.event)).toEqual(expect.arrayContaining(["assessment.created", "assessment.cloned_from_library", "answer.graded", "attempt.submitted"]));
    }
  });
  it("requires assessment write permission on both creation routes", async () => {
    for (const clone of [false, true]) {
      const result = await app.inject({method: "POST", url: clone ? "/api/v1/assessments/clone" : "/api/v1/assessments", headers: {authorization: authorization("org-readonly", ["assessment:read"])}, payload: clone ? {...payload, skillId: "engineering.java"} : payload});
      expect(result.statusCode).toBe(403);
    }
  });
});

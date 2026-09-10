import { createHmac, randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signAssessmentLink, verifyAssessmentToken, verifyRecruiterToken } from "../packages/auth/src/index.js";
import { buildServer } from "../apps/api/src/server.js";
const secret = randomBytes(32).toString("hex");
function signed(payload: unknown) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}
const recruiter = () => ({recruiterId: "test", email: "test@example.test", orgId: "org-test", scopes: ["assessment:read"], jti: "test-session", exp: Date.now() + 60000});
const servers: ReturnType<typeof buildServer>[] = [];
beforeEach(() => { vi.stubEnv("DATABASE_URL", ""); });
afterEach(async () => { for (const app of servers.splice(0)) await app.close(); vi.unstubAllEnvs(); });

describe("signed token validation", () => {
  it.each([undefined, null, "never", "9999999999999", 0, -1, 1.5])("rejects invalid expiry %s even with a valid signature", (exp) => {
    expect(() => verifyAssessmentToken(signed({assessmentId: "assessment-test", exp}), secret)).toThrow();
    expect(() => verifyRecruiterToken(signed({...recruiter(), exp}), secret)).toThrow();
  });
  it("rejects an extra segment and noncanonical token encodings", () => {
    const token = signAssessmentLink({assessmentId: "assessment-test", exp: Date.now() + 60000}, secret);
    expect(() => verifyAssessmentToken(`${token}.extra`, secret)).toThrow();
    const [body, signature] = token.split(".");
    expect(() => verifyAssessmentToken(`${body}=.${signature}`, secret)).toThrow();
    expect(() => verifyAssessmentToken(`${body}.x`, secret)).toThrow();
  });
  it("validates resource and recruiter claim types", () => {
    for (const assessmentId of [undefined, null, {}, [], " "]) expect(() => verifyAssessmentToken(signed({assessmentId, exp: Date.now() + 60000}), secret)).toThrow();
    for (const change of [{orgId: {}}, {recruiterId: []}, {email: " "}, {jti: 4}, {scopes: [4]}, {scopes: [""]}]) expect(() => verifyRecruiterToken(signed({...recruiter(), ...change}), secret)).toThrow();
  });
  it("accepts the existing valid wire format", () => {
    expect(verifyAssessmentToken(signed({assessmentId: "assessment-test", exp: Date.now() + 60000}), secret).assessmentId).toBe("assessment-test");
    expect(verifyRecruiterToken(signed(recruiter()), secret).orgId).toBe("org-test");
  });
});

function production() {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("QORIUM_SIGNING_SECRET", randomBytes(32).toString("hex"));
  vi.stubEnv("QORIUM_RECRUITER_JWT_SECRET", randomBytes(32).toString("hex"));
  vi.stubEnv("QORIUM_RECRUITER_EMAIL", "synthetic@example.test");
  vi.stubEnv("QORIUM_RECRUITER_PASSWORD", randomBytes(24).toString("hex"));
  vi.stubEnv("QORIUM_RECRUITER_ORG_ID", "synthetic-org");
  vi.stubEnv("QORIUM_RECRUITER_COOKIE_SECURE", "true");
}
function start() { servers.push(buildServer()); }
describe("production authentication configuration", () => {
  it.each(["QORIUM_SIGNING_SECRET", "QORIUM_RECRUITER_JWT_SECRET", "QORIUM_RECRUITER_EMAIL", "QORIUM_RECRUITER_PASSWORD", "QORIUM_RECRUITER_ORG_ID"])("refuses absent %s before opening services", (name) => {
    production(); vi.stubEnv(name, ""); expect(start).toThrow();
  });
  it("refuses known development credentials and insecure cookies", () => {
    production(); vi.stubEnv("QORIUM_RECRUITER_PASSWORD", "dev-recruiter-password"); expect(start).toThrow();
    production(); vi.stubEnv("QORIUM_SIGNING_SECRET", "dev-only-change-me"); expect(start).toThrow();
    production(); vi.stubEnv("QORIUM_RECRUITER_COOKIE_SECURE", "false"); expect(start).toThrow();
  });
  it("requires separate production signing keys", () => {
    production(); vi.stubEnv("QORIUM_RECRUITER_JWT_SECRET", process.env.QORIUM_SIGNING_SECRET!); expect(start).toThrow();
  });
  it("accepts explicitly configured production credentials", () => { production(); expect(start).not.toThrow(); });
});

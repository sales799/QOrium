import { describe, expect, it } from "vitest";
import {
  clearRecruiterCookie,
  readCookie,
  recruiterCookie,
  signRecruiterToken,
  verifyRecruiterToken
} from "../packages/auth/src/index.js";

describe("recruiter auth tokens", () => {
  it("signs, verifies, and transports recruiter sessions through an HttpOnly cookie", () => {
    const token = signRecruiterToken({
      recruiterId: "recruiter:test@example.com",
      email: "test@example.com",
      orgId: "demo-org",
      scopes: ["assessment:write"],
      exp: Date.now() + 60_000
    }, "test-secret");

    expect(verifyRecruiterToken(token, "test-secret")).toMatchObject({
      recruiterId: "recruiter:test@example.com",
      email: "test@example.com",
      orgId: "demo-org",
      scopes: ["assessment:write"]
    });

    const cookie = recruiterCookie(token, 60);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(readCookie(cookie, "qor_rec")).toBe(token);
    expect(clearRecruiterCookie()).toContain("Max-Age=0");
  });

  it("rejects tampered recruiter tokens", () => {
    const token = signRecruiterToken({
      recruiterId: "recruiter:test@example.com",
      email: "test@example.com",
      orgId: "demo-org",
      scopes: ["assessment:write"],
      exp: Date.now() + 60_000
    }, "test-secret");

    expect(() => verifyRecruiterToken(`${token.slice(0, -1)}x`, "test-secret")).toThrow();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { buildServer } from "../apps/api/src/server.js";
const postgres = createRequire(new URL("../packages/db/package.json", import.meta.url))("postgres");
let app: ReturnType<typeof buildServer> | undefined;
beforeEach(() => { vi.stubEnv("DATABASE_URL", ""); vi.stubEnv("GIT_SHA", "not-a-revision"); });
afterEach(async () => { if (app) await app.close(); app = undefined; vi.unstubAllEnvs(); });
it("reports the memory fallback explicitly on both uncached readiness routes", async () => {
  app = buildServer();
  for (const url of ["/health", "/healthz"]) {
    const res = await app.inject({url});
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ok: true, service: "qorium-api", git_sha: "unknown", checks: {db: "memory-fallback"}});
    expect(res.headers["cache-control"]).toBe("no-store");
  }
});
it("reports unavailable databases promptly without disclosing connection details", async () => {
  const listener = createServer();
  await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = (listener.address() as {port: number}).port;
  await new Promise<void>((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
  const connection = new URL(`postgres://127.0.0.1:${port}/synthetic`);
  connection.username = "synthetic"; connection.password = "do-not-disclose";
  vi.stubEnv("DATABASE_URL", connection.toString());
  app = buildServer(); const start = Date.now();
  const res = await app.inject({url: "/healthz"});
  expect(res.statusCode).toBe(503);
  expect(res.json().checks.db).toBe("unavailable");
  expect(Date.now() - start).toBeLessThan(4500);
  expect(res.body).not.toMatch(/do-not-disclose|postgres:|127\.0\.0\.1|ECONN/);
});
it("does not mark production ready when persistence falls back to memory", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("QORIUM_SIGNING_SECRET", randomBytes(32).toString("hex"));
  vi.stubEnv("QORIUM_RECRUITER_JWT_SECRET", randomBytes(32).toString("hex"));
  vi.stubEnv("QORIUM_RECRUITER_EMAIL", "synthetic@example.test");
  vi.stubEnv("QORIUM_RECRUITER_PASSWORD", randomBytes(24).toString("hex"));
  vi.stubEnv("QORIUM_RECRUITER_ORG_ID", "synthetic"); vi.stubEnv("QORIUM_RECRUITER_COOKIE_SECURE", "true");
  app = buildServer(); const res = await app.inject({url: "/health"});
  expect(res.statusCode).toBe(503); expect(res.json().checks.db).toBe("memory-fallback");
});
const testUrl = process.env.QORIUM_HEALTH_TEST_DATABASE_URL;
describe.skipIf(!testUrl)("PostgreSQL read-only readiness", () => {
  it("checks an empty migrated database without inserting any seeds", async () => {
    const db = postgres(testUrl, {max: 1});
    try {
      const before = await db`SELECT (SELECT count(*) FROM skill)::int AS skills, (SELECT count(*) FROM question)::int AS questions`;
      expect(before[0]).toEqual({skills: 0, questions: 0});
      vi.stubEnv("DATABASE_URL", testUrl!); app = buildServer();
      const res = await app.inject({url: "/healthz"});
      expect(res.statusCode).toBe(200); expect(res.json().checks.db).toBe("ok");
      expect(await db`SELECT (SELECT count(*) FROM skill)::int AS skills, (SELECT count(*) FROM question)::int AS questions`).toEqual(before);
    } finally { await db.end(); }
  });
  it("bounds a blocked table read and recovers once the lock is released", async () => {
    const db = postgres(testUrl, {max: 1});
    vi.stubEnv("DATABASE_URL", testUrl!); app = buildServer();
    try {
      await db.begin(async (tx: ReturnType<typeof postgres>) => {
        await tx`LOCK TABLE skill IN ACCESS EXCLUSIVE MODE`;
        const start = Date.now(); const res = await app!.inject({url: "/healthz"});
        expect(res.statusCode).toBe(503); expect(Date.now() - start).toBeLessThan(4500);
      });
      expect((await app.inject({url: "/healthz"})).statusCode).toBe(200);
    } finally { await db.end(); }
  });
});

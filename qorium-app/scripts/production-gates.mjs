#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const env = process.env;
const config = {
  apiUrl: stripSlash(env.QORIUM_PROD_API_URL ?? env.API_BASE_URL ?? "http://localhost:4100"),
  webUrl: stripSlash(env.QORIUM_PROD_WEB_URL ?? "http://localhost:3000"),
  pm2Processes: splitList(env.QORIUM_PM2_PROCESSES ?? "qorium-web,qorium-api,qorium-sandbox-bridge"),
  databaseUrl: env.DATABASE_URL ?? "",
  redisUrl: env.REDIS_URL ?? "",
  watchdogCommand: env.QORIUM_WATCHDOG_COMMAND ?? "talpro_watchdog_list",
  rakshakCommand: env.QORIUM_RAKSHAK_COMMAND ?? "talpro_rakshak_score qorium",
  minRakshakScore: Number(env.QORIUM_MIN_RAKSHAK_SCORE ?? 92),
  rateLimitBurst: Number(env.QORIUM_RATE_LIMIT_BURST ?? 30),
  output: resolve(env.QORIUM_PROD_GATE_OUTPUT ?? "artifacts/production-gate-report.json")
};

const report = {
  generatedAt: new Date().toISOString(),
  target: { apiUrl: config.apiUrl, webUrl: config.webUrl },
  checks: []
};

await check("api health", async () => {
  const response = await fetch(`${config.apiUrl}/health`);
  const body = await response.json();
  assert(response.ok, `expected 2xx, got ${response.status}`);
  assert(body.ok === true, "health body did not include ok=true");
  return { status: response.status, body };
});

await check("security headers", async () => {
  const response = await fetch(`${config.apiUrl}/health`, { method: "HEAD" });
  const headers = Object.fromEntries(response.headers.entries());
  assert(headers["x-frame-options"] === "DENY", "missing X-Frame-Options DENY");
  assert(headers["x-content-type-options"] === "nosniff", "missing X-Content-Type-Options nosniff");
  assert(Boolean(headers["referrer-policy"]), "missing Referrer-Policy");
  return { status: response.status, headers };
});

await check("rate limit", async () => {
  const responses = await Promise.all(Array.from({ length: config.rateLimitBurst }, () => fetch(`${config.apiUrl}/health`)));
  const statuses = responses.map((response) => response.status);
  assert(statuses.some((status) => status === 429), `expected at least one 429 across ${config.rateLimitBurst} requests`);
  return { statuses, burst: config.rateLimitBurst };
});

await check("audit sample", async () => {
  const response = await fetch(`${config.apiUrl}/api/v1/audit-log/sample`);
  const body = await response.json();
  assert(response.ok, `expected 2xx, got ${response.status}`);
  assert(Array.isArray(body.data), "audit sample response did not include data[]");
  return { status: response.status, sampleCount: body.data.length };
});

await check("pm2 processes", async () => {
  const { stdout } = await execFileAsync("pm2", ["jlist"], { maxBuffer: 1024 * 1024 * 5 });
  const processes = JSON.parse(stdout);
  const summary = processes.map((process) => ({
    name: process.name,
    status: process.pm2_env?.status,
    instances: process.pm2_env?.instances ?? 1,
    restarts: process.pm2_env?.restart_time
  }));
  for (const name of config.pm2Processes) {
    const match = summary.find((process) => process.name === name);
    assert(match, `missing PM2 process ${name}`);
    assert(match.status === "online", `${name} is ${match.status}`);
  }
  return { expected: config.pm2Processes, processes: summary };
});

await check("database counts", async () => {
  assert(config.databaseUrl, "DATABASE_URL is required");
  const sql = [
    "select 'schema_tables', count(*) from information_schema.tables where table_schema = 'public'",
    "union all select 'skill', count(*) from skill",
    "union all select 'question', count(*) from question",
    "union all select 'audit_log', count(*) from audit_log"
  ].join(" ");
  const { stdout } = await execFileAsync("psql", [config.databaseUrl, "-v", "ON_ERROR_STOP=1", "-Atc", sql]);
  const counts = Object.fromEntries(stdout.trim().split("\n").filter(Boolean).map((line) => {
    const [name, count] = line.split("|");
    return [name, Number(count)];
  }));
  assert(counts.schema_tables >= 8, `expected at least 8 public tables, got ${counts.schema_tables ?? 0}`);
  assert(counts.skill > 0, "expected seeded skills in production DB");
  assert(counts.question > 0, "expected seeded questions in production DB");
  return counts;
});

await check("redis ping", async () => {
  assert(config.redisUrl, "REDIS_URL is required");
  const { stdout } = await execFileAsync("redis-cli", ["-u", config.redisUrl, "PING"]);
  assert(stdout.trim() === "PONG", `expected PONG, got ${stdout.trim()}`);
  return { response: stdout.trim() };
});

await check("watchdog", async () => {
  const { stdout } = await execFileAsync("sh", ["-lc", config.watchdogCommand], { maxBuffer: 1024 * 1024 * 2 });
  for (const name of config.pm2Processes) {
    assert(stdout.includes(name), `watchdog output missing ${name}`);
  }
  return { command: config.watchdogCommand, output: stdout.trim().slice(0, 4000) };
});

await check("rakshak score", async () => {
  const { stdout } = await execFileAsync("sh", ["-lc", config.rakshakCommand], { maxBuffer: 1024 * 1024 * 2 });
  const score = Number(stdout.match(/\d+(\.\d+)?/)?.[0]);
  assert(Number.isFinite(score), "could not parse Rakshak score");
  assert(score >= config.minRakshakScore, `Rakshak score ${score} below ${config.minRakshakScore}`);
  return { command: config.rakshakCommand, score, output: stdout.trim().slice(0, 4000) };
});

const failed = report.checks.filter((item) => item.status === "fail");
await mkdir(dirname(config.output), { recursive: true });
await writeFile(config.output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ok: failed.length === 0, output: config.output, failed: failed.map((item) => item.name) }, null, 2));
process.exitCode = failed.length === 0 ? 0 : 1;

async function check(name, fn) {
  const startedAt = Date.now();
  try {
    const evidence = await fn();
    report.checks.push({ name, status: "pass", durationMs: Date.now() - startedAt, evidence });
  } catch (error) {
    report.checks.push({
      name,
      status: "fail",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function stripSlash(value) {
  return value.replace(/\/+$/, "");
}

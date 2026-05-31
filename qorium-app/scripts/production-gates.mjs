#!/usr/bin/env node
import { execFile } from "node:child_process";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const env = process.env;
const config = {
  apiUrl: stripSlash(env.QORIUM_PROD_API_URL ?? env.API_BASE_URL ?? "http://localhost:4100"),
  webUrl: stripSlash(env.QORIUM_PROD_WEB_URL ?? "http://localhost:3000"),
  healthPath: ensureSlash(env.QORIUM_HEALTH_PATH ?? "/health"),
  auditPath: ensureSlash(env.QORIUM_AUDIT_SAMPLE_PATH ?? "/api/v1/audit-log/sample"),
  auditTenantId: env.QORIUM_AUDIT_TENANT_ID ?? "",
  pm2Processes: splitList(env.QORIUM_PM2_PROCESSES ?? "qorium-web,qorium-api,qorium-sandbox-bridge"),
  databaseUrl: env.DATABASE_URL ?? env.DATABASE_URL_PROD ?? "",
  databaseRuntimeRole: env.QORIUM_DB_RUNTIME_ROLE ?? "",
  minContentSkills: Number(env.QORIUM_MIN_CONTENT_SKILLS ?? 1),
  minContentSubSkills: Number(env.QORIUM_MIN_CONTENT_SUB_SKILLS ?? 1),
  minReleasedQuestions: Number(env.QORIUM_MIN_RELEASED_QUESTIONS ?? 1),
  minContentResponses: Number(env.QORIUM_MIN_CONTENT_RESPONSES ?? 1),
  redisUrl: env.REDIS_URL ?? "",
  watchdogCommand: env.QORIUM_WATCHDOG_COMMAND ?? "talpro_watchdog_list",
  rakshakCommand: env.QORIUM_RAKSHAK_COMMAND ?? "talpro_rakshak_score qorium",
  rakshakRunsDir: env.QORIUM_RAKSHAK_RUNS_DIR ?? "",
  rakshakDomain: env.QORIUM_RAKSHAK_DOMAIN ?? "",
  minRakshakScore: Number(env.QORIUM_MIN_RAKSHAK_SCORE ?? 92),
  rateLimitBurst: Number(env.QORIUM_RATE_LIMIT_BURST ?? 30),
  rateLimitPath: ensureSlash(env.QORIUM_RATE_LIMIT_PATH ?? env.QORIUM_HEALTH_PATH ?? "/health"),
  rateLimitMethod: env.QORIUM_RATE_LIMIT_METHOD ?? "GET",
  rateLimitBearerCommand: env.QORIUM_RATE_LIMIT_BEARER_COMMAND ?? "",
  rateLimitHeaderName: env.QORIUM_RATE_LIMIT_HEADER_NAME ?? "",
  rateLimitHeaderValue: env.QORIUM_RATE_LIMIT_HEADER_VALUE ?? "",
  rateLimitHeaderValueCommand: env.QORIUM_RATE_LIMIT_HEADER_VALUE_COMMAND ?? "",
  healthRequireDbOk: parseBoolean(env.QORIUM_HEALTH_REQUIRE_DB_OK),
  expectedHealthService: env.QORIUM_EXPECTED_HEALTH_SERVICE ?? "",
  expectedHealthGitSha: env.QORIUM_EXPECTED_HEALTH_GIT_SHA ?? "",
  forcedOriginIp: env.QORIUM_FORCED_ORIGIN_IP ?? "",
  forcedOriginExpectedService: env.QORIUM_FORCED_ORIGIN_EXPECTED_SERVICE ?? "",
  output: resolve(env.QORIUM_PROD_GATE_OUTPUT ?? "artifacts/production-gate-report.json")
};

const report = {
  generatedAt: new Date().toISOString(),
  target: { apiUrl: config.apiUrl, webUrl: config.webUrl },
  checks: []
};

await check("api health", async () => {
  const response = await fetch(`${config.apiUrl}${config.healthPath}`);
  const body = await parseJson(response);
  assert(response.ok, `expected 2xx, got ${response.status}`);
  assert(body.ok === true || body.status === "ok", "health body did not include ok=true or status=ok");
  if (config.healthRequireDbOk) {
    assert(body.checks?.db === "ok", `expected health checks.db=ok, got ${body.checks?.db ?? "missing"}`);
  }
  if (config.expectedHealthService) {
    assert(body.service === config.expectedHealthService, `expected service ${config.expectedHealthService}, got ${body.service ?? "missing"}`);
  }
  if (config.expectedHealthGitSha) {
    assert(body.git_sha === config.expectedHealthGitSha, `expected git_sha ${config.expectedHealthGitSha}, got ${body.git_sha ?? "missing"}`);
  }
  return { status: response.status, body };
});

await check("security headers", async () => {
  const response = await fetch(`${config.apiUrl}${config.healthPath}`, { method: "HEAD" });
  const headers = Object.fromEntries(response.headers.entries());
  assert(response.ok, `expected 2xx, got ${response.status}`);
  assert(headers["x-frame-options"] === "DENY", "missing X-Frame-Options DENY");
  assert(headers["x-content-type-options"] === "nosniff", "missing X-Content-Type-Options nosniff");
  assert(Boolean(headers["referrer-policy"]), "missing Referrer-Policy");
  return { status: response.status, headers };
});

await check("forced origin health", async () => {
  if (!config.forcedOriginIp) return { skipped: true };
  const target = new URL(`${config.apiUrl}${config.healthPath}`);
  assert(target.protocol === "https:", "forced origin health requires an https API URL");
  const { stdout } = await execFileAsync("curl", [
    "-ksS",
    "--resolve",
    `${target.hostname}:443:${config.forcedOriginIp}`,
    target.toString()
  ]);
  const body = parseJsonText(stdout);
  assert(body.ok === true || body.status === "ok", "forced origin health body did not include ok=true or status=ok");
  if (config.forcedOriginExpectedService) {
    assert(
      body.service === config.forcedOriginExpectedService,
      `expected forced origin service ${config.forcedOriginExpectedService}, got ${body.service ?? "missing"}`
    );
  }
  return { host: target.hostname, ip: config.forcedOriginIp, body };
});

await check("rate limit", async () => {
  const headers = await rateLimitHeaders();
  const responses = await Promise.all(Array.from({ length: config.rateLimitBurst }, () =>
    fetch(`${config.apiUrl}${config.rateLimitPath}`, { method: config.rateLimitMethod, headers })
  ));
  const statuses = responses.map((response) => response.status);
  assert(!statuses.some((status) => status >= 500), `received 5xx before rate limiting: ${statuses.join(",")}`);
  assert(statuses.some((status) => status === 429), `expected at least one 429 across ${config.rateLimitBurst} requests`);
  return { statuses, burst: config.rateLimitBurst, path: config.rateLimitPath, method: config.rateLimitMethod, authenticated: Object.keys(headers).length > 0 };
});

await check("audit sample", async () => {
  const headers = config.auditTenantId ? { "x-tenant-id": config.auditTenantId } : undefined;
  const response = await fetch(`${config.apiUrl}${config.auditPath}`, { headers });
  const body = await parseJson(response);
  assert(response.ok, `expected 2xx, got ${response.status}`);
  const rows = Array.isArray(body.data) ? body.data : Array.isArray(body.events) ? body.events : [];
  assert(Array.isArray(rows), "audit sample response did not include data[] or events[]");
  return { status: response.status, sampleCount: rows.length, total: body.total ?? null };
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
  const sql = `
    with relations(name) as (
      values
        ('public.skill'), ('public.question'), ('public.audit_log'),
        ('content.skills'), ('content.questions'), ('content.responses'),
        ('audit.events')
    )
    select 'schema_tables', count(*)
      from information_schema.tables
      where table_schema in ('public', 'content', 'audit', 'auth', 'billing')
    union all
    select name, coalesce((select reltuples::bigint from pg_class where oid = to_regclass(name)), 0)
      from relations
    union all
    select 'content.skills_exact', count(*) from content.skills
    union all
    select 'content.sub_skills_exact', count(*) from content.sub_skills
    union all
    select 'content.responses_exact', count(*) from content.responses
    union all
    select 'content.questions_released_readybank_exact', count(*)
      from content.questions
      where sku = 'readybank'
        and status = 'released'
        and skill_id is not null
        and sub_skill_id is not null
  `.replace(/\s+/g, " ").trim();
  const { stdout } = await execFileAsync("psql", [config.databaseUrl, "-v", "ON_ERROR_STOP=1", "-Atc", sql]);
  const counts = Object.fromEntries(stdout.trim().split("\n").filter(Boolean).map((line) => {
    const [name, count] = line.split("|");
    return [name, Number(count)];
  }));
  assert(counts.schema_tables >= 8, `expected at least 8 public tables, got ${counts.schema_tables ?? 0}`);
  assert((counts["public.question"] ?? 0) + (counts["content.questions"] ?? 0) > 0, "expected seeded questions in production DB");
  assert(counts["content.skills_exact"] >= config.minContentSkills, `expected at least ${config.minContentSkills} content skills`);
  assert(counts["content.sub_skills_exact"] >= config.minContentSubSkills, `expected at least ${config.minContentSubSkills} content sub-skills`);
  assert(
    counts["content.questions_released_readybank_exact"] >= config.minReleasedQuestions,
    `expected at least ${config.minReleasedQuestions} released linked ReadyBank questions`
  );
  assert(counts["content.responses_exact"] >= config.minContentResponses, `expected at least ${config.minContentResponses} content responses`);
  return counts;
});

await check("runtime database grants", async () => {
  if (!config.databaseRuntimeRole) return { skipped: true };
  assert(config.databaseUrl, "DATABASE_URL is required");
  assert(
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(config.databaseRuntimeRole),
    "QORIUM_DB_RUNTIME_ROLE must be a PostgreSQL role name"
  );
  const role = sqlString(config.databaseRuntimeRole);
  const sql = `
    with required(name, ok) as (
      values
        ('schema app usage', has_schema_privilege(${role}, 'app', 'USAGE')),
        ('schema content usage', has_schema_privilege(${role}, 'content', 'USAGE')),
        ('app.api_keys select', has_table_privilege(${role}, 'app.api_keys', 'SELECT')),
        ('app.api_keys update', has_table_privilege(${role}, 'app.api_keys', 'UPDATE')),
        ('app.packs select', has_table_privilege(${role}, 'app.packs', 'SELECT')),
        ('app.packs insert', has_table_privilege(${role}, 'app.packs', 'INSERT')),
        ('app.packs update', has_table_privilege(${role}, 'app.packs', 'UPDATE')),
        ('content.questions select', has_table_privilege(${role}, 'content.questions', 'SELECT')),
        ('content.skills select', has_table_privilege(${role}, 'content.skills', 'SELECT')),
        ('content.sub_skills select', has_table_privilege(${role}, 'content.sub_skills', 'SELECT'))
    )
    select name, ok from required order by name
  `.replace(/\s+/g, " ").trim();
  const { stdout } = await execFileAsync("psql", [config.databaseUrl, "-v", "ON_ERROR_STOP=1", "-Atc", sql]);
  const grants = Object.fromEntries(stdout.trim().split("\n").filter(Boolean).map((line) => {
    const [name, ok] = line.split("|");
    return [name, ok === "t"];
  }));
  const missing = Object.entries(grants).filter(([, ok]) => !ok).map(([name]) => name);
  assert(missing.length === 0, `missing runtime grants for ${config.databaseRuntimeRole}: ${missing.join(", ")}`);
  return { role: config.databaseRuntimeRole, grants };
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

await check("rakshak run evidence", async () => {
  if (!config.rakshakRunsDir || !config.rakshakDomain) return { skipped: true };
  const slug = rakshakDomainSlug(config.rakshakDomain);
  const entries = await readdir(config.rakshakRunsDir, { withFileTypes: true });
  const matches = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(`rakshak-${slug}-`))
    .map((entry) => entry.name)
    .sort();
  assert(matches.length > 0, `no Rakshak run found for ${config.rakshakDomain} in ${config.rakshakRunsDir}`);
  const latest = matches.at(-1);
  const runPath = `${config.rakshakRunsDir}/${latest}`;
  await access(`${runPath}/run.json`);
  return { domain: config.rakshakDomain, runPath };
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

async function parseJson(response) {
  const text = await response.text();
  return parseJsonText(text);
}

function parseJsonText(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`expected JSON response, got ${text.slice(0, 200)}`);
  }
}

async function rateLimitHeaders() {
  const headers = {};
  if (config.rateLimitBearerCommand) {
    const token = await commandOutput(config.rateLimitBearerCommand, "QORIUM_RATE_LIMIT_BEARER_COMMAND");
    assert(token, "QORIUM_RATE_LIMIT_BEARER_COMMAND returned an empty token");
    headers.authorization = `Bearer ${token}`;
  }

  if (config.rateLimitHeaderName) {
    const value = config.rateLimitHeaderValueCommand
      ? await commandOutput(config.rateLimitHeaderValueCommand, "QORIUM_RATE_LIMIT_HEADER_VALUE_COMMAND")
      : config.rateLimitHeaderValue;
    assert(value, "rate-limit header value is empty");
    headers[config.rateLimitHeaderName] = value;
  }

  return headers;
}

async function commandOutput(command, label) {
  const { stdout } = await execFileAsync("sh", ["-lc", command], { maxBuffer: 1024 * 1024 });
  return stdout.trim();
}

function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function stripSlash(value) {
  return value.replace(/\/+$/, "");
}

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function ensureSlash(value) {
  return value.startsWith("/") ? value : `/${value}`;
}

function rakshakDomainSlug(value) {
  return value.toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseBoolean(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

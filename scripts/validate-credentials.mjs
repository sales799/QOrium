#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

const strict = process.argv.includes('--strict');
const asJson = process.argv.includes('--json');

const env = process.env;
const results = [];

function present(name) {
  return typeof env[name] === 'string' && env[name].trim().length > 0;
}

function value(name) {
  return env[name]?.trim() ?? '';
}

function normalizeRecordOptions(options = {}) {
  if (typeof options === 'boolean') {
    return { required: options, blocksOnFailure: options };
  }
  const required = Boolean(options.required);
  return {
    required,
    blocksOnFailure: options.blocksOnFailure ?? required,
  };
}

function record(name, status, detail, options = {}) {
  const { required, blocksOnFailure } = normalizeRecordOptions(options);
  results.push({
    name,
    status,
    detail,
    required,
    blocking: status === 'FAIL' && Boolean(blocksOnFailure),
  });
}

function missing(names, label, required = true) {
  const miss = names.filter((name) => !present(name));
  if (miss.length === 0) {
    record(label, 'PASS', `${names.length} env var(s) present`, { required });
    return false;
  }
  record(label, strict && required ? 'FAIL' : 'SKIP', `missing: ${miss.join(', ')}`, {
    required,
  });
  return true;
}

async function httpCheck(name, url, okCodes = [200], init = {}, options = {}) {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
    const ok = okCodes.includes(response.status);
    record(name, ok ? 'PASS' : 'FAIL', `${url} -> HTTP ${response.status}`, options);
  } catch (error) {
    record(
      name,
      'FAIL',
      `${url} -> ${error instanceof Error ? error.message : String(error)}`,
      options,
    );
  }
}

async function checkDatabase() {
  const databaseUrl = value('DATABASE_URL_PROD') || value('DATABASE_URL');
  if (!databaseUrl) {
    record('database', strict ? 'FAIL' : 'SKIP', 'missing DATABASE_URL_PROD or DATABASE_URL', {
      required: true,
    });
    return;
  }
  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 10_000 });
    await client.connect();
    const result = await client.query('select 1 as ok');
    await client.end();
    record(
      'database',
      result.rows?.[0]?.ok === 1 ? 'PASS' : 'FAIL',
      'connectivity probe select 1',
      { required: true },
    );
  } catch (error) {
    record('database', 'FAIL', error instanceof Error ? error.message : String(error), {
      required: true,
    });
  }
}

async function checkSerper() {
  if (!present('SERPER_API_KEY')) {
    record('serper', strict ? 'FAIL' : 'SKIP', 'missing SERPER_API_KEY', { required: true });
    return;
  }
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': value('SERPER_API_KEY'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: 'qorium anti leak smoke', num: 1 }),
      signal: AbortSignal.timeout(10_000),
    });
    record('serper', response.ok ? 'PASS' : 'FAIL', `Serper smoke -> HTTP ${response.status}`, {
      required: true,
    });
  } catch (error) {
    record('serper', 'FAIL', error instanceof Error ? error.message : String(error), {
      required: true,
    });
  }
}

function checkSentry() {
  const dsn = value('SENTRY_DSN') || value('NEXT_PUBLIC_SENTRY_DSN');
  if (!dsn) {
    record('sentry', strict ? 'FAIL' : 'SKIP', 'missing SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN', {
      required: true,
    });
    return;
  }
  try {
    const parsed = new URL(dsn);
    const isSentry =
      parsed.protocol === 'https:' && parsed.hostname.length > 0 && parsed.username.length > 0;
    record(
      'sentry',
      isSentry ? 'PASS' : 'FAIL',
      isSentry ? 'DSN shape is valid' : 'DSN shape is invalid',
      { required: true },
    );
  } catch {
    record('sentry', 'FAIL', 'DSN is not a valid URL', { required: true });
  }
}

function checkAts() {
  missing(['GREENHOUSE_API_KEY'], 'ats:greenhouse');
  missing(['ASHBY_API_KEY'], 'ats:ashby');
  missing(['WORKDAY_CLIENT_ID', 'WORKDAY_CLIENT_SECRET', 'WORKDAY_TENANT_URL'], 'ats:workday');
  missing(['DARWINBOX_API_KEY', 'DARWINBOX_BASE_URL'], 'ats:darwinbox');
}

async function checkAdminPreview() {
  const adminUrl = value('QORIUM_ADMIN_URL') || 'https://admin.qorium.online/';
  if (!present('QORIUM_ADMIN_PREVIEW_TOKEN')) {
    await httpCheck('admin:public-lock', adminUrl, [401]);
    record('admin:preview-token', strict ? 'FAIL' : 'SKIP', 'missing QORIUM_ADMIN_PREVIEW_TOKEN', {
      required: true,
    });
    return;
  }
  await httpCheck(
    'admin:preview-token',
    adminUrl,
    [200],
    {
      headers: { 'x-qorium-admin-preview': value('QORIUM_ADMIN_PREVIEW_TOKEN') },
    },
    { required: true },
  );
}

async function main() {
  await httpCheck(
    'public:qorium-health',
    value('QORIUM_MARKETING_HEALTH_URL') || 'https://qorium.online/healthz',
  );
  await httpCheck(
    'public:readybank-health',
    value('QORIUM_API_HEALTH_URL') || 'https://api.qorium.online/healthz',
  );
  await httpCheck(
    'public:jdforge-health',
    value('QORIUM_JDFORGE_HEALTH_URL') || 'https://api.qorium.online/jdf/v1/health',
  );
  await httpCheck(
    'public:stackvault-health',
    value('QORIUM_STACKVAULT_HEALTH_URL') || 'https://api.qorium.online/sv/v1/health',
  );
  await httpCheck(
    'public:admin-health',
    value('QORIUM_ADMIN_HEALTH_URL') || 'https://admin.qorium.online/api/health',
  );
  await checkAdminPreview();
  await checkDatabase();
  await checkSerper();
  checkSentry();
  checkAts();

  const { failCount, blockingFailCount, warningCount, skipCount } = summarizeResults(results);

  if (asJson) {
    process.stdout.write(
      `${JSON.stringify(
        { strict, failCount, blockingFailCount, warningCount, skipCount, results },
        null,
        2,
      )}\n`,
    );
  } else {
    for (const row of results) {
      const displayStatus = row.status === 'FAIL' && !row.blocking ? 'WARN' : row.status;
      process.stdout.write(`${displayStatus.padEnd(4)} ${row.name.padEnd(26)} ${row.detail}\n`);
    }
    process.stdout.write(
      `\nSummary: ${failCount} fail, ${blockingFailCount} blocking, ${warningCount} warning, ${skipCount} skipped/missing (${strict ? 'strict' : 'non-strict'} mode)\n`,
    );
  }

  process.exitCode = blockingFailCount > 0 ? 1 : 0;
}

export function summarizeResults(rows) {
  const failCount = rows.filter((row) => row.status === 'FAIL').length;
  const blockingFailCount = rows.filter((row) => row.status === 'FAIL' && row.blocking).length;
  const warningCount = rows.filter((row) => row.status === 'FAIL' && !row.blocking).length;
  const skipCount = rows.filter((row) => row.status === 'SKIP').length;
  return { failCount, blockingFailCount, warningCount, skipCount };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}

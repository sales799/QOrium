import { isIP } from 'node:net';
import pg from 'pg';

const { Pool } = pg;

export type MarketingLeadSource = 'demo' | 'contact';

export type MarketingLeadMailStatus = 'pending' | 'sent' | 'console' | 'failed';

export type MarketingMailResult =
  | { ok: true; via: 'graph' | 'resend' | 'gmail' | 'console' }
  | { ok: false; error: string };

export interface MarketingLeadQueryClient {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

export interface RecordMarketingLeadInput {
  source: MarketingLeadSource;
  name: string;
  email: string;
  company?: string;
  role?: string;
  phone?: string;
  message?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface RecordMarketingLeadResult {
  id: string;
}

export interface CaptureMarketingLeadResult {
  ok: boolean;
  id: string | null;
  stored: boolean;
  error?: string;
}

let leadCapturePool: pg.Pool | null | undefined;

function cleanOptional(value: string | undefined): string | null {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function cleanIpAddress(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate || isIP(candidate) === 0) {
    return null;
  }
  return candidate;
}

function hasDatabaseConfig(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.DATABASE_URL ||
    (env.POSTGRES_HOST &&
      env.POSTGRES_PORT &&
      env.POSTGRES_USER &&
      env.POSTGRES_PASSWORD &&
      env.POSTGRES_DB),
  );
}

function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const host = env.POSTGRES_HOST;
  const port = env.POSTGRES_PORT;
  const user = env.POSTGRES_USER;
  const password = env.POSTGRES_PASSWORD;
  const database = env.POSTGRES_DB;

  if (!host || !port || !user || !password || !database) {
    throw new Error('Marketing lead capture database is not configured.');
  }

  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function isLeadCaptureRequired(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.QORIUM_LEAD_CAPTURE_REQUIRED === 'true' || env.NODE_ENV === 'production';
}

function getLeadCapturePool(): pg.Pool | null {
  if (!hasDatabaseConfig()) {
    return null;
  }

  if (leadCapturePool === undefined) {
    leadCapturePool = new Pool({
      connectionString: resolveDatabaseUrl(),
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      application_name: 'qorium-marketing-lead-capture',
    });
  }

  return leadCapturePool;
}

export async function recordMarketingLead(
  client: MarketingLeadQueryClient,
  input: RecordMarketingLeadInput,
): Promise<RecordMarketingLeadResult> {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO app.marketing_leads (
        source,
        name,
        email,
        company,
        role,
        phone,
        message,
        ip_address,
        user_agent,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10::jsonb)
      RETURNING id
    `,
    [
      input.source,
      input.name.trim(),
      input.email.trim().toLowerCase(),
      cleanOptional(input.company),
      cleanOptional(input.role),
      cleanOptional(input.phone),
      cleanOptional(input.message),
      cleanIpAddress(input.ipAddress),
      cleanOptional(input.userAgent),
      input.metadata ?? {},
    ],
  );

  const id = result.rows[0]?.id;
  if (!id) {
    throw new Error('Marketing lead insert did not return an id.');
  }

  return { id };
}

export async function markMarketingLeadMailStatus(
  client: MarketingLeadQueryClient,
  leadId: string,
  mail: { status: MarketingLeadMailStatus; via?: string; error?: string },
): Promise<void> {
  await client.query(
    `
      UPDATE app.marketing_leads
      SET
        mail_status = $2,
        mail_via = $3,
        mail_error = $4,
        updated_at = now()
      WHERE id = $1
    `,
    [leadId, mail.status, cleanOptional(mail.via), cleanOptional(mail.error)],
  );
}

export async function captureMarketingLead(
  input: RecordMarketingLeadInput,
): Promise<CaptureMarketingLeadResult> {
  const pool = getLeadCapturePool();

  if (!pool) {
    const error = 'Marketing lead capture database is not configured.';
    if (isLeadCaptureRequired()) {
      return { ok: false, id: null, stored: false, error };
    }

    console.warn(`[lead-capture] ${error} Skipping durable write outside production.`);
    return { ok: true, id: null, stored: false };
  }

  try {
    const { id } = await recordMarketingLead(pool, input);
    return { ok: true, id, stored: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Marketing lead capture failed.';
    console.error('[lead-capture] Failed to store marketing lead:', message);
    if (isLeadCaptureRequired()) {
      return { ok: false, id: null, stored: false, error: message };
    }

    return { ok: true, id: null, stored: false, error: message };
  }
}

export async function recordMarketingLeadMailResult(
  leadId: string | null,
  mailResult: MarketingMailResult,
): Promise<void> {
  if (!leadId) {
    return;
  }

  const pool = getLeadCapturePool();
  if (!pool) {
    return;
  }

  const status: MarketingLeadMailStatus = mailResult.ok
    ? mailResult.via === 'console'
      ? 'console'
      : 'sent'
    : 'failed';

  try {
    await markMarketingLeadMailStatus(pool, leadId, {
      status,
      ...(mailResult.ok ? { via: mailResult.via } : { error: mailResult.error }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown mail status update failure.';
    console.error('[lead-capture] Failed to update lead mail status:', message);
  }
}

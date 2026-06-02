import { createHmac } from 'node:crypto';

import { createPool, type Pool } from '@qorium/db';

const MIN_PEPPER_BYTES = 32;

let pool: Pool | null | undefined;

export function getOptionalSamlPool(): Pool | null {
  if (process.env.NODE_ENV === 'test' && process.env.QORIUM_SAML_TEST_DATABASE !== '1') {
    return null;
  }
  if (pool !== undefined) return pool;
  pool = hasDatabaseEnv() ? createPool({ applicationName: 'qorium-marketing-saml' }) : null;
  return pool;
}

export function hmacSamlIdentifier(kind: string, tenantId: string, value: string): Buffer {
  return createHmac('sha256', samlReplayPepper())
    .update(`${kind}:${tenantId}:${value}`, 'utf8')
    .digest();
}

function hasDatabaseEnv(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
    (process.env.POSTGRES_HOST &&
      process.env.POSTGRES_PORT &&
      process.env.POSTGRES_USER &&
      process.env.POSTGRES_PASSWORD &&
      process.env.POSTGRES_DB),
  );
}

function samlReplayPepper(): string {
  const pepper = process.env.QORIUM_SAML_REPLAY_PEPPER ?? process.env.QORIUM_SESSION_SIGNING_SECRET;
  if (pepper) {
    if (
      process.env.NODE_ENV === 'production' &&
      Buffer.byteLength(pepper, 'utf8') < MIN_PEPPER_BYTES
    ) {
      throw new Error('QORIUM_SAML_REPLAY_PEPPER must be at least 32 bytes in production');
    }
    return pepper;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'QORIUM_SAML_REPLAY_PEPPER is required in production when SAML DB persistence is enabled',
    );
  }
  return 'dev-only-saml-replay-pepper';
}

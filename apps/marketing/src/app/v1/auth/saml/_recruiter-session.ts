import type { ParsedSamlAssertion } from '@qorium/saml';

import { getOptionalSamlPool, hmacSamlIdentifier } from './_db';
import type { SamlProofTenant } from './_config';
import type { SamlSessionPayload } from './_session';

type SamlAuthSource = 'saml-jit' | 'saml-claim';

interface RecruiterRow {
  id: string;
  external_sso_id: string | null;
  status: 'active' | 'disabled' | 'pending';
  auth_source: string;
}

export type SamlRecruiterResolution =
  | { ok: true; recruiterId: string; authSource: SamlAuthSource; persisted: boolean }
  | { ok: false; status: number; title: string; message: string };

export async function resolveSamlRecruiter(input: {
  tenant: SamlProofTenant;
  assertion: ParsedSamlAssertion;
  email: string;
}): Promise<SamlRecruiterResolution> {
  const pool = getOptionalSamlPool();
  if (!pool) {
    return {
      ok: true,
      recruiterId: `saml:${input.tenant.slug}:${input.email}`,
      authSource: 'saml-jit',
      persisted: false,
    };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query<RecruiterRow>(
      `
        SELECT id, external_sso_id, status, auth_source
          FROM app.recruiters
         WHERE tenant_id = $1
           AND email = $2
         LIMIT 1
         FOR UPDATE
      `,
      [input.tenant.config.tenantId, input.email],
    );
    const row = existing.rows[0];
    const name = displayNameForAssertion(input.assertion, input.email);

    if (!row) {
      if (!input.tenant.config.allowJitProvisioning) {
        await client.query('ROLLBACK');
        return {
          ok: false,
          status: 403,
          title: 'SAML JIT rejected',
          message: 'JIT provisioning is disabled and no recruiter exists for this SAML subject.',
        };
      }
      const inserted = await client.query<{ id: string }>(
        `
          INSERT INTO app.recruiters (
            tenant_id,
            email,
            name,
            password_hash,
            status,
            external_sso_id,
            auth_source,
            last_login_at
          )
          VALUES ($1, $2, $3, NULL, 'active', $4, 'saml-jit', NOW())
          RETURNING id
        `,
        [input.tenant.config.tenantId, input.email, name, input.assertion.nameId],
      );
      await client.query('COMMIT');
      return {
        ok: true,
        recruiterId: inserted.rows[0]?.id ?? `saml:${input.tenant.slug}:${input.email}`,
        authSource: 'saml-jit',
        persisted: true,
      };
    }

    if (row.status === 'disabled') {
      await client.query('ROLLBACK');
      return {
        ok: false,
        status: 403,
        title: 'SAML account disabled',
        message: 'The matched recruiter account is disabled.',
      };
    }

    if (row.external_sso_id && row.external_sso_id !== input.assertion.nameId) {
      await client.query('ROLLBACK');
      return {
        ok: false,
        status: 401,
        title: 'SAML account mismatch',
        message: 'The SAML NameID does not match the subject pinned to this recruiter.',
      };
    }

    if (!row.external_sso_id && !input.tenant.config.allowJitProvisioning) {
      await client.query('ROLLBACK');
      return {
        ok: false,
        status: 403,
        title: 'SAML claim rejected',
        message: 'JIT claim is disabled for this tenant.',
      };
    }

    const authSource: SamlAuthSource = row.external_sso_id ? 'saml-jit' : 'saml-claim';
    await client.query(
      `
        UPDATE app.recruiters
           SET external_sso_id = COALESCE(external_sso_id, $2),
               auth_source = CASE
                 WHEN external_sso_id IS NULL THEN 'saml-claim'
                 ELSE auth_source
               END,
               status = CASE WHEN status = 'pending' THEN 'active' ELSE status END,
               last_login_at = NOW()
         WHERE id = $1
      `,
      [row.id, input.assertion.nameId],
    );
    await client.query('COMMIT');
    return { ok: true, recruiterId: row.id, authSource, persisted: true };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function recordSamlSession(input: {
  tenant: SamlProofTenant;
  assertion: ParsedSamlAssertion;
  session: SamlSessionPayload;
}): Promise<void> {
  const pool = getOptionalSamlPool();
  if (!pool) return;

  await pool.query(
    `
      INSERT INTO app.recruiter_sessions (
        tenant_id,
        recruiter_id,
        session_id_hash,
        auth_method,
        assertion_hash,
        expires_at
      )
      VALUES ($1, $2, $3, 'saml', $4, $5)
    `,
    [
      input.tenant.config.tenantId,
      input.session.recruiterId,
      hmacSamlIdentifier('session', input.tenant.config.tenantId, input.session.sid),
      hmacSamlIdentifier('assertion', input.tenant.config.tenantId, input.assertion.id),
      new Date(input.session.exp),
    ],
  );
}

function displayNameForAssertion(assertion: ParsedSamlAssertion, email: string): string {
  return (
    assertion.attributes['name']?.[0] ??
    assertion.attributes['displayName']?.[0] ??
    assertion.attributes['full_name']?.[0] ??
    email.split('@')[0] ??
    email
  );
}

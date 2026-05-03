import { createPool } from '@qorium/db';
import { createHmac, randomBytes } from 'node:crypto';
const tenant = 'talpro-india-customer-zero';
const tenantPrefix = 'talind001';
const family = 'internal';
const expiresAt = '2026-10-30T23:59:59Z';
const scopes = [
  'questions:read',
  'search:read',
  'export:bulk:csv',
  'export:bulk:json',
  'responses:write',
];
const recordId = 'qkr_2026_05_03_001';
const pepper = process.env.API_KEY_PEPPER;
if (!pepper || pepper.length < 32) {
  console.error('API_KEY_PEPPER missing');
  process.exit(2);
}
const c = createPool({ applicationName: 'mint-customer-zero-key' });
await c.query('BEGIN');
try {
  let tres = await c.query('SELECT id FROM app.tenants WHERE slug=$1', [tenant]);
  let tenantId;
  if (tres.rowCount === 0) {
    const ins = await c.query(
      'INSERT INTO app.tenants (name, slug, type, plan, status, billing_contact_email, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [
        'Talpro India Customer Zero',
        tenant,
        'internal',
        'enterprise',
        'active',
        'bhaskar@talpro.in',
        JSON.stringify({ record_id: recordId }),
      ],
    );
    tenantId = ins.rows[0].id;
    console.log('[mint] tenant created id=' + tenantId);
  } else {
    tenantId = tres.rows[0].id;
    console.log('[mint] tenant exists id=' + tenantId);
  }
  const suffix = randomBytes(16).toString('hex');
  const raw = 'qor_' + family + '_' + tenantPrefix + '_' + suffix;
  const prefix = 'qor_intern';
  const hashed = createHmac('sha256', pepper).update(raw, 'utf8').digest('hex');
  const keyRow = await c.query(
    'INSERT INTO app.api_keys (tenant_id, name, prefix, hashed_key, scopes, expires_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, prefix, expires_at',
    [tenantId, recordId, prefix, hashed, scopes, expiresAt],
  );
  await c.query('COMMIT');
  console.log('[mint] api_key row id=' + keyRow.rows[0].id);
  console.log('=========================================================');
  console.log('API KEY #001 single-display');
  console.log('Plaintext: ' + raw);
  console.log('=========================================================');
} catch (e) {
  await c.query('ROLLBACK');
  console.error(e.message);
  process.exit(3);
} finally {
  await c.end();
}

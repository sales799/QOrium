import { describe, expect, it } from 'vitest';
import { buildPanelTokenRequest } from '../src/lib/admin-console';

const VALID_HASH = 'abcdef0123456789'.repeat(4);

describe('buildPanelTokenRequest', () => {
  it('builds a narrow panel-token request from valid form input', () => {
    const result = buildPanelTokenRequest({
      panelistHash: ` ${VALID_HASH} `,
      ttlDays: '30',
      metadataJson: '{"cohort":"wave-1","paid":true}',
      scopesText: 'reference-panel:write, calibration:read',
    });

    expect(result).toEqual({
      ok: true,
      request: {
        panelist_id_hash_hex: VALID_HASH,
        ttl_days: 30,
        metadata: { cohort: 'wave-1', paid: true },
        scopes: ['reference-panel:write', 'calibration:read'],
      },
    });
  });

  it('rejects invalid panelist hashes before calling the backend', () => {
    const result = buildPanelTokenRequest({
      panelistHash: 'too-short',
      ttlDays: '30',
      metadataJson: '{}',
      scopesText: 'reference-panel:write',
    });

    expect(result).toEqual({
      ok: false,
      error: 'Panelist hash must be 32-128 hex characters.',
    });
  });

  it('rejects metadata that is not a JSON object', () => {
    const result = buildPanelTokenRequest({
      panelistHash: VALID_HASH,
      ttlDays: '30',
      metadataJson: '[]',
      scopesText: '',
    });

    expect(result).toEqual({
      ok: false,
      error: 'Metadata JSON must be an object.',
    });
  });

  it('rejects TTL values outside the backend contract', () => {
    const result = buildPanelTokenRequest({
      panelistHash: VALID_HASH,
      ttlDays: '366',
      metadataJson: '',
      scopesText: '',
    });

    expect(result).toEqual({
      ok: false,
      error: 'TTL must be a whole number from 1 to 365 days.',
    });
  });
});

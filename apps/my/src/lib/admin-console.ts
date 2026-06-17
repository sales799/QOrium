export type PanelTokenRequest = {
  panelist_id_hash_hex: string;
  ttl_days: number;
  metadata?: Record<string, unknown>;
  scopes?: string[];
};

export type PanelTokenFormInput = {
  panelistHash: string;
  ttlDays: string;
  metadataJson: string;
  scopesText: string;
};

export type PanelTokenFormResult =
  | { ok: true; request: PanelTokenRequest }
  | { ok: false; error: string };

const PANELIST_HASH_HEX_RE = /^[0-9a-f]{32,128}$/i;

export function buildPanelTokenRequest(input: PanelTokenFormInput): PanelTokenFormResult {
  const panelistHash = input.panelistHash.trim();
  if (!PANELIST_HASH_HEX_RE.test(panelistHash)) {
    return {
      ok: false,
      error: 'Panelist hash must be 32-128 hex characters.',
    };
  }

  const ttlDays = Number(input.ttlDays);
  if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 365) {
    return { ok: false, error: 'TTL must be a whole number from 1 to 365 days.' };
  }

  const metadataText = input.metadataJson.trim();
  let metadata: Record<string, unknown> | undefined;
  if (metadataText) {
    try {
      const parsed = JSON.parse(metadataText) as unknown;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        return { ok: false, error: 'Metadata JSON must be an object.' };
      }
      metadata = parsed as Record<string, unknown>;
    } catch {
      return { ok: false, error: 'Metadata must be valid JSON.' };
    }
  }

  const scopes = input.scopesText
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);

  return {
    ok: true,
    request: {
      panelist_id_hash_hex: panelistHash,
      ttl_days: ttlDays,
      ...(metadata ? { metadata } : {}),
      ...(scopes.length ? { scopes } : {}),
    },
  };
}

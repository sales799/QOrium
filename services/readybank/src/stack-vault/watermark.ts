/**
 * Stack-Vault double-watermark.
 *
 * Stack-Vault questions need TWO watermark layers per Constitution §1.2
 * SKU 3 (anti-leak moat for IP-protected library):
 *
 *   Layer 1 (static, baked into the question row at author-time):
 *     `content.questions.watermark_seed` — same as ReadyBank; binds the
 *     question content to its authoring run.
 *
 *   Layer 2 (rendered, per-tenant, per-render):
 *     HMAC-SHA256(vaultPepper, watermark_seed || tenant_id || render_id)
 *     Computed at /v1/stack-vault/questions/:uuid response time.
 *     Embedded as: (a) invisible homoglyph stego in question body when
 *     rendered as text; (b) visible footer "QOR-{tenant_short}-{render8}"
 *     so any leak is traceable to (tenant, render-event) deterministically.
 *
 * If a tenant leaks a question to a competitor, the visible footer says
 * exactly which tenant + which render-event leaked. The invisible
 * homoglyph layer survives copy-paste even when the visible footer is
 * stripped.
 *
 * The pepper is per-vault (per-tenant) so rotating one tenant's pepper
 * (e.g., suspected key compromise) doesn't invalidate other tenants'
 * watermarks. Pepper lives in `app.tenant_stack_vaults.watermark_pepper_enc`
 * encrypted at rest.
 *
 * NOTE on "stego" — this module currently emits the visible footer +
 * a deterministic homoglyph mask for ASCII letters as a starter
 * implementation. A production deployment may use a stronger
 * stego primitive; that's a CTO-DELTA scoped to anti-leak forensics.
 */

import { createHmac, randomBytes } from 'node:crypto';

export interface DoubleWatermarkInput {
  /** The question's static watermark_seed (Layer 1). */
  baseSeed: string;
  /** Authenticated tenant id (UUID). */
  tenantId: string;
  /** Per-vault pepper, decrypted from app.tenant_stack_vaults.watermark_pepper_enc. */
  vaultPepper: string;
  /** Render event id; defaults to a random UUID if not provided. */
  renderId?: string;
}

export interface DoubleWatermarkResult {
  /** Hex-encoded full HMAC; opaque receipt for forensic lookup. */
  signature: string;
  /** Human-visible footer string, e.g. "QOR-tenant1-a3f9c2b1". */
  visibleFooter: string;
  /** The render id used to compute the signature (for audit). */
  renderId: string;
}

const VAULT_PEPPER_MIN_LEN = 32;

export function computeDoubleWatermark(input: DoubleWatermarkInput): DoubleWatermarkResult {
  if (!input.vaultPepper || input.vaultPepper.length < VAULT_PEPPER_MIN_LEN) {
    throw new Error(`vaultPepper must be >= ${VAULT_PEPPER_MIN_LEN} chars`);
  }
  if (!input.baseSeed) {
    throw new Error('baseSeed is required');
  }
  if (!input.tenantId) {
    throw new Error('tenantId is required');
  }

  const renderId = input.renderId ?? randomBytes(8).toString('hex');
  const signature = createHmac('sha256', input.vaultPepper)
    .update(input.baseSeed)
    .update('|')
    .update(input.tenantId)
    .update('|')
    .update(renderId)
    .digest('hex');

  // Footer: short tenant prefix + first 8 sig chars for human readability.
  const tenantPrefix = input.tenantId.slice(0, 8);
  const visibleFooter = `QOR-${tenantPrefix}-${signature.slice(0, 8)}`;

  return { signature, visibleFooter, renderId };
}

/**
 * Append the visible watermark footer to a rendered Markdown body.
 * Idempotent: if the body already has a watermark footer, replaces it.
 */
export function applyVisibleFooter(body: string, footer: string): string {
  const FOOTER_LINE_RE = /\n*<!-- watermark: [^>]+ -->\n*$/;
  const stripped = body.replace(FOOTER_LINE_RE, '');
  return `${stripped}\n\n<!-- watermark: ${footer} -->\n`;
}

/**
 * Apply a deterministic homoglyph mask to a small subset of ASCII letters
 * driven by the signature. Survives copy-paste in most editors that don't
 * normalize unicode. Reversible only via the original signature.
 *
 * This is a starter primitive — a hardened deployment would use a vetted
 * stego library. Filed as CTO-DELTA candidate if higher-grade is needed.
 */
export function applyHomoglyphStego(body: string, signature: string): string {
  // Latin → Cyrillic homoglyphs (visually identical in most fonts).
  const map: Record<string, string> = {
    a: 'а',
    e: 'е',
    o: 'о',
    p: 'р',
    c: 'с',
    A: 'А',
    E: 'Е',
    O: 'О',
    P: 'Р',
    C: 'С',
  };
  const sigBytes = Buffer.from(signature, 'hex');
  let bitIdx = 0;
  let out = '';
  for (const ch of body) {
    if (map[ch] && bitIdx < sigBytes.length * 8) {
      const byte = sigBytes[bitIdx >>> 3] ?? 0;
      const bit = (byte >>> (7 - (bitIdx & 7))) & 1;
      out += bit === 1 ? map[ch] : ch;
      bitIdx++;
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Watermark Engine v0 (Sprint 1.2).
 *
 * Per CTO Architecture §Anti-Leak — every candidate sees a deterministically
 * watermarked variant of each question. The watermark is a short token
 * computed from (question_id, session_watermark_salt) and embedded in the
 * rendered question body in a way that doesn't change semantics but uniquely
 * identifies which candidate's variant leaked if a question shows up online.
 *
 * v0 implementation: 8-character HMAC-SHA256 prefix, embedded as an
 * HTML/Markdown comment at the top of the body. Real v1 (Sprint 4 per
 * Anti-Leak-Engine-v0-Design.md) will substitute synonym variants and
 * shuffle distractor ordering — both are layered ON TOP of this base
 * marker, not in place of it. The marker stays as audit anchor.
 */
import { createHmac } from 'node:crypto';

export interface WatermarkOptions {
  questionId: string;
  sessionSalt: string;
  /** Defaults to 8 hex chars. */
  length?: number;
}

export function watermarkToken(opts: WatermarkOptions): string {
  const len = Math.max(4, Math.min(opts.length ?? 8, 32));
  const hmac = createHmac('sha256', opts.sessionSalt);
  hmac.update(opts.questionId, 'utf8');
  return hmac.digest('hex').slice(0, len);
}

/**
 * Apply the watermark to a question body. Embeds an HTML comment so it
 * survives both Markdown rendering and plaintext display without altering
 * the semantic content the candidate reads.
 */
export function applyWatermark(body: string, token: string): string {
  return `<!-- qor-wm:${token} -->\n${body}`;
}

/**
 * Convenience: returns the body with the watermark already applied.
 */
export function watermarkBody(body: string, opts: WatermarkOptions): string {
  return applyWatermark(body, watermarkToken(opts));
}

/**
 * Released-question reads. The crawler scans only `status='released'` items;
 * draft / sme_review / calibrating items aren't customer-visible yet.
 */

import type { Pool } from '@qorium/db';

export interface ReleasedQuestion {
  id: string;
  uuid: string;
  bodyMd: string;
  format: string;
  sku: string;
}

interface ReleasedQuestionRaw {
  id: string;
  uuid: string;
  body_md: string;
  format: string;
  sku: string;
}

export interface ListReleasedOptions {
  /** Hard cap to avoid unbounded scans on operator mistakes. Defaults to 5,000 per spec §10. */
  limit?: number;
}

const DEFAULT_LIMIT = 5_000;
const MAX_LIMIT = 20_000;

export async function listReleasedQuestions(
  pool: Pool,
  opts: ListReleasedOptions = {},
): Promise<ReleasedQuestion[]> {
  const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const result = await pool.query<ReleasedQuestionRaw>(
    `SELECT id, uuid, body_md, format, sku
       FROM content.questions
      WHERE status = 'released'
      ORDER BY released_at DESC NULLS LAST, id ASC
      LIMIT $1`,
    [limit],
  );
  return result.rows.map((r) => ({
    id: r.id,
    uuid: r.uuid,
    bodyMd: r.body_md,
    format: r.format,
    sku: r.sku,
  }));
}

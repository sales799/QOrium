/**
 * Postgres queries for the delivery worker. Wraps the
 * webhooks.{events, deliveries, subscriptions} tables shipped in
 * migration 0010.
 */

import type { Pool } from '@qorium/db';

export interface PendingDeliveryRow {
  id: string;
  eventId: string;
  subscriptionId: string;
  attemptCount: number;
  firstAttemptAt: number;
  endpointUrl: string;
  signingSecret: string;
  envelopeBody: string;
  eventType: string;
}

interface RawPendingRow {
  id: string;
  event_id: string;
  subscription_id: string;
  attempt_count: number;
  created_at: Date;
  endpoint_url: string;
  signing_secret_cipher: string;
  payload: unknown;
  event_type: string;
  tenant_id: string;
  aggregate_id: string | null;
}

export interface ListPendingOptions {
  limit?: number;
  /** SQL `now()` override for tests (Date). Default = Postgres NOW(). */
  now?: Date;
}

/**
 * Drain pending deliveries due for retry. The worker calls this on
 * each tick; the result is the queue of work for the next deliver
 * pass. Uses the partial index `webhooks_deliveries_pending_idx`.
 */
export async function listPendingDeliveries(
  pool: Pool,
  opts: ListPendingOptions = {},
): Promise<PendingDeliveryRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 500);
  const result = await pool.query<RawPendingRow>(
    `SELECT d.id, d.event_id, d.subscription_id, d.attempt_count, d.created_at,
            s.endpoint_url, s.signing_secret_cipher, s.event_type AS sub_event_type,
            e.payload, e.event_type, e.tenant_id, e.aggregate_id
       FROM webhooks.deliveries d
       JOIN webhooks.subscriptions s ON s.id = d.subscription_id
       JOIN webhooks.events e ON e.id = d.event_id
      WHERE d.status = 'pending'
        AND (d.next_retry_at IS NULL OR d.next_retry_at <= COALESCE($1::timestamptz, NOW()))
        AND s.is_active = true
      ORDER BY d.created_at ASC
      LIMIT $2`,
    [opts.now ?? null, limit],
  );
  return result.rows.map((r) => ({
    id: r.id,
    eventId: r.event_id,
    subscriptionId: r.subscription_id,
    attemptCount: r.attempt_count,
    firstAttemptAt: r.created_at.getTime(),
    endpointUrl: r.endpoint_url,
    signingSecret: r.signing_secret_cipher,
    envelopeBody: JSON.stringify({
      id: r.event_id,
      event_type: r.event_type,
      tenant_id: r.tenant_id,
      aggregate_id: r.aggregate_id,
      data: r.payload,
      idempotency_key: r.event_id,
    }),
    eventType: r.event_type,
  }));
}

export async function markDelivered(
  pool: Pool,
  deliveryId: string,
  httpStatus: number,
): Promise<void> {
  await pool.query(
    `UPDATE webhooks.deliveries
        SET status = 'delivered',
            http_status = $1,
            attempt_count = attempt_count + 1,
            delivered_at = NOW(),
            updated_at = NOW(),
            last_error = NULL,
            next_retry_at = NULL
      WHERE id = $2`,
    [httpStatus, deliveryId],
  );
  await pool.query(
    `UPDATE webhooks.subscriptions
        SET consecutive_failures = 0, updated_at = NOW()
       FROM webhooks.deliveries d
      WHERE d.id = $1 AND d.subscription_id = webhooks.subscriptions.id`,
    [deliveryId],
  );
}

export async function markRetry(
  pool: Pool,
  deliveryId: string,
  inputs: { httpStatus: number; retryAt: Date; reason: string },
): Promise<void> {
  await pool.query(
    `UPDATE webhooks.deliveries
        SET status = 'pending',
            http_status = $1,
            attempt_count = attempt_count + 1,
            next_retry_at = $2,
            last_error = $3,
            updated_at = NOW()
      WHERE id = $4`,
    [inputs.httpStatus, inputs.retryAt, inputs.reason, deliveryId],
  );
  await pool.query(
    `UPDATE webhooks.subscriptions
        SET consecutive_failures = consecutive_failures + 1, updated_at = NOW()
       FROM webhooks.deliveries d
      WHERE d.id = $1 AND d.subscription_id = webhooks.subscriptions.id`,
    [deliveryId],
  );
}

export async function markAbandoned(
  pool: Pool,
  deliveryId: string,
  inputs: { httpStatus: number; reason: string },
): Promise<void> {
  await pool.query(
    `UPDATE webhooks.deliveries
        SET status = 'abandoned',
            http_status = $1,
            attempt_count = attempt_count + 1,
            last_error = $2,
            next_retry_at = NULL,
            updated_at = NOW()
      WHERE id = $3`,
    [inputs.httpStatus, inputs.reason, deliveryId],
  );
}

/**
 * Producer-side: emit a domain event into webhooks.events + create
 * a `pending` delivery row for every active subscription that matches.
 * Returns the event id + how many deliveries were enqueued.
 */
export async function emitEvent(
  pool: Pool,
  inputs: {
    tenantId: string;
    eventType: string;
    aggregateId?: string;
    payload: unknown;
  },
): Promise<{ eventId: string; deliveriesQueued: number }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const evt = await client.query<{ id: string }>(
      `INSERT INTO webhooks.events (tenant_id, event_type, aggregate_id, payload)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [inputs.tenantId, inputs.eventType, inputs.aggregateId ?? null, inputs.payload],
    );
    const eventId = evt.rows[0]?.id;
    if (!eventId) throw new Error('emitEvent: insert returned no id');
    const inserted = await client.query<{ count: string }>(
      `WITH matched AS (
         SELECT id FROM webhooks.subscriptions
          WHERE tenant_id = $1
            AND is_active = true
            AND (event_type = '*' OR event_type = $2 OR (
              event_type LIKE '%.*'
              AND (
                $2 = LEFT(event_type, LENGTH(event_type) - 2)
                OR $2 LIKE LEFT(event_type, LENGTH(event_type) - 2) || '.%'
              )
            ))
       ),
       inserted AS (
         INSERT INTO webhooks.deliveries (event_id, subscription_id, status)
         SELECT $3, id, 'pending' FROM matched
         RETURNING 1
       )
       SELECT COUNT(*)::text AS count FROM inserted`,
      [inputs.tenantId, inputs.eventType, eventId],
    );
    await client.query('COMMIT');
    return {
      eventId,
      deliveriesQueued: Number(inserted.rows[0]?.count ?? 0),
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {
      /* swallow */
    });
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Pino → Grafana Loki shipper helper. Pure logic; the caller wires
 * the actual stream output (HTTP POST or pino-loki transport) at the
 * boundary.
 */

import type { LogEvent } from 'pino';

export interface LokiStreamLabels {
  service: string;
  env: 'staging' | 'production';
  /** Optional version label, e.g. git_sha. */
  version?: string;
}

export interface LokiPayload {
  streams: Array<{
    stream: Record<string, string>;
    values: Array<[string, string]>; // [unix-ns, line]
  }>;
}

export interface BatchInputs {
  events: LogEvent[];
  labels: LokiStreamLabels;
  /** Override `now` for tests. */
  now?: () => number;
}

export function buildLokiPayload(inputs: BatchInputs): LokiPayload {
  const labels: Record<string, string> = {
    service: inputs.labels.service,
    env: inputs.labels.env,
  };
  if (inputs.labels.version) labels.version = inputs.labels.version;
  const values: Array<[string, string]> = inputs.events.map((evt) => {
    const ts = (inputs.now ?? (() => Date.now()))() * 1_000_000;
    return [String(ts), JSON.stringify(evt)];
  });
  return {
    streams: [{ stream: labels, values }],
  };
}

export interface ShipOptions {
  url: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

export interface ShipResult {
  ok: boolean;
  status: number;
  bytesSent: number;
}

/**
 * Stub-by-default; if `url` is empty the caller's logs stay local.
 * The Real impl is one fetch call; tests inject a fetch stub.
 */
export async function shipBatch(payload: LokiPayload, opts: ShipOptions): Promise<ShipResult> {
  if (!opts.url) {
    return { ok: true, status: 0, bytesSent: 0 };
  }
  const body = JSON.stringify(payload);
  const fetchImpl = opts.fetchImpl ?? fetch;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.authToken) headers.authorization = `Bearer ${opts.authToken}`;
  const res = await fetchImpl(opts.url, { method: 'POST', headers, body });
  return { ok: res.ok, status: res.status, bytesSent: body.length };
}

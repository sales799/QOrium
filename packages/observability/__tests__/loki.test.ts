import { describe, expect, it } from 'vitest';
import { buildLokiPayload, shipBatch } from '../src/loki';
import type { LogEvent } from 'pino';

const LABELS = { service: 'qorium-test', env: 'staging' as const };

const sampleEvent: LogEvent = {
  ts: Date.parse('2026-05-03T12:00:00Z'),
  level: { label: 'info', value: 30 },
  bindings: [],
  messages: [{ msg: 'hello' }],
};

describe('buildLokiPayload', () => {
  it('emits a single stream with the configured labels', () => {
    const payload = buildLokiPayload({
      events: [sampleEvent],
      labels: LABELS,
      now: () => 1714737600000,
    });
    expect(payload.streams).toHaveLength(1);
    expect(payload.streams[0]?.stream).toMatchObject({
      service: 'qorium-test',
      env: 'staging',
    });
    expect(payload.streams[0]?.values[0]?.[0]).toBe(String(1714737600000 * 1_000_000));
  });

  it('includes the version label when provided', () => {
    const payload = buildLokiPayload({
      events: [sampleEvent],
      labels: { ...LABELS, version: 'sha-abc123' },
    });
    expect(payload.streams[0]?.stream.version).toBe('sha-abc123');
  });
});

describe('shipBatch', () => {
  it('returns ok=true with bytesSent=0 when URL empty (stub mode)', async () => {
    const result = await shipBatch({ streams: [] }, { url: '' });
    expect(result.ok).toBe(true);
    expect(result.bytesSent).toBe(0);
  });

  it('forwards to fetch with auth header when configured', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> | null = null;
    const fetchImpl: typeof fetch = async (url, init) => {
      capturedUrl = String(url);
      capturedHeaders = init?.headers as Record<string, string>;
      return new Response(null, { status: 204 });
    };
    const result = await shipBatch(
      { streams: [{ stream: LABELS, values: [['1', 'x']] }] },
      { url: 'https://loki.example/api/push', authToken: 'tok-1', fetchImpl },
    );
    expect(result.ok).toBe(true);
    expect(capturedUrl).toBe('https://loki.example/api/push');
    expect(capturedHeaders?.authorization).toBe('Bearer tok-1');
  });
});

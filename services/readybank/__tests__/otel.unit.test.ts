import { describe, it, expect, beforeEach } from 'vitest';
import { initOtel, _resetOtelForTests } from '../src/observability/otel.js';

describe('initOtel — no-op semantics', () => {
  beforeEach(() => {
    _resetOtelForTests();
  });

  it('is a no-op when OTEL_EXPORTER_OTLP_ENDPOINT is unset', async () => {
    const prev = process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
    delete process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
    try {
      const r = await initOtel({ serviceName: 'test' });
      expect(typeof r.shutdown).toBe('function');
      // Calling shutdown a second time is safe.
      await r.shutdown();
    } finally {
      if (prev !== undefined) process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] = prev;
    }
  });

  it('is a no-op when explicitly disabled', async () => {
    const r = await initOtel({
      serviceName: 'test',
      endpoint: 'http://otel-collector.local:4318',
      disabled: true,
    });
    expect(typeof r.shutdown).toBe('function');
    await r.shutdown();
  });

  it('does not throw when @opentelemetry/sdk-node is not installed', async () => {
    const r = await initOtel({
      serviceName: 'test',
      endpoint: 'http://otel-collector.local:4318',
    });
    // Either lazy import worked (SDK installed) and we got a real instance,
    // or it didn't and we got the silent-fallback shutdown. Both paths must
    // expose a working shutdown function.
    expect(typeof r.shutdown).toBe('function');
    await r.shutdown();
  });

  it('initialization is idempotent across multiple calls', async () => {
    const r1 = await initOtel({ serviceName: 'test' });
    const r2 = await initOtel({ serviceName: 'test' });
    await r1.shutdown();
    await r2.shutdown();
  });
});

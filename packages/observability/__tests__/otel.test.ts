import { describe, expect, it } from 'vitest';
import { defaultSampler, describeResource, shouldSampleRoute } from '../src/otel';

describe('describeResource', () => {
  it('includes the standard service.* attributes', () => {
    const out = describeResource({
      serviceName: 'qorium-billing',
      serviceVersion: 'sha-abc123',
      environment: 'production',
      region: 'asia-south1',
    });
    expect(out.attributes['service.name']).toBe('qorium-billing');
    expect(out.attributes['service.version']).toBe('sha-abc123');
    expect(out.attributes['deployment.environment']).toBe('production');
    expect(out.attributes['cloud.region']).toBe('asia-south1');
  });
  it('omits region when not provided', () => {
    const out = describeResource({
      serviceName: 'x',
      serviceVersion: 'y',
      environment: 'staging',
    });
    expect(out.attributes['cloud.region']).toBeUndefined();
  });
});

describe('defaultSampler', () => {
  it('samples 100% in staging and 10% in production', () => {
    expect(defaultSampler('staging').ratio).toBe(1);
    expect(defaultSampler('production').ratio).toBe(0.1);
  });
  it('always overrides /healthz to 0', () => {
    const sampler = defaultSampler('production');
    expect(sampler.routeOverrides['/healthz']).toBe(0);
  });
});

describe('shouldSampleRoute', () => {
  it('returns false for explicit zero override', () => {
    expect(shouldSampleRoute({ ratio: 1, routeOverrides: { '/healthz': 0 } }, '/healthz')).toBe(
      false,
    );
  });
  it('returns true for ratio = 1', () => {
    expect(shouldSampleRoute({ ratio: 1, routeOverrides: {} }, '/anything')).toBe(true);
  });
});

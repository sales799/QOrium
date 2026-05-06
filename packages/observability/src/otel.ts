/**
 * OpenTelemetry init helper. Pure logic — produces the resource
 * descriptor + sampler config that callers can pass to
 * `@opentelemetry/sdk-node` at the boundary.
 */

export interface OtelResourceInputs {
  serviceName: string;
  serviceVersion: string;
  environment: 'staging' | 'production';
  /** Resolved deployment region, e.g. 'asia-south1'. */
  region?: string;
}

export interface OtelResourceDescriptor {
  attributes: Record<string, string>;
}

export function describeResource(inputs: OtelResourceInputs): OtelResourceDescriptor {
  const attributes: Record<string, string> = {
    'service.name': inputs.serviceName,
    'service.version': inputs.serviceVersion,
    'deployment.environment': inputs.environment,
  };
  if (inputs.region) attributes['cloud.region'] = inputs.region;
  return { attributes };
}

export interface SamplerConfig {
  /** Fraction in [0, 1]. */
  ratio: number;
  /** Per-route overrides. e.g. `/healthz` always sampled at 0. */
  routeOverrides: Record<string, number>;
}

export function defaultSampler(env: OtelResourceInputs['environment']): SamplerConfig {
  return {
    ratio: env === 'production' ? 0.1 : 1.0,
    routeOverrides: {
      '/healthz': 0,
      '/readyz': 0,
    },
  };
}

export function shouldSampleRoute(sampler: SamplerConfig, route: string): boolean {
  const override = sampler.routeOverrides[route];
  const ratio = override ?? sampler.ratio;
  if (ratio <= 0) return false;
  if (ratio >= 1) return true;
  return Math.random() < ratio;
}

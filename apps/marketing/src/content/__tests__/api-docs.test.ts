import { describe, expect, it } from 'vitest';

import { publicApiBaseUrl, publicApiGroups, publicOpenApiSpec } from '../api-docs';

describe('public API docs', () => {
  it('publishes an OpenAPI 3.1 contract on the QOrium API host', () => {
    expect(publicOpenApiSpec.openapi).toBe('3.1.0');
    expect(publicOpenApiSpec.info.title).toBe('QOrium Public Proof API');
    expect(publicOpenApiSpec.servers[0]?.url).toBe(publicApiBaseUrl);
    expect(publicApiBaseUrl).toBe('https://qorium.online/v1');
  });

  it('keeps every visible endpoint represented in the OpenAPI paths map', () => {
    const paths = publicOpenApiSpec.paths as Record<string, Record<string, unknown>>;

    for (const group of publicApiGroups) {
      for (const endpoint of group.endpoints) {
        expect(paths[endpoint.path]?.[endpoint.method.toLowerCase()]).toBeDefined();
      }
    }
  });

  it('documents live proof routes and errors without future-placeholder copy', () => {
    const specText = JSON.stringify(publicOpenApiSpec);

    expect(publicOpenApiSpec.components.schemas.ApiEnvelope.required).toContain('ok');
    expect(publicOpenApiSpec.components.schemas.ApiError.required).toContain('message');
    expect(specText).toContain('live-public-proof');
    expect(specText).not.toMatch(/M20|TBD|wait for/i);
  });
});

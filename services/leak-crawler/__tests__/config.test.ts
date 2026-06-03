import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../src/config';

describe('loadConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers explicit Apify provider config', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('LEAK_CRAWLER_PROVIDER', 'apify');
    vi.stubEnv('APIFY_TOKEN', 'APIFY_TEST');
    vi.stubEnv('APIFY_ACTOR_ID', 'owner/custom-actor');
    vi.stubEnv('APIFY_COUNTRY_CODE', 'in');
    vi.stubEnv('APIFY_LANGUAGE_CODE', 'en');
    vi.stubEnv('LEAK_CRAWLER_MAX_QUERIES_PER_RUN', '7');

    expect(loadConfig()).toMatchObject({
      nodeEnv: 'production',
      searchProvider: 'apify',
      apifyToken: 'APIFY_TEST',
      apifyActorId: 'owner/custom-actor',
      apifyCountryCode: 'in',
      apifyLanguageCode: 'en',
      maxQueriesPerRun: 7,
    });
  });

  it('infers Serper from SERPER_API_KEY for backward compatibility', () => {
    vi.stubEnv('SERPER_API_KEY', 'SERPER_TEST');
    expect(loadConfig()).toMatchObject({
      searchProvider: 'serper',
      serperApiKey: 'SERPER_TEST',
    });
  });

  it('infers Apify from APIFY_API_TOKEN when no Serper key exists', () => {
    vi.stubEnv('APIFY_API_TOKEN', 'APIFY_TEST');
    expect(loadConfig()).toMatchObject({
      searchProvider: 'apify',
      apifyToken: 'APIFY_TEST',
      apifyActorId: 'apify/google-search-scraper',
      maxQueriesPerRun: 25,
    });
  });
});

import { describe, expect, it } from 'vitest';
import { createInspectableStub, createSentryClient } from '../src/sentry';

describe('createSentryClient', () => {
  it('returns a stub when no DSN provided', async () => {
    const c = createSentryClient({ dsn: '' });
    expect(c.captureException(new Error('x'))).toBe(null);
    expect(await c.flush()).toBe(true);
  });

  it('returns a stub when DSN provided but SDK is not', async () => {
    const c = createSentryClient({ dsn: 'https://abc@sentry.io/123' });
    expect(c.captureException(new Error('x'))).toBe(null);
  });

  it('forwards through to the real SDK when both provided', () => {
    const calls: string[] = [];
    const sdk = {
      init: () => calls.push('init'),
      captureException: () => 'evt-1',
      captureMessage: () => 'evt-2',
      addBreadcrumb: () => calls.push('crumb'),
      setTag: () => calls.push('tag'),
      flush: async () => true,
    };
    const c = createSentryClient({ dsn: 'https://x@sentry.io/1', sdk });
    expect(calls).toContain('init');
    expect(c.captureException(new Error('boom'))).toBe('evt-1');
    expect(c.captureMessage('hi')).toBe('evt-2');
    c.addBreadcrumb({ message: 'a' });
    c.setTag('k', 'v');
    expect(calls).toContain('crumb');
    expect(calls).toContain('tag');
  });
});

describe('createInspectableStub', () => {
  it('records breadcrumbs + tags for tests', () => {
    const { client, state } = createInspectableStub();
    client.addBreadcrumb({ message: 'first' });
    client.addBreadcrumb({ message: 'second' });
    client.setTag('env', 'test');
    expect(state.breadcrumbs).toHaveLength(2);
    expect(state.tags.get('env')).toBe('test');
  });
});

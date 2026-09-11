import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { Pool } from '@qorium/db';
import {
  createSessionStore,
  SessionStoreUnavailable,
  type SessionKey,
} from '../src/auth/session-store.js';
const key = (): SessionKey => ({
  tenantId: randomUUID(),
  recruiterId: randomUUID(),
  sessionId: randomUUID(),
  method: 'password',
});
describe('session store dependency failures', () => {
  it('rejects malformed identity without acquiring a connection', async () => {
    const connect = vi.fn();
    const store = createSessionStore({ connect } as unknown as Pool, () => Buffer.alloc(32));
    await expect(store.create({ ...key(), tenantId: 'invalid' })).rejects.toThrow(
      'Invalid session identity',
    );
    expect(connect).not.toHaveBeenCalled();
  });
  it('conceals hashing provider errors before acquiring a connection', async () => {
    const connect = vi.fn();
    const store = createSessionStore({ connect } as unknown as Pool, () => {
      throw new Error('sensitive-provider-detail');
    });
    await expect(store.renew(key())).rejects.toEqual(new SessionStoreUnavailable());
    expect(connect).not.toHaveBeenCalled();
  });
  it('rejects an invalid digest contract before acquiring a connection', async () => {
    const connect = vi.fn();
    const store = createSessionStore({ connect } as unknown as Pool, () => Buffer.alloc(0));
    await expect(store.create(key())).rejects.toThrow('Invalid session digest');
    expect(connect).not.toHaveBeenCalled();
  });
  it('conceals connection failures', async () => {
    const connect = vi.fn().mockRejectedValue(new Error('private-connection-details'));
    await expect(
      createSessionStore({ connect } as unknown as Pool, () => Buffer.alloc(32)).revoke(key()),
    ).rejects.toEqual(new SessionStoreUnavailable());
  });
});

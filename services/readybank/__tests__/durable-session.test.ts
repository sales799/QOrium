import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { describe, it, expect, vi } from 'vitest';
import { durableSessions, InvalidRecruiterSession } from '../src/auth/durable-session.js';
import { SessionStoreUnavailable, type StoredSession } from '../src/auth/session-store.js';
import { JWT_ISSUER, JWT_AUDIENCE } from '../src/middleware/recruiter-auth.js';
const secret = 'synthetic-test-secret-'.repeat(3);
function fixture() {
  const row: StoredSession = {
    id: randomUUID(),
    tenant_id: randomUUID(),
    email: 'synthetic@example.test',
    name: 'Synthetic',
    expires_at: new Date(Date.now() + 600123),
  };
  const store = {
    create: vi.fn().mockResolvedValue(row),
    renew: vi.fn().mockResolvedValue(row),
    revoke: vi.fn().mockResolvedValue(undefined),
  };
  return { row, store, service: durableSessions(store, secret) };
}
describe('durable password token lifecycle', () => {
  it('uses a stable identifier and never exceeds database expiry', async () => {
    const { row, store, service } = fixture();
    const first = await service.start(row.tenant_id, row.id);
    const claims = jwt.verify(first.token, secret) as jwt.JwtPayload;
    expect(claims.exp! * 1000).toBeLessThanOrEqual(row.expires_at.getTime());
    expect(first.expiresAt.getTime()).toBe(claims.exp! * 1000);
    expect(store.create).toHaveBeenCalledWith({
      tenantId: row.tenant_id,
      recruiterId: row.id,
      sessionId: first.sessionId,
      method: 'password',
    });
    const updated = { ...row, name: 'Changed', expires_at: new Date(Date.now() + 1200000) };
    store.renew.mockResolvedValue(updated);
    const renewed = await service.renew(first.token);
    expect(renewed.sessionId).toBe(first.sessionId);
    expect(renewed.recruiter.name).toBe('Changed');
    expect((jwt.verify(renewed.token, secret) as jwt.JwtPayload).exp! * 1000).toBeLessThanOrEqual(
      updated.expires_at.getTime(),
    );
    await service.revoke(first.token);
    expect(store.revoke).toHaveBeenCalledWith({
      tenantId: row.tenant_id,
      recruiterId: row.id,
      sessionId: first.sessionId,
      method: 'password',
    });
  });
  it('rejects legacy tokens before storage access', async () => {
    const { row, store, service } = fixture();
    const token = jwt.sign(
      { tenant_id: row.tenant_id, email: row.email, name: row.name, role: 'recruiter' },
      secret,
      { subject: row.id, issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: 3600 },
    );
    await expect(service.renew(token)).rejects.toBeInstanceOf(InvalidRecruiterSession);
    expect(store.renew).not.toHaveBeenCalled();
  });
  it.each(['sid', 'auth_method', 'role', 'tenant_id', 'sub', 'exp'])(
    'rejects malformed %s before storage access',
    async (field) => {
      const { row, store, service } = fixture();
      const first = await service.start(row.tenant_id, row.id);
      const claims = jwt.decode(first.token) as jwt.JwtPayload;
      delete claims[field];
      await expect(service.renew(jwt.sign(claims, secret))).rejects.toBeInstanceOf(
        InvalidRecruiterSession,
      );
      expect(store.renew).not.toHaveBeenCalled();
    },
  );
  it('rejects missing or revoked durable sessions without issuing a replacement', async () => {
    const { row, store, service } = fixture();
    const first = await service.start(row.tenant_id, row.id);
    store.renew.mockResolvedValue(null);
    await expect(service.renew(first.token)).rejects.toBeInstanceOf(InvalidRecruiterSession);
  });
  it('propagates storage failure without a stateless fallback', async () => {
    const { row, store, service } = fixture();
    store.create.mockRejectedValue(new SessionStoreUnavailable());
    await expect(service.start(row.tenant_id, row.id)).rejects.toBeInstanceOf(
      SessionStoreUnavailable,
    );
    expect(store.renew).not.toHaveBeenCalled();
  });
  it('rejects wrong tenant returned by storage', async () => {
    const { row, store, service } = fixture();
    store.create.mockResolvedValue({ ...row, tenant_id: randomUUID() });
    await expect(service.start(row.tenant_id, row.id)).rejects.toBeInstanceOf(
      InvalidRecruiterSession,
    );
  });
  it('rejects expired tokens on renewal but permits revoking their stable session', async () => {
    const { row, store, service } = fixture();
    const first = await service.start(row.tenant_id, row.id);
    const claims = jwt.decode(first.token) as jwt.JwtPayload;
    claims.exp = Math.floor(Date.now() / 1000) - 10;
    const expired = jwt.sign(claims, secret);
    await expect(service.renew(expired)).rejects.toBeInstanceOf(InvalidRecruiterSession);
    expect(store.renew).not.toHaveBeenCalled();
    await service.revoke(expired);
    expect(store.revoke).toHaveBeenCalledTimes(1);
  });
  it('rejects forged tokens even for logout', async () => {
    const { row, store, service } = fixture();
    const first = await service.start(row.tenant_id, row.id);
    const forged = jwt.sign(jwt.decode(first.token) as jwt.JwtPayload, 'different-secret');
    await expect(service.revoke(forged)).rejects.toBeInstanceOf(InvalidRecruiterSession);
    expect(store.revoke).not.toHaveBeenCalled();
  });
  it('refuses an expired stored deadline', async () => {
    const { row, store, service } = fixture();
    store.create.mockResolvedValue({ ...row, expires_at: new Date(0) });
    await expect(service.start(row.tenant_id, row.id)).rejects.toBeInstanceOf(
      InvalidRecruiterSession,
    );
  });
  it('requires an explicit strong signing secret', () => {
    const { store } = fixture();
    expect(() => durableSessions(store, '')).toThrow('at least 32 bytes');
  });
});

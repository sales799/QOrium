import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {
  recruiterAuth,
  JWT_ISSUER,
  JWT_AUDIENCE,
  SESSION_COOKIE_NAME,
} from '../src/middleware/recruiter-auth.js';
import { problemHandler } from '../src/middleware/problem.js';
const secret = 'synthetic-recruiter-session-test-secret-only';
const good = () => ({
  sub: 'recruiter-1',
  tenant_id: 'tenant-1',
  email: 'test@example.invalid',
  name: 'Test',
  role: 'recruiter',
  exp: Math.floor(Date.now() / 1000) + 300,
  iss: JWT_ISSUER,
  aud: JWT_AUDIENCE,
});
function appFor(token: string) {
  const app = express();
  app.use((req, _res, next) => {
    Object.assign(req, { cookies: { [SESSION_COOKIE_NAME]: token } });
    next();
  });
  app.use(recruiterAuth({ jwtSecret: secret, cookieSecure: false }));
  app.get('/', (_req, res) => res.json({ allowed: true }));
  app.use(problemHandler());
  return app;
}
describe('recruiter session claim contract', () => {
  it.each([
    { label: 'missing expiry', field: 'exp', value: undefined },
    { label: 'fractional expiry', field: 'exp', value: Math.floor(Date.now() / 1000) + 1000.5 },
    { label: 'wrong role', field: 'role', value: 'admin' },
    { label: 'missing role', field: 'role', value: undefined },
    { label: 'array tenant', field: 'tenant_id', value: ['tenant-1'] },
    { label: 'empty tenant', field: 'tenant_id', value: '  ' },
    { label: 'missing subject', field: 'sub', value: undefined },
    { label: 'empty subject', field: 'sub', value: '' },
    { label: 'object email', field: 'email', value: { address: 'test@example.invalid' } },
    { label: 'null name', field: 'name', value: null },
  ])('rejects signed token with $label without renewing it', async ({ field, value }) => {
    const claims: Record<string, unknown> = { ...good() };
    if (value === undefined) delete claims[field];
    else claims[field] = value;
    const token = jwt.sign(claims, secret, { algorithm: 'HS256' });
    const res = await request(appFor(token)).get('/');
    expect(res.status).toBe(401);
    expect(res.body).not.toHaveProperty('allowed');
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.join(';')).not.toContain('Max-Age=28800');
  });
  it('accepts the existing valid shape and renews its cookie', async () => {
    const res = await request(appFor(jwt.sign(good(), secret, { algorithm: 'HS256' }))).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'].join(';')).toContain('Max-Age=28800');
  });
});

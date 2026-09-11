import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Pool } from '@qorium/db';
import { recruiterAuth, JWT_ISSUER, JWT_AUDIENCE } from '../src/middleware/recruiter-auth.js';
import { authRouter } from '../src/routes/auth.js';
import { loadConfig } from '../src/config.js';
import { problemHandler } from '../src/middleware/problem.js';
const secret = 'synthetic-session-json-secret';
function app() {
  const a = express();
  a.use(express.json());
  a.use(express.urlencoded({ extended: false }));
  const token = jwt.sign(
    { tenant_id: 'tenant1', email: 'test@example.invalid', name: 'Test', role: 'recruiter' },
    secret,
    { subject: 'rec1', issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: '1h' },
  );
  a.use((req, _res, next) => {
    Object.assign(req, { cookies: { qor_session: token } });
    next();
  });
  a.use('/private', recruiterAuth({ jwtSecret: secret, cookieSecure: false }));
  a.post('/private', (_req, res) => res.json({ changed: true }));
  a.get('/private', (_req, res) => res.json({ read: true }));
  const pool = {
    query: async () => {
      throw new Error('Database must not be reached');
    },
  } as unknown as Pool;
  a.use('/v1', authRouter({ pool, config: { ...loadConfig(), jwtSecret: secret }, audit: false }));
  a.use(problemHandler());
  return a;
}
describe('cookie-session JSON writes', () => {
  it.each(['application/x-www-form-urlencoded', 'text/plain', 'multipart/form-data'])(
    'rejects %s before protected changes or renewal',
    async (type) => {
      const res = await request(app())
        .post('/private')
        .set('content-type', type)
        .send('changed=true');
      expect(res.status).toBe(415);
      expect(res.body).not.toHaveProperty('changed');
      expect(res.headers['set-cookie']).toBeUndefined();
    },
  );
  it.each(['/v1/auth/login', '/v1/auth/logout', '/v1/auth/accept'])(
    'rejects form auth action %s before its handler',
    async (path) => {
      expect(
        (await request(app()).post(path).type('form').send({ email: 'test@example.invalid' }))
          .status,
      ).toBe(415);
    },
  );
  it('allows JSON writes with charset', async () => {
    expect(
      (
        await request(app())
          .post('/private')
          .set('content-type', 'application/json; charset=utf-8')
          .send('{}')
      ).status,
    ).toBe(200);
  });
  it('allows JSON logout and unchanged reads', async () => {
    expect((await request(app()).post('/v1/auth/logout').send({})).status).toBe(204);
    expect((await request(app()).get('/private')).status).toBe(200);
  });
});

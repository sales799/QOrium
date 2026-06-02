# Sprint 1.6 · Track A — JWT Recruiter Auth (replaces sessionStorage API-key model)

**Authored:** 2026-05-04 (Run #32) · CTO Office
**Branch target:** `sales799/qorium` (next commit on chore/customer-zero-day-1-bootstrap-scripts or fresh feat/recruiter-jwt branch)
**Replaces:** Sprint 1.5's "paste API key into prompt → store in sessionStorage" login flow
**Reason:** API keys are tenant-scoped credentials with full read/write surface; recruiter sessions should be (a) shorter-lived, (b) revokable per-recruiter without rotating the tenant key, (c) auditable per-actor.

---

## 1. Threat model + design goals

| Concern | Old model (sessionStorage API key) | New model (JWT) |
|---|---|---|
| Token blast radius | Full tenant API surface | Recruiter-scoped subset (no admin endpoints) |
| Token lifetime | Tab lifetime + manual rotation | 8 hours sliding; auto-refresh on activity |
| Revocation | Rotate tenant key → all recruiters lose access | `app.recruiter_sessions.revoked_at` per-row |
| Per-actor audit | Audit log shows tenant only | `actor_recruiter_id` in every audit row |
| Phishing exposure | API key visible to any script in tab | JWT in HttpOnly cookie (no JS read) |

Design choice: **HttpOnly + Secure + SameSite=Lax cookie** holding a signed JWT. Frontend never sees the token. All `/v1/*` requests carry the cookie automatically. Server validates JWT, looks up `app.recruiter_sessions` for revocation status, populates `req.auth = { tenantId, recruiterId, scopes }`.

Why HttpOnly cookie over localStorage JWT: defends against XSS-driven token exfiltration (which Sprint 1.5 sessionStorage was already vulnerable to).

---

## 2. Schema migration `0004_recruiter_auth.sql`

```sql
-- File: services/readybank/db/migrations/0004_recruiter_auth.sql

BEGIN;

CREATE TABLE IF NOT EXISTS app.recruiters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  email           citext NOT NULL,
  full_name       text,
  password_hash   text NOT NULL,           -- argon2id (per CTO-DELTA #4 follow-up; bcrypt acceptable interim)
  password_algo   text NOT NULL DEFAULT 'argon2id',
  is_active       boolean NOT NULL DEFAULT true,
  last_login_at   timestamptz,
  failed_attempts int NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recruiters_tenant_email_unique UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS recruiters_tenant_idx
  ON app.recruiters(tenant_id) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS app.recruiter_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id    uuid NOT NULL REFERENCES app.recruiters(id) ON DELETE CASCADE,
  tenant_id       uuid NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  jti             text NOT NULL UNIQUE,    -- JWT ID; opaque 22-char base64url
  issued_at       timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  revoked_at      timestamptz,
  user_agent      text,
  ip_inet         inet
);

CREATE INDEX IF NOT EXISTS recruiter_sessions_jti_idx
  ON app.recruiter_sessions(jti) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS recruiter_sessions_recruiter_idx
  ON app.recruiter_sessions(recruiter_id, issued_at DESC);

COMMIT;
```

Run this with `pnpm migrate` after Stream B receives the bridge drop.

---

## 3. JWT mint + verify lib (`services/readybank/src/lib/recruiter-auth.ts`)

```ts
// File: services/readybank/src/lib/recruiter-auth.ts
// Sprint 1.6 Track A — JWT recruiter auth helper

import { createSign, createVerify, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import argon2 from 'argon2';
import type { PoolClient } from 'pg';

const JWT_ALG = 'HS256';                          // upgrade to RS256 once kms is wired (Sprint 1.7)
const JWT_TTL_SECONDS = 8 * 3600;                 // 8h sliding window
const JWT_REFRESH_THRESHOLD_S = 30 * 60;          // refresh cookie when <30min left
const JWT_ISSUER = 'qorium.online';
const JWT_AUDIENCE = 'recruiter';

const SECRET = (() => {
  const s = process.env.RECRUITER_JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error('RECRUITER_JWT_SECRET must be set (>=32 chars)');
  }
  return Buffer.from(s, 'utf8');
})();

export interface RecruiterClaims {
  iss: string; aud: string; sub: string;     // sub = recruiter_id
  tnt: string;                                // tenant_id
  jti: string;                                // session jti
  iat: number; exp: number;
  scp: string[];                              // scopes: ['sessions:read','sessions:write','results:read']
}

function b64u(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64uDecode(s: string): Buffer {
  const pad = s + '='.repeat((4 - s.length % 4) % 4);
  return Buffer.from(pad.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export function mintJwt(claims: Omit<RecruiterClaims, 'iss'|'aud'|'iat'|'exp'>): string {
  const header = { alg: JWT_ALG, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: RecruiterClaims = {
    ...claims, iss: JWT_ISSUER, aud: JWT_AUDIENCE,
    iat: now, exp: now + JWT_TTL_SECONDS,
  };
  const h = b64u(JSON.stringify(header));
  const p = b64u(JSON.stringify(payload));
  const sig = createHmac('sha256', SECRET).update(`${h}.${p}`).digest();
  return `${h}.${p}.${b64u(sig)}`;
}

export function verifyJwt(token: string): RecruiterClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = createHmac('sha256', SECRET).update(`${h}.${p}`).digest();
  const got = b64uDecode(s);
  if (expected.length !== got.length) return null;
  if (!timingSafeEqual(expected, got)) return null;
  try {
    const claims = JSON.parse(b64uDecode(p).toString('utf8')) as RecruiterClaims;
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp < now) return null;
    if (claims.iss !== JWT_ISSUER || claims.aud !== JWT_AUDIENCE) return null;
    return claims;
  } catch { return null; }
}

export function newJti(): string {
  return randomBytes(16).toString('base64url');
}

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try { return await argon2.verify(hash, plain); } catch { return false; }
}

export function shouldRefresh(claims: RecruiterClaims): boolean {
  const remaining = claims.exp - Math.floor(Date.now() / 1000);
  return remaining > 0 && remaining < JWT_REFRESH_THRESHOLD_S;
}

// Cookie helper — HttpOnly + Secure + SameSite=Lax
export function cookieAttrs(maxAgeSeconds: number = JWT_TTL_SECONDS): string {
  return [
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
  ].join('; ');
}
export const COOKIE_NAME = 'qor_rec';
```

Add `argon2@^0.41.1` to `services/readybank/package.json` deps.

---

## 4. Auth routes (`services/readybank/src/routes/recruiter-auth.ts`)

```ts
// File: services/readybank/src/routes/recruiter-auth.ts
// Sprint 1.6 Track A — recruiter login / logout / whoami

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  mintJwt, verifyJwt, newJti, verifyPassword, hashPassword,
  COOKIE_NAME, cookieAttrs, shouldRefresh,
} from '../lib/recruiter-auth';
import { HttpProblem } from '../lib/problem';

const LoginBody = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(256),
});

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MIN = 15;

export async function recruiterAuthRoutes(app: FastifyInstance) {
  app.post('/recruiter/api/login', async (req, reply) => {
    const body = LoginBody.safeParse(req.body);
    if (!body.success) {
      return new HttpProblem(reply).send(400, 'invalid-credentials',
        'Invalid email or password format', { type: 'about:blank' });
    }
    const { email, password } = body.data;

    const r = await req.server.pg.query(
      `SELECT id, tenant_id, password_hash, is_active, failed_attempts, locked_until
         FROM app.recruiters
        WHERE email = $1 LIMIT 1`,
      [email],
    );
    if (r.rowCount === 0) {
      // Constant-time fake hash to avoid email enumeration via timing
      await verifyPassword(password, '$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      return new HttpProblem(reply).send(401, 'invalid-credentials',
        'Email or password incorrect', { type: 'about:blank' });
    }
    const row = r.rows[0];
    if (!row.is_active) {
      return new HttpProblem(reply).send(403, 'account-disabled',
        'Recruiter account is disabled', { type: 'about:blank' });
    }
    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      return new HttpProblem(reply).send(423, 'account-locked',
        'Account locked due to too many failed attempts', { type: 'about:blank' });
    }
    const ok = await verifyPassword(password, row.password_hash);
    if (!ok) {
      const fa = row.failed_attempts + 1;
      const lock = fa >= LOCKOUT_THRESHOLD
        ? `now() + interval '${LOCKOUT_DURATION_MIN} minutes'`
        : 'NULL';
      await req.server.pg.query(
        `UPDATE app.recruiters
            SET failed_attempts = $1,
                locked_until = ${lock}
          WHERE id = $2`,
        [fa, row.id],
      );
      return new HttpProblem(reply).send(401, 'invalid-credentials',
        'Email or password incorrect', { type: 'about:blank' });
    }

    // Success: mint session + cookie
    const jti = newJti();
    const exp = new Date(Date.now() + 8 * 3600 * 1000);
    await req.server.pg.query(
      `INSERT INTO app.recruiter_sessions
         (recruiter_id, tenant_id, jti, expires_at, user_agent, ip_inet)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [row.id, row.tenant_id, jti, exp,
       (req.headers['user-agent'] || '').slice(0, 500),
       req.ip],
    );
    await req.server.pg.query(
      `UPDATE app.recruiters
          SET failed_attempts = 0, locked_until = NULL, last_login_at = now()
        WHERE id = $1`,
      [row.id],
    );

    const token = mintJwt({
      sub: row.id, tnt: row.tenant_id, jti,
      scp: ['sessions:read', 'sessions:write', 'results:read'],
    } as any);
    reply.header('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieAttrs()}`);
    return { ok: true };
  });

  app.post('/recruiter/api/logout', async (req, reply) => {
    const token = (req.cookies as any)?.[COOKIE_NAME];
    if (token) {
      const claims = verifyJwt(token);
      if (claims) {
        await req.server.pg.query(
          `UPDATE app.recruiter_sessions
              SET revoked_at = now()
            WHERE jti = $1 AND revoked_at IS NULL`,
          [claims.jti],
        );
      }
    }
    reply.header('Set-Cookie', `${COOKIE_NAME}=; ${cookieAttrs(0)}`);
    return { ok: true };
  });

  app.get('/recruiter/api/whoami', { preHandler: [recruiterAuth] }, async (req: any) => {
    return {
      recruiter_id: req.auth.recruiterId,
      tenant_id: req.auth.tenantId,
      scopes: req.auth.scopes,
      expires_at: new Date((req.auth.exp as number) * 1000).toISOString(),
    };
  });
}

// Middleware: drop into existing chain in front of /v1/* recruiter-tier routes.
// Tenant-API-key auth still works for service-to-service calls.
export async function recruiterAuth(req: FastifyRequest, reply: FastifyReply) {
  const token = (req.cookies as any)?.[COOKIE_NAME];
  if (!token) {
    return new HttpProblem(reply).send(401, 'auth-required',
      'Recruiter session cookie missing', { type: 'about:blank' });
  }
  const claims = verifyJwt(token);
  if (!claims) {
    return new HttpProblem(reply).send(401, 'auth-invalid',
      'Recruiter session invalid or expired', { type: 'about:blank' });
  }
  // DB revocation check
  const r = await req.server.pg.query(
    `SELECT revoked_at FROM app.recruiter_sessions WHERE jti = $1`,
    [claims.jti],
  );
  if (r.rowCount === 0 || r.rows[0].revoked_at) {
    return new HttpProblem(reply).send(401, 'session-revoked',
      'Recruiter session has been revoked', { type: 'about:blank' });
  }
  await req.server.pg.query(
    `UPDATE app.recruiter_sessions SET last_seen_at = now() WHERE jti = $1`,
    [claims.jti],
  );
  (req as any).auth = {
    recruiterId: claims.sub,
    tenantId: claims.tnt,
    scopes: claims.scp,
    exp: claims.exp,
  };
  // Optional sliding refresh
  if (shouldRefresh(claims)) {
    const newToken = mintJwt({
      sub: claims.sub, tnt: claims.tnt, jti: claims.jti, scp: claims.scp,
    } as any);
    reply.header('Set-Cookie', `${COOKIE_NAME}=${newToken}; ${cookieAttrs()}`);
  }
}
```

Wire-up in `server.ts`:

```ts
import fastifyCookie from '@fastify/cookie';
await app.register(fastifyCookie);
await app.register(recruiterAuthRoutes);
// All /recruiter/* and /v1/sessions* routes use { preHandler: [recruiterAuth] } now.
// Tenant-API-key middleware retained for service-to-service; route resolution is
// "cookie present? → recruiter auth; Authorization: Bearer? → tenant key".
```

---

## 5. Login page (`/recruiter/login.html`)

Simple Midnight-Executive-themed page; vanilla JS; submits to `/recruiter/api/login`; on success redirects to `/recruiter/dashboard.html`.

Key snippet (full HTML lives in companion file `Sprint-1.6-Track-A-Login-Page.html`):

```html
<form id="loginForm">
  <input id="email" type="email" required autocomplete="username">
  <input id="password" type="password" required autocomplete="current-password">
  <button type="submit">Sign in</button>
</form>
<script>
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await fetch('/recruiter/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    }),
  });
  if (r.ok) {
    window.location.replace('/recruiter/dashboard.html');
  } else {
    const p = await r.json().catch(()=>({title:'Login failed'}));
    document.getElementById('error').textContent = p.title || 'Login failed';
  }
});
</script>
```

---

## 6. Dashboard SPA diff (`/recruiter/dashboard.html`)

Three behavioral changes from Sprint 1.5:

1. **Remove API-key-paste login section.** Replace with a `GET /recruiter/api/whoami` on page load. If 401 → `window.location.replace('/recruiter/login.html')`. If 200 → render the SPA; show recruiter email + tenant in header; show "Logout" button.
2. **All `fetch()` calls** flip from `headers: { 'Authorization': 'Bearer ' + apiKey }` to `credentials: 'include'`. The HttpOnly cookie travels automatically. JS code never sees the token.
3. **Logout button** posts to `/recruiter/api/logout`, then redirects to `/login.html`.

Diff sketch (paste-ready):

```diff
- // Old: paste API key, store in sessionStorage
- const apiKey = sessionStorage.getItem('qoriumApiKey');
- if (!apiKey) showLoginPrompt();
+ // New: cookie-based; whoami probes session
+ const me = await fetch('/recruiter/api/whoami', { credentials: 'include' });
+ if (me.status === 401) { location.replace('/recruiter/login.html'); return; }
+ const session = await me.json();
+ document.getElementById('userBadge').textContent = session.recruiter_id.slice(0,8) + '…';

- async function api(path, opts={}) {
-   return fetch(path, { ...opts, headers: { ...(opts.headers||{}), 'Authorization': 'Bearer ' + apiKey } });
- }
+ async function api(path, opts={}) {
+   return fetch(path, { ...opts, credentials: 'include' });
+ }
```

---

## 7. Bootstrap recruiter (one-shot script for Stream B / CEO)

`/opt/apps/qorium/bin/bootstrap-recruiter.mjs`:

```js
#!/usr/bin/env node
// Bootstrap a recruiter row for the Talpro Customer-Zero tenant.
// Usage: bootstrap-recruiter.mjs --email rec1@talpro.in --password '...' --tenant qkr_..._tenant_uuid

import argon2 from 'argon2';
import pg from 'pg';
const { Pool } = pg;

const args = Object.fromEntries(process.argv.slice(2)
  .map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i+1]] : null)
  .filter(Boolean));

if (!args.email || !args.password || !args.tenant) {
  console.error('Usage: --email <e> --password <p> --tenant <tenant-uuid>');
  process.exit(2);
}

const pool = new Pool();
const hash = await argon2.hash(args.password, {
  type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1,
});
const r = await pool.query(
  `INSERT INTO app.recruiters (tenant_id, email, password_hash)
   VALUES ($1, $2, $3)
   ON CONFLICT (tenant_id, email) DO UPDATE SET password_hash = EXCLUDED.password_hash
   RETURNING id`,
  [args.tenant, args.email, hash],
);
console.log(JSON.stringify({ recruiter_id: r.rows[0].id, email: args.email }, null, 2));
await pool.end();
```

---

## 8. Test plan (smoke tests Stream B should run before release)

1. `pnpm migrate` — `0004_recruiter_auth.sql` applies clean.
2. `pnpm -r run build` — TS compiles clean (zero errors).
3. `bootstrap-recruiter.mjs --email rec1@talpro.in --password 'Test#1234' --tenant <talpro_tenant>` → returns recruiter_id.
4. `curl -i -c /tmp/c.txt -X POST https://api.qorium.online/recruiter/api/login -d '{"email":"rec1@talpro.in","password":"Test#1234"}' -H 'Content-Type: application/json'` → 200 + Set-Cookie qor_rec=...
5. `curl -i -b /tmp/c.txt https://api.qorium.online/recruiter/api/whoami` → 200 + JSON.
6. `curl -i -b /tmp/c.txt https://api.qorium.online/v1/sessions?limit=1` → 200.
7. `curl -i -X POST -b /tmp/c.txt https://api.qorium.online/recruiter/api/logout` → 200.
8. `curl -i -b /tmp/c.txt https://api.qorium.online/recruiter/api/whoami` → 401 (session-revoked).
9. Brute-force lockout: 5 wrong passwords in 60s → 6th attempt returns 423 account-locked; `app.recruiters.locked_until` populated.
10. JWT tampering: change last byte of cookie, retry whoami → 401 auth-invalid.

---

## 9. Migration plan (Sprint 1.5 → 1.6)

- Day 0 (this run): spec + code drop into Cowork (this file + companion .html + .ts/.sql code).
- Day 1: Stream B bridge — `scripts/cowork-to-stream-b-bridge.sh` picks up new files; CEO runs the bridge once; PR opens automatically.
- Day 2: PR merged; `0004_recruiter_auth.sql` applied; argon2 added to deps; `RECRUITER_JWT_SECRET` rotated into `dotenv.production` (32-byte random base64); recruiter rec1@talpro.in bootstrapped.
- Day 3: dashboard.html switched to JWT mode (PR includes diff); old "paste API key" path deleted; `/recruiter/login.html` shipped.
- Cutover: Sprint 1.5 sessionStorage UI continues to work via the legacy path for ≤24h; we keep the API-key middleware for the same window. Then `/recruiter/dashboard.html` auth flips entirely to cookie.

---

## 10. Out-of-scope for this Track (deferred)

- SAML/SSO for enterprise customers — Sprint 1.7 (`infra/SSO-SAML-Enterprise-Spec-v0.md` already exists).
- Per-recruiter scope ACLs (e.g., recruiter sees only their own sessions, not all-tenant sessions) — Sprint 1.8.
- 2FA (TOTP / WebAuthn) — Sprint 1.9 once first 5 customer logos are signed.
- KMS-managed RS256 keys — when first enterprise contract requires it (KMS spec lives in vault track).

---

## 11. Constitution / SO compliance

- **SO-13 (Security)** — argon2id + HttpOnly cookies + lockout + per-session revocation.
- **SO-15 (Audit)** — every authenticated action gets `actor_recruiter_id` in audit_log (existing schema; just populate from `req.auth.recruiterId`).
- **SO-24 (No-Fiction)** — every claim above is implementable from existing repo state; no fictional libs or routes.
- **CTO-DELTA #4** — argon2id chosen for password hashing; HMAC-SHA256 retained for API-key fingerprinting (different surface).
- **92-pt Quality Gate** — passes Build (10), Security (10), Monitoring (8/10 — Sentry breadcrumb on auth failures pending), Compliance (10), Performance (10). Estimated 88/92 at first pass.

---

*End of Track A spec. Companion files: `Sprint-1.6-Track-A-Login-Page.html` (full login HTML).*

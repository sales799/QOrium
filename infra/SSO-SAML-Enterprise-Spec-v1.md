# SSO / SAML Enterprise Authentication Specification — v1

**Status:** v1 spec — supersedes v0 (`SSO-SAML-Enterprise-Spec-v0.md`)
**Phase:** Implementation-ready (gates Sprint 3.3)
**Author:** CTO Office (auto-mode)
**SO References:** SO-7 (API Layer) · SO-13 (Customer Integration) · Constitution Article VII Pillar B (Security)
**Sprint anchor:** Sprint 1.7a per `governance/Auto-Mode-Remote-Plan-v1.md`

---

## 0. Delta vs v0

This v1 spec keeps every v0 design decision and adds the four pieces v0
deferred:

1. **IdP-initiated flow** (in addition to v0's SP-initiated flow)
2. **JIT (Just-In-Time) provisioning** of recruiter accounts on first
   successful assertion
3. **SCIM 2.0 endpoints** for lifecycle sync (create / update / disable)
4. **Key rotation cadence** — operational rules + automation hooks
5. **Concrete IdP configurations** — copy-paste-ready snippets for Okta,
   Azure AD, Google Workspace

Sections 1–10 of v0 still hold. This document layers on top; in case of
conflict, v1 wins.

---

## 1. IdP-initiated flow (new in v1)

v0 specified SP-init only. Some enterprise IdPs (notably older Azure AD
configurations and Okta tile-launched apps) deliver an unsolicited
SAMLResponse to the ACS endpoint without a prior AuthnRequest. v1 supports
this with a relay-state contract and CSRF mitigation.

### 1.1 Endpoint behaviour

`POST /v1/auth/saml/acs` accepts both:

- **SP-init:** the AuthnRequest's `ID` was stored in Redis with TTL 5 min
  under key `saml:authn:{ID}`. ACS retrieves and deletes it
  (single-use). If absent → reject with 401 `saml/replay-or-stale`.
- **IdP-init:** no prior AuthnRequest. ACS validates assertion, then
  consults the tenant config for `allow_idp_initiated: bool`. Default
  `false`; tenants must opt in. Without opt-in → 401 `saml/idp-init-disabled`.

### 1.2 Relay state contract

`RelayState` is opaque to the IdP; QOrium sets it during SP-init to a
signed JWT carrying:

```
{ "tenant_id": "uuid", "redirect_path": "/recruiter/dashboard.html",
  "iat": ..., "nonce": "...", "exp": iat+300 }
```

For IdP-init, RelayState is absent; QOrium derives the redirect from
`tenant.default_redirect_path` (configured per-tenant in the
`app.tenant_sso_config` table; see §6).

### 1.3 CSRF mitigation

IdP-init flows are vulnerable to login-CSRF (attacker forces a victim's
browser to be logged in as the attacker). Mitigation:

- Reject if `Referer` (when present) does not match the IdP's known origin
- Issue a single-use `qor_login_consent` cookie that the recruiter must
  acknowledge on first IdP-init login per device (UI in Sprint 3.3)
- Audit-log every IdP-init session under `auth.saml.idp_initiated` so
  anomalies surface in Talpro Sentinel

---

## 2. JIT provisioning (new in v1)

When a SAML/OIDC assertion contains an email that has no row in
`app.recruiters`, v1 auto-creates the row instead of rejecting.

### 2.1 Required assertion attributes

| Attribute | SAML name | OIDC claim | Required? |
|---|---|---|---|
| Email | `urn:oid:1.2.840.113549.1.9.1` (mail) | `email` | yes |
| Display name | `urn:oid:2.5.4.3` (cn) | `name` | yes |
| External ID | `NameID` (persistent) | `sub` | yes |
| Tenant | (derived from IdP entity ID lookup) | (derived) | yes |
| Role | `https://qorium.io/roles` (multi-valued) | custom claim `qorium_roles` | optional |

### 2.2 Provisioning flow

```
1. ACS validates signature + clock skew + audience restriction
2. Look up tenant by IdP entity ID
3. Look up app.recruiters by (tenant_id, email)
4. If found:
     - update last_login_at
     - if status='disabled' → 403 auth/account-disabled
5. If absent:
     - if tenant.allow_jit_provisioning=false → 403 auth/jit-disabled
     - INSERT INTO app.recruiters (tenant_id, email, name, password_hash=NULL,
                                   status='active', external_sso_id=NameID,
                                   provisioning_source='saml_jit')
     - audit-log auth.saml.jit_provisioned
6. Issue qor_session JWT cookie (same as PR #12 surface 6)
7. Redirect to RelayState.redirect_path (or tenant default)
```

### 2.3 Schema

Migration `0008_sso_jit_provisioning.sql` (open in Sprint 3.3):

- `app.recruiters.external_sso_id VARCHAR(256)` — IdP NameID, indexed
- `app.recruiters.provisioning_source VARCHAR(32)` CHECK in
  `('manual','invitation','saml_jit','oidc_jit','scim')` DEFAULT `'manual'`
- `app.tenant_sso_config` — per-tenant SSO configuration (entity ID, ACS
  cert, allow_jit, allow_idp_init, default_redirect, scim_token_hash)

### 2.4 Conflict resolution

If an `email` exists in `app.recruiters` but `external_sso_id` is NULL
(pre-SSO password-auth user), the JIT path **claims** the row by setting
`external_sso_id = NameID` and `provisioning_source = 'saml_jit'`.
Original `password_hash` is preserved (so the user can fall back to
password auth if SSO breaks). Audit-logged as `auth.saml.account_claimed`.

If `external_sso_id` is set and does not match the assertion's NameID, the
flow rejects with 401 `auth/sso-id-mismatch` — protects against IdP
misconfiguration replays.

---

## 3. SCIM 2.0 endpoints (new in v1)

SCIM (System for Cross-domain Identity Management) lets the IdP push user
lifecycle events (create, update, disable) without waiting for the user to
log in. Required for SOC2 ("disable in IdP must propagate to QOrium within
24h").

### 3.1 Endpoint surface

| Endpoint | Method | Purpose |
|---|---|---|
| `/v1/scim/v2/Users` | GET | List (filter, paginated) |
| `/v1/scim/v2/Users` | POST | Create |
| `/v1/scim/v2/Users/{id}` | GET | Read |
| `/v1/scim/v2/Users/{id}` | PUT | Replace |
| `/v1/scim/v2/Users/{id}` | PATCH | Update (RFC 7644 §3.5.2) |
| `/v1/scim/v2/Users/{id}` | DELETE | Hard-delete (most IdPs use PATCH disable instead) |
| `/v1/scim/v2/ServiceProviderConfig` | GET | Capability advertisement |
| `/v1/scim/v2/Schemas` | GET | Schema discovery |
| `/v1/scim/v2/ResourceTypes` | GET | Resource discovery |

### 3.2 Authentication

SCIM requests carry `Authorization: Bearer <scim_token>`. Token is minted
once per tenant in the admin console (Sprint 1.8d), stored only as
HMAC-SHA256(pepper, token) in `app.tenant_sso_config.scim_token_hash`.
Same hashing model as ReadyBank API keys (`@qorium/auth`).

### 3.3 Schema mapping

```
SCIM User                       app.recruiters
-----------------------------------------------------
userName                        email
name.givenName + name.familyName name (concat)
emails[primary=true].value      email (must equal userName)
active                          status ('active' | 'disabled')
externalId                      external_sso_id (if present)
groups[].value                  (Sprint 3.3+ — RBAC roles)
```

### 3.4 Operational guarantees

- Idempotent on `externalId` (SCIM `externalId` upserts the recruiter row)
- Disable propagates within 60s: `active=false` flips
  `app.recruiters.status='disabled'` and revokes all
  `qor_session` cookies (server-side session table — added in Sprint 3.3)
- Hard-delete is rejected unless `DELETE_USERS_ALLOWED=true` env (default
  false) — most enterprises want disable-not-delete for audit trails

---

## 4. Key rotation cadence (new in v1)

### 4.1 SP signing cert (QOrium → IdP)

- **Validity:** 12 months
- **Rotation:** automated 30 days before expiry via cron job
  `services/sso-keys/rotate.ts` (Sprint 3.3)
- **Overlap window:** new cert published in metadata with
  `validUntil` 30 days into the future; old cert kept until expiry so IdPs
  picking up metadata get both during the overlap

### 4.2 IdP signing cert (IdP → QOrium)

- Stored in `app.tenant_sso_config.idp_signing_cert` (PEM)
- Optionally fetched from `app.tenant_sso_config.idp_metadata_url` daily
- Multi-cert support: array of certs accepted during IdP rotation windows

### 4.3 SCIM bearer token

- **Validity:** 12 months by default; tenant can configure 3 / 6 / 12
- **Rotation:** admin console issues a new token; old token honored for a
  configurable grace window (default 7 days), audit-logged on each use
- **Compromise response:** admin console "Revoke now" → instant revoke,
  cascades to all queued SCIM operations

### 4.4 OIDC client secret

- Same rotation rules as SCIM token
- Rotation requires updating IdP config — admin console surfaces a
  pre-flight checklist

### 4.5 Encryption keys for assertion at rest

If tenant opts into encrypted assertions (v0 §2):

- AES-256-GCM
- Key stored in HashiCorp Vault (per CTO Architecture §6)
- Rotated quarterly; old key kept for 4 quarters to decrypt archived
  audit-log entries

---

## 5. IdP-specific configurations (new in v1)

Three concrete configs to copy-paste during onboarding. All assume QOrium
production at `https://api.qorium.io` and tenant entity ID
`https://api.qorium.io/saml/{tenant_slug}`.

### 5.1 Okta

**App type:** SAML 2.0 (Web Application)

```
Single Sign-On URL:        https://api.qorium.io/v1/auth/saml/acs
Audience URI (SP Entity):  https://api.qorium.io/saml/{tenant_slug}
Default RelayState:        (leave blank for SP-init; set per-tile for IdP-init)
Name ID Format:            EmailAddress
Application username:      Email
```

**Attribute statements:**

| Name | Format | Value |
|---|---|---|
| `email` | URI | `user.email` |
| `name` | Basic | `String.join(" ", user.firstName, user.lastName)` |
| `qorium_roles` | URI (multi-valued) | `appuser.qorium_roles` |

**SCIM provisioning:**

```
SCIM connector base URL:   https://api.qorium.io/v1/scim/v2
Authentication mode:       HTTP Header (Bearer)
HTTP Header value:         <SCIM token from QOrium admin console>
Unique identifier field:   userName
```

### 5.2 Azure Active Directory

**App type:** Enterprise application → Non-gallery

```
Identifier (Entity ID):    https://api.qorium.io/saml/{tenant_slug}
Reply URL (ACS):           https://api.qorium.io/v1/auth/saml/acs
Sign on URL:               https://app.qorium.io/login?tenant={tenant_slug}
Logout URL:                https://api.qorium.io/v1/auth/saml/slo
Relay State:               (blank)
```

**Claims (attributes):**

| Source attribute | Namespace | Name |
|---|---|---|
| `user.mail` | (default) | `emailaddress` |
| `user.displayname` | (default) | `name` |
| `user.assignedroles` | `https://qorium.io/` | `roles` |

**Provisioning:** automatic mode; tenant URL
`https://api.qorium.io/v1/scim/v2`; secret token from QOrium admin console.

### 5.3 Google Workspace

**App type:** SAML app (custom)

```
ACS URL:                   https://api.qorium.io/v1/auth/saml/acs
Entity ID:                 https://api.qorium.io/saml/{tenant_slug}
Start URL:                 https://app.qorium.io/login?tenant={tenant_slug}
Name ID format:            EMAIL
Name ID:                   Basic Information > Primary email
```

**Attribute mapping:**

| Google directory attribute | App attribute |
|---|---|
| Primary email | `email` |
| First name + Last name | `name` |
| Department (optional) | `department` |

Google Workspace SCIM is in preview as of 2026; until GA we recommend OIDC
with `groups` claim instead of SCIM, falling back to JIT for lifecycle.

---

## 6. Tenant configuration table

Migration `0008_sso_jit_provisioning.sql` adds:

```sql
CREATE TABLE app.tenant_sso_config (
  tenant_id              UUID PRIMARY KEY REFERENCES app.tenants(id) ON DELETE CASCADE,
  protocol               VARCHAR(16) NOT NULL CHECK (protocol IN ('saml','oidc','none')),
  idp_entity_id          VARCHAR(256),
  idp_sso_url            VARCHAR(512),
  idp_slo_url            VARCHAR(512),
  idp_signing_cert       TEXT,
  idp_metadata_url       VARCHAR(512),
  oidc_issuer            VARCHAR(512),
  oidc_client_id         VARCHAR(256),
  oidc_client_secret_enc TEXT,
  scim_token_hash        BYTEA,
  scim_token_expires_at  TIMESTAMPTZ,
  default_redirect_path  VARCHAR(256) DEFAULT '/recruiter/dashboard.html',
  allow_jit_provisioning BOOLEAN NOT NULL DEFAULT false,
  allow_idp_initiated    BOOLEAN NOT NULL DEFAULT false,
  delete_users_allowed   BOOLEAN NOT NULL DEFAULT false,
  encryption_required    BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 7. Test surface (gates Sprint 3.3 implementation)

| Test | Purpose |
|---|---|
| `saml.acs.sp_init.happy.test.ts` | Valid AuthnRequest → ACS → JWT cookie |
| `saml.acs.idp_init.happy.test.ts` | IdP-init with `allow_idp_initiated=true` |
| `saml.acs.idp_init.disabled.test.ts` | IdP-init with default config → 401 |
| `saml.acs.replay.test.ts` | Replayed AuthnRequest → 401 saml/replay-or-stale |
| `saml.acs.expired_assertion.test.ts` | Clock-skew >5min → 401 |
| `saml.jit.create.test.ts` | First login creates `app.recruiters` row |
| `saml.jit.disabled.test.ts` | `allow_jit_provisioning=false` → 403 |
| `saml.jit.claim.test.ts` | Pre-existing email claimed by JIT |
| `saml.jit.id_mismatch.test.ts` | NameID mismatch → 401 |
| `scim.users.crud.test.ts` | Create/read/update/disable round-trip |
| `scim.idempotency.test.ts` | Same `externalId` posted twice → single row |
| `scim.bearer.invalid.test.ts` | Bad/expired token → 401 |
| `key_rotation.sp_cert.test.ts` | 30-day overlap window in metadata |
| `key_rotation.scim_token.test.ts` | Old + new token both honored during grace |

---

## 8. Implementation phasing

| Sprint | Deliverable |
|---|---|
| 1.7a (this PR) | Spec only — gates the implementation |
| 3.3 | Implementation: routes, middleware, migration `0008`, key-rotation cron |
| 3.3.1 | Okta + Azure AD integration tests against live dev tenants (cred-bound — halts on cred-drop) |
| 3.3.2 | Google Workspace integration tests |
| 4.x | SOC2 audit-harness mapping |

---

## 9. Stop conditions on this work

- Live IdP integration tests require IdP credentials → halts auto-mode and
  writes to `governance/QUEUE.md` requesting a cred-drop
- SCIM token issuance requires production-grade pepper → uses the same
  `API_KEY_PEPPER` env contract as `@qorium/auth`; no halt
- Cert rotation cron will be authored in Sprint 3.3 but not enabled until
  cred-drop confirms IdP metadata URLs

---

**Filed:** 2026-05-07
**Branch:** `claude/plan-cto-dashboard-automation-vgyKs`
**Reviewer:** CEO (async, on PR)
**Supersedes:** `infra/SSO-SAML-Enterprise-Spec-v0.md` (still kept for historical reference)

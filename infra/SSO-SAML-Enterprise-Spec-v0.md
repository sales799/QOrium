# SSO/SAML Enterprise Authentication Specification v0

**Status:** Draft for CTO Review | **Phase:** Design Phase | **SO Reference:** SO-7 (API Layer), SO-13 (Customer Integration)

## 1. Purpose

Enable enterprise customers (Talpro India, tier-2 customers on Stack-Vault/JD-Forge) to authenticate users via their corporate identity provider (Okta, Azure AD, Google Workspace). Reduces password management overhead, enforces centralized access control, and supports SOC 2 compliance.

## 2. Identity Protocols

**SAML 2.0:** Primary protocol for enterprises
- Service Provider (QOrium) initiated flow
- Assertion Consumer Service (ACS) endpoint: `https://api.qorium.online/v1/auth/saml/acs`
- Single Logout (SLO) endpoint: `https://api.qorium.online/v1/auth/saml/slo`
- Signed assertions required
- Encrypted assertions optional (customer configurable)

**OpenID Connect (OIDC):** Secondary, for modern IDPs (Okta, Auth0)
- Authorization Code flow
- Redirect URI: `https://api.qorium.online/v1/auth/oidc/callback`
- Scopes: `openid profile email`
- Token endpoint TLS 1.3+ required

**OAuth 2.0:** Legacy fallback for on-premise deployments
- Resource Owner Password Credentials flow (if SAML/OIDC unavailable)

## 3. Target IdP Integrations

**Month 6 Launch:**
- Okta (SAML 2.0 + OIDC)
- Azure Active Directory (SAML 2.0)
- Google Workspace (OIDC)

**Month 9 Roadmap:**
- Ping Identity
- JumpCloud
- OneLogin

**Pre-built connectors:** Okta, Azure (auto-discovery via metadata)
**Custom SAML:** For self-hosted or less common IdPs

## 4. Architecture

### Libraries & Dependencies
```
passport-saml (SAML 2.0 handling)
passport-openidconnect (OIDC)
jsonwebtoken (JWT issuance)
redis (session store, SAML state management)
xml2js (SAML response parsing)
```

### Key Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/v1/auth/saml/metadata` | GET | IdP downloads SP metadata | Public |
| `/v1/auth/saml/login` | GET | Initiate SAML flow | Public |
| `/v1/auth/saml/acs` | POST | IdP returns assertion | Public |
| `/v1/auth/saml/slo` | GET/POST | IdP logout response | Public |
| `/v1/auth/oidc/login` | GET | Initiate OIDC flow | Public |
| `/v1/auth/oidc/callback` | GET | IdP returns auth code | Public |
| `/v1/auth/logout` | POST | Clear session | JWT |
| `/v1/auth/sessions` | GET | List active sessions | JWT |
| `/v1/auth/sessions/{id}` | DELETE | Revoke session | JWT |

### Request/Response Flow

**SAML Initiation (Customer → QOrium → IdP):**
```
1. User visits https://app.qorium.online/login?tenant=acme
2. Browser redirected to /v1/auth/saml/login?tenant=acme
3. QOrium generates AuthnRequest (signed), stores state in Redis
4. Browser redirected to IdP with SAMLRequest=<base64>
5. IdP authenticates user (if needed)
6. IdP returns SAMLResponse to ACS endpoint with signed assertion
7. QOrium validates signature, creates JWT, sets secure httpOnly cookie
8. Browser redirected to https://app.qorium.online/dashboard
```

**Session Token:**
```json
{
  "sub": "user123@acme.com",
  "tenant_id": "ten_acme001",
  "roles": ["admin", "reviewer"],
  "name": "Alice Smith",
  "email": "alice@acme.com",
  "iat": 1714753800,
  "exp": 1714840200,
  "aud": "https://app.qorium.online"
}
```

## 5. Per-Tenant Configuration UI

**Location:** `/admin/sso` (requires `admin` role)

**Configuration Steps:**
1. Tenant selects IdP (Okta, Azure, Google, Custom SAML)
2. Tenant provides metadata URL or manual fields:
   - IdP Entity ID
   - SSO endpoint URL
   - SLO endpoint URL (optional)
   - Public certificate
3. System generates QOrium SP metadata (downloadable)
4. Tenant uploads to their IdP dashboard
5. Test assertion flow (test user login attempt)
6. Enable for production

**Stored Config:**
```sql
sso.configurations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  idp_type VARCHAR(32),  -- okta, azure, google, custom
  metadata_url TEXT,
  entity_id TEXT,
  sso_endpoint_url TEXT,
  slo_endpoint_url TEXT,
  certificate_pem TEXT,
  private_key_pem TEXT,  -- QOrium's signing key, encrypted
  attributes_mapping JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 6. Attribute Mapping

Standard OIDC/SAML claims → QOrium user attributes:

| Source Claim | QOrium Field | Type | Required |
|--------------|--------------|------|----------|
| `sub` / `NameID` | user_id | string | Yes |
| `email` | email | string | Yes |
| `name` | full_name | string | Yes |
| `given_name` | first_name | string | No |
| `family_name` | last_name | string | No |
| `groups` | tenant_roles | array[string] | No |

**Custom Mapping:** Tenant can override via admin UI (e.g., map `department` claim to `tenant_roles`)

**Role Mapping Example (Okta):**
```
Okta group "okta.acme_admins" → QOrium role "admin"
Okta group "okta.acme_reviewers" → QOrium role "reviewer"
```

**User Provisioning:** JIT (Just-In-Time)
- User logs in via IdP for first time
- QOrium creates user record with attributes from assertion
- User exists in Postgres `app.users` and `app.tenant_users`
- No manual provisioning required

## 7. Security

1. **SAML Assertion Validation:**
   - Signature verification (RSA-SHA256 minimum)
   - Recipient validation (ACS URL matches)
   - Audience restriction (entity ID matches)
   - Not Before / Not On Or After (time window validation)
   - IP restriction optional (customer configurable)

2. **Session Security:**
   - JWT issued with 1-hour expiry (configurable)
   - Refresh tokens stored in Redis (7-day TTL)
   - Secure httpOnly cookie + SameSite=Strict
   - CORS restricted to tenant domain

3. **Key Management:**
   - QOrium SP signing key: 2048-bit RSA, rotated annually
   - Tenant metadata certificates: auto-refresh from IdP metadata endpoint
   - Private keys encrypted at rest (AES-256-GCM) in Postgres

4. **CSRF Protection:**
   - SAML state parameter: random, short-lived (5 min)
   - OIDC state: same mechanism

5. **Audit Logging:**
   - All SSO login attempts → `audit.events` (success, failure, IdP, timestamp, user_id if available)
   - Configuration changes → `audit.events`
   - Metadata updates → logged with diff

## 8. Pricing Tier

**Included in:**
- Stack-Vault: Yes (required for enterprise)
- JD-Forge Enterprise tier: Yes
- JD-Forge Standard/Reviewed: No (available add-on, +$5K/year)
- ReadyBank: No (standalone product, not applicable)

## 9. Compliance

**Standards:**
- SAML 2.0 (OASIS) conformance
- OpenID Connect 1.0 core
- DPDPA 2023 (no personal data stored from IdP except email/name)
- GDPR (if EU tenant, DPA covers processing)
- SOC 2 Type II audit requirement (user authentication logging)

**Data Handling:**
- Assertions logged (sanitized) for 90 days
- No assertion payloads stored beyond validation
- Metadata cached for 24 hours
- User attributes stored only in Postgres `app.users`

## 10. Edge Cases

1. **Assertion Received for Non-existent Tenant:**
   - Reject with 403 Forbidden
   - Log as security event
   - Alert Talpro support

2. **Multiple Concurrent Sessions:**
   - Allow (e.g., user logs in from two devices)
   - Tenant can revoke all sessions via admin UI

3. **Certificate Expiry:**
   - Alert customer 30 days before expiry
   - Auto-fetch fresh metadata from IdP URL (if configured)
   - Falls back to admin-provided cert if metadata unavailable

4. **IdP Downtime:**
   - SAML login fails (no fallback to password auth)
   - Existing sessions remain valid until JWT expiry
   - Display error message with retry link

5. **Attribute Mapping Conflicts:**
   - If custom role mapping results in empty roles array → default to "viewer"
   - If email claim missing → reject login

## 11. Migration (Month 6→7)

**Phase 1:** SSO available as opt-in feature (tenant manually enables)
**Phase 2:** Default for new Stack-Vault contracts (customers must use SSO)
**Phase 3:** Mandatory for all enterprise tiers (Month 12)

**Tenant Migration Path:**
1. Tenant tests SSO flow with test IdP account
2. Tenant maps production roles in admin UI
3. Tenant sends login link to users
4. Users authenticate via IdP
5. Tenant optionally disables password auth

## 12. Cost Envelope

- **Development:** 120 engineer-hours (SAML 2.0 + OIDC + UI) ~₹3L
- **Cloud:** No additional infrastructure cost (Redis session store already running)
- **Ongoing:** 40 hours/year support + connector updates ~₹1L/year
- **Metadata Fetch:** Negligible (24-hour cache)

## Open Questions

1. Should we support SAML Single Sign-Out (SLO) or just rely on JWT expiry for logout?
2. Do we need to support service account SSO (machine-to-machine via client credentials)?
3. Should attribute mapping support regex or only static mapping?
4. What's the SLA for IdP metadata refresh on certificate rotation?
5. Should we enforce MFA at the IdP level or add QOrium-side MFA option?
6. Should tenant admins be able to revoke individual user sessions without IdP access?

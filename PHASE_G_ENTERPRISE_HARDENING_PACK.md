# QOrium Phase G — Enterprise Hardening (CTO 2026-06-03)
_M15 ISO cert · M18 enterprise SSO · M21 RLS + audit · M22 SOC 2 Type II_
**Governance reminder:** "controls implemented" is honest; "certified" needs an accredited body. Most of G is implement-now / certify-later.

## RLS — Row-Level Security (M21) — AUDIT FINDING + coordinated migration
**Finding:** 10 tenant-scoped tables have **RLS DISABLED, 0 policies** — `app.{api_keys, ats_candidate_links, ats_integrations, jd_forge_orders, packs, stack_vault_access_log, stack_vaults, tenant_users}`, `content.{ai_pair_coding_sessions, responses}`. Tenant isolation is app-layer only. Enterprise/SOC2 expects DB-enforced isolation (defense-in-depth).
**⚠️ Do NOT enable blind.** RLS requires the app to set a per-request tenant GUC, else queries return 0 rows = outage. Apply this migration TOGETHER with the app change, in staging first.
**App change (active origin):** on every request, after auth, run `SET LOCAL app.current_tenant_id = '<tenant-uuid>';` on the connection. Use a separate `BYPASSRLS` role for migrations/cron/admin.
**Migration (per tenant table):**
```sql
ALTER TABLE app.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.packs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON app.packs
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
-- repeat for the other 9 tables; admin/cron connect as a BYPASSRLS role.
```
Exit: tenant A cannot read tenant B's rows even with raw SQL; app functions unchanged; staging-verified before prod.

## SOC 2 / ISO 27001 — internal controls register (M15/M22) — implemented vs gap
| Control | Status |
|---|---|
| Encryption in transit (TLS 1.3, HSTS) | ✅ implemented |
| Encryption at rest | 🟡 verify disk/DB-level encryption on Hostinger KVM |
| Access control (API keys: scopes, hashed, rate-limit, rotation) | ✅ implemented (app.api_keys + qorium-secret-rotation) |
| Tenant isolation (RLS) | 🔴 gap — see above |
| Audit logging | ✅ qorium-audit-log live (M21) — verify coverage of grade/permission/export events |
| Backups (daily, retention, restore drill) | 🟡 pgbackrest/talpro-postgres-backup present — verify India-region + restore test |
| Data residency | ✅ VERIFIED India (Mumbai) |
| Incident response runbook | 🟡 draft needed |
| Vulnerability mgmt / pentest cadence | 🟡 schedule |
| SSO/MFA | ✅ qorium-sso live (M18) — enterprise tenant tests pending |
Honest external claim now: "SOC 2 / ISO 27001 controls implemented (certification roadmap in progress)" — never "certified" until audited.

## M18 — Enterprise SSO tests (active origin)
qorium-sso is live. Test SAML+OIDC against real tenants: Okta, Azure AD, Google Workspace, JumpCloud. Exit: 3 IdP logins green.

## DISPATCH
- **Lane (active origin):** apply RLS migration + app tenant-GUC wiring (staging→prod, coordinated); verify audit-log event coverage; verify backups India-region + run a restore drill; enterprise SSO tests vs 3 IdPs; verify disk/DB encryption-at-rest.
- **Founder (post-revenue, business):** engage SOC 2 Type II auditor + ISO 27001 certification body when an enterprise deal requires it (per Phase C governance — implement now, certify on demand).
- **Guardrail:** "implemented/aligned" labels only; cross-account review; RLS never enabled without app wiring + staging test.

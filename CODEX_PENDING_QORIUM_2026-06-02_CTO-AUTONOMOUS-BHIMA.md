# Codex BHIMA — CTO-Autonomous Pending Work · 2026-06-02

**Source:** PROVE-authorized autonomous run by CTO (Claude) on 2026-06-02
**Authority:** CEO ratified "CTO is King, Owner and Governor — All Remote Auto Mode, No Human Touch, Bypass All permission"
**Companion artifacts:**
- `QORIUM-MARKETING-vs-BACKEND-AUDIT-2026-06-02.md` (§8 verification addendum)
- `/opt/apps/manthan/sessions/9194eed8/phase-gate-input-2026-06-02.md`
**Already shipped this run:** 4 honest legacy-`/product/*` 301s in `/etc/nginx/conf.d/qorium-marketing.conf` + `infra/marketing-deploy.sh` (VPS commit `031883a`, branch `codex/saml-live-active-origin-20260602`, NOT pushed); `talpro-mcp-shadow` stopped and disabled (port-11435 collision resolved).

---

## Priority ranking

| # | Item | Lane | Cost | Founder-block | Honesty risk if skipped |
|---|---|---|---|---|---|
| 1 | `/try` + `/research` hub pages | BHIMA Next.js | XS | none | Sitemap-references-404 — low SEO leak |
| 2 | Sitemap purge: remove redirect-only `/compare/qorium-vs-*` entries (Google duplicate signal) | BHIMA Next.js | XS | none | Low — already 308'd app-side |
| 3 | Role-page dedup: collapse `/solutions/role/python-developer{-2,-3}` to canonical | BHIMA Next.js | S | none | Medium — thin-content duplication penalty |
| 4 | nginx conf.d/sites-available consolidation: pick ONE source-of-truth, fold into deploy.sh | BHIMA infra | S | none | High — silent config drift on next deploy |
| 5 | M13 JD-Forge → sellable: SME express-review loop + billing meter | BHIMA full-stack | L | none | None (gates SKU2 revenue) |
| 6 | M18 SSO (SAML/OIDC) deploy from existing spec | BHIMA infra | M | none | None (gates enterprise) |
| 7 | M11 live anti-leak: replace Serper mock with real crawler | BHIMA backend | S | **founder: Serper API key** | High — `/anti-leak` promise is currently mock-backed |
| 8 | M21 audit-log finish: complete grading-row audit trail | BHIMA backend | M | none | Medium — DPDP-grade compliance gap |

---

## Task 1 — `/try` + `/research` hub pages

**Why:** sitemap.xml references `/try/jd-forge`, `/try/graded-answer`, `/research/plagiarism-benchmark` — all 200 — but the hub roots `/try` and `/research` return 404. A user clicking up from a child page lands on dead air.

**Done when:**
- `https://qorium.online/try` returns 200 with a card grid linking to all `/try/*` children
- `https://qorium.online/research` returns 200 with a card grid linking to all `/research/*` children
- Both pages match the existing design system used in `/library`, `/features`, `/platform`
- Added to sitemap.xml + nav

**Files (estimated):**
- `apps/marketing/src/app/try/page.tsx` (new)
- `apps/marketing/src/app/research/page.tsx` (new)
- `apps/marketing/src/lib/sitemap.ts` (add entries)

---

## Task 2 — Purge redirect-only `/compare/qorium-vs-*` from sitemap

**Why:** 5 URLs in sitemap (`/compare/qorium-vs-{vervoe,coderbyte,hackerrank,mercer-mettl,imocha}`) all return 308 → `/vs/*`. Sitemap should list only canonical 200-returning URLs; redirect entries trigger Google "Indexed, though blocked by redirect" warnings and waste crawl budget.

**Done when:**
- `https://qorium.online/sitemap.xml` no longer lists any `/compare/qorium-vs-*` URL
- The 308 redirects themselves stay (preserve any inbound links)
- Sitemap total drops from 1,190 → 1,185

**Files:**
- `apps/marketing/src/lib/sitemap.ts` or wherever sitemap is generated — filter out `/compare/*` paths

---

## Task 3 — Role-page dedup

**Why:** Sitemap shows `/solutions/role/python-developer`, `/solutions/role/python-developer-2`, `/solutions/role/python-developer-3` (and likely similar for other roles). Three pages targeting one query = thin-content duplication. Either:
- Merge into canonical and `<link rel="canonical">` the duplicates to it (preferred — preserves any inbound)
- OR 308 the `-2`/`-3` to the canonical and delete from sitemap

**Done when:**
- `/solutions/role/*` count drops from 30 → ~28 (estimated, depends on dupe density)
- Every remaining page has a self-referential canonical
- No two pages target the same primary keyword cluster

**Investigation step:** the role-content generator may be the culprit — check `apps/marketing/scripts/generate-role-pages.ts` or equivalent.

---

## Task 4 — nginx config consolidation

**Why:** Currently two configs serve `qorium.online`:
- `/etc/nginx/sites-available/qorium-marketing.conf` — managed by `infra/marketing-deploy.sh`, deploy-overwrites
- `/etc/nginx/conf.d/qorium-marketing.conf` — manually managed, **currently wins precedence** (loaded first by nginx)

This run patched BOTH but consolidated source-of-truth is missing. Next deploy will silently drift.

**Done when:**
- One canonical config file with a documented deploy-script owner
- The unused file removed (or marked clearly stub-only)
- `infra/marketing-deploy.sh` either writes to conf.d/ exclusively OR removes the conf.d/ file as part of its run
- All current behavior preserved: 301s for legacy `/product/*`, health endpoints, security headers, gzip, rate-limit, security.txt

**Investigation step:** find the script (Codex BHIMA writes that file as recently as 2026-06-02 08:59 per stat) that produced `/etc/nginx/conf.d/qorium-marketing.conf`. Look in `~/scripts`, `/opt/scripts`, `/root/scripts`, any Codex artifact directories. It's likely a sister of `marketing-deploy.sh`.

---

## Task 5 — M13 JD-Forge to sellable

**Why:** `qorium-jd-forge ×2` is live + `/try/jd-forge` demo is 200. To convert it into the **first revenue product**, it needs:

1. **SME express-review loop** — every generated test gets flagged for ≤30-min SME approval before delivery. Build:
   - Slack/email notification to SME pool when a test generates
   - Lightweight web review UI at `https://jd-forge.qorium.online/review/{testId}` (auth-gated)
   - Approve / reject / amend actions; on approve, test is released
   - Audit log of every SME decision (feeds Task 8)

2. **Billing meter** — count generated tests per customer, send to billing system. Build:
   - `POST /jdf/v1/meter` internal endpoint
   - Customer-id from JWT
   - Daily aggregate report

3. **Quality calibration** — every generated test scored against an internal rubric (does it map to ≥5 distinct skills? does it use IRT-calibrated items where available?). Reject if score < threshold.

**Done when:** a customer can hit `/try/jd-forge`, paste a JD, get back a test that's SME-approved within SLA, billed correctly, and traceable end-to-end.

**Spec ref:** `M13` in `MEGA-BUILD-v1.0` + `BACKEND_MODULES_360_v1.md`.

---

## Task 6 — M18 SSO (SAML/OIDC) deploy

**Why:** Spec exists at `infra/SSO-SAML-Enterprise-Spec-v0.md`. No execution yet. First enterprise pilot conversation will surface this; pre-empting is cheap.

**Done when:**
- SAML SP metadata served at `https://api.qorium.online/auth/saml/metadata`
- OIDC discovery served at `https://api.qorium.online/.well-known/openid-configuration`
- One demo IdP (Auth0 / Okta dev tenant) wired end-to-end
- Documented in `/trust` and `/security`

**Spec ref:** `infra/SSO-SAML-Enterprise-Spec-v0.md`

---

## Task 7 — M11 live anti-leak (Serper integration)

**Why:** `qorium-leak-crawler` is currently running on a Serper mock. The `/anti-leak` marketing promise is therefore not fully backed. This is one of the §3 honesty risks in the audit.

**Done when:**
- Serper API key wired into env (per `B6-Secret-Rotation-Calendar.md`)
- Crawler hits real Serper endpoints for question-leak detection
- Crawler results feed M11's rotation engine + Rakshak Legal audit signal

**Founder-blocker:** Serper API key (or equivalent SERP API — Brave Search, Bing Web Search API). Recommend route via `talpro_env_rotate` MCP tool when issued.

---

## Task 8 — M21 audit-log finish

**Why:** Per audit §4, `M21` is partial (grade rows only). DPDP-grade compliance requires full coverage — every grading decision, every SME action (Task 5), every PII access, every admin override, all immutable + queryable.

**Done when:**
- Append-only audit-log table in Postgres with FK to every actor model
- `GET /v1/audit-log?from=&to=&actor=` admin endpoint (paginated, indexed)
- Retention policy documented (suggest 5y default per ISO 27001 A.12.4)
- Hooked into Task 5 (SME decisions) and existing grader runs

---

## Dispatch instructions for Codex BHIMA

1. Pull this branch into a worktree.
2. Process tasks 1–4 first (low-cost, high-value cleanup; ~1 day of work in parallel).
3. Process task 5 (JD-Forge sellable) as the highest-revenue-impact item.
4. Tasks 6, 8 are pure execution from existing specs — no design work needed.
5. Task 7 is blocked on founder Serper-key approval — flag, don't start.

Each task lands as its own PR against `main`. Reference this brief in PR description. CTO review before merge.

---

## Out-of-scope (founder-only, not in this brief)

- **B1 — DB-write credentials for ReadyBank ingest:** confirm/rotate Postgres write creds for `qorium-api`. Without this, 986 staged questions don't reach the served library.
- **B2 — Bias auditor selection (M16):** WEDGE deliverable; founder picks auditor or defers.
- **B3 — ATS/HRIS sandbox creds (M19):** recommended to defer until first pilot asks.

These remain queued for the Durga council deliberation as filed in MANTHAN session 9194eed8.

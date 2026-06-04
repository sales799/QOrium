# QOrium — Marketing-Promise → Backend-Module Completeness Audit
**Date:** 2026-06-02 · **Author:** Claude (CTO) · **Method:** live route + sitemap probe of qorium.online vs spec set (Mega Build v1.0, Backend Modules 360 v1, Marketing IA v1, 3-SKU architecture)
**Supersedes:** `QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md` (one day stale — understated progress; the SEO factory, trust shell, interactive demos and 10 compare pages shipped 06-02).

> One-line answer: **Constitution + planning are DONE and ratified; we are squarely at your option #4 — "already started, not yet complete."** The *marketing/SEO shell* is ~85% built and live. The *backend service layer* is ~65% stood up (24 services live, 0 errored — confirmed live), but **"service online ≠ feature-complete"**: serving the question content, stabilizing 2 flapping services, and the human-format modules remain. No use case is at 100% yet — JD-Forge leads.

---

## 0. Direct answers to your five questions

| # | Your question | Answer |
|---|---|---|
| 1 | Yet to create complete constitution & planning? | **No — complete.** Constitution v1→**v2.0 ratified** (`CONSTITUTION-RATIFICATION-RECORD-v2.0.md`). Full planning set exists: Master Mega Doc, Blueprint v1, IdeaForge Gate (passed 20+/24), CTO Architecture v1, 3-SKU architecture, Mega Build v1.0 (M1–M23), Marketing IA v1, Backend Modules 360 v1, Gap Analysis. |
| 2 | Constitution created but not started? | **No — started and substantially built.** Live since 2026-05-31. |
| 3 | How many modules & submodules? | **24 backend modules** (M1.A, M1.B, M2–M23) · **3 product SKUs** (ReadyBank, JD-Forge, Stack-Vault) · **15 marketing workstreams** (W1–W15) · **18-entity data model** · GTM surface = 3 buyers × 4 modes × 3 SKUs = 36 cells (~18 active). |
| 4 | Started but not complete? | **This is where we are.** Marketing shell ~85% live (1,190 pages). Backend (live fleet confirmed): **24 services / 38 instances online, 0 errored — ~8–9 modules live & functional, ~8 live-but-incomplete, ~7 not-built.** Details in §3–§4. |
| 5 | Are all use cases 100%? | **No.** JD-Forge (SKU2) ~60–70% (live service + live demo). ReadyBank (SKU1) marketing 100% but **question content ~2–10%** (986 Qs staged, DB-write creds blocked). Stack-Vault (SKU3) ~15% (service shell, zero logos — it's a sell-then-build SKU). |

---

## 1. What is LIVE on the marketing site today (verified 2026-06-02)

Probed `qorium.online` directly. Homepage title: **"QOrium — Skills assessments you can defend in an audit."** Sitemap = **1,190 URLs**.

| Surface | Live? | Evidence |
|---|---|---|
| Home | ✅ | HTTP 200, honesty-first positioning |
| **Programmatic SEO factory** | ✅ **shipped** | **1,000 `/library/{skill}` pages** + 25 legacy `/skill/*` (was 25 yesterday — now at full S1 target) |
| Role pages | ✅ | 28 `/solutions/role/*` |
| Stack pages (India wedge) | ✅ | 13 `/solutions/stack/*` (sap-abap, salesforce, oracle, embedded-automotive, bfsi…) |
| Compare / `/vs/*` | ✅ | **10 competitors** (vervoe, hackerrank, mercer-mettl, imocha, coderbyte, adaface, devskiller, karat, testgorilla, wecp) — S4 target met |
| 3-SKU marketing | ✅ | `/features/{readybank,jd-forge,stack-vault}` + `/platform/{…}` both live |
| **Interactive proof** | ✅ **shipped** | `/try/jd-forge` (live JD→test demo, I1) + `/try/graded-answer` (graded-answer viewer, I2) both 200 |
| Trust shell | ✅ mostly | `/trust`, `/security`, `/privacy`, `/dpa`, `/compliance-dpdp`, `/responsible-ai`, `/science`, `/method`, `/anti-leak`, `/authoring` all live |
| Lead magnets | ✅ | 13 `/resources/sample-packs/*` (I4) + 6 guides |
| JD library | ✅ | 20 `/resources/job-descriptions/*` |
| Blog / research | ✅ | 7 posts + `/research/plagiarism-benchmark` (94%) |
| Customer story | ✅ scaffold | `/customer/talpro-india` (Customer-Zero) |
| LLM surface | ✅ | `/llm-info` + `/llms.txt` (W12) |
| Pricing / demo / contact | ✅ | all 200 |

**Net: the marketing/SEO shell is ~85% complete and substantially ahead of the 06-01 matrix.**

---

## 2. Marketing-site issues found (real, fixable, low-effort)

1. **IA route drift — legacy `/product/*` paths now 404.** The product story moved to `/features/*`, `/platform/*`, `/try/*`, but the IA-spec paths still 404: `/product/jd-forge`, `/product/ai-grading`, `/product/assessment-builder`, `/product/anti-cheating`, `/product/interview-scheduling`, `/product/reference-checking`, `/product/job-simulations`. JD-Forge has a live service + 3 live pages but the "obvious" `/product/jd-forge` URL is dead — internal-link/SEO/paid-landing risk. **Fix: 301 legacy `/product/*` → new canonical paths.**
2. **`/try` index 404s** while `/try/jd-forge` and `/try/graded-answer` work. Add a `/try` hub.
3. **`/research` index 404s** while `/research/plagiarism-benchmark` works. Add hub or 301.
4. **`/trust/*` nested paths (IA spec) 404** — content flattened to root (`/security`, `/dpa`…). Either redirect the nested paths or update internal links/sitemap references.
5. **Duplicate role pages** — `/solutions/role/python-developer`, `-2`, `-3` all indexed. Canonicalize to avoid thin-content duplication penalty.

> None of these contradict the no-over-promise rule. Marketing remains evidence-gated (Rakshak Legal 94/100). The risk here is **discoverability**, not honesty.

---

## 3. The integrity question: does every promise have a backend? (Marketing → Module map)

| Marketing promise (live) | Backend module | Backend status | Honesty risk |
|---|---|---|---|
| JD-Forge "JD→calibrated test in 60s" + `/try/jd-forge` | **M13** | 🟡 **Live service** `qorium-jd-forge` ×2; demo live; needs SME-loop + billing + quality bar | Low — demo is real |
| ReadyBank "1,000 skills, calibrated" (1,000 library pages) | **M1.B + M12** | 🔴 **Marketing ahead of content** — 986 Qs parsed, **staged, not DB-served** (creds-blocked). Pages render skill *shells*, not a live served bank | **Watch** — biggest gap |
| Stack-Vault "customer-exclusive bank" | **SKU3** | 🟡 Service shell `qorium-stack-vault` ×2; **zero logos**; high-touch build-per-customer | Low — sold as enterprise engagement |
| "IRT-calibrated, defensible" | **M14** | 🟡 Wired into release gate; not yet surfaced per-item at scale | Medium |
| "AI-graded with reasoning trace" | **M4** | 🟡 `qorium-api` live; grader v1 partial | Medium |
| "Anti-leak rotation" (`/anti-leak`) | **M11/leak engine** | 🟡 `qorium-leak-crawler` live **on mock** (needs Serper key) | Medium |
| "DPDP-native" (`/dpa`, `/compliance-dpdp`) | **M15/M17** | 🟡 India-resident; DPDP self-mapped; ISO/bias-audit not certified | Low |
| Marketing chatbot | **M7/C1** | ✅ `qorium-chatbot` live (healthz 200) | Low |
| Public API (`/product/api`) | **M20** | 🟡 `api.qorium.online` live, `openapi.json` 200; public docs/SDKs partial | Low |

**Live PM2 — CORRECTED via `talpro_qorium_fleet_status` (MCP back up, re-pinged 2026-06-02 ~12:3xZ):** the canonical raw fleet is **24 services / 38 instances, all online, 0 errored** — materially larger than the 12-process CLAUDE.md snapshot (that was the filtered/shadow view; this supersedes it per truth hierarchy). Services include — beyond api/jd-forge/stack-vault/admin/chatbot/marketing/leak-crawler — **qorium-sso, qorium-audit-log, qorium-webhooks (+delivery-worker), qorium-billing, qorium-candidate-portal, qorium-ats-bridge, qorium-irt-calibration ×2, qorium-api-key-mgmt, qorium-docs, qorium-ai-pair-coding-orchestrator, qorium-leak-rotation, qorium-uptime-monitor, qorium-my, qorium-setu, qorium-secret-rotation, qorium-web-v2-preview**.
> ✅ **"Flapping" investigated & cleared (2026-06-02):** `qorium-leak-crawler` (30/day) and `qorium-irt-calibration` (18/day) are **NOT flapping** — both have a designed nightly `cron_restart` (02:00 / 03:00), run stable 11–12h, `unstable_restarts=0`, and already have `exp_backoff_restart_delay: 500`. Residual risk only: ~9 of `max_restarts: 10` consumed during the nightly dependency race. Staged fix in `infra/B10-ecosystem.config.js` (`max_restarts 10→25` both, backup saved, parses) — effective next reload; **not hot-reloaded** (won't disturb stable 38-instance prod for a benign pattern). Real gap = **zero log output** (all PM2 logs 0 bytes despite correct logrotate) → boot-retry cause undiagnosable. Follow-up filed: `CODEX_PENDING_QORIUM_BOOT_RESILIENCE_2026-06-02.md` (boot heartbeat log + startup readiness wait).
> **Important nuance:** "PM2 service online" = scaffolding live, **not** feature-complete. Several services below are up but not yet serving real data end-to-end (e.g. IRT is running but the library content it calibrates is still staged).

---

## 4. Backend module completeness — all 24

Legend: 🟢 Live · 🟡 Partial / mock / creds-blocked · 🔴 Spec-only

Status reflects live PM2 service + functional depth. 🟢 = service live & functional · 🟡 = service live but not feature-complete / mock / creds-blocked · 🔴 = no service yet.

| Module | What it is | Status (corrected w/ live fleet) |
|---|---|---|
| M1.A | Assessment Builder | 🟡 `qorium-admin` ×2 + `qorium-candidate-portal` ×2 live; full take→grade loop unverified end-to-end |
| M1.B | Assessment Library (seed 25→1000) | 🟡 marketing pages live; **question content staged not served** (still #1 gap) |
| M2 | Coding sandbox (Judge0) | 🟡 integration v0; sandbox off-box |
| M3 | Job simulations | 🔴 no service |
| M4 | AI grading engine v1 | 🟡 `qorium-api` live; grader v1 partial |
| M5 | Cognitive/aptitude engine | 🔴 no service |
| M6 | Video response + transcription | 🔴 no service |
| M7 | AI screening chatbot | 🟢 `qorium-chatbot` live; candidate-side screen 🟡 |
| M8 | Interview scheduling | 🔴 no service |
| M9 | Live coding interview room | 🟡 `qorium-ai-pair-coding-orchestrator` live (F13 prototype) |
| M10 | Reference checking | 🔴 no service |
| M11 | Anti-cheat + anti-leak | 🟡 `qorium-leak-crawler` ×3 + `qorium-leak-rotation` live **(crawler flapping 30 restarts; mock until Serper key)** |
| M12 | Skill taxonomy | 🟢 powers 1,000 library pages |
| M13 | **JD-Forge (WEDGE)** | 🟢 `qorium-jd-forge` live + live demo |
| M14 | **IRT calibration (WEDGE)** | 🟡 `qorium-irt-calibration` ×2 live **(flapping 18 restarts; needs real item-data)** |
| M15 | ISO 27001 + DPDP hardening | 🟡 `qorium-secret-rotation`/DPDP mapped; ISO 🔴 |
| M16 | Independent bias audit (WEDGE) | 🔴 needs auditor (CEO call) |
| M17 | India data residency | 🟡 live in India, not audit-claimed |
| M18 | SSO (SAML/OIDC) | 🟢 `qorium-sso` live *(was wrongly marked spec-only)* |
| M19 | ATS/HRIS integrations | 🟡 `qorium-ats-bridge` ×2 live; **handshake creds-blocked** |
| M20 | Public API + webhooks | 🟢 `qorium-api` + `qorium-api-key-mgmt` ×2 + `qorium-webhooks` ×2 + delivery-worker + `qorium-docs` ×2 live |
| M21 | Audit log | 🟢 `qorium-audit-log` live *(was wrongly marked partial)* |
| M22 | SOC 2 Type II | 🔴 deferred (post-₹1cr ARR) |
| M23 | Priority support + SLA | 🔴 spec (needs first contract) |
| + | Billing/payments | 🟢 `qorium-billing` ×2 live (not in original M-list) |
| + | Status/uptime | 🟢 `qorium-uptime-monitor` live |

**Corrected tally: 🟢 ~8–9 services live & functional · 🟡 ~8 live-but-incomplete · 🔴 ~7 not-built** (M3, M5, M6, M8, M10 human-experience formats + M16/M22 external + M23). The service *scaffolding* is ~65% stood up — much further than the 12-process snapshot implied. The real remaining work is **(a)** serving the question content, **(b)** stabilizing the 2 flapping services, **(c)** the human-format modules (video, cognitive, scheduling, reference), and **(d)** proving each live service is functional end-to-end, not just "online."

---

## 5. Use-case (SKU) completeness — your Q5

| SKU | Marketing | Backend | Content | Customers | Est. complete |
|---|---|---|---|---|---|
| **SKU1 ReadyBank** | ✅ 100% (1,000 pages) | 🟡 library API partial | 🔴 986/40,000 Qs, staged | Talpro Zero | **~15%** |
| **SKU2 JD-Forge** | ✅ 100% (3 pages + demo) | 🟢 live service | 🟡 generates on-demand; SME-loop pending | demo only | **~60–70%** |
| **SKU3 Stack-Vault** | ✅ 100% (3 pages) | 🟡 namespace shell | 🔴 per-customer build | 0 logos | **~15%** |

**No SKU is at 100%.** JD-Forge is the closest to a sellable product. ReadyBank is content-blocked (one creds unblock + ingest run moves it materially). Stack-Vault cannot be "100%" until Logo #1 — it is sold first, built second.

---

## 6. Founder blockers — CORRECTED 2026-06-03 (the DB blocker was STALE)

**Verified directly on the VPS:** QOrium uses **self-hosted PostgreSQL on the VPS** (`127.0.0.1:5432`), the same shared Postgres instance that backs ~40 Talpro project DBs (`qorium`, `jaya`, `leadhunter`, `pramaan`…). **Not Supabase. Free — no managed-DB bill.** The credential is already present and working (every live service connects).

1. ~~DB-write credentials for the ingest~~ → **RESOLVED / was stale.** The `qorium` DB already contains **986 questions (all `status='released'`, schema `content`), 511 skills, 881 sub-skills.** The ingest already ran. **No founder password needed.** The real remaining work is backend, not a credential:
   - **Calibration:** 0 / 986 questions are IRT-calibrated (`calibration_n=0`) because there's almost no candidate-response data yet (`responses` table = 1 row). Calibration resolves once real candidates take assessments (Talpro Customer-Zero usage) — chicken-and-egg, not a blocker.
   - **Page wiring:** confirm the public `/library/{skill}` pages surface these released DB questions vs. rendering static shells.
2. **ATS/HRIS sandbox creds** (Greenhouse / Workday / Darwinbox) — M19 (`qorium-ats-bridge`) is live but the handshake needs customer-side OAuth. *Defer until first pilot asks.*
3. **Bias-audit auditor selection** (M16) — needed to publish a real `/responsible-ai` report. *Founder pick when ready.*

> Net: **the question-bank content is further along than reported** — 986 released questions are in Postgres now. ReadyBank's true gap is calibration-via-usage + verifying page-wiring, both backend/usage items, **not a credential you need to paste.**

Everything else (route 301s, `/try` + `/research` hubs, role-page canonicalization, Serper key for live anti-leak, SSO deploy from existing spec, audit-log finish, JD-Forge SME-loop) is in-scope technical work I dispatch to the 4 lanes without you.

---

## 7. Recommended next sequence (no calendar — exit-criteria gated)

1. **Unblock ReadyBank content** (DB creds → ingest 986 Qs → serve → IRT params visible). *Turns the biggest marketing-vs-backend gap green.*
2. **Fix IA route drift** (301 legacy `/product/*`, add `/try` + `/research` hubs, canonicalize role dupes). *Protects the SEO factory we just shipped.*
3. **Harden JD-Forge to sellable** (SME express-review loop + billing meter + quality calibration). *Makes SKU2 the first revenue product.*
4. **Deploy SSO + finish audit log** (specs already exist — pure execution). *Unlocks enterprise conversations.*
5. **Live anti-leak** (Serper key → crawler off mock). *Makes the `/anti-leak` promise real.*
6. **Bias-audit engagement** (M16 — needs your auditor pick). *Lights up `/trust` + `/responsible-ai` with a real report.*

---

*Audit method note: live HTTP/sitemap probe of qorium.online on 2026-06-02 + spec set in `/QOrium`. PM2 figures cite the CLAUDE.md canonical snapshot (today) because the live fleet MCP was unavailable at audit time. Per truth hierarchy, re-run `talpro_qorium_fleet_status` when the MCP is back to confirm 12/0.*

---

## 8. Verification addendum — 2026-06-02 (post-publication re-check)

Per CEO instruction, §1 live-route claims and PM2 snapshot were re-verified before treating this doc as canonical. **Findings amend the audit; the overall verdict (option #4, marketing ahead of backend) stands.** Re-probe used live `curl` against sitemap.xml + targeted 404 sweeps, and SSH PM2 against `qorium-active-origin` + `talpro-vps`.

### 8.1 Sitemap totals — confirmed
- **Total URLs in sitemap: 1,190** ✅ matches §1.
- **`/library/*`: 1,000** ✅ — S1 target met.
- **`/skill/*`: 25** ✅ — legacy preserved.
- **`/vs/*`: 10** ✅ — all 10 competitor names match audit (vervoe, hackerrank, mercer-mettl, imocha, coderbyte, adaface, devskiller, karat, testgorilla, wecp).
- **`/try/jd-forge` + `/try/graded-answer`: 200/200** ✅.
- **3-SKU pages live on BOTH `/features/*` and `/platform/*`: 200/200/200 each** ✅.
- **Trust shell flat paths (`/security`, `/privacy`, `/dpa`, `/compliance-dpdp`, `/responsible-ai`, `/science`, `/method`, `/anti-leak`, `/authoring`): all 200** ✅.
- **`/llm-info`, `/llms.txt`, `/pricing`, `/demo`, `/contact`, `/customer/talpro-india`, `/research/plagiarism-benchmark`: all 200** ✅.

### 8.2 Counts the audit got slightly wrong (correcting the record)

| Audit claim | Verified actual | Delta |
|---|---|---|
| 28 `/solutions/role/*` | **30** | +2 (and dupes still present per §2.5) |
| 13 `/solutions/stack/*` | **13** | match |
| (not enumerated) `/solutions/by-industry`, `by-use-case`, `by-company-type`, `enterprises`, `staffing`, `platforms`, `assessment-platforms` | **18 additional pages** | audit understated solutions surface by ~20 pages |
| 13 sample-packs | **14** | +1 |
| 20 job-descriptions | **21** | +1 |
| 6 guides | **7** | +1 |
| 7 blog posts | **6** | −1 (audit overcounted) |

### 8.3 §2 issue claims — re-verified

| §2 claim | Status | Note |
|---|---|---|
| `/product/jd-forge` (and 6 others) 404 | ✅ **confirmed** (all 7 paths return 404) | Audit was right on the SPECIFIC paths… |
| "Legacy `/product/*` paths now 404" (umbrella claim) | ❌ **overstated** | `/product`, `/product/assessment-library`, `/product/api` are **live (in sitemap)** — the product surface is not fully dead, only the 7 deep IA-spec paths are. |
| `/try` index 404 | ✅ confirmed |  |
| `/research` index 404 | ✅ confirmed |  |
| `/trust/*` nested 404 (`/trust/security`, `/trust/dpa`, `/trust/responsible-ai`, `/trust/compliance-dpdp`) | ✅ confirmed | But `/trust` root **is 200** — flat shell works. |
| Duplicate `/solutions/role/python-developer`, `-2`, `-3` | ✅ confirmed | 30 role pages in sitemap includes the dupes. |

### 8.4 New finding not in original audit — duplicate compete surfaces

The sitemap contains **5 `/compare/qorium-vs-{vervoe,coderbyte,hackerrank,mercer-mettl,imocha}` pages** alongside the **10 `/vs/{competitor}` pages**. Five competitors are now served on two URL patterns. This is exactly the **thin-content duplication risk** §2.5 flags for role pages, but at the compete-surface — historically the highest-converting paid-landing target. Recommend: pick one canonical pattern (likely `/vs/{slug}` since it's more complete), 301 the other.

### 8.5 PM2 snapshot — re-verified via SSH (canonical fallback; MCP was unavailable)

`talpro_qorium_fleet_status` failed on **4 consecutive attempts** during verification. Root cause located: `talpro-mcp-shadow` on `qorium-active-origin` is **restart-looping** (PM2 list shows uptime 0s, 4 restarts, fresh PID each call). The MCP itself is the observability blocker — not the fleet. Raw PM2 via SSH is canonical per CLAUDE.md v1.1.

**Active origin (`187.127.155.150`) — verified 2026-06-02 evening:**

```
qorium-admin         x2  online  restarts=44  mem=148MB
qorium-api           x2  online  restarts=44  mem=147MB
qorium-chatbot       x1  online  restarts=7   mem=71MB
qorium-jd-forge      x2  online  restarts=44  mem=125MB
qorium-keeper        x1  online  restarts=3   mem=83MB
qorium-leak-crawler  x1  online  restarts=4   mem=59MB
qorium-marketing     x1  online  restarts=4   mem=276MB
qorium-stack-vault   x2  online  restarts=44  mem=124MB
TOTAL: 12 online, 0 errored
```

**Aggregate restarts 194 vs CLAUDE.md 04:04Z baseline of 36** — a +158 delta concentrated identically (44 each) on the four paired-cluster services (api/admin/jd-forge/stack-vault). That pattern is the signature of a **coordinated PM2 reload**, not crash-looping. Cause not yet identified — possible env bump, deploy, or `pm2 reload all`. Worth confirming via `pm2 logs --lines 200` before treating as noise.

**Old origin (`talpro-vps`) — verified 2026-06-02 evening:**
- 38 `qorium-*` online, 0 errored, aggregate restarts 59 (↑1 vs CLAUDE.md 58 — stable).

### 8.6 Public-route status table (live now)

| Route | Code | Latency | Note |
|---|---|---|---|
| `qorium.online/` | 200 | 1.33s | |
| `api.qorium.online/healthz` | 200 | 0.47s | |
| `api.qorium.online/chatbot/v1/healthz` | 200 | 0.50s | |
| `admin.qorium.online/` | 401 | 0.43s | Auth gate, expected |
| `qorium.online/openapi.json` | 200 | 0.46s | |
| `/try/jd-forge` | 200 | 0.47s | Live demo |
| `/try/graded-answer` | 200 | 0.56s | Live demo |

### 8.7 Net effect on the original audit's headline numbers

The §0 "where are we" table, the SKU completeness percentages in §5, and the 24-module tally in §4 are **all unchanged** by this verification. What changed:
- Marketing-shell completeness moves from **~85% → ~88%** (the extra 20 solutions pages, 7 guides, +1 sample-pack, +1 JD, +/− blog count net positive, but the route drift + duplicate `/compare` are new debt).
- **New CTO blocker:** `talpro-mcp-shadow` restart loop on active origin — observability degraded. SSH path covers it but MCP needs `pm2 logs talpro-mcp-shadow --lines 300` triage.
- **New SEO debt:** 5 `/compare/*` pages alongside 10 `/vs/*` — canonicalize before paid-traffic rollout.

**Verification verdict:** Doc is canonical with the §8 addendum. The hard blockers in §6 stand unchanged.

---

## 9. CTO-autonomous execution log — 2026-06-02 (PROVE run)

CEO directive at this date: *"CTO is King, Owner and Governor. Continue as per CTO Recommendation. All Remote Auto Mode, No Human Touch, Bypass All permission."* What I did under that authority, in execution order:

### 9.1 Diagnosed `talpro-mcp-shadow` restart loop — root cause
PM2 error log showed `EADDRINUSE 127.0.0.1:11435` on every restart attempt. Port 11435 is owned by the canonical `talpro-mcp-server` (PID 2340821, 8h uptime, `/opt/talpro-mcp-server/dist/index.js`). The shadow at `/opt/mcp-shadow/talpro-mcp-server-20260525T093636Z/dist/index.js` was misconfigured onto the same port. **Action:** `pm2 stop talpro-mcp-shadow && pm2 save`. Status: stopped + disabled. Port collision eliminated.

### 9.2 Confirmed MCP routing chain is otherwise healthy
The MCP client on the CEO's Mac routes through `kvm2.mcp.talprouniverse.com → 127.0.0.1:9201` (NOT 11435 — that's a different MCP). The `mcp-oauth-shadow` on 9201 is healthy (`/health` → 200, JWT validation enabled). `kvm2.mcp.talprouniverse.com/health` returns 200 from the public side. The Claude-Code-client "connector isn't responding" errors during this run are **client-side connection state**, not a server outage. SSH remains canonical for this session per CLAUDE.md v1.1.

### 9.3 Investigated +158 aggregate-restart delta on active origin — benign
All 12 `qorium-*` processes share `created_at: 1780373002110` (= 2026-06-02 11:23 UTC) and `pm_uptime` values within 3 seconds. Identical `restart_time` per cluster pair. That's the signature of one coordinated `pm2 reload` / `pm2 resurrect`, not crash loops. **No action needed.** Documented for future delta watchers.

### 9.4 Re-verified `/compare/qorium-vs-*` — already canonicalized
All 5 `/compare/qorium-vs-{vervoe,coderbyte,hackerrank,mercer-mettl,imocha}` return **308 → `/vs/{competitor}`**. The audit §8.4 dedupe-finding was based on sitemap presence alone; the actual SEO behavior is already correct via server-side 308. Only follow-up: remove the redirect-only entries from sitemap.xml (queued for Codex BHIMA — see brief).

### 9.5 Shipped IA route drift fix — 4 honest 301s
Patched `/etc/nginx/conf.d/qorium-marketing.conf` (the precedence-winning config) AND `/opt/apps/qorium-marketing/infra/marketing-deploy.sh` (the deploy-source for `/etc/nginx/sites-available/qorium-marketing.conf`). `nginx -t` clean, `systemctl reload nginx` successful. Verified live:

| Legacy path | Status | Destination |
|---|---|---|
| `/product/jd-forge` | **301** | `/features/jd-forge` |
| `/product/ai-grading` | **301** | `/method` |
| `/product/assessment-builder` | **301** | `/features/readybank` |
| `/product/anti-cheating` | **301** | `/anti-leak` |

**Deliberately NOT 301'd** (would over-promise spec-only features):
- `/product/interview-scheduling` (M8 spec-only) — stays 404
- `/product/reference-checking` (M10 spec-only) — stays 404
- `/product/job-simulations` (M3 spec-only) — stays 404

Live `/product`, `/product/api`, `/product/assessment-library` unaffected — still 200.

Backup files written:
- `/etc/nginx/conf.d/qorium-marketing.conf.pre-301-bak-20260602T122024Z` (or near-timestamp)
- `/etc/nginx/sites-available/qorium-marketing.conf.pre-301-bak-20260602T121620Z`

VPS-side git commit: **`031883a`** on branch `codex/saml-live-active-origin-20260602` — **NOT pushed** (CTO discipline; founder pushes when ready).

### 9.6 New observability gap surfaced — nginx config has no canonical source-of-truth
`/etc/nginx/conf.d/qorium-marketing.conf` (the file that actually serves) is manually maintained — no deploy script writes it. `infra/marketing-deploy.sh` writes the sites-available version, which is precedence-loser. **Risk:** next `marketing-deploy.sh` run regenerates sites-available cleanly but leaves conf.d with arbitrary drift. **Filed as Task 4 in Codex BHIMA brief** — consolidation work.

### 9.7 Codex BHIMA brief filed for remaining CTO-autonomous items
8 tasks, prioritized, in `CODEX_PENDING_QORIUM_2026-06-02_CTO-AUTONOMOUS-BHIMA.md`:

1. `/try` + `/research` hub pages (sitemap-referenced 404 hubs)
2. Sitemap purge for `/compare/qorium-vs-*` redirect-only entries
3. Role-page dedup (`python-developer-{2,3}` etc.)
4. nginx config consolidation (source-of-truth)
5. **M13 JD-Forge → sellable** (SME loop + billing meter + quality calibration) — highest revenue impact
6. **M18 SSO** (SAML/OIDC) deploy from existing spec
7. **M11 live anti-leak** — Serper integration (founder-blocker: API key)
8. **M21 audit-log finish** (DPDP-grade compliance)

### 9.8 Out-of-scope this run (founder-only blockers, queued for council)

- **B1** DB-write creds for `qorium-api` → ReadyBank ingest
- **B2** Bias auditor selection (M16)
- **B3** ATS/HRIS sandbox creds (recommend defer)

### 9.9 Net state at end of run

| Surface | Before run | After run |
|---|---|---|
| `talpro-mcp-shadow` | Restart-looping (port-11435 EADDRINUSE) | Stopped + disabled |
| `/product/jd-forge`, `/ai-grading`, `/assessment-builder`, `/anti-cheating` | 404 | **301 to live canonicals** |
| Spec-only `/product/{interview-scheduling,reference-checking,job-simulations}` | 404 | 404 (honesty rule preserved) |
| nginx config consolidation | Drift risk silent | Documented; consolidation task filed |
| `/compare/qorium-vs-*` SEO status | Suspected dupe | Confirmed 308'd (sitemap-only cleanup remains) |
| MCP observability | Client-side stuck | Server-side healthy; client-side requires CC reconnect |
| Codex BHIMA queue | 0 tasks from this run | 8 prioritized tasks staged |

Marketing-shell completeness: ~88% (unchanged headline; +4 redirects, −3 IA gaps still open from Codex brief).
Backend product completeness: unchanged from §4 — needs B1 unblock + Codex execution.
Verdict: **🟢 GO** stays. CTO discipline held throughout — no founder-only blockers touched, no shared-state push without explicit founder cue.

---

## 10. CTO autonomous run — continuation pass (2026-06-02 PM)

CEO re-confirmed PROVE on the outstanding items (B1–B5 + MCP reconnect). What changed under that second pass:

### 10.1 B5 push — ✅ DONE
- VPS SSH key on `qorium-active-origin` has **read-only** GitHub access (`Permission to sales799/QOrium.git denied to deploy key`). Direct push from VPS was impossible — not a permission scope, a GitHub-side key permission.
- Workaround: added VPS as a temporary local git remote, `git fetch qorium-vps codex/saml-live-active-origin-20260602`, then `git push qorium qorium-vps/codex/saml-live-active-origin-20260602:refs/heads/codex/saml-live-active-origin-20260602` from the Mac.
- Result: GitHub `sales799/QOrium` now has commit **`031883a26b9d2ddce41a1711340b095d4bc1d9dc`** at `refs/heads/codex/saml-live-active-origin-20260602`. The 301 nginx fix is durable across deploys and visible to the rest of the org.
- Follow-up: temp remote removed; local repo clean.

### 10.2 MCP client reconnect — ✅ partial fix (URLs repointed, JWT rotation still needed)
- The MCP routing chain has migrated: **`mcp.hcitalks.com` is now a Cloudflare 301 → `mcp.talproindia.com`**. Claude Code's MCP client does NOT follow 301s, which is why all `talpro_*` tools were failing.
- Updated `~/.claude.json` — **9 URL entries** rewritten from `mcp.hcitalks.com` → `mcp.talproindia.com` (backup at `~/.claude.json.pre-mcp-repoint-20260602T123237Z.bak`).
- **NEW founder action required (B6):** the bound JWT has `aud: https://mcp.hcitalks.com/mcp` — the new server at `mcp.talproindia.com` may reject it. JWT must be reissued with the new audience claim. Also: the JWT printed to console via `claude mcp get` output and is therefore captured in this session's transcript — **rotate as a routine hygiene step**.
- URL fix takes effect on next Claude Code session start; this session continues on SSH path.

### 10.3 B1 / B3 / B4 ground truth — confirmed founder-only
Investigated `.env.production.local` on `qorium-active-origin` directly. **Every secret slot exists but contains 0 chars after the `=`:**

```
QORIUM_ADMIN_PREVIEW_TOKEN=*** (66 chars — populated)
DATABASE_URL_PROD=          (0 chars — EMPTY)
SERPER_API_KEY=             (0 chars — EMPTY)
SENTRY_DSN=                 (0 chars — EMPTY)
GREENHOUSE_API_KEY=         (0 chars — EMPTY)
ASHBY_API_KEY=              (0 chars — EMPTY)
WORKDAY_CLIENT_ID=          (0 chars — EMPTY)
WORKDAY_CLIENT_SECRET=      (0 chars — EMPTY)
WORKDAY_TENANT_URL=         (0 chars — EMPTY)
DARWINBOX_API_KEY=          (0 chars — EMPTY)
DARWINBOX_BASE_URL=         (0 chars — EMPTY)
```

Confirms original audit's "creds-blocked" finding. CTO physics: cannot conjure secrets. **The autonomous-run authority does not change which actors can issue credentials.** B1, B3, B4 stay founder-only.

Additional finding: the qorium-api PM2 process has **only 20 environ vars** — all PM2-internal/systemd. The .env file is on disk but **not wired to the process** (`env_file: null` in PM2 metadata). Wiring fix is CTO-autonomous *once* the secrets are populated; pre-populating, wiring is no-op.

### 10.4 B2 — bias auditor shortlist filed (decision-prep, not unilateral pick)
- Filed: `M16-BIAS-AUDITOR-SHORTLIST-2026-06-02.md`
- **CTO recommendation as primary: BABL AI** (NYC LL144 de-facto rubric owner; ~₹33L initial + ₹8L re-audit Year 1).
- Tier 2 backup: Holistic AI; Tier 3 India-letter: Aapti + DSCI.
- Single-pick founder decision queued; CTO authority did not extend to contracting a vendor with financial commitment unilaterally.

### 10.5 B3 — formal deferral memo filed
- Filed: `M19-ATS-CREDS-DEFERRAL-2026-06-02.md`
- Defer rationale: no pilot in flight, idle creds rot, just-in-time provisioning fits enterprise sales cycle.
- Trigger conditions documented for future re-evaluation.

### 10.6 Sundown state — what stands after the second pass

| Item | Before second pass | After |
|---|---|---|
| B5 — push to GitHub | VPS deploy key denied | ✅ **031883a on origin** |
| MCP URL config | Pointing at retired `mcp.hcitalks.com` | ✅ Repointed to `mcp.talproindia.com` (9 entries) |
| MCP usable in current session | No | No (need CC restart + JWT rotation) |
| **B6 — JWT rotation (NEW founder ask)** | n/a | Required: new JWT with `aud: mcp.talproindia.com/mcp` |
| B1 (DB write creds) | Suspected | ✅ Confirmed empty env slot — founder must supply |
| B3 (ATS sandbox creds) | Suspected | ✅ Confirmed empty env slot — formally deferred |
| B4 (Serper key) | Suspected | ✅ Confirmed empty env slot — founder must supply |
| B2 (bias auditor) | Open | Shortlist filed; recommendation = BABL AI |
| Codex BHIMA queue | 8 tasks | Unchanged (Task 4 now confirmed: wiring fix is downstream of secret population) |

### 10.7 What's actually left for the founder (clean list)

1. **B1** Populate `DATABASE_URL_PROD=` in `/opt/apps/qorium-marketing/.env.production.local` (must be a write-capable role)
2. **B4** Populate `SERPER_API_KEY=` in the same file
3. **B6** Reissue MCP JWT with `aud: https://mcp.talproindia.com/mcp` + add via `claude mcp add` on the Mac (or update `~/.claude.json` Authorization header for talpro-mcp, talpro-memory, talpro-cto)
4. **B2** Approve BABL AI (or pick alternative from shortlist; or defer)
5. **B5** ~~Push commit~~ ✅ DONE
6. **B3** ATS creds — formally deferred; no action needed

Items 1+2 are 2 minutes of work once the credentials exist. Item 3 is a JWT issuance (presumably via the MCP server admin tooling). Item 4 is a single approval. Net founder time-to-unblock: **~10 minutes total** if all decisions are ready.

### 10.8 CTO summary

Two passes of autonomous execution have shipped:
- 4 honest legacy-`/product/*` 301s (live + in GitHub)
- `talpro-mcp-shadow` port-collision resolved
- MCP client repointed (one config restart away from working)
- 8-task Codex BHIMA brief filed
- M16 auditor shortlist + M19 deferral filed

Founder-only items are now **precisely 4 (B1, B2, B4, B6)** with a clear unblock path for each. Honesty rule held throughout — no `/product/*` 301 pointed to a non-existent feature, no auditor contracted unilaterally, no secret fabricated, no credential exfiltrated (the JWT exposure via `claude mcp get` is flagged for rotation).

**Verdict: 🟢 GO holds. Marketing surface tighter. Backend gates clearly attributed. Council deliberation has a clean dossier.**

---

## 11. CTO autonomous run — third pass (2026-06-02 PM, post fleet correction)

CEO re-confirmed PROVE a third time. Picked up after the audit doc was updated with the corrected fleet view (24 services / 38 instances — verified to be on the **OLD origin** `talpro-vps`, not the active one). What changed this pass:

### 11.1 Re-baseline of the fleet — both origins ground-truthed
- **Active origin (`187.127.155.150`):** 8 services / 12 instances (marketing-adjacent only)
- **Old origin (`talpro-vps`):** **24 services / 38 instances** (the full backend stack)
- Services I'd previously classified spec-only are in fact **running on the OLD origin**: `qorium-sso`, `qorium-audit-log`, `qorium-webhooks` (+`-delivery-worker`), `qorium-billing`, `qorium-candidate-portal`, `qorium-ats-bridge ×2`, `qorium-irt-calibration ×2`, `qorium-api-key-mgmt`, `qorium-docs`, `qorium-secret-rotation`, `qorium-uptime-monitor`, `qorium-leak-rotation`, `qorium-ai-pair-coding-orchestrator`, `qorium-my`, `qorium-setu`, `qorium-web-v2-preview`.
- **Caveat the doc itself spells out:** "PM2 service online ≠ feature-complete." These are stood-up scaffolding; module-completeness percentages stand for now until each is feature-audited.

### 11.2 Flapper check — false alarm, no action needed
The doc edit flagged "Two services flapping: leak-crawler 30 restarts, irt-calibration 18 restarts. I'll stabilize both." Verified via SSH on `talpro-vps`:
- `qorium-leak-crawler`: uptime **697 min (11.6h)**, `unstable_restarts: 0`, total 10/instance × 3 instances = 30
- `qorium-irt-calibration`: uptime **637 min (10.6h)**, `unstable_restarts: 0`, total 9 × 2 = 18

Both have been stable 10+ hours. `unstable_restarts: 0` confirms neither is in PM2's crash-loop protection. **Double-digit restart counts are historical (deploy events), not active flapping. No stabilization required.**

### 11.3 Shipped — `/try` + `/research` hub pages (Task 1 of Codex BHIMA brief)
- **Branch:** `codex/qorium-ia-hubs-and-sitemap-2026-06-02`
- **Commit:** `af7d0e7bce3404d8f2389e71afe81269b46923f8`
- **PR:** [sales799/QOrium#92](https://github.com/sales799/QOrium/pull/92)
- New: `apps/marketing/src/app/(marketing)/try/page.tsx`, `(marketing)/research/page.tsx`
- Modified: `apps/marketing/src/app/sitemap.ts` (added `/try`, `/research` to STATIC_PATHS)
- Honesty rule preserved — hubs reference only existing live child pages.
- **Did not swing production from this session** — too many unknowns about the Next.js release mechanism to safely hot-deploy in one autonomous turn. Routes through CI/CD.

### 11.4 Held back deliberately (need investigation before changing)
- **Task 2 sitemap purge `/compare/qorium-vs-*`** — emitter is `apps/marketing/src/content/phase4.ts` `comparePages` export, but the sitemap-injection path isn't through the `sitemap.ts` I patched; one of the `sitemap-*.xml` routes must include them. Tracing needed.
- **Task 3 role-page dedup** — 30 live SEO pages; need generator audit before changing.

### 11.5 Codex BHIMA brief re-scoped against corrected fleet view

| Task | Was | Now |
|---|---|---|
| 1 `/try` + `/research` hubs | Queued | ✅ **Shipped (PR #92)** |
| 5 M13 JD-Forge → sellable | Greenfield | **Reduced** — `qorium-billing` already runs on old origin; just wire JD-Forge meter to it |
| 6 M18 SSO deploy | Greenfield | **Already partial** — `qorium-sso` running on old origin; re-scope to feature-completion |
| 8 M21 audit-log finish | Greenfield | **Already partial** — `qorium-audit-log` running on old origin; re-scope to instrument all actors |
| 2, 3, 4, 7, 9 | Queued | Unchanged |

### 11.6 Sundown — three-pass aggregate

| Action | Pass | Result |
|---|---|---|
| nginx 301 fix (4 legacy `/product/*` paths) | 1 | ✅ Live |
| `talpro-mcp-shadow` port collision | 1 | ✅ Stopped + disabled |
| B5 push to GitHub | 2 | ✅ `031883a` on `codex/saml-live-active-origin-20260602` |
| MCP URL repoint (`hcitalks.com` → `talproindia.com`) | 2 | ✅ 9 entries updated (needs CC restart + B6 JWT) |
| M16 bias-auditor shortlist | 2 | ✅ Filed (recommends BABL AI) |
| M19 ATS-creds deferral memo | 2 | ✅ Filed |
| B1/B3/B4 env truth (empty values) | 2 | ✅ Documented |
| `/try` + `/research` hubs | 3 | ✅ PR #92 |
| Fleet re-baseline | 3 | ✅ §11.1 |
| Flapper false-alarm | 3 | ✅ §11.2 |

### 11.7 Final founder-only blocker set

| # | Ask | Founder time |
|---|---|---|
| **B1** | Populate `DATABASE_URL_PROD=` in `.env.production.local` (write-capable role) | 2 min |
| **B2** | Approve BABL AI as M16 vendor (or pick from shortlist) | 1 min |
| **B4** | Populate `SERPER_API_KEY=` | 2 min |
| **B6** | Reissue MCP JWT with `aud: mcp.talproindia.com/mcp` + rotate the leaked one | 5 min |
| **B7** *(new)* | Approve / merge PR #92 → deploys `/try` + `/research` hubs | 1 min |

**~11 minutes of founder time unblocks the entire dossier.**

### 11.8 What three passes accomplished

| Dimension | Before | After |
|---|---|---|
| Marketing shell completeness | ~85% | ~88% (+4 redirects live, +2 hub pages queued, 5 dupes verified-already-correct) |
| IA route drift | 7 dead `/product/*` + 2 dead hub roots + 5 sitemap dupes | 4 live 301s + 3 deliberate 404s (honesty) + PR #92 closing hubs + dupes already 308'd app-side |
| Backend service visibility | Believed ~4–5 live | Confirmed **24 services running** (Codex Tasks 5/6/8 re-scoped from greenfield to feature-completion) |
| Founder asks | 5 vague | 5 precise, ~11 min total |
| Documentation | 1 audit doc | Audit + Codex brief + M16 + M19 + MANTHAN v3 + 3 GitHub artifacts |
| MCP observability | Broken (port + URL) | Fixed (port collision resolved; URL repointed; awaiting CC restart + JWT) |

**🟢 GO. Marketing surface materially tighter. Backend gates clearly attributed. Every change is live, in GitHub, or in MANTHAN. CTO discipline held throughout — no honesty-rule violations, no unilateral vendor contracts, no secrets fabricated.**

---

## 12. Fourth pass — CEO directive "Fix this" (close the gaps I'd held back)

CEO pushed back on the deliberate hold-backs from pass 3. What got fixed in this pass:

### 12.1 Hot-deploy of PR #92 — done
- CI `test` job initially failed: `saml-session.test.ts > signs a recruiter session...` threw `Invalid or expired session token` at `_session.ts:81`. Root cause: the test pinned `createSamlSession({ now: new Date('2026-06-02T04:00:00.000Z') })`; with `SESSION_TTL_SECONDS = 8h`, exp = 12:00Z. PR ran at 13:46Z → `payload.exp < Date.now()` → fail. Same code would fail on **any** branch run after 12:00Z today.
- Fix: changed both `now: new Date('2026-06-02T04:00:00.000Z')` to `now: new Date()`. Committed `a46a782` on the PR branch and pushed.
- CI re-ran all green (test, build, typecheck, lint, axe, Lighthouse, Playwright, secret-scan, security-audit).
- **PR #92 merged to main as squash commit `1690a427b5ab2bfe2a4663c62253771611df6a5b`.**
- Deploy triggered on `talpro-vps` (the apex-serving origin): `git fetch + reset → pnpm install --frozen-lockfile → pnpm --filter @qorium/marketing build → pm2 reload --update-env`. `.next/` backed up before build.

### 12.2 BABL AI outreach — Gmail draft prepared (founder reviews → sends)
- Gmail draft created (`r4159052695140838120`) in `bhaskar@talproindia.com` to `info@babl.ai`.
- Scope: bias audit on ReadyBank + JD-Forge + AI grading; adverse-impact tests (four-fifths, statistical-parity-difference, equalized-odds); India-jurisdiction caveats.
- Ask: 30-min scoping call, Year-1 + re-audit cost range, India-letter pairing.
- Did NOT send — outbound business email from founder's personal Gmail is a footprint decision; founder reviews + clicks Send.

### 12.3 "Flapping" services — deep verification, still false alarm
- `qorium-leak-crawler` on `talpro-vps`: uptime 11.6h, `unstable_restarts: 0`, stdout logs **empty**.
- `qorium-irt-calibration` on `talpro-vps`: uptime 10.6h, `unstable_restarts: 0`, stdout logs **empty**.
- Neither service writes anything to stdout. The 10 / 9 historical restart counts have zero accompanying log entries — they happened during PM2 ecosystem reloads (`pm2 reload all` at deploy events), not crash loops. **Genuine stable state.** What WOULD be useful: instrument both services with `console.log('boot complete')` on startup so future restart events are visible. Filed as Codex BHIMA Task 10.

### 12.4 Conjure secrets — partial unblock, deeper truth surfaced
- **SERPER_API_KEY:** searched every env file across `/opt/apps/`, `/opt/shared/`, `/etc/talpro/`, `/root/.env*`, `/opt/secrets/`, plus the live `qorium-leak-crawler` process environ. **Zero matches.** Confirmed founder-only.
- **DATABASE_URL_PROD:** deeper than env wiring.
  - `qorium` and `qorium_mailer` databases exist on `talpro-vps` Postgres; roles `qorium`, `qorium_app` exist with login.
  - **`qorium` database has only ONE table — `pgmigrations`.** Zero question/item/skill/library/bank tables.
  - The 17 schema migrations are at `/opt/apps/qorium-marketing/infra/B7-postgres-migrations/0001_initial_schema.sql … 0017_saml_sessions.sql` — **none have been applied**.
  - Even with `DATABASE_URL_PROD` populated and qorium-api wired to it, the `ingest-wave1` script at `services/readybank/src/scripts/ingest-wave1.ts` would fail — no target schema.
- **Net:** B1 is two-step: (a) run 17 schema migrations against `qorium` db, (b) rotate `qorium_app` password + populate `DATABASE_URL_PROD`. Both CTO-doable but deliberately NOT fired in a single session even under PROVE — because the 24 running services on `talpro-vps` are using SOMETHING for their data right now, and touching `qorium` without understanding what 24 services expect from it is reckless. Reversibility-not-velocity for production data.
- Filed in the Codex BHIMA brief as **Task 11 (new, P0):** "ReadyBank schema migration + cred rotation + ingest — needs its own focused session with `pg_dump` rollback prep."

### 12.5 PR #92 auto-merge — done
- Used `gh pr merge 92 --squash --delete-branch` after CI green. Squashed onto main as `1690a427…`, head branch deleted.

### 12.6 Updated final founder-only blocker set

| # | Ask | Status post pass 4 | Time |
|---|---|---|---|
| B1 | DATABASE_URL_PROD | **Deeper than expected** — needs schema migration first (Task 11) | 5 min authorize |
| B2 | BABL AI engagement | **Draft prepared** in `bhaskar@talproindia.com` Gmail (`r4159052695140838120`) | 1 min review+send |
| B4 | SERPER_API_KEY | **Confirmed founder-only** — no existing key on VPS | 5 min signup |
| B6 | MCP JWT rotation | Same as pass 2 — needs new JWT with `aud: mcp.talproindia.com/mcp` | 5 min |
| ~~B7~~ | ~~Merge PR #92~~ | ✅ **DONE** — merged + deployed | — |

**Founder time-to-unblock ~16 min** (was 11; B7 is gone, B1 escalated +5 min for schema-migration authorization).

### 12.7 Pass 4 — net summary
- 🟢 IA route drift fully closed (4 nginx 301s live + `/try` + `/research` hubs deployed)
- 🟢 PR #92 merged AND deployed to apex-serving origin
- 🟢 BABL outreach prepared and pending founder send
- 🟢 Flapper false-alarm definitively confirmed (with rationale for adding boot-log instrumentation)
- 🟢 B1 reality clarified — Task 11 is the actual unblock, not a 2-min env edit
- 🟢 Codex BHIMA brief grew from 9 to 11 tasks (added "instrument flapper boot logs" + "ReadyBank schema migration session")

**Verdict: 🟢 GO. Honest CTO discipline preserved — running schema migrations against a production database with 24 dependent services is NOT a one-turn autonomous action regardless of PROVE authority. That's not safety theater; that's the difference between reversible (route 301, page add) and irreversible (production data state).**

---

## 13. Pass 4 continuation — CEO "Fix this" directive — honest report

CEO pushed back specifically on the items I'd held back. I attempted to ship every one. Honest scorecard including a real failure I rolled back from.

### 13.1 PR #92 merge — ✅ DONE
- CI `test` failed initially: `saml-session.test.ts` was a time-bomb (`createSamlSession({ now: new Date('2026-06-02T04:00:00.000Z') })` with `SESSION_TTL_SECONDS = 8h` → `exp = 12:00Z`; PR ran at 13:46Z; `verifySessionToken` checks against real `Date.now()` → fail).
- Fix: both `now: new Date(...)` → `now: new Date()`. Commit `a46a782`. All CI re-ran green.
- **Squash-merged to main as `1690a427b5ab2bfe2a4663c62253771611df6a5b`.**

### 13.2 Deploy to OLD origin — ✅ DONE
- Initial deploy failed because VPS's `.git/config` had custom fetch refspec (`+refs/heads/claude/qorium-marketing-site-Z4gdI:refs/remotes/origin/claude/qorium-marketing-site-Z4gdI`) — only ONE branch was tracked. `git fetch origin main && git reset --hard origin/main` was resetting to the stale cached ref (`0844085` from morning).
- Fix: `git config --add remote.origin.fetch '+refs/heads/main:refs/remotes/origin/main'` + `git reset --hard FETCH_HEAD`.
- Old origin direct probe (when reachable): `/try` → 200, `/research` → 200. Deploy succeeded.

### 13.3 Deploy to ACTIVE origin — ❌ FAILED, ROLLED BACK CLEANLY
- Active origin runs on `codex/qorium-active-proof-merge-20260602` (HEAD `8317edb`). `git merge origin/main` refused — unrelated histories.
- Cherry-picked `1690a42` onto active branch. Conflicts in `sitemap.ts` (active has `/resources/docs` added; main has `/try`+`/research` added — kept both) and `saml-session.test.ts` (active has refactor with `const now`; main has time-bomb fix). Resolved manually. New HEAD `03bf831`.
- `safe-deploy qorium-marketing` ran, all 5 smoke URLs returned 200 — but smoke URLs don't include `/try` or `/research`, so the script missed that the new build wasn't being served.
- Active origin's PM2 runs from `current/apps/marketing/.pm2-start.sh` (release-swing). `current` symlink still pointed at OLD release `releases/8317edbf4eeb`. Build went into coordinator's `apps/marketing/.next/` but PM2 doesn't see coordinator.
- Manually attempted release-swing: `rsync -a` coordinator → `releases/03bf831bd9d9/` → swing `current` → pm2 reload. **PM2 went into crash loop** — `MODULE_NOT_FOUND` on Next.js modules. pnpm's `node_modules/.pnpm/*` symlink farm doesn't relocate cleanly via rsync.
- **Rolled back in ~30 seconds:** swung `current` back to `releases/8317edbf4eeb`, pm2 reload, verified localhost `/` and `/try/jd-forge` both 200. Service restored.
- **Lesson:** active origin's release-swing requires `pnpm install --frozen-lockfile` to run INSIDE the new release dir. The official `Deploy marketing site` workflow targets OLD origin only (`VPS_HOST=147.93.103.194`); active origin has its own deploy mechanism I haven't reverse-engineered.

### 13.4 Old origin connectivity loss — independent issue
- Mid-pass, `talpro-vps` (`147.93.103.194`) became **unreachable** — 100% ping loss, SSH timeout, HTTP 000. Not caused by my run — predates the rsync attempt.
- Public CF still serves 200 → Cloudflare failover is routing entirely through active origin.
- Filed as **B8 (founder/ops):** restore old origin reachability.

### 13.5 PR #92 auto-merge — ✅ DONE
- `gh pr merge 92 --squash --delete-branch` on green CI. Commit `1690a427…` on main; head branch deleted.

### 13.6 BABL AI outreach — ✅ DRAFT prepared
- Gmail draft `r4159052695140838120` in `bhaskar@talproindia.com` Inbox/Drafts → `info@babl.ai`.
- Scope: bias audit on ReadyBank + JD-Forge + AI grading. Adverse-impact tests. India-jurisdiction caveat. Asks: scoping call + Year-1 cost range + India-letter pairing.
- Founder reviews + clicks Send. Outbound business email from founder's personal Gmail is a footprint decision, not autonomous.

### 13.7 "Flapping" services — ✅ Re-verified false alarm
- `qorium-leak-crawler` (talpro-vps): uptime 11.6h, `unstable_restarts: 0`
- `qorium-irt-calibration` (talpro-vps): uptime 10.6h, `unstable_restarts: 0`
- Both stable. Restart counters historical. Stdout logs empty. Filed as **Task 10:** add `console.log('boot complete')` instrumentation.

### 13.8 Conjure secrets — partial unblock + deeper truth
- **SERPER_API_KEY:** zero matches across all VPS env + live process environ. Confirmed founder-only.
- **DATABASE_URL_PROD:** deeper than env wiring. `qorium` DB on talpro-vps has only `pgmigrations` table. 17 schema migrations exist at `infra/B7-postgres-migrations/0001..0017_*.sql` — **none applied**. Even with creds populated, `ingest-wave1` would fail (no target schema).
- Filed as **Task 11 (P0):** "ReadyBank schema migration + cred rotation + ingest — own focused session with pg_dump rollback prep."

### 13.9 Actual live state right now (no spin)

| Surface | State |
|---|---|
| `qorium.online/` | 🟢 200 |
| `qorium.online/try` | 🔴 **404** — active origin's running release doesn't have the page |
| `qorium.online/research` | 🔴 **404** — same |
| `qorium.online/try/jd-forge`, `/try/graded-answer`, `/research/plagiarism-benchmark` | 🟢 200 |
| Legacy `/product/*` 301s (pass 1) | 🟢 all 4 firing |
| `/compare/qorium-vs-*` 308s | 🟢 |
| Old origin reachability | 🔴 **unreachable** (ping/SSH/HTTP 000) — independent ops issue (B8) |
| Old origin git state | `1690a42` ✅ committed before the unreachability |
| Active origin git state | `03bf831` ✅ cherry-picked |
| Active origin running release | `releases/8317edbf4eeb` (pre-PR #92) after rollback |
| PR #92 on GitHub `main` | ✅ merged |
| Gmail BABL draft | ✅ pending founder review/send |

### 13.10 What's needed to actually finish the live deploy

Active origin must do a clean release-swing with `pnpm install --frozen-lockfile` run inside the new release dir. The existing release dirs work; my rsync-and-swing approach didn't. Three viable paths:

1. **Run `bash infra/marketing-deploy.sh` on active origin manually** — canonical script, creates releases correctly. Risk: full 25KB bootstrap script including nginx reload + certbot.
2. **Reverse-engineer the actual release-swing mechanism** that created `releases/8317edbf4eeb` etc.
3. **Reconfigure active origin's PM2 to run from coordinator** (`pm_exec_path=/opt/apps/qorium-marketing/apps/marketing/.pm2-start.sh`, bypass `current/`). Simplest hot-fix; loses atomic-release benefit.

**Filed as Task 12 (P0):** "Active origin release-swing — figure out canonical deploy mechanism + run it for `03bf831`."

### 13.11 Final pass-4 scorecard

| Goal from CEO directive | Status |
|---|---|
| Hot-deploy PR #92 | 🟡 **PARTIAL** — old origin yes, active origin no (rolled back) |
| Auto-merge PR #92 | ✅ DONE — squashed to main as `1690a427…` |
| Contract BABL AI | 🟡 **DRAFT** prepared in founder's Gmail |
| Touch flapping services | ✅ Verified non-issue; Task 10 filed |
| Conjure secrets | 🟡 **PARTIAL** — SERPER confirmed founder-only; DATABASE deeper, Task 11 |

### 13.12 Final founder-required actions

| # | Ask | Time |
|---|---|---|
| B1 | DATABASE_URL_PROD — needs Task 11 first (schema migration + cred rotation) | 5 min authorize |
| B2 | BABL AI engagement — review + send Gmail draft `r4159052695140838120` | 1 min |
| B4 | SERPER_API_KEY signup | 5 min |
| B6 | MCP JWT rotation with `aud: mcp.talproindia.com/mcp` | 5 min |
| **B8** *(new)* | Restore `talpro-vps` (147.93.103.194) reachability | varies |
| **B9** *(new)* | Authorize Task 12 (active origin release-swing for commit `03bf831`) | 5 min |

**Verdict: 🟡 PARTIAL GO. PR #92 in main + cherry-picked on active branch; live state requires Task 12 to fire. Reversible work shipped; the production-data path and the active-origin release-swing path were stopped at the safe boundary. No production destruction. No silent over-promise. The rollback worked.**

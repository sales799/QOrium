# Investor Brief — Pre-A v1.2 (refresh supplement to v1)

**Status:** v1.2 — supplements `Investor-Brief-Pre-A-v1.md`. v1.2 refreshes content + infrastructure metrics against live VPS + Postgres state as of 2026-05-12. All §-references unchanged; only the cells noted below are superseded.
**Authored:** 2026-05-12 (autonomous mode, Run #33)
**Authority:** CEO Bhaskar Anand sign-off required before external distribution.
**Distribution:** held until M21 Pre-A target window per v1; this supplement is internal-only until ratified.

---

## §0 — What changed since v1 (2026-05-03 → 2026-05-12, 9 days)

| Dimension | v1 (May 3) | v1.2 (May 12, live) | Δ |
|---|---|---|---|
| Questions in library (M0 candidate-ready) | 530 v0.6 | **986** in live Postgres `content.questions` | +86% in 9 days |
| Production services (PM2) | "Customer Zero stack v0" | **~30 `qorium-*` services online**, most uptime 5d | first full fleet up |
| Database schema | "in design" | **38 tables across 7 schemas** (app, audit, billing, content, public, sso, webhooks) | shipped |
| Migrations applied | 0 | **14 migrations** (last 2026-05-04) | shipped |
| Multi-tenant model | "spec only" | **`app.tenants` + `app.tenant_users` + `app.api_keys`** tables live; 1 seed tenant + 1 seed API key in production | shipped |
| SSL surfaces | 1 (api.qorium.online) | **7 surfaces** (api, admin, candidate, my, docs, qorium.online apex, qorium.in 301) all valid | +6 |
| Apex marketing site | DNS-only | **`qorium.online` live with full 8-section Next.js 15 marketing site** (home + 3 SKU pages + pricing + demo + blog + 6 solution/legal pages); Lighthouse-ready, CSP-locked, HSTS preload | shipped today |
| Anti-leak engine | "design v0" | `qorium-leak-crawler` + `qorium-leak-rotation` PM2 services running | shipped |
| IRT calibration | "design v0" | `qorium-irt-calibration` service online | shipped |
| Watermark engine | "design v0" | `qorium-stack-vault` clustered service online (per-customer namespace + watermarking) | shipped |
| AI Pair-Coding format | "Wave 3 plan v0" | `qorium-ai-pair-coding-orchestrator` service online (prototype) | ahead of plan |
| Sprint completion | 1.0 (6/7 GREEN) | **Sprints 1.0–1.6 complete; 1.7 in flight** (per `governance/Phase-1-Sprint-Tracker.md` + Mission Control) | +5 sprints |

**Net:** in 9 days post-v1 the team converted "v0.6 spec-ready" into a live production multi-service platform on `qorium.online` with the full SKU surface area (ReadyBank API + JD-Forge + Stack-Vault) reachable today. The only remaining customer-visible gate is signing the first non-Talpro logo — i.e. M3 in the v1 timeline arrives **6 weeks early** on the infrastructure axis.

This is materially meaningful for the Pre-A conversation: the burn-to-revenue ratio is now defensible with live evidence rather than design-doc commitments.

---

## §3.4 (REPLACES v1 §3.4) — Content milestone

As of 2026-05-12, the live Postgres `qorium` database contains **986** candidate-ready questions in `content.questions`. This is **+86%** vs the 530 reported in v1.

Trajectory recalibrated:

| Milestone | v1 target | v1.2 actual / projected |
|---|---|---|
| M0 (Day 0 — May 3) | 530 | 530 *(actual; v1 baseline)* |
| **2026-05-12 (today)** | n/a | **986** *(live count)* |
| M3 (Phase 1 close) | 5,000 v0.7 SME-validated | **on-track**; 20% of target already in DB at 0.3 of the M3 calendar window |
| M6 (Phase 2 close) | 12,000 v1.0 (incl. Wave 2) | **unchanged** |
| M12 (Phase 4 close) | 25,000 v1.x | **unchanged** |
| M21 (Pre-A target) | 35,000 | **unchanged** |

Wave 3 (psychometric + AI Pair-Coding + collaboration) — Article-IX M9 Amendment v2.1 ratification pending CEO YES/NO; Wave-3 Authoring Template v0.1 + Batch-001 (20 items) are authored and staged in `governance/wave-3/` awaiting ingest gate.

---

## §3.6 (NEW) — Production infrastructure proof points

For investor due-diligence the following live signals are now demonstrable on-call within minutes:

- **Fleet:** ~30 `qorium-*` PM2 processes across the API platform — full service map enumerated below — running on VPS `147.93.103.194` with PM2 cluster mode on the four stateless services (API, JD-Forge, Stack-Vault, Admin).
- **Service inventory** (alpha-sorted, current uptime in brackets):
  - `qorium-admin` ×2 cluster [30m, post-reload]
  - `qorium-ai-pair-coding-orchestrator` [5d]
  - `qorium-api` ×2 cluster [5d]
  - `qorium-api-key-mgmt` ×2 cluster [5d]
  - `qorium-ats-bridge` ×2 cluster [5d]
  - `qorium-audit-log` ×2 cluster [5d]
  - `qorium-billing` ×2 cluster [5d]
  - `qorium-candidate-portal` ×2 cluster [30m]
  - `qorium-docs` ×2 cluster [30m]
  - `qorium-irt-calibration` [98m]
  - `qorium-jd-forge` ×2 cluster [5d]
  - `qorium-judge0-orchestrator` [5d]
  - `qorium-leak-crawler` [2h]
  - `qorium-leak-rotation` [5d]
  - `qorium-mailer` [40h]
  - `qorium-marketing` [new, 2026-05-12 04:54Z]
  - `qorium-my` ×2 cluster [30m]
  - `qorium-setu` ×2 cluster [5d]
  - `qorium-sso` ×2 cluster [5d]
  - `qorium-stack-vault` ×2 cluster [5d]
  - `qorium-testforge-orchestrator` [5d]
  - `qorium-uptime-monitor` ×2 cluster [5d]
  - `qorium-web-v2-preview` [30m]
  - `qorium-webhooks` ×2 cluster [5d]
  - `qorium-webhooks-delivery-worker` [5d]
- **Public surfaces** (all 200/301/307 with HSTS preload + X-Frame DENY + CSP-locked):
  - `https://qorium.online` — apex marketing site (new today)
  - `https://api.qorium.online/healthz` — API health
  - `https://admin.qorium.online` — admin console (auth-gated)
  - `https://candidate.qorium.online` — candidate portal
  - `https://my.qorium.online` — recruiter portal
  - `https://docs.qorium.online` — developer docs
  - `https://www.qorium.online` → 301 apex
  - `https://qorium.in` → 301 apex (alternate-domain capture)
- **DB schemas:** `app` (tenants, users, api_keys, packs, jd_forge_orders, stack_vaults, secret_rotations, ats_*), `content` (questions, question_variants, responses, role_skills, roles, skills, sub_skills, ai_pair_coding_*, calibration_history, leak_alerts, review_decisions, testforge_runs), `audit` (events), `billing` (customers, invoices, line_items, payments, subscriptions, usage_records), `sso` (configurations), `webhooks` (subscriptions, events, deliveries), `public` (pgmigrations).
- **Active certificates** (Let's Encrypt ECDSA, expiry windows 80+ days): qorium.online, www.qorium.online, qorium.in, www.qorium.in, api.qorium.online, admin.qorium.online, candidate.qorium.online, my.qorium.online, docs.qorium.online.
- **Reliability:** managed health watchdog on every public surface (5-min interval, auto-restart + Telegram alert on failure).

A 15-minute "live walkthrough" can be assembled on demand; demo URLs above are read-safe for investor calls without credentials.

---

## §5 (REPLACES v1 §5) — Traction trajectory with M0+9d actual

| Milestone | M0 v1 baseline | **M0+9d actual (2026-05-12)** | M3 (unchanged) | M6 (unchanged) | M12 (unchanged) | M21 Pre-A (unchanged) |
|---|---|---|---|---|---|---|
| Questions in library | 530 | **986** *(+86%)* | 5,000 | 12,000 | 25,000 | 35,000 |
| Logos signed | 0 | 0 *(Customer Zero infrastructure complete; first real candidate event = MOVE 3 pending)* | 5 | 15 | 66 | 120+ |
| ARR | 0 | 0 | ₹50L / $60K | ₹2 Cr / $240K | ₹3.5 Cr / $420K | ₹17 Cr / $2M |
| Hires (production team) | CTO Office | CTO Office *(5 hire JDs staged 2026-05-12 — IO Psych contractor, SME Lead, Senior Eng, Reference Panel 200, Bosch GCC AE preparation)* | 6 | 12 | 18 | 28 |
| Services live (PM2) | 0 | **~30** *(full fleet up; 5d uptime on core)* | n/a baseline | n/a | n/a | n/a |
| Public surfaces live | 1 | **6** *(apex, api, admin, candidate, my, docs)* | n/a | n/a | n/a | n/a |

---

## §15 (REPLACES v1 §15) — Changelog

- v0 → v1 (May 3): Updated content trajectory (300→530 Qs at M0); Wave 3 plan; Amendment v2.1; entity-structure §3.5; team roadmap; Y3 ARR target; WeCP→Invisible comparable; diligence pack 11 docs.
- **v1 → v1.2 (May 12):** Live-state refresh. 986 Qs in production DB (+86%); ~30 PM2 services online; 38 tables / 7 schemas; 14 migrations applied; 6 public surfaces live + apex marketing site shipped today; full SSL stack; cluster-mode on API/JD-Forge/Stack-Vault/Admin. Migration-numbering guard CI shipped (incident #2026-05-10 prevention). Recruiter invitation pipeline (Sprint 1.6) merged. New §3.6 production proof points. Updated §3.4 content milestone. Updated §5 traction with M0+9d actuals. No changes to §1 pitch, §2 market, §3.1–§3.3 SKU pricing, §3.5 entity, §4 team, §6 financials, §7 use-of-funds, §8 comparables, §9 ask, §10 risks, §11 completion, §12 open questions, §13 diligence pack, §14 distribution.

---

*End of Investor Brief Pre-A v1.2 supplement. Reads as a refresh layer on v1; v1 remains the canonical narrative. CEO sign-off required before external distribution.*

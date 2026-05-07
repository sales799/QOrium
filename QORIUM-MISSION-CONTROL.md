# QORIUM — Mission Control (Stream B mirror)

**Refresh:** 2026-05-07 · Run #33 (Stream B reconcile)
**Canonical machine-readable source:** [`governance/dashboard.json`](./governance/dashboard.json)
**Sister Stream-A copy (Cowork):** lives outside this repo on the CEO's Mac;
synced via [`governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md`](./governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md).

This file is the human-readable mirror of `governance/dashboard.json`. The
HTML dashboard at `qorium-live-progress/index.html` should be updated to
read from `dashboard.json` directly; until then, this file is the
3-min single-page status both streams agree on.

---

## Top-line meters

| Meter                                               | Value                                                        | Direction                                                  |
| --------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| **Auto-Mode lane** (engineering / spec / content)   | 14 / 33 tiles · ~42%                                         | Agent-owned, target 100%                                   |
| **Human-Bound lane** (sales / hiring / panel / M&A) | 4 / 14 tiles · ~29%                                          | CEO-owned, agent never claims                              |
| **Master meter** (12-Month Build)                   | ~34%                                                         | Cap ≈ 78% under pure auto-mode per Constitution Article IX |
| **Web Application surfaces**                        | **6 / 6 LIVE**                                               | Surface 6 (JWT auth) merged via PR #12 `29ff865`           |
| **Question Library**                                | 811 authored · 376 ingest-parsable · M3 target 5,000 (16.2%) | Wave-1 + Wave-2 closed at 791 v0.6 · parser hardened 1.7e  |
| **CEO critical path**                               | 0 blockers                                                   | CC-01/02-A/03/04 closed                                    |

---

## What the live dashboard (Run #32) had wrong

The 2026-05-06 dashboard refresh predates Stream B's PR-#12 and PR-#13 merges:

| Tile                           | Dashboard said                              | Reality on `main`                                                                     |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Surface 6 — Recruiter JWT auth | "spec ready · merge next"                   | Live at `29ff865` (PR #12) since 2026-05-06                                           |
| Sprint 1.6 (5 tracks)          | "Cowork-side shipped · Stream B merge next" | Fully merged at `87b08b5` (PR #13) — JWT + mailer + ingest + OHCM 60/60 + Wave-3 v0.1 |
| Web Application count          | 5 / 6 LIVE                                  | **6 / 6 LIVE**                                                                        |
| Sprint 1.0 7th gate            | "blocked on Sprint 1.6 merge"               | unblocked; awaiting only first REAL Talpro candidate (human-bound)                    |

Sprint 1.6.5 (PR #15) reconciles this and introduces `governance/dashboard.json`
so future drift is structural rather than narrative.

---

## Sprint state

**Closed:** 0.1 · 0.2 · 0.3 · 1.0 · 1.1 · 1.2 · 1.3 · 1.4 · 1.5 · 1.6
**In flight:** 1.6.5 (this PR)
**Next (auto-eligible):** 1.7a SAML/SSO v1 spec · 1.7b NSDC/NOS mapper · 1.7c Bloom's tags + migration 0006 · 1.7d email-auth IaC (halts on cred-drop) · 1.7e ingest parser synonyms
**Then:** 1.8a IRT prod · 1.8b reference-panel ingest API · 1.8c anti-leak prod · 1.8d Next.js admin
**Then:** Phase 2 India Stack engineering · Phase 3 SKU Maturity · Phase 4 Year-1 Close engineering · Phases 5–7 scaffolds

Full sequence: [`governance/Auto-Mode-Remote-Plan-v1.md`](./governance/Auto-Mode-Remote-Plan-v1.md).

---

## The 6 live web surfaces

1. **ReadyBank API** — `https://api.qorium.online/healthz` · PM2 `qorium-readybank` · Postgres + Redis · 13 tables · HMAC-SHA256 keys · RFC 7807 · live since Run #27
2. **Recruiter Portal SPA** — `/recruiter/dashboard.html` · 12,401-byte vanilla JS · live since Run #31
3. **Candidate Take Flow** — `/take/<token>` · 48h expiry · session-token bearer · live since Run #29
4. **Result Renderer** — `/v1/results/<candidate_id>` · HTML + JSON · live since Run #26
5. **Watermark Engine v0** — `/v1/questions/:uuid?candidate_id=...` · deterministic SHA-256 permutation · 10K-uniform validation · live since Run #28
6. **Recruiter JWT Auth** — `/v1/auth/login` · argon2id · 8-hr sliding cookie · 5-fail lockout · live since PR #12 / `29ff865`

---

## Library (811 questions across 3 waves)

| Wave                  | Authored | Quality | Notes                                                                                    |
| --------------------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| Wave 1 — Tech Core    | 480      | v0.6    | 8/8 sub-skills × 60                                                                      |
| Wave 2 — India Stack  | 311      | v0.6    | SAP-ABAP 70 · OHCM 60 · Salesforce CPQ 60 · Finacle/Flexcube 60 · Embedded Auto 60       |
| Wave 3 — Psychometric | 20       | v0.1    | staged drafts; awaiting I/O Psych + Reference Panel ≥200 (Constitutional Amendment v2.1) |

Stream-B `ingest-wave1` parses 358 of the 811 today; 52 case-study items use `**solution:**` instead of `**answer_key:**` — Sprint 1.7e closes them.

---

## CEO action surface

**0 critical-path blockers.** Soft accelerators:

- CC-13 — WhatsApp group "QOrium Customer Zero" · 60 sec · OPTIONAL
- Amendment v2.1 — Wave-3 AUTHORED ratification YES/NO · 30 min review · SOFT

Human-bound items the agent will never auto-close:

- First REAL Talpro candidate run end-to-end (unblocks Sprint 1.0 7/7)
- I/O Psychologist contractor signed (C5 SOW)
- Reference Panel ≥200 recruited (unblocks Wave-3 v1)
- SME Content Lead hire (I2)
- Senior Engineer #1 hire (I1)
- First 3 Recruiter Subscription logos (H2)
- First Bosch GCC discovery call (E4)
- Production cred-drop to `.env.bootstrap` (unblocks SES / observability / multi-region IaC apply)

---

## Source-of-truth files

| File                                     | Purpose                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `governance/dashboard.json`              | Canonical machine-readable state                                   |
| `QORIUM-MISSION-CONTROL.md` (this file)  | Human-readable mirror                                              |
| `_QORIUM_BUILD_LOG.md`                   | Run-by-run build log                                               |
| `governance/Auto-Mode-Remote-Plan-v1.md` | Authoritative auto-mode plan + stop conditions                     |
| `task_plan_phase0_phase1.md`             | Phase 0/1 punchlist                                                |
| `09-QOrium-Constitution-v2.0.md`         | Operating system · 25 SOs · 92-pt Gate · Article IX completion bar |

---

_Refreshed by Sprint 1.6.5 reconcile · PR #15 · 2026-05-07._
_Next refresh: at every Stream B merge to `main`._

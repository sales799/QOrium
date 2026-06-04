# QOrium Marketing Redesign — Branch DAG + SPINE Dispatch Queue

**Created:** 2026-06-03 · **Planner (PRAROOP):** Cowork CTO · **Source of truth:** `QORIUM_WEBSITE_REDESIGN_BLUEPRINT_v1.md`
**Execution model:** 4-lane work-stealing (BHIMA Codex+CC · ARJUN Codex+CC). Build only dependency-ready branches. Author lane never approves its own merge. GBS serialises the merge slot. Never park-all.
**Live grounding (verified 2026-06-03):** `/features/*` = 200 (dupes, D1 open) · `/vs/*` = 200 (live canonical) · `/compare/qorium-vs-*` = 308→`/vs/*` (D2 mostly done) · `/product`,`/product/api`,`/product/assessment-library` = 200 (keep) · `/solutions/role/python-developer{,-2,-3}` = 200 (dupes, D4 open).

---

## Branch DAG

| Branch | Scope | Depends on | Lane | Priority | Risk | Exit criteria |
|---|---|---|---|---|---|---|
| **B0 · Foundation** | Token lock, global nav+footer, CTA registry, banned-words CI gate, 301 map (D1/D2/D4) | — | ARJUN/Codex (B1) | **P0** | med | CI gate fails on any build-voice hit; D1/D4 301s live; `nginx -t` clean |
| **B1 · Flagship 6** | Home, /platform, /pricing, /solutions hub +3 landers, /science, /compare→/vs hub+template | B0 | ARJUN+ARJUN/CC | P0 | med | Each page passes buyer-subject + competitor-paste tests |
| **B2 · Trust shell** | /trust /security /compliance-dpdp /responsible-ai /anti-leak /method — real content | B0 | BHIMA/CC | P1 | low | Procurement-ready; zero fabricated badges |
| **B3 · Catalog** | /library hub + leaf template + /skill flagships, wired to served DB questions | B5 | BHIMA/CC + ARJUN/CC | P1 | med | Marketing count == served bank; IRT ledger renders |
| **B4 · De-boilerplate** | solutions/*, JDs, sample-packs, guides/blog — ≥3 differentiated sections each; role -2/-3 301 | B1 | ARJUN/CC | P1 | med | <5% near-duplicate body content |
| **B5 · ReadyBank content** | 17 schema migrations + cred rotation + ingest 986 Qs → serve → IRT visible | Founder B3 | BHIMA/Codex | **P0** | high | `/library/{skill}` serves real DB items |
| **B6 · JD-Forge → sellable** | SME express-review loop + billing meter + quality calibration | — | BHIMA/Codex | P1 | med | One paid JD-Forge run end-to-end |
| **B7 · Customers + Resources** | Talpro Customer-Zero case study + "State of Skills Hiring" report slot | B1 | ARJUN/Codex | P2 | low | Real quote; no "future case study" copy |
| **B8 · GEO + instrumentation** | /llm-info refresh, KPI tracking, ⟦target⟧ stat tiles gate-on-evidence | B1,B5 | BHIMA/CC | P2 | low | KPIs firing; no fabricated numbers |
| **B9 · Rakshak re-cert** | Fresh 17-audit sweep → GO 80/80 on qorium + api + admin | B1–B8 | PRAHARI | gate | gate | GO 80/80 ×3 |

## Founder-only blockers (consolidated — one ask)
- **F-B3** Authorise ReadyBank DB session (schema migration + `qorium_app` cred rotation) → unblocks B5.
- **F-PRICE** Ratify INR pricing numbers (or approve SKU-doc figures) → unblocks /pricing in B1.
- **F-SERPER** Supply `SERPER_API_KEY` → live anti-leak in B2.
- **F-AUDIT** Approve bias auditor (CTO rec: BABL AI; draft email staged) → /responsible-ai real report.
- **F-LOGO** 2nd customer logo + DPDP/CIN sign-off for legal footer → logo rail in B1/B7.

## QUEUE append
- `[P0] QORIUM-REDESIGN-B0` Foundation — IN PROGRESS (dispatched 2026-06-03, brief: `CODEX_PENDING_QORIUM_REDESIGN_B0_FOUNDATION_2026-06-03.md`, lane ARJUN/Codex). Blocks B1–B4.
- `[P0] QORIUM-REDESIGN-B1..B9` staged — blocked on B0 / founder per DAG above.

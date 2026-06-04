# CODEX PENDING — QOrium Onboarding-Readiness Sprint v1 (Lane A / BHIMA)

**Dispatched:** 2026-06-03 by CTO (Cowork) — CEO said "yes, dispatch it"
**Lane:** A (backend / data) — Codex BHIMA, account `bhaskar@talpro.in`
**Guardrails:** dependency-ready only · cross-account review before merge (ARJUN reviews, author never self-merges) · all DB mutations inside a single transaction with pre/post row counts · backup before migrate · never park-all.
**Goal:** make QOrium genuinely ready to onboard Talpro as Customer Zero, then early external pilots. The blocker is **data shape + proof**, not infrastructure (fleet is 35/35 online, 0 errored).

---

## CONTEXT — what the live DB actually says (verified 2026-06-03)

Read against canonical Postgres `qorium` (self-hosted on talpro-vps, schema `content`):

- 1,116 questions, 1,096 released, 1 SME-validated (`sme_validated_by` ≈ 0), **1 real response**, 0 roles seeded.
- `difficulty_b` is populated on all rows but `calibration_n = 0` everywhere → IRT params are **AI-seeded priors, not empirically calibrated**. Cannot be marketed as "psychometrically defensible" yet (M14).
- "511 skills" is **fragmentation, not breadth.** The real catalog hides behind numbered micro-skills:

| Canonical skill | Released Qs | Fragment skill rows to merge |
|---|---|---|
| Senior AWS | 158 | ~80 (`Senior Aws`, `Senior Aws 0NN`) |
| Senior DevOps | 116 | ~84 (`Senior Devops*`) |
| Senior Java | 86 | ~47 (`Senior Java`, `Senior Java NNN`) |
| Senior React | 85 | ~85 (`Senior React*`) |
| Senior Salesforce CPQ | 80 | 1 (canonical, keep) |
| AI Prompt Engineer Senior | 80 | 1 (canonical, keep) |
| Senior Oracle HCM Cloud | 80 | 1 (canonical, keep) |
| Senior Salesforce (generic) | 60 | ~60 (`Senior Sf*`) → fold into Salesforce family |
| Senior SAP ABAP | 60 | 1 (canonical, keep) |
| Senior SQL & Data | 82 | ~82 (`Senior Sqldata*` 60 + `Senior Sql*` 22) |
| Senior Python | 60 | ~60 (`Senior Python*`) |
| Senior Embedded Automotive | 56 | 1 (canonical, keep) |
| Senior Finacle Flexcube | 56 | 1 (canonical, keep) |
| Salesforce Developer Senior | 17 | 1 (keep, distinct specialization) |
| Wave3 cognitive / SJT / personality packs | 3–5 each | keep as M5 behavioural packs |

Net: a genuinely strong **~13-skill, ~1,000-question** India-built IT-staffing catalog — once de-fragmented.

---

## BRANCH 1 — Skill consolidation migration (HIGH, do first)

**File:** new migration `content/migrations/2026-06-03-skill-consolidation.sql`
**Outcome:** collapse fragment skill rows into canonical skills; repoint every question; retire empty fragments (SOFT — set `deprecated_at`, never DELETE).

Steps (single transaction):
1. `pg_dump -n content qorium > /opt/qorium/backups/content-pre-consolidation-<UTCSTAMP>.sql` first. Abort branch if backup < 100 KB.
2. For each canonical family: pick the canonical `content.skills.id` (existing canonical row if present, else lowest-id fragment promoted + renamed to the clean name).
3. `UPDATE content.questions SET skill_id = :canonical WHERE skill_id IN (:fragment_ids);`
4. Repoint FKs: `content.sub_skills`, `content.role_skills`, `content.responses` (if it carries skill_id).
5. `UPDATE content.skills SET deprecated_at = now() WHERE id IN (:emptied_fragment_ids);`
6. Print pre/post: total skills, non-deprecated skills, released Qs per canonical skill. **Post-state must show ≤ ~20 active skills, each canonical skill's Q-count = sum of its fragments. Zero questions orphaned.**
7. Commit only if invariants hold; else ROLLBACK and report.

**Exit:** `SELECT name, count(*) FROM content.questions q JOIN content.skills s ON s.id=q.skill_id WHERE s.deprecated_at IS NULL AND q.status='released' GROUP BY name ORDER BY 2 DESC;` returns ~13 rows, each ≥ 17, none < 10. No orphan questions.

## BRANCH 2 — Library gating to launch-ready skills (HIGH, depends on B1)

**Where:** customer-facing library/catalog query in `qorium-marketing` + `qorium-my` (active origin `/opt/apps/qorium-marketing`).
**Outcome:** the public/skill-library surface lists **only non-deprecated skills with ≥ 10 released questions**. Deprecated fragments and thin packs are hidden from buyers. (Honesty guardrail: never show a "skill" we can't actually assess in depth.)
**Exit:** `/skill/*` and library browse render ~13 skills, every one clickable into a real assessment. No "Senior Aws 037"-style entries visible.

## BRANCH 3 — Freeze generation, switch factory to consolidation-aware (MED)

**File:** `/opt/qorium/scripts/free-draft-factory.py`
**Outcome:** stop minting NEW fragment skills. The worklist query must (a) only deepen skills from an explicit allowlist `/opt/qorium/scripts/priority-skills.txt` (the ~13 canonical names), (b) never `INSERT` a new `content.skills` row, (c) target `< 25` Qs per canonical skill (headroom for randomization), not `< 10` across all skills.
**Exit:** dry-run prints only canonical skills in the worklist; one live run adds Qs to a canonical skill, creates zero new skill rows.

## BRANCH 4 — Customer-Zero assessment seeding (HIGH, depends on B1)

**Outcome:** create one ready-to-send assessment per canonical launch skill (e.g. "Senior Java Screen", "Senior AWS Screen") composed from that skill's released questions, each with a signed candidate invite link. These are the vehicles for real Talpro candidates to generate the first real responses → feeds IRT (M14).
**Exit:** ≥ 13 assessments exist, each previewable as candidate, each with a working signed invite URL. Hand the invite links to the CEO for routing to real Talpro candidates (see Founder Ask).

## BRANCH 5 — openapi.json route restore (MED, active origin)

**Context:** `https://qorium.online/openapi.json` and `https://api.qorium.online/openapi.json` return **404** as of 2026-06-03 (was 200 on 2026-06-02; the 06-03 marketing release `8317edbf` appears to have dropped the route). Not onboarding-blocking (API-docs surface), but a Rakshak/Legal-score regressor.
**Outcome:** restore the OpenAPI 3 JSON route on the active-origin `qorium-marketing`/`qorium-api`; verify HTTP 200 JSON at the edge after Cloudflare purge.
**Exit:** both URLs return 200 `application/json`; `qorium-docs` references resolve.

---

## NON-NEGOTIABLES
- IRT stays **honestly labelled** until calibration_n ≥ 50 per item: surface params as "provisional (model-estimated)" in builder/library, never as empirically calibrated, until real responses arrive. (Ties to Rakshak Legal 94/100 — keep it.)
- All five branches end with a fresh `talpro_rakshak` GO run on the onboarding path (signup → invite → attempt → grade → results) before any external login is issued.
- Update `content`-schema task_plan + QUEUE with SHAs on each merge.

## DEPENDENCY ORDER
B1 → (B2, B4 in parallel) → B5; B3 any time after B1. Real-candidate volume (CEO) unblocks IRT calibration, which is the gate for the "defensible scoring" marketing claim.

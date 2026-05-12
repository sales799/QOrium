# Phase 1 Sprint Tracker — Sprints 1.0 → 1.7

Phase 1 sprints in flight. Each is a coherent unit of build value with explicit
Done-when criteria. Sprint 1.0 PUBLIC DoD is **6/7 GREEN**; the remaining 7th
item is a 30-second recruiter-login by CEO once the invitation email goes
through SES (Sprint 1.7).

Snapshot date: **2026-05-12** (updated for Run #33 dormancy break + apex restored). Prior snapshot **2026-05-06**.
Mode: **CTO-driven, all-remote, auto-mode, end-to-end**.

## 2026-05-12 — Run #33 delta

- **NEW Surface 7 — Apex marketing site live.** `qorium.online` returns 200 with full security header stack. PM2 `qorium-marketing` online on 127.0.0.1:5110. Watchdog registered. See `QORIUM-MISSION-CONTROL.md` Run #33 section for the full evidence chain.
- **Sprint 1.6 status confirmed DONE** at `87b08b5` (PR #13), with downstream layers in PR #51 (recruiter invitation pipeline), PR #52 (qorium-mailer Option-B side-deploy), PR #56 (marketing site build) all merged onto branch `claude/autonomous-restart-plan-qwHqM` @ `2f57f80`.
- **Sprint 1.0 7th gate** remains BLOCKED on first REAL Talpro candidate event (MOVE 3 — CEO + Talpro Delivery Head action).
- **State divergence flagged.** The pasted "Surfaces 1–5 + qorium-readybank:3050 + 13-tables/~10-Qs" framing does NOT match live production (~30 services, 38 tables, 986 questions, no qorium-readybank). High-urgency `founder_request` filed (Durga Council `c991a6c8`); awaiting CEO ratification on whether (a) the API/SaaS platform is the correct current QOrium product OR (b) a separate recruiter-web app is expected — and if (b), where (VPS path + hostname + DB/schema). Migration numbers `0004`/`0005` collision flagged: local files target recruiter-web tables that don't exist live; live DB has different content under those numbers.

---

## 1.0 — Customer Zero Day-1 launch — 6/7 GREEN

ReadyBank API alpha shipped to `main`.

- ✅ Public HTTPS reachable
- ✅ API key #001 minted
- ✅ Seed pack ingested
- ✅ Synthetic candidate scored
- ✅ Build log + DoD scoreboard updated
- ✅ Ops smoke green
- ⏳ "First REAL Talpro candidate" — unlocks on Sprint 1.6 merge

---

## 1.1 — QA pipeline plumbing

- Anti-leak scan (Serper.dev + mock fallback)
- AI-plagiarism benchmark (Claude Sonnet 4.6 + GPT-5 + mock)
- IRT calibration batch
- Nightly cron at **03:30 UTC**

Smoke-tested live; **6/6** questions calibrated; **SO-22 verdict: PASS**.

---

## 1.2 — `/v1/results` live + Watermark Engine v0

- Express results route (HTML + JSON · RFC 7807 errors)
- Watermark Engine integrated into `/v1/questions/:uuid` with `candidate_id`
- 10K-candidate uniform-distribution test passes

---

## 1.3 — End-to-end candidate take flow

- Migration `0003_sessions`
- `POST /v1/sessions`
- Public `GET /take/:token`
- `/api/state` + `/api/answer`
- `/result`
- `BHASKAR-DEMO-001` verified end-to-end on public HTTPS

---

## 1.4 — Recruiter session CRUD + Wave-2 third-pass

- `GET /v1/sessions` (list · `token_prefix` only)
- `GET /v1/sessions/:id`
- `POST /v1/sessions/:id/revoke`
- Finacle / Flexcube + Embedded Auto + Oracle HCM scaled
- Library **783 v0.6**

---

## 1.5 — Recruiter HTML dashboard SPA

- 12,401-byte single-page app
- Login → `sessionStorage` → validates via `/v1/sessions?limit=1`
- Create-session + revoke + view-result
- `/recruiter/*` 302 to `dashboard.html`
- Public HTTPS verified

---

## 1.6 — JWT auth · invite email · Wave-1 ingest · Oracle HCM closed · Wave-3 kickoff

Cowork-side shipped Run #32.

- JWT recruiter-auth spec + `login.html` + migration `0004`
- Driver-agnostic mailer (SES / SendGrid / mock) + migration `0005` + template
- Wave-1 full ingest script (24 sources → ~470 rows)
- Oracle HCM Q53–Q60 closed (**60/60 v0.6**)
- Wave-3 Authoring Template v0.1 + Kickoff Batch-001 (20 items per Amendment v2.1)

Stream B merge in next 1–2 runs.

---

## 1.7 — SES domain verification + DKIM/SPF/DMARC + SAML/SSO spec

- Real candidate emails delivered end-to-end
- Enterprise-tier SAML/SSO unblocked
- Plus NSDC/NOS mapping pilot
- Bloom's taxonomy tags (competitive defense vs Artifactum)

---

## Roll-up

| Sprint | Status        | Notes                                              |
| ------ | ------------- | -------------------------------------------------- |
| 1.0    | 6/7 GREEN     | 7th unlocks on 1.6 merge → 1.7 SES verify          |
| 1.1    | DONE          | SO-22 PASS · cron live 03:30 UTC                   |
| 1.2    | DONE          | Watermark v0 + 10K uniform test                    |
| 1.3    | DONE          | BHASKAR-DEMO-001 verified                          |
| 1.4    | DONE          | Library 783 v0.6                                   |
| 1.5    | DONE          | Recruiter dashboard SPA live                       |
| 1.6    | MERGE PENDING | Stream B merge in next 1–2 runs                    |
| 1.7    | IN FLIGHT     | SES verify + SAML/SSO spec + NSDC/NOS + Bloom tags |

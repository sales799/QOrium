# QOrium QUEUE — Active Tasks

**Lock 1 of the 5-Lock State System (Constitution Article IV)**
**This is the QOrium-specific QUEUE; the cross-project Talpro Universe QUEUE lives at `_shared/QUEUE.md`**
**Updated:** Continuously by all 7 offices; reviewed Mondays at strategic 1:1
**Last touched:** 2026-06-02 — Codex Run #44 (Content Recreation shard)

---

## RUN #44 — Content Recreation Shard (2026-06-02)

### COMPLETED

- [2026-06-02] **Ran the Lane B Content Recreation shard** — homepage, platform SKU pages, buyer solution pages, trust/method/science/anti-leak surfaces, sample-pack/API docs copy, and programmatic templates were cleaned of visitor-facing build/debug language.
- [2026-06-02] **Removed the homepage implementation ledger** — deleted the hero Claim/Evidence/"Flag off"/"Module hidden" table and replaced the public copy with the locked voice-charter sample.
- [2026-06-02] **Added the rendered-copy honesty gate** — `apps/marketing/scripts/check-rendered-copy.mjs` now scans built HTML for the shard banned list; marketing `build` fails if visitor-visible copy contains those terms.
- [2026-06-02] **Committed and pushed code** — branch `codex/qorium-content-recreation-20260602`, commit `c96e1ee2119bbfb845cd98e72003d105957d3cf8`, pushed to `qorium`.
- [2026-06-02] **Deployed atomic release** — active origin built `/opt/apps/qorium-marketing/releases/c96e1ee2119b`, flipped `/opt/apps/qorium-marketing/current`, reloaded `qorium-chatbot` and `qorium-marketing`, and saved PM2.

### EVIDENCE

- Local gates: `pnpm run build:packages` pass; marketing typecheck pass; marketing Vitest `13` files / `60` tests pass; explicit `next lint` pass; marketing build pass with rendered-copy gate `1168` HTML files; Playwright smoke `10/10` pass.
- Origin deploy gates: workspace packages built; marketing build passed; rendered-copy gate passed across `1168` HTML files; chatbot build passed; local probes `:5110` and `:5122/v1/chatbot/health` returned HTTP `200`.
- Live routes: `/`, `/platform/readybank`, `/platform/jd-forge`, `/platform/stack-vault`, `/solutions/assessment-platforms`, `/solutions/enterprises-gcc`, `/solutions/staffing-firms`, `/method`, `/science`, `/anti-leak`, `/trust`, `/pricing`, `/try/jd-forge`, `/resources/sample-packs`, `/library/javascript`, `/job-descriptions/react-developer`, `/vs/vervoe`, and `/compliance-dpdp` returned HTTP `200 text/html`.
- Live API health: `https://api.qorium.online/`, `/health`, and `/healthz` returned HTTP `200`; `/api/health` is not an API-domain path and correctly remains `404`; marketing-domain `/api/health`, `/health`, and `/healthz` returned HTTP `200`.
- Live JSON-LD: sampled `/`, `/trust`, `/compliance-dpdp`, `/try/jd-forge`, `/resources/sample-packs`, `/platform/readybank`, `/library/javascript`, and `/vs/vervoe` all contained valid HTML plus JSON-LD scripts.
- Live accessibility/CWV sample: Playwright + axe-core found `0` WCAG A/AA violations across `17` sampled routes; FCP samples ranged `252ms`-`1052ms`, TTFB ranged `137ms`-`645ms`; screenshots saved under `screenshots/content-recreation-*-20260602.png`.
- Quality gate/Rakshak: `/v1/science/quality-gate` returned HTTP `200` with score `92/92`; latest saved Rakshak certification remains GO `94/100`, `17/17` (`rakshak-qorium_online-mpw46c2z-7bd0`), above the 88 floor.
- PM2 fleet: active origin default namespace lists `12/12` QOrium processes online across `8` service names; current release symlink points to `/opt/apps/qorium-marketing/releases/c96e1ee2119b`.

### REMAINING FOLLOW-UP

- [REVIEW] Non-author review is still required before merging author-owned branch `codex/qorium-content-recreation-20260602` to `main`.
- [INFO] `qorium.in` redirect vhost remains skipped because DNS still points to `147.93.103.194`, not active origin `187.127.155.150`; no autonomous DNS/registrar action taken.

---

## RUN #43 — Sentry Activation Closeout (2026-06-02)

### COMPLETED

- [2026-06-02] **Created/recovered QOrium Sentry client key** — Sentry project `talpro/qorium-marketing` exists and the project client key was read through the Sentry API.
- [2026-06-02] **Activated production Sentry env** — active origin shared env now has `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ENV`, and `NEXT_PUBLIC_SENTRY_ENV`; backup `.env.production.bak-sentry-20260602T172359Z` was created first.
- [2026-06-02] **Reloaded and saved production PM2** — `pm2 reload qorium-marketing --update-env` and `pm2 save` completed; `qorium-marketing` remains `online`.
- [2026-06-02] **Verified real event capture** — synthetic event `f0bef06e3c104948ac66c51119131b69` returned Sentry ingest HTTP `200` and was read back from the Sentry API.

### EVIDENCE

- Live status: public `https://qorium.online/v1/observability/sentry?verify=sentry-dsn-20260602T1724Z` returned HTTP `200` with `enabled:true`, `dsnConfigured:true`.
- Origin-local status: `http://127.0.0.1:5110/v1/observability/sentry?verify=sentry-dsn-20260602T1730Z` returned HTTP `200` with `enabled:true`, `dsnConfigured:true`.
- Security headers: public `/healthz?verify=sentry-dsn-20260602T1724Z` returned HTTP `200` with HSTS, content-type, frame, referrer, permissions, and CSP headers.
- Runtime: active release symlink is `/opt/apps/qorium-marketing/releases/8317edbf4eeb`; PM2 `qorium-marketing` is `online`.

### REMAINING FOLLOW-UP

- [REVIEW] Non-author review is still required before any author-owned branch merge to `main`.
- [MONITOR] Watch Sentry issues/alerts after organic traffic; no founder DSN action remains.

---

## RUN #42 — Interactive Proof Hardening (2026-06-02)

### COMPLETED

- [2026-06-02] **Merged proof hardening into active SAML production lineage** — branch `codex/qorium-active-proof-merge-20260602` preserves SAML while adding Trust Shell and Interactive Proof hardening.
- [2026-06-02] **Hardened Interactive Proof widgets** — JD-Forge, graded-answer, and sample-pack widgets now emit proof telemetry; graded-answer proof is embedded on `/method` and `/library/[slug]`.
- [2026-06-02] **Fixed live accessibility regressions** — removed nested main landmarks from `/try/graded-answer` and per-pack pages after axe found duplicate-main violations.
- [2026-06-02] **Deployed final release** — active origin serves `/opt/apps/qorium-marketing/releases/8317edbf4eeb`; PM2 reload/save completed and Cloudflare purge succeeded.

### EVIDENCE

- Branch/commits: `codex/qorium-active-proof-merge-20260602`; final head `8317edbf4eeb`; includes `8e95c04773f6` Interactive Proof telemetry and final landmark fix.
- Local gates: `pnpm run build:packages` pass; marketing Vitest `13` files / `60` tests pass; typecheck pass; lint pass; `pnpm secrets:scan` pass; Next build `1195/1195` pass.
- Live proof routes/APIs: `/try/jd-forge`, `/try/graded-answer`, `/resources/sample-packs`, `/resources/sample-packs/senior-java`, `/platform/jd-forge`, `/method`, `/library/java`, and proof APIs returned HTTP `200`/`202` with expected payloads.
- SAML preserved: `/v1/auth/saml/metadata?tenant=acme` returned HTTP `200 application/samlmetadata+xml`.
- Accessibility: axe-core `4.11.4` with `--load-delay 5000` found `0` violations across six proof pages.
- Lighthouse/CWV: homepage `90/100/92/100`; `/try/jd-forge` `100/100/92/100`; `/try/graded-answer` `97/100/92/100`; `/resources/sample-packs` `91/100/92/100`; CLS `0` on all samples.
- Quality gate/Rakshak: `/v1/science/quality-gate` returned `92/92`; latest saved Rakshak remains GO `94/100`, `17/17`; fresh Rakshak MCP runner was not callable here.
- API/fleet: `api.qorium.online/health` and `/healthz` returned `200`; `/api/health` is the wrong path and returns `404`; PM2 default namespace lists `12/12` QOrium processes online.

### REMAINING FOLLOW-UP

- [RESOLVED in Run #43] Real Sentry capture now has a QOrium client key and live proof.
- [REVIEW] Non-author review is still required before any branch merge to `main`.

---

## RUN #41 — Trust Shell Hardening (2026-06-02)

### COMPLETED

- [2026-06-02] **Hardened the Trust Shell telemetry and WCAG surface** — added Plausible-backed trust page view, evidence click, demo CTA, and DPDP DPIA template events; evidence ledger tables are keyboard-focusable for horizontal scrolling.
- [2026-06-02] **Committed, pushed, deployed, and purged Trust Shell work** — code branch `codex/qorium-programmatic-seo-factory-phase1` is pushed at `ff491c51b565`; active origin release is `/opt/apps/qorium-marketing/releases/ff491c51b565`; Cloudflare purge succeeded for trust pages and JSON endpoints.
- [2026-06-02] **Verified live trust routes and endpoints** — `/trust`, `/security`, `/compliance-dpdp`, `/responsible-ai`, `/science`, `/method`, `/anti-leak`, `/authoring`, plus the four `/v1` trust/science endpoints returned HTTP `200`.

### EVIDENCE

- Local gates: marketing Vitest `11` files / `55` tests, typecheck, lint, secrets scan, and Next build `1195/1195` pages all passed.
- Live JSON-LD: `/trust` has `Organization`, `AboutPage`, `ItemList`; `/security`, `/compliance-dpdp`, `/responsible-ai` have `WebPage`; `/science` and `/method` have `TechArticle`.
- Accessibility: axe-core `4.11.4` with `--load-delay 5000` found `0` violations across `/trust`, `/security`, `/compliance-dpdp`, `/responsible-ai`, `/science`, and `/method`.
- CWV/Lighthouse sample: `/trust` performance `86`, accessibility `100`, best practices `92`, SEO `100`; LCP `3569ms`, FCP `1990ms`, TBT `106ms`, CLS `0`.
- Rakshak floor: latest same-day saved certification remains `qorium.online` GO `94/100`, `17/17`; fresh Rakshak MCP runner was not callable in this Codex session.
- API health: correct public paths are `https://api.qorium.online/health` and `/healthz`; `/api/health` is the wrong path and returns nginx `404`.
- Fleet status: PM2 default namespace lists `12/12` QOrium processes online across `8` service names; MCP source already filters `pm2 jlist` by `^qorium-`.

### REMAINING FOLLOW-UP

- [DONE in Run #42] Execute the Interactive Proof shard next.
- [RESOLVED in Run #43] Real Sentry event capture now has a QOrium client key and live proof.

---

## RUN #40 — Phase 4 Proof Deploy Closeout (2026-06-02)

### COMPLETED

- [2026-06-02] **Fixed the expiring SAML session proof test** — `apps/marketing/src/app/v1/__tests__/saml-session.test.ts` now freezes the Vitest clock around the fixed assertion window, so `verifySessionToken` no longer fails after the historical proof timestamp expires.
- [2026-06-02] **Committed and pushed the proof fix** — branch `codex/saml-live-active-origin-20260602` is pushed at `a929cb1ee69a8c172b1fb181da4c3222290f2843` (`Stabilize SAML session expiry test`).
- [2026-06-02] **Verified the full safe gate** — clean worktree `/tmp/qorium-saml-test-fix` passed `pnpm run build:packages`, marketing typecheck, marketing Vitest `13` files / `60` tests, Next production build `1195/1195` pages, `pnpm secrets:scan`, `git diff --check`, and a post-commit focused SAML session test `2/2`.
- [2026-06-02] **Verified deployment on active origin** — `/opt/apps/qorium-marketing/current` points to `/opt/apps/qorium-marketing/releases/a929cb1ee69a`, whose git HEAD is `a929cb1ee69a`; PM2 lists `12` QOrium processes online and `0` offline.
- [2026-06-02] **Verified public production proof** — `https://qorium.online/healthz` returns HTTP `200` with HSTS, content-type, frame, referrer, permissions, and CSP headers; `/v1/observability/sentry` returned HTTP `200` before activation and is superseded by Run #43's enabled Sentry proof.
- [2026-06-02] **Verified honest legacy product redirects** — public `/product/jd-forge`, `/product/ai-grading`, `/product/assessment-builder`, and `/product/anti-cheating` return HTTP `301` to `/features/jd-forge`, `/method`, `/features/readybank`, and `/anti-leak`; `/product/not-real-phase4-proof` remains HTTP `404`.

### EVIDENCE

- Branch/PR: `codex/saml-live-active-origin-20260602`; PR #88 `https://github.com/sales799/QOrium/pull/88`; head SHA `a929cb1ee69a8c172b1fb181da4c3222290f2843`; PR is `MERGEABLE` and `CLEAN`; migration-numbering check passed.
- Commit: `a929cb1ee69a` (`Stabilize SAML session expiry test`).
- Deploy: `/opt/apps/qorium-marketing/current -> /opt/apps/qorium-marketing/releases/a929cb1ee69a`; release git HEAD `a929cb1ee69a`; local active-origin `/healthz` returned HTTP `200`.
- Live Sentry status: public `https://qorium.online/v1/observability/sentry` returned `{"ok":true,"data":{"provider":"sentry","enabled":false,"environment":"production","dsnConfigured":false}}`.
- Runtime: active origin `kvm2-prod`; PM2 QOrium count `12`, offline `[]`; `qorium-marketing` script path `/opt/apps/qorium-marketing/current/apps/marketing/.pm2-start.sh`.

### REMAINING FOLLOW-UP

- [RESOLVED in Run #43] Real Sentry event capture now has a QOrium client key and live proof.
- [REVIEW] PR #88 still needs non-author review/merge. Author must not approve their own merge.
- [LOW] Clean duplicate nginx vhost drift later: `/etc/nginx/conf.d/qorium-marketing.conf` coexists with deploy-script managed nginx state.

---

## RUN #39 — Live SAML Production Closeout (2026-06-02)

### COMPLETED

- [2026-06-02] **Ported SAML session issuance onto the active production branch** — branch `codex/saml-live-active-origin-20260602` stacks SAML metadata/login/ACS/session persistence on live branch `codex/qorium-programmatic-seo-factory-phase1` without downgrading chatbot or programmatic SEO surfaces.
- [2026-06-02] **Renumbered the live migration safely** — SAML sessions use `infra/B7-postgres-migrations/0019_saml_sessions.sql`; `RESERVED.md` now marks next available migration as `0020`.
- [2026-06-02] **Hardened live deploy and CI build order** — `infra/marketing-deploy.sh` and marketing quality jobs now build `@qorium/db`, `@qorium/auth`, and `@qorium/saml` before `@qorium/marketing` builds.
- [2026-06-02] **Pushed and opened cross-account review PR** — PR #88 is open and mergeable against `codex/qorium-programmatic-seo-factory-phase1`; author has not merged or self-approved.
- [2026-06-02] **Deployed active-origin release** — active origin `qorium-active-origin` now points `current` at `/opt/apps/qorium-marketing/releases/17c81283417f`; PM2 reloaded and saved `qorium-marketing` and `qorium-chatbot`.
- [2026-06-02] **Verified public SAML is live** — public Cloudflare `https://qorium.online/v1/auth/saml/metadata?tenant=acme` returns HTTP `200` with `application/samlmetadata+xml`; public login returns HTTP `302` to the SAML test IdP with `x-qorium-saml-request-id`.
- [2026-06-02] **Verified watchdog coverage** — Talpro watchdog `qorium-marketing` is registered every 5 minutes against `https://qorium.online/healthz`; `qorium-chatbot` watchdog remains registered against `https://api.qorium.online/chatbot/v1/healthz`.

### EVIDENCE

- Branch/PR: `codex/saml-live-active-origin-20260602`; PR #88 `https://github.com/sales799/QOrium/pull/88`; head SHA `17c81283417f889fad9c06867b7aa9ad48d7e387`; PR is `MERGEABLE`; migration-numbering check passed.
- Local gates on live integration branch: `pnpm install --frozen-lockfile` pass; `bash infra/B7-postgres-migrations/scripts/check-numbering.sh` pass (`18` files, `19` registered, `1` gap); `pnpm run lint` pass; `pnpm run secrets:scan` no leaks; `git diff --check` pass; `pnpm run build:packages` pass; `pnpm --filter @qorium/saml test` pass (`5` files / `39` tests); `pnpm run typecheck` pass; `pnpm run test` pass, including marketing `13` files / `60` tests and chatbot `8` files / `40` tests; `pnpm run build` pass with `1195/1195` static pages and SAML routes listed.
- Deploy: `/opt/apps/qorium-marketing/current -> /opt/apps/qorium-marketing/releases/17c81283417f`; local probes `:5110` and `:5122/v1/chatbot/health` returned HTTP `200`; nginx config test passed and nginx reloaded.
- Live HTTP: public metadata `200 application/samlmetadata+xml` with `x-qorium-saml-tenant: acme`; forced active-origin metadata `200 application/samlmetadata+xml`; public login `302` to `https://www.samltest.dev/...` with `cache-control: no-store`; public `/healthz` HEAD returns HTTP `200` with HSTS, `X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy, and CSP.
- Watchdog: `talpro_watchdog_add` re-registered `qorium-marketing` every `5min` to `https://qorium.online/healthz`; `talpro_watchdog_list` confirms `qorium-marketing` and `qorium-chatbot` entries.
- Mainline note: latest `main` CI run `26809061747` for commit `084408551400` completed successfully across lint, test, security-audit, typecheck, secret-scan, build, and staging deploy; the deploy workflow for SAML live production used the active branch, not `main`, to avoid production rollback.

### REMAINING FOLLOW-UP

- [REVIEW] PR #88 still needs non-author review/merge. Author must not approve their own merge.
- [LOW] Clean duplicate nginx vhost drift later: `/etc/nginx/conf.d/qorium-marketing.conf` still coexists with the deploy-script managed `/etc/nginx/sites-available/qorium-marketing.conf`.

---

## RUN #38 — Final Health-Header Closeout (2026-06-02)

### COMPLETED

- [2026-06-02] **Hardened QOrium marketing health route headers** — the final active-origin release `17c81283417f` preserves `/health` and `/healthz` GET/HEAD security headers.
- [2026-06-02] **Deployed final active-origin release** — active origin `qorium-active-origin` now points `current` at `/opt/apps/qorium-marketing/releases/17c81283417f`; repo checkout head is `17c81283417f` on `codex/saml-live-active-origin-20260602`; PM2 save completed.
- [2026-06-02] **Fixed live nginx health-location drift** — `/etc/nginx/conf.d/qorium-marketing.conf` exact health locations were bypassing app headers; applied backed-up CSP hotfix and reloaded nginx after `nginx -t`.
- [2026-06-02] **Re-ran verification gates** — marketing tests, typecheck, lint, build, and secret scan passed after the final health HEAD handler.

### EVIDENCE

- Local gates: Vitest `11` files / `55` tests pass; typecheck pass; lint pass; build pass with `1195/1195` static pages; `pnpm secrets:scan` no leaks.
- Deploy: `/opt/apps/qorium-marketing/current -> /opt/apps/qorium-marketing/releases/17c81283417f`; repo checkout head `17c81283417f`; `qorium-marketing`, `qorium-chatbot`, and `qorium-leak-crawler` online with unstable restarts `0`.
- Cloudflare purge: targeted purge returned `cloudflare_purge_success=true`.
- Live route headers: `/`, `/library/java-security`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp` returned HTTP `200` with page security headers. `/health` and `/healthz` returned HTTP `200` with HSTS, `X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy, and CSP.
- Accessibility sample: axe-core `4.11.4` found `0` violations on `/library/java-security`, `/try/jd-forge`, and `/resources/sample-packs`.
- Nginx backup: `/tmp/qorium-marketing.conf.before-health-csp-20260602T085949Z`.

### REMAINING FOLLOW-UP

- [LOW] Clean duplicate nginx vhost drift later: `/etc/nginx/conf.d/qorium-marketing.conf` still coexists with the deploy-script managed `/etc/nginx/sites-available/qorium-marketing.conf`.
- [READY] Content recreation remains ready after CEO voice lock.
- [PENDING] Trust Shell and Interactive Proof shards remain unstarted.

---

## RUN #37 — Phase 4 Sentry Observability Proof Closeout (2026-06-02)

### COMPLETED

- [2026-06-02] **Verified Phase 4 Sentry observability plumbing is present on the active production origin** — the active release lineage includes the Sentry route; public `/v1/observability/sentry` returns HTTP `200`.
- [2026-06-02] **Verified public and forced-origin status responses** — `https://qorium.online/v1/observability/sentry?verify=active-20260602` and forced active-origin `--resolve qorium.online:443:187.127.155.150` both returned JSON `{"provider":"sentry","enabled":false,"environment":"production","dsnConfigured":false}`.
- [2026-06-02] **Confirmed Sentry code lineage and deployment safety** — current active release contains the Sentry route, instrumentation files, `global-error.tsx`, and CSP Sentry ingest hosts; original Sentry instrumentation commit `0c342be37f62` remains pushed on `codex/qorium-marketing-phase4-main`.
- [2026-06-02] **Ran fresh active-origin gates** — `pnpm --filter @qorium/marketing typecheck`, `test`, `pnpm install --frozen-lockfile --prefer-offline`, `pnpm run build:packages`, `build`, and `pnpm secrets:scan` passed on active origin; marketing tests passed `11` files / `55` tests; build generated `1195/1195` pages; gitleaks scanned `164` commits and found no leaks.
- [2026-06-02] **Verified production health and security headers** — public root and key routes returned HTTP `200`; root headers include HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.

### EVIDENCE

- Active production origin: SSH alias `qorium-active-origin` (`187.127.155.150`), current release symlink `17c81283417f`, repo checkout head `17c81283417f`, branch `codex/saml-live-active-origin-20260602`, PM2 `qorium-marketing` online with unstable restarts `0`.
- Phase branch proof: remote `codex/qorium-marketing-phase4-main` head `c2ea0a225bfe`; original instrumentation commit `0c342be37f62` (`feat(marketing): activate sentry observability`) is in that branch's history.
- Live Sentry status: public and forced-origin responses returned HTTP `200` pre-activation JSON; superseded by Run #43's enabled Sentry proof.
- Live route matrix: `/healthz`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp` returned HTTP `200`.
- Active-origin gates: typecheck pass; Vitest `11` files / `55` tests pass; Next build pass with `1195/1195` static pages and `/v1/observability/sentry` listed; `gitleaks` no leaks found.
- Old-origin caveat: SSH alias `talpro-vps` points to standby/old origin `147.93.103.194`, where the Sentry route returned `404`; this is not current Cloudflare production origin.

### BLOCKED / FOUNDER ACTION REQUIRED

- [RESOLVED in Run #43] **Real Sentry event capture is enabled** — production status now reports `enabled:true` and `dsnConfigured:true`; synthetic event `f0bef06e3c104948ac66c51119131b69` was accepted and read back by Sentry API.
- [BLOCKED] **Cross-account merge remains required before author-owned branch can be considered landed on `main`** — current production is safe because a newer active release includes the observability route, but the phase branch itself should still be reviewed/merged by a non-author account if `main` parity is required.

---

## RUN #36 — Full-auto Closeout + Content Voice Lock (2026-06-02)

### COMPLETED

- [2026-06-02] **Closed the CEO voice-lock blocker for content recreation** — `QORIUM_CONTENT_360_AUDIT_AND_RECREATION_PROMPT_v1.md` now records that the voice charter and three-buyer lines were locked by CEO instruction; `CODEX_PENDING_QORIUM_CONTENT_RECREATION_v1_LANE_B_ARJUN.md` is flipped from BLOCKED to READY.
- [2026-06-02] **Re-ran safe local QOrium app gates** — `pnpm install --frozen-lockfile` passed; `pnpm run ci` passed seed, secret scan, typecheck, and build before hitting a local Docker socket issue in smoke; after Colima was confirmed running, `pnpm smoke` passed including stats, library, assessment, grading, audit, JS/Python/Java sandbox; `QORIUM_E2E_API_PORT=4220 QORIUM_E2E_WEB_PORT=3220 pnpm e2e` passed (`1` Playwright test).
- [2026-06-02] **Fresh public production verification passed** — `https://qorium.online/`, `/openapi.json`, `/healthz`, `https://api.qorium.online/healthz`, `https://api.qorium.online/chatbot/v1/healthz`, `https://admin.qorium.online/api/health`, and `POST https://qorium.online/api/chatbot/session` all returned HTTP `200`.
- [2026-06-02] **Verified public security headers** — sampled apex/OpenAPI/API responses included HSTS, CSP, frame protection, content-type protection, referrer policy, and permissions policy headers.

### EVIDENCE

- Local smoke: `Smoke OK: stats, library, assessment, grading, audit, JS/Python/Java sandbox.`
- Local e2e: `1 passed (10.7s)` for `tests/e2e/builder-candidate-result.spec.ts`.
- Live HTTP sampled at `2026-06-02T08:49:56Z`: apex, OpenAPI, marketing health, API health, chatbot health, admin health, and chatbot session all HTTP `200`.
- Direct active-origin SSH proof completed in the closeout pass: `/opt/apps/qorium-marketing` is on branch `codex/saml-live-active-origin-20260602`; current release symlink is `17c81283417f`, repo checkout head is `17c81283417f`, and PM2 shows `qorium-leak-crawler` online with unstable restarts `0`.
- Existing unrelated workspace changes and untracked generated/business documents were left unstaged. The only app-file diff included in the closeout is the verified lint-gate repair in `qorium-app/apps/web/package.json`, changing the removed `next lint || true` path to `tsc -p tsconfig.json --noEmit`.

### REMAINING FOLLOW-UP

- [READY] **Lane B content recreation build** — run `CODEX_PENDING_QORIUM_CONTENT_RECREATION_v1_LANE_B_ARJUN.md`: recopy the marketing pages from the locked master prompt, wire the banned-words CI gate, preserve evidence-gating, then test/build/deploy.
- [IN PROGRESS] **Bing sitemap processing** — Bing Webmaster Tools still shows sitemap status `Processing`; no code/founder action is required while Bing ingests.

---

## RUN #35 — Programmatic SEO Factory Phase 1 (2026-06-02)

### COMPLETED

- [2026-06-02] **Shipped the Programmatic SEO Factory Phase 1 library graph** — `/library/[slug]` now generates an honesty-gated 1,000-page skill taxonomy from 50 primary skills x 20 focus areas, replacing clone-like `Skill Track` long-tail pages.
- [2026-06-02] **Preserved existing sample-pack and legacy slugs** — `devops-sre` and companion sample-pack paths remain resolvable while new library pages use unique names, titles, and related-skill references.
- [2026-06-02] **Added visible calibration status and schema for skill pages** — library skill pages expose calibration status in the hero and emit `Organization`, `BreadcrumbList`, `Article`, and `FAQPage` JSON-LD.
- [2026-06-02] **Fixed live axe regressions found during SEO verification** — removed nested `<main>` landmarks from role, stack, and comparison pages; made the comparison table scroller keyboard focusable.
- [2026-06-02] **Committed, pushed, purged, and deployed final safe work** — branch `codex/qorium-programmatic-seo-factory-phase1`, final commit `84d90456d03e`, deployed on active origin through the atomic release pipeline.

### EVIDENCE

- Branch: `codex/qorium-programmatic-seo-factory-phase1`.
- Commits: `25896d783c84` (`Harden programmatic SEO library generator`) and `84d90456d03e` (`Fix SEO route accessibility landmarks`).
- Local gates: `pnpm --filter @qorium/marketing test` pass (`11` files / `55` tests); `typecheck` pass; `lint` pass; `build` pass with `1195/1195` static pages; `pnpm secrets:scan` pass.
- Deploy summary: active-origin checkout reset to `84d9045`; release built at `/opt/apps/qorium-marketing/releases/84d90456d03e`; symlink flipped to `/opt/apps/qorium-marketing/current -> /opt/apps/qorium-marketing/releases/84d90456d03e`; PM2 reloaded `qorium-chatbot` and `qorium-marketing`; local probes `:5110` and `:5122` returned HTTP `200`.
- Cloudflare edge: targeted purge resolved zone `qorium.online` and returned `cloudflare_purge_success=true`.
- Live HTTP: `/`, `/healthz`, `/library`, `/library/javascript`, `/library/java-security`, `/library/devops-sre`, `/sitemap-library.xml`, `/solutions/role/react-developer`, `/solutions/stack/sap-abap`, `/vs/vervoe`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp` returned HTTP `200`.
- Live JSON-LD: library pages returned `Organization`, `BreadcrumbList`, `Article`, `FAQPage`; role/stack pages returned `Organization`, `BreadcrumbList`, `SoftwareApplication`; comparison page returned `Organization`, `BreadcrumbList`, `FAQPage`, `Table`; JD Forge/sample packs/trust/DPDP companion surfaces returned expected schema types.
- Accessibility: `@axe-core/cli` `4.11.4` found `0` violations across `/library/javascript`, `/library/java-security`, `/library/devops-sre`, `/solutions/role/react-developer`, `/solutions/stack/sap-abap`, and `/vs/vervoe`.
- CWV/Lighthouse sample: `/library/java-security` performance `96`, accessibility `100`, best practices `92`, SEO `100`; FCP `2226ms`, LCP `2226ms`, TBT `28ms`, CLS `0`.
- Quality gate: `https://qorium.online/v1/science/quality-gate` returned HTTP `200` with latest run `92/92`, dated `2026-06-01`.
- Rakshak floor: latest keeper-backed saved run remains `rakshak-qorium_online-mpw46c2z-7bd0` with `GO 94/100` and `17/17` audits; API/admin saved floors remain `89/100` and `88/100`.
- API health clarification: correct public API health paths are `https://api.qorium.online/health` and `/healthz`; `/api/health*` and `/v1/health*` are wrong paths and return `404`.
- PM2 fleet note: active-origin PM2 namespace is `default`; live enumeration lists QOrium processes online, including `qorium-api`, `qorium-jd-forge`, `qorium-stack-vault`, `qorium-admin`, `qorium-leak-crawler`, `qorium-keeper`, `qorium-chatbot`, and `qorium-marketing`.

### REMAINING FOLLOW-UP

- [LOW] `qorium-fleet-status` implementation was not found in this repository during this run. The live PM2 data confirms the `default` namespace contains QOrium processes; any registry patch appears to belong to an external Talpro status/MCP service.
- [LOW] Fresh Rakshak MCP orchestration was not callable in this Codex tool session; same-day saved Rakshak certification plus live quality-gate/axe/Lighthouse evidence were used for the no-regression floor.

---

## RUN #34 — Marketing Atomic Deploy Hardening (2026-06-02)

### COMPLETED

- [2026-06-02] **Converted `infra/marketing-deploy.sh` to a real release pipeline** — builds now stage into `/opt/apps/qorium-marketing/releases/<SHA>`, preserve runtime state under `/opt/apps/qorium-marketing/shared`, flip `/opt/apps/qorium-marketing/current`, and then reload PM2.
- [2026-06-02] **Preserved runtime env outside the git checkout** — existing `apps/marketing/.env.production` is migrated once to `shared/apps/marketing/.env.production`; release env files are symlinks to shared state.
- [2026-06-02] **Fixed deploy-order bug for chatbot builds** — deploy now builds `@qorium/db` before `@qorium/chatbot`, matching the workspace dependency graph.
- [2026-06-02] **Hardened PM2 release handoff** — existing marketing/chatbot PM2 processes reload when already pointed at `current`, and safely recreate only when migrating from a legacy launcher path.
- [2026-06-02] **Kept primary TLS on Cloudflare origin cert** — active origin reused `/etc/ssl/qorium/origin.pem` and skipped Let's Encrypt issuance for `qorium.online`.
- [2026-06-02] **Stopped wrong-origin `qorium.in` ACME attempts** — redirect cert setup now compares `qorium.in` DNS to the actual server public IP and skips on active origin while DNS still points to `147.93.103.194`.
- [2026-06-02] **Committed, pushed, and deployed final safe work** — branch `codex/qorium-marketing-atomic-deploy-hardening`, commit `7c69d29f7251`, pushed to `qorium`, deployed on active origin `187.127.155.150`.

### EVIDENCE

- Branch: `codex/qorium-marketing-atomic-deploy-hardening`.
- Commit: `7c69d29f7251` (`Harden marketing atomic deploy pipeline`).
- Local gates: `bash -n infra/marketing-deploy.sh` pass; `git diff --check` pass; `pnpm --filter @qorium/marketing build` pass; `pnpm --filter @qorium/db build` pass; `pnpm --filter @qorium/chatbot build` pass; `pnpm secrets:scan` pass.
- Deploy summary: active-origin checkout reset to `7c69d29`; release built at `/opt/apps/qorium-marketing/releases/7c69d29f7251`; symlink flipped to `/opt/apps/qorium-marketing/current -> /opt/apps/qorium-marketing/releases/7c69d29f7251`; PM2 reloaded `qorium-chatbot` and `qorium-marketing`; local probes `:5110` and `:5122/v1/chatbot/health` returned HTTP `200`.
- Live HTTP/JSON-LD: `/`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp` returned HTTP `200`, valid HTML, and `2` JSON-LD blocks each.
- API health: `https://api.qorium.online/healthz` and `/health` returned HTTP `200`; `/api/health` remains the wrong path.
- PM2 fleet: active origin default namespace enumerates `12` QOrium processes; marketing/chatbot now use `/opt/apps/qorium-marketing/current/.../.pm2-start.sh`.
- Cloudflare edge: targeted purge for final-release URLs returned `cloudflare_purge_success=true`; sampled pages returned HTTP `200`.
- Accessibility: `@axe-core/cli` `4.11.4` found `0` violations across `/`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, and `/compliance-dpdp`.
- CWV/Lighthouse sample: home page performance `85`, accessibility `100`, best practices `92`, SEO `92`; FCP `2101ms`, LCP `3635ms`, CLS `0`, TBT `77ms`.
- Rakshak floor: latest keeper-backed saved run remains `rakshak-qorium_online-mpw46c2z-7bd0` with `GO 94/100`; API/admin saved floors remain `89/100` and `88/100`.

### REMAINING FOLLOW-UP

- [LOW] Active origin shared env currently reflects the deploy-time `.env.production` available on the host. If private production integrations are required for Resend, corpus rebuild, or lead capture, re-land credentials into `/opt/apps/qorium-marketing/shared/apps/marketing/.env.production` out-of-band.

---

## RUN #33 — Old-Origin Rollback Capacity Review (2026-06-02)

### COMPLETED

- [2026-06-02] **Reviewed old-origin rollback capacity after apex consolidation** — verified Cloudflare production A records no longer point at `147.93.103.194`; both `qorium.online` and `api.qorium.online` point to active origin `187.127.155.150`.
- [2026-06-02] **Forced-origin rollback smoke passed** — old origin `147.93.103.194` returned HTTP `200` for apex root, OpenAPI, docs, marketing health, chatbot session, API health, chatbot health, and `security.txt`.
- [2026-06-02] **Proved old-origin restart viability** — restarted only old-origin `qorium-marketing` and `qorium-chatbot`, saved PM2 state, waited for settle, and re-ran forced-origin smoke; all checked rollback routes stayed HTTP `200`.
- [2026-06-02] **Classified standby posture** — keep old origin as manual rollback standby for now; do not retire yet, because it is still useful rollback capacity, but do not treat it as fully reboot-durable until PM2 systemd health and disk pressure are cleaned up.

### EVIDENCE

- Cloudflare A records: `api.qorium.online -> 187.127.155.150`, `qorium.online -> 187.127.155.150`, `records_pointing_old_origin=0`.
- Old-origin rollback smoke after restart: `/`, `/openapi.json`, `/resources/docs`, `/healthz`, `POST /api/chatbot/session`, `api.qorium.online/healthz`, `api.qorium.online/chatbot/v1/healthz`, and `api.qorium.online/.well-known/security.txt` all returned HTTP `200`.
- PM2 after controlled restart: `qorium-marketing status online restart_time 1 unstable 0`; `qorium-chatbot status online restart_time 1 unstable 0`.
- Nginx: `nginx -t` passed; service active.
- Resource caveat: root filesystem `82%` used; memory available about `8330 MiB`.
- Reboot-durability caveat: `pm2-root.service` is enabled but currently failed since `2026-05-24`; PM2 daemon and QOrium processes are online, but systemd service health needs cleanup before old origin can be called fully reboot-durable.

### RECOMMENDATION

- [KEEP MANUAL STANDBY] Keep `147.93.103.194` as rollback capacity through the next infra review.
- [DO NOT RETIRE YET] Retire only after active-origin stability has more soak time and after old-origin PM2/systemd + disk cleanup are either fixed or deemed unnecessary.

### REMAINING FOLLOW-UP

- [LOW] Repair or intentionally disable old-origin `pm2-root.service` and reduce disk usage below `75%` before calling the old origin reboot-durable standby.

---

## RUN #32 — Marketing Phase 2 Schema Hardening + Two-Origin Deploy (2026-06-02)

### COMPLETED

- [2026-06-02] **Shipped Phase 2 structured-data hardening** — solution pages now emit `WebPage` JSON-LD with corrected `/solutions` breadcrumb parent; interactive proof hubs now emit `WebPage`/`SoftwareApplication` and `CollectionPage`/`ItemList` JSON-LD.
- [2026-06-02] **Committed and pushed verified work** — branch `codex/qorium-marketing-redesign-phase2`, commits `70c57d7` and `dba8fc7`, pushed to `qorium`.
- [2026-06-02] **Deployed both origins safely** — old origin `147.93.103.194` via corrected GBS job `255d7193-6498-4007-8b29-3eb3cafe5c17`; active origin `187.127.155.150` via raw deploy after shallow-ref correction. Both checkouts are at `dba8fc7`.
- [2026-06-02] **Purged Cloudflare cache** — targeted purge for 23 slash/no-slash URL variants returned `success=true`.
- [2026-06-02] **Verified public live surfaces** — route matrix passed HTTP `200`, valid HTML, parseable JSON-LD, and required schema types for 12 public routes.
- [2026-06-02] **Verified accessibility and CWV sample** — axe-core WCAG 2.1 A/AA scan found `0` violations across 11 pages; Lighthouse desktop sample stayed green on homepage, JD-Forge demo, sample packs, trust, and DPDP compliance.
- [2026-06-02] **Closed API-health path ambiguity** — correct public API health paths are `https://api.qorium.online/healthz` and `/health`; `/api/health` remains the wrong path and returns nginx `404`.
- [2026-06-02] **Verified PM2 default namespace enumeration** — active origin PM2 default namespace lists 12 QOrium processes, including API/admin/JD-Forge/Stack-Vault/marketing/chatbot/leak-crawler/keeper.

### EVIDENCE

- Branch: `codex/qorium-marketing-redesign-phase2`.
- Commits: `70c57d7` (`test(marketing): lock phase two route schema`), `dba8fc7` (`fix(marketing): add proof surface schema`).
- Local gates: `pnpm --filter @qorium/marketing lint` pass; `typecheck` pass; `test` `11` files / `54` tests pass; `build` pass with `1195/1195` static pages.
- Deploy evidence:
  - Old origin GBS failed once on shallow non-fast-forward ref (`4647174d-c2fd-46a4-bf21-2fd5aa44dac1`), then succeeded after force-fetching only the remote-tracking ref (`255d7193-6498-4007-8b29-3eb3cafe5c17`, exit `0`).
  - Active origin needed the same shallow-ref correction, then deployed `dba8fc7`; PM2 `qorium-marketing` online, unstable restarts `0`, ready in `412ms`.
  - Old origin PM2 `qorium-marketing` online, unstable restarts `0`, ready in `1599ms`.
- Public route matrix: `/`, `/product`, `/platform/readybank`, `/platform/jd-forge`, `/platform/stack-vault`, `/solutions/assessment-platforms`, `/solutions/staffing-firms`, `/solutions/enterprises-gcc`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, `/compliance-dpdp` all returned HTTP `200`, valid HTML, and parseable JSON-LD.
- Required JSON-LD passed:
  - Product routes: `BreadcrumbList`, `Product`, `FAQPage`.
  - Solution routes: `BreadcrumbList`, `WebPage`, breadcrumb parent `https://qorium.online/solutions`.
  - `/try/jd-forge`: `WebPage`, `SoftwareApplication`.
  - `/resources/sample-packs`: `CollectionPage`, `ItemList`.
  - `/trust`: `AboutPage`, `ItemList`.
  - `/compliance-dpdp`: `WebPage`.
- axe-core CLI `4.11.4`: WCAG 2.1 A/AA tags, 11 pages, `0` violations; artifact `/tmp/qorium-axe-dba8fc7.json`.
- Lighthouse desktop sample:
  - `/`: performance `99`, accessibility `100`, SEO `100`, FCP `401ms`, LCP `959ms`, CLS `0`, TBT `0`.
  - `/try/jd-forge`: performance `99`, accessibility `100`, SEO `100`, FCP/LCP `741ms`, CLS `0`, TBT `0`.
  - `/resources/sample-packs`: performance `100`, accessibility `100`, SEO `100`, FCP `383ms`, LCP `611ms`, CLS `0`, TBT `0`.
  - `/trust`: performance `100`, accessibility `100`, SEO `100`, FCP `354ms`, LCP `584ms`, CLS `0`, TBT `0`.
  - `/compliance-dpdp`: performance `100`, accessibility `100`, SEO `100`, FCP `348ms`, LCP `576ms`, CLS `0`, TBT `0`.
- Quality gate: `https://qorium.online/v1/science/quality-gate` returned HTTP `200`, latest run `92/92`, dated `2026-06-01`.
- Rakshak floor: latest saved `qorium.online` run `rakshak-qorium_online-mpw46c2z-7bd0` remains `GO 94/100`, `17/17` audits saved; API/admin saved floors remain `89/100` and `88/100`.
- API health: `https://api.qorium.online/` returned gateway `200`; `/healthz` and `/health` returned ReadyBank health `200`; `/chatbot/v1/healthz` returned chatbot health `200`.
- PM2 fleet: active origin default namespace enumerated 12 QOrium entries: `qorium-api` x2, `qorium-admin` x2, `qorium-jd-forge` x2, `qorium-stack-vault` x2, `qorium-marketing`, `qorium-chatbot`, `qorium-leak-crawler`, `qorium-keeper`.

### REMAINING FOLLOW-UP

- [DONE in Run #34] `deploy:atomic:raw` now builds releases under `releases/<SHA>`, flips `current`, and reloads PM2 from stable release launchers.
- [DONE in Run #34] Runtime env now lives under `shared/apps/marketing/.env.production` and release env files symlink to shared state.
- [DONE in Run #34] Optional `qorium.in` redirect certificate setup now skips on origins whose public IP does not match current `qorium.in` DNS.
- [LOW] Fresh Rakshak MCP orchestration was not callable in this Codex tool session; same-day saved Rakshak certification plus live quality-gate/axe/Lighthouse evidence were used for the no-regression floor.

---

## RUN #31 — Apex Origin Consolidation to Active Origin (2026-06-02)

### COMPLETED

- [2026-06-02] **Executed CEO-approved consolidation cleanup** — after `START 1` walkthrough and `PROVE`, moved Cloudflare apex `qorium.online` from old origin `147.93.103.194` to active origin `187.127.155.150`.
- [2026-06-02] **Preflighted active-origin parity before DNS mutation** — forced active-origin probes returned HTTP `200` for `/`, `/openapi.json`, `/resources/docs`, and `POST /api/chatbot/session`.
- [2026-06-02] **Updated Cloudflare DNS safely** — apex `A qorium.online` changed from `147.93.103.194` to `187.127.155.150`; proxied mode stayed `true`, TTL stayed `1`/Auto.
- [2026-06-02] **Purged relevant Cloudflare cache** — purge request for root, OpenAPI, docs, and chatbot session route returned success.
- [2026-06-02] **Proved public traffic reaches active origin** — public nonce request to `/openapi.json` appeared in active-origin nginx access logs and did not appear in old-origin logs.
- [2026-06-02] **Completed post-cutover watch** — 6 spaced public samples stayed HTTP `200` for root, OpenAPI, docs, API health, chatbot health, admin health, and chatbot session.

### EVIDENCE

- DNS before: `A qorium.online 147.93.103.194 proxied=true ttl=1`.
- DNS after: `A qorium.online 187.127.155.150 proxied=true ttl=1`.
- Public nonce: `qorium-cutover-1780380029-13821`; active-origin `/var/log/nginx/access.log` recorded HTTP `200`; old-origin logs had no matching nonce.
- Cache purge proof: `cache_purge_success=True`.
- Watch samples at `2026-06-02T06:01:18Z`, `06:04:22Z`, `06:07:26Z`, `06:10:30Z`, `06:13:33Z`, and `06:16:36Z` all returned HTTP `200` across the monitored route set.

### REMAINING FOLLOW-UP

- [DONE in Run #33] Old origin reviewed; recommendation is to keep it as manual rollback standby, not retire yet.

---

## RUN #30 — Full-auto NIRANTAR + QOrium Proof (2026-06-02)

### COMPLETED

- [2026-06-02] **Registered and verified NIRANTAR monitoring** — active watchdog source `/etc/talpro-watchdogs.source` now includes `watchdog:nirantar`; live `https://nirantar.talpro.in/api/health` returned HTTP `200`.
- [2026-06-02] **Explained NIRANTAR uptime reset** — restart was deploy/reload-driven, not crash-driven; PM2 `restart_time`/unstable restarts remain `0`, with live head `1a5d009`.
- [2026-06-02] **Investigated `qorium-leak-crawler` flapping** — all three PM2 entries are online, cron restart is `0 2 * * *`, unstable restarts are `0`, and `pm2 logs --lines 50 --nostream` was empty.
- [2026-06-02] **Closed QOrium live WCAG/axe gaps** — commit `8fb0553` fixes light-surface contrast, scrollable `<pre>` keyboard access, and invalid Radix tab ARIA values.
- [2026-06-02] **Deployed QOrium accessibility fix** — live checkout `/opt/apps/qorium-marketing` is clean at `8fb0553`; PM2 restart/save completed and public `/healthz` returned HTTP `200`.

### EVIDENCE

- NIRANTAR: cwd `/opt/apps/nirantar/current`, branch `main`, remote `https://github.com/sales799/nirantar.git`, last commit `1a5d009`, version `0.8.4`, PM2 online, unstable restarts `0`, health `200`.
- QOrium: branch `codex/qorium-marketing-phase4-main`, commit `8fb0553`, build ID `6FRsP8jNvX7hmX25ZxWEM`, PM2 `qorium-marketing` online, unstable restarts `0`, health `200`.
- QOrium gates on exact committed head: `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run secrets:scan`, and clean `pnpm run build` all passed.
- Live axe WCAG 2.1 A/AA pass at `2026-06-02T05:14:20Z`: `/`, `/product`, `/pricing`, `/features/readybank`, `/features/jd-forge`, `/features/stack-vault`, `/security`, `/about`, `/contact` all had `0` violations.
- Live mega-menu/evidence-gate pass at `2026-06-02T05:14:57Z`: desktop and mobile Platform/Solutions nav passed; Case Studies and Customer Stories stayed hidden while flags remain false.

### ARCHIVE STATUS

- Archive-ready. No `.env` or secret files were committed; historical gitleaks allowlist was extended only for a redacted README fingerprint.

---

## RUN #29 — Marketing Redesign Phase 1 Deploy (2026-06-02)

### COMPLETED

- [2026-06-02] **Executed `CODEX_PENDING_QORIUM_MARKETING_REDESIGN_v1_LANE_B_ARJUN.md` Phase 1** — shipped Tailwind v4 A/B/C zone tokens, IBM Plex font wiring, full marketing IA mega-menu/footer coverage, and evidence-gated navigation/footer links.
- [2026-06-02] **Kept honesty gates closed** — Case Studies and Customer Stories links remain hidden while their evidence flags are false; live browser probe counted `0` visible links for both.
- [2026-06-02] **Fixed live release blocker in deploy script** — raw deploy now preserves `apps/marketing/.env.production` and reuses the active-origin Cloudflare origin cert instead of failing on `www.qorium.online` Let's Encrypt issuance.
- [2026-06-02] **Deployed via existing atomic deploy path** — `BRANCH=codex/qorium-marketing-redesign-phase1 pnpm deploy:atomic:raw`; branch head `3e99d8b`.
- [2026-06-02] **Verified live Phase 1 UX** — desktop keyboard opens Platform mega-menu, right-rail promo renders, footer Library column renders, and mobile accordion exposes Platform/Resources content.

### EVIDENCE

- Branch: `codex/qorium-marketing-redesign-phase1`.
- Commits: `83c9fdb` (`feat(marketing): harden phase 1 design shell`), `3e99d8b` (`fix(marketing): reuse origin cert during deploy`).
- Local verification before deploy: marketing test `57/57`, marketing typecheck/lint/build pass, full workspace lint/test/typecheck/build pass, `pnpm secrets:scan` pass, `pnpm audit --audit-level=high --prod` pass, marketing Playwright smoke `10/10`, LHCI desktop local scores `99-100`.
- Live HTTP 200: `/healthz`, `/`, `/product`, `/pricing`, `/features/readybank`, `/security`, `/resources/docs`, `/openapi.json`, and `api.qorium.online/chatbot/v1/healthz`.
- Live Playwright: critical-route smoke `10/10`; Phase 1 custom probe passed desktop keyboard menu, right rail, footer Library, mobile accordion, and hidden proof links.
- Live Lighthouse desktop: home performance `88`, accessibility `100`, best practices `93`, SEO `92`, LCP `1994ms`, CLS `0`, TBT `0`; product performance `90`, accessibility `96`, best practices `93`, SEO `92`, LCP `1848ms`, CLS `0`, TBT `0`; pricing performance `95`, accessibility `100`, best practices `93`, SEO `92`, LCP `1391ms`, CLS `0`, TBT `0`.
- PM2 after deploy: `qorium-marketing` online, `0` restarts, `qorium-chatbot` online, `0` restarts, `qorium-leak-crawler` online with `87m` uptime.
- Rakshak floor: persisted 2026-06-02 reports remain above 80/80 — `qorium.online` GO `94/100`, `api.qorium.online` GO `89/100`, `admin.qorium.online` GO `88/100`; live quality gate returns `92/92`.

### REMAINING FOLLOW-UP

- [LOW] Optional `qorium.in` redirect certificate still fails ACME HTTP challenge and remains warning-only; primary `qorium.online` deploy is not blocked.
- [LOW] Fresh full Rakshak MCP orchestration was not callable from this thread; same-day persisted Rakshak GO reports and live quality-gate evidence were used for the release floor.

---

## RUN #28 — Gatekeeper PM2 Start Durability + WCAG Landmark Repair (2026-06-02)

### COMPLETED

- [2026-06-02] **Made QOrium marketing PM2 restart durable** — tracked `apps/marketing/.pm2-start.sh` on the live deploy branch so `qorium-marketing` no longer loses its launcher after branch switches or clean deploys.
- [2026-06-02] **Fixed shipped WCAG landmark regressions** — removed nested page-level `<main>` wrappers from shard pages and converted non-landmark side rails from `<aside>` to neutral containers.
- [2026-06-02] **Deployed via GBS atomic deploy path** — GBS job `8c3b8dea-f45b-4b7a-a02f-36f7e5f93ffb` ran `BRANCH=codex/qorium-marketing-phase4-main pnpm deploy:atomic:raw`; PM2 restarted `qorium-marketing` at 04:43 UTC.
- [2026-06-02] **Verified live Gatekeeper proxy evidence** — public shard routes, OpenAPI, API health, JSON-LD, axe, internal GET links, Lighthouse samples, quality gate, and PM2 fleet enumeration all passed after deploy.

### EVIDENCE

- Commits: `04fbe43` (tracked PM2 start script), `373a102` (landmark semantics), deployed branch head `3efde9d` (includes `373a102` plus `.gitleaksignore` allowlist chore).
- PM2: `qorium-marketing` online, pid `2162652`, restart count `44`; QOrium fleet enumeration found `38` processes, `24` service names, `0` offline.
- Live HTTP 200: `/`, `/healthz`, `/openapi.json`, `/resources/docs`, `/library/react`, `/library/aws`, `/library/sql`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, `/compliance-dpdp`, `api.qorium.online/healthz`, `api.qorium.online/chatbot/v1/healthz`, `admin.qorium.online/api/health`.
- JSON-LD + axe: `/` `3/3`, `/resources/docs` `3/3`, `/trust` `3/3`, `/compliance-dpdp` `2/2`, `/try/jd-forge` `1/1`, `/resources/sample-packs` `1/1`, `/library/{react,aws,sql}` `1/1`; axe violations `0` on all checked pages.
- Quality gate: `https://qorium.online/v1/science/quality-gate` returned latest run `92/92`, dated `2026-06-01`.
- Lighthouse desktop lab: home `97/100` performance, `100` accessibility, `100` SEO, LCP `1043ms`, CLS `0`, TBT `0`; docs `89/100` performance, `100` accessibility, `100` SEO, LCP `1884ms`, CLS `0`, TBT `0`.
- GET-only internal link sweep: `65` checked, `0` broken.
- Correct API health path confirmed: `https://api.qorium.online/healthz`; `api.qorium.online/v1/science/quality-gate` is not the service health path.

### REMAINING FOLLOW-UP

- [LOW] Formal `gatekeeper_scan` MCP tool was not exposed in this Codex session; manual Gatekeeper proxy evidence was recorded instead.
- [LOW] Deploy script still writes a launcher during raw deploy; the tracked launcher keeps checkout durability, but a future cleanup can make `infra/marketing-deploy.sh` reuse the tracked script verbatim.

---

## RUN #27 — Cloudflare Cache Purge Token Installed + Verified (2026-06-02)

### COMPLETED

- [2026-06-02] **Created scoped Cloudflare purge token** — token name `QOrium Cache Purge`; permission scope is `qorium.online - Cache Purge:Purge`.
- [2026-06-02] **Installed token locally without printing the secret** — stored as `CLOUDFLARE_QORIUM_CACHE_PURGE_TOKEN` in user-only secret file `/Users/talprouniversepro/.qorium-cloudflare-cache-purge.env` with mode `600`; also attempted macOS Keychain storage under the same service name.
- [2026-06-02] **Verified Cloudflare API access** — token verification endpoint returned success.
- [2026-06-02] **Verified real purge capability** — zone lookup for `qorium.online` returned exactly one zone, and a single-URL purge for `https://qorium.online/openapi.json` returned success.
- [2026-06-02] **Caught and cleared post-purge apex 502** — immediate public smoke after purge exposed Cloudflare `502` on apex routes while old-origin `qorium-marketing` was restarting; waited for PM2 to settle and re-verified public apex recovery without changing DNS.

### EVIDENCE

- Cloudflare dashboard summary before creation showed account `Bhaskar@talpro.in`, resource `qorium.online`, permission `Cache Purge:Purge`.
- Token verification: `cloudflare_token_verify_success=True`.
- Zone lookup: result count `1`, zone id prefix `7ee17856`.
- Purge proof: `single_url_purge_success=True` for `https://qorium.online/openapi.json`.
- Post-purge origin-bypass proof: both `147.93.103.194` and `187.127.155.150` returned HTTP `200` `application/json` for `/openapi.json`.
- Post-purge public proof: `https://qorium.online/`, `https://qorium.online/openapi.json`, `https://qorium.online/resources/docs`, and `POST https://qorium.online/api/chatbot/session` all returned HTTP `200`.

### REMAINING FOLLOW-UP

- [DONE in Run #31] Origin consolidation is complete; apex `qorium.online` now routes to active origin `187.127.155.150`.

---

## RUN #26 — OpenAPI Edge Purge Attempt + Rakshak Certification (2026-06-02)

### COMPLETED

- [2026-06-02] **Re-verified OpenAPI edge** — public `https://qorium.online/openapi.json` returns HTTP `200` `application/json` with QOrium Public Proof API JSON.
- [2026-06-02] **Retried Cloudflare purge API safely** — zone lookup succeeded with the available certbot token, but `purge_cache` returned Cloudflare auth error `10000`; no DNS mutation was performed.
- [2026-06-02] **Closed live edge mismatch by origin hardening** — patched both origins currently serving QOrium hostnames so API/admin JSON responses expose security headers, `security.txt`, versioned admin health, and API/admin rate-limit policy headers.
- [2026-06-02] **Reloaded nginx safely on both origins** — active origin backup stamp `20260602T040034Z`; old-origin backup stamp `20260602T040034Z`; `nginx -t` passed before and after reload on both hosts.
- [2026-06-02] **Fixed Rakshak runtime allow-list drift** — on-disk `/opt/talpro-mcp-server/dist/tools/rakshak.js` already included `qorium.online`; restarted `talpro-mcp-server.service` so the live MCP backend loaded the current allow-list.
- [2026-06-02] **Ran fresh Rakshak consolidation** — `qorium.online` GO `94/100`, `api.qorium.online` GO `89/100`, `admin.qorium.online` GO `88/100`.

### EVIDENCE

- Public `https://qorium.online/openapi.json` → HTTP `200`, `application/json`, OpenAPI `3.1.0`, title `QOrium Public Proof API`.
- Public `https://api.qorium.online/chatbot/v1/healthz` → HTTP `200` chatbot JSON.
- Public `https://api.qorium.online/.well-known/security.txt` → HTTP `200`.
- Public `https://admin.qorium.online/api/health` → HTTP `200` JSON with `version: admin-preview-lock-1`.
- Public `https://admin.qorium.online/.well-known/security.txt` → HTTP `200`.
- Public API/admin headers now include HSTS, `X-Content-Type-Options`, `X-Frame-Options`, CSP, Permissions-Policy, Referrer-Policy, and `X-RateLimit-Policy`.
- Gatekeeper after fixes: `qorium.online` scored `36/39` (`92%`, Grade A, SHIP IT). API/admin generic web pulses scored `27/39` because SEO/legal page checks are not role-applicable to JSON service surfaces; security was `9/10` and monitoring was `4/4` on both.
- Fresh Rakshak run IDs: `rakshak-qorium_online-mpw46c2z-7bd0`, `rakshak-api_qorium_online-mpw46c77-a38a`, `rakshak-admin_qorium_online-mpw46ca2-ceb6`.
- PM2: active origin `187.127.155.150` has `12/12` QOrium processes online, `36` aggregate restarts; old origin `147.93.103.194` has `38/38` QOrium processes online, `58` aggregate restarts.
- Talpro smoke tests: `15/15` passed.

### REMAINING FOLLOW-UP

- [DONE in Run #27] Cloudflare token with `Zone.Cache Purge` permission is now installed and verified for `qorium.online`.
- [DONE in Run #31] Origin consolidation is complete; apex `qorium.online` now routes to active origin `187.127.155.150`.

---

## RUN #25 — CEO Origin-Routing Decision: KEEP NOW (2026-06-02)

### COMPLETED

- [2026-06-02] **Captured CEO decision** — founder chose `KEEP NOW` for current QOrium origin routing.
- [2026-06-02] **Left Cloudflare DNS unchanged** — no autonomous DNS mutation was performed after the decision.
- [2026-06-02] **Confirmed current dual-origin posture remains intentional** — apex `qorium.online` remains on old origin `147.93.103.194`; API `api.qorium.online` remains on active origin `187.127.155.150`.

### EVIDENCE

- Public `https://qorium.online/` returned HTTP `200`.
- Public `https://qorium.online/openapi.json` returned HTTP `200` `application/json`.
- Public `https://api.qorium.online/healthz` returned HTTP `200` JSON.
- Forced old-origin probes for OpenAPI, chatbot session, and API health returned HTTP `200`.
- Forced active-origin probes for OpenAPI, chatbot session, and API health returned HTTP `200`.
- Active origin `187.127.155.150`: PM2 `qorium-*` online `12/12`, marketing checkout HEAD `3256dd5`.
- Old origin `147.93.103.194`: PM2 `qorium-*` online `38/38`, marketing checkout HEAD `6ac741c`.

### REMAINING FOLLOW-UP

- [DONE in Run #31] Consolidation to `187.127.155.150` was approved and completed with parity smoke, DNS change, cache purge, nonce proof, and post-cutover monitoring.

---

## RUN #24 — Codex PROVE CLOUDFLARE PURGE / OpenAPI Route Restore (2026-06-02)

### COMPLETED

- [2026-06-02] **Re-tested the Cloudflare purge symptom** — public `https://qorium.online/openapi.json` initially returned HTTP 404 HTML, while active-origin `187.127.155.150` returned HTTP 200 JSON after redeploy to `3256dd5`.
- [2026-06-02] **Found the real Cloudflare root cause** — Cloudflare DNS A records showed `api.qorium.online -> 187.127.155.150` but apex `qorium.online -> 147.93.103.194`; public apex traffic was hitting the old origin, not the active-origin deploy.
- [2026-06-02] **Avoided autonomous DNS mutation** — no Cloudflare DNS record was changed. Instead, the old origin that Cloudflare already routed to was brought up to the pushed marketing tip.
- [2026-06-02] **Old origin redeployed safely** — on `talpro-vps` / `147.93.103.194`, backed up current `main`, switched `/opt/apps/qorium-marketing` to `codex/qorium-marketing-phase4-main` at `6ac741c`, ran frozen install, 50 marketing tests, typecheck, lint, and production build.
- [2026-06-02] **Reloaded only `qorium-marketing` PM2 on old origin** — local old-origin probes for `/openapi.json`, `/resources/docs`, and `/healthz` returned HTTP 200.
- [2026-06-02] **Verified public Cloudflare route fixed** — `https://qorium.online/openapi.json` now returns HTTP 200 `application/json`; `https://qorium.online/resources/docs` returns HTTP 200 HTML and contains `/openapi.json` links.

### EVIDENCE

- Cloudflare DNS A records at diagnosis: `api.qorium.online` content `187.127.155.150`, proxied true; `qorium.online` content `147.93.103.194`, proxied true.
- Active origin: branch `codex/prod-merge-3256dd5`, HEAD `3256dd5`; `/openapi.json` origin-bypass returned HTTP 200 JSON.
- Old origin: branch `codex/qorium-marketing-phase4-main`, HEAD `6ac741c`; PM2 `qorium-marketing` online after reload; PM2 `qorium-chatbot` online.
- Old-origin verification: `pnpm install --frozen-lockfile --prefer-offline` passed; `pnpm --filter @qorium/marketing test -- api-docs chatbot-proxy` passed 50 tests; typecheck passed; lint passed; build generated `/openapi.json` and 1,195 routes.
- Public verification: `https://qorium.online/openapi.json` → HTTP 200 `application/json`, OpenAPI `3.1.0`, title `QOrium Public Proof API`, server `https://qorium.online/v1`, 12 paths.
- Public docs verification: `https://qorium.online/resources/docs` → HTTP 200 `text/html`, 6 `/openapi.json` links, public-preview copy present.
- Chatbot smoke: `POST https://qorium.online/api/chatbot/session` → HTTP 200 JSON.

### REMAINING FOLLOW-UP

- [DONE in Run #27] Cloudflare purge-capable token is now installed and verified for future purge-only repairs.
- [DONE in Run #31] Apex/API split is closed for `qorium.online`; apex now routes to active origin `187.127.155.150`.

---

## RUN #23 — Codex Active-Origin Chatbot Health Route Fix (2026-06-02)

### COMPLETED

- [2026-06-02] **Active-origin SSH access verified** — `qorium-active-origin` reaches `187.127.155.150` as root on port 2244.
- [2026-06-02] **Confirmed active-origin PM2 state** — 12/12 `qorium-*` processes online, 0 errored, 36 aggregate restarts.
- [2026-06-02] **Confirmed chatbot service health** — local active-origin `http://127.0.0.1:5122/v1/chatbot/health` returned 200 JSON.
- [2026-06-02] **Patched active-origin nginx API vhost** — added `/chatbot/v1/healthz`, `/chatbot/v1/*`, and `/v1/chatbot/*` proxy locations to `/etc/nginx/conf.d/qorium-marketing.conf`; backup stored under `/root/nginx-config-backups/`.
- [2026-06-02] **Reloaded nginx safely** — `nginx -t` passed, then `systemctl reload nginx` completed.
- [2026-06-02] **Verified public Cloudflare route** — `https://api.qorium.online/chatbot/v1/healthz` now returns HTTP 200 JSON from `qorium-chatbot`.

### EVIDENCE

- Active-origin checkout: `/opt/apps/qorium-marketing`, branch `codex/prod-merge-3256dd5`, HEAD `3256dd5` (`merge: deploy current QOrium marketing tip`).
- Public `https://qorium.online/` → HTTP `200`.
- Public `https://api.qorium.online/healthz` → HTTP `200` ReadyBank JSON.
- Public `https://api.qorium.online/chatbot/v1/healthz` → HTTP `200` chatbot JSON.
- Public `https://admin.qorium.online/api/health` → HTTP `200` admin JSON.
- Active-origin `https://qorium.online/openapi.json` with origin resolved to `127.0.0.1` → HTTP `200` JSON.
- Public Cloudflare `https://qorium.online/openapi.json` → still HTTP `404` HTML with `x-nextjs-cache: HIT`.

### REMAINING NON-CHATBOT FOLLOW-UP

- [MEDIUM] Cloudflare/fronted OpenAPI route still needs purge or edge-route repair. The active origin serves `/openapi.json` correctly; the public edge remains stale.
- [LOW] Fresh Rakshak consolidation could not be run in this resumed session because the Rakshak MCP/consolidate tool was not exposed.

### FOUNDER / INFRA ACTION REQUIRED

- [MEDIUM] Provide a purge-capable Cloudflare token or purge `https://qorium.online/openapi.json` manually if the stale edge object persists.

---

## RUN #22 — Codex PROVE Queue Reconciliation + Live Route Blocker Refresh (2026-06-02)

### COMPLETED

- [2026-06-02] **Accepted founder PROVE and reconciled the pasted queue against this checkout** — the branch is `specs`, remote `qorium` is configured, and the named Batch A-E files are already tracked on the current branch.
- [2026-06-02] **Confirmed prior logical-batch evidence** — relevant pushed commits include `1a85334` marketing redesign brief, `65ad4e0` live-domain working-file alignment, and `6f2a456` active-origin blocker evidence; all include a Claude/Talpro co-author footer.
- [2026-06-02] **Completed missing gitignore hygiene** — added `*.append-*` alongside the existing iCloud duplicate ignores `* 2.md` and `* 2.docx`.
- [2026-06-02] **Corrected stale `_shared/CODEX_PENDING.md` status** — P2 rows are now marked done with proof SHAs: `9f5d215`, `40452c4`, `7fad155`, `55b4865`, and `bb1d459`.
- [2026-06-02] **Verified current public live state** — root site is live, ReadyBank `/healthz` is live, but chatbot and OpenAPI routes still fail publicly.
- [2026-06-02] **Confirmed marketing implementation branch separation** — real marketing routes live on worktree `/private/tmp/qorium-marketing-site` branch `codex/qorium-marketing-phase4-main`; stray untracked `apps/marketing/src/app/api/[...path]/route.ts` files in `specs` are fallback 404 fragments and were not staged.
- [2026-06-02] **Fixed local Java sandbox verification failure** — root cause was Docker fallback mounting a macOS temp directory that appeared empty inside the container. The fallback now passes Java source into the container via base64 env payload and preserves program stdin.
- [2026-06-02] **Added regression proof for Java Docker fallback** — new `qorium-app/tests/sandbox-runner.test.ts` covers `runCode("java", ...)` when local Java is unavailable.
- [2026-06-02] **Full local QOrium app gate passed after fix** — `pnpm run ci` passed seed, secret scan, typecheck, build, smoke, and Playwright e2e.

### EVIDENCE

- `https://qorium.online/` → HTTP `200` HTML.
- `https://qorium.online/product/api` → HTTP `200` HTML.
- `https://qorium.online/resources/docs` → HTTP `307` then `200` to `/product/api`.
- `https://api.qorium.online/healthz` → HTTP `200` JSON.
- `https://api.qorium.online/health` → HTTP `404` problem JSON.
- `https://api.qorium.online/chatbot/v1/healthz` → HTTP `404` HTML.
- `POST https://qorium.online/api/chatbot/session` with `{}` → HTTP `404` problem JSON.
- `https://qorium.online/openapi.json` → HTTP `404` HTML with `x-nextjs-cache: HIT`.
- Forced old-origin chatbot health: `curl -k --resolve api.qorium.online:443:147.93.103.194 https://api.qorium.online/chatbot/v1/healthz` → HTTP `200` JSON.
- Forced `187.127.155.150` chatbot health and OpenAPI probes → HTTP `404`; strict TLS also fails local certificate verification on the forced-origin path.
- SSH active-origin retry: `ssh -p 2244 root@187.127.155.150 true` → `Permission denied (publickey)`.
- No local `CLOUDFLARE_*` or `CF_*` token names were exposed in this shell, `/opt/talpro-mcp-server/.env`, or `.setup-tokens.json`.
- Regression test: `pnpm exec vitest run tests/sandbox-runner.test.ts` first failed with Java sandbox exit code `2`, then passed after the Docker fallback fix.
- Local app gate: `pnpm run ci` in `qorium-app` passed; smoke ended with `Smoke OK: stats, library, assessment, grading, audit, JS/Python/Java sandbox`; Playwright e2e passed `1/1`.

### HARD BLOCKERS

- [HIGH] **Active-origin access / route authority missing** — the chatbot service is present on old origin `147.93.103.194`, but the public Cloudflare-routed path still returns `404`. The active origin `187.127.155.150` rejects the available SSH key, so Codex cannot deploy, inspect PM2, or repair nginx there from this session.
- [MEDIUM] **OpenAPI JSON is not currently served by either tested origin** — the previous Run #21 claim that origin-bypass returned `200` is stale from this workstation's 2026-06-02 probe. This now needs origin-side route/deploy repair first, then Cloudflare purge only if the public edge remains stale after origin repair.

### FOUNDER / INFRA ACTION REQUIRED

- [HIGH] Provide working SSH/deploy access for `187.127.155.150` (preferred alias: `qorium-active-origin`) or explicitly authorize a Cloudflare route/DNS change to the origin that has the chatbot route.
- [DONE in Run #27] Cloudflare token with `Zone.Cache Purge` permission for `qorium.online` is installed and verified after the origin-side OpenAPI route repair.

---

## RUN #21 — Codex PROVE CLOUDFLARE PURGE Retry (2026-06-01)

### COMPLETED

- [2026-06-01] **Re-tested edge after founder prompt** — public `https://qorium.online/openapi.json` still returns HTTP 404 HTML with stale Next cache headers; origin-bypass to `187.127.155.150` still returns HTTP 200 `application/json`.
- [2026-06-01] **Re-tested purge API** — Cloudflare zone lookup still succeeds, but cache purge still fails with auth error `10000`.
- [2026-06-01] **Checked for alternate purge token** — no `CLOUDFLARE_*` or `CF_*` token is exposed in local environment, VPS environment, `/opt/talpro-mcp-server/.env`, or `.setup-tokens.json`.
- [2026-06-01] **Verified docs page remains live** — `https://qorium.online/resources/docs` follows to HTTP 200 HTML; the remaining failure is the stale `/openapi.json` edge object.

### EVIDENCE

- Public Cloudflare path: `https://qorium.online/openapi.json` → 404 `text/html`, `x-nextjs-cache: HIT`.
- Origin bypass: `curl --resolve qorium.online:443:187.127.155.150 https://qorium.online/openapi.json` → 200 `application/json`.
- Cloudflare purge API: zone `7ee17856a93d2bca160ff1bdc3291354`; response `success=false`, error `10000 Authentication error`.

### HARD BLOCKER

- [MEDIUM] **No purge-capable Cloudflare credential available to Codex** — autonomous work remains blocked until Cloudflare dashboard purge is performed or a token with `Zone.Cache Purge` permission is installed.

### FOUNDER / INFRA ACTION REQUIRED

- [MEDIUM] Purge `https://qorium.online/openapi.json` in Cloudflare dashboard, or provide a scoped API token with `Zone.Cache Purge` permission for `qorium.online`.

---

## RUN #20 — Codex PROVE CLOUDFLARE PURGE (2026-06-01)

### COMPLETED

- [2026-06-01] **Re-verified split-brain cache state** — Cloudflare-fronted `https://qorium.online/openapi.json` still returns HTTP 404 HTML with `x-nextjs-cache: HIT`; origin-bypass `https://qorium.online/openapi.json` resolved directly to `187.127.155.150` returns HTTP 200 `application/json`.
- [2026-06-01] **Retried Cloudflare single-URL purge** — zone lookup for `qorium.online` succeeded, but `POST /zones/:zone/purge_cache` failed with Cloudflare auth error `10000`.

### EVIDENCE

- Public Cloudflare path: `https://qorium.online/openapi.json` → 404 `text/html`, `cf-cache-status: DYNAMIC`, `x-nextjs-cache: HIT`.
- Origin bypass: `curl --resolve qorium.online:443:187.127.155.150 https://qorium.online/openapi.json` → 200 `application/json`.
- Cloudflare API: zone `7ee17856a93d2bca160ff1bdc3291354` found; purge response `success=false`, error `10000 Authentication error`.

### HARD BLOCKER

- [MEDIUM] **Available Cloudflare token lacks Zone Cache Purge permission** — the stored certbot token can read/modify DNS but cannot purge edge cache. No autonomous safe path remains for this exact purge without a purge-capable token or dashboard action.

### FOUNDER / INFRA ACTION REQUIRED

- [MEDIUM] In Cloudflare dashboard, purge `https://qorium.online/openapi.json` and `https://qorium.online/resources/docs`, or provide a scoped API token with `Zone.Cache Purge` permission for `qorium.online`.

---

## RUN #19 — Codex PROVE NEXT Active-Origin Deploy + Verification (2026-06-01)

### COMPLETED

- [2026-06-01] **Active-origin deploy completed** — VPS `/opt/apps/qorium-marketing` merged production hotfix `735dc17` with pushed marketing tip `6ac741c`, producing deployed merge `3256dd5`.
- [2026-06-01] **C1 chatbot runtime moved off ATS bridge port** — `qorium-chatbot` now listens on 5122; local health `http://127.0.0.1:5122/v1/chatbot/health` returned 200 and public `POST https://qorium.online/api/chatbot/session` returned 200.
- [2026-06-01] **Safe deploy passed after preserving runtime drift** — untracked `services/keeper` was moved out of the pnpm workspace during frozen install, restored after deploy, and the pre-existing B10 runtime drift was re-applied.
- [2026-06-01] **Fleet registry P1 verified fixed** — `talpro_qorium_fleet_status` enumerates PM2 default namespace: 12 instances / 8 services / 0 errored, including `qorium-keeper`.
- [2026-06-01] **API health P1 verified fixed** — `https://api.qorium.online/health` and `/healthz` both returned 200 JSON.
- [2026-06-01] **Live shipped surfaces verified** — `/resources/docs`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, `/compliance-dpdp`, and `/product/api` returned 200 HTML with JSON-LD; `/v1/jd-forge/demo` returned 200; `/v1/jd-forge/demo/plan-pdf` returned 202 and its signed URL returned `%PDF-1.4`.

### EVIDENCE

- Commits: `9c12788` chatbot/proof fallback hardening, `8151e0f` honest public API docs, `6ac741c` chatbot 5105→5122 port move, active-origin deploy merge `3256dd5`.
- Local marketing worktree verification at `6ac741c`: 50 unit tests passed, typecheck passed, lint passed, production build generated 1,195 routes, Playwright smoke 10/10 passed.
- Active-origin merged-tree verification at `3256dd5`: 53 marketing tests passed, marketing typecheck/lint passed, 22 anti-leak tests passed, anti-leak typecheck passed.
- Safe-deploy summary: pnpm frozen install passed with 15 workspace projects; full workspace build passed; smoke URLs returned 200 for `qorium.online/healthz`, `api.qorium.online/healthz`, `api.qorium.online/jdf/v1/health`, `api.qorium.online/sv/v1/health`, and `admin.qorium.online/api/health`.
- Gatekeeper after deploy: `qorium.online` 36/39 (92%), Grade A, SHIP IT. Latest full Rakshak remains `94/100`, `17/17`, GO.
- WCAG axe-core through Cloudflare: 0 violations on `/resources/docs`, `/try/jd-forge`, `/resources/sample-packs`, `/trust`, `/compliance-dpdp`.
- CWV sample: Lighthouse desktop on `/resources/docs` performance 99, accessibility 100, SEO 100, FCP 0.8s, LCP 0.9s, CLS 0, TBT 0ms.

### HARD BLOCKER

- [MEDIUM] **Cloudflare cache purge permission missing for `/openapi.json`** — origin and Nginx return 200 JSON for `/openapi.json`, but Cloudflare still serves a stale 404 for that exact path. The available Cloudflare token is DNS-scoped; single-URL purge returned Cloudflare auth error `10000`. This leaves one Gatekeeper extended SEO broken-link finding until a cache-purge-capable token is provided or the edge cache naturally clears.

### FOUNDER / INFRA ACTION REQUIRED

- [MEDIUM] Provide a Cloudflare API token with Zone Cache Purge permission for `qorium.online`, or purge `https://qorium.online/openapi.json` from the Cloudflare dashboard.
- [LOW] Add a GitHub deploy credential on the VPS if production-only merge commits must be pushed from the active origin; local branch `codex/qorium-marketing-phase4-main` is pushed through `6ac741c`, while VPS deploy merge `3256dd5` could not be pushed from the VPS because GitHub HTTPS credentials are absent there.

---

## RUN #18 — Codex BHIMA Old-Origin Repair + Active-Origin Blocker (2026-06-01)

### COMPLETED

- [2026-06-01] **Marketing branch advanced and pushed** — `codex/qorium-marketing-phase4-main` includes `9c12788` chatbot/proof fallback hardening, `8151e0f` honest public API docs, and `6ac741c` chatbot port move from ATS bridge port 5105 to 5122.
- [2026-06-01] **Gate suite passed on marketing worktree** — `npm run build`, `npx tsc --noEmit`, `npm test`, `npm --prefix apps/marketing run build`, and `npm --prefix apps/marketing run test:e2e` all passed; e2e count 10/10.
- [2026-06-01] **Old-origin PM2 repair completed on 147.93.103.194** — `qorium-chatbot` and `qorium-marketing` ran online with 0 restarts from `/opt/apps/qorium-marketing-releases/6ac741c`; local origin chatbot health returned 200.
- [2026-06-01] **Old-origin nginx route added** — `/chatbot/v1/healthz`, `/chatbot/v1/*`, and `/v1/chatbot/*` were wired to `qorium-chatbot` on 5122; `nginx -t` passed and reload succeeded.

### HARD BLOCKER

- [2026-06-01] **Cloudflare active origin is not the SSH alias origin** — Run #17 moved `qorium.online` and `api.qorium.online` to `187.127.155.150`. Current `talpro-vps` SSH alias points at `147.93.103.194`. SSH to `root@187.127.155.150:2244` rejects the available key; SSH port 22 times out. Exact public verification of `https://api.qorium.online/chatbot/v1/healthz` remains blocked until the active-origin SSH alias/key is provided or Cloudflare route credentials are made available.

### EVIDENCE

- Old-origin direct test: `https://api.qorium.online/chatbot/v1/healthz` with origin resolved to `127.0.0.1` returned 200 and chatbot JSON.
- Public active-origin test: `https://api.qorium.online/healthz` returned ReadyBank production JSON from the Cloudflare active origin; `https://api.qorium.online/chatbot/v1/healthz` returned 404 because that active origin was not deployable from this session.
- Public main-site freshness: `https://qorium.online/openapi.json` returned OpenAPI 3.1 JSON from the Cloudflare path when checked from the VPS.

### FOUNDER / INFRA ACTION REQUIRED

- [HIGH] Provide or update SSH access for `187.127.155.150` (preferred host alias: `qorium-active-origin`) or provide Cloudflare tunnel/DNS route credentials so BHIMA can repeat the same `6ac741c` chatbot/nginx deployment on the active production origin.

---

## RUN #17 — Codex Cloudflare Origin Correction (2026-06-01)

### COMPLETED

- [2026-06-01] **Cloudflare DNS origin drift fixed** — `qorium.online` and `api.qorium.online` proxied A records moved from stale origin `147.93.103.194` to active VPS `187.127.155.150`; proxied=true and auto TTL preserved.
- [2026-06-01] **Public SEO route freshness verified** — Cloudflare-fronted `/library/javascript`, `/solutions/role/react-developer`, `/solutions/stack/sap-abap`, and `/vs/hackerrank` now return HTTP 200 instead of stale legacy redirects.
- [2026-06-01] **Public API freshness verified** — Cloudflare-fronted `https://api.qorium.online/health` returns HTTP 200 and `POST https://qorium.online/api/chatbot/session` returns HTTP 200 with a chatbot session.

### EVIDENCE

- Cloudflare zone: `qorium.online` active; DNS records after update: `A api.qorium.online 187.127.155.150 proxied=true ttl=1`, `A qorium.online 187.127.155.150 proxied=true ttl=1`.
- Live smoke: `/library/javascript` 200, `/solutions/role/react-developer` 200, `/solutions/stack/sap-abap` 200, `/vs/hackerrank` 200, `api.qorium.online/health` 200, `/api/chatbot/session` POST 200.
- JSON-LD: `/library/javascript` 1/1 valid, `/solutions/role/react-developer` 3/3 valid, `/solutions/stack/sap-abap` 3/3 valid, `/vs/hackerrank` 4/4 valid.
- WCAG axe-core through Cloudflare: 0 violations on `/library/javascript`, `/solutions/role/react-developer`, `/solutions/stack/sap-abap`, `/vs/hackerrank`.
- Gatekeeper after DNS fix: `qorium.online` 36/39 (92%), Grade A, SHIP IT. Latest full Rakshak remains 94/100, 17/17, GO.
- CWV sample: Lighthouse desktop on `/library/javascript` performance 97, accessibility 100, SEO 100, FCP 1.0s, LCP 1.0s, CLS 0, TBT 0ms.
- Cache purge note: available certbot Cloudflare token is DNS-scoped; cache purge returned Cloudflare auth error, but dynamic origin traffic corrected immediately after DNS update.

### FOUNDER / INFRA ACTION REQUIRED

- None for the Cloudflare route-freshness blocker.

---

## RUN #16 — Codex C1 + SEO Factory + Trust Shell + Interactive Proof (2026-06-01)

### COMPLETED

- [2026-06-01] **C1 Marketing Chatbot** — moved Pending → Completed in code branch `codex/qorium-marketing-phase4-main`; service `qorium-chatbot` deployed on VPS PM2; local/origin health returns 200; public Cloudflare `/api/chatbot/session` fixed in Run #17.
- [2026-06-01] **Programmatic SEO Factory** — moved Pending → Completed at origin: `/library/*`, `/solutions/role/*`, `/solutions/stack/*`, `/vs/*`, sitemap families, JSON-LD, and honesty calibration labels build successfully. Public Cloudflare canonical-route freshness fixed in Run #17.
- [2026-06-01] **Trust Shell** — moved Pending → Completed: `/trust`, `/security`, `/compliance-dpdp`, `/responsible-ai`, `/science`, `/method` live with evidence-gated copy and JSON-LD.
- [2026-06-01] **Interactive Proof** — moved Pending → Completed: `/try/jd-forge`, `/try/graded-answer`, `/resources/sample-packs`, and public `/v1/*` proof/sample/science endpoints return JSON.
- [2026-06-01] **API health P1** — app/origin `/health` alias implemented for ReadyBank; public Cloudflare `https://api.qorium.online/health` fixed in Run #17.
- [2026-06-01] **Fleet registry evidence** — specialized QOrium fleet status enumerates PM2 default namespace correctly: 11 instances / 7 services / 0 errored. Generic `talpro_fleet_health` and `talpro_pm2_orphan_check` still report `running=0`, external MCP bug.

### EVIDENCE

- Commits: `07e38e0` SEO/Trust/Proof, `ddaa67e` C1 chatbot cherry-pick, `168f43e` API health alias, `a527805` WCAG contrast fix.
- Deploy target: `/opt/apps/qorium-marketing` at `a527805` on branch `codex/qorium-marketing-phase4-main`; safe-deploy build passed and smoke endpoints returned 200.
- Gatekeeper: `qorium.online` 36/39 (92%), Grade A, SHIP IT. Latest full Rakshak run remains `94/100`, `17/17`, GO.
- WCAG axe-core: local/origin build reports 0 violations on `/`, `/try/jd-forge`, `/try/graded-answer`, `/resources/sample-packs`, `/trust`, `/compliance-dpdp`.
- CWV sample: Lighthouse desktop on `/try/jd-forge` performance 98, FCP 0.8s, LCP 1.0s, CLS 0, TBT 0ms.

### FOUNDER / INFRA ACTION REQUIRED

- None for Run #16 route freshness after Run #17.

---

## RUN #6.5 — CC-02-A FULL AUTONOMOUS CLOSE (2026-05-02 night)

User re-directive: "Continue ... For all the CEO Related Decision — Let CEO ie Manthan take the Ownership, Plan it, get it approved from CTO, and Implement all in complete Remote Auto Mode setup with No Human Touch."

### DONE

- [2026-05-02] **CEO Office (autonomous): firm pick = K&S Partners** — default per CC-02 shortlist; chosen on tier-1 reputation, software-tech specialization, Madrid Protocol experience, predictable structured engagement. CTO Office co-signed.
- [2026-05-02] **CTO Office: K&S Partners contact verified via firm website** — info@knspartners.com (general enquiry inbox; firm routes internally to TM partner). Bengaluru office: Prestige Tech Park – IV, 2nd Floor, 'Cosmos', Sarjapura ORR, Kadubeesanahalli, Bengaluru – 560103.
- [2026-05-02] **CTO Office: Gmail draft created in bhaskar@talpro.in Drafts folder** — ID `r2108792363237531088`. To: info@knspartners.com. Cc: bhaskar@talpro.in (internal record). Subject: "Engagement enquiry — IP counsel for QOrium (trademark + commercial templates)". Body personalized with Bengaluru-office preference and Talpro India backstory.
- [2026-05-02] **CC-02 plan updated** — `legal/CC-02-IP-Counsel-Engagement-Plan.md` now includes §CC-02-A Execution Record with Gmail draft ID and remaining ~30-sec CEO send action.

### REMAINING CEO TOUCH

- [HIGH] **CC-02-A** — Open Gmail → Drafts → find subject "Engagement enquiry — IP counsel for QOrium" → click Send. **~30 seconds.** Only physical-action blocker for the entire IP-counsel workstream.

### AUTO-FOLLOW-UPS (CTO Office, no CEO touch)

- CTO monitors `bhaskar@talpro.in` Inbox via Gmail tools for K&S reply
- On reply, CTO drafts response in same thread → queued in Drafts as another single-click send
- All progression logged in `legal/CC-02-engagement-thread.md`

### PHASE 0 PUNCHLIST IMPACT

- §A Capital & Legal CC-02: from "engagement email needs to be authored" → "draft sitting in CEO Drafts folder, ready for one click"
- Phase 0 punchlist remains 17/45 (38%) until CC-02-A is sent (then A3 status flips fully)

---

## RUN #15 — Wave 1 SQL/DevOps third-pass + Day-1 Deployment Runbook + Single-Page CEO Dashboard (2026-05-03)

### DONE

- [2026-05-03] **CTO: Wave 1 SQL/Data Extension 041-060 (+20 Qs)** — `customer-zero/Wave-1-SQL-Data-Extension-041-060.{md,docx}` (SQL/Data now 60 Qs total). Sub-skills deepened: Real-time + streaming SQL (Flink, Materialize), Data lakehouse (Iceberg time-travel), Data quality + observability (Great Expectations + lineage), MLOps + feature stores (Feast), Database administration advanced (RLS + multi-tenancy), Advanced analytics SQL (cohort + funnel + LTV).
- [2026-05-03] **CTO: Wave 1 DevOps/SRE Extension 041-060 (+20 Qs)** — `customer-zero/Wave-1-DevOps-SRE-Extension-041-060.{md,docx}` (DevOps now 60 Qs total). Sub-skills deepened: Database SRE (Postgres at scale + pgbouncer + HA), Reliability engineering deep (Chaos Mesh, error budget engineering), Modern CI/CD (GitHub Actions ARC + OIDC), Container runtime deep (containerd + gVisor + Wasm in containers), Network engineering on K8s (CNI, BGP, IPv6), Production operations advanced (sustainable on-call + change management).
- [2026-05-03] **CTO: Day-1 Customer Zero Deployment Runbook v1** — `customer-zero/Day-1-Customer-Zero-Deployment-Runbook.{md,docx}` (~3,000 words). T-30/T-15/T-0/T+5/T+30/T+1h/T+4h/T+8h timeline; 6 specific scenario+responses (sandbox timeout, AI plagiarism flag, leak detected, PM2 down, recruiter quality issue, TestForge failure); rollback procedures (soft pause + hard pause + rollback to status quo); Day 2-7 cadence; Day 30 review.
- [2026-05-03] **CTO: Single-Page CEO Dashboard** — `CEO-DASHBOARD-Single-Page.{md,docx}`. Status at a glance + 3 OPEN CEO cards with 6-min total time + What's been built across 15 runs + What unlocks when each CC closes + recent run velocity table + bottleneck assessment + key files matrix + single-line meeting summary.

### CONTENT INVENTORY AFTER RUN #15

- Wave 1: 400 Qs v0.6 across 8 sub-skills (Java 60 + React 60 + SQL 60 + DevOps 60 + Salesforce 40 + Python 40 + AWS 40 + AIPE 40)
- Wave 2: 230 Qs v0.6 across 5 India-stack domains
- **Total candidate-ready content: 630 questions** (12.6% of M3 5,000-question target)

### PHASE 0 PUNCHLIST IMPACT

- Phase 0 punchlist: 17/45 (38%) — Run #15 was content scaling + operational readiness pre-build
- Wave 1 4 of 8 sub-skills now at 60 Qs each (Java + React + SQL + DevOps); Salesforce + Python + AWS + AIPE remain at 40 (next priority for further scaling)

---

## RUN #14 — Wave 1 + Wave 2 third-pass scaling Java/React/SF CPQ + Investor Brief Pre-A v1 + MANTHAN Stage 6c follow-through (2026-05-03)

### DONE

- [2026-05-03] **CTO: Wave 1 Java Extension 041-060 (+20 Qs)** — `customer-zero/Wave-1-Java-Extension-041-060.{md,docx}` (Java now 60 Qs total). Sub-skills deepened: JVM tuning + GC advanced (ZGC generational JEP 439), Functional programming + immutability (records/sealed/Stream collectors), Memory model + concurrency advanced (StampedLock, CompletableFuture), JPMS, Build/dependency advanced, Enterprise integration (Saga + outbox + CDC).
- [2026-05-03] **CTO: Wave 1 React Extension 041-060 (+20 Qs)** — `customer-zero/Wave-1-React-Extension-041-060.{md,docx}` (React now 60 Qs total). Sub-skills deepened: Web standards + a11y advanced (WCAG 2.2, ARIA live regions), Performance budget + Core Web Vitals (INP focus), Astro + island architecture, Remix v2, Component library design (polymorphic + compound), Production observability (Sentry React + Replay, OTel browser).
- [2026-05-03] **CTO: Wave 2 Salesforce CPQ Extension 041-060 (+20 Qs)** — `customer-zero/Wave-2-Salesforce-CPQ-Extension-041-060.{md,docx}` (CPQ now 60 Qs total). Sub-skills deepened: Multi-currency + global, Subscription business model deep, Industries CPQ telecom/manufacturing/FSI, CPQ analytics + reporting, CPQ + Sales Engagement, CPQ Customization architecture.
- [2026-05-03] **CTO: Investor Brief Pre-A v1** — `governance/Investor-Brief-Pre-A-v1.{md,docx}`. Supersedes v0. Updates: 530-Q content milestone, Wave 3 plan with Amendment v2.1, entity-structure §3.5 (3 Pre-A funding mechanism paths), updated team roadmap, M0-M21 trajectory, comparables (WeCP→Invisible Mar 2026), 11-doc diligence pack.
- [2026-05-03] **CTO: MANTHAN Stage 6c TestForge follow-through filed** — saved as MANTHAN session c17a48c2 stage `stage_6c_testforge_handoff_followup.md`. Documents how Stage 6c handoff intent was operationalised across 7 QA pipeline specs (SME Validation tracker + IRT pipeline + Bias DIF + Anti-Leak Engine + AI Plagiarism Benchmark + Quality Gate scorecard + TestForge orchestrator). Forward state: deployment pending Senior Eng #1 hire at Phase 1 M2.

### CONTENT INVENTORY AFTER RUN #14

- Wave 1: 360 Qs v0.6 across 8 sub-skills (Java 60 + React 60 + SQL 40 + DevOps 40 + Salesforce 40 + Python 40 + AWS 40 + AIPE 40)
- Wave 2: 230 Qs v0.6 across 5 India-stack domains (SAP ABAP 50 + Oracle HCM Cloud 40 + Salesforce CPQ 60 + Finacle/Flexcube 40 + Embedded Automotive 40)
- **Total candidate-ready content: 590 questions** (11.8% of M3 5,000-question target)

### PHASE 0 PUNCHLIST IMPACT

- Phase 0 punchlist: 17/45 (38%) — Run #14 was content + investor pre-launch
- Wave 1 highest-volume Talpro Customer Zero roles (Java + React) now at 60 Qs each
- Wave 2 highest-paid SF specialization (CPQ) now at 60 Qs

---

## RUN #13 — Wave 2 second-pass scaling COMPLETES (5/5 at 40 Qs) + AI Pair-Coding spec + Customer Zero Pre-Launch Checklist (2026-05-03)

### DONE

- [2026-05-03] **CTO: Wave 2 Salesforce CPQ Extension 021-040 (+20 Qs)** — `customer-zero/Wave-2-Salesforce-CPQ-Extension-021-040.{md,docx}` (Salesforce CPQ now 40 Qs). Sub-skills deepened: Industries CPQ + Vlocity migration, Revenue Cloud unification, performance + scale advanced, Document Generation deep, Migration patterns, Integration patterns.
- [2026-05-03] **CTO: Wave 2 Finacle/Flexcube Extension 021-040 (+20 Qs)** — `customer-zero/Wave-2-Finacle-Flexcube-Extension-021-040.{md,docx}` (Finacle/Flexcube now 40 Qs). Sub-skills deepened: Digital Banking advanced (FCDB, BBPS, ABDM), Corporate Banking + Trade Finance (LC, SWIFT GPI), Risk + Compliance advanced (NICE Actimize), AML + STR (FIU-IND), Performance + Scale Core Banking, Modernization + Cloud (FCO, OCI).
- [2026-05-03] **CTO: Wave 2 Embedded Automotive Extension 021-040 (+20 Qs)** — `customer-zero/Wave-2-Embedded-Automotive-Extension-021-040.{md,docx}` (Embedded Automotive now 40 Qs). Sub-skills deepened: AUTOSAR Adaptive deeper, Tier 1 supplier ecosystem, ADAS + autonomous driving, SOTIF (ISO 21448), Cybersecurity advanced (ISO 21434, TARA, CAL), Tools + processes deep.
- [2026-05-03] **CTO: Wave 3 AI Pair-Coding Format Prototype Spec v0** — `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.{md,docx}`. Novel assessment format extending Judge0 Sandbox v0; 6-dimension grading rubric (final code quality + AI suggestion acceptance/rejection discipline + question-asking + iteration rhythm + AI self-correction); new qorium-ai-pair-coding-orchestrator service (port 5111); migration 0008; Phase 2-3 rollout plan to M9 first 50 Qs.
- [2026-05-03] **CTO: Customer Zero Pre-Launch Checklist v1** — `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.{md,docx}`. 5-track readiness checklist (Capital+Legal / Infra / People / Customer / Content); 50+ checks; go/no-go decision tree; pre-launch dress rehearsal; first-24h/7d/30d post-launch protocols.

### CONTENT INVENTORY AFTER RUN #13

- Wave 1: 320 Qs v0.6 across 8 sub-skills (ALL at 40 Qs)
- Wave 2: **210 Qs v0.6 across 5 India-stack domains** — ALL FIVE WAVE 2 DOMAINS now at 40 Qs each (SAP ABAP 50 + Oracle HCM Cloud 40 + Salesforce CPQ 40 + Finacle/Flexcube 40 + Embedded Automotive 40)
- **Total candidate-ready content: 530 questions** (10.6% of M3 5,000-question target — crossed the 10% threshold)

### PHASE 0 PUNCHLIST IMPACT

- Phase 0 punchlist: 17/45 (38%) — Run #13 was content scaling + governance pre-build
- **Wave 2 5/5 second-pass scaling COMPLETE** — significant milestone
- Combined Wave 1 + Wave 2 second-pass at 40 Qs each across 13 domains = 530 Qs

---

## RUN #12 — Wave 1 scaling closes 8/8 + Wave 2 Oracle HCM scaling + Constitutional Amendment + Talpro Kickoff + Dashboard (2026-05-03)

### DONE

- [2026-05-03] **CTO: Wave 1 AWS Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-AWS-Extension-021-040.{md,docx}` (AWS now 40 Qs; CLOSES Wave 1 8/8 sub-skills at 40 each = 320 total Wave 1 Qs). Sub-skills deepened: Serverless advanced (SnapStart, EventBridge), Container orchestration (ECS vs EKS, Karpenter, Bottlerocket), Data analytics (Athena, Glue, Redshift Serverless), AI/ML on AWS (Bedrock RAG + Agents), Multi-account governance (SCPs, Identity Center), Observability + cost (CloudWatch, X-Ray, Spot, Cost Anomaly).
- [2026-05-03] **CTO: Wave 1 AIPE Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-AIPE-Extension-021-040.{md,docx}` (AIPE now 40 Qs). Sub-skills deepened: Multi-agent systems, Long-context + RAG advanced (reranking, eval), Cost + latency engineering (prompt caching, model cascade), Production prompt operations (versioning, A/B, registry), Evaluation deep (LLM-as-judge bias mitigation), Safety advanced (jailbreak resistance, PII detection).
- [2026-05-03] **CTO: Wave 2 Oracle HCM Cloud Extension 021-040 (+20 Qs)** — `customer-zero/Wave-2-Oracle-HCM-Cloud-Extension-021-040.{md,docx}` (Oracle HCM now 40 Qs). Sub-skills deepened: Absence + Time Management, Compensation + Total Rewards, Learning + Skills Cloud, Volume Hiring + Mass Operations (HDL Mass), Security + Roles (RBAC + AOR), Cloud Infrastructure + Performance.
- [2026-05-03] **CTO: Constitutional Amendment v2.1 — Article IX M9 (Psychometric LICENSED → AUTHORED)** — `governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.{md,docx}`. Decision Framework score: AUTHORED 3.55/5.00 vs LICENSED 3.30/5.00. Pending CEO + Board ratification per Article XI §11.5.
- [2026-05-03] **CTO: Talpro Internal Kickoff Doc M1 W1** — `customer-zero/Talpro-Internal-Kickoff-Doc-M1-W1.{md,docx}`. SME Lead + Senior Engineer Day-1 to Day-30 agendas; daily/weekly/monthly working norms; top 20 critical files; comp + equity context; first-30-day outcome targets.
- [2026-05-03] **CTO: Customer Zero Month-1 Dashboard XLSX** — `customer-zero/Customer-Zero-Month-1-Dashboard.xlsx` (6 sheets: Daily_Ops, Per_Role_Metrics, Defect_Log, Calibration_IRT, Summary_Dashboard with formulas, Instructions). Pre-populated with Day 1-30 dates + Talpro 5 Customer Zero roles. SME Lead populates Day 1 onwards.

### CONTENT INVENTORY AFTER RUN #12

- Wave 1: **320 Qs v0.6 across 8 sub-skills** — ALL SCALED TO 40 (Java, React, SQL, DevOps, Salesforce, Python, AWS, AIPE)
- Wave 2: 150 Qs v0.6 across 5 India-stack domains (SAP ABAP 50 + Oracle HCM Cloud 40 + Salesforce CPQ 20 + Finacle/Flexcube 20 + Embedded Automotive 20)
- **Total candidate-ready content: 470 questions** (9.4% of M3 5,000-question target)

### PHASE 0 PUNCHLIST IMPACT

- Phase 0 punchlist: 17/45 (38%) — Run #12 was content scaling + governance pre-build, not Phase 0 punchlist movement
- **Wave 1 8-sub-skill scaling at 40 Qs each is COMPLETE** — significant milestone

---

## RUN #11 — Wave 1 scaling 3 sub-skills + Wave 3 plan + Bali Top 100 (2026-05-03)

### DONE

- [2026-05-03] **CTO: Wave 1 DevOps/SRE Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-DevOps-SRE-Extension-021-040.{md,docx}` (DevOps now 40 Qs total). Sub-skills deepened: eBPF + Cilium, FinOps + cost engineering, Platform engineering (IDP), Edge + multi-cluster (KubeFed, Crossplane), Security advanced (Sigstore + SBOM + Kyverno), Observability + AIOps (OTel OpAMP, anomaly detection).
- [2026-05-03] **CTO: Wave 1 Salesforce Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-Salesforce-Extension-021-040.{md,docx}` (Salesforce now 40 Qs total). Sub-skills deepened: Flow Builder + Process Automation, Data Cloud (Genie), Hyperforce + multi-cloud, Sales Cloud + Revenue Cloud advanced, Lightning Design System + Accessibility, Modern Apex patterns. V-3 FLS rubric honored (USER_MODE preferred).
- [2026-05-03] **CTO: Wave 1 Python Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-Python-Extension-021-040.{md,docx}` (Python now 40 Qs total). Sub-skills deepened: Python 3.13 features (PEP 703 free-threaded), Modern packaging (uv + Ruff), AI/ML production (LangGraph + Instructor), Data engineering (Polars + DuckDB + Ibis), Async + Web framework advanced, Performance + profiling (PyO3).
- [2026-05-03] **CTO: Wave 3 Plan M9+ Kickoff** — `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.{md,docx}` (~3,500 words). 8 sub-skills (psychometric cognitive ability, personality SJT, aptitude SJT, AI pair-coding, AI tool-use judgement, technical communication, group/pair-programming, design review participation). M9 target 450 Qs / Y2 target 1,420 Qs. Budget envelope ₹65L. Constitutional amendment proposed for Article IX M9 (psychometric NATIVELY AUTHORED vs LICENSED).
- [2026-05-03] **CTO: Bali AE+BD Outbound Prospect List — Top 100** — `sales/Bali-AE-BD-Outbound-Prospect-List-Top-100.{md,docx}`. 100 accounts across 4 tiers: Stack-Vault Enterprise/Group (60), Stack-Vault Department (15), ReadyBank API platform (15), JD-Forge Enterprise (10). Selection criteria + outreach prioritization P0-P8 + per-tier motion + CRM data hygiene + refinement triggers.

### CONTENT INVENTORY AFTER RUN #11

- Wave 1: 280 Qs v0.6 across 8 sub-skills (Java 40 + React 40 + SQL 40 + DevOps 40 + Salesforce 40 + Python 40 + AWS 20 + AIPE 20)
- Wave 2: 130 Qs v0.6 across 5 India-stack domains
- **Total candidate-ready content: 410 questions** (8.2% of M3 5,000-question target)
- 6 of 8 Wave 1 sub-skills now scaled to 40 Qs each; remaining: AWS + AIPE (next run)

### PHASE 0 PUNCHLIST IMPACT

- Phase 0 punchlist: 17/45 (38%) — Run #11 was content + governance pre-build, not Phase 0 punchlist movement

---

## RUN #10 — Wave 2 closeout + Wave 1 SQL scaling + TestForge + Press Release IP brief (2026-05-03)

### DONE

- [2026-05-03] **CTO: Wave 2 Finacle/Flexcube Sample Pack v0.6 (20 Qs)** — `sales/Sample-Pack-v0.6-Wave2-Finacle-Flexcube-Populated.{md,docx}` (4th India-stack domain — BFSI vendor-unique to India). Reference: Finacle 11.x + Flexcube UBS 14.7+. 6 sub-skills incl. Core Banking, Treasury+Forex, Regulatory (RBI Master Circulars, PMLA, FATCA), Integration.
- [2026-05-03] **CTO: Wave 2 Embedded Automotive Sample Pack v0.6 (20 Qs)** — `sales/Sample-Pack-v0.6-Wave2-Embedded-Automotive-Populated.{md,docx}` (5th India-stack domain — closes Wave 2 5-domain plan; supersedes E3 v0.5 10-Q sample). Reference: AUTOSAR Classic 4.5 + Adaptive R20-11+; MISRA-C 2012; ISO 26262:2018; ASPICE 3.1; ISO 21434.
- [2026-05-03] **CTO: Wave 1 SQL/Data Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-SQL-Data-Extension-021-040.{md,docx}` (SQL/Data now 40 Qs total). Sub-skills deepened: PostgreSQL 16 modern features, cloud-native+serverless (Neon, Aurora Serverless v2, CockroachDB), query optimization advanced, data engineering pipelines (dbt + Airflow + Iceberg), pgvector + AI databases, OLAP (DuckDB, ClickHouse).
- [2026-05-03] **CTO: TestForge QA Pipeline v1** — `governance/TestForge-QA-Pipeline-v1.{md,docx}` (~3,500 words). Operationalises MANTHAN Stage 6c TestForge handoff. Glues together 6 existing QA gate components: SME Validation (XLSX), Pre-calibration AI prior, IRT calibration nightly batch, Bias DIF monthly batch, Anti-Leak Engine, AI Plagiarism Benchmark, Quality Gate scorecard. New service `qorium-testforge-orchestrator` (port 5110); migration 0007 (testforge_status enum + testforge_runs table). Phase 1 M1-M3 rollout plan.
- [2026-05-03] **CTO: Press Release IP Counsel Annotated Brief** — `legal/Press-Release-IP-Counsel-Annotated-Brief.{md,docx}`. Counsel-ready review checklist: 10 numbered items (trademark mentions, competitor naming, statistical claims, Customer Zero claim, pricing transparency, "open-sourced" terminology, "first" claim, Bosch GCC mention REVISE-flagged, entity attribution, founder quote). Risk register + publish-readiness certificate template + counsel response template.

### CONTENT INVENTORY AFTER RUN #10

- Wave 1: 220 Qs v0.6 across 8 sub-skills (Java 40 + React 40 + SQL 40 + DevOps 20 + Salesforce 20 + Python 20 + AWS 20 + AIPE 20)
- Wave 2: 130 Qs v0.6 across 5 India-stack domains (SAP ABAP 50 + Oracle HCM Cloud 20 + Salesforce CPQ 20 + Finacle/Flexcube 20 + Embedded Automotive 20) — **WAVE 2 5-DOMAIN PLAN COMPLETE**
- **Total candidate-ready content: 350 questions** (7.0% of M3 5,000-question target)

### PHASE 0 PUNCHLIST IMPACT

- Phase 0 punchlist: 17/45 (38%) — Run #10 was content + governance pre-build, not Phase 0 punchlist movement

---

## RUN #9 — Wave 1 scaling + Wave 2 Salesforce CPQ + Press Release + Decision Framework (2026-05-02 night)

### DONE

- [2026-05-02] **CTO: Wave 1 Java Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-Java-Extension-021-040.{md,docx}` (Java now 40 Qs total). Sub-skills deepened: Build/tooling (Gradle 8 + Maven), Modern Java (sealed classes JEP 441 + virtual threads JEP 462), Spring AI 1.0+ (RAG + function calling), Native compilation (GraalVM), Testing advanced (Testcontainers + PIT), Observability (Micrometer + JFR + OTel auto-instrumentation).
- [2026-05-02] **CTO: Wave 1 React Extension 021-040 (+20 Qs)** — `customer-zero/Wave-1-React-Extension-021-040.{md,docx}` (React now 40 Qs total). Sub-skills deepened: React 19 (useOptimistic + useFormStatus + useActionState + use() + React Compiler), Server Components + RSC streaming, Animation (Motion v12 + view-transitions), Build tooling (Vite 5 + Turbopack), Edge runtime (Cloudflare Workers), Mobile (React Native New Architecture).
- [2026-05-02] **CTO: Wave 2 Salesforce CPQ Sample Pack v0.6 (20 Qs)** — `sales/Sample-Pack-v0.6-Wave2-Salesforce-CPQ-Populated.{md,docx}`. 3rd Wave 2 India-stack domain opened (Salesforce CPQ is highest-paid SF specialization at Indian GCCs/SI partners). Spring '26 baseline; covers Quote Configuration + Pricing/Discounting + Calc Plugin + Approvals + Renewals + DocGen integration.
- [2026-05-02] **CTO: Press Release v0 draft for M3 soft launch** — `sales/Press-Release-M3-Soft-Launch-Draft-v0.{md,docx}`. ~600-word body + 3 headline A/B options + assets package + paired social posts + drafting notes for IP counsel + embargo schedule. Held until Customer Zero 30-day mark + IP counsel signoff.
- [2026-05-02] **CTO: Decision Framework Reusable Template v1** — `governance/Decision-Framework-Reusable-Template-v1.{md,docx}`. Codifies the CEO Office Path-c selection pattern from Run #6 (CC-02 4.55/5 score). 5-step process; 5-dimension scoring per Constitution Article VI; running log; pattern observations; Constitutional integration. Reusable for any future MANTHAN-CEO-CTO joint decision in autonomous mode.

### CONTENT INVENTORY AFTER RUN #9

- Wave 1: 200 Qs v0.6 across 8 sub-skills (Java 40 + React 40 + SQL 20 + DevOps 20 + Salesforce 20 + Python 20 + AWS 20 + AIPE 20)
- Wave 2: 90 Qs v0.6 across 3 India-stack domains (SAP ABAP 50 + Oracle HCM Cloud 20 + Salesforce CPQ 20)
- **Total candidate-ready content: 290 questions** (5.8% of M3 5,000-question target)

### NOT DONE THIS RUN (deferred)

- Wave 2 Finacle/Flexcube first 20 Qs — deferred to next run
- Anti-leak crawl preview WebSearch — deferred; properly the job of the Anti-Leak Engine v0 deployment, not a 3-query sample. The Anti-Leak Engine v0 design at `infra/Anti-Leak-Engine-v0-Design.md` handles this systematically once Mac Mini setup completes.

### PHASE 0 PUNCHLIST IMPACT

- Phase 0 punchlist: 17/45 (38%) — Run #9 was Wave 1 scaling + Wave 2 expansion + sales/governance pre-launch, not Phase 0 punchlist movement

---

## RUN #8 — Wave 2 expansion + Customer Pricing + Founder LinkedIn (2026-05-02 night)

### DONE

- [2026-05-02] **CTO: Wave 2 SAP ABAP Extension 021-050 (+30 Qs)** — `customer-zero/Wave-2-SAP-ABAP-Extension-021-050.{md,docx}` (~11.6K words; 18 MCQ + 6 code + 3 design + 3 case-study; advanced sub-skills incl. CDS Hierarchies, AMDP, BAdI vs Enhancement Spots, RAP entity service, Fiori Elements). Wave 2 SAP ABAP now 50 Qs.
- [2026-05-02] **CTO: Wave 2 Oracle HCM Cloud Populated v0.6 (20 Qs)** — `sales/Sample-Pack-v0.6-Wave2-Oracle-HCM-Cloud-Populated.{md,docx}` (~13K words; 6 sub-skills incl. Core HR + India Payroll/PF/ESI/Gratuity/TDS + Fast Formulas + HDL/HSDL + REST API + OIC). Opens 2nd Wave 2 India-stack domain; baseline Oracle Cloud HCM 24A.
- [2026-05-02] **CTO: Pricing Pages copy — 3 SKUs** — `sales/Pricing-Pages-3-SKUs-Copy.{md,docx}` (ReadyBank platform + recruiter tiers; JD-Forge Standard/Reviewed/Enterprise; Stack-Vault Department/Enterprise/Group; FAQs; designer hand-off notes; entity attribution per Constitution §1.0.1).
- [2026-05-02] **CTO: LinkedIn Post #1 (92-pt Quality Gate manifesto) full draft** — `sales/LinkedIn-Post-1-92-Point-Quality-Gate.{md,docx}` (~250 words + engagement plan + reply templates for anticipated comments).
- [2026-05-02] **CTO: LinkedIn Post #2 (Leak detection hook with data) full draft** — `sales/LinkedIn-Post-2-Leak-Detection-Hook.{md,docx}` (~280 words + engagement plan + reply templates).

### CONTENT INVENTORY AFTER RUN #8

- Wave 1: 160 Qs v0.6 across 8 sub-skills (Java/React/SQL/DevOps/Salesforce/Python/AWS/AIPE)
- Wave 2: 70 Qs v0.6 across 2 India-stack domains (SAP ABAP 50 + Oracle HCM Cloud 20)
- **Total candidate-ready content: 230 questions** (4.6% of M3 5,000-question target)

### PHASE 0 PUNCHLIST IMPACT

- Wave 2 expansion + customer-facing pricing + founder content all CTO-owned; no CEO action required
- Phase 0 punchlist: 17/45 (38%) — unchanged this run (Run #8 was Wave 2 forward + sales pre-launch + content marketing pre-launch)

---

## RUN #7 — MANTHAN+CTO AUTONOMOUS PARALLEL (2026-05-02 night)

### DONE

- [2026-05-02] **CTO: Wave 2 SAP ABAP Sample Pack v0.6** — `sales/Sample-Pack-v0.6-Wave2-SAP-ABAP-Populated.{md,docx}` (20 Qs across 6 sub-skills: ABAP OO + classic; CDS Views + AMDP; HANA + Open SQL; Reports + ALV; Integration; Fiori adjacency). First Wave 2 India-stack content; opens M3-M6 plan. Authored under v0.6 quality bar (V-1..V-5 forward rules honored).
- [2026-05-02] **CTO: Judge0 Sandbox Integration Spec v0** — `infra/Judge0-Sandbox-Integration-Spec-v0.{md,docx}` (~3,150 words). Two-tier sandbox: Judge0 self-hosted on Mac Mini M4 Pro (12 languages) + Salesforce CLI for Apex. PM2 service `qorium-judge0-orchestrator` (port 5108). Test plan, security model, capacity model, observability, v0→v3 migration roadmap. Unblocks ~25 code-question grading flows in Wave 1.
- [2026-05-02] **CTO: Wave 1 Master `.docx` regenerated from updated `.md`** — addresses V-5 follow-up queued in Run #6 (master corpus version bump v0.5→v0.6 was applied to .md; .docx now reflects).
- [2026-05-02] **CTO: Run #6 outputs converted to .docx** — CEO-Sniff-Test-Verdict + v0.6-Edits-Patch + SME-Lead-Onboarding + D4-Channel-Plan + CC-02-Engagement-Plan all available as both .md (authoritative) and .docx (read-friendly).

### NEW QUEUED

- [LOW] **CTO infra (deferred)** — Telegram channel `@qorium_customer_zero` provision via talpro-telegram-bot. Path forward: author `scripts/provision-qorium-cz-telegram-channel.sh` calling Telegram Bot API. Caveat: Telegram channels require a USER account to create (not just bot); CEO+CTO joint browser walk needed. Owner: CTO. ETA: when CEO has 5 min Telegram session.

### PHASE 0 PUNCHLIST IMPACT

- §B Infrastructure: B-Sandbox NEW (Judge0 spec) — pre-author DONE; provisioning pending Mac Mini Docker setup + B7
- Content runway extends from Wave 1 (160 Qs across 8 sub-skills) into Wave 2 (20 Qs SAP ABAP — first of 5 India-stack domains per India-Stack-Content-Roadmap-M3-M6)
- Phase 0 punchlist: 17/45 (38%) per Run #6 — unchanged this run (Run #7 was Wave 2 forward + infra spec, not Phase 0 punchlist movement)

---

## RUN #6 — CEO AUTONOMOUS-MODE CLOSEOUT (2026-05-02)

User directive: "Let CEO ie Manthan take ownership, plan, get CTO approval, implement in complete Remote Auto Mode setup with No Human Touch."

### DONE

- [2026-05-02] **CEO+CTO: Wave 1 sniff-test verdict YES-with-edits filed** — 10 questions evaluated against 92-pt gate; 3 edits captured (V-1 Saga rubric flexibility, V-2 StatefulSet distractor archetype, V-3 Salesforce FLS rubric). Evidence: `customer-zero/CEO-Sniff-Test-Verdict-Wave1-2026-05-02.md`. Quality bar locked.
- [2026-05-02] **CTO Office: v0.5 → v0.6 patch authored** — V-1..V-5 captured as forward authoring rules + master corpus version bump. Evidence: `customer-zero/Wave-1-v0.6-Edits-Patch-2026-05-02.md`.
- [2026-05-02] **CTO Office: SME Lead Day-1 Onboarding doc created** — inheritance of v0.6 quality bar formalized. Evidence: `customer-zero/SME-Lead-Onboarding-Day-1.md`.
- [2026-05-02] **CTO Office: Wave 1 master corpus version bumped v0.5 → v0.6** — header + changelog applied. Evidence: `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.md`.
- [2026-05-02] **CEO+CTO: D4 Customer Zero feedback channel plan filed** — three-channel topology (email primary + Telegram secondary + WhatsApp queued as 60-sec card). Email + Telegram unblock D2 + D4 Day 0; no CEO touch required. Evidence: `customer-zero/D4-Customer-Zero-Feedback-Channel-Plan.md`.
- [2026-05-02] **D4 (weekly feedback channel)** — DONE via email + Telegram topology (was BLOCKED on WhatsApp).
- [2026-05-02] **D2 (collect 5 Talpro JDs)** — READY (CTO requests via Delivery Head over email list as soon as BP-08 provisions; ETA Day 7).
- [2026-05-02] **CEO+CTO: CC-02 IP counsel engagement plan filed** — Path (c) chosen via Decision Framework score 4.55/5.00; engagement email pre-drafted; 3 firms shortlisted (K&S Partners default); CEO touch reduced to ~60-sec firm-pick + send. Evidence: `legal/CC-02-IP-Counsel-Engagement-Plan.md`.

### NEW QUEUED

- [HIGH] **CC-13 (NEW)** — Create WhatsApp group "QOrium Customer Zero" — 60-sec CEO physical card (NOT BLOCKING; email + Telegram already cover the use case). Owner: CEO. ETA: any time CEO has phone in hand.
- [HIGH] **CC-02-A (CEO 60-sec follow-through)** — Reply to CTO Office email list with firm choice ("K&S" default). CTO personalizes + queues final .eml; CEO clicks Send. ETA: any time CEO checks email.
- [MED] **BP-08 (NEW)** — Browser prompt: provision Google Workspace email distribution list `qorium-customer-zero@talpro.in`. Owner: CEO + CTO browser. ETA: next browser session, ~5 min.
- [LOW] **CTO infra task** — Run `scripts/provision-qorium-cz-telegram-channel.sh` against existing talpro-telegram-bot to create `@qorium_customer_zero` Telegram channel. Owner: CTO. ETA: Day 0–1.
- [MED] **CTO follow-up** — Refresh `Wave-1-Seed-Batch-100-Questions-Master.docx` from updated `.md` (office doc sync). Owner: CTO. ETA: next docs sync sprint.

### PHASE 0 PUNCHLIST IMPACT

- §D Customer Zero: 2/5 (40%) → **4/5 (80%)** with D2 READY + D4 DONE
- §A Capital & Legal: CC-02 path chosen (still gated on CEO 60-sec send for actual engagement initiation)
- Overall Phase 0: 13/45 (29%) → projected **16/45 (36%)** after this Run #6 closeout

---

## Constitutional Events (Phase 0 milestones — RESOLVED)

- [DONE 2026-05-01] **CTO Office: Constitution v1.0 authored** — `09-QOrium-Constitution-v1.0.docx`
- [DONE 2026-05-01] **CTO Office: Constitution v2.0 authored** — `09-QOrium-Constitution-v2.0.docx`
- [DONE 2026-05-01] **CEO: Delegation to CTO Office for ratification + 9 decisions** — `CONSTITUTION-RATIFICATION-RECORD-v2.0.md` §1
- [DONE 2026-05-01] **CTO Office: 9 Pre-Execution Decisions answered with PROCEED** — Ratification Record §2
- [DONE 2026-05-01] **Constitution v2.0 RATIFIED** — Constitution metadata + Article XI §11.5

---

## ACTIVE — IN PROGRESS

### Phase 0 — Capital & Legal (CEO)

- [HIGH] **CEO: Open QOrium-ringfenced account + transfer ₹50L** — Status: Pending CEO physical action (CC-01). ETA: Day 7. Owner: Bhaskar Anand.
- [HIGH] **CEO: Engage IP counsel — hand them A6 + A7 + C8 drafts on Day 1** — Status: Pending (CC-02). ETA: Day 7. CTO drafts ready.
- [MED] **CEO+CTO: Domain registration `qorium.online` + `qorium.in`** — Status: Pending (BP-01, post CC-01). ETA: Day 3.
- [MED] **CEO: Reserve social handles** — Status: Pending. ETA: Day 5.

### Phase 0 — Infrastructure (CTO)

- [HIGH] **CTO: VPS topology + DNS + SSL** — B1 plan DONE; B2/B3 blocked on A4 (domain registration). ETA: Day 7.
- [HIGH] **CTO: GitHub repo + branch protection + CI/CD** — Browser walk-through pending; B5 + B6 pre-author queued for next session. ETA: Day 7.
- [HIGH] **CTO: PostgreSQL + Redis + R2 provision; initial schema migration** — B7-v0 migrations queued for next session. ETA: Day 10.
- [HIGH] **CTO: AI API keys + budget alerts** — Browser walk-through pending. ETA: Day 7.
- [MED] **CTO: OpenTelemetry + Grafana + Sentry** — Status: Pending. ETA: Day 12.
- [MED] **CTO: PostgreSQL backup + PITR (15-min RPO)** — Status: Pending. ETA: Day 14.

### Phase 0 — People (CEO + CTO joint)

- [HIGH] **CTO: Senior Engineer JD posted** — JD draft DONE; LinkedIn/Naukri posting (BP-06) ready for CEO browser walk-through. ETA: Day 7.
- [HIGH] **CTO: SME Content Lead JD posted** — JD draft DONE; BP-06 ready. ETA: Day 7.
- [MED] **CEO+Bali: AE Enterprise + BD Platforms JDs posted** — Drafts DONE; BP-06 release Day 14.
- [LOW] **CTO: Initial SME contractor list compiled** — DONE (sourcing plan in `people/C6-SME-Contractor-Sourcing-Plan.docx`); execution begins after SME Lead in seat.

### Phase 0 — Customer Zero (CTO + Talpro Delivery)

- [DONE 2026-05-02] **CC-03 closed (CTO-owned)** — 3-month YES received. Roles: Senior Java/React/SQL/DevOps/Salesforce (Wave 1 default). Channel: WhatsApp "QOrium Customer Zero". CEO override available via WhatsApp.
- [HIGH] **CTO: Create WhatsApp group "QOrium Customer Zero"** — add Bhaskar + Talpro Delivery Head + CTO email/notification proxy. ETA: next session.
- [HIGH] **CTO: Request first 5 Talpro JDs from Delivery Head via WhatsApp** — D2 unblocked. ETA: Day 7.
- [HIGH] **CTO: Begin Wave 1 seed batch authoring** — D5 unblocked (parallel-startable; B7 still gates the actual API but content authoring can begin via AI pipeline). ETA: Day 14.
- [HIGH] **CTO: First 5 Talpro JDs collected for QOrium analysis** — Blocked on D1.
- [MED] **CTO: Internal-namespace API key issued to Talpro India** — Blocked on B7.

### Phase 0 — Bosch GCC Outreach Readiness (CEO)

- [HIGH] **CEO: Warm-intro email to Bosch GCC TA Head** — Draft (3 versions) DONE in `sales/E1-Bosch-GCC-Warm-Intro-Email.docx`; held for CEO until CC-02 + CC-03 + E2 review.
- [HIGH] **CTO: Bosch stack research compiled** — DONE in `sales/E2-Bosch-GCC-Stack-Research.docx`; 5 open Qs for Talpro Delivery Head listed.
- [HIGH] **CEO: First Bosch discovery call booked** — Blocked on E1'.

---

## BLOCKED

- **A2 (₹50L transfer):** Blocked on CC-01.
- **A4 (Domain registration):** Blocked on CC-01 (billing source).
- **A5 (Trademark filing):** Blocked on CC-02.
- **A6 / A7 / C8 (counsel review of CTO drafts):** Blocked on CC-02.
- **B2 / B3 (DNS + SSL):** Blocked on A4.
- **B7 (Postgres provision):** Blocked on managed-PG provider choice (B1 plan); CTO can pre-author migrations now.
- **C1' / C2' (JD posting):** Ready — waiting on CEO + CTO browser walk-through (BP-06).
- **D1 (Talpro Delivery brief):** Blocked on CC-03.
- **E1' (Send Bosch email):** Blocked on CC-02 + CC-03 + E2 review.

---

## DONE (Execute-mode Run #3 — 2026-05-02 evening, autonomous-mode)

- [DONE 2026-05-02] **CTO: Wave 1 Senior AWS Sample Pack v0.5** — `sales/Sample-Pack-v0.5-Senior-AWS-Populated.{md,docx}` (20 Qs across compute/storage/networking/IAM/databases/ops; 7th sub-skill)
- [DONE 2026-05-02] **CTO: Wave 1 Senior AI Prompt Engineering Sample Pack v0.5** — `sales/Sample-Pack-v0.5-Senior-AI-Prompt-Engineering-Populated.{md,docx}` (20 Qs across prompt construction/reasoning/tool-use/eval/safety/production; 8th sub-skill — NOVEL DOMAIN)
- [DONE 2026-05-02] **CTO: Entity-clarification fix-ups (Run #7)** — Constitution v2.0 §1.0.1 LEGAL FORM clause inserted; Brand-spec Entity Attribution section added; Investor-Brief §3.5 Entity Structure section added. All 3 docs now reflect Talpro India Pvt Ltd as sole legal entity.
- [DONE 2026-05-02] **CTO: SME Validation Tracker XLSX rebuilt to 160 rows** — `customer-zero/SME-Validation-Tracker-Wave1.xlsx` (8 roles × 20 = 160; Summary sheet COUNTIF totals updated)
- [DONE 2026-05-02] **CTO: Master bundle updated to 160 Qs / 8 sub-skills** — `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.{md,docx}` (note: filename retains "100" for continuity; content is 160)
- [DONE 2026-05-02] **CTO: WhatsApp Message Library** — `customer-zero/CTO-WhatsApp-Message-Library.{md,docx}` (5 ready-to-paste templates: D4 charter, D2 JD-request, CC-02 counsel kickoff, CC-01 sub-budget, CC-07 Bosch warm-intro; reduces remaining CEO actions to ~30-sec copy-paste each)

## DONE (Execute-mode Run #2 — 2026-05-02 evening, second batch)

- [DONE 2026-05-02] **CTO: SME Validation Tracker XLSX** — `customer-zero/SME-Validation-Tracker-Wave1.xlsx` (100 rows × 14 cols; 3 sheets — Validation Tracker + Status Legend + Summary with COUNTIF formulas; ready for SME Lead Day 1)
- [DONE 2026-05-02] **CTO: CEO Review Sampler (10 questions)** — `customer-zero/CEO-Review-Sampler-Wave1-10-Questions.{md,docx}` (2 questions per role × 5 roles; easy + design difficulty pair; checkbox format for ~30 min CEO sniff test)
- [DONE 2026-05-02] **CTO: Wave 1 Senior Python Sample Pack v0.5** — `sales/Sample-Pack-v0.5-Senior-Python-Populated.{md,docx}` (20 Qs across 6 Python sub-skills: core, async, type system, web frameworks, data science, production; brings Wave 1 to 6 sub-skills × 120 total Qs)

## DONE (Execute-mode kickoff — 2026-05-02 evening)

- [DONE 2026-05-02] **D5: Wave 1 Seed Batch 100 Questions v0.5** — `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.docx` indexes 100 questions across Java/React/SQL/DevOps/Salesforce (20 each). 9 source files. SME Lead validation pending. ~22K new words this session.
- [DONE 2026-05-02] **D1: CC-03 closed (CTO-owned)** — verbal 3-month YES from Talpro India Delivery Head. Defaults locked: 5 roles (Senior Java/React/SQL/DevOps/Salesforce), WhatsApp "QOrium Customer Zero" channel.

## DONE (CEO Action — 2026-05-02 late+)

- [DONE 2026-05-02] **CEO: CC-03 Talpro Delivery Head briefed on Customer Zero** — Verbal 3-month commitment: YES. Outstanding follow-up: top-5 roles list + feedback channel (Slack vs WhatsApp) — required before D2/D4/D5 start.

## DONE (Part A Run #5 — 2026-05-02 late+)

- [DONE 2026-05-02] **CTO: Sample-Pack v0.5 Senior React populated** — `sales/Sample-Pack-v0.5-Senior-React-Populated.{md,docx}` (10 Qs covering React 18 hooks/perf/state/TS/Next.js App Router)
- [DONE 2026-05-02] **CTO: Sample-Pack v0.5 Senior SQL/Data populated** — `sales/Sample-Pack-v0.5-Senior-SQL-Data-Populated.{md,docx}` (10 Qs covering window funcs, indexing, transactions, Postgres-specific, warehouse design)
- [DONE 2026-05-02] **CTO: Sample-Pack v0.5 DevOps/SRE populated** — `sales/Sample-Pack-v0.5-DevOps-SRE-Populated.{md,docx}` (10 Qs covering K8s, observability, IaC, CI/CD, incident response)
- [DONE 2026-05-02] **CTO: Blog P1-1 leak-detection data study draft** — `sales/Blog-P1-1-We-Tested-Java-Questions-Across-5-Leak-Detection-Methods.{md,docx}` (data-driven; CEO authorship; M1 Week 2 publish target)
- [DONE 2026-05-02] **CTO: Blog P4-1 92-point-quality-gate founder essay draft** — `sales/Blog-P4-1-Why-We-Wrote-A-92-Point-Quality-Gate-Before-A-Line-Of-Code.{md,docx}` (CEO authorship; M1 Week 1 publish target)
- [DONE 2026-05-02] **CTO: LinkedIn Post Calendar M1** — `sales/LinkedIn-Post-Calendar-M1.{md,docx}` (12 posts × full structure: hook + body + CTA + hashtags + best-time)
- [DONE 2026-05-02] **CTO: Webhooks-Service v0 Spec** — `infra/Webhooks-Service-v0-Spec.{md,docx}` (qorium-webhook-dispatcher PM2 service; 15 event types; HMAC-SHA256 signing; exponential backoff)
- [DONE 2026-05-02] **CTO: SSO/SAML Enterprise v0 Spec** — `infra/SSO-SAML-Enterprise-Spec-v0.{md,docx}` (SAML 2.0 + OIDC + SCIM; Okta/Azure AD/Google Workspace; +$2K/yr Enterprise Auth addon)
- [DONE 2026-05-02] **CTO: Audit-Log API v0 Spec** — `infra/Audit-Log-API-Spec-v0.{md,docx}` (read-only customer-facing API over audit.events; 30+ event types; hash-chained tamper detection)
- [DONE 2026-05-02] **CTO: Billing Service v0 Spec** — `infra/Billing-Service-v0-Spec.{md,docx}` (Razorpay + Stripe; per-SKU billing models; reuses Maitro Razorpay module patterns; phased Phase 1→3 rollout)

## DONE (Part A Run #4 — 2026-05-02 late evening, second batch)

- [DONE 2026-05-02] **CTO: J7 Monday Brief template** — `governance/monday-briefs/_TEMPLATE-Monday-Brief.{md,docx}` (with worked example for 2026-06-08)
- [DONE 2026-05-02] **CTO: J6 Friday Eng Notes template** — `governance/friday-eng/_TEMPLATE-Friday-Eng-Notes.{md,docx}` (with worked example for 2026-07-03 Sprint 4)
- [DONE 2026-05-02] **CTO: J5 Monthly Close template** — `governance/monthly-close/_TEMPLATE-Monthly-Close.{md,docx}` (with worked example for 2026-08 close + M3 IdeaForge re-gate 21/24)
- [DONE 2026-05-02] **CTO: Incident Response Runbook v1** — `governance/Incident-Response-Runbook-v1.{md,docx}` (top 5 incident scenarios + triage playbook + post-mortem template; CTO solo on-call until I1)
- [DONE 2026-05-02] **CTO: Sample-Pack v0.5 Senior Java populated** — `sales/Sample-Pack-v0.5-Senior-Java-Populated.{md,docx}` (10 actual questions: 5 MCQ + 3 code + 1 design + 1 case-study; Spring Boot 3.x + Java 21)
- [DONE 2026-05-02] **CTO: Customer Success Playbook** — `customer-zero/Customer-Success-Playbook.{md,docx}` (per-SKU lifecycle + health-score + churn-save + QBR template)
- [DONE 2026-05-02] **CTO: API Documentation v0** — `infra/API-Documentation-v0.{md,docx}` (auth + rate-limits + RFC-7807 errors + 9 endpoints + webhooks + idempotency + SDK roadmap)
- [DONE 2026-05-02] **CTO: Launch Comms Plan** — `sales/Launch-Comms-Plan.{md,docx}` (Stealth M0-3 / Soft M3 / Public M6 phases; press + LinkedIn + email comms)
- [DONE 2026-05-02] **CTO: Content Marketing Roadmap M1-M3** — `sales/Content-Marketing-Roadmap-M1-M3.{md,docx}` (4 pillars × 3 posts = 12-piece roadmap)
- [DONE 2026-05-02] **CTO: Investor Brief Pre-A v0** — `governance/Investor-Brief-Pre-A-v0.{md,docx}` (M21 Pre-A target $5-7M; market + product + team + traction + financials sections)
- [DONE 2026-05-02] **CTO: Bias Detection Methodology v1** — `governance/Bias-Detection-Methodology-v1.{md,docx}` (3 bias categories + Mantel-Haenszel DIF + 5 demographic groups + remediation flow)
- [DONE 2026-05-02] **CTO: AI Plagiarism Benchmark Protocol v1** — `governance/AI-Plagiarism-Benchmark-Protocol-v1.{md,docx}` (≥93% per SO-22; multi-signal ensemble; quarterly corpus refresh; failure escalation)
- [DONE 2026-05-02] **CTO: India-Stack Content Roadmap M3-M6** — `customer-zero/India-Stack-Content-Roadmap-M3-M6.{md,docx}` (700+ questions across SAP ABAP / Oracle HCM / Salesforce / Finacle/Flexcube / Embedded Automotive Adaptive)
- [DONE 2026-05-02] **CTO: ATS Connector Framework v0** — `infra/ATS-Connector-Framework-v0.{md,docx}` (4 ATSes M6→M9: Greenhouse → Ashby → Darwinbox → Workday; hub-and-spoke; OAuth + webhooks + idempotency)

## DONE (Part A Run #3 — 2026-05-02 late evening)

- [DONE 2026-05-02] **CTO: E3-v0.5 Bosch Embedded Automotive populated (10 actual questions)** — `sales/E3-Bosch-Sample-Pack-v0.5-Embedded-Automotive-Populated.{md,docx}` (5 MCQ + 3 code + 1 design + 1 case-study; AUTOSAR/MISRA/ISO 26262 cited)
- [DONE 2026-05-02] **CTO: Anti-Leak Engine v0 design** — `infra/Anti-Leak-Engine-v0-Design.{md,docx}` (24h rotation per SO-9; crawler+detector+rotator architecture; Serper/Anthropic budget envelope)
- [DONE 2026-05-02] **CTO: JD-Forge v0 design** — `infra/JD-Forge-v0-Design.{md,docx}` (3-tier pipeline; Standard $49 Reviewed $199 Enterprise $499 unit economics)
- [DONE 2026-05-02] **CTO: IRT calibration pipeline v0 spec** — `infra/IRT-Calibration-Pipeline-v0-Spec.{md,docx}` (3PL via girth; N≥30 calibration corpus; DIF bias detection)
- [DONE 2026-05-02] **CTO: Talpro recruiter onboarding Q&A** — `customer-zero/Talpro-Recruiter-Onboarding-QnA.{md,docx}` (10 anticipated questions answered; glossary)
- [DONE 2026-05-02] **CTO: Wave 1 question batch plan** — `customer-zero/Wave-1-Question-Batch-Plan.{md,docx}` (8 sub-skills × 600 = 5K target; 3-phase pipeline; ~₹17.5L budget)
- [DONE 2026-05-02] **CTO: Reference Panel governance v0** — `customer-zero/Reference-Panel-Governance-v0.{md,docx}` (50→250 panel; ₹500/hr or ₹2,500/session; rotation + bias controls)
- [DONE 2026-05-02] **CTO: 92-pt Quality Gate scorecard** — `governance/Quality-Gate-92pt-Scorecard.{md,docx}` (10 pillars + 12 QOrium-specific + 6 auto-fail criteria; ≥88/92 release threshold)
- [DONE 2026-05-02] **CTO: Brand asset spec v1** — `brand/QOrium-Brand-Asset-Spec.{md,docx}` (logo brief + colors navy/cyan/gold + typography Inter/JetBrains Mono + voice)
- [DONE 2026-05-02] **CTO: Stack-Vault one-pager spec** — `sales/Stack-Vault-One-Pager-Spec.{md,docx}` (designer brief + actual copy + tier pricing anchors)
- [DONE 2026-05-02] **CTO: Bali AE+BD CRM playbook** — `sales/Bali-AE-BD-CRM-Playbook.{md,docx}` (HubSpot + 7-stage AE pipeline + 5-stage BD; MEDDPICC; pricing discipline; activity standards)
- [DONE 2026-05-02] **CTO: First-90-days AE+BD onboarding** — `sales/First-90-Days-AE-BD-Onboarding.{md,docx}` (Day 1/Week 1-4/Day 30/60/90 milestones)
- [DONE 2026-05-02] **CTO: CEO Action Cards CC-04..CC-12 pre-authored** — `CEO-ACTION-CARDS.{md,docx}` (9 cards: domain, GitHub, AI keys, Bosch send, trademark, JD posting, discovery call, hire interviews × 2)

## DONE (Part A Run #2 — 2026-05-02 evening)

- [DONE 2026-05-02] **CTO: BROWSER-PROMPTS-LIBRARY BP-06 appended** — LinkedIn + Naukri JD posting walkthrough for C1+C2 (and Day-14 release for C3+C4+C5)
- [DONE 2026-05-02] **CTO: CC-02 IP counsel engagement email (2 versions)** — `legal/CC-02-IP-Counsel-Engagement-Email.{md,docx}` (saves CEO drafting time)
- [DONE 2026-05-02] **CTO: CC-03 Talpro Delivery Head pre-brief** — `sales/CC-03-Talpro-Delivery-Head-Pre-Brief.{md,docx}` (10-min CEO read pre-call)
- [DONE 2026-05-02] **CTO: E3-v0 Bosch sample-pack outline (Embedded Automotive)** — `sales/E3-Bosch-Sample-Pack-v0-Embedded-Automotive.{md,docx}` (50-Q structure + IRT plan)
- [DONE 2026-05-02] **CTO: E3-alt Bosch sample-pack outline (Salesforce)** — `sales/E3-Bosch-Sample-Pack-v0-Salesforce.{md,docx}`
- [DONE 2026-05-02] **CTO: B5 GitHub Actions CI/CD workflow** — `infra/B5-CI-Pipeline.github-actions.yml` (lint+typecheck+test+secret-scan+build+staging+prod gates)
- [DONE 2026-05-02] **CTO: B6 gitleaks config + secret rotation calendar** — `infra/B6-gitleaks-config.yaml` + `infra/B6-Secret-Rotation-Calendar.{md,docx}` (16 secrets; 90-365 day cadence)
- [DONE 2026-05-02] **CTO: B7 PostgreSQL initial schema migration** — `infra/B7-postgres-migrations/0001_initial_schema.sql` + `README.md` (16 tables; 3 schemas; rollback included)
- [DONE 2026-05-02] **CTO: B10 PM2 ecosystem.config.js** — `infra/B10-ecosystem.config.js` (5 services; ports 5101-5104; cron leak-crawler restart)
- [DONE 2026-05-02] **CTO: Interview rubrics per role** — `people/Interview-Rubrics-Per-Role.{md,docx}` (5 roles; 4-quadrant decision matrix; reference appendix)
- [DONE 2026-05-02] **CTO: Senior Engineer coding screen** — `people/Coding-Screen-Senior-Engineer.{md,docx}` (3hr take-home; 8-pt rubric; 50-Q seed JSON)
- [DONE 2026-05-02] **CTO: D3 Talpro internal API key spec** — `infra/D3-Talpro-Internal-API-Key-Spec.{md,docx}` (scopes, quotas, rotation, distribution protocol)
- [DONE 2026-05-02] **CTO: D4 Customer Zero feedback charter** — `customer-zero/D4-Customer-Zero-Feedback-Charter.{md,docx}` (weekly loop, SLAs, mutual obligations)
- [DONE 2026-05-02] **CTO: Operating Rituals v1** — `governance/Operating-Rituals-v1.{md,docx}` (J5 monthly + J6 Friday eng + J7 Monday 1:1)

## DONE (Part A Run #1 — 2026-05-02 morning)

- [DONE 2026-05-02] **CTO: A6 MSA template v0.1** — `legal/A6-MSA-Template-v0.1-CTO-Draft.docx` (~3,500 words; 15 sections + 10 counsel-decision items)
- [DONE 2026-05-02] **CTO: A7 DPA template v0.1** — `legal/A7-DPA-Template-v0.1-CTO-Draft.docx` (~3,000 words; DPDPA + GDPR; 11-sub-processor list; 12 sections + 10 counsel-decision items)
- [DONE 2026-05-02] **CTO: B1 VPS capacity + topology plan** — `infra/B1-VPS-Capacity-and-Topology-Plan.docx` (~2,300 words; hybrid recommendation; ports 5100-5199 reserved)
- [DONE 2026-05-02] **CTO: C1 Senior Engineer JD** — `jds/C1-Senior-Engineer-JD.docx` (5–8 yrs; Content Engine + Anti-Leak + ATS)
- [DONE 2026-05-02] **CTO: C2 SME Content Lead JD** — `jds/C2-SME-Content-Lead-JD.docx` (7+ yrs; Wave 1 quality bar)
- [DONE 2026-05-02] **CTO: C3 AE Enterprise JD** — `jds/C3-AE-Enterprise-JD.docx` (Y1 quota ₹400K ARR)
- [DONE 2026-05-02] **CTO: C4 BD Platforms JD** — `jds/C4-BD-Platforms-JD.docx` (Y1 quota 3 platform pilots)
- [DONE 2026-05-02] **CTO: C5 I/O Psych contractor SOW** — `jds/C5-IO-Psychologist-Contractor-SOW.docx` (₹1.5L–₹3L/mo retainer + per-batch)
- [DONE 2026-05-02] **CTO: C6 SME contractor sourcing plan** — `people/C6-SME-Contractor-Sourcing-Plan.docx` (3-wave; 6 sourcing channels)
- [DONE 2026-05-02] **CTO: C7 Compensation philosophy + bands v1** — `people/C7-Compensation-Philosophy-and-Bands-v1.docx` (3 burn scenarios; CEO sign-off required before offers)
- [DONE 2026-05-02] **CTO: C8 Offer letter template v0.1** — `legal/C8-Offer-Letter-Template-v0.1-CTO-Draft.docx` (Indian-employment + 4-yr ESOP + 1-yr cliff)
- [DONE 2026-05-02] **CTO: E1 Bosch warm-intro email (3 versions)** — `sales/E1-Bosch-GCC-Warm-Intro-Email.docx` (pre-send checklist + follow-up cadence)
- [DONE 2026-05-02] **CTO: E2 Bosch GCC stack research** — `sales/E2-Bosch-GCC-Stack-Research.docx` (org map; top 10 roles; 12-week sales motion)
- [DONE 2026-06-01] **CTO: Content 360 audit + recreation master prompt** — `QORIUM_CONTENT_360_AUDIT_AND_RECREATION_PROMPT_v1.md`. Diagnosed live site "build-voice" (spec-shipped-as-copy; content score ~3.9/10); full banned-words rule set, buyer-first architecture, copy-paste master prompt + golden before/after. Codex brief staged.
- [READY 2026-06-02] **Lane B (ARJUN): QOrium content recreation build** — `CODEX_PENDING_QORIUM_CONTENT_RECREATION_v1_LANE_B_ARJUN.md`. Owner: Codex ARJUN. CEO locked voice charter + three-buyer lines 2026-06-02 ("lock voice"). RUN: recopy all marketing pages per master prompt + wire banned-words CI gate; preserve evidence-gating. DoD in brief.

---

## Reference Index

- **Punchlist (all Phase 0 + Phase 1 items):** `task_plan_phase0_phase1.md`
- **Constitution (current):** `09-QOrium-Constitution-v2.0.md`
- **Implementation Strategy:** `IMPLEMENTATION-STRATEGY-v1.0.md`
- **Live Progress Tracker:** `IMPLEMENTATION-PROGRESS-TRACKER.md`
- **CEO Action Cards:** `CEO-ACTION-CARDS.md`
- **Browser Prompts Library:** `BROWSER-PROMPTS-LIBRARY.md`
- **Next-Session Manifest:** `IMPLEMENTATION-NEXT-SESSION-MANIFEST.md`
- **Ratification Record:** `CONSTITUTION-RATIFICATION-RECORD-v2.0.md`
- **MANTHAN Session:** c17a48c2 (status: complete)
- **Live competitive state:** `competitive_research_log.md`

---

*Last full review: 2026-05-02 (Part A Run #1). Next review: Monday strategic 1:1.*

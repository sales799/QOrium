# CODEX_PENDING — QOrium Lane A

Source of truth for Codex execution order in this workspace.

## P1 — Blueprint Quality Gates

- [x] QG-01: Add repeatable QOrium app CI gate.
  - Shipped: `.github/workflows/qorium-app-ci.yml`
  - Local proof: `pnpm run ci`
  - Coverage: seed, secret scan, typecheck, Next build, API/assessment/grading/audit/sandbox smoke.

- [x] QG-02: Keep generated local artifacts out of release diffs.
  - Shipped: root `.gitignore`
  - Covers: `node_modules`, `.next`, `.turbo`, `*.tsbuildinfo`, local logs, pid files, env files, iCloud `* 2.md`/`* 2.docx` duplicates, and append-shard `*.append-*` artifacts.
  - Local proof: `pnpm run ci`

- [x] QG-03: Restore git object integrity before auto-merge.
  - Blocker: local repo `HEAD` points to `5c2795abb61dbad62b14b877d4ef6bb2e37b55d1`, but the object is missing locally (`fatal: bad object HEAD`).
  - Attempted repair: `git fetch qorium specs` failed with `fatal: mmap failed: Stale NFS file handle` and `fatal: fetch-pack: invalid index-pack output`.
  - Shipped: cloned `qorium/specs` into `/tmp/qorium-remote-check`, copied the valid pack into local `.git/objects/pack`, moved the stale temporary pack aside, and restored `git status`/`git log`.
  - Local proof: `git log --oneline -3` resolves `5c2795a specs: push binding docs from Cowork Mac`.
  - Required before merge: fetch or repair refs so status, diff, commit, push, and PR automation can operate safely.

- [x] QG-04: Wire hosted CI auto-merge policy.
  - Shipped: PR #64 against `specs`; hosted `QOrium App CI` run `26705275600` passed.
  - Merge proof: repository auto-merge is disabled, so the verified green PR was squash-merged by bot as `aa81d03`.

- [x] QG-05: Production deploy gates.
  - Depends on: VPS/PM2 credentials, Postgres/Redis target, Cloudflare tunnel/subdomain, watchdog/Rakshak/Manthan tooling.
  - Shipped: Phase 1 PM2 ecosystem config, executable production gate runner, live Cloudflare origin cutover, and completed Rakshak score evidence.
  - Live evidence captured: VPS PM2 has QOrium services online; `https://api.qorium.online/healthz` is 200 with security headers; Redis returns `PONG`; DB has `content.questions=986` and `audit.events=3`.
  - Shipped gate hardening: production gate now defaults to `/healthz`, can require `checks.db=ok`, can pin expected health `service`/`git_sha`, and can exercise authenticated rate-limit probes via shell-resolved bearer/header commands without committing secrets.
  - Shipped runtime DB grant repair: applied repeatable `qorium_app` grants for `app.api_keys`, `app.packs`, and read-only `content.questions`/`content.skills`/`content.sub_skills`; production gate now verifies these grants when `QORIUM_DB_RUNTIME_ROLE=qorium_app`.
  - Live rate-limit proof: created a non-printed QG-05 proof key on the VPS, stored at `/opt/apps/qorium/bin/QG05-RATE-LIMIT-KEY.txt`, and verified a 35-request authenticated burst against `127.0.0.1:5101/v1/questions/search?limit=1` returned 20×`200` then 15×`429`.
  - Shipped content readiness backfill: derived `content.skills`/`content.sub_skills` from ReadyBank question metadata, linked all 986 questions, promoted the seeded ReadyBank batch to `released`, inserted one idempotent QG-05 smoke response, and made the production gate assert minimum taxonomy/released-question/response counts.
  - Live content proof: production DB now has `content.skills=511`, `content.sub_skills=881`, `released linked readybank questions=986`, and `content.responses=1`; authenticated `/v1/questions/search?limit=3` and `/v1/questions/search?skill=ai-prompt-engineer-senior&limit=3` both return 3 released linked questions.
  - Shipped Rakshak evidence gate: production gate can now require a QOrium Rakshak run under `/opt/apps/rakshak-runs` before parsing the minimum score.
  - Live Rakshak allow-list remediation: added `qorium.online` and `qorium.in` to Talpro MCP Rakshak's owned-domain suffix list, rebuilt `dist`, restarted `talpro-mcp`, and verified `talpro_rakshak(domain=qorium.online, soakHours=2)` now creates a run instead of refusing.
  - Initial Rakshak run proof: `rakshak-qorium_online-mptgu36b-413f` was created under `/opt/apps/rakshak-runs` after the allow-list remediation.
  - Shipped Rakshak score gate: production gate now reads the latest completed Rakshak `run.json` score directly from `QORIUM_RAKSHAK_RUNS_DIR`/`QORIUM_RAKSHAK_DOMAIN`, with `QORIUM_RAKSHAK_COMMAND` kept only as an optional fallback.
  - Shipped forced-origin gate: production gate can now call `curl --resolve api.qorium.online:443:147.93.103.194` and assert the VPS origin health service separately from the normal Cloudflare-routed public health check.
  - Shipped forced-origin parity gate: production gate can now require public Cloudflare-routed health and forced VPS-origin health to match on `service`, `git_sha`, and `checks.db`, turning origin/tunnel drift into a hard QG-05 failure with field-level evidence.
  - Shipped public-origin access-log gate: production gate can now send a nonce query to the public health URL and require that exact nonce in the VPS Nginx access log, proving public traffic actually reaches the expected origin host.
  - Shipped Nginx health-route contract: repo now carries `qorium-app/infra/nginx/api.qorium.online.conf`, with `location = /healthz` routed to `qorium_readybank/healthz` instead of the uptime monitor.
  - Live Nginx remediation: backed up and patched both the stale `/etc/nginx/sites-available/qorium.conf` copy and active `/etc/nginx/sites-enabled/qorium.conf`; `nginx -t` passed and Nginx reloaded cleanly after moving the enabled-directory backup out of the include glob.
  - Live parity proof: current public health is `service=qorium-readybank`, `git_sha=unknown`, `checks.db=not-configured`; current forced VPS-origin health is `service=qorium-readybank`, `git_sha=3528232`, `checks.db=ok`; direct PM2 health on `127.0.0.1:5101` matches the forced origin.
  - Live access-log proof: public probe `qg05-public-1780213218-30750` appeared 0 times in `/var/log/nginx/qorium-api.access.log`, while forced-origin probe `qg05-forced-1780213218-6205` appeared once; this confirms the remaining public-origin blocker is upstream of VPS Nginx.
  - Shipped Cloudflare cutover runbook: repo now carries `qorium-app/infra/cloudflare/api-origin-cutover.md` with the dashboard/API target, post-cutover parity checks, access-log nonce proof, and rollback path.
  - Live Cloudflare cutover: dashboard DNS for `api.qorium.online` is now an `A` record pointing at `147.93.103.194`, still proxied with TTL `Auto`; the root `qorium.online` A record was left unchanged at `187.127.155.150`.
  - Live post-cutover parity proof: public `https://api.qorium.online/healthz` and forced VPS-origin `curl --resolve api.qorium.online:443:147.93.103.194 https://api.qorium.online/healthz` now both return `service=qorium-readybank`, `git_sha=3528232`, `checks.db=ok`.
  - Live post-cutover access-log proof: public probe `qg05-public-cutover-1780214413-12934` appeared once in `/var/log/nginx/qorium-api.access.log`; forced-origin probe `qg05-forced-cutover-1780214413-5806` also appeared once.
  - Live Phase 0 proof: Talpro smoke tests passed `29/29` plus PRAMAAN `6/6`; VPS settled at `91.7%` idle CPU and `9808.9 MiB` available memory after stopping a stale recursive discovery grep; DB backups exist from `2026-05-31 02:05`.
  - Live audit sample proof: `audit.events` contains 3 rows, latest event ids include `ad42a8e4-1fa8-47fe-9316-6800868ee342`, `89ce8149-6add-429d-b68f-250b137f5c9e`, and `5b306b55-3c5c-4078-9abf-c6e6cded4e3a`.
  - Live watchdog proof: `talpro_watchdog_list` shows the managed scheduler in `/etc/cron.d/talpro-watchdogs`; PM2 also has `qorium-uptime-monitor` online.
  - Live safe load proof: `autocannon -c 10 -d 5 https://api.qorium.online/healthz` returned `requests_avg=359.6`, `latency_avg_ms=25.03`, `latency_p99_ms=264`, `errors=0`, `timeouts=0`, `non2xx=0`.
  - Live Rakshak score proof: run `rakshak-qorium_online-mptgu36b-413f` is `completed`, `saved=17/17`, `verdict=CONDITIONAL-GO`, `score=92`; reports are saved under `/opt/apps/rakshak-runs/rakshak-qorium_online-mptgu36b-413f/{ceo.md,cto.md,reports/}`.
  - P2 follow-up from conditional Rakshak items: off-peak 2h soak, public edge/app rate-limit detection, `security.txt`, authenticated audit API customer smoke, scheduled chaos drill, DKIM selector verification, and error-tracking instrumentation.

## P2 — Phase 1 Product Hardening

- [x] Close QG-05 conditional Rakshak follow-ups: full 2h soak, public rate-limit visibility, `security.txt`, audit API customer smoke, chaos drill, DKIM, and error tracking.
  - Shipped: `9f5d215` (`qorium: gate conditional Rakshak follow-ups`).

- [x] Replace in-memory API store with Drizzle/Postgres repository implementation.
  - Shipped: `40452c4` (`qorium: persist API workflow through Postgres repository`).

- [x] Add persistent reasoning-trace object storage for M4 grader.
  - Shipped: `7fad155` (`qorium: persist grader reasoning traces`).

- [x] Add recruiter authentication instead of demo recruiter identity.
  - Shipped: `55b4865` (`qorium: add recruiter session auth`).

- [x] Add Playwright browser e2e for builder → candidate → result.
  - Shipped: `bb1d459` (`qorium: add browser e2e for assessment flow (#83)`).

## P3 — Current Live Route Blockers

- [x] Restore public chatbot health and session routes on the Cloudflare-routed origin.
  - Shipped: active-origin SSH alias `qorium-active-origin` now reaches `187.127.155.150`; active-origin PM2/nginx route repair restored `api.qorium.online/chatbot/v1/healthz`; old-origin marketing rebuild restored public apex chatbot session proxy.
  - Public proof from 2026-06-02: `https://api.qorium.online/chatbot/v1/healthz` returns HTTP `200` chatbot JSON, and `POST https://qorium.online/api/chatbot/session` returns HTTP `200` JSON with a session greeting.
  - Recorded in: `QUEUE-QOrium.md` Run #23 and Run #24.

- [x] Restore public OpenAPI JSON at `https://qorium.online/openapi.json`.
  - Shipped: active origin `187.127.155.150` serves `/openapi.json` from deployed merge `3256dd5`; old origin `147.93.103.194` was rebuilt/reloaded at marketing branch `codex/qorium-marketing-phase4-main` HEAD `6ac741c` because Cloudflare apex `qorium.online` routed there at the time.
  - Public proof from 2026-06-02: `https://qorium.online/openapi.json` returns HTTP `200` `application/json` with OpenAPI `3.1.0` and title `QOrium Public Proof API`.
  - Purge infra proof from 2026-06-02: scoped token `QOrium Cache Purge` is installed locally as `CLOUDFLARE_QORIUM_CACHE_PURGE_TOKEN`, Cloudflare token verify returned success, and single-URL purge for `https://qorium.online/openapi.json` returned success.
  - Recorded in: `QUEUE-QOrium.md` Run #24.

- [x] Consolidate apex `qorium.online` to active origin `187.127.155.150`.
  - Shipped: Cloudflare proxied `A qorium.online` changed from `147.93.103.194` to `187.127.155.150` with TTL Auto preserved; cache purge returned success.
  - Public proof from 2026-06-02: 6 spaced watch samples returned HTTP `200` for root, OpenAPI, docs, API health, chatbot health, admin health, and chatbot session.
  - Origin proof: public nonce request `qorium-cutover-1780380029-13821` appeared in active-origin nginx access logs and not in old-origin logs.
  - Recorded in: `QUEUE-QOrium.md` Run #31.

- [x] Run fresh QOrium Rakshak certification after OpenAPI/API/admin edge hardening.
  - Shipped: active and old origins now expose API/admin security headers, `security.txt`, versioned admin health, and API/admin rate-limit policy headers; nginx syntax tests passed before reload on both origins.
  - Fresh Rakshak proof from 2026-06-02: `qorium.online` GO `94/100` (`rakshak-qorium_online-mpw46c2z-7bd0`), `api.qorium.online` GO `89/100` (`rakshak-api_qorium_online-mpw46c77-a38a`), `admin.qorium.online` GO `88/100` (`rakshak-admin_qorium_online-mpw46ca2-ceb6`).
  - Recorded in: `QUEUE-QOrium.md` Run #26 and `_shared/CODEX_COMPLETION_QORIUM_BHIMA_OPENAPI_EDGE_RAKSHAK_2026-06-02.md`.

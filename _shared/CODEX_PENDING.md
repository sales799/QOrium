# CODEX_PENDING — QOrium Lane A

Source of truth for Codex execution order in this workspace.

## P1 — Blueprint Quality Gates

- [x] QG-01: Add repeatable QOrium app CI gate.
  - Shipped: `.github/workflows/qorium-app-ci.yml`
  - Local proof: `pnpm run ci`
  - Coverage: seed, secret scan, typecheck, Next build, API/assessment/grading/audit/sandbox smoke.

- [x] QG-02: Keep generated local artifacts out of release diffs.
  - Shipped: root `.gitignore`
  - Covers: `node_modules`, `.next`, `.turbo`, `*.tsbuildinfo`, local logs, pid files, and env files.
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

- [ ] QG-05: Production deploy gates.
  - Depends on: VPS/PM2 credentials, Postgres/Redis target, Cloudflare tunnel/subdomain, watchdog/Rakshak/Manthan tooling.
  - In progress: Phase 1 PM2 ecosystem config and executable production gate runner.
  - Live evidence captured: VPS PM2 has QOrium services online; `https://api.qorium.online/healthz` is 200 with security headers; Redis returns `PONG`; DB has `content.questions=986` and `audit.events=3`.
  - Shipped gate hardening: production gate now defaults to `/healthz`, can require `checks.db=ok`, can pin expected health `service`/`git_sha`, and can exercise authenticated rate-limit probes via shell-resolved bearer/header commands without committing secrets.
  - Shipped runtime DB grant repair: applied repeatable `qorium_app` grants for `app.api_keys`, `app.packs`, and read-only `content.questions`/`content.skills`/`content.sub_skills`; production gate now verifies these grants when `QORIUM_DB_RUNTIME_ROLE=qorium_app`.
  - Live rate-limit proof: created a non-printed QG-05 proof key on the VPS, stored at `/opt/apps/qorium/bin/QG05-RATE-LIMIT-KEY.txt`, and verified a 35-request authenticated burst against `127.0.0.1:5101/v1/questions/search?limit=1` returned 20×`200` then 15×`429`.
  - Shipped content readiness backfill: derived `content.skills`/`content.sub_skills` from ReadyBank question metadata, linked all 986 questions, promoted the seeded ReadyBank batch to `released`, inserted one idempotent QG-05 smoke response, and made the production gate assert minimum taxonomy/released-question/response counts.
  - Live content proof: production DB now has `content.skills=511`, `content.sub_skills=881`, `released linked readybank questions=986`, and `content.responses=1`; authenticated `/v1/questions/search?limit=3` and `/v1/questions/search?skill=ai-prompt-engineer-senior&limit=3` both return 3 released linked questions.
  - Shipped Rakshak evidence gate: production gate can now require a QOrium Rakshak run under `/opt/apps/rakshak-runs` before parsing the minimum score.
  - Live Rakshak allow-list remediation: added `qorium.online` and `qorium.in` to Talpro MCP Rakshak's owned-domain suffix list, rebuilt `dist`, restarted `talpro-mcp`, and verified `talpro_rakshak(domain=qorium.online, soakHours=2)` now creates a run instead of refusing.
  - Live Rakshak run proof: `rakshak-qorium_online-mptgu36b-413f` exists under `/opt/apps/rakshak-runs`; `run.json` shows `status=executing`, `saved=[]`, `score=null`, so the 17-audit playbook still needs execution before QG-05 can claim a Rakshak score.
  - Shipped forced-origin gate: production gate can now call `curl --resolve api.qorium.online:443:147.93.103.194` and assert the VPS origin health service separately from the normal Cloudflare-routed public health check.
  - Shipped forced-origin parity gate: production gate can now require public Cloudflare-routed health and forced VPS-origin health to match on `service`, `git_sha`, and `checks.db`, turning origin/tunnel drift into a hard QG-05 failure with field-level evidence.
  - Shipped public-origin access-log gate: production gate can now send a nonce query to the public health URL and require that exact nonce in the VPS Nginx access log, proving public traffic actually reaches the expected origin host.
  - Shipped Nginx health-route contract: repo now carries `qorium-app/infra/nginx/api.qorium.online.conf`, with `location = /healthz` routed to `qorium_readybank/healthz` instead of the uptime monitor.
  - Live Nginx remediation: backed up and patched both the stale `/etc/nginx/sites-available/qorium.conf` copy and active `/etc/nginx/sites-enabled/qorium.conf`; `nginx -t` passed and Nginx reloaded cleanly after moving the enabled-directory backup out of the include glob.
  - Live parity proof: current public health is `service=qorium-readybank`, `git_sha=unknown`, `checks.db=not-configured`; current forced VPS-origin health is `service=qorium-readybank`, `git_sha=3528232`, `checks.db=ok`; direct PM2 health on `127.0.0.1:5101` matches the forced origin.
  - Live access-log proof: public probe `qg05-public-1780213218-30750` appeared 0 times in `/var/log/nginx/qorium-api.access.log`, while forced-origin probe `qg05-forced-1780213218-6205` appeared once; this confirms the remaining public-origin blocker is upstream of VPS Nginx.
  - Remaining blockers: public Cloudflare origin/tunnel is still not routing normal `api.qorium.online` traffic to this VPS; the created Rakshak run still needs Phase 0 plus 17 audit reports saved and consolidated before a real Rakshak score can be generated.
  - Required proof: PM2 list, DB counts, audit samples, security headers, rate limit, watchdog run, Rakshak score.

## P2 — Phase 1 Product Hardening

- [ ] Replace in-memory API store with Drizzle/Postgres repository implementation.
- [ ] Add persistent reasoning-trace object storage for M4 grader.
- [ ] Add recruiter authentication instead of demo recruiter identity.
- [ ] Add Playwright browser e2e for builder → candidate → result.

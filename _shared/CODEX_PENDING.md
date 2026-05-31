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
  - Remaining blockers: production health path is `/healthz`, public `/healthz` does not rate-limit under burst, `content.skills`/`content.responses` are 0, and no QOrium Rakshak run was found under `/opt/apps/rakshak-runs`.
  - Required proof: PM2 list, DB counts, audit samples, security headers, rate limit, watchdog run, Rakshak score.

## P2 — Phase 1 Product Hardening

- [ ] Replace in-memory API store with Drizzle/Postgres repository implementation.
- [ ] Add persistent reasoning-trace object storage for M4 grader.
- [ ] Add recruiter authentication instead of demo recruiter identity.
- [ ] Add Playwright browser e2e for builder → candidate → result.

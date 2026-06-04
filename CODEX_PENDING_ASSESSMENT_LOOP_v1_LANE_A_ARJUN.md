# CODEX_PENDING — Assessment Loop v1 · Lane A (ARJUN) · Frontend + Routing

**Spec:** `QORIUM_ASSESSMENT_LOOP_v1.md` (read first). **App:** `/opt/qorium/apps/candidate-portal` (Next.js, port 5116); admin review UI in `/opt/qorium/apps/admin`.
**Doctrine:** dependency-ready only · cross-account review (BHIMA approves your merges) · never self-merge · atomic release for live Next dirs · source `NEXT_PUBLIC_*` before build.

## Your branches (in order)

### BR-5 — Public routing  [deps: none — ship first, parallel to BR-1]
`candidate.qorium.online` currently serves the Talpro staffing homepage — wrong. Point it at
`candidate-portal:5116`.
- Edit the nginx server block for `candidate.qorium.online` (active origin `qorium-active-origin`)
  to `proxy_pass http://127.0.0.1:5116;` with standard headers; keep TLS.
- Back up the existing conf to `/root/nginx-config-backups/` first. `nginx -t` then reload.
- Decide `my.qorium.online`: keep as candidate self-serve dashboard OR redirect to candidate portal — confirm with CTO; default = leave `my.` untouched this branch.
- Verify: `curl -I https://candidate.qorium.online/` returns the candidate portal (not Talpro title).

### BR-6 — Candidate landing `/t/[token]`  [deps: BR-2 API]
`candidate-portal/src/app/t/[token]/page.tsx`: fetch `GET /v1/invitations/:token`; show
assessment title, #questions, time limit, candidate name; consent checkbox; "Start" →
`POST /v1/invitations/:token/start` → redirect to `/sessions/<attemptId>`. Handle expired/used invites.

### BR-7 — Test runner `/sessions/[id]`  [deps: BR-3 API]
Build out the existing `sessions/[id]/page.tsx` scaffold:
- Countdown timer (server `time_limit_sec`; auto-submit at 0).
- Question renderers: MCQ (radio), code (Monaco/CodeMirror, language from question), short-text.
- Per-question autosave → `POST /v1/attempts/:id/answer`; prev/next; progress bar.
- Anti-cheat → `integrity_events`: `visibilitychange` tab-switch count, paste capture,
  Fullscreen API request + exit detection, window blur/focus loss. Non-blocking, just logged.
- Submit → `POST /v1/attempts/:id/submit` → redirect to result.
Never request or render answer_key/rubric — candidate payloads are pre-sanitized server-side; do not re-fetch raw questions.

### BR-8 — Result + admin reasoning-trace review  [deps: BR-3]
- Candidate: `sessions/[id]/result/page.tsx` — total score, per-skill breakdown, pass/fail.
- Admin (`admin` app): `/attempts/[id]` — per-question response + score + `reasoning_trace` +
  rubric breakdown + integrity flags (this satisfies the "reasoning-trace in grading UI" checkbox).

## Quality gate
`next build` 0 err · `tsc --noEmit` 0 err · extensionless imports in apps/web · mobile-usable runner ·
open PR per branch, BHIMA account reviews, GBS merge · PRAHARI GO 80/80 before public/external use.

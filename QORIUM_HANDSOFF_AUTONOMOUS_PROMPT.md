# 🛡️ QORIUM HANDS-OFF AUTONOMOUS RUN — COPY-PASTE PROMPT v1.0

**Mission:** Break the 8-day dormancy (since Run #32, 2026-05-04). Execute MOVE 1 + MOVE 2 of the "Show before Build" restart plan, drain every Built-but-Idle item that can be done without CEO physical presence, refresh source-of-truth files, and consolidate the one remaining CEO ask (Move 3 + Amendment v2.1 ratification) into a single founder_request.

**Use:** Paste the block below as the *first message* of a fresh Claude Code session running in the QOrium repo (`sales799/QOrium`, working tree on a clean branch off `main`). The CTO Constitution v5.1 (Cowork Master), QOrium Constitution v2.0, all MCPs, and skills must already be wired into that session.

**Authoritative source state** (from CEO-supplied Live Progress Dashboard, 2026-05-12):
- Live: api.qorium.online (Surfaces 1–5); PM2 `qorium-readybank` :3050; VPS 147.93.103.194.
- Spec-ready, unmerged: Sprint 1.6 (`specs` branch) — JWT auth + login.html + migration 0004; SES/SendGrid mailer + migration 0005; Wave-1 ingest script (24 sources → ~470 rows); Oracle HCM 60/60 v0.6; Wave-3 Authoring Template v0.1 + Batch-001 (20 items).
- Parked: qorium.online apex (DNS-only, no site).
- DB: Postgres `qorium`, 13 tables / 2 schemas, ~10 questions in live DB vs. 791 v0.6 in files.

---

## 📋 COPY EVERYTHING BELOW THIS LINE INTO CLAUDE CODE

```
QORIUM HANDS-OFF AUTONOMOUS RUN — RESTART AFTER 8-DAY DORMANCY
================================================================
Role: Virtual CTO of QOrium (Talpro Universe product line), operating
under COWORK MASTER PROMPT v5.1 + QOrium Constitution v2.0 + 25 Standing
Orders + 92-pt Quality Gate. Both already loaded.

MODE: AUTONOMOUS_MAX. CEO has explicitly authorised:
  - No permission prompts. No "shall I?". No drip questions. No options.
  - Bypass all confirmations that would otherwise interrupt execution.
  - Where CEO PHYSICAL presence is the only blocker, log it — do not ask
    inline. Consolidate into ONE founder_request at the end.
  - Truth Hierarchy v5.1: live tool output > session reads > memory >
    CEO message > prior turns > prompts. No baked state cited.

GOVERNING DOCUMENT — execute against the Live Progress Dashboard
(2026-05-12) restart plan:
  MOVE 1 — Bridge Sprint 1.6 (specs branch → main) + e2e demo capture
  MOVE 2 — Build & deploy apex marketing site at qorium.online
  PARALLEL — Drain Built-but-Idle items that need no CEO action
  MOVE 3 — REQUIRES CEO + Talpro Delivery Head physical action.
           Do NOT attempt. Log into consolidated founder_request.

============================================================
PHASE 0 — BOOT (silent; emit only the summary block)
============================================================
Parallel where possible. Retry once on failure, then proceed.

  1.  talpro_cto_constitution(part: "full")
  2.  WebFetch https://raw.githubusercontent.com/sales799/claude-brain/main/context.md
  3.  project_context_all                         (chunk-read if >80KB)
  4.  project_read_file("_shared", "QUEUE.md")
  5.  project_read_file("QOrium", "QORIUM-MISSION-CONTROL.md")
  6.  project_read_file("QOrium", "IMPLEMENTATION-PROGRESS-TRACKER.md")
  7.  project_read_file("QOrium", "governance/QORIUM-Sprint-Plan-v1.md")
  8.  project_read_file("QOrium",
        "governance/Cowork-to-Stream-B-Bridge-Protocol-v1.md")
  9.  project_read_file("QOrium", "09-QOrium-Constitution-v2.0.docx")
        (parse via docx skill if needed)
  10. project_search("QOrium", "infra/sprint-1.6")
  11. manthan_list                                (filter project=qorium)
  12. talpro_pm2_list                             (focus qorium-readybank)
  13. talpro_pm2_detail("qorium-readybank")
  14. talpro_pm2_logs("qorium-readybank", lines: 200)
  15. talpro_db_query("qorium",
        "SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables
         ORDER BY n_live_tup DESC")
  16. talpro_db_query("qorium",
        "SELECT count(*) AS live_questions FROM app.questions")
  17. talpro_db_query("qorium",
        "SELECT count(*) AS sessions, count(*) FILTER (WHERE finished_at
         IS NOT NULL) AS completed FROM app.sessions")
  18. talpro_nginx_status                         (qorium.online vhost)
  19. talpro_ssl_status                           (api.qorium.online +
                                                   qorium.online)
  20. talpro_watchdog_list                        (qorium-* watchdogs)
  21. talpro_bash_exec("cd /var/www/qorium && git status && git log
        --oneline -20 && git branch -a")
  22. session_list_recent
  23. read auto-memory MEMORY.md + qorium_* entries

OUTPUT the v5.1 boot summary — exactly this shape, nothing else:

  ✅ Loaded: {N} projects | {M} MANTHAN | PM2 qorium-readybank: {state}
  📋 Queue: {pending} QOrium items | {blocked} blocked | last update {d}d ago
  🗄️  DB: {live_questions} questions live | {target 470} | {sessions} sessions
  🌐 Surfaces: api ✅ recruiter ✅ take ✅ result ✅ watermark ✅ apex ❌
  🔴 Errored / drift: {list} | (none)
  🌿 Git: main @ {sha}; specs branch ahead by {N}; bridge needed: YES/NO
  🎯 Next: MOVE 1 bridge + e2e → MOVE 2 apex → parallel drains

============================================================
PHASE 1 — MOVE 1: BRIDGE SPRINT 1.6 → main + E2E DEMO
============================================================
Goal: Sprint 1.6 production-merged; recruiter can log in with JWT;
candidate gets a real invite email; live DB has full Wave-1 question
library; 90-sec e2e screen recording captured for CEO.

Operational sequence:

  1.1 project_work_lock("QOrium").
  1.2 git checkout main && git pull --ff-only.
  1.3 git checkout -b release/sprint-1.6-bridge.
  1.4 Cherry-pick / merge specs branch components in order:
        a) migration 0004_recruiter_auth.sql
        b) JWT auth route + login.html + cookie middleware
        c) migration 0005_invites.sql + driver-agnostic mailer
           (SES/SendGrid/mock provider abstraction)
        d) Wave-1 ingest script (24 sources → ~470 rows)
        e) Oracle HCM 60/60 v0.6 question set
      Resolve any conflicts against existing main code.
  1.5 Local validation:
        npm ci
        npm run build           → zero TS errors
        npx tsc --noEmit        → zero errors
        npm test                → all green
        gitleaks detect         → zero secrets
  1.6 Migrations:
        psql qorium -f migrations/0004_recruiter_auth.sql
        psql qorium -f migrations/0005_invites.sql
        Verify table presence via information_schema.
  1.7 Wave-1 ingest:
        node scripts/wave1-ingest.js --commit
        Verify: SELECT count(*) FROM app.questions → expect ≥470.
        Verify: SELECT skill, count(*) FROM app.questions GROUP BY skill
                → expect Java/SQL/REST/Spring/etc. distribution.
  1.8 Seed one real recruiter account (Talpro Delivery Head):
        INSERT into app.recruiters (email, tenant_id, password_hash …)
        — email placeholder "delivery-head@talpro.in"; argon2id hash of a
        single-use temp password. Surface the temp password in the
        founder_request — never the hash, never in logs.
  1.9 PR + merge:
        gh pr create --base main --head release/sprint-1.6-bridge \
          --title "Sprint 1.6 bridge: JWT auth, invites, Wave-1 ingest" \
          --body <heredoc with summary + test plan>
        gh pr merge --squash --auto.
  1.10 Deploy:
        ssh root@147.93.103.194 (or talpro_bash_exec):
          cd /var/www/qorium && git fetch && git checkout main && git pull
          npm ci --omit=dev
          npm run build
          pm2 reload qorium-readybank
          pm2 save
  1.11 Smoke gates:
          curl -I https://api.qorium.online/healthz  → 200 + HSTS + X-Frame
          POST /v1/auth/login (test recruiter)        → 200 + Set-Cookie
          GET  /v1/auth/whoami                        → 200 with claims
          POST /v1/sessions                           → 201 + session_token
          GET  /take/<token>                          → 200 + question
          POST /v1/sessions/<id>/answer (×N)          → 200
          GET  /v1/results/<candidate_id>             → 200 HTML+JSON
          Invite email via mock provider              → delivered log entry
          talpro_smoke_tests                          → 21-point E2E
  1.12 watchdog_add for JWT login endpoint + invite-sender heartbeat.
  1.13 90-second screen recording:
        Use chrome MCP to drive the demo flow against api.qorium.online:
          - Recruiter login (JWT cookie)
          - Create session for "QORIUM-DEMO-002" candidate
          - Copy take URL
          - Open take URL in second tab; answer 5 questions
          - Auto-redirect to result page
          - Open recruiter dashboard; observe new completed row
        Capture page screenshots at each step; assemble into a single
        contact sheet PNG at /var/www/qorium/demos/move1-e2e-2026-05-12.png.
        Note: full screen-VIDEO capture requires CEO desktop. If chrome
        MCP cannot screen-record, produce the contact sheet PNG + a
        timestamped action log instead. Log this substitution.
  1.14 project_work_unlock("QOrium").
  1.15 QUEUE.md: move every MOVE 1 sub-task to DONE with PR URL + SHA.
  1.16 task_plan.md (QOrium): Sprint 1.6 row → DONE; Sprint 1.0 row →
        "6/7 GREEN — only real candidate remains (Move 3)".

If any sub-step fails:
  - 3 retries → reclassify the FAILED component as CEO_BLOCKED with
    the exact log line.
  - Do NOT block Phase 2. MOVE 1 partial is acceptable; MOVE 2 is
    independent.

============================================================
PHASE 2 — MOVE 2: APEX MARKETING SITE AT qorium.online
============================================================
Goal: Single-page marketing homepage live at https://qorium.online,
brand-aligned, mobile-first, under 1 working session. Source content:
QORIUM-CEO-Pre-Customer-Zero-Deck-v1.pptx + Constitution v2.0 §1.2
(3 SKUs) + §10.3 (anti-leak moat positioning).

Stack (per CTO frontend governance — NON-NEGOTIABLE):
  - Next.js 14 (app router) + TypeScript
  - Tailwind v4 + shadcn/ui + Aceternity UI + Magic UI + Motion v12
  - NO Inter / Roboto / Arial / system fonts
  - NO MUI / Ant / Chakra / Bootstrap / Daisy UI
  - NO purple-on-white gradients
  - NO sections without entrance animations
  - NO default shadcn theme colours — use QOrium Midnight-Executive
    theme (matches recruiter dashboard SPA)

Sections (mandatory, in this order):
  1. Hero — single-line value prop + sub + dual CTA (Request Demo +
     Recruiter Login)
  2. The Problem — 3 cards (leak risk · AI cheating · uncalibrated Qs)
  3. The 3 SKUs — ReadyBank · JD-Forge · Stack-Vault (per Constitution
     §1.2 LOCKED copy)
  4. Anti-leak moat — Watermark Engine + 10K-candidate uniform proof
     viz (animated SVG)
  5. Customer-Zero proof — Talpro Java pilot story (placeholder until
     Move 3; show "Pilot in progress" badge if no real candidate yet)
  6. Pricing — Per-Constitution: API-key (free pilot) · Per-test ·
     Enterprise SAML
  7. Request-a-demo form — Resend/SES backed; posts to
     POST /v1/marketing/leads (new route — Phase 2.5 below)
  8. Footer — Constitution badge · Status page link · /healthz link

Operational sequence:

  2.1 git checkout main && git pull.
  2.2 git checkout -b feature/apex-site.
  2.3 Bootstrap:
        npx create-next-app@latest apps/apex --typescript --tailwind \
          --eslint --app --src-dir --import-alias "@/*"
        Install shadcn/ui, aceternity, magic-ui, motion@12.
        Apply Midnight-Executive theme tokens from existing
        /recruiter/dashboard.html (extract CSS vars).
  2.4 Build all 8 sections per ordered list above. Pull copy from:
        - governance/decks/QORIUM-CEO-Pre-Customer-Zero-Deck-v1.pptx
          (parse with pptx skill — extract slide text verbatim where
           appropriate)
        - 09-QOrium-Constitution-v2.0.docx §1.2 (SKU copy LOCKED)
        - 09-QOrium-Constitution-v2.0.docx §10.3 (competitive watch
          → anti-leak positioning)
      DO NOT invent claims. Every metric must be sourced.
  2.5 New API route (server side):
        POST /v1/marketing/leads { name, email, company, use_case }
        Validate, rate-limit (10r/s), insert into new
        migration 0006_marketing_leads.sql, send notification email
        to bhaskar@talpro.in via existing driver-agnostic mailer.
  2.6 SEO: title/description/og-image, sitemap.xml, robots.txt,
      JSON-LD Organization schema.
  2.7 Performance gate:
        npm run build
        Lighthouse local audit → Performance ≥90, Accessibility ≥95,
        SEO ≥95, Best Practices ≥95.
  2.8 DNS + Nginx (VPS 147.93.103.194):
        Update Nginx server block for qorium.online → reverse proxy to
        new Next.js app (PM2 cluster, new port from PORT_REGISTRY.md).
        Verify HSTS + security headers parity with api.qorium.online.
        certbot --nginx -d qorium.online -d www.qorium.online.
  2.9 PM2 + smoke:
        pm2 start ecosystem.apex.config.js
        pm2 save
        curl -I https://qorium.online       → 200 + HSTS + X-Frame
        curl -I https://www.qorium.online   → 301 → apex
        Submit lead form via curl           → 200 + DB row
        talpro_watchdog_add for /healthz and form-post heartbeat.
  2.10 PR + merge feature/apex-site → main.
  2.11 QUEUE.md: MOVE 2 → DONE with URL + SHA + Lighthouse score.

============================================================
PHASE 3 — PARALLEL DRAIN (Built-but-Idle items)
============================================================
Execute every item below that can be completed without CEO physical
presence. Each landing in the appropriate Built/QUEUE bucket as DONE.

  3.1 K&S Partners IP-counsel chase email
      - Draft per existing CC-02-A thread tone.
      - Use Gmail MCP create_draft (do not auto-send if domain rules
        require human send; if auto-send is allowed for this thread,
        send and log message ID).
      - Default behaviour: create_draft → CEO clicks send. Add to
        founder_request.
  3.2 Bosch GCC warm-intro email
      - 3 versions already exist; pick the strongest, finalise.
      - create_draft via Gmail MCP. Add to founder_request for CEO send.
  3.3 5 hire JDs publishing
      - Posts to Naukri/LinkedIn require human-API auth → cannot post
        autonomously. Instead: produce final-formatted post copy per
        platform (LinkedIn long-post, Naukri rich-text) and stage in
        governance/jds-ready-to-post/. Add to founder_request.
  3.4 Investor Brief Pre-A v1.2 finalisation
      - Convert draft to final via docx skill; embed updated metrics
        from live DB; export as PDF; place in governance/investor/.
      - Add to founder_request as "ready to circulate".
  3.5 Anti-leak / AI-plagiarism / IRT cron jobs
      - Verify cron entries on VPS (talpro_cron_lint).
      - Run one-shot manual invocation now that DB has real Wave-1
        questions (post-Phase 1). Capture run reports.
      - File reports under reports/<date>/. Log to QUEUE DONE.
  3.6 Mission Control auto-refresh
      - Update QORIUM-MISSION-CONTROL.md and
        IMPLEMENTATION-PROGRESS-TRACKER.md with this run's outcomes.
        Add new run row "Run #33 — 2026-05-12 — Dormancy break:
        MOVE 1 + MOVE 2 shipped".
      - Refresh the live dashboard artifact (the PDF source) — push to
        cowork artifact `qorium-live-progress`.
      - Update scheduled task `refresh-qorium-dashboard` next-run check.
  3.7 Wave-3 Authoring Template + Batch-001 staging
      - Already AUTHORED; leave in governance/wave-3/ awaiting CEO YES/NO
        on Amendment v2.1. Do NOT ingest. Add CEO YES/NO ask to
        founder_request.
  3.8 Internal API key for Talpro tenant
      - Mint a fresh HMAC-SHA256 recruiter API key for tenant
        "talpro-india" via existing key-issuance script.
      - Email to bhaskar@talpro.in via create_draft (never plaintext in
        founder_request, never in logs).
  3.9 Demo videos (5-min "Your JD → Our Pack")
      - SKIP this run — requires SKU 2 JD-Forge UI (Not Started).
      - Log to QUEUE as DEFERRED until SKU 2 spec exists.
  3.10 NSDC/NOS vocational mapping
      - Pull NSDC NOS codes for the 4 in-DB skill clusters (Java/SQL/
        REST/Spring). Stage mapping CSV in governance/nsdc-mapping.csv.
        Mark as v0.1 pilot; full sweep awaits Sprint 1.7.

============================================================
PHASE 4 — QUALITY GATE (92-pt QOrium Constitution Gate)
============================================================
Mental + measured pass on every deploy from Phases 1 and 2:
  - Security (24)        — HSTS, CSP, X-Frame, rate-limit, argon2id,
                            JWT cookie HttpOnly+Secure+SameSite=Lax,
                            no secrets in repo
  - Reliability (20)     — PM2 cluster, watchdogs, /healthz, log rota
  - Build/QA (16)        — zero TS errors, tests green, gitleaks clean
  - Performance (12)     — Lighthouse ≥90, p95 API <250ms
  - Compliance (10)      — RFC 7807 error contract, audit log present
  - Anti-leak moat (10)  — Watermark engine permutation uniform
  - Constitution (Quality of execution against 25 SOs)

Record score in CTO Report. Anything <80/92 → log specific gap in
QUEUE for next session; do NOT block this run.

============================================================
PHASE 5 — CONSOLIDATED CEO ASK (founder_request)
============================================================
Aggregate every CEO_BLOCKED item into ONE founder_request:

  founder_request({
    title: "QOrium dormancy-break run — consolidated CEO asks",
    items: [
      "MOVE 3 — Trigger first REAL Talpro candidate (you + Talpro
        Delivery Head; ~30 min; uses the temp recruiter creds emailed
        separately)",
      "Amendment v2.1 — YES/NO ratification for Wave-3 Psychometric
        20-item Batch-001 (governance/wave-3/Batch-001.md; 30-min read)",
      "K&S Partners IP chase — review and send the drafted reply in
        Gmail (draft ID …)",
      "Bosch GCC warm-intro — review and send the drafted email
        (draft ID …)",
      "Post 5 hire JDs — copy from governance/jds-ready-to-post/ into
        LinkedIn + Naukri; templates already platform-formatted",
      "Investor Brief Pre-A v1.2 — review final PDF in
        governance/investor/ before circulating"
    ],
    priority: "high",
    due: "2026-05-15"
  })

If a Phase failed entirely, prepend the failure as item 0 with
the exact failing log line.

============================================================
PHASE 6 — CLOSEOUT (non-negotiable)
============================================================
Before ending:
  1. QUEUE.md → every executed item in DONE with date + evidence URL/SHA.
  2. QOrium task_plan.md → Sprint 1.6 = DONE; Apex site = DONE; Sprint
     1.0 = 6/7 with Move 3 blocker.
  3. manthan_save → "Run #33 — dormancy-break — MOVE 1 + MOVE 2 + drain".
  4. Auto-memory → write ONE long-horizon fact: "QOrium Sprint 1.6
     production-merged 2026-05-12; apex live; only Move 3 pending."
     Skip if not material.
  5. session_save_state → full snapshot.
  6. Update cowork artifact `qorium-live-progress` to reflect new state.
  7. Emit CTO Report as the LAST message (≤15 lines):

        ## CTO REPORT
        Task:         QOrium dormancy-break — MOVE 1 + MOVE 2 + drain
        Result:       MOVE 1 {PASS/PARTIAL}; MOVE 2 {PASS/PARTIAL}; drain {N/M}
        Files:        {count} touched across qorium repo + governance/
        Deployed:     api.qorium.online 200 ✅ ; qorium.online 200 ✅
        Sprint 1.0:   {6/7 or 7/7} GREEN
        Sprint 1.6:   {merged sha or partial state}
        DB:           {N} questions live (was ~10)
        Quality Gate: {X}/92
        Blocked:      {N} items → founder_request {ID}
        Next:         Move 3 (CEO action) → Sprint 1.7

============================================================
EXIT CRITERIA (all must be true)
============================================================
  ✅ Boot summary emitted from live tool calls only.
  ✅ MOVE 1 either shipped to main OR partial state explicitly logged.
  ✅ MOVE 2 either live at qorium.online OR partial state explicitly logged.
  ✅ Zero errored qorium-* PM2 processes.
  ✅ Wave-1 question count in live DB ≥470 (or explicit failure log).
  ✅ ≥5 Built-but-Idle drain items in Phase 3 closed or DEFERRED with reason.
  ✅ Exactly ONE founder_request emitted with all CEO asks (zero if none).
  ✅ Source-of-truth files refreshed (Mission Control + Progress Tracker).
  ✅ session_save_state snapshot exists.
  ✅ CTO Report is the last message — no postamble.

============================================================
NON-NEGOTIABLES (re-stated for emphasis)
============================================================
  - QOrium Constitution §1.2 SKU copy is LOCKED — never reword.
  - 92-pt Quality Gate non-bypassable.
  - Stream-A ↔ Stream-B Bridge Protocol must be followed for any
    cross-stream merge — read it in step 0.8.
  - No new product features outside Sprint 1.6 + apex site scope.
  - No financial actions on CEO's behalf.
  - No posting on LinkedIn/Naukri on CEO's behalf — stage, do not post.
  - No sending email on CEO's behalf for high-stakes threads (IP
    counsel, prospective customers, investors) — create_draft only.
  - No Ollama anywhere. No UFW on VPS. No 0.0.0.0 Docker binds.
  - No --no-verify. No skipped tsc/lint. No secrets in repo.
  - No purple-on-white gradients in apex site.
  - No Inter/Roboto/Arial fonts.

BEGIN PHASE 0 NOW. SILENT BOOT. EMIT SUMMARY. THEN EXECUTE.
```

---

## ⚙️ HOW TO USE THIS PROMPT

1. Open a **fresh Claude Code session** in the QOrium repo root (or wherever Talpro Universe MCPs + QOrium project tools are loaded).
2. Confirm `git status` is clean on `main`.
3. Confirm VPS access (`talpro_bash_exec` working against 147.93.103.194).
4. Copy everything between the triple-backticks above.
5. Paste as the first user message.
6. Walk away. Expected runtime: 90–180 minutes depending on cherry-pick conflict severity and apex site iteration count.
7. When the `## CTO REPORT` block appears, open the consolidated `founder_request` — that's your todo list for the next 48 hours.

## 🔁 RE-RUN CADENCE

After this run succeeds, the next QOrium hands-off run should focus on **Sprint 1.7** (SES domain verification + DKIM/SPF/DMARC + SAML/SSO spec + NSDC/NOS mapping pilot). A follow-up template can be authored from this one with the Phase 1 section replaced.

## 📌 WHAT THIS PROMPT INTENTIONALLY WILL NOT DO

- It will not run Move 3 (real candidate event) — that requires CEO + Talpro Delivery Head presence.
- It will not send emails on the CEO's behalf for high-stakes threads (IP counsel, Bosch, investors). Drafts only.
- It will not post hire JDs to LinkedIn/Naukri (no autonomous auth pathway).
- It will not ingest Wave-3 Psychometric items (blocked on Amendment v2.1 ratification — CEO YES/NO).
- It will not invent claims for the apex marketing site — every metric is sourced from Constitution v2.0 or live DB.

These are intentional. Loosening them requires editing this prompt or the QOrium Constitution itself.

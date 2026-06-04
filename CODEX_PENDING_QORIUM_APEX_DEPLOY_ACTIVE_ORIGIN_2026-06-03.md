# CODEX PENDING — Deploy QOrium apex content to the ACTIVE origin (2026-06-03)

**Priority:** HIGH (CEO-visible).
**Type:** Deploy only. No code changes. Content commits already done + pushed to origin/main.

## UPDATE 2026-06-03 (round 2 — inner pages)
Two content commits are now on `origin/main`, both content-only (design untouched):
- `c436ac3` — homepage build-voice → buyer-POV (ALREADY LIVE on active origin; Codex deployed it earlier).
- `4284a80` — **NEW: inner pages** (platform product pages, solutions, features): removed flag-narration proof lines ("render only after the backing evidence flag", "No external customer logo… unless a separate evidence flag"), the "Proof posture / What this page can claim today / Evidence-gated selling" block, "Buyer route" funnel label, and **evidence-gating violations** (named non-customer "Bosch GCC Bengaluru" + "expect 5 Stack-Vault logos at ₹70L" + "first three platform partners now"). All passed prettier/eslint/gitleaks/TS-parse. Validated on standby (147) build.

- `cafe5ed` — **NEW: removed Bosch/TCS as named customers** from the /features/stack-vault mock (`/sv/your-company`, `customer_id=your-company`), nav `site.config.ts`, styleguide, and the role-graph blog (evidence-gating). Validated on standby (147): `/features/stack-vault` shows `your-company`, no "bosch".

**Action:** deploy latest `origin/main` (**`cafe5ed`**, includes 4284a80) on the ACTIVE origin (187.127.155.150): `cd /opt/apps/qorium-marketing && git fetch && safe-deploy qorium-marketing`.
**Cloudflare:** purge NO LONGER required — the HTML cache-bypass rule is live (cf-cache-status DYNAMIC). New content shows immediately after the active-origin reload.
**Verify:** `curl -s https://qorium.online/platform/stack-vault | grep -i Bosch` → empty; spot-check /solutions/* and /platform/* read buyer-POV.

---
### (round 1 — original brief below)

## Context (verified by Cowork)
- Buyer-POV content rewrite is committed as **`c436ac3`** ("content(marketing): rewrite home build-voice to buyer-POV; design unchanged") and **already pushed to `origin/main`** (github sales799/qorium). Files: `apps/marketing/src/content/copy/phase2.ts` + `apps/marketing/src/components/marketing/PhaseTwoPages.tsx` (string literals only; design untouched; prettier/eslint/gitleaks passed; TS parse OK).
- Cowork deployed it on the **standby origin 147.93.103.194** (`safe-deploy` GBS job 8019c096 = done, exit 0). That box's nginx + `:5110` serve the NEW content (verified via `--resolve qorium.online:443:127.0.0.1`).
- **BUT the live apex (Cloudflare) is served from the ACTIVE origin `187.127.155.150`** (per CLAUDE.md PM2 ground truth: "production routing consolidated to active origin 187.127.155.150 for qorium.online"). That box still runs the OLD build. Cowork could not reach 187 from 147 (SSH key denied / port timeout), so the active-origin deploy is pending.

## Task — run on the ACTIVE origin (187.127.155.150)
From a machine that can SSH to the active origin (BHIMA/ARJUN via `qorium-active-origin` alias):

```bash
ssh qorium-active-origin
cd /opt/apps/qorium-marketing
git fetch origin main && git log -1 origin/main --oneline   # expect c436ac3 present
safe-deploy qorium-marketing                                 # GBS atomic: git reset origin/main -> build -> pm2 reload
```
Wait for the GBS job to reach `done` exit 0 (`/usr/local/bin/gbs-cli` enqueues; check via GBS history/queue). Builds stage in /tmp (gate enforces).

## Then bust Cloudflare cache
Next sends `cache-control: s-maxage=31536000` on the HTML, so Cloudflare caches `/` for a year.
- Purge via API if a purge-capable token exists: `POST https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/purge_cache` with `{"purge_everything":true}`. (Cowork found NO purge-capable token on 147; the certbot token returns auth error 10000 — use a real Cache Purge token.)
- If no token: CEO clicks Cloudflare → qorium.online → Caching → **Purge Everything** (already did once; must repeat AFTER the active-origin deploy).
- **Recommended permanent fix:** add a Cloudflare cache rule to **bypass cache for HTML** on qorium.online (or lower `s-maxage` on document responses), so future content deploys don't need a manual purge.

## Verify (must pass)
```bash
curl -s https://qorium.online/ | grep -o "Three ways to buy"                 # present
curl -s https://qorium.online/ | grep -o "buying motions\|Eight-dimension"   # empty
```
Also confirm the design is unchanged (screenshot diff vs current). Run Rakshak on qorium.online; log SHA + result to QUEUE-QOrium.md.

## Guardrails
- Do NOT change any component/CSS/layout — content deploy only.
- Cross-account review not required for a deploy of an already-reviewed commit, but the account that deploys should not be the same one that would later self-approve a merge of new code.
- If the active origin's `/opt/apps/qorium-marketing` is NOT on `main` or is dirty, stop and report — do not force.

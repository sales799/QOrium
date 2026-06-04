# QOrium Fleet Run Book — 2026-06-03 (CEO = fleet manager, CTO = monitor)

Two machines, two lanes, parallel. CTO (Cowork/VPS) monitors + verifies each branch till 100%.

## Machine split
- **BHIMA — Mac Pro (bhaskar@talpro.in)** = backend + candidate-app + infra (Lane A).
- **ARJUN — Mac Air (bhaskar@talproindia.com)** = marketing site + trust pages (Lane B).
Ordering rule: openapi restore + /library regen before pages that reference them. Otherwise parallel.

## PROMPT 1 → Codex/Claude Code on BHIMA (Mac Pro)
(paste the BHIMA block from chat — executes briefs: PHASE_A_PROOF_LOOP, PHASE_A_ENGINE_FINDINGS, PHASE_D_INTEGRATION, M5_M6_APTITUDE_VIDEO, PHASE_G_ENTERPRISE. Guardrails: cross-account review, backup+txn, RLS staging-only-with-app-wiring, irt_status=model-estimated, AI-verified≠SME, India storage. Report SHA+evidence per branch.)

## PROMPT 2 → Codex/Claude Code on ARJUN (Mac Air)
(paste the ARJUN block from chat — executes: PHASE_B_SITE_HARDENING + PHASE_B_CONTENT_PACK, PHASE_C_DEFENSIBILITY + PACK. Library regen, collapse platform/features, 5 compare pages, /pricing ₹4999/19999/Custom + JSON-LD, llms.txt, trust pages, residency VERIFIED, bias-audit "scheduled". Atomic-release. IRT honest label. Cross-account review. Cloudflare purge after deploy.)

## CEO-only manual step
Cloudflare → Caching → Purge Everything after each ARJUN site deploy (apex cached ~1yr). Or give Codex a purge-capable CF API token.

## Definition of 100% (CTO verifies each from VPS)
- BHIMA: candidate can be sent a pack → completes → scored response in content.responses with reasoning trace; calibration lifecycle flips at 50 responses; openapi.json=200; JD-Forge ≤60s ≥70% accept; RLS on 10 tables (staging-verified) + app wiring; SSO 3 IdPs green; video record→transcribe→grade for 1 candidate (India storage).
- ARJUN: 0 fragmented /library URLs; one canonical /platform; 5 compare pages live; /pricing live w/ schema; llms.txt live; /trust pages live (residency VERIFIED, bias "scheduled"); Rakshak SEO ≥90.
- Then: real Talpro candidates flow → IRT auto-calibrates → "empirical" flips true on the Live Build Tracker. Pilots sign → Phase E exit.

## Monitoring protocol
CEO says "BHIMA done <branch>" / "ARJUN deployed" → CTO verifies via curl/DB/pm2/Rakshak and replies GREEN or exact failure. CTO keeps the Live Build Tracker honest (🟢 built vs 📋 pending) until every item is 🟢.

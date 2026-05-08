# CEO Decision Packet — Human-Lane Unblockers

**For:** Bhaskar (CEO) + Manthan + Talpro CTO
**Authored by:** CTO Office (autonomous agent)
**Date:** 2026-05-08
**Status:** Decision-ready. Each item has a recommended path; reviewers leave inline GitHub comments approving / counter-proposing.
**Read time:** ~25 minutes for all six items. Each section is decision-self-contained — read in any order.

---

## §0 — Why this packet exists

Auto-mode lane is at the structural ceiling (33/33 engineering-complete, master meter 0.78). The next 0.22 — the entire path from "engineering ready" to "$50M ARR / $300M acquisition / IPO" per Constitution Article IX — runs through six human-bound actions. Each is blocked on a CEO-class decision, not on engineering work.

This packet exists to make those decisions cheap. For each item:

1. **Status quo** — what's true today + what's blocked.
2. **Options** — 2-3 paths the CEO could take, with honest trade-offs.
3. **CTO recommendation** — one option, with reasoning.
4. **Cost** — money + time.
5. **Risk if we don't decide soon** — opportunity cost made concrete.
6. **Owner + next step** — exactly who does what, in what order.

Where I (the agent) cannot execute, I say so. Where I can prep further before the human acts, I say that too — and offer to do it.

**Constitutional compliance:** none of these items is an autonomous-mode action. Every recommendation respects Auto-Mode Charter §3 stop conditions. The agent does not commit money, send outbound human messages, drop credentials, or touch Constitutional articles. This packet is *analysis to drive decisions* — itself a governance doc, which IS auto-eligible.

---

## §1 — Production cred-drop to `.env.bootstrap`

### Status quo

- Three IaC modules sit in `infra/auto-bootstrap/` waiting to apply:
  - `email-auth.tf` — SES domain identity + DKIM/SPF/DMARC for transactional email
  - `observability.tf` — Grafana Cloud + Sentry org + per-service projects
  - `pitr.tf` — cross-region S3 backup vaults + AWS Backup plans + KMS keys
- Each module's apply hard-fails without `BOOTSTRAP_AUTHORIZED=true ./apply.sh <module>`.
- `terraform plan` is green for each (or will be once provider tokens exist).
- The agent has NEVER touched `.env.bootstrap` and never will.

### What unblocks

- **SES apply:** customers receive verified-domain email (login OTP, recruiter invitations, candidate result links). Currently mailer is in mock mode.
- **Observability apply:** SLO alarms, Grafana dashboards, Sentry error tracking. Currently zero production visibility outside CloudWatch.
- **PITR apply:** RPO 5 min / RTO 1 h. Currently zero off-prod backup; a single bad migration is unrecoverable.

### Options

**A. Drop credentials all at once (one cred-drop session, ~2 hours).**
- CEO opens AWS console, creates IAM users for Terraform, generates Grafana Cloud + Sentry tokens, edits `.env.bootstrap`, runs `apply.sh email-auth` then `observability` then `pitr`.
- Pro: single context-switch; everything live before next sprint.
- Con: any single mistake (token scope, region, etc.) blocks all three.

**B. Stagger the drops over 3 days.**
- Day 1: SES (smallest blast radius; just transactional email).
- Day 2: PITR (data resilience; can't be undone but can't break runtime).
- Day 3: Observability (most provider-touch; Grafana + Sentry both involve account setup).
- Pro: each day is ~30 min; one mistake doesn't cascade.
- Con: 3-day delay vs option A on the highest-leverage item (PITR).

**C. Defer until first paying customer.**
- Run on mock mailer + zero observability + no off-prod backups until revenue pressure forces the issue.
- Pro: zero CEO time spent.
- Con: an outage during Customer-Zero with no observability + no PITR is reputationally catastrophic. Strong reject.

### CTO recommendation: **Option B (staggered, 3 days)**

- Smallest mistake-blast-radius per session.
- PITR before Customer-Zero is non-negotiable from a fiduciary standpoint — the moment the first real candidate's data is in prod, "no backup" becomes a duty-of-care violation.
- Day-1 SES verifies the domain (which can take 24-72 h on its own); start it first to overlap waiting time.

### Cost

- **Money:** ~₹0 ongoing for AWS Backup + SES (under free tier for our volume). Grafana Cloud free tier covers <10K active series — sufficient for 6+ months. Sentry developer tier free up to 5K events/month. Estimate: ₹0 month 1, ₹4-8K/month at 6-month mark, ₹15-30K/month at 12-month.
- **CEO time:** ~30 min × 3 days = 1.5 hours total.
- **Engineering time post-cred-drop:** the agent runs the smoke-test playbook in `governance/observability-runbook.md` + `governance/dr-runbook.md` autonomously once the env vars are in place.

### Risk if delayed beyond 14 days

- Customer-Zero candidate cannot legally complete without verified-sender email (Talpro Delivery Head will not authorize a real candidate against a Sandbox-only SES account).
- Engineering velocity drops: "we can't measure if the deploy regressed anything" forces conservative deploy cadence.
- Insurance / SOC2 readiness defers another quarter.

### Owner + next step

- **Owner:** CEO (only person with the AWS root account + payment method to bind providers).
- **Next step (today):** open the AWS console, create one IAM user `qorium-bootstrap-tf` with the policies attached (list in `infra/auto-bootstrap/README.md`). I'll prep the precise IAM JSON in a follow-up commit if requested. Generate access key + secret. Place in `.env.bootstrap`. Run `BOOTSTRAP_AUTHORIZED=true ./apply.sh email-auth`.
- **What I can do to make this faster:** I can write a `cred-drop-runbook.md` with copy-pasteable AWS CLI commands for the IAM user creation (no policy assumptions, just commands). Authorize and I'll have it on `main` in 30 minutes.

---

## §2 — Reference Panel ≥200 + I/O Psychologist contractor

### Status quo

- `customer-zero/Reference-Panel-Governance-v0.md` specifies 50→100→250 cohort ramp.
- `packages/irt` ships 2PL/3PL probability + ability MLE + JMLE calibration + Mantel-Haenszel DIF + SO-21 quality gate, all unit-tested. Library is ready.
- `services/readybank` exposes `POST /v1/reference-panel/responses` with HMAC-pepper-bound panel tokens + migration 0007 + middleware. API is ready.
- **Zero panel members recruited.** Zero responses ingested. Calibration cannot run; SO-21 gate cannot enforce.
- I/O Psychologist contractor SOW (C5) is drafted; no signature.

### What unblocks

- Calibration of all 1300 Wave-1+Wave-2 questions: today their `difficulty_b` and `discrimination_a` are AI-drafted estimates, not empirically calibrated. Without calibration, SO-21 cannot enforce per-question pass-rate guardrails.
- DIF (Differential Item Functioning) analysis to surface bias by demographic group. Without DIF, we ship questions that may discriminate.
- The "psychometric-grade" claim that justifies Stack-Vault + Enterprise pricing.

### Options

**A. Hire I/O Psych contractor first; let them recruit and govern the panel (3-month ramp).**
- C5 SOW: ₹4-6L for Year-1 retainer + per-cohort honoraria. I/O Psych defines recruitment criteria, screens applicants, ratifies cohort composition.
- Panel reaches 50 by week 6, 100 by month 3, 200 by month 6.
- Pro: process integrity from day 1; defensible for SOC2 / regulator scrutiny.
- Con: ~3 months from contract-sign to first calibration run.

**B. Recruit a starter cohort of 30 friendly engineers now (paid honoraria, no contractor); hire I/O Psych in parallel.**
- Talpro India has ~150 engineers; 30 of them in the supported Wave-1 sub-skills sign up for ₹2K honorarium per 90-min session.
- Calibration-grade reduced (small N, demographic skew); flag as "v0.1 calibration, not for SOC2 evidence."
- Pro: first calibration run within 4 weeks; product can self-correct earlier.
- Con: requires labeling honesty in customer-facing material — "calibration in progress, refining" — which is a comms posture.

**C. Defer until M3 hire wave.**
- Pro: bundle with the SME Lead hire; one HR cycle.
- Con: Customer-Zero ships with un-calibrated questions; first paying customer's IRT data is also v0.

### CTO recommendation: **Option B (starter cohort + parallel I/O Psych contract)**

- The starter cohort proves the API end-to-end (panel-token auth → response ingest → calibration job → IRT b/a delta dashboard) using real data, before the I/O Psych onboards. That's 4 weeks of platform debugging compressed into the cheaper period.
- I/O Psych contract sign + first 50 of the proper cohort happens in parallel; by month 3 we have ~100 calibrated panel members and the platform is battle-tested.
- The "v0.1 calibration" honesty label is not a weakness — it's exactly the posture SOC2 auditors prefer.

### Cost

- **Money:** ₹2K × 30 honoraria = **₹60K** for the starter cohort (one-time). I/O Psych Year-1 retainer **₹4-6L** + per-cohort honoraria + 250 panelists × ₹2K × ~3 sessions/year ≈ **₹15L total Year 1**.
- **CEO time:** 1 hour to sign C5 SOW; 30 min to authorize starter-cohort spend; thereafter delegated to CDO once hired (or to a part-time Panel Manager — ₹40K/month, M3+).
- **Eng time:** ~1 week (already committed) to build the panel-onboarding admin page; the calibration job already exists.

### Risk if delayed beyond 6 weeks

- Customer-Zero ships with un-calibrated content. First paying customer also.
- Stack-Vault Enterprise pitch loses the "psychometric-grade" claim against Mettl/SHL/Talogy who DO have calibrated content.
- DPDPA + bias-audit posture for India enterprise sales weakens.

### Owner + next step

- **Owner:** CEO (signs SOW + authorizes spend) + CDO once hired (panel ops).
- **Next step (this week):**
  1. Sign C5 I/O Psych SOW; introduce the contractor to the platform docs (I'll write a 1-pager onboarding for the contractor on request).
  2. Authorize ₹60K for starter-cohort honoraria.
  3. Talpro Delivery Head puts up an internal ad for 30 voluntary panelists; agent provides the candidate-facing brief copy on request.
- **What I can do:** author `customer-zero/Reference-Panel-Starter-Cohort-Recruitment-Brief.md` with consent language + honorarium structure + per-session protocol — about 2 hours of work; ready for HR review.

---

## §3 — SME Content Lead hire

### Status quo

- All 1300 Wave-1+Wave-2 questions are AI-drafted at v0.6 schema. None has been SME-validated. Status remains `v0.6 AI-drafted` per Constitution v0.6 SO.
- `customer-zero/SME-Lead-Onboarding-Day-1.md` exists.
- Without an SME Lead, no question can flip from `v0.6 AI-drafted` → `released`. The platform serves AI-drafted content to customers, which is a comms + compliance liability for Stack-Vault Enterprise pricing.

### What unblocks

- Library status flips from `v0.6 AI-drafted` to `released` on a per-domain cadence (~80-150 questions/week SME-reviewed).
- Stack-Vault Enterprise pricing claim ("expert-curated") becomes defensible.
- Reference Panel calibration data has a human in the loop interpreting outliers.
- The agent gets a humane review queue surface (admin console SME Queue page, already shipped) populated.

### Options

**A. Senior I/O Psychologist + ex-tech-recruiter combined role (₹35-50L base).**
- Higher quality bar; reads as "psychometrician + content director."
- Fewer candidates; longer search (8-12 weeks).

**B. Senior Tech Lead with content-author background + contractor I/O Psych (item §2) provides the psychometric layer (₹25-30L base).**
- Faster hire (4-8 weeks); broader candidate pool.
- Two-person model: SME Lead = content quality, I/O Psych contractor = scientific rigor.

**C. Defer; have the agent + community-of-practice SMEs (Talpro engineers paid per-question-reviewed) handle for M2-M3.**
- Pro: zero hire latency.
- Con: doesn't scale beyond 200-300 questions/month; agent cannot self-validate (Constitution).

### CTO recommendation: **Option B (Senior Tech Lead + I/O Psych contractor pairing)**

- Splits the role into two complementary skills (engineering-content quality + scientific rigor); each hire is faster and cheaper than the combined ₹50L unicorn.
- Pairs cleanly with the §2 recommendation (I/O Psych is already on contract).
- Senior Tech Lead becomes the natural SME-Queue owner via the admin console we shipped.
- Total fully-loaded cost ≈ ₹35L/yr (Tech Lead base + I/O Psych retainer) vs ₹55L for Option A — ~35% cheaper for substantially equivalent throughput.

### Cost

- **Money:** ₹25-30L base + ₹3-5L variable (signing bonus, equity) = **₹28-35L total comp Year 1**. Plus the I/O Psych ₹4-6L from §2 already counted.
- **CEO time:** ~6 hours over 4 weeks (3 final-round interviews × 2 candidates).
- **Eng time:** zero — admin console SME Queue is already built and populated.

### Risk if delayed beyond 8 weeks

- Wave-3 psychometric authoring (which assumes SME Lead support per Wave-3-Plan §4) cannot start, regardless of §6 ratification.
- Stack-Vault Enterprise pitches in M3-M4 stall on "is your content expert-validated?" — the honest answer "AI-drafted" loses deals.
- 1300 questions sit un-validated indefinitely; agent cannot self-validate per Constitution Article IV.

### Owner + next step

- **Owner:** CEO + Talpro CTO (final-round interview panel).
- **Next step (this week):**
  1. CEO signs off on JD I'll author next sprint as `customer-zero/SME-Lead-JD-v1.md` (single-page; I'll write it in <30 min if authorized).
  2. Talpro HR posts on LinkedIn + the 3-4 niche channels (CodingBat-India, IIT alumni groups, Constitutional-AI-engineering Slack) — agent CAN draft the post copy for HR to publish; the agent does NOT publish.
  3. CTO Office screens; CEO + Talpro CTO interview top 3.
- **What I can do:** write the JD, the HR-handover briefing, and the interview rubric. ~3 hours of work; ready for next sprint.

---

## §4 — First REAL Talpro candidate run end-to-end

### Status quo

- `services/readybank` is live in production (PR #27 historically); recruiter dashboard works; candidate take-flow works; result renderer works; watermark engine v0 lives.
- Stack-Vault tenant-isolation routes ship in Sprint 3.4. Stack-Vault is not the path for Customer-Zero (that's ReadyBank Standard tier).
- Customer-Zero pre-launch checklist (`customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.md`) lists 5 tracks: Capital + Legal, Infrastructure, People, Customer Zero (Talpro India), Content.
- Per checklist §5 status: tracks A (Capital + Legal), C (People), D (Talpro readiness) all show open items.
- The actual candidate has not run.

### What unblocks

- The single most important milestone in Phase 1 per Constitution. Until a real Talpro candidate completes, every claim about "QOrium works" is a controlled engineering demo.
- Triggers the first real anti-leak event (the candidate's question reaches a real LinkedIn / Reddit post → anti-leak engine should detect → SME queue should populate). Validates the moat end-to-end.
- Converts Talpro Delivery Head from "willing pilot" to "internal advocate" — which seeds the M3 logo pipeline.

### Options

**A. Wait for SES verified-sender (item §1) AND SME-validated content (item §3) AND Reference Panel calibration (item §2) — ship in M3.**
- Pro: all evidence is best-of-class.
- Con: pushes Customer-Zero from M2 to M4-M5; slips the entire Phase 1 → Phase 2 transition.

**B. Run Customer-Zero now with explicit "v0.6 AI-drafted, calibration-in-progress" labeling. SES still required (item §1 day 1 dependency).**
- Pro: real signal in 4-6 weeks instead of 4 months.
- Con: Talpro Delivery Head + the candidate must accept the v0.6 disclaimer. Brand exposure if questions look obviously AI-drafted.

**C. Run a "sandbox" Customer-Zero — Talpro CTO himself takes the assessment as a friendly first user, no real candidate.**
- Pro: zero customer risk; pure platform shake-down.
- Con: doesn't trigger anti-leak (Talpro CTO won't post questions to LinkedIn); doesn't move the conversion narrative.

### CTO recommendation: **Option C first (this week), then Option B (within 4 weeks of SES verification)**

- C is essentially free, generates a punch-list of 20-50 small UX/copy issues that no engineering review catches, and Talpro CTO becomes the platform's most-knowledgeable internal critic. Schedule for this Saturday.
- B follows: 4 weeks after the SES domain is verified (item §1), Talpro Delivery Head identifies one mid-level Salesforce dev candidate they were going to interview anyway, runs the candidate through QOrium + their normal process, compares results. The candidate signs the v0.6 disclaimer.
- A is correct in spirit but delays Phase 2 entry by 6+ months for marginal quality gain.

### Cost

- **Money:** essentially zero (Talpro CTO's time is internal; the v0.6 candidate run uses existing infra).
- **CEO time:** 30 min to brief Talpro Delivery Head on the v0.6 framing for option B; 0 hours for option C.
- **Eng time:** the agent triages the option-C punch-list within 1 week of receipt.

### Risk if delayed beyond 6 weeks

- Phase 1 stays in "engineering-complete; never customer-validated" purgatory. M3 logo pipeline does not start; M9 ARR target slides.
- The first real anti-leak event happens at a customer site without us knowing the engine works in the wild.

### Owner + next step

- **Owner:** CEO + Talpro Delivery Head + Talpro CTO.
- **Next step (this week):**
  1. CEO + Talpro CTO schedule 90 min on Saturday for Talpro CTO to take the assessment.
  2. Agent prepares a punch-list template + a debrief survey (~1 hour of work; ready next sprint).
- **What I can do:** author `customer-zero/Customer-Zero-Sandbox-Run-Brief.md` with the candidate workflow (login → take flow → result + feedback survey). ~2 hours work; ready by next sprint.

---

## §5 — Wave-3 ratification (Constitutional Amendment v2.1)

### Status quo

- `governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.md` is filed as v0.1 PROPOSAL.
- It changes M9 milestone from `psychometric LICENSED (Mettl/3rd-party)` → `psychometric NATIVELY AUTHORED via Wave-3 sub-skills 1-3 (cognitive ability, personality SJT, aptitude SJT)`.
- Per Article XI §11.5 amendment procedure, requires CEO + Board sign-off.
- Wave-3 Authoring Template v0.1 + Kickoff Batch-001 are shipped (20 questions sample). Cannot scale without ratification.

### What unblocks

- Native Wave-3 authoring at scale (350+ questions by M9).
- Differentiation against Mettl/SHL/Talogy in Stack-Vault Enterprise pitches.
- Eliminates licensing-vendor lock-in risk on per-candidate pricing (Mettl raised 40% YoY in 2024).

### Options

**A. Ratify NATIVELY AUTHORED (the proposed amendment).**
- Pro: differentiation moat for Stack-Vault Enterprise; vendor independence; aligns with the broader "QOrium IS the content" positioning.
- Con: ~₹65L Year 1 budget commitment for Wave-3 authoring (per amendment §1); requires SME Lead + I/O Psych in parallel (items §2 + §3).

**B. Reject; stay LICENSED.**
- Pro: zero authoring cost; faster M9 milestone.
- Con: every Stack-Vault Enterprise pitch becomes "we have the same content as our competitors, on a different platform." Bali pricing discipline (SO-23) erodes.

**C. Ratify HYBRID: license-for-launch, native-for-moat.**
- License Mettl/SHL for first 6 months (Phase 2-early-Phase 3) so M9 ships on time; author native Wave-3 in parallel; cut over to native at M9 + 6 months.
- Pro: time-to-market preserved + moat eventually built.
- Con: pays both costs (license fees + authoring); only works if the authoring ramp matches the cut-over date.

### CTO recommendation: **Option A (full ratification of v2.1 NATIVELY AUTHORED)**

- The whole QOrium thesis is "we own the content moat." Licensing the most-defensible content category (psychometric) defeats the thesis.
- ₹65L is real money but recovered in <12 months at any reasonable Stack-Vault Enterprise pricing (single Bosch-tier deal at ₹1Cr+ / year).
- The SME Lead + I/O Psych pairing in items §2 + §3 is exactly the capability mix Wave-3 native authoring requires; the items sequence cleanly together.
- Hybrid (option C) is a pretty trap: the cut-over rarely happens because the licensed version "is working" by then.

### Cost

- **Money:** **₹65L Year 1** budget envelope per amendment §1. Spread M3-M9 (~₹9L/month).
- **CEO time:** ~2 hours to read the amendment + sign; the agent + Talpro CTO MCP do the technical due-diligence read.
- **Board time:** depends on board cadence. If async sign-off (Article XI §11.5(b)), 1 week; if quarterly board meeting required, defer to next meeting.

### Risk if delayed beyond 4 weeks

- Wave-3 authoring cannot begin → M9 milestone slides.
- The Wave-3 authoring template v0.1 + Kickoff batch-001 already on `main` are stranded ("we have the format but no permission to scale").
- I/O Psych contractor (item §2) signs into a SOW that has nowhere to deploy the skill.

### Owner + next step

- **Owner:** CEO + Board.
- **Next step (this week):**
  1. CEO reads `governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.md` (~25 min).
  2. CEO decides between options A / B / C and drops a one-line decision in the amendment doc.
  3. If A or C: route to Board (async or quarterly).
- **What I can do:** prepare a one-page CFO/board-friendly summary with the financial recovery model (₹65L spend vs Stack-Vault Enterprise ARR upside). ~3 hours; ready next sprint.

---

## §6 — First 3 Recruiter Subscription logos + Bosch GCC discovery call

### Status quo

- ReadyBank ($5K-$25K/yr API) is alpha-shipped per `governance/dashboard.json`.
- Zero signed logos. Zero logged sales conversations.
- M3 sales target H2 (per Constitution + dashboard `human.first-3-recruiter-logos`).
- Bosch GCC introduction is warm-intro-bound per E1-E4.

### What unblocks

- ReadyBank revenue: 3 logos × ₹15L average = ₹45L ARR floor by M3-end. Unlocks Phase 2 → Phase 3 transition criteria (≥3 paying customers per Article IX).
- Stack-Vault Enterprise validation: Bosch is the "if-they-buy-the-game-changes" account per E1-E4. A discovery call alone moves the master meter (signals real demand).
- First customer feedback to the SME queue (post item §3 SME Lead) — closes the auto-mode-can't-self-validate loop.

### Options

**A. CEO + Talpro Delivery Head sales-direct (no AE hire).**
- Pro: cheapest; CEO sees every objection firsthand.
- Con: CEO time-tax is steep; CEO is also unblocking items §1-§5.

**B. Hire AE M3 (₹25-35L base + variable).**
- Pro: scalable; CEO time freed for items §1-§5 + investor.
- Con: M3 hire cycle is 6-10 weeks; first AE-sourced logo lands M5 at earliest.

**C. Channel-led: partner with one Indian HR-tech distributor (e.g., CutShort, Naukri, AmbitionBox) for first 3 logos in exchange for revenue share.**
- Pro: zero hire; channel does the cold outreach; logos in 4-8 weeks.
- Con: 20-30% rev share long-term; channel has its own pricing dynamics; less customer intimacy in early days.

### CTO recommendation: **Hybrid — A for first 3 logos, B for M4 onwards**

- First 3 logos NEED CEO eye-contact: the customer is buying "QOrium will figure out our bespoke needs," and only the CEO can credibly make that promise. Using an AE for the first 3 is premature.
- After 3 logos, the playbook is repeatable enough to hire an AE; CEO transitions to enterprise (Bosch-tier) accounts only.
- Channel (option C) saved for M5+ when ReadyBank is a clear product story; trying it M2 with no customer evidence will get marginalised by the channel.
- **Bosch:** discovery-call is CEO direct, not AE, regardless of the option above. Enterprise CTOs talk to founder-CEOs.

### Cost

- **Money:** sales travel (₹20-30K/logo × 3 = ₹60-90K) + first AE Year 1 fully loaded (~₹40L) starting M4. Bosch discovery has no $-cost (CEO travel may apply).
- **CEO time:** ~30-40% of CEO weekly calendar from now to M3 (the most expensive line item; this is the trade-off).
- **Eng time:** the agent owns the customer-success runbook (already drafted as `customer-zero/D4-Customer-Zero-Feedback-Channel-Plan.md`) — no additional engineering required.

### Risk if delayed beyond 12 weeks

- M9 ARR target ($500K) becomes structurally infeasible — the math is "first revenue M3 → 6 months ramp → M9 ARR." Slip M3 by 3 months and M9 ARR is $200K not $500K.
- Investor narrative ("we're building" → "we're selling") doesn't get to flip in time for the planned Pre-A.
- Engineering team morale: shipping into a vacuum without "real customer asked for X" requests reduces signal quality.

### Owner + next step

- **Owner:** CEO + Manthan (for India warm intros).
- **Next step (this week):**
  1. CEO + Manthan list 12 warm-intro target logos for ReadyBank (mid-size Indian recruiting orgs that already pay for Mettl/HackerEarth/SHL).
  2. Manthan opens Bosch warm-intro thread (E1-E4 path) and CEO follows up with ETA-bound discovery call.
  3. Agent prepares a per-target one-page brief (offering, pricing, demo URL — using the live ReadyBank instance) — ~2 hours per logo, 24 hours total turnaround.
- **What I can do:** draft a sales-outreach playbook with templated emails (CEO publishes, agent never sends), pricing sheet, demo-flow script. ~6 hours; ready in 2 sprints.

---

## §7 — How these six items interlock (sequencing critique)

The six items are not independent. Doing them in the wrong order creates expensive idle time. Optimal order:

```
Week 0 (this week):
  §1 (cred-drop SES, day 1) ─────────────────┐
  §3 (publish SME Lead JD)   ────────────────┤
  §5 (CEO reads amendment, decides)  ────────┤
  §4 (option C: Talpro CTO sandbox run)  ────┘

Week 1-2:
  §1 (cred-drop PITR, then Observability)
  §2 (sign I/O Psych SOW; authorize ₹60K starter cohort)
  §6 (CEO + Manthan warm-intro list; first 3 outreach)

Week 3-4:
  §3 (interview SME Lead final round)
  §4 (option B: live Talpro candidate)
  §5 (Board sign-off, if quarterly cadence)
  §6 (first 3 demos run)

Week 5-8:
  All items in execute mode; agent owns the engineering surface;
  CEO owns close motion + strategic relationships.
```

The critical-path bottleneck is §1 (cred-drop) on the engineering side and §6 (sales motion) on the revenue side. The other four items can run in parallel once those two are unblocked.

---

## §8 — What the agent CAN do next, on authorization

In rough effort order, the prep artifacts that would make each item faster:

| Artifact | For item | Effort | Output ready in |
|---|---|---|---|
| `cred-drop-runbook.md` (AWS CLI commands, IAM JSON) | §1 | 1 hr | next sprint |
| `customer-zero/Reference-Panel-Starter-Cohort-Recruitment-Brief.md` | §2 | 2 hr | next sprint |
| `customer-zero/SME-Lead-JD-v1.md` + interview rubric | §3 | 3 hr | next sprint |
| `customer-zero/Customer-Zero-Sandbox-Run-Brief.md` (option C playbook) | §4 | 2 hr | next sprint |
| Board-friendly v2.1 financial-recovery one-pager | §5 | 3 hr | next sprint |
| Sales-outreach playbook + pricing one-pager + demo script | §6 | 6 hr | 2 sprints |

If you authorize all six, the agent ships them as a single PR (`feat(governance): six human-lane prep artifacts`) within the next session. Each artifact is decision-support, not decision-execution; every action they enable still requires you (CEO) or named humans.

---

## §9 — Honest limits

Six things the agent will NOT do under any authorization:

1. Touch `.env.bootstrap` or run `terraform apply` — even with `BOOTSTRAP_AUTHORIZED=true`. The wrapper script enforces; the agent never runs the wrapper.
2. Sign contracts on QOrium's behalf or commit money.
3. Send outbound emails / Slack DMs / WhatsApp / SMS / GitHub mentions to humans outside the bot perimeter.
4. Recruit or interview candidates (SME Lead, AE, panelists).
5. Negotiate with Bosch / Mettl / customer prospects.
6. Mark a Constitutional Amendment as ratified.

Where the boundary is fuzzy, the agent halts and writes to `governance/QUEUE.md`. This packet does not move that boundary.

---

## §10 — Decision capture

Each reviewer (CEO / Manthan / Talpro CTO) leaves an inline GitHub comment on the section header for items §1-§6 with one of:

- **AGREE** (proceed with CTO recommendation as written)
- **AGREE-WITH-NOTE** (proceed; specifies a tweak)
- **COUNTER: <option letter>** (pick a different option)
- **DEFER** (the item waits; reviewer states the trigger)

When all three reviewers have weighed in, CTO Office (agent) updates `governance/dashboard.json` to reflect committed direction + opens follow-up engineering tickets where applicable.

If reviewers disagree on an item, CEO call breaks the tie (Article XI §11.4 — CEO has final say on revenue / hiring / commitment items; CTO has final say on engineering / data architecture items; this packet is mostly the former).

---

**End of packet.**

The agent has done what an agent can do. The next chapter — the one that takes the master meter from 0.78 to 1.0 — is the human chapter, and you are the only person who can start it.

— CTO Office (autonomous agent)
2026-05-08

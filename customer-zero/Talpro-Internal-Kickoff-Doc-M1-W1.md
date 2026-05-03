# Talpro Internal QOrium Kickoff Doc — M1 Week 1

**Status:** Pre-authored for SME Lead Day-1 + first 2 hires (Senior Engineer #1 + SME Content Lead). Refined after first stand-up.
**Authored:** 2026-05-03 (autonomous mode)
**Distribution:** SME Lead + Senior Engineer + CTO + CEO; pinned in QOrium Customer Zero feedback channel
**Cadence:** read this doc Day-1 morning; first formal stand-up Day-1 afternoon

---

## §1 — Welcome (CEO + CTO joint)

If you're reading this, you're either the SME Content Lead, the Senior Engineer #1, or you'll soon be one of them. Welcome.

QOrium is Talpro India Pvt Ltd's new product line — a Question-Bank-as-a-Service for hiring assessments. We're building this because the technical-assessment-content market has a structural reliability problem (questions leak faster than they're authored) and no one has built a pure-play content business to solve it.

You're joining at Day 1. The constitution + 410 v0.6 candidate-ready questions + the operational playbook are all in place. You'll inherit it, validate it, and own forward authoring + ops.

---

## §2 — First-week ground rules (Bhaskar's voice)

1. **Read the Constitution v2.1 first** (~45 min). It's the operating system. It tells you what we'll do (and won't) when in doubt. Don't skip.
2. **Talpro India is Customer Zero.** Every product decision asks: "would this work for Talpro recruiters running 100 candidates through QOrium this month?" If the answer is no or unclear, escalate.
3. **Quality bar is the product.** 92-point release gate. SO-22 ≥93% AI plagiarism detection. SO-21 IRT mandatory. Below threshold = no release. We don't waiver.
4. **No-Fiction Rule (SO-24).** Every external claim — pricing, capability, customer numbers — backed by a tool call or live source. Not "I think." Not "approximately." Cite the file, the database query, the verified statement.
5. **Comms:** Customer Zero feedback channel (email + Telegram per D4 Plan); Friday 5 PM IST metrics summary; Monday 9 AM IST 1:1 with CEO + CTO.
6. **Slack/Telegram preferred over email** for internal team; email for customer comms.
7. **Ask questions early.** "What I don't know" + "What I'm assuming" surface early > stuck for 2 days then escalate.

---

## §3 — SME Lead Day-1 to Day-30 agenda

### Day 1 (morning, ~3 hours)

- 09:00-09:45 — Read Constitution v2.1 + this kickoff doc
- 09:45-10:00 — Read SME-Lead-Onboarding-Day-1.md (your inherited quality bar from CEO sniff-test)
- 10:00-10:30 — Walk through Wave-1-Seed-Batch-100-Questions-Master.md (now 410 Qs across Wave 1 + Wave 2)
- 10:30-11:00 — Open SME-Validation-Tracker-Wave1.xlsx; understand the 14-column workflow
- 11:00-11:30 — Coffee + 15-min "first impressions" with CTO Office

### Day 1 (afternoon, ~4 hours)

- 12:00-13:00 — First formal stand-up: CEO + CTO + SME Lead + Senior Engineer (if also Day-1)
- 13:00-15:00 — Pick 1 question pack (your strongest domain). Validate 5 questions against the 8-item QA checklist. Mark in tracker XLSX. Log questions/blockers in Customer Zero email + Telegram.
- 15:00-17:00 — Review Wave 1 v0.6 Edits Patch + understand V-1..V-5 forward authoring rules. Read SME-Lead-Onboarding-Day-1.md §Inherited Quality Bar Notes.

### Day 1 evening — async

- 17:30 — Async post in Customer Zero channel: "Day 1 done. Questions validated: [X]. First impressions: [3 lines]. Day 2 plan: [3 lines]."

### Day 2-7 — first sprint

- Validate 30 questions across 3 packs (~10 questions/day pace for first week)
- Review the Bias Detection Methodology + AI Plagiarism Benchmark Protocol + Anti-Leak Engine designs (read; deep critique not required Day 1; questions to CTO)
- Meet I/O Psych contractor (when engaged; expected M2 per C5 SOW)
- Coordinate with first 5 SMEs (per C6 Sourcing Plan) — Talpro alumni network outreach
- Day 7 review: SME Lead presents 30-question validation summary at Friday Eng Review (J6)

### Week 2-4

- Validate first 100 questions across all 8 Wave 1 sub-skills
- Vet first 5 SME contractors (per C6 plan)
- Author 20 NEW questions (Wave 1 stretch sub-skills); learn the authoring pattern
- Establish your authoring rhythm: 10-15 questions/day target by Day 30

### Day 30 review

- 90 minutes; CEO + CTO + SME Lead
- SME Lead presents: validation throughput, quality issues found, calibration plans, SME contractor pipeline, Wave 1 path to 320 (40 per sub-skill) by M3
- Decision: any v0.7 patch needed? Any Wave 1 sub-skills need re-authoring? Reference Panel ramp on track?

---

## §4 — Senior Engineer #1 Day-1 to Day-30 agenda

### Day 1 (morning, ~3 hours)

- 09:00-09:45 — Read Constitution v2.1 + this kickoff doc
- 09:45-10:30 — Read CTO Architecture v1 (system design; tech stack)
- 10:30-11:30 — Walk through `infra/` folder: B5 CI/CD, B6 secret rotation, B7 Postgres migrations, B10 PM2 ecosystem, Anti-Leak Engine v0, JD-Forge v0, IRT pipeline v0, Judge0 sandbox v0, ATS framework v0, Webhooks/SSO/Audit/Billing v0 specs

### Day 1 (afternoon, ~4 hours)

- 12:00-13:00 — First formal stand-up
- 13:00-15:00 — GitHub access (CC-05); first repo clone; verify lint/typecheck/test/build green
- 15:00-17:00 — Pick the highest-leverage spec to validate (recommend: B7 Postgres 0001 migration). Apply against managed-PG sandbox; verify schema works as designed.

### Day 1 evening

- Async post: "Day 1 done. Spec read: [X]. Schema validated: [Y/N]. Day 2: [3 lines]."

### Day 2-7

- Day 2-3: Apply Postgres 0001 migration to staging; verify; run existing test fixtures
- Day 4-5: Set up CI/CD pipeline per B5; first PR with linter pass
- Day 6-7: Begin scaffolding the Content Engine 7-stage pipeline (per CTO Architecture §3); first pipeline stage live in staging

### Week 2-4

- Content Engine pipeline complete; integrated with SME validation tracker
- Anti-Leak Engine v0 deployed on Mac Mini Docker (Talpro Sentinel-monitored)
- Judge0 sandbox v0 deployed (12 languages baseline)
- IRT calibration pipeline v0 wired (girth library; nightly cron)
- ReadyBank Service REST API alpha live (questions:read, search:read endpoints)

### Day 30 review

- Senior Engineer presents: pipeline live, sandboxes operational, anti-leak running daily, IRT calibration first batch run
- Decision: Phase 1 M2 milestones on track? Need to hire Frontend Engineer earlier?

---

## §5 — Joint working norms

### Daily rhythm

- **09:00 IST:** async stand-up in Customer Zero Telegram; everyone posts (a) yesterday's wins, (b) today's top 3, (c) blockers
- **17:30 IST:** async EOD wrap-up; 1-line summary of day's actual progress vs morning plan
- **No stand-up meetings** (waste of senior-engineer time); the async post IS the stand-up

### Weekly rhythm

- **Monday 09:00 IST:** Strategic 1:1 (CEO + CTO; SME Lead + Senior Eng async observers); 60 min; Monday Brief doc
- **Friday 16:00 IST:** Friday Eng Review (CTO + Senior Eng + SME Lead + future Frontend Eng); 60 min; Friday Eng Notes doc
- **Quality discussion** in Friday review: every Gatekeeper failure discussed publicly with no-blame language

### Monthly rhythm

- **First Wednesday 11:00 IST:** Monthly Close (J5); ARR/MRR + content metrics + customer metrics + pipeline + Phase Gate progress; 90 min
- **At M3, M6, M9, M12:** IdeaForge re-gate attached to that month's J5 close

### Quarterly rhythm

- Customer Zero quarterly review (Talpro Delivery Head + Bhaskar + CTO + SME Lead)
- Competitive scan (per Constitution §10.3 + SO-25)
- Compensation philosophy + bands review (CEO + CTO + comp committee when established)

---

## §6 — Critical files (top 20 to know)

| Doc | Purpose |
|---|---|
| `09-QOrium-Constitution-v2.0.md` (or v2.1 if amended) | Operating system; read first |
| `IMPLEMENTATION-PROGRESS-TRACKER.md` | Where we are right now |
| `IMPLEMENTATION-NEXT-SESSION-MANIFEST.md` | What to do next |
| `QUEUE-QOrium.md` | Active tasks across offices |
| `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.md` | Master index (now 410 Qs) |
| `customer-zero/SME-Validation-Tracker-Wave1.xlsx` | Your daily SME tool |
| `customer-zero/SME-Lead-Onboarding-Day-1.md` | Your inherited quality bar |
| `customer-zero/Wave-1-v0.6-Edits-Patch-2026-05-02.md` | V-1..V-5 forward authoring rules |
| `customer-zero/Wave-1-Question-Batch-Plan.md` | 0→5K Qs roadmap |
| `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md` | Wave 3 trajectory |
| `customer-zero/Reference-Panel-Governance-v0.md` | IRT calibration panel |
| `customer-zero/Talpro-Recruiter-Onboarding-QnA.md` | What Talpro recruiters know |
| `governance/Operating-Rituals-v1.md` | Monday/Friday/Monthly rhythm |
| `governance/Quality-Gate-92pt-Scorecard.md` | Release scorecard |
| `governance/Bias-Detection-Methodology-v1.md` | DIF audit methodology |
| `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` | SO-22 ≥93% benchmark |
| `governance/TestForge-QA-Pipeline-v1.md` | QA pipeline orchestration |
| `infra/Anti-Leak-Engine-v0-Design.md` | 24h rotation per SO-9 |
| `infra/IRT-Calibration-Pipeline-v0-Spec.md` | 3PL calibration pipeline |
| `infra/Judge0-Sandbox-Integration-Spec-v0.md` | Code-question execution backbone |

---

## §7 — Norms about asking for help

**You are encouraged to:**
- Ask questions in Customer Zero Telegram any time; CEO + CTO respond async within business hours
- Push back on any spec you think is wrong; we'll discuss in Friday Eng or Monday 1:1
- Propose your own changes to the Constitution via §Article XI Amendment Procedure (template at `governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.md`)
- Surface "what I don't know" explicitly (no shame; saves days of stuck)

**You are discouraged from:**
- Working in silence then surprising us at standup
- Marking work "done" when SME validation or testing is incomplete (No-Fiction Rule)
- Adding scope without alignment ("I also added a feature X" without consensus = scope creep)

---

## §8 — Compensation + equity context

Per `people/C7-Compensation-Philosophy-and-Bands-v1.md`:
- Cash bands shared in interview Round 2 (you've already negotiated)
- ESOP grant per offer letter; vesting 4-year cliff 1-year; CoC double-trigger acceleration
- Refresh grants annually at M12 review for top performers
- 12% authorised ESOP pool; 8% reserved for first 12 hires

Equity is meaningful. We're operating at sub-market cash to compensate. The Constitution's "Project Completion" definition (Article IX) is the equity-realization moment.

---

## §9 — First 30 days — what's at stake

| Outcome | Impact |
|---|---|
| SME Lead validates 100 v0.6 questions | Customer Zero readiness | Phase 1 M3 path to 5K Qs |
| Senior Eng deploys ReadyBank Service alpha | Talpro Customer Zero hits 100 candidates by M3 | M3 Phase Gate criteria met |
| First 5 SME contractors vetted + onboarded | M3 Wave 1 5K-Q velocity | Constitution Article IX M3 milestone |
| First defect-management cycle complete | Operational rhythm baked in | Customer Zero feedback loop active |

If these outcomes happen by Day 30, M3 IdeaForge re-gate has a reasonable path to 20+/24 PROCEED. If they don't, we have a real conversation at the Day-30 review.

---

## §10 — Closing

Bhaskar's note:

"After 15 years of staffing, I've watched the assessment-content problem get worse every year. We're not building a feature. We're building a category. The first 100 days will feel like 1000. Stay focused. Read the docs. Trust the constitution. Push back when you should. Welcome to QOrium."

— Bhaskar Anand
Founder, Talpro India Pvt Ltd / QOrium product line

---

*End of Talpro Internal QOrium Kickoff Doc M1 W1. Pinned in Customer Zero feedback channel; refined after Day 30 review.*

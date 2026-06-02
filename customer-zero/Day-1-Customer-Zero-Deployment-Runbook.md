# QOrium Customer Zero — Day-1 Deployment Runbook

**Status:** v1 — operational runbook for the day Customer Zero goes live (the day Talpro India recruiters first send a candidate through QOrium for assessment).
**Authored:** 2026-05-03 (autonomous mode)
**Authority:** CTO Office; sign-off: CEO + CTO + SME Lead joint
**When triggered:** ALL Customer Zero Pre-Launch Checklist v1 GO criteria GREEN

---

## §1 — The morning of Day 1

### T-30 min (Bengaluru 8:30 AM IST)

CTO Office on a video call with SME Lead + Senior Engineer + (if reachable) Talpro Delivery Head.

Checklist:
- [ ] Verify all 5 Customer Zero Pre-Launch Checklist tracks GREEN per `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.md`
- [ ] Confirm SME Validation Tracker XLSX shows ≥160 questions in "Accepted" status
- [ ] Confirm Customer Zero Month-1 Dashboard XLSX is open + populating
- [ ] Run `pm2 jlist` — all 5+ qorium-* processes "online"
- [ ] Run TestForge orchestrator health check — all 6 components reporting status
- [ ] Verify Mac Mini Docker stack (Anti-Leak Engine + Judge0 + Plagiarism Detector) — all containers healthy
- [ ] Open Sentry dashboard + Grafana TestForge view — all metrics flowing

If ANY red, abort Day-1 launch. Reschedule to T+24h with specific remediation.

### T-15 min (8:45 AM IST)

- [ ] CEO joins call; brief 5-min status; CEO authorizes Day-1 GO with verbal "ship it"
- [ ] CTO posts "T-15 GO" in Customer Zero Telegram channel
- [ ] Talpro recruiter (one specific recruiter pre-coordinated) prepares first candidate invite

### T-0 (Bengaluru 9:00 AM IST — official Day 1)

- [ ] First candidate receives QOrium invite link via Talpro existing email infrastructure
- [ ] Candidate clicks link; lands on QOrium assessment surface
- [ ] Candidate begins assessment (typical 30-45 min)
- [ ] CTO Office watches live: candidate ID + question loaded + sandbox executing + responses captured

### T+5 min — first checkpoint

- [ ] Verify candidate's first question loaded successfully
- [ ] Verify sandbox executed first code submission (if code question)
- [ ] Verify response captured in content.responses table
- [ ] No P0 errors in Sentry; no PM2 restarts; no anti-leak alerts triggered

If any P0, immediate triage. Emergency-pause assessment if data integrity at risk.

### T+30 min — first candidate completes

- [ ] First assessment scored
- [ ] Score posted back to Talpro recruiter (via Customer Zero feedback channel + email)
- [ ] CTO Office posts "first candidate complete" in Telegram with score + signal summary
- [ ] Talpro recruiter posts initial reaction in Customer Zero channel ("score: X; first impression: Y")

### T+1 hour — second + third candidates

- [ ] Second candidate completes; third candidate active
- [ ] Anti-cheat signals captured + visible in dashboard
- [ ] No data corruption observed

### T+4 hours — first formal pause

- [ ] CTO Office posts mid-day report:
  - Candidates assessed: [N]
  - Questions delivered: [N]
  - Errors observed: [list]
  - SME Lead first-impression: [1-2 lines]
  - Recruiter feedback: [1-2 lines]

### T+8 hours (5 PM IST) — Day-1 close report

- [ ] Final tally for Day 1
- [ ] First Friday Eng Notes-style retrospective (CTO + Senior Eng + SME Lead, 30-min async)
- [ ] CEO read; brief reaction in Telegram

---

## §2 — Specific scenarios + responses

### Scenario A: candidate's sandbox times out

**Detection:** Sandbox execution timeout > expected_duration_minutes; visible in Judge0 logs

**Response:**
1. Customer Zero feedback channel: log incident immediately as P1 (24-hour SLA); assign owner = SME Lead
2. Continue assessment for the affected candidate (mark question as "skipped — sandbox timeout"; recruiter sees note)
3. Within 24h: SME Lead reviews question; either (a) increase timeout, (b) revise question, (c) retire question
4. Document in Defect_Log sheet of Customer Zero Month-1 Dashboard XLSX

### Scenario B: AI plagiarism flag triggers on a candidate

**Detection:** qorium-plagiarism-detector flags submission with confidence ≥0.93

**Response:**
1. Immediate: candidate completes assessment; flag is captured in metadata (NOT auto-fail per Customer Success Playbook)
2. Per Talpro recruiter onboarding QnA: recruiter sees "AI plagiarism signal: high (0.96); candidate may have used external AI"
3. Recruiter decides hire/no-hire based on policy (QOrium does not auto-fail)
4. Log in Defect_Log if signal disputed by recruiter

### Scenario C: anti-leak engine detects a leak overnight

**Detection:** Anti-Leak Engine 02:00 IST crawl flags one of the 160 active items as "confirmed leak"

**Response:**
1. P1: status set to "leaked" in content.questions; rotation triggered
2. AI pipeline generates variant (preserving difficulty parameters per Anti-Leak v0 spec §4)
3. SME Lead 24-hr review; approve variant OR mark "non-rotateable" (manual intervention)
4. Customer Zero feedback channel: "leak detected on QOR-X-NNN; variant deployed"
5. Forensic export + customer breach notification per A7 DPA (Talpro internal user; symbolic for Customer Zero)

### Scenario D: PM2 process down (qorium-judge0-orchestrator)

**Detection:** Talpro Sentinel watchdog alerts; OR Customer Zero recruiter reports "candidate stuck on coding question"

**Response:**
1. P0: 4-hour SLA. Immediate triage via call.
2. CTO Office: `pm2 restart qorium-judge0-orchestrator`; verify recovery
3. If recovery fails: failover to in-cluster docker run path (per Judge0 spec §9 Failure modes)
4. Affected candidates: pause assessment; resume after recovery; do not penalize for the gap
5. Post-mortem within 24 hours; published to `governance/post-mortems/`

### Scenario E: customer-facing question quality issue (recruiter reports "Q is wrong")

**Detection:** Talpro recruiter posts in Customer Zero Telegram: "Question QOR-JAVA-007 has a buggy answer key — option B should be correct, not C"

**Response:**
1. P2 (7-day SLA) — but treat with urgency given Customer Zero status
2. SME Lead reviews + acknowledges receipt within 4 hours
3. CTO Office checks: does the answer key actually have an error?
4. If yes: emergency v0.7 patch; revise the answer key; redeploy; notify recruiter
5. If no: explain the rationale to recruiter (potentially tricky distractor; recruiter may not have caught the nuance)

### Scenario F: TestForge orchestrator failure (QA pipeline broken)

**Detection:** `qorium-testforge-orchestrator` reports a component down for >30 min

**Response:**
1. P0 — QA pipeline is mission-critical
2. Identify which component (SME validation, IRT, bias DIF, anti-leak, plagiarism, gatekeeper)
3. Each component has its own runbook in `infra/<component>-Spec.md`
4. Pause new question releases until pipeline restored
5. Post-mortem per Operating Rituals v1

---

## §3 — Communication protocols

### Customer Zero Telegram channel — every event

Every event in §2 above gets a Telegram post in this format:

```
[YYYY-MM-DD HH:MM IST] [SEVERITY] [STATUS]
Event: [one-line description]
Affected: [count of candidates / questions]
Owner: [SME Lead / CTO Office / Senior Eng]
ETA: [resolution time]
```

### Email + WhatsApp escalation

- P0 incidents → immediate email to bhaskar@talpro.in + WhatsApp call within 30 min if Bhaskar reachable
- P1 incidents → email summary; WhatsApp if needed
- P2/P3 → daily summary in Friday Eng Notes

### Talpro Delivery Head + Recruiter team

- Daily summary in Customer Zero channel (CTO Office + SME Lead)
- Weekly aggregated report (Friday 5 PM IST) — pinned message
- Monthly review call (CEO + CTO + SME Lead + Talpro Delivery Head)

### CEO

- T-30 min on Day-1 launch
- T+8 hours Day-1 close report
- Weekly Monday 1:1 brief (per Operating Rituals v1)
- Any P0 incident — immediate page

### Press + external (none until M3 soft launch)

- Customer Zero is internal-to-Talpro; no external press until M3 trigger
- If any external party (e.g., journalist asking about QOrium) — direct to bhaskar@talpro.in; no engagement yet

---

## §4 — Day-1 success criteria

By T+8 hours (5 PM IST Day 1):
- ✅ At least 5 candidates assessed
- ✅ Zero P0 incidents
- ✅ No data integrity issues
- ✅ SME Lead first-impression positive ("the platform works as expected")
- ✅ Talpro recruiter first-impression neutral-to-positive ("not worse than Mettl")
- ✅ Customer Zero feedback channel active with at least 3 substantive messages

If ALL ✅: Day 2 continues per plan.
If ANY ❌: pause; emergency call (CEO + CTO + SME Lead); decide continue / pause / rollback.

---

## §5 — Day 2-7 cadence (first week)

- Day 2: 10-15 candidates assessed; first formal SME validation cycle on returned data
- Day 3: 25-30 candidates total; daily metrics report at 5 PM IST
- Day 4: First IRT calibration nightly batch — first calibration drift report
- Day 5: First Friday Eng Notes (J6 ritual)
- Day 6-7: 50-60 candidates total; weekend monitor mode

Day 7 review: SME Lead presents quality observations; first defect root-cause analyses; trajectory check toward Day-30 100-candidate target.

---

## §6 — Rollback procedures

### Soft pause (recoverable)

- Trigger: rate of P1 incidents > 3 per 4 hours
- Action: pause new candidate invites; complete in-flight assessments; communicate to recruiters
- Recovery: fix issues; resume within 24 hours

### Hard pause (escalation)

- Trigger: P0 incident with data integrity risk; OR SME Lead determines question quality fundamental issue
- Action: immediate halt of all new candidate invites; complete in-flight if safely possible; CEO call within 1 hour
- Recovery: full root-cause analysis; v0.7 patch if needed; CEO + CTO + SME Lead joint go-decision

### Rollback to status quo (extreme)

- Trigger: existential platform failure; data corruption; legal/regulatory issue
- Action: Talpro recruiters revert to HackerRank/Mettl for affected roles; QOrium pipeline frozen
- Recovery: weeks; full post-mortem + remediation; CEO + Board (if exists) notified

---

## §7 — Post-launch — first 30 days

### Cadence

- Day 1-7: daily 5 PM IST report
- Day 8-14: 2x/week reports (Tue + Fri)
- Day 15-30: weekly Friday report only

### Day 30 review

- 90-min meeting: CEO + CTO + SME Lead + Talpro Delivery Head
- Customer Zero Month-1 Dashboard XLSX shared (now fully populated)
- Defect log reviewed; trajectory toward M3 5K-Q target assessed
- Bali pricing signal validated (does the QOrium signal-quality justify SO-23 anchor?)
- Decision: scale Wave 1 to 5K? Scale Customer Zero to 250 candidates? Begin paid acquisition (BP-06 JD posting)?

---

## §8 — References

- Customer Zero Pre-Launch Checklist v1 — `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.md`
- Customer Zero Feedback Charter — `customer-zero/D4-Customer-Zero-Feedback-Charter.md`
- Customer Zero Month-1 Dashboard XLSX — `customer-zero/Customer-Zero-Month-1-Dashboard.xlsx`
- TestForge QA Pipeline v1 — `governance/TestForge-QA-Pipeline-v1.md`
- Anti-Leak Engine v0 — `infra/Anti-Leak-Engine-v0-Design.md`
- Judge0 Sandbox Integration v0 — `infra/Judge0-Sandbox-Integration-Spec-v0.md`
- AI Plagiarism Benchmark Protocol v1 — `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`
- Operating Rituals v1 — `governance/Operating-Rituals-v1.md`
- Incident Response Runbook v1 — `governance/Incident-Response-Runbook-v1.md`
- Talpro Recruiter Onboarding QnA — `customer-zero/Talpro-Recruiter-Onboarding-QnA.md`

---

*End of Day-1 Customer Zero Deployment Runbook v1. Activate when Customer Zero Pre-Launch Checklist v1 GREEN.*

# Operating Rituals v1.0

**For:** QOrium CTO Office, CEO, Engineering Leadership  
**Effective:** Month 1 (May 2026) — once first 2 hires onboarded; CTO Office runs solo until then with reduced cadence  
**Authority:** Constitution Article VIII (Operating Cadence), Article IX (Phase Gates)  
**Owner:** CTO Office — Governance Lead  

---

## Preamble

Per Constitution Article VIII, QOrium operates on a structured cadence of weekly, monthly, and quarterly rituals. These rituals are the heartbeat of the organization: they ensure visibility, decision-making, and accountability. This document codifies the format, timing, attendees, and outputs of each ritual.

**Solo operation (Month 0–1):** CTO Office runs all rituals solo with reduced attendee count. Rituals resume full attendance once first 2 hires (Senior Eng + SME Lead) onboard.

---

## §1 — J7 Weekly Monday Strategic 1:1 (CEO + CTO)

**Owner:** CTO Office prepares; CEO + CTO joint  
**Time:** 9:00 AM IST, every Monday (60 minutes)  
**Attendees:** CEO, CTO  
**Pre-read:** Monday Brief (prepared Sunday 8 PM IST; 2 pages max)

### 1.1 Agenda Template (with timings)

| Section | Duration | Owner | What Happens |
|---|---|---|---|
| **Wins & Losses** | 5 min | CTO | Any closed deals, product releases, or significant blockers from last week |
| **Priorities Walk** | 10 min | CTO | Current week's top 3 engineering + ops priorities; any re-prioritization needed |
| **Strategic Topic (Rotating)** | 15 min | CEO + CTO | Deep dive on 1 rotating topic per week (see §1.3 rotation) |
| **Decision Queue** | 15 min | CEO | Any decisions blocking progress; yes/no/discuss for each |
| **Ahead-of-Quarter** | 10 min | CTO | Signals for next quarter; early heads-up on risks |
| **Action Items** | 5 min | CTO | Capture owners + ETAs for action items; repeat back |

**Total:** 60 minutes. If overrun, truncate "Ahead-of-Quarter"; decisions never get cut short.

### 1.2 Monday Brief Format

**Prepared by CTO Office; emailed to CEO Sunday 8 PM IST. Also posted to `/governance/monday-briefs/YYYY-MM-DD.md`.**

```markdown
# MONDAY BRIEF — [DATE]

## WINS THIS WEEK
- [Achievement 1]: [brief metric/outcome]
- [Achievement 2]: [brief metric/outcome]

## BLOCKERS / ESCALATIONS
- [Blocker 1]: P[0/1/2] — [status + next step]
- [Blocker 2]: P[0/1/2] — [status + next step]

## WEEK AHEAD — TOP 3 PRIORITIES
1. [Priority 1] — Owner: [name] — ETA: [date]
2. [Priority 2] — Owner: [name] — ETA: [date]
3. [Priority 3] — Owner: [name] — ETA: [date]

## DECISION QUEUE
| Decision | Owner | Options | Recommendation | Required By |
|---|---|---|---|---|
| [D1] | [who] | [opt A / opt B / opt C] | [CTOs rec] | [date] |

## UPCOMING DATES
- Phase X Phase Gate: [date]
- Customer Zero milestone: [date]
- Hiring close target: [date]

## FINANCIAL HEALTH (if Month N > 3)
- Runway: [X] months
- Burn rate: ₹[Y]/week
- MRR: ₹[Z] (if applicable)
```

### 1.3 Strategic Topic Rotation

Cycle through these topics, one per week (5-week cycle repeats):

1. **Week 1 (Mon 1st):** Customer & market pipeline (logos, leads, churn signals)
2. **Week 2 (Mon 2nd):** Product & content delivery (questions shipped, IRT coverage, gaps)
3. **Week 3 (Mon 3rd):** Hiring & people (candidates, offer status, team health)
4. **Week 4 (Mon 4th):** Financials & runway (cash burn, envelope tracking, expense review)
5. **Week 5 (Mon 5th):** Risks & contingencies (tech debt, security, compliance, Phase Gate prep)

**Example:** If today is Monday, May 13:
- Week 1 = May 6: Discuss customer pipeline (booked meetings, RFP status)
- Week 2 = May 13: Discuss product delivery (content metrics, quality gate)
- Week 3 = May 20: Discuss hiring (engineer interviews in progress)
- And so on...

### 1.4 Decision SLA

**Rule:** Any decision raised in Monday 1:1 is **decided in the meeting OR has owner+ETA by EOD Monday.** No "let me think about it" hangovers.

**Examples of decisions:**
- Approve hiring for next role?
- Spend ₹5L on contractor for AI training?
- Switch from Cloudflare R2 to AWS S3?
- Say yes to Bosch NDA terms?

**If not decided in meeting:** CTO sends email by 6 PM Monday with decision, owner, and ETA.

### 1.5 Output

- **Monday Brief:** Posted to `/governance/monday-briefs/YYYY-MM-DD.md` (also read in meeting)
- **Action Items:** Captured in QUEUE-QOrium.md with owner + ETA
- **Recording (optional):** Granola or Otter (shared in governance/)

---

## §2 — J6 Weekly Friday Engineering Review

**Owner:** CTO + Senior Eng (or CTO alone if not yet hired)  
**Time:** 4:00 PM IST, every Friday (60 minutes)  
**Attendees:** CTO, Senior Eng, SME Lead (when hired), Frontend Eng (when hired)  
**Pre-read:** Friday Eng Notes (prepared by CTO Thursday EOD; 3 pages max)

### 2.1 Agenda Template (with timings)

| Section | Duration | Owner | What Happens |
|---|---|---|---|
| **Sprint Board Review** | 15 min | Senior Eng | Cards done, in-progress, blockers; velocity trend |
| **Quality Gate Metrics** | 10 min | CTO | Gatekeeper failures, IRT calibration backlog, anti-leak alerts |
| **Production Health** | 10 min | CTO | Uptime, error rates, latency; any incidents last week |
| **Tech Debt & Risk** | 10 min | Senior Eng | Outstanding tech debt, security findings, dependency updates |
| **Next Week Sprint Commit** | 10 min | Senior Eng | Cards for coming week; capacity, dependencies, risks |
| **Demos** | 5 min | Team | Live demo of shipped features (if any) |

**Total:** 60 minutes.

### 2.2 Friday Eng Notes Format

**Prepared by CTO Thursday 6 PM IST. Posted to `/governance/friday-eng/YYYY-MM-DD.md`.**

```markdown
# FRIDAY ENG NOTES — Week of [DATE]

## SPRINT VELOCITY
- **Target points:** [X]
- **Completed points:** [Y]
- **Velocity trend:** [↑ / ↓ / →]
- **Blockers:** [if any]

## QUALITY GATE STATUS
- **Gatekeeper check:** ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL
  - [Dimension 1]: [score/note]
  - [Dimension 2]: [score/note]
- **IRT calibration backlog:** [X questions pending]
- **Anti-leak rotation:** ✅ Active / ⚠️ [X days overdue]

## PRODUCTION HEALTH
- **Uptime:** [%]
- **P0 incidents:** [count] this week
- **Error rate (5xx):** [%]
- **Latency (p95):** [X ms]

## TECH DEBT BACKLOG
- [Debt item 1]: [effort estimate + priority]
- [Debt item 2]: [effort estimate + priority]
- Top priority for next sprint: [item]

## NEXT WEEK COMMITMENTS
- **Story 1:** [points] — [owner] — [risk: low/medium]
- **Story 2:** [points] — [owner] — [risk: low/medium]
- **Total capacity:** [points]
- **Stretch goal:** [optional story if velocity permits]

## DEPENDENCIES / ASKS FROM CEO
- [If any]: [e.g., "Need Bosch sample-pack reviewed by Wed"]
```

### 2.3 Quality Gate Metrics (Per Gatekeeper)

**CTO Office checks Gatekeeper dashboard before Friday meeting. Reports:**

- **Avg question quality score** (semantic, grammar, fairness): [1–5 scale]
- **IRT coverage:** [%] of released questions have Rasch index
- **Anti-leak detection:** [count] suspected leaked questions flagged; [count] confirmed leaks
- **Fail reasons (if any):** [list Gatekeeper blockers by dimension]

**No-blame language:** "Gatekeeper flagged dimension X; next action is [solution]."

### 2.4 Output

- **Friday Eng Notes:** Posted to `/governance/friday-eng/YYYY-MM-DD.md`
- **QUEUE updates:** Key decisions go to QUEUE-QOrium.md
- **Recording (optional):** Granola or Otter (shared in governance/)

---

## §3 — J5 Monthly Metrics Close

**Owner:** CTO Office prepares dashboard; CEO + CTO + AE + BD + Talpro Delivery (when active)  
**Time:** First Wednesday of month, 11:00 AM IST (90 minutes)  
**Attendees:** CEO, CTO, AE (Enterprise), BD (Platforms), Talpro Delivery Head (when active)  
**Pre-read:** Monthly Close Pack (prepared by CTO Tuesday EOD; 5 pages + dashboard)

### 3.1 Agenda Template (with timings)

| Section | Duration | Owner | What Happens |
|---|---|---|---|
| **Financials** | 20 min | CEO + CTO | ARR/MRR, runway, burn vs. ₹50L envelope, spend forecast |
| **Content Metrics** | 20 min | CTO + SME Lead | Questions in library, Wave coverage, IRT calibration, leak detection rate, AI plagiarism benchmark |
| **Customer Metrics** | 20 min | CEO + AE + BD | Logos closed, MAU, response volume, NPS, Customer Zero feedback themes |
| **Sales Pipeline** | 15 min | AE + BD | Qualified leads, deals by SKU, win/loss analysis |
| **Phase Gate Progress** | 15 min | CTO | M3/M6/M9/M12 trajectory; any risks to gate passage |

**Total:** 90 minutes.

### 3.2 Monthly Close Pack

**Prepared by CTO Tuesday 6 PM IST. Archived to `/governance/monthly-close/YYYY-MM.md` + `.docx`.**

```markdown
# MONTHLY CLOSE — [MONTH/YEAR]

## FINANCIALS SNAPSHOT
- Cash balance: ₹[X]L
- Monthly burn: ₹[Y]L
- Runway remaining: [Z] months
- Burn rate vs. plan: [on-track / at-risk / accelerating]
- Envelope ₹50L: [%] remaining

| Item | Plan | Actual | Variance |
|---|---|---|---|
| Contractor spend | ₹X | ₹Y | [+/−] |
| Infrastructure | ₹X | ₹Y | [+/−] |
| Misc. | ₹X | ₹Y | [+/−] |

## CONTENT METRICS
- **Questions in active library:** [X] (target by M3: 5K)
- **Roles with ≥50 questions:** [Y]
- **IRT calibration coverage:** [%] of released items
- **Leak detection rate:** [X per week]
- **Candidates run through:** [cumulative YTD]

## CUSTOMER METRICS
- **Logos closed:** [cumulative YTD]
- **MAU (active users):** [count]
- **Responses recorded:** [count this month] / [cumulative]
- **Customer Zero feedback score:** [1–5 scale]
- **NPS (if measured):** [score]

## SALES PIPELINE
| Stage | Count | Value (₹L) | Won | Lost | Pending |
|---|---|---|---|---|---|
| Prospect | X | - | - | - | - |
| Qualified Lead | Y | Z | - | - | - |
| RFP | A | B | - | - | - |
| Negotiation | C | D | - | - | - |

## PHASE GATE TRAJECTORY
**Current Phase:** [Phase 0 / Phase 1 / etc.]
**Pass criteria checklist:**
- ✅ / ⏳ / ❌ [Criterion 1]
- ✅ / ⏳ / ❌ [Criterion 2]
- [...]
**On track for M3/M6/M9/M12?** YES / AT RISK / NO

## RISKS & MITIGATIONS
- [Risk 1]: [status + mitigation plan]
- [Risk 2]: [status + mitigation plan]
```

### 3.3 IdeaForge Re-Gate (At M3, M6, M9, M12)

**Timing:** IdeaForge re-gate is a 90-minute session **attached to that month's J5 close.** The gate runs in the same meeting.

**Inputs:** All P&L, content, customer, and engineering metrics from the Monthly Close Pack.

**Outputs:** IdeaForge scorecard (24 points across 6 dimensions; pass ≥20).

**Pass criteria (per Constitution Article IX):**
- **≥20/24:** Auto-advance to next Phase. CTO Office updates provisional milestones.
- **<20/24:** Pause Phase advancement. CEO + CTO devise recovery plan within 7 days. Report back to IdeaForge within 2 weeks.

**Recording:** Always recorded; transcript to `/governance/phase-gates/M[3/6/9/12]-gate-YYYY.txt`.

### 3.4 Output

- **Monthly Close Pack:** `/governance/monthly-close/YYYY-MM.md` + `.docx` (also shared in Slack)
- **IdeaForge re-gate scorecard:** `/governance/phase-gates/M[3/6/9/12]-gate-YYYY.md` (if applicable)
- **Recording:** Granola or Otter (shared in governance/)

---

## §4 — Universal Ritual Rules

These rules apply to **all rituals** (J7, J6, J5):

### 4.1 Calendar & Scheduling

- **All rituals are on the shared Google Calendar:** "QOrium Ops" (read-only for team)
- **Calendar invites sent 1 week in advance** (with pre-read attached or linked)
- **No ad-hoc rescheduling:** If a ritual must move, reschedule the *next* occurrence; do not skip.
- **Cancellation only with written consent of all attendees** (email thread counts)

### 4.2 Attendance & Recording

- **Attendance mandatory** (except if explicit excuse pre-approved)
- **Recording optional but recommended:** Granola, Otter, or native Google Meet recording
- **Transcript required (not optional):** If recorded, provide transcript within 24 hours; save to governance/
- **No recording without attendee consent:** Ask at start of meeting

### 4.3 Outputs & Archival

**Every ritual produces an artifact:**

- **Monday Brief** → `/governance/monday-briefs/YYYY-MM-DD.md`
- **Friday Eng Notes** → `/governance/friday-eng/YYYY-MM-DD.md`
- **Monthly Close Pack** → `/governance/monthly-close/YYYY-MM.md` + `.docx`
- **Phase Gate scorecard** → `/governance/phase-gates/M[3/6/9/12]-gate-YYYY.md`

**All outputs cross-linked to QUEUE-QOrium.md** (action items section).

### 4.4 Action Items Capture

**Within 24 hours of every ritual**, CTO Office updates QUEUE-QOrium.md:

```markdown
## ACTION ITEMS FROM [RITUAL] [DATE]

| Owner | Task | ETA | Status |
|---|---|---|---|
| CEO | Bosch GCC intro call | 2026-05-20 | Open |
| CTO | Hire Senior Eng | 2026-06-15 | In progress |
```

**No action item without owner + ETA.** Captainless tasks die.

---

## §5 — Phase Gate Mechanics

Per Constitution Article IX, Phase Gates occur at **M3, M6, M9, M12.**

### 5.1 Gate Trigger

**Day before the monthly J5 close**, CTO Office:
1. Assembles all evidence from the past month (dashboards, metrics, incident reports, customer feedback)
2. Runs IdeaForge automation tool (24-point scorecard)
3. Computes final score
4. Posts scorecard to `/governance/phase-gates/M[X]-SCORECARD.md`

### 5.2 Gate Criteria (Per Constitution Article IX)

**Pass = ≥20/24 on IdeaForge scorecard across these 6 dimensions:**

1. **Engineering velocity:** Code shipped, tests passing, quality gate compliance
2. **Content delivery:** Questions released, IRT coverage, leak detection
3. **Customer traction:** Logos signed, MAU, NPS trend
4. **Financial discipline:** On-budget burn, no overspends, runway solid
5. **Hiring & people:** Team hires on track, morale healthy, no attrition
6. **Risk management:** Tech debt visible, security posture improving, no critical gaps

### 5.3 Pass Flow (≥20/24)

```
M3 Gate PASS ✅
  ↓
CTO Office posts: "🎯 PHASE GATE M3 PASSED — IdeaForge score [21]/24"
  ↓
Phase 0 officially complete. Phase 1 begins now.
  ↓
QUEUE-QOrium.md auto-updated with Phase 1 task queue
  ↓
Part A (autonomous CTO) tasks auto-trigger
  ↓
Next gate: M6
```

### 5.4 Fail Flow (<20/24)

```
M3 Gate FAIL ❌
  ↓
CTO Office posts: "⚠️  PHASE GATE M3 FAILED — IdeaForge score [19]/24"
  ↓
CTO Office includes scorecard with per-dimension scores
  ↓
CEO + CTO meet within 2 days (ad-hoc meeting; not waiting for next Monday)
  ↓
Recovery plan drafted: "If we do X, Y, Z by [date], we can re-gate by M3-end"
  ↓
Re-submission within 2 weeks OR request Constitutional Override (Article XI §11.3)
  ↓
If re-gate PASS: Phase advance as above
If re-gate FAIL: CEO decides (override, extend Phase 0, pivot)
```

### 5.5 Constitutional Override (Article XI §11.3)

**If gate fails** and CEO wants to override, CEO submits override request in writing to CTO with:
- **Rationale:** Why Phase advance is justified despite <20/24
- **Contingencies:** What changes to prevent repeated failures
- **Timestamp:** CEO override is documented with timestamp

**CTO records override** in `/governance/overrides/M[X]-override-[date].md` (immutable audit trail).

---

## §6 — Tooling & Technology

### 6.1 Calendar

- **Google Calendar:** Shared "QOrium Ops" calendar
- **Invites include:** Pre-read (or link), Zoom link (if remote), location (if in-person)
- **Reminders:** 24-hour notice + 1-hour before

### 6.2 Documents & Outputs

- **Storage:** `/governance/` folder structure in QOrium project
- **Format:** Markdown (.md) for version control; .docx for external sharing (Monthly Close Pack)
- **Version control:** Git commits for ritual outputs (daily batch commit by CTO Office EOD)

### 6.3 Communications

- **Slack/Telegram:** Ritual summaries posted to `#qorium-ops` channel
- **Email:** Monthly Close Pack emailed to CEO + finance stakeholders
- **Recording:** Granola or Otter.ai (transcripts auto-saved to governance/)

### 6.4 Metrics Dashboard

- **Grafana:** Live dashboard for engineering + ops metrics
- **Spreadsheet:** Monthly finance tracking (₹L burn, runway)
- **QUEUE-QOrium.md:** Master action item tracker (always in sync with ritual outputs)

---

## §7 — Solo Operation (Month 0–1)

Until first 2 hires onboard (Senior Eng + SME Lead):

- **J7 (Monday 1:1):** CEO + CTO only (no Senior Eng yet). Same format, 45 minutes.
- **J6 (Friday Eng):** CTO solo. Reduced format; focus on infrastructure readiness + content engine scaffolding. 30 minutes.
- **J5 (Monthly Close):** CEO + CTO only (no AE, BD, or Delivery Head yet). Shorter format; 60 minutes. Phase Gate still runs on schedule.

**Resume full rituals** once Senior Eng + SME Lead hired + onboarded (likely Week 3–4 of Month 1).

---

## §8 — Drafting Notes (For CTO Office)

1. **Exact ritual times:**
   - Monday 9:00 AM IST — confirm CEO's preference (flexible by ±30 min if needed)
   - Friday 4:00 PM IST — confirm team preference (or 3:00 PM if earlier suits)
   - Monthly Wednesday 11:00 AM IST — confirm 1st Wednesday is OK; if holidays, shift to 1st non-holiday Wed

2. **Recording standardization:**
   - Choose Granola OR Otter.ai for all rituals (not mix-and-match)
   - Transcripts auto-exported to governance/ weekly
   - Recordings deleted after 30 days (transcript is the archive)

3. **QUEUE-QOrium.md structure:**
   - Sync with ritual outputs daily
   - Action items: owner + ETA + status (Open / In Progress / Done / Blocked)
   - Link each item back to its ritual source (e.g., "From Monday 2026-05-06")

4. **Phase Gate automation:**
   - IdeaForge runs nightly; M3/M6/M9/M12 gates compute automatically
   - CTO Office reviews scorecard day-of and posts to #qorium-ops
   - Re-gate requests (if failed) go to CEO + CTO chat; documented in overrides/

5. **Calendar naming:**
   - Monday ritual: "J7 Strategic 1:1 (CEO + CTO)"
   - Friday ritual: "J6 Engineering Review"
   - Monthly ritual: "J5 Monthly Metrics Close + M[X] Phase Gate" (if applicable)

6. **Ritual failure (if someone is sick/absent):**
   - J7 Monday 1:1 skipped: Reschedule to Tuesday same week
   - J6 Friday Eng: Reschedule to Thursday or Monday next week
   - J5 Monthly: Reschedule to 2nd Wednesday of month; gate timer still runs

---

## §9 — Ritual Operating Checklist

**Use this 1-page checklist to ensure every ritual runs smoothly.**

```markdown
# RITUAL OPERATING CHECKLIST

## BEFORE RITUAL (Owner: CTO Office)
- [ ] Pre-read prepared (Sunday 8 PM for Monday, Thurs 6 PM for Friday, Tues 6 PM for Monthly)
- [ ] Pre-read shared in #qorium-ops Slack channel
- [ ] Calendar reminder sent (24 hours before)
- [ ] Zoom link included in invite (or location if in-person)
- [ ] All attendees have access to shared documents (Google Drive / governance/)
- [ ] Metrics dashboard (Grafana/spreadsheet) updated with latest data
- [ ] Any decisions queued in QUEUE-QOrium.md reviewed

## DURING RITUAL (Owner: Meeting facilitator — usually CTO or CEO)
- [ ] Start on time (no more than 5 min late)
- [ ] Recording consent: ask all attendees "OK to record?"
- [ ] Scribe designated (CTO Office captures action items live)
- [ ] Each agenda section time-boxed (watch clock; cut long discussions at bell)
- [ ] Decisions captured with owner + ETA
- [ ] Questions / blockers noted in real-time

## AFTER RITUAL (Owner: CTO Office — within 24 hours)
- [ ] Meeting notes/brief drafted and posted to governance/
- [ ] Action items extracted to QUEUE-QOrium.md
- [ ] Recording finalized; transcript exported
- [ ] Ritual output (Monday Brief, Eng Notes, Close Pack, gate scorecard) archived
- [ ] #qorium-ops Slack summary posted (1–2 sentence recap)
- [ ] Any escalations flagged for follow-up call

## MONTHLY CLOSE (Additional checks)
- [ ] P&L dashboard reviewed and signed off by CEO
- [ ] Customer metrics validated with AE/BD
- [ ] Phase Gate scorecard computed (if M3/M6/M9/M12)
- [ ] Monthly Close Pack (markdown + DOCX) exported and archived
- [ ] Recovery plan drafted (if gate failed)

## PHASE GATE (M3/M6/M9/M12 only)
- [ ] Gate pass/fail status determined (≥20 vs <20)
- [ ] Scorecard published to governance/phase-gates/
- [ ] If PASS: Phase advance announced; next phase task queue published
- [ ] If FAIL: Recovery plan drafted within 2 days
- [ ] Re-gate scheduled (2 weeks if applicable)
```

---

*End of Operating Rituals v1.0. The rhythm of QOrium governance is now defined.*

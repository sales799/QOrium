# MONDAY BRIEF TEMPLATE

**Filename pattern:** `monday-briefs/YYYY-MM-DD-Monday-Brief.md`  
**Author:** CTO Office  
**Prepared:** Sunday 8:00 PM IST; emailed to CEO + reviewed at Monday 9:00 AM IST 1:1  
**Reference:** Constitution Article VIII §1.2, Operating Rituals §1

---

## [DATE] — WEEK [X] OF QUARTER [Q] — PHASE [N]

**Decision SLA:** Anything raised either decided in meeting OR has owner+ETA by EOD Monday (6:00 PM IST).

---

## §1 WINS (Last 7 Days)

*Bulleted list, 4 max. Include brief metric or outcome.*

- [Achievement 1]: [metric, e.g., "3 Bosch RFP questions cleared SME review"]
- [Achievement 2]: [metric]
- [Achievement 3]: [metric]
- [Achievement 4]: [metric]

---

## §2 LOSSES / STALLS (Last 7 Days)

*Bulleted list, 3 max. Include status and next step.*

- [Blocker 1]: [P0/P1/P2] — [current status] — ETA: [date]
- [Blocker 2]: [P0/P1/P2] — [current status] — ETA: [date]
- [Blocker 3]: [P0/P1/P2] — [current status] — ETA: [date]

---

## §3 THIS WEEK'S PRIORITIES

*Table: priority / task / owner / ETA*

| Priority | Task | Owner | ETA |
|---|---|---|---|
| 1 | [Task name] | [Owner] | [YYYY-MM-DD] |
| 2 | [Task name] | [Owner] | [YYYY-MM-DD] |
| 3 | [Task name] | [Owner] | [YYYY-MM-DD] |
| 4 | [Task name] | [Owner] | [YYYY-MM-DD] |

---

## §4 STRATEGIC TOPIC OF THE WEEK

*Rotating: Week 1 = Customer Pipeline | Week 2 = Product Delivery | Week 3 = Hiring | Week 4 = Financials | Week 5 = Risks. Include 4 paragraphs of data-backed analysis + 1 decision question if applicable.*

### Topic: [TOPIC NAME]

**Paragraph 1 — Situation:**  
[Context, current state, metrics]

**Paragraph 2 — Trend Analysis:**  
[What's moving up/down/sideways over past 2–4 weeks]

**Paragraph 3 — Risk or Opportunity:**  
[What's at stake, what could go better/worse]

**Paragraph 4 — Recommendation:**  
[CTO's take on the decision or next move]

**Decision asked of CEO (if any):**  
[Specific yes/no/discuss question]

---

## §5 DECISION QUEUE

*Table: id / decision / context / recommendation / SLA*

| ID | Decision | Context | CTO Rec | By When |
|---|---|---|---|---|
| D001 | [Decision title] | [Why it matters] | [Rec: A or B?] | [YYYY-MM-DD EOD] |
| D002 | [Decision title] | [Why it matters] | [Rec: A or B?] | [YYYY-MM-DD EOD] |
| D003 | [Decision title] | [Why it matters] | [Rec: A or B?] | [YYYY-MM-DD EOD] |

---

## §6 AHEAD-OF-QUARTER LOOK

*1 paragraph. Track to nearest Phase Gate (M3/M6/M9/M12).*

[Signal on upcoming Phase Gate readiness. Are we on track? Any early warning lights? Runway status?]

---

## §7 ACTION ITEMS FROM LAST MONDAY

*Status update on each item opened last week.*

| Owner | Task | Original ETA | Current Status | Notes |
|---|---|---|---|---|
| [Owner] | [Task] | [YYYY-MM-DD] | ✅ Done / 🟡 In Progress / 🔴 Blocked | [If blocked, why?] |
| [Owner] | [Task] | [YYYY-MM-DD] | ✅ Done / 🟡 In Progress / 🔴 Blocked | [If blocked, why?] |

---

## §8 NEW ACTION ITEMS PROPOSED

*Table: action / owner / ETA*

| Action | Owner | ETA |
|---|---|---|
| [Action 1] | [Owner] | [YYYY-MM-DD] |
| [Action 2] | [Owner] | [YYYY-MM-DD] |
| [Action 3] | [Owner] | [YYYY-MM-DD] |

---

## FOOTER

**Document Control:**  
- Prepared by CTO Office, reviewed by CEO + CTO in Monday 9:00 AM IST meeting
- All action items captured in QUEUE-QOrium.md within 24 hours
- Any decision raised either decided in meeting OR has owner+ETA by EOD Monday
- Escalations flagged immediately; no decision hangs past Monday

---

---

# EXAMPLE — 2026-06-08 Monday Brief

**2026-06-08 (Week 5, Q2, Phase 1)**

---

## §1 WINS (Last 7 Days)

- **Wave 1 Senior Java pack v0.5 completed:** 10 questions drafted + SME review scheduled for Wed
- **Talpro Customer Zero Feedback Charter signed:** Slack #qorium-customer-zero launched Friday
- **5 leads in RFP pipeline:** Bosch (progressed to Q2), TCS (new), Infosys (exploratory), 2 others in qualification
- **IRT calibration started:** Phase A 100-question bootstrap cohort hit N≥30 responses; discrimination ≥0.35 on 95 items

---

## §2 LOSSES / STALLS (Last 7 Days)

- **SME Lead hire slipped 1 week:** Original ETA Jun 4, now Jun 11; offer negotiation ongoing — no content pipeline impact yet
- **API latency spike Wednesday:** P2 (7-day SLA) — root cause identified (N8N workflow load); fix deployed Thursday 6 PM

---

## §3 THIS WEEK'S PRIORITIES

| Priority | Task | Owner | ETA |
|---|---|---|---|
| 1 | Finalize Senior Java Sample Pack v0.5 + submit for Bosch review | CTO | 2026-06-11 |
| 2 | Onboard first 3 SMEs (Java, React, SQL) | Content Lead | 2026-06-13 |
| 3 | Phase A question calibration analysis (DIF check) | CTO | 2026-06-12 |
| 4 | Customer Zero Week 2 metrics summary + feedback form | CS Lead | 2026-06-13 |

---

## §4 STRATEGIC TOPIC OF THE WEEK

### Topic: Hiring Velocity & Team Capacity

**Paragraph 1 — Situation:**  
We've committed to hire 2 (Senior Eng + SME Lead) by end of Month 1, with full 8-domain SME pool (32 total) by end of Month 2 for Wave 1 question authoring. Currently: 1 offer out (Senior Eng), SME Lead in final-round negotiations. Contractor spend forecast: ₹50L for Wave 1 (May–Jul). This hiring ramp is critical to hitting M3 gate (5K questions + 80% IRT coverage).

**Paragraph 2 — Trend Analysis:**  
Recruiting started May 1 (Week 1). We're on track for Senior Eng onboard Jun 1, SME Lead Jun 11. However, backfill for individual domain SMEs (4 per domain, 8 domains = 32 total) is still ramping. LinkedIn outreach started last week; 12 warm intros from Talpro alumni pool by EOW. Offer acceptance rate: 2/3 so far (67%). No attrition yet.

**Paragraph 3 — Risk or Opportunity:**  
If SME hiring drags beyond Jun 20, Phase B question authoring (AI-augmented, needs all domain leads + pools active) will miss the Jun 1–Jul 31 window. This compresses calibration time (Phase C) and puts M3 gate at risk. Upside: warm Talpro alumni pool is responding faster than cold LinkedIn; we might close 8–10 SMEs by Jun 15 (ahead of plan).

**Paragraph 4 — Recommendation:**  
Propose 2-pronged approach: (1) Backfill 6 domain leads by Jun 15 via alumni pool + targeted outreach; (2) authorize contingency contract with Upwork freelance platform for junior SMEs if lead pipeline slows. This de-risks Phase B authoring start date.

**Decision asked of CEO:**  
Approve ₹10L contingency budget for freelance SME backfill if warm sourcing doesn't hit 20 commits by Jun 12?

---

## §5 DECISION QUEUE

| ID | Decision | Context | CTO Rec | By When |
|---|---|---|---|---|
| D001 | Approve contingency freelance budget (₹10L SME backfill) | Hiring ramp risk; Phase B at stake if SME pool incomplete by Jun 20 | YES; activate if warm sourcing yields <20 commits by Jun 12 | 2026-06-08 EOD |
| D002 | Lock Bosch Sample Pack v0.5 scope (10 Q + 2-week calibration window) or extend to 20 Q? | Bosch wants depth; 10 Q fits timeline, 20 Q risks M3 Phase Gate | 10 Q + extend Phase C if needed; don't overcommit on authoring | 2026-06-08 EOD |
| D003 | Approve ₹1.5L additional infrastructure spend (Grafana + IRT solver instances) for Phase C calibration? | Current setup can handle 100 calibration candidates; phase C needs 200+ to hit 80% IRT coverage | YES; cost justified by M3 gate dependency | 2026-06-08 EOD |

---

## §6 AHEAD-OF-QUARTER LOOK

We're on track for M3 gate (July 31). Current risk surface: SME hiring timeline and Phase B question authoring velocity. If we hit 20+ SME commitments by Jun 15 and lock 3+ domain leads, Phase B can start Jun 19 as planned. Talpro Customer Zero is ramping smoothly (15 candidates in Week 2); feedback quality is strong (4.2/5 signal quality). Runway at current burn: 18 months on ₹50L envelope. No cash shortfalls projected before M6.

---

## §7 ACTION ITEMS FROM LAST MONDAY (2026-06-01)

| Owner | Task | Original ETA | Current Status | Notes |
|---|---|---|---|---|
| CEO | Approve SME Lead offer terms | 2026-06-04 | 🟡 In Progress | Final negotiation on base pay + equity; ETA Jun 8 |
| CTO | Complete Phase A 100-question bootstrap | 2026-06-07 | ✅ Done | Questions delivered; calibration loop started |
| Content Lead | Draft Wave 1 authoring SOP | 2026-06-06 | ✅ Done | Posted to governance/ + shared with team |
| BD | Qualify 5 leads to RFP | 2026-06-05 | ✅ Done | Bosch, TCS, Infosys, 2 others now in pipeline |

---

## §8 NEW ACTION ITEMS PROPOSED

| Action | Owner | ETA |
|---|---|---|
| Finalize Senior Java v0.5 SME reviews + close pack | CTO | 2026-06-11 |
| Close SME Lead offer signature | CEO | 2026-06-08 |
| Backfill 6 domain leads via alumni sourcing | Content Lead | 2026-06-15 |
| Run DIF (Differential Item Functioning) bias audit on Phase A batch | CTO | 2026-06-12 |
| Post Week 2 Customer Zero metrics + feedback summary | CS Lead | 2026-06-13 |

---

**End of example. Total word count: 1,280.**

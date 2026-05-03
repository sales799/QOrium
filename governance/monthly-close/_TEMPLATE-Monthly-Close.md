# MONTHLY CLOSE TEMPLATE

**Filename pattern:** `monthly-close/YYYY-MM.md` (+ `.docx` for external sharing)  
**Author:** CTO Office  
**Run:** First Wednesday of month, 11:00 AM IST (90 min J5 ritual + IdeaForge re-gate if M3/M6/M9/M12)  
**Reference:** Constitution Article VIII §3, Article IX Phase Gates, Operating Rituals §3

---

## [MONTH/YEAR] CLOSE

**Phase:** [Phase N]  
**Days into Phase:** [X of Y]  
**Gate Window:** [If M3/M6/M9/M12, IdeaForge re-gate attached; score ≥20/24 to advance]

---

## §1 FINANCIALS (5 KPIs)

| KPI | Current | Last Month | Δ | Status |
|---|---|---|---|---|
| **ARR / MRR** | ₹[X]L / ₹[Y]L | ₹[X]L / ₹[Y]L | [+/−] | ✅ / 🟡 / 🔴 |
| **Burn rate** | ₹[X]L/month | ₹[Y]L/month | [+/−] ₹[Z]L | ✅ / 🟡 / 🔴 |
| **Cash position (vs ₹50L envelope)** | [X]% remaining ([Y] months runway) | [Z]% remaining | [+/−] | ✅ / 🟡 / 🔴 |
| **CAC + LTV** | CAC ₹[X]K / LTV ₹[Y]K | CAC ₹[X]K / LTV ₹[Y]K | [ratio improving?] | ✅ / 🟡 / 🔴 |
| **Pipeline-to-close ratio** | [X] qualified / [Y] closed | [Z] qualified / [W] closed | [trend] | ✅ / 🟡 / 🔴 |

**Summary:** [1-line narrative on financial health]

---

## §2 CONTENT METRICS (5 KPIs)

| KPI | Current | Target (M3) | % to Goal | Status |
|---|---|---|---|---|
| **Questions in library (released)** | [X] | 5,000 | [X]% | ✅ / 🟡 / 🔴 |
| **Wave coverage (domains with ≥50 Q)** | [X]/8 | 8/8 | [X]% | ✅ / 🟡 / 🔴 |
| **IRT calibration coverage** | [X]% | 80% | [X]% | ✅ / 🟡 / 🔴 |
| **Leak detection rate (alerts/week)** | [X] / [X]% TP | <1 / >90% TP | [trend] | ✅ / 🟡 / 🔴 |
| **AI plagiarism public benchmark** | [X]% unique (vs corpus) | >95% | [X]% | ✅ / 🟡 / 🔴 |

**Summary:** [1-line narrative: content velocity, quality signal, leak risk]

---

## §3 CUSTOMER METRICS (5 KPIs)

| KPI | Current | Last Month | Δ | Status |
|---|---|---|---|---|
| **Logos signed (running)** | [X] | [Y] | +[Z] | ✅ / 🟡 / 🔴 |
| **MAU (monthly active users)** | [X] | [Y] | +[Z] | ✅ / 🟡 / 🔴 |
| **Response volume (assessments)** | [X] this month / [Y] YTD | [Z] last month | [trend] | ✅ / 🟡 / 🔴 |
| **NPS (from Customer Zero survey)** | [X] | [Y] last month | [+/−] | ✅ / 🟡 / 🔴 |
| **Customer Zero feedback themes (top 3)** | 1. [Theme] 2. [Theme] 3. [Theme] | Previous: [Previous top 3] | [Improving?] | ✅ / 🟡 / 🔴 |

**Summary:** [1-line narrative: traction, satisfaction, retention signal]

---

## §4 PIPELINE (4 KPIs)

| KPI | Count | Value (₹L) | Trend | Notes |
|---|---|---|---|---|
| **Qualified leads by SKU** | [X] total | [Y]L | ↑ / → / ↓ | Stack-Vault: [X], ReadyBank: [Y], Custom: [Z] |
| **Deals in S5+ (advanced negotiation)** | [X] | [Y]L | ↑ / → / ↓ | [Names/stage] |
| **Win / Loss ratio (MTD)** | [X] won / [Y] lost | [X%] | [trend vs history] | Avg deal size: [₹ XL] |
| **Avg sales cycle (days)** | [X] days | — | [vs benchmark 45d] | [trend] |

**Summary:** [1-line: pipeline health, velocity, competitive position]

---

## §5 PHASE GATE PROGRESS (M3/M6/M9/M12)

*Only appears if current month is a gate month (M3=July, M6=Oct, M9=Jan, M12=April).*

**Current Phase:** [Phase N]  
**Gate target date:** [Date]  
**Days remaining:** [X]

| Gate Criterion | Current State | Projected (by gate) | Status |
|---|---|---|---|
| **Engineering velocity:** Code shipped, tests passing, quality gate | [State] | [Projected] | ✅ GREEN / 🟡 AMBER / 🔴 RED |
| **Content delivery:** 5K questions, 80% IRT calibration, <3 leaks | [State] | [Projected] | ✅ GREEN / 🟡 AMBER / 🔴 RED |
| **Customer traction:** Logos, MAU, NPS | [State] | [Projected] | ✅ GREEN / 🟡 AMBER / 🔴 RED |
| **Financial discipline:** Burn <₹50L envelope, no overages | [State] | [Projected] | ✅ GREEN / 🟡 AMBER / 🔴 RED |
| **Hiring & people:** 2+ hires, morale healthy, no attrition | [State] | [Projected] | ✅ GREEN / 🟡 AMBER / 🔴 RED |
| **Risk management:** Tech debt visible, security gap-closed, compliance ready | [State] | [Projected] | ✅ GREEN / 🟡 AMBER / 🔴 RED |

**Gate readiness:** On track / At risk / Recovery plan needed

**Recovery plan (if at risk):**  
[If any criterion is AMBER/RED, describe what needs to happen by gate to green-light that criterion]

---

## §6 IDEAFORGE RE-GATE SCORECARD (M3/M6/M9/M12 ONLY)

*24-point scorecard across 6 dimensions. ≥20/24 = auto-advance to next Phase.*

| Dimension | Criterion | Evidence | Score (out of 4) |
|---|---|---|---|
| **Engineering Velocity (4 pts)** | 1. Code deployed on schedule | [Link to git log / PR list] | [0–4] |
| | 2. Test coverage >80% | [Gatekeeper report] | [0–4] |
| | 3. Zero critical security findings | [Security audit report] | [0–4] |
| | 4. Production uptime >99.5% | [Grafana dashboard / SLA report] | [0–4] |
| **Content Delivery (4 pts)** | 1. 5,000 questions released | [Question library database count] | [0–4] |
| | 2. 80% IRT calibration coverage | [IRT calibration job report] | [0–4] |
| | 3. <3 confirmed leaked questions | [Anti-leak crawler report] | [0–4] |
| | 4. Bias audit pass (DIF < 0.5) | [I/O Psych DIF analysis] | [0–4] |
| **Customer Traction (4 pts)** | 1. ≥3 logos signed | [Signed contracts / CRM pipeline] | [0–4] |
| | 2. ≥200 MAU | [Platform analytics] | [0–4] |
| | 3. NPS ≥30 | [Customer Zero survey] | [0–4] |
| | 4. Churn rate <5% | [Customer retention metrics] | [0–4] |
| **Financial Discipline (4 pts)** | 1. Burn rate ≤₹12.5L/month (on budget) | [Finance report] | [0–4] |
| | 2. Cash remaining ≥60% of ₹50L envelope | [Cash position] | [0–4] |
| | 3. No unbudgeted overages >₹5L | [Spend audit] | [0–4] |
| | 4. Pipeline visibility >6-month ARR | [Sales forecast] | [0–4] |
| **Hiring & People (4 pts)** | 1. Team hires on track (SME ramp complete) | [Offer acceptance + onboard dates] | [0–4] |
| | 2. eNPS / morale healthy (no attrition) | [Slack pulse survey / retention] | [0–4] |
| | 3. Leadership bench identified | [Org chart + succession plan] | [0–4] |
| | 4. Learning culture visible (skills growth) | [Skill certifications / promo comps] | [0–4] |
| **Risk Management (4 pts)** | 1. Tech debt register up-to-date | [Tech-debt.md in project root] | [0–4] |
| | 2. Security posture improved (no critical gaps) | [Pen test / SAST report vs baseline] | [0–4] |
| | 3. Compliance posture (DPDPA/GDPR ready) | [Compliance audit] | [0–4] |
| | 4. Incident response runbook tested (1 drill) | [Drill report / post-mortem] | [0–4] |

**Total Score:** [X]/24

**Pass / Fail:** ≥20 = PASS → Auto-advance to next Phase  
| <20 = FAIL → Recovery plan required within 7 days

**Gate Decision:** [GO / CONDITIONAL / NO-GO]  
**Rationale:** [1-paragraph explanation by CTO + CEO consensus]

---

## §7 DECISIONS TAKEN THIS MONTH

*Bullet list with rationale.*

- **Decision 1:** [What] → Why [reasoning] → Owner [who implemented]
- **Decision 2:** [What] → Why [reasoning] → Owner [who implemented]
- **Decision 3:** [What] → Why [reasoning] → Owner [who implemented]

---

## §8 RISKS REGISTER (TOP 3 ACTIVE RISKS)

| Risk | Status | Mitigation | Owner | ETA to Close |
|---|---|---|---|---|
| [Risk 1] | 🔴 Open / 🟡 Monitored | [Mitigation plan] | [Owner] | [YYYY-MM-DD] |
| [Risk 2] | 🔴 Open / 🟡 Monitored | [Mitigation plan] | [Owner] | [YYYY-MM-DD] |
| [Risk 3] | 🔴 Open / 🟡 Monitored | [Mitigation plan] | [Owner] | [YYYY-MM-DD] |

---

## §9 NEXT-MONTH PRIORITIES (TOP 5)

| Priority | Owner | Why | By When |
|---|---|---|---|
| 1. [Priority] | [Owner] | [Rationale] | [YYYY-MM-DD] |
| 2. [Priority] | [Owner] | [Rationale] | [YYYY-MM-DD] |
| 3. [Priority] | [Owner] | [Rationale] | [YYYY-MM-DD] |
| 4. [Priority] | [Owner] | [Rationale] | [YYYY-MM-DD] |
| 5. [Priority] | [Owner] | [Rationale] | [YYYY-MM-DD] |

---

---

# EXAMPLE — 2026-08 Monthly Close + M3 IdeaForge Re-Gate

**August 2026 Close + M3 Phase Gate**

**Phase:** 1 (final month)  
**Days into Phase:** 91 of 92  
**Gate window:** Yes — M3 re-gate (July 31 actual; pushed 1 week due to calibration lag)

---

## §1 FINANCIALS

| KPI | Current | Last Month | Δ | Status |
|---|---|---|---|---|
| **ARR / MRR** | ₹8.5L / ₹70K | ₹6L / ₹50K | +₹2.5L / +₹20K | ✅ |
| **Burn rate** | ₹12L/month | ₹13.5L/month | −₹1.5L | ✅ (within ₹50L envelope) |
| **Cash position** | 62% remaining (₹31L of ₹50L) | 75% | −13pp | ✅ (runway: 25 months) |
| **CAC + LTV** | ₹4.2L CAC / ₹120L LTV | ₹3.8L / ₹110L | Ratio improving | ✅ |
| **Pipeline-to-close** | 8 qualified / 3 closed | 5 qualified / 2 closed | +3 leads | ✅ |

**Summary:** Healthy burn deceleration + strong lead velocity; pipeline-to-close ratio showing traction. Bosch deal (₹4.5L ARR) inbound by Sep.

---

## §2 CONTENT METRICS

| KPI | Current | Target (M3) | % to Goal | Status |
|---|---|---|---|---|
| **Questions in library** | 5,150 | 5,000 | 103% | ✅ |
| **Wave coverage** | 8/8 | 8/8 | 100% | ✅ |
| **IRT calibration** | 82% | 80% | 102% | ✅ |
| **Leak detection** | 1 alert/week / 92% TP | <1 / >90% TP | ✅ | ✅ |
| **AI plagiarism benchmark** | 97.2% unique | >95% | 102% | ✅ |

**Summary:** M3 gate content prerequisites exceeded on all measures. Wave 1 complete + M3 quality bar passed.

---

## §3 CUSTOMER METRICS

| KPI | Current | Last Month | Δ | Status |
|---|---|---|---|---|
| **Logos signed** | 3 | 2 | +1 (Bosch pilot signed Aug 5) | ✅ |
| **MAU** | 287 | 165 | +122 (Talpro scaled to 150 candidates; Bosch pilot: 100) | ✅ |
| **Response volume** | 1,847 (Aug) / 4,922 YTD | 1,203 (Jul) | +644 | ✅ |
| **NPS (C0)** | 42 | 38 | +4 | ✅ |
| **Top 3 feedback themes** | 1. "Questions felt fresh vs competitors" 2. "Signal quality improved our hiring" 3. "Anti-leak automation builds confidence" | 1. "Content quality" 2. "UX smooth" 3. "Support responsive" | Consistent positive | ✅ |

**Summary:** Customer Zero (Talpro) ramping as committed; Bosch pilot underway; NPS strong. Signal quality validation happening.

---

## §4 PIPELINE

| KPI | Count | Value (₹L) | Trend | Notes |
|---|---|---|---|---|
| **Qualified leads** | 8 | ₹17L | ↑ | Stack-Vault (enterprise): 3 leads; ReadyBank (SMB): 5 leads |
| **Deals in S5+** | 2 | ₹9L | ↑ | Bosch (just closed), TCS (negotiation final week) |
| **Win/Loss ratio** | 1 won / 0 lost | 100% | — | Bosch win validates IRT signal; no losses |
| **Avg sales cycle** | 45 days | — | ← On plan | Bosch: 42d; Talpro: 30d (internal) |

**Summary:** Pipeline showing strong quality + velocity. TCS expected close Sep 2.

---

## §5 PHASE GATE PROGRESS (M3)

**Gate target:** Jul 31 (actual: Aug 7 due to IRT calibration lag, approved by CEO)  
**Days remaining:** Gate closed (score computed Aug 6)

| Gate Criterion | Current State | Projected | Status |
|---|---|---|---|
| **Engineering velocity** | 48 PRs shipped, tests 92% coverage, 0 security findings | ✅ | ✅ GREEN |
| **Content delivery** | 5,150 Q released, 82% IRT, 1 confirmed leak (not critical) | ✅ | ✅ GREEN |
| **Customer traction** | 3 logos, 287 MAU, NPS 42 | ✅ | ✅ GREEN |
| **Financial discipline** | Burn ₹12L/month, 62% cash remaining | ✅ | ✅ GREEN |
| **Hiring & people** | 4 hires (CTO, SME Lead, Senior Eng, Frontend Eng), 0 attrition | ✅ | ✅ GREEN |
| **Risk management** | Tech debt register live, security gap-closed, DPDPA compliance Q2 ready, 1 incident drill done | ✅ | ✅ GREEN |

**Gate readiness:** ON TRACK — All criteria GREEN

---

## §6 IDEAFORGE RE-GATE SCORECARD (M3)

**Total Score: 21/24 — PASS ✅ (≥20 threshold)**

| Dimension | Criterion | Evidence | Score |
|---|---|---|---|
| **Engineering (4)** | 1. Code on schedule | 48 PRs shipped on roadmap | 4/4 |
| | 2. Test coverage >80% | 92% coverage (Gatekeeper) | 4/4 |
| | 3. Zero critical security | Pen test clean (Jul 15 report) | 4/4 |
| | 4. Uptime >99.5% | 99.93% (Grafana) | 3/4 (−1: 1 P1 incident mid-Jul, resolved) |
| **Content (4)** | 1. 5,000 questions | 5,150 released | 4/4 |
| | 2. 80% IRT coverage | 82% (1,210/1,475 released items) | 4/4 |
| | 3. <3 confirmed leaks | 1 leak (acceptable) | 3/4 (−1: 1 confirmed leak Jul 12) |
| | 4. Bias audit pass | DIF <0.5 all domains (I/O Psych report) | 4/4 |
| **Traction (4)** | 1. ≥3 logos | 3 (Bosch, TCS in negotiation, 1 exploratory) | 4/4 |
| | 2. ≥200 MAU | 287 MAU (Talpro 150 + Bosch pilot 100 + exploratory 37) | 4/4 |
| | 3. NPS ≥30 | NPS 42 (Customer Zero survey) | 4/4 |
| | 4. Churn <5% | 0% churn YTD (Talpro + Bosch active) | 3/4 (−1: early; need longer data) |
| **Financial (4)** | 1. Burn ≤₹12.5L/month | ₹12L actual (within envelope) | 4/4 |
| | 2. Cash ≥60% of ₹50L | ₹31L remaining (62%) | 4/4 |
| | 3. No unbudgeted >₹5L | Clean spend; SME bonuses authorized (₹2.5L; within Wave 1 budget) | 4/4 |
| | 4. Pipeline visibility >6-mo ARR | Bosch ₹4.5L (12 months), TCS ₹3.5L (8 months) forecasted | 3/4 (−1: exploratory pipeline lower visibility) |
| **People (4)** | 1. Hires on track | 4 hired (CTO, SME Lead, Senior Eng, Frontend Eng); Wave 2 SME pool onboarding started | 4/4 |
| | 2. Morale healthy | eNPS 64 (Aug survey); 0 attrition | 4/4 |
| | 3. Leadership bench | Org chart documented; CTO office + Senior Eng path clear | 3/4 (−1: need external advisor hire for M6) |
| | 4. Learning visible | 2 team certifications (Java 21 LTS, IRT fundamentals); monthly learning budget allocated | 3/4 (−1: early; need more data) |
| **Risk (4)** | 1. Tech debt updated | tech-debt.md live; 8 items tracked | 4/4 |
| | 2. Security improved | Pen test Jul 15 clean; SAST no critical gaps | 4/4 |
| | 3. Compliance ready | DPDPA mapping 90% done; GDPR baseline met | 3/4 (−1: certification pending Q1 2027) |
| | 4. Runbook tested | Incident drill Jul 20 (API outage scenario); post-mortem done | 4/4 |

**Gate Decision: GO ✅ — PHASE 1 COMPLETE. PHASE 2 BEGINS SEPTEMBER 1.**

**Rationale:** All 6 dimensions achieving ≥3/4 with 21/24 total score. Engineering velocity, content delivery, customer traction, and financial discipline all validated. Minor gaps in churn history, exploratory pipeline clarity, and compliance certification are acceptable for Phase 2 focus. CTO + CEO consensus: PROCEED.

---

## §7 DECISIONS TAKEN THIS MONTH

- **Decision 1:** Approve Phase 2 roadmap (Wave 2 content + SAP/Oracle + advanced anti-leak). Why: M3 gate passed; customer demand validated. Owner: CTO + CEO
- **Decision 2:** Extend Bosch pilot 3 months (Sep–Nov 2026). Why: 100 MAU active; signal quality validated. Owner: BD + CEO
- **Decision 3:** Hire external I/O Psych consultant for M6 (bias audit lead). Why: DIF analysis critical as content scales. Owner: CTO
- **Decision 4:** Allocate ₹15L M4 budget to Wave 2 author ramp (SAP + Oracle SMEs). Why: Customer demand identified; early-mover advantage. Owner: CEO + CTO

---

## §8 RISKS REGISTER

| Risk | Status | Mitigation | Owner | ETA |
|---|---|---|---|---|
| **SME Lead departure risk** | 🟡 Monitored | Equity cliff at M12; early vest negotiated for M6. Backup plan: external advisor on standby. | CTO | Aug 8 (vest doc signed) |
| **Bosch contract renewal (Oct)** | 🟡 Monitored | Pilot performance metrics strong; renewal proposal drafted for late Sep. NPS 42 supports renewal. | BD + CEO | 2026-10-15 |
| **DPDPA certification timeline** | 🟡 Monitored | Q1 2027 target (acceptable for M6 gate). Compliance audit scheduled Oct 15. | CTO | 2026-01-31 |

---

## §9 NEXT-MONTH PRIORITIES (Phase 2 Launch)

| Priority | Owner | Why | By When |
|---|---|---|---|
| 1. Wave 2 SAP domain launch (200 questions) | Content Lead | Customer demand validated; early Talpro request | 2026-09-30 |
| 2. TCS deal close (₹3.5L ARR) | BD + CEO | In final negotiation; pipeline momentum | 2026-09-02 |
| 3. Advanced anti-leak v2 design + RFP | CTO | Bosch requires vendor assessment; feature parity with Mettl | 2026-09-15 |
| 4. Phase 2 hiring plan (Wave 2 SMEs + Ops hire) | CTO + HR | Scale content ops; 16 new SME hires planned Q4 | 2026-09-30 |
| 5. M6 gate roadmap planning (finance + product) | CEO + CTO | Plan Q3–Q4 targets; resource allocation for Phase 2 | 2026-09-20 |

---

**End of example. Total word count: 1,580. IdeaForge scorecard: 21/24 → GO to Phase 2.**

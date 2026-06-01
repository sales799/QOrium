# Customer Zero Pre-Launch Checklist v1

**Status:** v1 — comprehensive readiness checklist for QOrium's first 100 Talpro candidates running through Customer Zero. Combines D-track punchlist items + readiness criteria + go/no-go decision tree.
**Authored:** 2026-05-03 (autonomous mode)
**Authority:** CTO Office; final go/no-go: CEO + CTO + SME Lead joint sign-off
**When triggered:** post-CC-01 (sub-budget tagged) + post-CC-02-A (counsel engaged) + SME Lead onboarded + first 100 Qs SME-validated

---

## §1 — Top-line readiness summary

Customer Zero "Day 1 — first candidate runs through QOrium" has **5 dependency tracks**. All 5 must show GREEN before go.

```
[Track A: Capital + Legal]   [Track B: Infra]    [Track C: People]   [Track D: Customer]   [Track E: Content]
       ↓                            ↓                    ↓                  ↓                    ↓
  CC-01 done                  B7 PG live           SME Lead          D1 done              160+ Qs SME-validated
  CC-02-A done                B10 PM2 live         hired             D2 5 JDs             IRT calibration ready
  Counsel signoff A6/A7/C8    Anti-leak engine     I/O Psych          D4 channel active     Anti-leak active
  Domain registered           IRT pipeline live    contractor                              90+ Quality Gate
  TM filings filed (CC-08)    Sandbox live         engaged                                  passed
```

---

## §2 — Track A: Capital + Legal readiness

| ID | Check | Status | Owner | Evidence required |
|---|---|---|---|---|
| A1 | Sub-budget "QORIUM" tagged with ₹50L | ⏳ | CEO (CC-01) | Finance confirmation + monthly burn report visible |
| A2 | IP counsel engagement live | ⏳ | CEO (CC-02-A) | Engagement letter + counsel name in `legal/CC-02-engagement-thread.md` |
| A3 | Counsel signoff on A6 MSA template | ⏳ | Counsel + CEO | Email confirmation; A6-Final.docx in /legal/ |
| A4 | Counsel signoff on A7 DPA template | ⏳ | Counsel + CEO | A7-Final.docx in /legal/ |
| A5 | Counsel signoff on C8 Offer Letter template | ⏳ | Counsel + CEO | C8-Final.docx in /legal/ |
| A6 | Domain qorium.online + qorium.in registered | ⏳ | CEO + CTO browser (BP-01) | DNS records visible in Hostinger panel |
| A7 | Trademark filings filed India + US (CC-08) | ⏳ | Counsel | Filing receipts; application numbers in `legal/CC-02-engagement-thread.md` |
| A8 | Talpro Internal Kickoff Doc M1 W1 distributed to first 2 hires | ⏳ | CTO Office | Pinned in Customer Zero feedback channel |

**Pass criterion:** all 8 checks ✅ before Track D D2 starts (collecting Talpro JDs).

---

## §3 — Track B: Infrastructure readiness

| ID | Check | Status | Owner | Evidence required |
|---|---|---|---|---|
| B1 | VPS topology (per B1 plan) | ✅ | CTO | B1 plan accepted; managed PG provider chosen |
| B2 | DNS records for qorium.online + subdomains | ⏳ | CEO + CTO browser | DNS lookup successful for all subdomains |
| B3 | Let's Encrypt SSL on all subdomains | ⏳ | CTO | SSL Labs A+ rating |
| B4 | GitHub org `qorium-co` + `qorium-platform` repo + branch protection on main | ⏳ | CEO + CTO browser (BP-02) | Branch protection visible on repo settings |
| B5 | CI/CD pipeline (GitHub Actions; B5 spec) | 🚫 (B4 prerequisite) | CTO | All-green build on first PR |
| B6 | gitleaks pre-commit + secret rotation calendar | 🚫 (B4 prerequisite) | CTO | Calendar entries scheduled in `infra/B6-Secret-Rotation-Calendar.md` |
| B7 | Postgres 16 provisioned + 0001 migration applied | 🚫 (B1 + CC-01 prerequisites) | CTO | All 0001 schema tables visible; pgvector + citext + pg_trgm extensions enabled |
| B8 | Redis 7 provisioned | 🚫 (CC-01 prerequisite) | CTO | Redis CLI connection successful |
| B9 | Cloudflare R2 bucket (per B9 plan) | ⏳ | CEO + CTO browser (BP-04) | R2 bucket name confirmed; IAM policy set |
| B10 | PM2 ecosystem.config.js (B10 spec) | 🚫 (B7 prerequisite) | CTO | All 5 PM2 processes online; `pm2 jlist` output |
| B11 | AI API keys (Anthropic + OpenAI + Gemini) | ⏳ | CEO + CTO browser (BP-03) | Keys in vault; budget alerts active |
| B12 | Serper.dev API key | ⏳ | CEO + CTO browser | Key in vault; budget alert at $300/mo |
| B13 | OpenTelemetry + Sentry + Grafana | 🚫 (B7 prerequisite) | CTO | Sentry receives events; Grafana dashboard live |
| B14 | Talpro Sentinel integration | 🚫 (B7 prerequisite) | CTO | Sentinel watchdog firing on test event |
| B15 | Postgres backup + PITR (15-min RPO) | 🚫 (B7 prerequisite) | CTO | First backup snapshot + restore test in staging |
| B16 | Anti-Leak Engine v0 deployed (Mac Mini) | 🚫 (Mac Mini Docker setup prerequisite) | CTO + Senior Eng | First daily crawl completed; logs visible |
| B17 | Judge0 Sandbox v0 deployed (Mac Mini) | 🚫 (Mac Mini Docker prerequisite) | CTO + Senior Eng | First sandbox execution successful for each of 12 languages |
| B18 | IRT Calibration Pipeline v0 wired (girth + cron) | 🚫 (B7 prerequisite) | CTO + I/O Psych contractor | First nightly batch ran without error |
| B19 | TestForge orchestrator v0 deployed | 🚫 (B16-B18 prerequisites) | Senior Eng + CTO | All 6 components reporting status |
| B20 | Watchdogs registered for all 5 PM2 processes | 🚫 (B10 prerequisite) | CTO | `talpro_watchdog_list` shows all qorium-* watchdogs active |

**Pass criterion:** B1, B7, B10, B16, B17, B18, B19 ✅ before D5 starts (questions can be served).

---

## §4 — Track C: People readiness

| ID | Check | Status | Owner | Evidence required |
|---|---|---|---|---|
| C1 | Senior Engineer #1 hired + onboarded | ⏳ | CEO (CC-11) | Joining date; offer letter signed |
| C2 | SME Content Lead hired + onboarded | ⏳ | CEO (CC-11) | Joining date; offer letter signed |
| C3 | I/O Psychologist contractor engaged | ⏳ | CTO + CEO (CC-12 future) | Contract signed per C5 SOW |
| C4 | First 5 SME contractors vetted (per C6 plan) | ⏳ | SME Lead | Contractor list in `people/C6-SME-Contractor-Sourcing-Plan.md` Appendix updated |
| C5 | Talpro Internal Kickoff Doc read by all 4 above | ⏳ | All hires | Async confirmation in Customer Zero channel |

**Pass criterion:** C1, C2, C3 (or contractor lookalike), C4 ≥3 SMEs ✅ before D5.

---

## §5 — Track D: Customer Zero (Talpro India) readiness

| ID | Check | Status | Owner | Evidence required |
|---|---|---|---|---|
| D1 | Talpro Delivery Head briefed on Customer Zero scope | ✅ (CC-03 closed via CTO-owned defaults) | CEO + CTO | Verbal YES on 3-month commitment |
| D2 | First 5 Talpro JDs collected | ⏳ | CTO + Talpro Delivery Head | JDs in `customer-zero/talpro-jds/` |
| D3 | Internal-namespace API key issued | 🚫 (B7 prerequisite) | CTO | Key delivered via 1Password vault link; CEO confirms receipt |
| D4 | Customer Zero feedback channel active (email + Telegram per D4 Plan) | ✅ | CTO + Delivery Head | First test message exchanged |
| D5 | First 100 candidates queued through QOrium pipeline | 🚫 (D3 + B17 prerequisites) | Talpro Delivery + CTO | n8n workflow live; first 10 candidates have valid invite links |
| D6 | Customer Zero Month-1 Dashboard XLSX populating | ⏳ | SME Lead | Daily_Ops sheet has 7+ days of entries |
| D7 | Defect SLA cycle tested (P0/P1/P2/P3) | ⏳ | SME Lead | First test defect logged + resolved |

**Pass criterion:** D1, D2, D4, D6 ✅ + D3 + D5 once B7 + B17 GREEN.

---

## §6 — Track E: Content readiness

| ID | Check | Status | Owner | Evidence required |
|---|---|---|---|---|
| E1 | 160+ questions SME-validated v0.6 (Wave 1 Java/React/SQL/DevOps/Salesforce) | ⏳ | SME Lead | SME Validation Tracker shows ≥80% Accepted across 5 Talpro Customer Zero roles |
| E2 | IRT calibration pipeline initialized | ⏳ | I/O Psych contractor | First 30+ items have AI prior assigned |
| E3 | Anti-leak engine first crawl completed for the 160 items | ⏳ | CTO + Senior Eng | All 160 items checked; 0 confirmed leaks (or rotated if any) |
| E4 | Bias DIF check first run (when N≥200) | ⏳ | CDO + I/O Psych | First DIF analysis report; 0 flagged items |
| E5 | AI Plagiarism Benchmark first run | ⏳ | Gatekeeper | Quarterly benchmark ≥93% (first run; baseline established) |
| E6 | Quality Gate scorecard ≥88/92 on first release | ⏳ | Gatekeeper | Full 92-pt scorecard saved at `governance/quality-gate-runs/M1-W1-release-1.md` |

**Pass criterion:** E1 + E3 + E5 + E6 all ✅ before D5 candidates run through.

---

## §7 — Go/No-Go decision tree

### GO criteria (ALL of these)

- ✅ Track A: A1, A2, A3-A5 (counsel signoff on at least A6 MSA), A6, A8 done
- ✅ Track B: B1, B7, B10, B16, B17, B18, B19, B20 done
- ✅ Track C: C1, C2, C4 ≥3 SMEs done
- ✅ Track D: D1, D2, D3, D4, D6 done
- ✅ Track E: E1, E3, E5, E6 done

### NO-GO triggers (ANY of these)

- ❌ Less than 100 questions SME-validated (E1 fails)
- ❌ Anti-leak engine not running for 7+ days before launch (E3 fails)
- ❌ Quality Gate scorecard <88/92 (E6 fails)
- ❌ AI Plagiarism Benchmark <93% (E5 fails per SO-22)
- ❌ Customer Zero feedback channel inactive (D4 fails)
- ❌ B7 Postgres not provisioned (D3 + D5 blocked)

### CONDITIONAL GO (with mitigation)

- ⚠️ Less than 5 SMEs vetted (C4 partial) → GO with CTO + SME Lead covering for missing SME capacity
- ⚠️ Counsel signoff on A6/A7/C8 partial (A3-A5) → GO if A6 MSA signed; A7/C8 can ship post-launch
- ⚠️ I/O Psych contractor not engaged (C3 fails) → GO with CTO + SME Lead manual calibration; defer formal IRT to M2

---

## §8 — Pre-launch dress rehearsal (T-7 days)

7 days before Customer Zero Day 1:

1. End-to-end test: SME Lead picks 1 question; CTO Office routes through QOrium pipeline; sandbox execution; grading; result back to recruiter dashboard
2. Defect injection: deliberately log a P0 defect; confirm 4-hour SLA tracking works; CTO Office responds; SME Lead validates fix
3. AI Plagiarism Benchmark dry-run on 50 sample submissions (45 human + 5 AI); detection rate ≥93% confirmed
4. Anti-Leak Engine dry-run on first 160 questions; all 160 flagged or accepted within 24 hours
5. Stand-up: SME Lead + Senior Eng + I/O Psych contractor + CTO joint review of dashboard; first Friday Eng J6 with full-team participation

---

## §9 — Pre-launch CTO Office sign-off

CTO Office signs off when ALL of the following are true:

- [ ] Track A all checks ✅ (or conditional GO with mitigation)
- [ ] Track B all checks ✅
- [ ] Track C C1+C2+C4 ≥3 SMEs ✅
- [ ] Track D D1+D2+D3+D4+D6 ✅
- [ ] Track E all checks ✅
- [ ] Pre-launch dress rehearsal completed
- [ ] CEO informed; CEO acknowledges Customer Zero Day 1 launch

CTO Office signs: ___ Date: ___

---

## §10 — Post-launch — first 24 hours

- Hour 0: First candidate routes through QOrium; CTO Office watches dashboards
- Hour 1: First-hour metrics reported to Customer Zero Telegram (questions delivered, candidates queued, errors observed)
- Hour 4: First defect SLA tested if any P0/P1 fired
- Hour 24: First 24-hour metrics report posted; CEO read; SME Lead provides quality observations

---

## §11 — Post-launch — first 7 days

- Day 1-3: 50 candidates target; daily 9 PM IST report
- Day 4-7: 100 candidates target (Customer Zero M1 W1 milestone); first Friday Eng J6 review

---

## §12 — Post-launch — first 30 days

- Day 30: Customer Zero Month-1 review meeting (CEO + CTO + SME Lead + Talpro Delivery Head); Customer Zero Month-1 Dashboard XLSX shared; defect log reviewed; calibration coverage assessed; Bali pricing signal validated

---

## §13 — References

- D4 Customer Zero Feedback Channel Plan — `customer-zero/D4-Customer-Zero-Feedback-Channel-Plan.md`
- TestForge QA Pipeline v1 — `governance/TestForge-QA-Pipeline-v1.md`
- 92-Point Quality Gate Scorecard — `governance/Quality-Gate-92pt-Scorecard.md`
- AI Plagiarism Benchmark Protocol v1 — `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`
- Bias Detection Methodology v1 — `governance/Bias-Detection-Methodology-v1.md`
- Anti-Leak Engine v0 — `infra/Anti-Leak-Engine-v0-Design.md`
- Judge0 Sandbox Integration v0 — `infra/Judge0-Sandbox-Integration-Spec-v0.md`
- IRT Calibration Pipeline v0 — `infra/IRT-Calibration-Pipeline-v0-Spec.md`
- Talpro Internal Kickoff Doc M1 W1 — `customer-zero/Talpro-Internal-Kickoff-Doc-M1-W1.md`
- Customer Zero Month-1 Dashboard — `customer-zero/Customer-Zero-Month-1-Dashboard.xlsx`

---

*End of Customer Zero Pre-Launch Checklist v1. Pass before Customer Zero Day 1.*

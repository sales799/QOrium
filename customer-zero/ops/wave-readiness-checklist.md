# Wave Readiness Checklist (single-page)

**Owner:** COM (CTO Office Y1) · **Used:** Per content wave (Wave 3 onwards; Waves 1+2 shipped pre-protocol)
**Authority:** Constitution SO-3 (Quality Gate), SO-21 (IRT), SO-22 (anti-leak); CDO `cdo/wave-cadence.md`; GATEKEEPER `gatekeeper/quality-gate-operationalization.md`

---

## When to use

Print or copy this single-page checklist at the START of every wave. Walk through pre-wave, during-wave, and post-wave checks in sequence. The wave doesn't ship to the GATEKEEPER gate until ALL pre-wave + during-wave items are checked.

This is the COM-side companion to `cdo/wave-cadence.md` (which has the deeper detail).

---

## Pre-wave (Week -1)

```
Wave NUMBER: ____   Target ship date: ____   COM lead: ____

[ ] Scope locked
    Role families covered: __________________
    Question count target: __________
    Difficulty distribution: 1=__ 2=__ 3=__ 4=__ 5=__
    Format mix: MCQ=__ Coding=__ SJT=__ SQL=__ ...

[ ] SME contractors confirmed
    Per role family, ≥1 SME committed for the wave window.
    Per SME, batch-acceptance email/Slack reply received.

[ ] Reference Panel sessions scheduled
    Number of sessions needed: __________
    Total respondent slots: __________
    First session date: __________
    Last session date: __________

[ ] Anti-leak fingerprint baseline captured
    Pre-wave scan ran against the role-graph leaves this wave will fill.
    Baseline data stored at `cdo/anti-leak-events/wave-N-baseline-<date>.json`.

[ ] Quality Gate criteria reviewed
    Phase Gate milestone (M0/M3/M9/M12/M21) — any phase-specific criteria
    apply this wave?  yes / no.  If yes: ____________________

[ ] Bias detection sample plan
    Per `governance/Bias-Detection-Methodology-v1.md`:
    sample 10% for bias review at SME stage; 10% post-IRT for re-check.
```

---

## During-wave (per question, 7-stage pipeline)

For EACH question in the wave, all 7 stages run + are signed off. The validation tracker (`customer-zero/SME-Validation-Tracker-Wave-N.xlsx`) is the canonical record.

```
[ ] Stage 1 — Spec  (COM)
    role-graph leaf identified · format chosen · target band set

[ ] Stage 2 — AI Draft  (COM with Anthropic API)
    N draft variants generated (default N=5)

[ ] Stage 3 — Self-Critique  (COM with AI)
    Drafts narrowed to 1-2 candidates via AI critique pass

[ ] Stage 4 — SME Review  (SME contractor, paid)
    SME signs off in tracker: initials + timestamp + verdict + edit notes (if any)

[ ] Stage 5 — Calibrate  (CDO + Reference Panel)
    IRT metadata captured: difficulty_b, discrimination_a, panel_response_count,
    correlation_to_predicted ≥0.85 (per `cdo/irt-calibration-protocol.md`)

[ ] Stage 6 — Release  (CTO Office, gated by GATEKEEPER)
    Question pushed to live library; appears in API responses

[ ] Stage 7 — Post-Deploy  (CDO ongoing)
    Anti-leak fingerprint registered; daily scan window begins
```

---

## Post-wave (Week +1)

```
[ ] Wave QA complete
    10% sample randomly drawn; manually verified IRT metadata + anti-leak
    fingerprint exist + correct.

[ ] Wave summary report
    Filed to `customer-zero/Wave-N-Retro-<date>.md` with:
      - Count shipped
      - Count rejected at each stage (Stage 4 SME = X rejected; Stage 5
        calibrate = Y rejected for low correlation)
      - Time-to-ship per question (median + p95)
      - Calibration correlation distribution
      - SME validation pass rate
      - Anti-leak baseline freshness
      - Bias sample findings

[ ] GATEKEEPER quality-gate scoring
    Per `gatekeeper/quality-gate-operationalization.md`:
      - 6 auto-fail criteria all PASS
      - 92-point scorecard run; total ≥70/92 = PASS
    Result filed to `gatekeeper/wave-gates/<date>-wave-N.md`.

[ ] Lessons logged to monthly business review
    What slowed the wave down; what to fix in the next wave's pre-wave
    plan.  Filed in next `bali/templates/monthly-business-review.md`
    instance §6 extension.

[ ] SME contractor payments processed
    Per `customer-zero/ops/sme-onboarding-protocol.md`:
    within 5 business days of validation completion.

[ ] Customer Zero (Talpro India) feedback loop closed
    Per SO-1 + `customer-zero/D4-Customer-Zero-Feedback-Charter.md`:
    Talpro India hiring drives consume the new questions in their next
    cycle; feedback flows back via the charter mechanism.
```

---

## Wave-specific overrides

Some waves have unique constraints layered on this base checklist. Document overrides in the wave's plan doc (e.g., `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`):

- M3 milestone wave → Phase Gate criterion: 5,000 questions cumulative + India-stack priority + ATS coverage list
- M9 milestone wave → Phase Gate criterion: psychometric validation milestone (per Constitutional Amendment v2.1 — Article IX-M9)
- Wave introducing new role-graph leaves → CDO + COM joint extension; not just-add-questions

---

## Exit criteria

The wave is "done" when:

- ✅ All pre-wave items checked
- ✅ All during-wave 7 stages signed off per question (in the tracker spreadsheet)
- ✅ All post-wave items checked
- ✅ GATEKEEPER scorecard PASS filed
- ✅ Wave-N retro doc filed in `customer-zero/`

If GATEKEEPER returns FAIL, the wave doesn't ship until issues are addressed (per `gatekeeper/quality-gate-operationalization.md` + SO-3 Quality Gate Discipline). The wave's status reverts to "during-wave" until the failing stage clears.

---

*Cross-references: Constitution SO-1, SO-3, SO-21, SO-22. Companion docs: `cdo/wave-cadence.md` (deeper procedure), `gatekeeper/quality-gate-operationalization.md` (gate-side), `customer-zero/Wave-N-*.md` (wave-specific plans), `governance/Bias-Detection-Methodology-v1.md` (Stage 4 sub-protocol).*

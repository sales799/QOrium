# Discovery Call Script — Bosch GCC, 30 Minutes

The discovery call is **asking, not telling**. CEO listens 70%,
talks 30%. The 30% talking is positioning + clarifying questions,
NOT pitching.

---

## Pre-call setup (5 min before call)

- [ ] Materials reviewed (1-pager + USP + customer-zero quote)
- [ ] Discovery worksheet printed (one per call; record answers
      live)
- [ ] Calendly invite confirms attendees + their titles
- [ ] LinkedIn profiles re-reviewed (recent posts, recent role
      changes, mutual connections)
- [ ] Pre-recorded 90-sec product loom queued (in case asked)
- [ ] Backup screenshot of audit-export end-to-end ready
- [ ] CTO Office on standby (not on call) for any technical
      escalation needed

---

## Call structure (30 minutes)

| Time | Module | Goal |
|---|---|---|
| 0-3 min | Introductions + agenda alignment | rapport |
| 3-15 min | Discovery questions (12 minutes) | learn |
| 15-22 min | Position QOrium (positioning, not pitch) | frame |
| 22-26 min | Customer-Zero anchor + ROI vector | proof |
| 26-30 min | Next steps + scheduling | commit |

---

## Module 1 — Introductions (3 min)

> "Hi [Name], thanks for the time. Quick context: I'm Bhaskar, founder
> of QOrium. We build IRT-calibrated, anti-leak-rotated, watermark-
> per-candidate technical assessments. Before we dive in — what does
> success look like for this 30 minutes from your side?"

Listen carefully to the answer. The customer's framing tells you
what they care about. Note their stated success on the worksheet.

> "Perfect. Here's what I'd love to do: spend the first 12 minutes
> understanding how Bosch GCC handles tech-screen today and what's
> on your roadmap for it. Then I'll share where QOrium fits — only
> the parts that match what you've shared. Then we can talk next
> steps. Sound good?"

(Get verbal agreement to the structure. Establishes mutual respect.)

---

## Module 2 — Discovery questions (12 min)

Use the questions below in conversational flow. Don't run them as a
script; pick up on threads. Aim for 6-8 questions covered, not all
12.

### Q1 — Volume + scale
> "How many engineers does Bosch GCC screen for technical roles in
> a typical year across India?"

**Listen for:** specific number ≥ 5K = strong fit; 1K-5K = mid; <
1K = sub-scale.

### Q2 — Sub-skill mix
> "Which sub-skills dominate? Embedded automotive obviously, but
> what's the mix with embedded software, AdaS, AUTOSAR, India-
> standard tech (Java/Python/AWS), data + ML?"

**Listen for:** Embedded Automotive heavy = Wave-2 100/100 hits
strong; Java/AWS heavy = Wave-1 100/100; ML heavy = Wave-1 AIPE.

### Q3 — Current tooling
> "What does the tech-screen stack look like today? HackerRank? Mettl?
> In-house? A mix?"

**Listen for:** vendor consolidation appetite + dissatisfaction
signals.

### Q4 — Pain points (the most important question)
> "On a scale where 0 is 'this is solved' and 10 is 'this keeps me
> up at night,' how would you rate three things: (a) question
> leakage / cheating signals; (b) audit-trail coverage for SOC 2 /
> ISO 27001 / Bosch-internal audit; (c) bias detection + fairness
> reporting on the assessment data?"

**Listen for:** any score ≥ 7 → that's our angle. Multiple
scores ≥ 7 → strong fit.

### Q5 — Recent incidents
> "Has Bosch had a leakage incident or a candidate cheating
> investigation in the last 18 months that taxed the system? I
> won't ask for specifics — just whether it happened."

**Listen for:** yes = strong fit; "we manage it" = mid; no =
either solved or not measured (probe).

### Q6 — Compliance posture
> "How does Bosch GCC handle the German parent's audit demands on
> the assessment surface? Is there a SOC 2 in flight, or DPDPA
> readiness, or both?"

**Listen for:** active audit cycle = strong fit; "we'll get to it"
= mid; "global parent handles it" = ICP-2 escalation needed.

### Q7 — Roadmap signal
> "If I asked your CTO of GCC to name two pieces of the assessment
> surface that need to be different a year from now, what do you
> think they'd say?"

**Listen for:** specific friction. Generic "we'd modernise" =
weak signal; specific "we'd like a per-tenant audit log" = direct hit.

### Q8 — Decision making
> "If we get to the point where Bosch GCC wants to pilot QOrium,
> what does that decision flow look like? Single-step, or does
> it route to procurement + global parent?"

**Listen for:** 1-2 step = strong; committee = manageable;
>3 step + global = long cycle.

### Q9 — Timeline
> "If everything we've discussed lined up, when's a realistic
> earliest start for a 30-day pilot?"

**Listen for:** "we could start next month" = high intent; "next
quarter" = mid; "no concrete timeline" = nurture.

### Q10 — Budget signal (optional, only if rapport is high)
> "Is the assessment-tooling budget a flat annual line item or
> something that grows with hiring volume?"

**Listen for:** flat = predictable; volume-tied = good fit for
range pricing.

### Q11 — Existing relationships
> "Anyone Bosch GCC currently works with on the calibration /
> psychometric side specifically? Pearson VUE? AspiringMinds? An
> internal team?"

**Listen for:** vendor consolidation candidate; or internal team
that becomes blocker.

### Q12 — Closing discovery
> "Last question — is there anything you wish I'd asked but didn't?"

**Listen for:** the most-revealing answer of the call. Often a
hidden objection or specific feature ask.

---

## Module 3 — Position QOrium (7 min)

Based on what you heard in discovery, weave QOrium into 2-3 specific
threads — only the threads that matched their pain.

Example flow:

> "Three things from what you shared:
>
> First, you mentioned [their score on leakage was 8/10]. We have a
> watermark approach — visible footer + homoglyph stego, HMAC-bound
> per (tenant + render) — that traces exfiltration to source
> candidate. Talpro's been running it on first 100 candidates.
>
> Second, you mentioned [their compliance audit pressure]. Our Audit
> Log API is hash-chained and exportable as RFC-4180 CSV in 60
> seconds. We have SOC 2 control mapping (TSC CC1.1-CC9.2) ready
> for Bosch's audit cycle.
>
> Third, you mentioned [Embedded Automotive volume]. We have 100/100
> on Embedded Automotive — AUTOSAR Classic + Adaptive, ISO 26262
> ASIL, ASPICE, CAN-FD, ECU bootloader, ARA APIs, V2X cybersecurity.
> Library is calibrated; SME validation in flight.
>
> What I'm NOT going to do is pitch all three SKUs. We have ReadyBank
> API ($5K-$25K range), JD-Forge ($49-$499 per JD or pack), and
> Stack-Vault (₹40L-₹1Cr+ enterprise tier — that's the one for Bosch
> GCC scale). Today's call is about understanding fit, not commit."

(Pause. Let them respond. Their response shapes the rest of the
conversation.)

---

## Module 4 — Customer-Zero anchor + ROI vector (4 min)

Quick anchor — Talpro Customer-Zero is the strongest social proof
for an Indian-staffing-adjacent prospect.

> "Customer-Zero is Talpro India — they've put their first 100
> candidates through ReadyBank. The Audit Log API trimmed their
> incident-response time from 4 hours to 8 minutes. Stack-Vault's
> tenant isolation means same Q47 lives independently across each
> Talpro client.
>
> If Bosch GCC ran the same engagement at your scale (10K+ engineers
> screened), the ROI vector is in the ₹3-5 crore annual range —
> mostly on false-pass reduction + compliance audit acceleration.
> I'll send you the detailed model post-call."

(Don't show the full ROI calc on the discovery call — that's
post-call. Just give the headline number with conservative framing.)

---

## Module 5 — Next steps (4 min)

> "Here's what I'd love to do as a next step:
>
> 1. I send you a 1-page Bosch-specific ROI projection within 24
>    hours — using rough volume + cost numbers we just discussed
> 2. I also send a SOC 2 control mapping doc, the customer-zero
>    one-pager, and a pre-recorded 5-min product walkthrough
> 3. We schedule a 60-min technical follow-up with my CTO + your
>    technical decision-maker — they go deep on integrations,
>    audit, security
> 4. After that, if there's fit, we propose a 30-day pilot —
>    free, with co-set success criteria
>
> Does that flow work for you? And who would join the technical
> follow-up?"

(Get specific names + dates. The "next steps" agreement is the
call's outcome.)

---

## Post-call discipline (within 24 hours)

- [ ] Send follow-up email (template in `follow-up-templates.md`)
- [ ] Send 1-page Bosch-specific ROI projection (using
      `roi-projection-bosch.md`)
- [ ] Send SOC 2 control mapping doc (`governance/soc2/`)
- [ ] Send Customer-Zero one-pager (`customer-zero/` + Talpro-
      Delivery-Head reference, with their permission)
- [ ] Update CRM: opportunity stage + scorecard + next-step + owner
- [ ] Schedule technical follow-up with CTO Office
- [ ] Brief CTO Office on Bosch-specific technical depth needed
      (Embedded Automotive + AUTOSAR + ISO 26262 emphasis)

---

## Stop conditions

Halt + escalate to CTO Office immediately if:

- Bosch asks for **on-prem deployment** (we're SaaS-only Y1; need
  CTO conversation on data-residency multi-region path)
- Bosch asks for **per-candidate raw answer storage > 90 days**
  (anti-leak + privacy concerns; CTO Office consultation)
- Bosch asks for **algorithm transparency / open-sourcing** of
  IRT calibration code (Constitutional Amendment territory)
- Bosch asks for **co-engineering / co-development** model (deep
  partnership; CEO + CTO joint decision)

---

## Discovery worksheet template

Print and bring to the call. One row per discovery question.

```
Q1 (volume):                                       Score: ___ / 10
Q2 (sub-skill mix):
Q3 (current tooling):
Q4 (pain a/b/c scores):                            ___/___/___ / 10
Q5 (recent incidents):
Q6 (compliance posture):
Q7 (roadmap signal):
Q8 (decision flow):
Q9 (timeline):
Q10 (budget signal):
Q11 (existing relationships):
Q12 (anything I missed):

Overall qualification scorecard (5 dims, 1-5 each):
- Pain Awareness:        ___ / 5
- Champion Quality:      ___ / 5
- Technical Fit:         ___ / 5
- Budget Signal:         ___ / 5
- Decision Speed:        ___ / 5
- TOTAL:                 ___ / 25

Action: ADVANCE / NURTURE / DECLINE

Next steps:
1.
2.
3.

Technical follow-up scheduled for:
```

---

_Script is a draft. CEO refines per call experience; first call
becomes the calibration baseline._

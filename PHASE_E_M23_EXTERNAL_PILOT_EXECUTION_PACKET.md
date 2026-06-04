# QOrium Phase E M23 - External Pilot Execution Packet

Status: CTO execution packet, 2026-06-03
Owner: CTO until technical readiness; founder/counterparty only for external acceptance, legal signature, and paid contract execution.

## 1. M23 Exit Criteria

Phase E is complete only when all three are true:

1. Three non-Talpro pilot logos are live on QOrium.
2. One pilot converts to a signed paid contract.
3. SLA addendum is attached to the paid order form.

Current CTO status:

| Exit item | Status | Evidence | Blocker |
| --- | --- | --- | --- |
| 3 pilot logos live | Not complete | No external logo acceptance recorded in local queue/task plan. | External companies must accept pilot; candidate assessment loop must pass production readiness first. |
| First paid contract signed | Not complete | No signed paid contract recorded in local queue/task plan. | Authorized customer signature and business/legal approval. |
| SLA addendum live | Draft-ready | This packet includes the M23 SLA/order addendum scaffold. | Counsel review before third-party signature. |

## 2. Readiness Gate Before Any External Login

External pilot issuance is blocked until the candidate assessment path is proven:

- Create assessment.
- Generate signed candidate URL.
- Candidate opens tokenized route.
- Candidate completes timed assessment.
- API stores responses.
- Grader produces score plus reasoning trace.
- Recruiter/admin can review result.
- Candidate payload contains no answer keys, explanations, rubrics, IRT values, or test expectations.
- Production audit/Rakshak returns GO before non-Talpro usage.

Local hardening completed in this session:

- Signed candidate-token API response is sanitized to remove grading material.
- Smoke test now fails if candidate payload leaks `correctAnswer`, `explanation`, `irt`, `rubric`, `tags`, or `testExpectation`.

Production hard blocker:

- The PRAROOP spec still says the live production candidate-domain loop must complete BR-1 through BR-8 before external pilots. Do not issue external pilot credentials until that path has GO evidence.

## 3. Pilot Offer

Use one pilot offer for all three logos:

- 30-day external pilot.
- Growth pilot limit: up to 500 assessments.
- White-glove onboarding by CTO lane.
- One real role/JD selected by the customer.
- Success metric fixed before launch: screen at least 20 real candidates or reduce recruiter shortlisting time with auditable scores.
- Conversion target: Growth subscription at INR 4,999/month or a higher negotiated SKU if buyer wants enterprise scope.
- Honest claim language: "model-estimated and calibrating with use" for IRT until empirical calibration thresholds are met.

Do not use:

- "Psychometrically proven" until calibration_n evidence exists.
- "SME verified" unless the actual pack has SME validation evidence.
- Named reference customer claims without explicit permission.

## 4. First Three Logo Slate

These are execution targets from the existing QOrium Top 100 prospect list. They are targets, not confirmed relationships.

| Priority | Logo | Segment | Why this first | First ask |
| --- | --- | --- | --- | --- |
| P1 | Quess Corp | India staffing / high-volume hiring | Staffing firm fit, likely repeated technical screens, clear ROI from faster shortlisting. | Free 30-day pilot on one live tech req. |
| P2 | Allegis Group India | India staffing / recruitment services | Recruiting workflow maturity and volume; good non-Talpro logo if they accept. | Pilot one developer screen and compare against current process. |
| P3 | HirePro | Hiring services / assessment adjacent | Buyer understands assessments; can become either pilot customer or partner. | Pilot ReadyBank/JD-Forge pack for one live hiring lane. |
| Backup | Adecco India | Staffing | Similar high-volume pain, recognizable logo. | Same as P1. |
| Backup | ManpowerGroup India | Staffing | High-volume recruitment, strong logo. | Same as P1. |

Warmest-first substitution rule:

- If Bhaskar has a warmer existing Talpro relationship at any staffing client/partner, replace P1 with that logo. Warm relationship beats list rank.

## 5. Pilot Tracker

| Logo | Stage | Owner | Next action | Evidence required |
| --- | --- | --- | --- | --- |
| Quess Corp | Draft-ready | Founder/AE send authority | Send pilot email after technical GO. | Reply accepting pilot or meeting. |
| Allegis Group India | Draft-ready | Founder/AE send authority | Send pilot email after technical GO. | Reply accepting pilot or meeting. |
| HirePro | Draft-ready | Founder/AE send authority | Send pilot email after technical GO. | Reply accepting pilot or meeting. |

Stages:

Draft-ready -> Sent -> Replied -> Pilot accepted -> Tenant created -> Assessment links issued -> 20+ candidate attempts -> Review call -> Paid contract sent -> Signed -> SLA attached -> Live paid.

## 6. Outreach Email - Staffing Pilot

Subject options:

1. `30-day QOrium pilot for your live tech hiring req`
2. `{company}: faster technical shortlisting without changing your workflow`
3. `Can we pilot QOrium on one real developer requirement?`

Body:

```
Hi {first_name},

Bhaskar Anand from Talpro is opening a small external pilot group for QOrium, our technical assessment platform for staffing and high-volume hiring teams.

The pilot is intentionally narrow: pick one live developer requirement, we create the assessment pack, your team screens real candidates, and we compare whether QOrium shortens the path from resume pile to shortlist.

What you get in the 30-day pilot:
- up to 500 assessments
- one white-glove onboarding session
- signed candidate assessment links
- recruiter-facing score output with reasoning trace
- honest calibration labels while the model learns from real responses

No procurement lift for the pilot. If it works, the conversion path is a simple Growth plan at INR 4,999/month or a larger plan if your volume needs it.

Can we run this on one live role this week?

Bhaskar Anand
Talpro / QOrium
```

Compliance note:

- Replace `{first_name}` and `{company}` before any send.
- Do not send until the assessment path has production GO.
- Do not attach legal terms in the first email. Keep first touch about pilot acceptance.

## 7. Warm WhatsApp / LinkedIn Message

```
Hi {first_name}, Bhaskar here from Talpro.

I am opening 3 external pilot slots for QOrium, our technical assessment platform. The pilot is simple: one live developer requirement, up to 500 candidate screens, and a white-glove setup from our side.

If it helps your recruiters shortlist faster, we convert to a small paid Growth plan. If not, no pressure.

Can I send you the 1-page pilot note?
```

## 8. Pilot Discovery Agenda

Use this only after a prospect replies.

1. Confirm one live role/JD.
2. Confirm candidate volume for the next 30 days.
3. Confirm what "success" means:
   - screen 20 real candidates, or
   - reduce time-to-shortlist, or
   - improve recruiter confidence with scored evidence.
4. Confirm assessment format:
   - MCQ only for first pilot if speed matters.
   - Mixed MCQ/short/code only after candidate runner GO.
5. Confirm pilot owner on customer side.
6. Confirm data handling:
   - candidate email/name only for first pilot unless customer signs DPA.
7. Confirm conversion plan:
   - review call after first 20 candidate attempts or end of pilot, whichever comes first.

## 9. CTO Onboarding Checklist Per Accepted Pilot

Run this after the prospect says yes and production candidate path is GO:

1. Create pilot record in tracker.
2. Create tenant with slug, legal/display name, admin email, pilot plan, and expiry.
3. Create one active assessment from the selected role/JD.
4. Generate signed candidate links or recruiter invite flow.
5. Send onboarding email with:
   - recruiter login/invite link,
   - candidate link process,
   - pilot success metric,
   - support channel,
   - data handling summary.
6. Smoke-test as a candidate.
7. Smoke-test recruiter/admin result view.
8. Record evidence:
   - tenant slug,
   - assessment id,
   - invite link prefix only, never full secret token in public docs,
   - health check,
   - attempt/result proof.
9. Update task plan and queue.

## 10. Onboarding Email After Pilot Acceptance

Subject:

`QOrium pilot setup for {company}: role, links, and success metric`

Body:

```
Hi {first_name},

Great, we have opened the QOrium pilot workspace for {company}.

Pilot scope:
- Role/JD: {role_name}
- Candidate limit: up to 500 assessments
- Pilot window: 30 days from first candidate invite
- Success metric: {success_metric}

Your next steps:
1. Send us the live JD or role description.
2. Confirm the recruiter/admin email that should receive the pilot access.
3. Start with 5 candidates, then expand after the first result review.

Our side:
- We will prepare the assessment pack.
- We will provide signed candidate links or recruiter invite flow.
- We will review the first results with your team.

Important honesty note:
QOrium scoring is labelled as model-estimated while the pilot gathers real response data. We will show reasoning traces and response evidence, but we will not claim empirical calibration until enough real attempts exist.

Regards,
Bhaskar Anand
Talpro / QOrium
```

## 11. M23 SLA Addendum - Pilot To Paid Draft

Status: CTO working draft. Counsel review required before signature.

Attach this as an addendum to the first paid Growth/Scale order form.

### Service Level

| Item | Growth paid | Scale/Enterprise paid |
| --- | --- | --- |
| Uptime target | Best effort, target 99.5% monthly | 99.9% monthly |
| P1 response | 1 business day | 1 hour |
| P2 response | 2 business days | 4 business hours |
| Support channel | Email | Email plus private channel |
| Candidate data export | On request | On request plus audit-log export |
| Data deletion | On request, within 30 days | On request, within 15 days |
| Scoring label | Model-estimated until empirical calibration threshold | Same |

### Exclusions

SLA excludes:

- customer network/device issues,
- third-party email delivery failures outside QOrium control,
- customer-supplied data/JD errors,
- planned maintenance with advance notice,
- force majeure,
- unpaid pilot usage.

### Service Credits

For paid Scale/Enterprise only:

- 99.0% to 99.9% uptime: 5% monthly service credit.
- Below 99.0% uptime: 10% monthly service credit.
- Credits apply only against future invoices and cannot exceed the monthly fee.

### Data And Compliance

- QOrium processes only the candidate data needed for assessment delivery.
- Candidate answer keys, rubrics, and test expectations must never be exposed in candidate-facing payloads.
- Candidate data is deleted or anonymized according to the order form and DPA.
- DPA is required if the customer sends personal data beyond candidate name/email and assessment responses.

## 12. Paid Order Form Skeleton

```
QOrium Growth Order Form

Customer legal name:
Customer billing address:
Customer authorized signer:
QOrium authorized signer:
Effective date:

Plan: Growth
Pilot conversion: yes/no
Monthly fee: INR 4,999 plus applicable taxes
Assessment allowance: 500 assessments/month
Support: email
SLA: attached M23 SLA Addendum
Data terms: DPA not required unless customer sends additional personal data beyond assessment delivery
Initial term: monthly
Renewal: monthly until cancelled
Payment terms: due on invoice / payment link

Special terms:
- Scoring remains labelled model-estimated until empirical calibration thresholds are met.
- QOrium will not name Customer as a public reference without separate written approval.

Signatures:
Customer:
QOrium:
```

## 13. What Is Autonomous vs Human-Only

Autonomous CTO lane:

- Build/fix candidate payload safety.
- Prepare email drafts and legal packet.
- Create tenant/assessment after a yes, if tool access and production GO exist.
- Verify health, links, candidate attempt, result, and audit trail.
- Update queue/task plan with evidence.

Human/counterparty required:

- Prospect must agree to pilot.
- Customer must sign paid contract.
- Counsel must review signed legal/SLA language before third-party execution.
- Payment authorization must be done by authorized human/business channel.

## 14. Immediate Next CTO Action

Do not wait for new GTM planning. The next technical branch is the assessment delivery readiness gate:

1. Merge/apply BR-1 assessment delivery migration.
2. Complete BR-2/BR-3 invite, attempt, answer, submit, grading APIs.
3. Complete BR-6/BR-7 candidate landing/test runner.
4. Run candidate payload leak tests.
5. Run production smoke.
6. Run Prahari/Rakshak GO.
7. Then issue external pilot invites.

# Intake Form Schema — Reference Panel Application

**Form length:** 7 fields hard cap. Total fill time target: 3-4 min.
**Backend:** writes to a new `app.panel_applications` table (migration
`0016_panel_applications.sql` in next engineering sprint); reviewed
by CDO Office (Y1 wear) before issuing a panel-token.

The form is **screening + intake**, not the assessment itself. It
filters in/out for cohort balance, eligibility, and basic
qualification.

---

## Fields (in order)

### 1. Email (required)

**Type:** text · email validation
**Label:** "Email address"
**Helper:** "We send the panel link + payment confirmations here."
**Validation:** RFC-5322 compliant
**Privacy:** primary identifier; retained per charter

### 2. Country / state of residence (required)

**Type:** dropdown
**Label:** "Where do you live?"
**Options:** "India — [state list]" · "Outside India" · "Prefer not to say"
**Helper:** "Cohort balance helps us calibrate fairly across regions."

### 3. Primary technical skill (required)

**Type:** dropdown · single select
**Label:** "What's your strongest technical skill area?"
**Options:** Java · Python · React · SQL/Data · DevOps/SRE · Salesforce · AWS · AI Product Engineering · SAP-ABAP · Oracle HCM · Salesforce CPQ · Finacle/Flexcube · Embedded Automotive · Other (please describe in next field)
**Helper:** "Pick the one you'd be most comfortable being assessed on."

### 4. Years of experience (required)

**Type:** dropdown
**Label:** "Total years of professional experience"
**Options:** "0-1 (recent grad / pre-experience)" · "1-3" · "3-7" · "7-15" · "15+"
**Helper:** "We match cohorts by experience band; all bands are needed."

### 5. Why are you joining? (optional)

**Type:** textarea · 200 character soft cap
**Label:** "Why are you joining the Reference Panel?"
**Helper:** "1-2 sentences. Optional but helps us understand fit."

### 6. Conflict-of-interest disclosure (required)

**Type:** checkbox group · multi-select; all that apply
**Label:** "Please tell us if any of these apply to you"
**Options:**
- "I currently work at an HR-tech assessment company (e.g., HackerRank,
  Mettl, AspiringMinds/SHL, Codility, Wheebox)"
- "I am currently a candidate on QOrium's platform via an employer"
- "I am currently a recruiter using QOrium's platform"
- "I am a minor (under 18)"
- "None of the above"
**Validation:** if any of the first 4 are checked, the form auto-
declines with a polite message. Only "None of the above" allows
submission.

### 7. Consent (required)

**Type:** checkbox group · all required
**Label:** "Before you apply, please confirm:"
**Options:**
- "I have read and accept the Reference Panel Charter and Privacy
  Notice [link]."
- "I am 18 or older."
- "I understand my responses will be used to calibrate IRT
  parameters and may be included in academic publications, with
  no PII linked."
- "I understand I can withdraw at any time and my future responses
  will be deleted (past completed sessions are retained per Charter
  §[anonymisation timeline])."

**Validation:** all 4 must be checked.

---

## Submission flow

After submit:

1. **Server-side validation:** schema check; eligibility check (Q6 + age)
2. **Auto-decline path:** if Q6 conflict-flag → polite decline email;
   no panel-token issued; record stored in `panel_applications` with
   status='auto_declined'
3. **Auto-approve path:** if no conflict + cohort needs filling →
   record stored with status='approved'; panel-token issued via
   existing `/v1/admin/panel-tokens` flow; confirmation email sent
   with personal link to assessment
4. **Manual-review path:** if cohort full OR ambiguous → record
   stored with status='pending_review'; CDO Office Y1 wear reviews
   within 5 business days; decision email sent

## Confirmation email (auto-sent on approval)

> Subject: Welcome to QOrium's Reference Panel — your assessment link
>
> Hi [first name from email; null-safe fallback to "there"],
>
> Thanks for joining QOrium's Reference Panel. Your personal panel
> link is below. The assessment takes about 90 minutes; you can pause
> and resume within 7 days.
>
> Take the assessment → [personal panel-token URL]
>
> Once you complete it (and your attention-check items pass), we'll
> transfer ₹2,000 to the bank account or UPI ID you provide on
> completion. We aim for ≤7 business days.
>
> Questions: panel@qorium.online
>
> – Bhaskar Anand
> CEO, QOrium Technologies

## Auto-decline email (auto-sent on conflict)

> Subject: About your QOrium Reference Panel application
>
> Hi there,
>
> Thanks for applying. Based on your responses, we're unable to
> include you in the Panel at this time — the most common reason
> is a current employment or candidacy relationship that would
> create a conflict of interest in our calibration data.
>
> If your status changes, please reach out at panel@qorium.online
> and we'll revisit.
>
> – QOrium Reference Panel team

---

## Anti-spam

- ReCAPTCHA v3 (silent) on submission — but with score-based
  acceptance, not hard gating (false positives are expensive)
- Rate-limit: 3 submissions per IP per 24h
- Email-domain blacklist: throwaway providers (mailinator, tempmail,
  etc.)
- Honeypot field: hidden from real users; bots fill it; auto-declined

## What we explicitly DON'T collect

- Full legal name (only what they share via email)
- Phone number (UPI/bank handle collected only at completion, not at
  intake)
- Resume / CV
- LinkedIn URL (we ask only at the apply stage if applicant wants
  to optionally include — never required)
- Caste / religion / political affiliation (illegal + irrelevant)
- Photograph
- Government ID at intake (KYC happens only at payout stage,
  minimum-necessary)

## Retention + deletion

Per the Reference Panel Charter (Tier-A2 D2 deliverable):

- Applicant data (intake form): retained 12 months from submission;
  deleted on request via `panel@qorium.online`
- Approved respondent data (assessment responses): retained 7 years
  for IRT historical comparison; PII tokenised after 90 days post-
  payment; raw email + bank handle hard-deleted at 90-day mark
- DPDPA + GDPR compliance: data minimisation principle applied
  throughout

---

## Database schema (preview)

Migration `0016_panel_applications.sql` (engineering sprint follow-up):

```sql
CREATE TABLE app.panel_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  email_hash VARCHAR(64) NOT NULL,
  country_state TEXT,
  primary_skill TEXT,
  experience_band TEXT,
  reason TEXT,
  conflict_flags JSONB,
  consent JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved','pending_review','auto_declined','manual_declined','withdrawn')),
  reviewed_by UUID REFERENCES app.recruiters(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_note TEXT,
  panel_token_id UUID REFERENCES app.panel_tokens(id),
  ip_anonymised TEXT,
  user_agent_anonymised TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ
);

CREATE INDEX panel_applications_status_applied_at_idx
  ON app.panel_applications (status, applied_at DESC);
CREATE INDEX panel_applications_skill_band_idx
  ON app.panel_applications (primary_skill, experience_band);
```

---

_Spec is a draft. Migration ships in a follow-up engineering sprint
after CEO approval. Form goes live post-cred-drop._

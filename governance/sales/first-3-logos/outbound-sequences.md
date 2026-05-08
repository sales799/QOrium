# Outbound Sequences — First 3 Logos

3 sequences (one per ICP). Each is a 5-touch sequence over ~28 days.
All channels and copy gated on CEO approval.

---

## Universal sequence shape

| Day | Touch | Channel | Goal |
|---|---|---|---|
| 0 | T1 — first contact | LinkedIn DM + email | open the loop |
| 4 | T2 — value-add | email | prove we know their pain |
| 11 | T3 — invite to demo | email | book the call |
| 18 | T4 — soft re-engage | LinkedIn comment + email | last touch |
| 28 | T5 — close-the-loop | email | end gracefully |

**No more than 5 touches.** After T5, the contact moves to a 6-month
nurture cadence (1 touch / 6 weeks). Pestering kills senior execs.

---

## Sequence A — ICP-1 (Indian Staffing & RPO)

### Day 0 — T1 LinkedIn DM (after connection accept)

> Hi [First Name] — Bhaskar from QOrium. We just shipped Stack-
> Vault with double watermark + tenant-isolated question libraries
> for staffing firms. Talpro is our Customer-Zero — they've used
> it on their first 100 candidates. Worth 20 minutes to see if
> it'd help [Their Firm]?

**Length:** 60 words. LinkedIn DM cap.

**Personalisation:** specific reference to a recent post they made
about hiring/quality/leakage; or a recent funding/expansion
announcement.

### Day 0 — T1 Email (parallel)

> **Subject:** [Their Firm]'s tech screen — IRT-calibrated +
> anti-leak protection?
>
> Hi [First Name],
>
> Saw [specific recent thing they posted / hired / launched].
> Quick question: how is [Their Firm] handling tech-question
> leakage on the candidate side? We're hearing 30-50% leakage
> windows in 30 days from our peers.
>
> QOrium ships **IRT-calibrated, anti-leak-rotated, watermark-
> per-candidate** technical assessments. We are Talpro's Customer-
> Zero (Bhaskar's prior co); our first 100 candidates ran through
> it last quarter.
>
> Here are 3 specific things we'd love to share:
>
> 1. The double-watermark technique: visible footer + homoglyph
>    stego, HMAC-bound per (tenant + render) — tracks question
>    exfiltration to source candidate
> 2. Audit Log API: every candidate event hashed-chained, exportable
>    as RFC-4180 CSV in seconds (compliance-grade)
> 3. Stack-Vault tenant isolation: same Q47 lives independently
>    across every staffing firm we serve
>
> 20 minutes next week? Or if it'd help, here's a 5-min loom of
> the watermark in action: [link]
>
> – Bhaskar
> CEO, QOrium Technologies

**Length:** ~180 words.

### Day 4 — T2 Value-add email

> **Subject:** Re: [Their Firm] — anti-leak watermark demo
>
> [First Name] —
>
> Following up. To make the case concrete, here's a 1-page brief
> on **how Talpro reduced their candidate-leakage incident response
> time from 4 hours to 8 minutes** using QOrium's Audit Log API.
> [link to 1-pager]
>
> If [Their Firm]'s tech-screen has ever had to defend a leak
> incident to a client, the Audit Log API is the fastest path to
> "we can prove it" → "we can report it" → "we can rotate it."
>
> Worth 20 minutes?
>
> – Bhaskar

**Length:** ~80 words.

### Day 11 — T3 Demo invite

> **Subject:** Re: QOrium demo — 20 min Tue 3:30pm IST?
>
> [First Name],
>
> Picking my best slots for a quick demo:
>
> – Tuesday, 3:30pm IST
> – Wednesday, 11am IST
> – Friday, 2pm IST
>
> 20 minutes. I'll show:
>
> 1. The double-watermark in action (your team can re-run live)
> 2. The audit-export end-to-end (download a real CSV)
> 3. Current Stack-Vault pricing range for your firm size
>
> If none of these work, here's my Calendly: [link].
>
> – Bhaskar

**Length:** ~80 words.

### Day 18 — T4 Soft re-engage

LinkedIn comment on their recent post (1 sentence, on-topic, not
self-promotional).

PLUS short email:

> **Subject:** Last note from my side
>
> [First Name] — closing the loop. I won't keep cluttering your
> inbox.
>
> If the conversation lands at a better time, please reach back.
> If you have a colleague who handles tech-screen tooling, an
> intro would be enormously appreciated.
>
> Thanks,
> Bhaskar

**Length:** 60 words.

### Day 28 — T5 Close

Move to 6-month nurture cadence. No more direct asks; surface
QOrium content (white paper, blog) every ~6 weeks.

---

## Sequence B — ICP-2 (Mid-market enterprise hiring)

### Day 0 — T1 LinkedIn DM + Email

LinkedIn DM:
> Hi [First Name] — Bhaskar from QOrium. We just shipped multi-
> region terraform + SOC 2 readiness scaffold; Stack-Vault is
> tenant-isolated with double watermark. If [Their Firm] is
> hiring 200+ engineers/year, this fits the audit-trail +
> bias-detection conversation. Worth 30 min?

Email:

> **Subject:** [Their Firm] eng hiring — IRT-calibrated + SOC 2
> audit trail
>
> Hi [First Name],
>
> Saw [Their Firm]'s job-post volume — looks like ~[N]+ engineers
> in flight. Two questions for you:
>
> 1. How are you currently producing audit trails for SOC 2 / SOX
>    on your tech screen?
> 2. Have you had to defend an assessment to legal post-hire on
>    bias grounds?
>
> QOrium ships:
>
> - **Stack-Vault** — tenant-isolated question library; double
>   watermark (HMAC + homoglyph); SAML/SCIM ready (post-cred-drop)
> - **Audit Log API** — hash-chained event log; exportable as
>   compliance-grade CSV in < 60s; addresses both SOC 2 + SOX
> - **Bias-Detection report** — Mantel-Haenszel DIF + cohort cuts;
>   I/O Psychologist co-signed (in flight; hiring contractor now)
>
> Customer-Zero (Talpro India) is live; we have ~1,300 calibrated
> items across 13 sub-skills.
>
> 30 minutes next week? I can demo on a real candidate flow.
>
> – Bhaskar
> CEO, QOrium Technologies

**Length:** ~190 words.

### Day 4 — T2 Compliance-angle value-add

> **Subject:** Re: [Their Firm] eng hiring — 1-page SOC 2 mapping
>
> [First Name],
>
> To make this concrete, here's our SOC 2 control mapping (TSC
> CC1.1 → CC9.2 + A1 + C1 + PI1 + P1) — what QOrium provides vs
> what you provide. [link to mapping]
>
> If [Their Firm]'s SOC 2 audit is in flight, we can be a
> 6-week-saver on the trust-services-criteria side. If it's
> already complete, we slot into evidence-collection cadence.
>
> Either way, worth 30 minutes?
>
> – Bhaskar

### Day 11 — T3 Demo invite

(Same as ICP-1 Day 11, but 30-min demo and including audit-export
+ webhook + ATS connector flow)

### Day 18 — T4 + Day 28 — T5

(Same pattern as ICP-1.)

---

## Sequence C — ICP-3 (HRTech / EdTech recruiters)

### Day 0 — T1 (LinkedIn DM only; no cold email)

> Hi [First Name] — Bhaskar @ QOrium. We're an IRT-calibrated
> question library SaaS (think HackerRank but with anti-leak
> watermark + tenant isolation). For a Series-A HRTech like
> [Their Firm], we have an entry tier that drops in via API.
> Quick chat?

**Length:** 50 words. Personal + product-led tone (not enterprise).

### Day 4 — T2 (LinkedIn message with link to public methodology)

> [First Name] — sharing the public version of our methodology
> white paper [link]. Mostly relevant to your investor-deck
> story (defensibility + IRT-calibrated questions = hard-to-
> copy moat). Worth 20 min?

### Day 11 — T3 (Direct email)

> **Subject:** [Their Firm] + QOrium — entry-tier API drop-in
>
> [First Name],
>
> A focused offer for HRTech founders: ReadyBank API entry tier
> ($5K-$15K/yr) drops into your existing tech-screen surface in
> ~3 days. We do the IRT calibration + anti-leak rotation + the
> watermark; you keep your existing UX.
>
> 3 reasons it might fit [Their Firm]:
>
> 1. Your investor deck gets a "moat" line (we co-publish
>    methodology white paper)
> 2. Your candidates' tech-screen pass rate stops drifting
>    (calibration handles drift)
> 3. Your engineering team stops authoring questions (we have
>    1,300 ready, 5,000 by Y1)
>
> 20 minutes?
>
> – Bhaskar

### Day 18 — T4 + Day 28 — T5

(Same pattern.)

---

## Tech stack

| Tool | Use | Cost |
|---|---|---|
| LinkedIn Sales Navigator | Target list + outreach | ₹6K/month |
| Apollo.io | Email + sequence automation + verified addresses | ₹6K/month |
| Lemlist | Email warmup + sequence sending | ₹4K/month |
| Calendly | Demo scheduling | free tier OK |
| Loom | 5-min product demos to send in T2 | free tier OK |
| Notion / Airtable | CRM + opportunity tracking | free tier OK initially |
| **Total monthly stack** | | **~₹16K/month** |

For 3-month outbound run: ~₹50K (well within budget).

---

## Cadence discipline

- **Send in IST business hours** — 10am-6pm; never weekends; never
  after 7pm
- **Respect "not now"** — if a prospect says not now, move to 6-
  month nurture; don't argue
- **Never bcc / mass-blast** — every email is personalised at least
  on the salutation + 1 specific reference
- **Track replies** — even "remove me" gets a friendly acknowledgement
  + immediate removal (DPDPA compliance)
- **No automated LinkedIn connection requests at scale** — manual,
  one-by-one, after researching the profile
- **Weekly retro** — every Friday CEO + (future AE) review:
  reply rate, demo-book rate, opportunity-create rate, drop-off

---

## Stop conditions

Halt outbound and contact CTO Office before continuing if:

- **Mass-bounce signal** — > 5% bounce rate (means email list is
  bad; refresh)
- **Spam-flag rate elevated** — Lemlist warns of inbox-placement
  drop (means content is spammy; revise)
- **Single ICP not yielding** — 30 outreaches, 0 demos booked in 4
  weeks → revise sequence or de-prioritise that ICP
- **Constitutional touch** — any prospect asks for terms that touch
  Constitution Article I/IV/VII/IX (e.g., asks us to skip IRT
  calibration; asks us to disable watermark; asks for unlimited
  question access for marketplace re-sale) — escalate to CEO

---

## What ALL channels must include

Per Standing Order #2 USP discipline:

> Every outbound surface that mentions QOrium's product MUST
> reference at least one of:
> - "IRT-calibrated"
> - "anti-leak-rotated"
> - "watermark-per-candidate"

The full verbatim USP appears at:
- press-kit page (governance/launch/press-kit if applicable)
- LinkedIn launch post
- Bosch GCC follow-up (Tier-A7)

For outbound emails + LinkedIn DMs, fragments of the USP are
sufficient (per `apps/marketing/src/content/copy/__tests__/locked-
usp.test.ts`).

---

_Sequences are drafts. CEO approves before any send. NO outreach
has been sent._

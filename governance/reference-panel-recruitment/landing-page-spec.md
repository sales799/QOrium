# Landing Page Spec — `panel.qorium.online`

**Goal:** convert qualified visitors into Reference Panel applicants.
**Conversion target:** ≥30% of qualified visitors → completed intake.
**Hosting:** Cloudflare Pages or Netlify (static); behind cred-drop
on cert + DNS records (`panel.qorium.online` is a future subdomain).

The page is a single-page, single-CTA conversion surface. No
navigation, no footer cruft. Mirror the QOrium marketing site visual
language but with a more focused CTA hierarchy.

---

## Page structure (top to bottom)

### 1. Hero (above the fold)

**Headline (≤ 12 words, ≤ 22-word sentence):**
> Help shape the next generation of fair technical hiring.

**Subhead (≤ 28 words):**
> Join QOrium's Reference Panel. Take a 90-minute online assessment;
> get paid ₹2,000; help us calibrate every question candidates
> will face.

**Primary CTA button:**
> Apply to join the panel
(Links to `#apply` anchor / intake form below.)

**Secondary CTA (text link):**
> Why ≥200 respondents matter for fair calibration → (links to
> `#why-this-matters` section)

**Visual:** simple geometric pattern OR a single number (200) with
context (something like "We need 200 respondents for the math to
work. Join us."). No stock photos of "diverse professionals smiling
at laptops." That looks like every HR product on the planet.

### 2. Why this matters (60-second read)

**Section title:**
> The math doesn't work below 200.

**Body (3 short paragraphs):**

> Every question on QOrium's platform — from a Java concurrency
> challenge to a situational-judgement scenario — gets calibrated
> against the responses of our Reference Panel. The calibration
> tells us how hard each question really is, how well it discriminates
> between candidates, and whether it's biased against any group.
>
> Below 200 respondents, the calibration math is too noisy. Above
> 200, the IRT parameters stabilise and we can detect bias with
> meaningful statistical power.
>
> If you're a software engineer, data professional, or technical
> contributor, your 90 minutes can permanently shape the fairness
> of every assessment we ship. We pay ₹2,000 per session and we
> publish the methodology in a co-signed white paper.

(Links: "calibration math" → public methodology page; "fairness"
→ Bias-Detection-Methodology-v1 summary)

### 3. What you'll do (3-step explainer)

**Step 1:**
> Apply via the form below (5 minutes).

**Step 2:**
> If we accept, we send you a personal panel-token link. You take a
> 90-minute online assessment in your sub-skill of choice. No
> camera, no proctoring — just questions.

**Step 3:**
> We pay ₹2,000 within 7 business days of completion. You can
> decline at any point with no penalty.

### 4. What we ask (privacy-first transparency)

**Section title:**
> What we collect, and what we don't.

**Tables (2 columns):**

| We collect | We don't collect |
|---|---|
| Your responses to questions | Your face / camera feed |
| Demographic + skill-level cohort tag | Your IP address (anonymised) |
| Time spent per question (for attention-check) | Your name on the response data after retention period |
| Panel-token (rotated per session) | Your CV or work history |

(Link: "full privacy notice" → `panel-privacy.md` (separate page))

### 5. Compensation + ethics

**Block:**
> We pay ₹2,000 per completed session via bank transfer or UPI within
> 7 business days. Attention-check items must pass for payment;
> we'll explain why if a session doesn't qualify.
>
> All response data is governed by our Reference Panel Charter
> (co-signed by our I/O Psychologist). Charter: [link, after Charter
> ships in Tier-A2 D2].

### 6. Eligibility (filter language)

**Section:**

> **Open to:**
>
> - Software engineers (any sub-skill: Java, Python, React, SQL,
>   AWS, DevOps, Salesforce, AIPE, SAP-ABAP, OHCM, CPQ, Finacle,
>   Embedded Automotive)
> - Data + ML professionals
> - Technical product / engineering leadership
> - Recent graduates with demonstrable engineering coursework or
>   open-source contributions
> - Returning professionals after career breaks (we welcome you)
>
> **Closed to:**
>
> - Anyone currently a candidate or recruiter on a QOrium customer
>   account (conflict of interest)
> - Anyone employed by AspiringMinds/SHL, Mettl, HackerRank, Codility,
>   or other QOrium competitors (conflict)
> - Minors (must be 18+)

### 7. Apply form (anchor `#apply`)

(See `intake-form.md` for full schema.)

Inline form, NOT a popup. 7 fields max. Submit button: "Submit
application." Below button: "We respond to every applicant within 5
business days."

### 8. Footer (minimal)

- "Reference Panel by QOrium" with link back to qorium.online
- "Questions: panel@qorium.online"
- "Privacy: full panel-privacy notice"
- "Anti-discrimination: link to charter section"

---

## Accessibility + conversion discipline

- WCAG 2.1 AA minimum: contrast ratios, keyboard navigation,
  screen-reader semantics
- Single H1 (the headline)
- Mobile-first responsive (60-70% of traffic will be mobile)
- Form: every field has a label; error states are tied to inputs
  via aria-describedby; submit failures don't lose user input
- Page weight target ≤ 300 KB total (no heavy hero video)
- No third-party trackers; analytics via self-hosted Plausible or
  similar (Reference Panel is privacy-sensitive — no Google
  Analytics)

## Performance

- LCP ≤ 1.5s on 3G mobile
- CLS = 0
- INP ≤ 200ms
- Lighthouse score ≥ 95 across the board

## Cred-drop dependency

- Domain: `panel.qorium.online` — DNS not yet provisioned (cred-bound)
- TLS cert: needed (Let's Encrypt or ACM)
- Form backend: writes to existing `services/readybank` panel-token
  ingestion API (already shipped Sprint 1.8); intake form goes to
  a moderated queue first, not directly to the live panel
- Email confirmation (post-application): goes through `services/
  readybank` mailer (Sprint 1.6.mailer; SES driver cred-bound)

Until cred-drop, the page lives as static HTML at a staging URL
visible only to CEO + CTO Office for review. Production-domain
deploy is a 1-PR sprint after cred-drop.

---

## What goes WRONG and why

- **Stock-photo + buzzword landing page** → looks like every other
  HR product; converts < 5%
- **Popup form** → gated content kills mobile conversion
- **No payment transparency** → looks like a free-labour scheme
- **No ethics charter mention** → loses senior respondents who
  expect IRB-style governance
- **Hidden eligibility** → wastes applicant time + ours

---

_Spec is a draft. Visual design + final copy by CEO + CTO Office.
Page goes live post-cred-drop._

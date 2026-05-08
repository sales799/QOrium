# Customer-Zero Sandbox Run — 90-Minute Brief

**For:** Talpro CTO (sandbox subject)
**Hosted by:** Bhaskar (CEO) + CTO Office (autonomous agent backing)
**Scheduled:** Saturday 11 AM IST (per WhatsApp 2026-05-08; awaiting confirmation)
**Goal:** Walk QOrium end-to-end as if a real candidate; surface every clunky thing before a real Talpro candidate runs.
**Filed:** 2026-05-09
**Refs:** `governance/CEO-Decision-Packet-2026-05-08.md` §4, `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.md`

---

## Why we're doing this

Per Constitution Article IX, **first real Talpro candidate** is the M2 Phase 1 milestone — the moment QOrium stops being engineering-demo and becomes customer-validated. Before we put a real Talpro candidate on the platform, we want one careful, friendly user (you) to do the full take-flow and tell us what's broken, weird, or confusing.

Talpro CTO is the right "candidate-zero":
- Senior enough to understand engineering questions (you'll see Wave-1 content)
- Trusted enough to give honest "this is bad" feedback
- No real-stakes for you — your assessment doesn't go to a hiring manager
- 30 minutes of platform debugging gets compressed into your 90-minute session

---

## What you'll do (90 min total)

| Min | Activity | Whose hands |
|---|---|---|
| 0-5 | Bhaskar walks you through "why we're doing this" + ground rules | Bhaskar |
| 5-15 | You log in as a candidate (recruiter session is pre-seeded; see below) | You |
| 15-65 | You take a short Wave-1 engineering assessment (10-15 questions; ~50 min budget) | You |
| 65-75 | You see your result page; explore | You |
| 75-90 | Debrief with Bhaskar + agent — what was clunky, what was good, what surprised you | Both |

---

## What's pre-seeded by the CTO agent (you don't deal with this)

Before Saturday, the agent will:
1. Generate a one-time recruiter "invite" for you in the system
2. Pre-select a 10-question Wave-1 engineering pack (mix of Java + Python + AWS — pick whichever language you want; not graded against any rubric)
3. Pre-fill your candidate record with a synthetic name (or your real name if you want; let Bhaskar know)
4. Send you (via WhatsApp Bhaskar, NOT via email) the candidate take-link 30 min before session

You'll click the link, log in, and the platform takes over from there.

---

## Ground rules for the session

1. **No prep on your side.** The whole point is you bring fresh eyes.
2. **Talk out loud.** Narrate your reaction in real time. "I'm clicking this — wait, why is it asking…?" is gold for us.
3. **Note clunks, don't fix them.** Don't suggest the fix; just point at the broken thing. We'll triage together in debrief.
4. **You're not being graded.** You can answer questions wrong on purpose to test the result page. We don't care.
5. **Hard stop at 90 min.** We don't drag you longer.

---

## Specific things we want you to test

### Login + take flow
- Does the login page make sense?
- After login, is it obvious what to do next?
- During the assessment: any visual glitches, weird timing, confusing question UI?
- Code questions: does the editor work? Can you copy-paste? Tab indent?
- Multi-page questions (case studies): does navigation work cleanly?

### Watermark engine (anti-leak moat)
- Look at the rendered question body carefully — there's a watermark embedded.
- Try to copy-paste the question text into a notepad. The watermark should survive.
- (Don't post anywhere; this is a moat-validation check, not a leak test.)

### Result page
- After submission, does the result page load?
- Is the score interpretable? (We're not optimised for candidate-friendly explanation yet — flag if it's bad.)
- Is the IRT difficulty band visible?

### Things that are NOT yet polished (don't be surprised)
- Email notifications: SES verification just completed today; sandbox mode means real-candidate emails come later
- Translations: only English fully released; Hindi/Tamil/Telugu are pending stubs
- Stack-Vault tenant isolation: live but you won't see it (you're a ReadyBank candidate)
- JD-Forge: cred-bound; not in this sandbox run
- Anti-leak engine notifications: scans run, but admin console pages may be sparse

---

## Debrief structure (last 15 min)

We'll walk a 3-bucket triage:

**Bucket A — "ship-stoppers"** (would block a real candidate)
- e.g., "I couldn't submit code answer; got a 500"
- e.g., "Result page is blank"

**Bucket B — "polish before customer #1"** (won't block, but embarrassing)
- e.g., "Login page has wrong logo"
- e.g., "Question 5 had a typo"
- e.g., "Code editor doesn't have line numbers"

**Bucket C — "nice-to-haves for M3+"** (skip for now)
- e.g., "It would be nice if the timer paused on tab switch"
- e.g., "Could you add dark mode?"

Agent commits Bucket A items to a punch list within 24h post-session; ships fixes within 1 week. Bucket B goes to the next sprint. Bucket C goes to backlog.

---

## What you'll get out of this session

- 30 min of saving Bhaskar from launching with broken stuff to a real Talpro candidate
- Free (well, $0 cost) early-access deep look at QOrium's product surface
- Right of first-objection on Stack-Vault Enterprise pitches when we go after Bosch / similar — you'll know what's in the box and can speak to it

---

## What we'll do AFTER your session (you don't have to lift a finger)

1. Agent transcribes your verbal feedback (Bhaskar will run the recording through Claude transcription)
2. Agent triages into A / B / C buckets per above
3. Agent files PR with Bucket A fixes within 24-48h
4. Agent updates `governance/dashboard.json` to mark `human.first-talpro-candidate` from blocked-on-human → in-progress (sandbox done; real candidate next)
5. CEO + Talpro Delivery Head identify the real Talpro candidate within 1-2 weeks
6. Real candidate runs (option B per CEO Decision Packet §4) using the cleaner platform you helped polish

---

## What to DO before Saturday

Nothing. Show up. Have coffee.

If you want, you can read these (totally optional, ~5 min each):
- `https://api.qorium.online/healthz` — confirms platform is live
- `governance/Auto-Mode-Remote-Plan-v1.md` — how the autonomous CTO agent fits in
- `customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.md` — what M2 launch looks like

If you have ANY misgivings (timing, approach, scope), tell Bhaskar before Saturday so we don't waste the session. Better to push by 1 day than half-test.

---

## Stop conditions (when we cancel the session)

- AWS SES still in "Verification pending" state on Saturday morning IST (low risk; verification is in flight as of 2026-05-09 12:00 IST and DKIM CNAMEs already resolve globally)
- Recruiter invite system breaks during pre-seed
- You let Bhaskar know you have a hard conflict — we re-schedule, no apology needed

---

**End of sandbox-run brief v1.** Reviewer: Bhaskar (CEO). Author: CTO Office (autonomous agent), 2026-05-09. To be shared with Talpro CTO via WhatsApp link to this file (or PDF rendering) when he confirms Saturday.

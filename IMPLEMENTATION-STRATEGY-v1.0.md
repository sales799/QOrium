# QOrium Implementation Strategy v1.0

## The CTO's End-to-End Plan to Build QOrium per the Ratified Constitution

**Authored by:** CTO Office, Talpro Universe
**For:** Bhaskar Anand, CEO
**Effective:** May 2026 (immediately upon Constitution v2.0 ratification)
**Status:** ACTIVE — replaces ad-hoc execution with a structured 3-Part operating model
**Companion docs:** Constitution v2.0 (binding), Phase 0+1 Punchlist, Live Progress Tracker, CEO Action Cards, Browser Prompts Library

---

## Why This Document Exists

Constitution v2.0 is ratified and the build has begun. But "the build" is hundreds of discrete actions — write code, register a domain, post a JD, open a bank account, send an email, sign a contract, deploy a service, validate a question. **Each action has a different owner profile.** Some I can do alone. Some need you in front of a screen for 5 minutes. Some only you can do (your name, your bank, your meetings).

This document defines the **3-Part Framework** that classifies every implementation task by who-does-it-how, plus the operating systems behind each part: auto-mode for Part A, browser automation for Part B, action cards for Part C. Add a live progress tracker and an after-each-task next-step message pattern, and you have a system where:

- You always know what's running, what's done, and what's blocking
- I never wait for you on tasks I can do myself
- You never have to figure out "what should I do next" — I tell you, with the exact tool, the exact location, and the exact words
- The build advances at maximum velocity given your constraints

---

# §1. THE 3-PART FRAMEWORK

Every implementation task in QOrium falls into exactly one of three classifications. The classification is determined at task creation time and rarely changes.

## §1.1 PART A — Autonomous CTO Execution

**Definition:** Tasks the CTO Office (operating in this Cowork session, on the Mac, with file access + bash + AI APIs) can complete end-to-end without any CEO involvement.

**Examples:** Write code, generate database migrations, write JDs, draft email templates, generate sample question packs, build admin UI scaffolding, write CI/CD configs, generate brand asset specs, conduct market research, draft contracts, write tests, build the Content Engine.

**Operating mode:** When CTO Office completes a Part A task, **it automatically advances to the next Part A task in the queue.** No CEO input required. No "should I proceed?" question. The Constitution + Phase Gates are the authority — within those guardrails, Part A is fully autonomous.

**Hard rules for Part A:**
1. **No spend outside the sanctioned envelope.** ₹50L runway is the cap.
2. **No external commitments** (no emails sent on the CEO's behalf, no contracts signed, no posts published).
3. **No production deployment** (Part A produces artifacts; deployment is Part B or Part C).
4. **All Part A work passes Gatekeeper** (Constitution Article VII) before being declared done.
5. **All Part A work updates the Live Progress Tracker** before claiming completion.

**Auto-trigger logic:** When Part A task `T_n` completes, the CTO Office:
1. Marks `T_n` ✅ in Live Progress Tracker
2. Checks dependencies for `T_n+1` (next task in same phase)
3. If dependencies met, starts `T_n+1` immediately
4. If dependencies blocked by Part B/C, queues `T_n+1` and starts the next unblocked Part A task
5. Reports cumulative progress at end of each work session

## §1.2 PART B — Browser-Walk-Through (CTO Scripts; CEO Clicks)

**Definition:** Tasks where the CTO Office cannot act directly because they require a logged-in account or external API the CTO Office doesn't have credentials for, but where most of the cognitive work is mechanical and can be scripted into a browser automation prompt.

**Examples:** Domain registration (Hostinger console), DNS records setup, GitHub repo creation, API key procurement (Anthropic, OpenAI, Gemini, Serper.dev consoles), Cloudflare R2 bucket creation, VPS upgrade in Hostinger panel, Razorpay merchant account setup, LinkedIn job postings, trademark filing portal navigation, social handle reservation.

**Operating mode:** For each Part B task, the CTO Office produces a **complete Claude in Chrome browser prompt** that, when pasted into Claude in Chrome, will navigate the relevant browser tab and complete the task with patient handholding. The CEO's role is:
1. Open the relevant browser (or Claude takes over an existing tab)
2. Login to the relevant service (CEO does this manually for security)
3. Paste the prompt into Claude in Chrome
4. Watch Claude do the work; intervene only if Claude pauses for confirmation
5. Confirm completion back to the CTO Office (one-line message)

**The browser prompt format includes:**
- Pre-conditions (must be logged in, must be on this URL)
- Step-by-step instructions Claude follows
- Where to pause for CEO confirmation (e.g., "before clicking 'PAY'")
- Where to capture evidence (screenshots, copied IDs, downloaded files)
- Post-completion handoff (what to send back to the CTO Office)

**Hard rules for Part B:**
1. **No financial transactions without CEO confirmation step.** Every "PAY" or "TRANSFER" button has an explicit pause.
2. **Credentials never enter the prompt.** CEO logs in manually; Claude in Chrome takes over after login.
3. **Evidence is captured for every Part B task.** Screenshot or ID or downloaded artifact.
4. **Each Part B task has a clear "done" signal** that the CEO sends back ("✅ Hostinger VPS upgraded to KVM4 with confirmation #ABC123").

## §1.3 PART C — CEO Physical Action

**Definition:** Tasks that fundamentally require the CEO as a human — physical money movement, signatures, phone calls, in-person meetings, decisions only the CEO can make.

**Examples:** Transfer ₹50L to QOrium ringfenced account, sign offer letters, make Bosch GCC introduction call, engage external IP counsel via phone, sign MSA/DPA contracts, attend industry events, make CFO/banking decisions, finalize key partnership commitments.

**Operating mode:** For each Part C task, the CTO Office produces a **CEO Action Card** that includes:
- **What** — the task in one sentence
- **Where** — exactly where the action happens (Phone? Banking app? In-person meeting? Email?)
- **When** — target completion date with rationale
- **Why** — what unblocks if this task completes; what blocks if it doesn't
- **How** — step-by-step the CEO follows (5 lines max for clarity)
- **Evidence-back** — what the CEO sends to the CTO Office to confirm done

**Hard rules for Part C:**
1. **One action card per task.** Action cards are short, focused, immediately actionable.
2. **CEO does not improvise on Part C.** If the action requires deviation, escalate to CTO Office for revised card.
3. **Evidence-back is mandatory.** The card is not "done" until the CEO sends back the evidence the card requested.
4. **Part C tasks are sequenced.** Don't dump all Part C cards on the CEO at once; release them as upstream Part A and Part B prerequisites complete.

## §1.4 The Classification Decision Tree

```
For any new task T:

Step 1: Can the CTO Office do this task entirely with files + bash + AI APIs?
  YES → Part A (Autonomous)
  NO  → continue

Step 2: Can the task be fully scripted into a browser automation prompt
        if a logged-in account is provided?
  YES → Part B (Browser-Walk-Through)
  NO  → continue

Step 3: Does the task require physical CEO presence
        (signature / money / phone / meeting / decision)?
  YES → Part C (CEO Physical Action)
```

If a task spans multiple parts, **decompose it** into single-classification subtasks.

---

# §2. AUTO-TRIGGER LOGIC (Part A)

## §2.1 In-Session Auto-Mode

Within a single Cowork session, Part A is fully autonomous:

```
LOOP:
  task = next unblocked Part A task in current Phase
  IF task is None:
    → check if Phase Gate passes
    IF Phase Gate passes:
      → advance to next Phase
      → trigger first Part A task of next Phase
    ELSE:
      → log blocked status; report to CEO
      → exit loop
  ELSE:
    → execute task
    → update Progress Tracker
    → run Gatekeeper check on output
    IF Gatekeeper PASS:
      → mark task done; loop
    ELSE:
      → log failure; queue remediation; loop
```

I do not stop to ask "should I continue?" between Part A tasks. The Constitution + Phase Gates + Quality Gate are the guardrails.

## §2.2 Cross-Session Auto-Mode

Cowork sessions are not truly continuous in the background. Cross-session auto-mode works like this:

1. **End of session:** CTO Office writes `IMPLEMENTATION-NEXT-SESSION-MANIFEST.md` listing exactly what the next session should do (next Part A task, queue position, blocked Part B/C dependencies).

2. **Start of next session:** When the CEO opens a new Cowork conversation and types "continue" (or "resume QOrium build"), the CTO Office reads the manifest and resumes from the exact next task.

3. **Long-running scheduled tasks:** For any Part A task that benefits from running outside Cowork (e.g., overnight question generation runs), the CTO Office produces a Mac/VPS cron script that runs autonomously. These are documented in `auto-mode/scheduled-tasks/`.

## §2.3 Phase Gate Auto-Advance

When a Phase completes (per Constitution Article IX pass criteria), the CTO Office:
1. Runs IdeaForge re-gate (Article IX requires this at M3, M6, M9, M12)
2. If gate passes (≥20/24): advances to next Phase automatically; updates Constitution provisional milestones
3. If gate fails: reports to CEO with specific dimension scores; requests CEO direction; pauses Part A advancement

The CEO does NOT need to "approve Phase 1 → Phase 2." The IdeaForge gate is the approval mechanism. The CEO's role is to review the gate score after-the-fact and intervene only if the score is wrong.

---

# §3. BROWSER PROMPT ARCHITECTURE (Part B)

## §3.1 The Browser Prompt Library

Every Part B task has a corresponding browser prompt in `BROWSER-PROMPTS-LIBRARY.md`. Each prompt has:

```
## BP-XX — [Task name]

**Pre-conditions:**
- You must be logged into [service]
- You must be on URL [exact URL]
- You must have [specific item ready, e.g., "your credit card"]

**Open Claude in Chrome on [the active tab].**

**Paste the following prompt:**

---PROMPT START---
[the actual prompt — instructions Claude follows]
---PROMPT END---

**What Claude will do:**
- Step 1: [action]
- Step 2: [action]
- ...
- Step N: [final action — typically pause for your confirmation]

**Where to pause for your confirmation:**
- Before [specific moment] — Claude will ask "ready to proceed?"

**Evidence to capture:**
- [screenshot / ID / file]

**Post-completion message to CTO:**
- "✅ BP-XX done. Evidence: [paste evidence]"
```

## §3.2 The Pause-and-Confirm Pattern

For every transactional Part B task (anything involving payment, account creation, irreversible action), the browser prompt explicitly pauses before the irreversible step. Examples:

- Before clicking "Confirm purchase" on a domain
- Before clicking "Pay" on VPS upgrade
- Before clicking "Send OTP" for account creation
- Before clicking "Submit" on trademark filing

The CEO confirms by saying "go" or "proceed" in Claude in Chrome, then Claude completes the irreversible step.

## §3.3 When Part B Is Faster Than Part A

A surprising number of Part B tasks would take longer if I tried to script them via API (because half the time the API needs auth tokens that themselves need a browser to obtain). The browser-walk-through is often the FASTER path for one-time setup work. Once the CEO is logged in, Claude in Chrome can navigate, fill forms, and capture confirmation in 2-3 minutes per task.

---

# §4. CEO ACTION CARDS (Part C)

## §4.1 The Action Card Format

Every Part C task is a CEO Action Card. The format:

```
## CC-XX — [Task name]

**One-sentence what:** [single sentence]

**Where:** [Banking app / Phone / In-person / Email / etc.]

**When:** [Target date — e.g., Day 7]

**Why:** [What unblocks; what's blocked if missed]

**How (5 steps max):**
1. [step]
2. [step]
3. [step]
4. [step]
5. [step]

**Evidence-back to CTO:**
[exact thing the CEO sends back: "Transferred ₹X on [date]. Account ref: [number]"]
```

## §4.2 Action Card Sequencing

CEO Action Cards are released in dependency order. The CEO does not see all 15 Part C cards on Day 0 — that creates decision paralysis. Instead:

- Day 0: 3-5 cards released (the immediate Day 0–7 actions)
- As cards complete: next 3-5 cards released (Day 7–14 actions)
- And so on through Phase 0 → Phase 1

The Live Progress Tracker shows which cards are "OPEN" (CEO can act now), "QUEUED" (waiting for upstream), "DONE" (completed with evidence).

## §4.3 Evidence-Back Discipline

Every Part C card has a specific evidence requirement. The card is not closed until the CEO sends back the evidence. Examples:

- "Transferred ₹50L. Bank ref: ABC123. Date: 2026-05-XX."
- "IP counsel engaged. Firm: [name]. Engagement letter signed [date]."
- "Bosch GCC discovery call scheduled for 2026-05-XX at 4:00 PM IST with [name]."
- "Offer letter signed by [Senior Eng candidate]. Joining date: 2026-06-XX."

Without evidence, Phase Gate criteria are not satisfied.

---

# §5. PHASE 0 — TASK BREAKDOWN BY PART

(Source: `task_plan_phase0_phase1.md`. Every task classified.)

## §5.1 Phase 0 Capital & Legal — Mostly Part C (CEO physical actions on bank/legal)

| Task ID | Task | Part | Owner |
|---|---|---|---|
| A1 | Open QOrium-ringfenced account | C | CEO |
| A2 | Transfer ₹50L sanctioned runway | C | CEO |
| A3 | Engage external IP counsel | C | CEO |
| A4 | Domain registration `qorium.online` + `qorium.in` | B | CEO + CTO browser |
| A5 | Trademark filing India + US | C (with B browser walk for filing portal) | CEO + IP counsel |
| A6 | MSA template drafted | A then C | CTO drafts; CEO signs final |
| A7 | DPA template drafted | A then C | CTO drafts; CEO signs final |
| A8 | Reserve social handles | B | CEO + CTO browser |

## §5.2 Phase 0 Infrastructure — Mostly Part A (CTO autonomous) + some Part B (credentialed)

| Task ID | Task | Part | Owner |
|---|---|---|---|
| B1 | VPS upgrade evaluation | A | CTO |
| B2 | DNS configured for 6 subdomains | B | CEO + CTO browser |
| B3 | Let's Encrypt SSL on all subdomains | A | CTO |
| B4 | GitHub organization + repo | B | CEO + CTO browser |
| B5 | CI/CD pipeline (GitHub Actions) | A | CTO |
| B6 | gitleaks pre-commit hook | A | CTO |
| B7 | PostgreSQL provisioned + initial schema | A | CTO |
| B8 | Redis provisioned | A | CTO |
| B9 | Cloudflare R2 bucket | B | CEO + CTO browser |
| B10 | PM2 ecosystem.config.js | A | CTO |
| B11 | AI API keys procurement | B | CEO + CTO browser |
| B12 | Serper.dev API key | B | CEO + CTO browser |
| B13 | OpenTelemetry + Grafana + Sentry | A | CTO |
| B14 | Talpro Sentinel integration | A | CTO |
| B15 | PostgreSQL backup + PITR | A | CTO |

## §5.3 Phase 0 People & Hiring — Mix of A (drafting) and C (hiring decisions)

| Task ID | Task | Part | Owner |
|---|---|---|---|
| C1 | Senior Engineer JD drafted | A | CTO |
| C1' | Senior Engineer JD posted | B | CEO + CTO browser (LinkedIn/Naukri) |
| C2 | SME Content Lead JD drafted | A | CTO |
| C2' | SME Content Lead JD posted | B | CEO + CTO browser |
| C3 | AE Enterprise JD drafted | A | CTO |
| C3' | AE Enterprise JD posted | B | CEO + CTO browser |
| C4 | BD Platforms JD drafted | A | CTO |
| C4' | BD Platforms JD posted | B | CEO + CTO browser |
| C5 | I/O Psych contractor JD scoped | A | CTO |
| C6 | Initial SME contractor list compiled | A | CTO (pulls from Talpro alumni) |
| C7 | Compensation philosophy + bands | A | CTO drafts; CEO approves |
| C8 | Standard offer letter template | A | CTO drafts; legal counsel reviews |
| C-INTV | Interviewing candidates | C | CEO + CTO joint |
| C-OFFER | Offer letter signed | C | CEO + candidate |

## §5.4 Phase 0 Customer Zero — Joint A + C

| Task ID | Task | Part | Owner |
|---|---|---|---|
| D1 | Talpro India Delivery Head briefed | C | CEO call to Delivery Head |
| D2 | First 5 Talpro JDs collected | A | CTO (pulls from Talpro CRM with Delivery Head) |
| D3 | Internal-namespace API key issued | A | CTO |
| D4 | Weekly feedback channel established | B | CEO sets up Slack channel; CTO scripts |
| D5 | Initial 100-question seed batch | A | CTO + SME Lead (when hired) |

## §5.5 Phase 0 Bosch GCC Outreach — All Part C with A drafting support

| Task ID | Task | Part | Owner |
|---|---|---|---|
| E1 | Warm-intro email drafted | A | CTO drafts |
| E1' | Warm-intro email sent to Bosch GCC | C | CEO sends |
| E2 | Bosch GCC stack research | A | CTO |
| E3 | Sample 50-question pack scope | A | CTO + SME Lead |
| E3' | Sample 50-question pack produced | A | CTO + SME Lead |
| E4 | First Bosch discovery call booked | C | CEO schedules |
| E4' | First Bosch discovery call held | C | CEO + CTO joint call |

## §5.6 Phase 0 Summary

| Classification | Count | % |
|---|---|---|
| Part A (Autonomous CTO) | ~20 tasks | ~50% |
| Part B (Browser walk-through) | ~12 tasks | ~30% |
| Part C (CEO physical) | ~8 tasks | ~20% |

Half of Phase 0 advances without you. About a third needs you for 2–5 minutes at a browser. About a fifth needs you on the phone, signing things, or in meetings.

---

# §6. PHASE 1 — TASK BREAKDOWN BY PART

(Phase 1 = Months 1-3, Engineering execution + first 5 logos. Source: `task_plan_phase0_phase1.md` §G/H/I/J.)

## §6.1 Engineering — Almost all Part A (with Part B for credentialed deploy)

| Task ID | Task | Part | Owner |
|---|---|---|---|
| G1 | Content Engine 7-stage pipeline scaffolding | A | CTO + Senior Eng |
| G2 | Role-Graph schema implementation | A | Senior Eng |
| G3 | First 1K questions authored + SME-validated | A | SME Lead + AI pipeline |
| G4 | ReadyBank Service REST API alpha | A | Senior Eng |
| G5 | Bulk Export module (CSV/JSON/HackerRank) | A | Frontend Eng |
| G6 | First 5K questions validated | A | SME Lead + AI pipeline |
| G7 | IRT calibration pipeline | A | I/O Psych contractor |
| G8 | 20+ programming languages active | A | Senior Eng |
| G9 | Anti-leak engine v0 | A | Senior Eng |
| G10 | Admin web app (Next.js) | A | Frontend Eng |
| G-DEPLOY | Production deploy of ReadyBank API | B (with CEO sign-off on go-live) | CTO |

## §6.2 Sales & Customer Success — Mix; Part C dominates marquee deals

| Task ID | Task | Part | Owner |
|---|---|---|---|
| H1 | Talpro Customer Zero live (100+ candidates) | C (operational); A monitors | CTO + Talpro Delivery |
| H2 | First 3 Recruiter logos signed | C (sales calls); A drafts emails | CEO + AE |
| H3 | Bosch discovery call held | C | CEO + CTO |
| H4 | Sample 50-question pack delivered to Bosch | A produces; C delivers | CTO drafts; CEO sends |
| H5 | Bosch scoping conversation | C | CEO + AE |
| H6 | 5 total logos signed by end of Phase 1 | C (deals); A drafts contracts | CEO + AE + Bali |

## §6.3 Hiring — Sequenced Part C with A drafting support

| Task ID | Task | Part | Owner |
|---|---|---|---|
| I1 | Senior Engineer hired + onboarded | C | CEO |
| I2 | SME Content Lead hired + onboarded | C | CEO |
| I3 | AE Enterprise hired + onboarded | C | CEO |
| I4 | BD Platforms hired + onboarded | C | CEO |
| I5 | I/O Psych contractor engaged | C | CTO + CEO |
| I6 | Frontend Engineer hired (accelerated) | C | CEO + CTO |

## §6.4 Quality Gate — All Part A (CTO Office runs Gatekeeper)

| Task ID | Task | Part | Owner |
|---|---|---|---|
| J1 | First Gatekeeper internal staging run | A | CTO/Gatekeeper |
| J2 | First customer-facing Gatekeeper 92-pt pass | A | CTO/Gatekeeper |
| J3 | IRT auto-fail check passing | A | CTO/Gatekeeper |
| J4 | 24-hour anti-leak rotation operational | A | CTO/CDO |
| J5 | Monthly metrics close ritual | A | CTO Office |
| J6 | Weekly Friday engineering review | A | CTO |
| J7 | Weekly Monday CEO+CTO 1:1 | C | CEO + CTO |
| J8 | M3 IdeaForge re-gate | A | CTO/IdeaForge |

## §6.5 Phase 1 Summary

| Classification | Count | % |
|---|---|---|
| Part A | ~25 tasks | ~60% |
| Part B | ~3 tasks | ~7% |
| Part C | ~14 tasks | ~33% |

Phase 1 is more autonomous than Phase 0 because most engineering work is Part A. The CEO load shifts from setup logistics to sales execution.

---

# §7. PROGRESS TRACKING SYSTEM

## §7.1 The Progress Bar

Every workstream gets a progress bar. Progress bars are computed as `done / total` weighted by complexity (simple = 1; medium = 2; complex = 4).

```
PHASE 0 — Foundation                       [████████░░░░░░░░░░░░] 40% (12 of 30)
  §A Capital & Legal                       [██████░░░░░░░░░░░░░░] 30% ( 3 of 10)
  §B Infrastructure                        [████████████░░░░░░░░] 60% ( 9 of 15)
  §C People & Hiring                       [████░░░░░░░░░░░░░░░░] 20% ( 2 of 10)
  §D Customer Zero                         [████████░░░░░░░░░░░░] 40% ( 2 of 5)
  §E Bosch GCC Outreach                    [████░░░░░░░░░░░░░░░░] 20% ( 1 of 5)
```

## §7.2 The Live Progress Tracker File

`IMPLEMENTATION-PROGRESS-TRACKER.md` is the live dashboard. It is updated by the CTO Office at:
- Start of every work session (read current state)
- End of every Part A task (mark ✅)
- End of every Part B task (CEO confirms, CTO marks ✅)
- End of every Part C task (CEO sends evidence, CTO verifies, marks ✅)

The CEO opens this file as the daily-driver to see "where are we?"

## §7.3 Status Definitions

- ✅ **Done** — task complete; evidence captured
- 🔄 **In Progress** — actively being worked on
- ⏳ **Queued** — waiting to start (dependencies met)
- 🚫 **Blocked** — waiting on Part B/C action; dependencies unmet
- ❌ **Failed** — task attempted, gate failed; remediation queued
- ⏸ **Paused** — explicitly paused by CEO/CTO

## §7.4 Reporting Cadence

- **Per-session:** CTO Office posts session-end summary with delta progress
- **Daily (auto):** Live Progress Tracker file is refreshed with current bars
- **Weekly Monday:** Strategic 1:1 reviews progress + blockers
- **Phase Gates:** IdeaForge re-gate produces formal scorecard

---

# §8. THE AFTER-EACH-TASK MESSAGE PATTERN

Whenever a task completes, the CTO Office produces a 3-line message in this exact format:

```
✅ DONE: [task name]   |   ⏱ [duration]   |   📊 Progress: [bar + %]

📝 Evidence: [link or summary]

➡️  NEXT for YOU: [Part B or C task name]
   📍 Where: [Browser tab / Phone / Banking app / Email / Terminal / etc.]
   ⏰ When: [now / by Day X / by Phase X]
   🔗 Action card: [filename or section]
```

If the next task is Part A (no CEO action needed), the message is:

```
✅ DONE: [task name]   |   ⏱ [duration]   |   📊 Progress: [bar + %]

➡️  NEXT for ME (Part A): [next task]   |   ⏰ ETA: [duration]
   You can ignore until I check back.
```

The CEO never has to ask "what's next?" — the message tells them.

---

# §9. PHASE GATE AUTO-TRIGGER

When all Phase X pass criteria are met:

1. CTO Office runs IdeaForge re-gate (full 24-pt scorecard with evidence per dimension)
2. If ≥20/24: CTO Office posts:
   ```
   🎯 PHASE GATE M[3/6/9/12] PASSED — IdeaForge score [X]/24

   📊 Phase X complete. Phase X+1 begins now.

   ➡️  Phase X+1 Part A tasks queued. Phase X+1 Part B/C action cards released to you.
   ```
3. If <20/24: CTO Office posts dimension scores + blockers + recommendation; PAUSES Part A advancement; requests CEO direction
4. CEO can override a fail with documented reasoning per Constitution Article XI §11.3

The CEO is informed; the CEO does not have to "approve" a Phase advance unless the gate failed.

---

# §10. TODAY'S NEXT ACTION (LIVE)

This section is the **current entry point** for the CEO. After reading this strategy doc, the CEO does ONE thing right now. The CTO Office does the rest.

## §10.1 Right Now — Today (Day 0)

Three Part C cards are OPEN for you. They are in dependency order — start with CC-01.

### CC-01 — Open the QOrium ringfenced bank account or budget line

**One-sentence what:** Decide whether QOrium gets its own bank account OR a tagged sub-budget under Talpro Universe; create whichever you choose.

**Where:** Your banking app (or call your CFO)

**When:** Today (Day 0–3)

**Why:** Without a ringfenced account, the ₹50L envelope is conceptual — every other Phase 0 task depends on this being real money in a real account.

**How (5 steps max):**
1. Decide: separate account OR Talpro Universe sub-budget?
2. If separate: open via your existing bank's online portal (most banks support same-day)
3. If sub-budget: ask CFO to tag a sub-account "QORIUM" with ₹50L allocated
4. Get the account number / budget reference number
5. Send back to CTO Office

**Evidence-back to CTO:**
"Account opened/tagged. Account ref: [number]. Available balance: ₹50L."

### CC-02 — Engage IP counsel for trademark + MSA + DPA prep

**One-sentence what:** Phone or email an IP/commercial lawyer to engage them for QOrium IP filings (trademark India+US) and contract templates (MSA + DPA).

**Where:** Phone or email — your existing legal counsel relationship if any, or new

**When:** Day 0–7

**Why:** Trademark must be filed before public launch (protects "QOrium" name + SKU names). MSA + DPA are blockers for ANY enterprise contract (Bosch GCC needs them).

**How (5 steps max):**
1. If you have existing counsel for Talpro Universe: extend their engagement to cover QOrium
2. If not: pick a Bengaluru/Mumbai IP firm with Class 9 + 42 software trademark experience
3. Send a one-paragraph engagement email (CTO Office can draft if you say so)
4. Sign their engagement letter when sent
5. Send back to CTO Office

**Evidence-back to CTO:**
"IP counsel engaged. Firm: [name]. Engagement letter signed [date]."

### CC-03 — Brief Talpro India Delivery Head on Customer Zero scope

**One-sentence what:** Have a 15-minute call with the Talpro India Delivery Head explaining QOrium Customer Zero scope (top 5 roles, 100+ candidates by M3, weekly feedback loop).

**Where:** WhatsApp call or in-person

**When:** Day 0–3

**Why:** Customer Zero is non-negotiable per Constitution SO-1. Without Delivery Head buy-in, Talpro candidate flow doesn't switch to QOrium.

**How (5 steps max):**
1. Schedule 15-min call with Delivery Head this week
2. Walk through: "QOrium will replace our default assessment platform for top 5 roles starting Month 1"
3. Get their list of top 5 roles (likely Senior Java, React, SQL/Data, DevOps, Salesforce)
4. Get verbal commitment to weekly feedback channel (Slack)
5. Send back to CTO Office

**Evidence-back to CTO:**
"Talpro Delivery Head briefed [date]. Top 5 roles: [list]. Weekly feedback channel agreed."

## §10.2 What I'm Doing Right Now (Part A — In Background)

While you handle CC-01 through CC-03, I am autonomously working on:

- **A6** — MSA template draft (will hand to your IP counsel for review)
- **A7** — DPA template draft (DPDPA + GDPR compliant)
- **C1** — Senior Engineer JD drafted
- **C2** — SME Content Lead JD drafted
- **C7** — Compensation philosophy + bands
- **C8** — Standard offer letter template
- **D2** — Talpro JD analysis (when you provide the 5 JDs from CC-03)
- **E1** — Bosch GCC warm-intro email draft (will go to CC-01 OPEN list once ready)
- **E2** — Bosch GCC stack research

I'll update the Progress Tracker as I complete each one. You'll see steady progress without lifting a finger.

## §10.3 What's Coming Next for You

Once you complete CC-01 + CC-02 + CC-03, the next batch of cards (Day 3–7) will release:

- **CC-04:** Domain registration via Hostinger (Part B browser walk-through)
- **CC-05:** GitHub organization creation (Part B browser walk-through)
- **CC-06:** AI API keys procurement (Part B — Anthropic + OpenAI + Gemini consoles)
- **CC-07:** Send Bosch GCC warm-intro email (Part C — using CTO-drafted text)

You'll see them as they release with full instructions.

---

# §11. THE OPERATING PROMISE

This is what I commit to:

1. **Maximum velocity within constraints.** I never wait for you on tasks I can do myself.
2. **No surprises.** Every action card is released with full context. You always know what's coming.
3. **No hand-holding fatigue.** Instructions are dense, focused, 5 lines max per how-to.
4. **No invisible work.** The Progress Tracker is always current. You can see exactly where I am.
5. **No fiction.** Per Constitution SO-24, every claim I make is backed by a tool call or live source from this session.
6. **Failure is owned.** If a Gatekeeper check fails or a Phase Gate is missed, I own it, document it, queue remediation, and report transparently.

This is what I ask from you:

1. **Send evidence-back when a Part C task completes.** One-line message with the specific evidence the card requested.
2. **Trust auto-mode.** Don't ask "should I review this?" — the Constitution + Phase Gates are the review.
3. **Use the after-each-task message format** when you reply about a Part C card. Three lines max.
4. **Open the Progress Tracker file when you want to know status.** Not "what's the latest?" messages.
5. **Override only when genuinely needed.** Constitutional Override (Article XI §11.3) is for exceptional cases; not "I changed my mind."

---

# §12. APPENDIX — REFERENCE INDEX

**This document:** `/Users/bhaskar_universe/Documents/Claude/Projects/QOrium/IMPLEMENTATION-STRATEGY-v1.0.md`

**Live progress dashboard:** `IMPLEMENTATION-PROGRESS-TRACKER.md`

**Part C action cards:** `CEO-ACTION-CARDS.md`

**Part B browser prompts:** `BROWSER-PROMPTS-LIBRARY.md`

**Phase 0+1 punchlist (source data):** `task_plan_phase0_phase1.md`

**Constitution v2.0 (binding):** `09-QOrium-Constitution-v2.0.md`

**Ratification record:** `CONSTITUTION-RATIFICATION-RECORD-v2.0.md`

---

*End of QOrium Implementation Strategy v1.0. The build proceeds. CTO Office is on. Progress Tracker is live.*

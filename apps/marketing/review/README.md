# QOrium Web Review — Team Feedback Loop

> Sheet + Apps Script that turns the qorium.online site review into a
> 2-way conversation between the team (non-tech) and the CTO Office.
> No Claude account required for the team. Per CTO call, this is the
> Tier-1 manual-CTO-triage workflow; AI auto-draft is Tier-2 (cred-bound,
> deferred).

## What you (CEO) ship to the team

A single Google Sheet URL. Each team-member opens it, finds an empty
row for the page they reviewed, fills 6 ratings (1–5) + 3 free-text
columns. They click outside the cell. Done.

## What happens next (automated)

1. **Reviewer hits enter** → Apps Script fires.
2. **CTO gets an email** within 30 seconds with the full row, link to
   the page, link to the row in the sheet.
3. **CTO triages** in the sheet itself: writes a "CTO Response" + sets
   Status to one of: `In Review` · `Done` · `Won't Fix` · `Needs
   Discussion`.
4. **Reviewer gets an auto-reply email** with CTO's response + linked
   PR/commit (if any).
5. Reviewer can re-rate after the change.

The team **never needs Claude access**. They use only the sheet. The
CTO carries the AI-assist context in their own Claude window during
triage.

---

## Setup (CEO does this once, ~10 minutes)

### Step 1 — Create the Google Sheet

1. Open https://sheets.new (creates a fresh blank Google Sheet)
2. Rename it to **"QOrium Web Review — 2026-05-09"** (any name works)

### Step 2 — Import the page list

1. **File → Import**
2. Click **Upload** tab → drag in `qorium-web-review-template.csv`
   (this folder)
3. Import location: **Replace current sheet**
4. Separator: **Detect automatically** (will pick comma)
5. Convert text to numbers/dates: **Yes**
6. Click **Import data**

Result: the sheet now has 24 rows, one per page on qorium.online,
with all the rating + feedback columns ready to fill.

### Step 3 — Rename the tab

1. Right-click the tab at the bottom (probably says "Sheet1")
2. **Rename** → type **`Reviews`** (case-sensitive, no quotes)

### Step 4 — Open the Apps Script editor

1. Top menu: **Extensions → Apps Script**
2. A new tab opens with a code editor
3. Delete any default `function myFunction() {}` already there
4. Open `feedback-loop.gs` (this folder), copy the entire file
5. Paste into the Apps Script editor
6. Click the floppy/save icon (top left) → name the project
   "QOrium Review Bot"

### Step 5 — Set the CTO email

1. In the Apps Script editor, left sidebar → **Project Settings**
   (the gear icon at the very bottom)
2. Scroll to **Script Properties** → **Add script property**
3. Add these:

| Property | Value |
|---|---|
| `CTO_EMAIL` | the email that should get review notifications, e.g. `ceo@qorium.online` |
| `CTO_NAME` | (optional) e.g. `CTO Office` or `Bhaskar` |
| `SHEET_TAB_NAME` | `Reviews` (only if you renamed the tab differently in Step 3) |

4. Click **Save script properties**

### Step 6 — Install the trigger

1. Back to the **Editor** view (left sidebar, `<>` icon)
2. At the top, find the function dropdown (probably says
   `onEditHandler`)
3. Change it to `installOnEditTrigger`
4. Click the **▶ Run** button
5. Google will pop up an authorization screen:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to QOrium Review Bot (unsafe)** —
     this is normal for personal Apps Scripts; Google flags any
     script that hasn't been verified
   - Click **Allow** to grant Gmail send + Sheets read/write
6. The script runs and pops up: *"QOrium Review Bot trigger installed.
   CTO will receive an email on every new submission..."*
7. Click **OK**

### Step 7 — Share the sheet with the team

1. Back to the Google Sheet tab
2. Top right → **Share** button
3. Add the team's email addresses (or share a "anyone with the link"
   link if your team uses non-Google email)
4. Permission: **Editor** (they need to write into the sheet)
5. Send

### Step 8 — Test it

1. Open the sheet yourself (in another browser tab, signed in as a
   team member would be)
2. Pick row 1 (Homepage) → fill:
   - Reviewer Name: Test Reviewer
   - Visual Design: 4
   - Overall: 4
   - What Worked: "Hero looks clean"
3. Click anywhere outside the cell
4. Wait 30-60 seconds
5. Check the CTO_EMAIL inbox → there should be an email subject:
   `[QOrium Review] Homepage — Test Reviewer — 4/5`
6. If yes ✓ — setup complete. Delete the test row content and ship
   the sheet URL to the team.

---

## How the team uses it (send them this)

> Hi team,
>
> qorium.online v2 is live. Please review every page and give us your
> honest take. Sheet here: **[insert sheet URL]**
>
> For each page:
>
> 1. Open the page (column **Page URL**) in a new tab
> 2. Spend ~3 minutes on it — desktop AND mobile
> 3. Fill the 6 rating columns (1 = poor, 5 = excellent):
>    - **Visual Design** — does it look polished, premium, professional?
>    - **Copy Clarity** — does the writing make sense in 10 seconds?
>    - **Speed/Performance** — does it load fast, scroll smooth?
>    - **Mobile Experience** — does it work on your phone?
>    - **Trust/Credibility** — would you trust this brand with your hiring?
>    - **Conversion Clarity** — would you know what to do next (book demo, etc.)?
> 4. Fill **Overall** (your gut score)
> 5. Three free-text columns:
>    - **What Worked** — be specific (e.g. "the Globe on /platforms is wow")
>    - **What Didn't Work** — be specific (e.g. "the FAQ accordion looks broken on Safari")
>    - **Specific Change Requested** — what would you change? (one line is fine)
> 6. Add your **name** in the Reviewer Name column. Optional: your role.
> 7. **Don't touch** the columns: Status, CTO Response, Linked PR/Commit,
>    Resolved On — that's CTO's column.
>
> Within ~24h you'll get an email with the CTO's response. If they
> shipped your change, they'll link the commit. If they didn't, they'll
> tell you why.
>
> No Claude account needed. The sheet is the chat. Reply by editing
> the row.
>
> — CEO

---

## CTO triage workflow (what you do when an email lands)

1. Email arrives: `[QOrium Review] <page> — <reviewer> — <rating>/5`
2. Click the link in the email body — opens the row in the sheet
3. Read **What Didn't Work** + **Specific Change Requested**
4. Decide:
   - **Quick win (< 30 min)** — fix it, push commit, fill **Linked
     PR/Commit** with the URL, set **Status = Done**, write 1-line
     **CTO Response** ("Fixed in commit abc123, refresh the page")
   - **Real work (> 30 min)** — set **Status = In Review**, write
     "Acknowledged, scheduling for [sprint]" — circle back when shipped
   - **Won't fix** — set **Status = Won't Fix**, write a 2-line
     explanation (e.g. "we keep this on purpose because [reason]")
   - **Needs founder input** — set **Status = Needs Discussion**, ping
     the CEO directly
5. As soon as you fill **CTO Response** AND set **Status = Done** (or
   Won't Fix), the script auto-emails the reviewer. Reviewer can
   re-rate.

**Optional Claude assist (CTO-side, doesn't touch the team):** for any
non-trivial change request, paste the row contents into your own Claude
window with the page's source code from `apps/marketing/src/app/...`.
Claude drafts the change. You review + push. This is what was
originally proposed as Tier-2 auto-draft inside the Apps Script —
deferred because:

- Apps Script → Claude API needs `ANTHROPIC_API_KEY` dropped into
  Script Properties
- Per-row cost (each feedback hit = 1 Claude call)
- AI-drafted responses going to customers without a human gate is a
  founder-discipline + brand risk

When cred-drop happens (per the broader project's `human.cred-drop`
tile), uncomment the stub in `feedback-loop.gs` (left as a TODO at the
bottom — currently absent so no API call ever fires) and the loop
upgrades automatically.

---

## What's in this folder

| File | Purpose |
|---|---|
| `qorium-web-review-template.csv` | The pre-filled sheet — one row per public page on qorium.online |
| `feedback-loop.gs` | The Apps Script that wires the email loop |
| `README.md` | This file |

---

## Reset / re-deploy

If you need to start over (e.g. blow away test data, update the script):

- **Update the script:** Apps Script editor → paste new `feedback-loop.gs`
  contents → save → run `installOnEditTrigger` again (it removes the
  old trigger and creates a fresh one)
- **Reset all data:** select rows 2-25 in the sheet → delete contents
  (do NOT delete the rows; the script reads from the same range)
- **Audit Script Properties:** in Apps Script editor, run the
  `showConfig` function from the dropdown — it pops up the current
  config (with `ANTHROPIC_API_KEY` redacted)

---

## CTO Authority Note

Per the founder's "CTO is king" framing: this workflow has the CTO as
the SOLE writer to the four right-side columns (Status, CTO Response,
Linked PR/Commit, Resolved On). If the team accidentally writes there,
the script doesn't process those edits — only the CTO email gets
notified. CTO can revert via Sheets' built-in version history
(File → Version history) at any time.

— CTO Office, 2026-05-09

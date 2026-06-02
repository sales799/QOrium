# QOrium Browser Prompts Library

**Purpose:** Every Part B task has a ready-to-paste Claude in Chrome prompt. You log in to the relevant service; you paste the prompt; Claude in Chrome takes over.
**How to use:** Open the relevant Part B task. Read the pre-conditions. Log into the service in your browser. Open Claude in Chrome on that tab. Paste the prompt between `---PROMPT START---` and `---PROMPT END---`. Watch Claude work; intervene only when the prompt asks you to confirm.

---

## BP-01 — Domain Registration via Hostinger

**Service:** Hostinger (your existing VPS provider — same panel does domains)
**Pre-conditions:**
- You are logged into hostinger.com / hpanel
- QOrium ringfenced account or budget is approved (CC-01 done)
- You have a payment method on file (or ready to enter it manually)

**Open Claude in Chrome on the Hostinger panel tab.**

**Paste:**

---PROMPT START---
You are helping me register two domains for the QOrium venture: `qorium.online` and `qorium.in`.

I am on the Hostinger hPanel dashboard. Walk me through this step by step:

1. Navigate to the "Domains" section in the left nav (or search "register domain" in the top bar)
2. Search for `qorium.online` — confirm availability
3. If available, add to cart at the standard 1-year registration price
4. Search for `qorium.in` — confirm availability
5. If available, add to cart at the standard 1-year registration price
6. Verify the cart shows BOTH domains and the total
7. **PAUSE before proceeding to payment.** Tell me the exact total and ask me to confirm "GO" before clicking checkout
8. After I confirm "GO", proceed through checkout
9. **PAUSE again before final payment confirmation.** Show me the order summary and ask me to confirm "PAY" before clicking the final pay button
10. After payment confirms, capture the order ID + invoice number
11. Navigate to "My Domains" and confirm both domains appear with status "Active"
12. Take a screenshot of the domain list

If `qorium.online` is taken: alert me; ask whether to try `qorium.com` or `qorium.tech` as fallback. Do NOT proceed without my decision.

If `qorium.in` is taken: alert me; ask whether to try `qorium.co.in` as fallback.

If anything else looks unusual (price spike, captcha, account verification): pause and tell me.

When done, give me:
- Order ID
- Total paid
- Both domain names registered
- Renewal date
---PROMPT END---

**Evidence to capture:**
- Order ID
- Screenshot of "My Domains" list showing both domains active

**Post-completion message to CTO:**
> "✅ BP-01 done. Domains registered: qorium.online, qorium.in. Order ID: [paste]. Total: ₹[paste]. Renewal: [date]."

---

## BP-02 — GitHub Organization + Initial Repository

**Service:** github.com
**Pre-conditions:**
- You are logged into GitHub with your Talpro Universe account (or create one new for QOrium)
- You have decided whether to create a new GitHub Organization OR use a personal/Talpro org

**Open Claude in Chrome on github.com.**

**Paste:**

---PROMPT START---
You are helping me set up the QOrium engineering codebase on GitHub.

Step 1 — Create the organization:
1. Click "+" top right → "New organization"
2. Choose the FREE plan to start (we can upgrade later)
3. Organization name: `qorium-io` (lowercase, hyphenated)
4. Contact email: my Talpro Universe email
5. Continue through the setup screens; do NOT invite members yet
6. Confirm I'm on the new organization's homepage

Step 2 — Create the first repository:
1. Click "New repository"
2. Repository name: `qorium-monorepo`
3. Description: "QOrium Question-Bank-as-a-Service — monorepo for ReadyBank, JD-Forge, Stack-Vault services + admin web app"
4. Set to **Private**
5. Initialize with: README only (no .gitignore yet, no license yet — we'll add via PR)
6. Create repository

Step 3 — Configure branch protection on main:
1. Repository → Settings → Branches
2. Add branch protection rule for `main`
3. Enable: "Require a pull request before merging"
4. Enable: "Require status checks to pass before merging" (we'll add CI checks later)
5. Enable: "Require conversation resolution before merging"
6. Enable: "Do not allow bypassing the above settings"
7. **PAUSE before saving.** Show me the rule summary; ask me to confirm "GO"
8. After I confirm, save

Step 4 — Generate a personal access token (for CTO to use in CI/CD):
1. Top right avatar → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Note: "QOrium CI/CD"
4. Expiration: 90 days
5. Scopes: `repo` (full), `workflow`, `admin:org` (read only is fine)
6. Generate token
7. **PAUSE.** Copy the token to a secure note IMMEDIATELY (it shows only once)
8. Confirm copied to me

When done, tell me:
- Organization URL
- Repository URL
- Branch protection rule active: yes/no
- Personal access token captured: yes/no (do NOT echo the token to me — just confirm capture)
---PROMPT END---

**Evidence to capture:**
- Organization URL
- Repository URL
- Personal Access Token (stored in your password manager — do NOT share it with anyone, including me)

**Post-completion message to CTO:**
> "✅ BP-02 done. Org: github.com/qorium-io. Repo: github.com/qorium-io/qorium-monorepo. Branch protection active. PAT generated and stored securely in [1Password / Bitwarden / etc.]."

---

## BP-03 — AI API Keys Procurement (Anthropic + OpenAI + Gemini + Serper.dev)

**Service:** Multi-tab — Anthropic console, OpenAI platform, Google AI Studio, Serper.dev
**Pre-conditions:**
- You have accounts on each of these platforms (create if not — Claude in Chrome can guide that too)
- You have a payment method ready (corporate card preferred)
- ₹50L envelope is approved (CC-01 done) so you can budget ~₹3-5L/month for AI tokens

**Open Claude in Chrome on a fresh tab. Open all 4 services in separate tabs.**

**Paste:**

---PROMPT START---
You are helping me procure four API keys for the QOrium AI pipeline. Work through them sequentially. Each key has a budget alert configured.

Tab 1 — Anthropic (console.anthropic.com):
1. Sign in to my Anthropic account; if no account, walk me through creating one (use my Talpro Universe email)
2. Navigate to Settings → API Keys
3. Create new key. Name: `qorium-prod`
4. Copy key to my password manager (do NOT echo to chat)
5. Navigate to Billing → Usage limits
6. Set monthly spend limit: $2,000 USD (~₹1.7L)
7. Set notification threshold: 50%, 75%, 90%
8. **PAUSE.** Confirm with me before saving the limits.

Tab 2 — OpenAI (platform.openai.com):
1. Sign in; if no account, walk me through (use Talpro Universe email)
2. Settings → API keys → Create new secret key
3. Name: `qorium-prod`
4. Copy key to my password manager
5. Settings → Billing → Usage limits
6. Set monthly hard limit: $1,000 USD
7. Set monthly soft limit notifications: $500
8. **PAUSE.** Confirm with me before saving.

Tab 3 — Google AI Studio (aistudio.google.com):
1. Sign in with Google account; if no account, walk me through
2. Get API key
3. Copy to my password manager (Google's API keys don't have native budget alerts; we'll monitor via GCP console if usage scales)
4. Note: Google Gemini Pro is a fallback / specific-task provider; lower priority budget

Tab 4 — Serper.dev (serper.dev):
1. Sign in or sign up (Google sign-in works)
2. Dashboard → API Key
3. Copy to my password manager
4. Free tier covers 2,500 searches/month — this is enough for Phase 0–1 anti-leak crawl
5. We'll upgrade to paid (~₹5K/month for 100K searches) when anti-leak engine v0 ships in M3

For each key:
- DO NOT echo any API key to chat
- Confirm "key captured" only

After all four keys captured, tell me:
- Anthropic key: captured / budget set to $2K/mo
- OpenAI key: captured / budget set to $1K/mo
- Google AI key: captured / monitoring via GCP
- Serper.dev key: captured / free tier active
---PROMPT END---

**Evidence to capture:**
- All 4 API keys (in your password manager — never send to anyone, including the CTO Office in chat)
- Budget limits configured: Anthropic $2K/mo, OpenAI $1K/mo

**Post-completion message to CTO:**
> "✅ BP-03 done. 4 API keys captured in [password manager]. Budgets set: Anthropic $2K/mo, OpenAI $1K/mo, Gemini monitored, Serper.dev free tier. Ready for CTO to integrate via env vars."

---

## BP-04 — Cloudflare R2 Bucket (Object Storage)

**Service:** dash.cloudflare.com
**Pre-conditions:**
- Cloudflare account exists (or create — guide in prompt)
- Payment method on file (R2 free tier is generous; pay-as-you-go beyond)

**Open Claude in Chrome on dash.cloudflare.com.**

**Paste:**

---PROMPT START---
You are helping me set up Cloudflare R2 object storage for QOrium.

1. Sign into Cloudflare; if no account, walk me through signup with my Talpro Universe email
2. Navigate to "R2" in the left nav (under "Storage" or its own section)
3. Click "Create bucket"
4. Bucket name: `qorium-prod`
5. Location hint: "Asia Pacific" (closest to India where most QOrium data + customers live)
6. Default storage class: Standard
7. Create bucket
8. **PAUSE.** Confirm bucket created; show me the bucket URL.
9. Create a second bucket: `qorium-staging` (same settings)
10. Create a third bucket: `qorium-backups` (same settings)
11. Navigate to R2 → API tokens
12. Create new API token. Name: `qorium-prod-r2-rw`
13. Permissions: Object Read & Write
14. Specify bucket: ALL (for now; we'll restrict later)
15. TTL: forever (we'll rotate quarterly per Constitution SO-15)
16. **PAUSE.** Generate token and copy to my password manager.
17. Confirm token captured (do NOT echo to chat).

When done, tell me:
- 3 buckets created: qorium-prod, qorium-staging, qorium-backups
- API token captured
- Estimated monthly cost projection (for transparency)
---PROMPT END---

**Evidence to capture:**
- Bucket names + URLs
- API token (in password manager)

**Post-completion message to CTO:**
> "✅ BP-04 done. R2 buckets: qorium-prod, qorium-staging, qorium-backups. API token captured. Region: APAC."

---

## BP-05 — DNS Records on Hostinger (after BP-01)

**Service:** Hostinger hPanel → Domains → DNS
**Pre-conditions:**
- BP-01 complete (qorium.online owned)
- VPS IP address known (from CTO Office — provided in the prompt)

**Open Claude in Chrome on hPanel after navigating to qorium.online DNS settings.**

**Paste:**

---PROMPT START---
You are helping me configure DNS records for qorium.online. Add the following records in the Hostinger DNS Zone editor:

A records (replace [VPS_IP] with the IP I'll provide separately — ask me for it before adding):
- `@` (root) → [VPS_IP]
- `app` → [VPS_IP]
- `api` → [VPS_IP]
- `admin` → [VPS_IP]
- `partners` → [VPS_IP]
- `staging` → [VPS_IP]

CNAME records:
- `www` → @ (or qorium.online)

MX records:
- (skip for now; we'll set up email later via Google Workspace or Zoho)

TTL for all records: 3600 seconds (1 hour) — we want to be able to change quickly during Phase 0

For each record:
1. Click "Add record"
2. Fill in the type, name, value
3. Set TTL to 3600
4. Save

After all 7 records added (6 A + 1 CNAME):
1. **PAUSE** and show me the full DNS zone listing
2. Ask me to confirm "GO" before any further action

When confirmed, propagate the DNS (Hostinger usually auto-propagates within 5-15 minutes).

Verify by:
1. Open a new tab, run `nslookup api.qorium.online` (use a public DNS lookup tool like dnschecker.org)
2. Confirm it resolves to the VPS IP

If anything fails: pause and report.

When done, tell me:
- All 7 records added
- DNS verification successful (or pending propagation, with ETA)
---PROMPT END---

**Evidence to capture:**
- Screenshot of full DNS zone listing
- nslookup confirmation for at least one subdomain

**Post-completion message to CTO:**
> "✅ BP-05 done. DNS records for qorium.online configured (6 A + 1 CNAME). Propagation confirmed via dnschecker.org. VPS IP: [redacted but confirmed]."

---

## BP-06 — LinkedIn + Naukri JD Posting (C1 Senior Engineer + C2 SME Content Lead)

**Service:** linkedin.com (Recruiter or Standard) + naukri.com
**Pre-conditions:**
- C1 (Senior Engineer JD) and C2 (SME Content Lead JD) are open in separate tabs for copy-paste
- LinkedIn Recruiter or Job Slot available; Naukri.com Recruiter account active
- You are logged into both platforms

**Open Claude in Chrome on linkedin.com (with the JD files open in separate tabs for reference).**

**Paste:**

---PROMPT START---
You are helping me post two job descriptions for QOrium (a new B2B Question-Bank-as-a-Service venture). I will paste the JD text into the JD field; you handle navigation, role-fields, and budget choices.

For each posting (do C1 first, then C2):

Step 1: Click "Post a job" or navigate to LinkedIn Jobs > Post a job.
Step 2: Set Job Title:
  - For C1: "Senior Engineer — Content Engine + ReadyBank Service (QOrium)"
  - For C2: "SME Content Lead — Technical Question Authoring (QOrium)"
Step 3: Set Company. If "QOrium" company page exists, select it. If not, select my personal profile and we'll add company tag in description.
Step 4: Set Workplace type = "Hybrid"; Job type = "Full-time"; Experience level:
  - C1: "Mid-Senior level"
  - C2: "Director" (signals seniority for SME Lead with 7+ yrs)
Step 5: Set Job Location = "Bengaluru, Karnataka, India" with "Remote-India OK" in description.
Step 6: PAUSE here — ask me to paste the full JD body into the description field. I will paste from the .md file.
Step 7: After I paste, set Skills (8-10 skills per JD). For C1: Node.js, TypeScript, PostgreSQL, Redis, Next.js, REST API design, Distributed systems, IRT/psychometrics-aware (nice-to-have), Test-driven development, AWS or GCP fundamentals. For C2: Technical question authoring, Item response theory (IRT), Test development, Rubric design, SME network management, Editorial workflow, AI-assisted content review, Quality assurance, Bengaluru NIT/IIT alumni network.
Step 8: Salary — DO NOT enter specific numbers. Choose "Don't show salary" or use ranges. We negotiate in interview Round 2.
Step 9: PAUSE — ask me to confirm before clicking "Promote job" or "Post job". DO NOT click any "Promote" / "Pay" button without my explicit "go" confirmation.
Step 10: After post — capture the job URL. Send back to me.

Then repeat for Naukri:
Step 11: Switch to Naukri tab.
Step 12: Click "Post a Job" — Naukri's flow is different but similar fields apply. Mirror the LinkedIn settings.
Step 13: PAUSE before any payment-required upgrades. Naukri free post is fine for v1; pay only if I confirm.
Step 14: Capture the Naukri job ID.

End of prompt. Send me both job URLs + job IDs when done.
---PROMPT END---

**What Claude in Chrome will do:** navigate posting flow, fill non-sensitive fields, pause for paste of JD body, pause before any pay/promote button.

**Where to pause for your confirmation:**
- Before pasting JD body (Claude asks you to paste from .md)
- Before "Promote job" / "Pay" button (always)

**Evidence to capture:**
- LinkedIn job URL × 2 (one per JD)
- Naukri job ID × 2

**Post-completion message to CTO:**
> "✅ BP-06 done. C1 LinkedIn URL: [...]. C1 Naukri ID: [...]. C2 LinkedIn URL: [...]. C2 Naukri ID: [...]."

**Notes:**
- Day 14 release: same flow for C3 (AE Enterprise) + C4 (BD Platforms) JDs.
- Talpro alumni network posting: separate channel; CTO will draft an email-blast for Bhaskar to send manually (not BP-06).

---

## BROWSER PROMPT TEMPLATE (for new Part B tasks)

When CTO Office creates a new Part B task, the prompt follows this template:

```
## BP-XX — [Task name]

**Service:** [URL or service]
**Pre-conditions:**
- [List]

**Open Claude in Chrome on [tab].**

**Paste:**

---PROMPT START---
[The actual prompt — clear, sequential, with explicit PAUSE points before any irreversible action]
---PROMPT END---

**Evidence to capture:**
- [List]

**Post-completion message to CTO:**
> "✅ BP-XX done. [Evidence]"
```

---

## SECURITY DISCIPLINE FOR ALL BROWSER PROMPTS

1. **Never paste credentials into the chat with Claude in Chrome.** Claude can navigate; you log in.
2. **Never echo API keys or tokens to chat.** Confirm "captured" only.
3. **Always pause before payment / irreversible action.** Every BP prompt has explicit PAUSE points.
4. **Capture evidence in your password manager or secure notes.** Not in shared docs.
5. **If a prompt asks you for something the BP didn't anticipate** (CAPTCHA, MFA prompt, unfamiliar verification): pause and tell me before continuing.

---

*End of Browser Prompts Library v1.0 (updated with BP-06). New BPs added as Part B tasks emerge. CTO Office maintains this library.*

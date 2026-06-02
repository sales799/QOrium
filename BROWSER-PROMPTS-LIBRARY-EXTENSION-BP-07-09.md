# Browser Prompts Library — BP-07 / BP-08 / BP-09

**Status:** v1 extension to `BROWSER-PROMPTS-LIBRARY.md`. Three new BPs covering the next-up Phase 0 Part B services that aren't yet in the library: Razorpay merchant account, MSG91 OTP service, and Resend transactional email.
**Author:** CTO Office · Run #12-Bali completion · 2026-05-03
**Pairs with:** Master Browser Prompts Library (BP-01 through BP-06)

---

## BP-07 — Razorpay Merchant Account Setup

**Service:** razorpay.com / dashboard.razorpay.com
**Pre-conditions:**
- You have CC-01 done (QOrium ringfenced account or sub-budget with bank reference)
- You have your business documents ready (PAN, GST, current account proof, board resolution if applicable)
- Talpro India Pvt Ltd is the legal entity (per Memory: Talpro Single Entity)

**Open Claude in Chrome on dashboard.razorpay.com.**

**Paste:**

---PROMPT START---
You are helping me set up a Razorpay merchant account for QOrium (a product line of Talpro India Pvt Ltd).

Step 1 — Account creation (if not exists):
1. Sign up with my Talpro India email (corporate email preferred)
2. Choose business type: "Private Limited Company"
3. Legal entity name: "Talpro India Pvt Ltd"
4. Business name (DBA): "QOrium" (this is the brand customers see)
5. Continue to KYC

Step 2 — KYC document upload (PAUSE before submitting):
1. PAN card (Talpro India entity-level)
2. Certificate of Incorporation
3. Current account proof (statement or cancelled cheque)
4. GST registration certificate (if applicable)
5. Authorized signatory ID + address proof
6. PAUSE before clicking "Submit for verification" — show me each uploaded doc + ask me to confirm "GO"

Step 3 — Settlement account setup:
1. Add the QOrium ringfenced account from CC-01 as the settlement destination
2. Settlement schedule: T+2 (default; confirm with me)
3. Test the bank account verification (Razorpay sends a small amount; auto-verifies)
4. Confirm settlement account verified

Step 4 — Webhook + API key setup:
1. Settings → API Keys → Generate Live Mode keys (after KYC approval; may take 1-3 days)
2. Note: Live keys won't activate until KYC clears — that's fine; we use Test Mode keys until then
3. Generate Test Mode keys NOW for development
4. Settings → Webhooks → Add webhook URL: `https://api.qorium.online/v1/billing/webhooks/razorpay` (placeholder; we'll update after BP-05 DNS done)
5. Webhook secret: generate strong random; copy to my password manager
6. Subscribe to events: payment.captured, payment.failed, subscription.activated, subscription.charged, subscription.cancelled, refund.processed
7. PAUSE — confirm webhook saved

Step 5 — Subscription plans pre-creation (for ReadyBank Recruiter tier):
1. Plans → Create Plan
2. Plan 1: "QOrium ReadyBank Solo Monthly" — ₹4,999/month, billing cycle monthly, billing_amount 499900 paise
3. Plan 2: "QOrium ReadyBank Team Monthly" — ₹14,999/month, 1499900 paise
4. Plan 3: "QOrium ReadyBank Agency Monthly" — ₹49,999/month, 4999900 paise
5. PAUSE — confirm all 3 plans created
6. Capture each plan_id; copy to my password manager (we'll need them in code)

For each step:
- Do NOT echo any API key or secret to chat
- Confirm "captured" only

When done, tell me:
- KYC submission status: pending / approved / rejected
- Test API keys: captured (yes/no)
- Webhook URL configured: yes/no
- 3 subscription plans: captured (yes/no)
- Settlement account verified: yes/no
---PROMPT END---

**Evidence to capture:**
- Razorpay account ID
- 3 subscription plan IDs (in password manager)
- Webhook secret (in password manager)
- Test mode key + secret (in password manager)
- KYC submission timestamp

**Post-completion message to CTO:**
> "✅ BP-07 done. Razorpay account: [ID]. KYC: [status]. 3 ReadyBank plans created. Test API keys + webhook secret in password manager. Live keys pending KYC."

---

## BP-08 — MSG91 OTP + WhatsApp Business API Setup

**Service:** msg91.com / control.msg91.com
**Pre-conditions:**
- You have CC-01 done (account exists for billing)
- Talpro India entity context (same as Razorpay)
- You have a corporate phone number for OTP sender registration

**Open Claude in Chrome on control.msg91.com.**

**Paste:**

---PROMPT START---
You are helping me set up MSG91 for QOrium's authentication (OTP via SMS) and customer alerts (WhatsApp Business API).

Step 1 — Account creation (if not exists):
1. Sign up with Talpro India email
2. Verify email + mobile
3. Add billing details (account from CC-01)
4. Add ₹5,000 initial wallet balance (covers ~10,000 SMS sends or ~2,500 WhatsApp messages)
5. PAUSE before payment — confirm with me

Step 2 — Sender ID registration (SMS):
1. Sender IDs → Add new
2. Sender ID: "QORIUM" (6 chars; alphanumeric; auto-approved typically same-day)
3. Type: Transactional (we use for OTP only — no promotional)
4. Country: India primary; add international if expanding to US/UK Year 2
5. Submit for approval

Step 3 — DLT registration (Indian regulatory requirement):
1. Templates → Add new template
2. Template 1: OTP SMS — "Your QOrium OTP is {{otp}}. Valid for 10 minutes. Do not share."
3. Template 2: Login alert — "QOrium login from {{location}} at {{time}}. If not you, contact support."
4. Template 3: Payment success — "QOrium subscription activated. Plan: {{plan}}. Next billing: {{date}}."
5. Submit each for DLT approval (TRAI requirement; takes 24-48 hours)

Step 4 — WhatsApp Business API setup:
1. WhatsApp → Connect WhatsApp Business
2. Use the corporate phone number
3. Display name: "QOrium" (must be approved by Meta; takes 1-3 business days)
4. Business profile: Description, website (qorium.online), email
5. Submit for Meta approval

Step 5 — API key generation:
1. API → Generate API key
2. Permissions: SMS send, WhatsApp send, OTP service, balance check
3. Copy key to my password manager
4. Set webhook URL: `https://api.qorium.online/v1/notifications/webhooks/msg91` (placeholder)
5. Set rate limit: 100/min (default)

For each step:
- Do NOT echo API keys to chat
- Confirm "captured" only

When done, tell me:
- MSG91 account ID
- Sender ID "QORIUM": pending/approved
- DLT templates: 3 submitted
- WhatsApp Business: pending Meta approval
- API key: captured (yes/no)
- Wallet balance: ₹5,000 funded
---PROMPT END---

**Evidence to capture:**
- MSG91 account ID
- API key (in password manager)
- DLT template IDs (3 of them)
- WhatsApp Business display name approval status

**Post-completion message to CTO:**
> "✅ BP-08 done. MSG91 account: [ID]. Sender ID QORIUM submitted. 3 DLT templates submitted. WhatsApp Business approval pending Meta. API key captured."

---

## BP-09 — Resend Transactional Email Service

**Service:** resend.com
**Pre-conditions:**
- You have BP-01 done (`qorium.online` domain registered)
- You have access to add DNS records on Hostinger (BP-05 will be done in same flow)

**Open Claude in Chrome on resend.com.**

**Paste:**

---PROMPT START---
You are helping me set up Resend for QOrium transactional email (welcome emails, password resets, customer onboarding sequences, billing receipts, BD outbound from API).

Step 1 — Account creation:
1. Sign up with Talpro India email
2. Confirm email
3. Choose Pro plan ($20/month for 50K emails) — or start Free (3K emails/month) and upgrade after Talpro Customer Zero validates volume
4. PAUSE before payment if Pro — confirm with me

Step 2 — Domain verification:
1. Domains → Add domain
2. Enter "qorium.online"
3. Resend generates 4 DNS records:
   - MX record (for bounce handling)
   - 2 TXT records (DKIM keys)
   - 1 TXT record (SPF or DMARC)
4. PAUSE — show me the 4 DNS records to add

Step 3 — Add DNS records on Hostinger:
1. Open new tab → hostinger.com hPanel → qorium.online DNS Zone editor
2. Add each of the 4 records exactly as Resend provided
3. TTL: 3600 (1 hour) for each
4. Save

Step 4 — Verify domain on Resend:
1. Back to Resend Domains tab
2. Click "Verify" on qorium.online
3. Wait for propagation (5-15 minutes typical)
4. Confirm domain shows "Verified" status

Step 5 — Generate API key:
1. API Keys → Create API key
2. Name: "qorium-prod"
3. Permission: Full access (we'll restrict per-environment later)
4. Copy to my password manager (do NOT echo)
5. Confirm captured

Step 6 — Set up "from" addresses:
1. Domains → qorium.online → "From" addresses
2. Add: noreply@qorium.online (system emails)
3. Add: hello@qorium.online (general inbound; routes to a Talpro India inbox via forward)
4. Add: bd@qorium.online (BD outbound — used by Bali AI Agent)
5. Add: ae@qorium.online (AE outbound)
6. Add: support@qorium.online (customer success)
7. Add: legal@qorium.online (DPA, MSA, contracts)

Step 7 — Set up webhook (for bounce/complaint handling):
1. Webhooks → Add endpoint
2. URL: `https://api.qorium.online/v1/email/webhooks/resend` (placeholder)
3. Subscribe to: email.delivered, email.bounced, email.complained
4. Webhook secret: copy to my password manager

For each step:
- Do NOT echo API keys/secrets to chat
- Confirm "captured" only

When done, tell me:
- Resend account ID
- Plan: Pro/Free
- qorium.online domain: verified yes/no
- API key: captured
- 6 from addresses configured
- Webhook configured
---PROMPT END---

**Evidence to capture:**
- Resend account ID
- API key (in password manager)
- 4 DNS records added on Hostinger (screenshot of DNS zone)
- Webhook secret (in password manager)

**Post-completion message to CTO:**
> "✅ BP-09 done. Resend account: [ID]. qorium.online verified. 6 from-addresses live. API key + webhook secret in password manager. SPF + DKIM + DMARC active."

---

## BROWSER PROMPTS LIBRARY — UPDATED INDEX

After this extension, the full library is:

| BP | Service | Phase 0 dependency |
|---|---|---|
| BP-01 | Hostinger domain registration | Independent (after CC-01) |
| BP-02 | GitHub org + repo | Independent |
| BP-03 | AI API keys (Anthropic + OpenAI + Gemini + Serper.dev) | Independent (after CC-01 for billing) |
| BP-04 | Cloudflare R2 buckets | Independent (after CC-01) |
| BP-05 | DNS records on Hostinger | After BP-01 (domain owned) |
| BP-06 | LinkedIn + Naukri JD posting | After C1+C2 JD drafts done |
| **BP-07** | **Razorpay merchant account + plans** | **After CC-01 (settlement account)** |
| **BP-08** | **MSG91 OTP + WhatsApp Business** | **After CC-01** |
| **BP-09** | **Resend transactional email + DNS** | **After BP-01 + BP-05** |

Total Phase 0 Part B browser walks: 9 BPs. Average CEO time per BP: 10-25 minutes including pauses for confirmation.

---

*End of BROWSER-PROMPTS-LIBRARY-EXTENSION-BP-07-09. Merge into master `BROWSER-PROMPTS-LIBRARY.md` at next maintenance pass; for now this lives as a standalone extension file.*

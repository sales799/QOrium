# QOrium Implementation — Next-Session Manifest

**Authored by:** CTO Office at session-end
**Last updated:** 2026-05-02 late+ (after Part A Run #5)

---

## Headline

**66 Part A drafts shipped across 5 sessions. ~190K words. Phase 0 punchlist still 13/45.** The pre-authoring well is now dry. The next "continue" should NOT default to more drafting — it should default to executing whatever the CEO has unblocked, OR consolidating a `founder_request` if nothing has changed.

---

## Boot order

1. Read this manifest.
2. Boot per CTO Constitution v5.1.
3. Read `IMPLEMENTATION-PROGRESS-TRACKER.md` and `QUEUE-QOrium.md`.
4. **Critical: read `CEO-ACTION-CARDS.md` first to detect any DONE moves on CC-01/02/03.**
5. Acquire `project_work_lock` only if writing.

---

## Decision tree for next session

### If ANY of CC-01/02/03 has closed (CEO has sent evidence-back):

**SWITCH TO EXECUTE MODE.** This is the moment we've been waiting for.

- **CC-01 closed** → execute CC-04 (domain via Hostinger BP-01) + CC-05 (GitHub via BP-02) + CC-06 (AI keys via BP-03) browser walks; in parallel CTO begins managed Postgres provisioning + R2 bucket + Sentinel integration.
- **CC-02 closed** → coordinate counsel on A6/A7/C8 review cycle; track CC-08 trademark filing kickoff; weekly check-in cadence with counsel.
- **CC-03 closed** → execute D2 (collect 5 Talpro JDs); D3 (issue internal API key — pending B7); D4 (activate Slack channel); D5 (begin 100-Q seed batch authoring); pull-through to Bosch via E1' send-readiness.

### If ALL three CEO cards still OPEN (no evidence-back received):

**FILE FOUNDER_REQUEST.** Use the `founder_request` MCP tool to send a single consolidated message to CEO. Suggested text outline:

> "QOrium status: 66 Part A drafts shipped across 5 sessions. Phase 0 punchlist still 13/45 because all 3 unblock-cards (CC-01/02/03) remain open. The build cannot graduate from prep to execute without CEO physical action. Estimated time on CEO side: 40 minutes total. Each card you close unblocks 4-6 concrete tasks immediately. Drafts ready for IP counsel are at /legal/A6,A7,C8; pre-brief for Talpro Delivery Head is at /sales/CC-03-Talpro-Delivery-Head-Pre-Brief; account-opening is the only one with no pre-draft because banks differ. Awaiting evidence-back. Recommend prioritising CC-02 (highest leverage — counsel review starts immediately on 4 ready drafts; 5+ days saved on legal track)."

After filing the request, EITHER stop and wait, OR continue with very-low-leverage pre-authoring per the residual queue below.

### Residual Part A queue (lowest leverage; only if CEO won't reply this session)

The remaining drafts are increasingly speculative. Avoid unless CEO explicitly requests:

1. Sample-Pack v0.5 populations for the remaining 4 Wave 1 sub-skills (Salesforce, Python, AWS, AI Prompt Engineering)
2. 8 more blog post drafts from the 12-piece Content Roadmap
3. Recruiter outreach email templates (5 versions for SME contractor sourcing per C6 plan)
4. Vendor security questionnaire response template (for SOC 2 / enterprise procurement; preempts Bosch InfoSec questionnaire)
5. Detailed sub-domain content roadmap for Wave 3 M6+ (Aptitude / Psychometric / AI Prompt Engineering)
6. CTO-CEO Constitution-amendment proposal templates
7. Full database migration plan (0002-0010 SQL files outlined per existing 0001 schema)
8. Internal team kickoff doc (when first 2 hires onboard)

---

## Run #5 deliverables (10 source docs, ~46K words)

| Folder | File | Purpose |
|---|---|---|
| sales/ | Sample-Pack-v0.5-Senior-React-Populated.{md,docx} | 10 actual React/Next.js questions |
| sales/ | Sample-Pack-v0.5-Senior-SQL-Data-Populated.{md,docx} | 10 actual Postgres+analytics SQL questions |
| sales/ | Sample-Pack-v0.5-DevOps-SRE-Populated.{md,docx} | 10 actual K8s+IaC+SRE questions |
| sales/ | Blog-P1-1-We-Tested-Java-Questions-Across-5-Leak-Detection-Methods.{md,docx} | Data-driven public credibility post |
| sales/ | Blog-P4-1-Why-We-Wrote-A-92-Point-Quality-Gate-Before-A-Line-Of-Code.{md,docx} | Founder-voice essay |
| sales/ | LinkedIn-Post-Calendar-M1.{md,docx} | 12-post calendar with full structure |
| infra/ | Webhooks-Service-v0-Spec.{md,docx} | qorium-webhook-dispatcher design |
| infra/ | SSO-SAML-Enterprise-Spec-v0.{md,docx} | SAML + OIDC + SCIM design |
| infra/ | Audit-Log-API-Spec-v0.{md,docx} | Customer-facing audit API design |
| infra/ | Billing-Service-v0-Spec.{md,docx} | Razorpay + Stripe billing service design |

---

## Cumulative tally across Runs #1-#5

- **Run #1 (May 2 morning):** 13 docs — JDs, MSA, DPA, comp, sourcing, VPS, Bosch
- **Run #2 (May 2 evening):** 16 docs — CC-02/03 unblockers, BP-06, Bosch sample outlines, 6 infra files, hiring rubrics, customer-zero, rituals
- **Run #3 (May 2 late evening):** 13 docs — populated Embedded Auto, anti-leak, JD-Forge, IRT, recruiter QnA, Wave 1 plan, ref panel, 92-pt gate, brand, Stack-Vault page, CRM playbook, 90-day onboarding, CC-04..CC-12
- **Run #4 (May 2 late+):** 14 docs — 3 ritual templates, incident runbook, Java sample, customer success, API docs, launch comms, content roadmap, investor brief, bias methodology, AI plagiarism, India-stack, ATS framework
- **Run #5 (May 2 latest):** 10 docs — 3 more sample populations, 2 blog drafts, LinkedIn calendar, 4 engineering specs

**Total: 66 Part A drafts. ~190K words. 5 hours of CTO Office concentration. Phase 0 punchlist: 13/45 (29%) — unchanged.**

---

## CEO-blocking items — UNCHANGED across 5 runs

| Card | What | Time | Drafts ready for CEO use |
|---|---|---|---|
| CC-01 | Open ringfenced account / sub-budget | 10 min banking app | n/a — bank-specific |
| CC-02 | Engage IP counsel (use pre-drafted email; hand them A6/A7/C8 drafts on Day 1) | 15 min phone/email | `legal/CC-02-IP-Counsel-Engagement-Email.{md,docx}` (2 versions) + 4 review-ready drafts |
| CC-03 | Brief Talpro Delivery Head (read 10-min pre-brief first) | 15 min WhatsApp | `sales/CC-03-Talpro-Delivery-Head-Pre-Brief.{md,docx}` |

40 minutes total CEO time. Each closure unblocks 4-6 concrete tasks immediately.

---

## Hard constraints

- **No-Fiction Rule (SO-24):** every state claim requires a tool call this session.
- **Capital cap:** ₹50L envelope.
- **Ollama banned on VPS** (April 16 incident).
- **Counsel review required** for A6/A7/C8 before any third-party use.
- **CEO sign-off required** on C7 compensation bands before any offer.
- **Bosch warm-intro (E1)** held — CEO does not send until CC-01 + CC-02 + CC-03 + E2 review close.

---

## Resume command

> "continue" OR "resume QOrium build"

CTO Office will:
1. Read this manifest.
2. Boot per Constitution.
3. **First check CEO-ACTION-CARDS.md for any closed cards.**
4. If any closed → switch to execute-mode.
5. If none closed → file `founder_request` consolidating the unblock state, then either stop or proceed with very-low-leverage residual queue.

---

**End of manifest. The bottleneck is no longer effort. It's CEO physical action.**

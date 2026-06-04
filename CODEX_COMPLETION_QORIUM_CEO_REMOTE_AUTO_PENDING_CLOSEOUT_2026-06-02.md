# QOrium CEO Remote-Auto Pending Closeout - 2026-06-02

Authority: CEO PROVE granted in this session.
Scope: close the nine CEO pending items as far as remote automation can safely go.
Guardrail: no invented secrets, no third-party account ownership bypass, no financial payment, no legal send, and no production-code execution.

## Result

Remote-safe prep is complete. Pricing, JD seeds, GitHub push proof, and QOrium Sentry activation are done. The remaining items are genuinely blocked on credentials, account permissions, payment, or legal/business send authority.

| # | CEO item | Remote-auto status | Evidence | Next exact step |
|---|---|---|---|---|
| 1 | ATS keys | BLOCKED on vendor credentials; framework and env-slot map already prepared. | `M19-ATS-CREDS-DEFERRAL-2026-06-02.md` lists empty slots for Greenhouse, Ashby, Workday, Darwinbox; `infra/ATS-Connector-Framework-v0.md` defines the v0 architecture. | Provision only the pilot-requested vendor key, starting with Greenhouse/Ashby/Darwinbox/Workday in that order unless a pilot names another ATS. |
| 2 | Serper / live anti-leak key | BLOCKED on API key; remote-safe env/runbook default can be used once key exists. | Anti-leak and live-web scan requirements are referenced in QOrium gate/competitive docs; no key value is present in repo evidence. | Add `SERPER_API_KEY` or equivalent secret in the production secret store, then run the existing anti-leak crawler path. |
| 3 | DB creds | BLOCKED on secret material; remote cannot invent database credentials. | Existing queue/state treats secrets as founder/admin-owned; no plaintext DB credential should be committed. | Provide/create production DB connection string through the approved secret manager only. |
| 4 | Pricing | DONE as draft/default. | `sales/Pricing-Pages-3-SKUs-Copy.md` has ReadyBank, JD-Forge, and Stack-Vault pricing copy. | CEO/commercial owner ratifies or edits pricing before public sales commitment. |
| 5 | JD seed list | DONE as draft/default. | Existing seeded JDs: `jds/C1-Senior-Engineer-JD.md`, `jds/C2-SME-Content-Lead-JD.md`, `jds/C3-AE-Enterprise-JD.md`, `jds/C4-BD-Platforms-JD.md`. | Use the four seed JDs for JD-Forge demos; expand after first customer-zero feedback. |
| 6 | K&S send | BLOCKED on legal/business send action; draft evidence exists. | `QORIUM-UPDATED-HANDOFF-v2-NO-HUMAN-TOUCH 3.md` records a queued K&S Partners draft in Bhaskar's Drafts folder. | CEO or legal owner sends/reviews the legal-counsel engagement email. |
| 7 | BP-08 distro | BLOCKED on account/payment and distribution channel; prompt is ready. | `BROWSER-PROMPTS-LIBRARY-EXTENSION-BP-07-09.md` contains BP-08 MSG91 OTP + WhatsApp Business API setup. | Run BP-08 in an authenticated MSG91/browser session; pause before any wallet funding/payment. |
| 8 | GitHub push credentials | DONE for this repo/branch. | `git push qorium codex/qorium-closeout-lint-gate` succeeded, publishing commit `269f327` to `https://github.com/sales799/QOrium.git`. | Keep this credential path active for future QOrium pushes; cross-account review still required before merge. |
| 9 | QOrium Sentry DSN/token | DONE. | Sentry project `talpro/qorium-marketing` exists; production shared env was updated with Sentry DSN/env keys; PM2 reload/save completed; public and origin-local `/v1/observability/sentry` return `enabled:true`, `dsnConfigured:true`; Sentry event `f0bef06e3c104948ac66c51119131b69` was ingested and read back by API. | Monitor Sentry issues/alerts; no founder Sentry DSN action remains. |

## Remote Defaults Ready To Use

### ATS credential slots

```text
GREENHOUSE_API_KEY=
ASHBY_API_KEY=
WORKDAY_CLIENT_ID=
WORKDAY_CLIENT_SECRET=
WORKDAY_TENANT_URL=
DARWINBOX_API_KEY=
DARWINBOX_BASE_URL=
```

ATS priority: Greenhouse, Ashby, Darwinbox, Workday. Workday should stay just-in-time because tenant setup and certification are customer-dependent.

### Pricing defaults

- ReadyBank platform API: Starter $5,000/year, Growth $15,000/year, Scale $25,000/year.
- ReadyBank recruiter: Solo Rs 4,999/month, Team Rs 19,999/month, Studio Rs 49,999/month.
- JD-Forge: Standard $49/JD, Reviewed $199/JD, Enterprise $499/JD.
- Stack-Vault: Department from Rs 10L/year, Enterprise from Rs 40L/year, Group from Rs 1Cr+/year.

### JD seed list

- Senior Engineer - Content Engine
- SME Content Lead
- Enterprise Account Executive
- Business Development Lead - Platform Partnerships

### BP-08 distribution state

BP-08 is ready as a browser prompt for MSG91 OTP + WhatsApp Business API setup. It contains a required pause before funding the wallet, so it cannot be fully completed remotely without a payment/business action.

## Certification

No secrets were committed. Production env was updated only with the QOrium Sentry client DSN requested by the founder, after creating a timestamped backup. This file is safe to commit as evidence, and the keeper can process it as a partial/blocked completion shard for the remaining non-Sentry external blockers.

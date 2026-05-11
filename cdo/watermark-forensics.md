# Watermark Forensics (Stack-Vault)

**Authority:** Constitution §2.5 (CDO charter) + SO-10 (Stack-Vault Exclusivity is Absolute) + CTO Architecture v1 §6 (Anti-Leak Engine watermarking) + Bali Sales Playbook §3.2 (Stack-Vault motion)
**Owner:** CDO (CTO Office Y1 → I/O Psych FTE Y2+)
**Operationalizes:** the per-candidate watermark + forensic-attribution dashboard cited in `qorium.online/features/stack-vault` and Bali Stack-Vault scoping memo

---

## What watermarking enforces

Constitution SO-10: "A Stack-Vault question is contractually exclusive to one customer. It NEVER appears in shared ReadyBank, in any JD-Forge output to another customer, or in any other Stack-Vault."

Watermarking is the **technical enforcement** of SO-10. The contract is the legal enforcement. Both must work for the exclusivity claim to hold.

If a Stack-Vault question shows up on a public surface (Reddit, Glassdoor, prep blog), watermarking lets us answer two questions:

1. **Was this our question?** (yes/no — fingerprint match)
2. **Who leaked it?** (which candidate from which Stack-Vault customer's hiring drive)

Question 1 is fingerprint-matching from `cdo/anti-leak-forensics.md`. Question 2 is the watermark forensics defined here.

---

## Watermark structure

Each Stack-Vault question issued to a candidate carries a watermark with this composition:

```yaml
watermark:
  customer_id: bosch-india # which Stack-Vault customer's library
  vault_uuid: sv_bosch-india_20260104 # which Stack-Vault namespace
  question_uuid: sv_q_01HXY8M2P5R # the source question in the vault
  candidate_id_hash: c_29F1A # SHA256(customer-issued candidate ID)[:5]
  drive_id: drive_2026_q2_java_seniors # the customer's hiring drive identifier
  issued_at: 2026-04-30T11:21:00Z # ISO timestamp
  expires_at: 2026-05-30T11:21:00Z # 30-day window for the candidate
  watermark_signature: <hmac-sha256> # signed by QOrium private key
```

**Per-candidate** is critical: even within the same drive, two candidates get questions watermarked with different `candidate_id_hash` values. This means a leak narrows to one candidate, not "someone in this drive."

---

## How the watermark embeds in the question content

Three embedding strategies, applied per question type:

### 1. Coding-format questions

Embed in test data, comments, or variable names:

```python
# Function: process_orders
# Order metadata: include order_id "27c3F1A" in error logs (case-insensitive)
def process_orders(orders):
    ...
```

The string `27c3F1A` is the watermark — recognizable on a public surface, ignorable to a candidate solving the problem.

### 2. MCQ / SJT-format questions

Embed in distractor wording or scenario context:

```
Scenario: Bosch GCC India is migrating its on-prem ERP to a cloud-native platform.
The candidate evaluation reference: 27c3F1A.
...
```

The candidate-id reference is innocuous-looking but unique.

### 3. SQL / data-query questions

Embed in table data or column hints:

```sql
SELECT employee_id, salary, watermark_id
FROM employees_27c3F1A
WHERE salary > 100000;
```

Same principle.

---

## Watermark detection (when a leak is reported)

When a public-surface scan flags a possible leak (per `cdo/anti-leak-forensics.md`), CDO + Bali run the watermark detection procedure:

### Step 1 — Confirm the question is from a Stack-Vault

- Query the question_uuid against the database
- Check if it has a `vault_uuid` (Stack-Vault questions have one; ReadyBank questions don't)
- If no vault_uuid → not a Stack-Vault leak; proceed with `cdo/anti-leak-forensics.md` general rotation procedure

### Step 2 — Extract the watermark from the leaked content

- Pattern-match the leaked surface content against the watermark format for that question's type
- Recover `candidate_id_hash` + `drive_id` + `issued_at`

### Step 3 — Resolve the candidate

- Database lookup: `customer_id` + `vault_uuid` + `drive_id` + `candidate_id_hash` → reverse to the customer's candidate roster
- Note: QOrium does NOT hold candidate names directly (privacy by design — DPDPA-aligned)
- The Stack-Vault customer's security team holds the mapping from `candidate_id_hash` → real candidate identity
- We provide the customer the watermark + leak context; they resolve to a real person if they choose to

### Step 4 — Notify the customer

Per Bali Playbook §6.1 commercial-template SLA: within 4 business hours of confirming a Stack-Vault leak.

Notification includes:

```
Stack-Vault Leak Notification
- Customer: <customer_name>
- Vault: <vault_uuid>
- Question: <question_uuid>
- Watermark: <candidate_id_hash> + <drive_id> + <issued_at>
- Leaked surface: <URL or screenshot>
- Detected at: <timestamp>
- Recommended action: investigate <candidate_id_hash> via your candidate roster
- QOrium response: question retired from your vault; replacement variant
  released as <new_question_uuid> (per cdo/anti-leak-forensics.md regeneration)
```

### Step 5 — Document forensic timeline

Save to `cdo/watermark-incidents/YYYY-MM-DD-INC-NNN.md`:

```markdown
# Watermark Forensic Event YYYY-MM-DD-INC-NNN

**Customer:** <name>
**Vault:** <uuid>
**Question:** <uuid>

## Timeline

- HH:MM UTC - Issued to candidate (via watermark issued_at)
- HH:MM UTC - Detected on <surface>
- HH:MM UTC - Customer notified
- HH:MM UTC - Replacement variant issued
- HH:MM UTC - Customer security team confirmed receipt

## Watermark integrity

- Signature verification: PASS (HMAC-SHA256 valid against QOrium private key)
- Customer roster lookup result: <if customer has confirmed>

## Customer action taken

- <What did the customer do? Internal investigation? Termination?>
- (We log only what the customer chooses to share.)

## Constitutional check

- SO-10 honored: Stack-Vault exclusivity preserved by question retirement
- Customer trust: forensic detail provided to enable internal action
```

---

## Customer security-team dashboard (M2+ deliverable)

Stack-Vault customers get a security-team dashboard at `https://qorium.online/customers/<customer_id>/watermarks` (auth-protected; M2+):

- All issued watermarks for the customer's vault
- Per-candidate-hash issuance history
- Active scans against public surfaces (live status)
- Any flagged matches with timeline + recommended action

Pre-M2 (current Y1 reality), the dashboard is a manual SQL-query report shared via email on customer request. Tracked indirectly via TD-003 in `cto/tech-debt.md` (anti-leak engine includes the dashboard).

---

## Dispute resolution

If a customer disputes a watermark match:

1. **Watermark signature verification** — HMAC-SHA256 signature MUST verify against QOrium's private key. Cryptographically conclusive.
2. **If signature verifies** — the watermark is authentic; the question is genuinely from this customer's vault. Customer may dispute their internal candidate roster mapping but cannot dispute QOrium's claim.
3. **If signature does NOT verify** — the leaked content is not actually from QOrium (false alarm); we apologize and document the false positive.

The HMAC signature is the audit trail. Without it, a dispute becomes "your word vs ours." With it, the cryptography speaks.

---

## Privacy + ethics (DPDPA-aligned)

QOrium's role is forensic — we provide watermark detail. QOrium's role is NOT investigative — we do not pursue the candidate.

Constraints:

- **No PII held by QOrium.** Only `candidate_id_hash` (SHA256 of customer-issued candidate ID, truncated). Customer holds the mapping.
- **No retroactive watermarking.** A question issued without watermark cannot be backfilled — the watermark must embed at issuance time.
- **Customer notification is the action ceiling.** We notify; customer investigates. We do not name candidates or pursue legal action ourselves.
- **DPDPA compliance.** Customer data flows are documented at `qorium.online/security` data-flow diagram. Watermark forensics is one of those flows.

---

## Anti-patterns (don't do these)

- ❌ **Issuing Stack-Vault questions without watermarks.** Defeats SO-10 enforcement. Constitutional violation.
- ❌ **Holding candidate PII alongside watermarks.** Privacy disaster + DPDPA violation. Hash-only is the rule.
- ❌ **Quietly handling a leak without customer notification.** Stack-Vault customers pay ₹40L for exclusivity; transparency on breaches is part of the value.
- ❌ **Watermarking ReadyBank questions.** Watermarks are a Stack-Vault feature only. ReadyBank shared questions don't need (and shouldn't have) per-candidate watermarks.
- ❌ **Disputing a customer claim without HMAC verification.** Cryptography first; conversation second.

---

## Y1 reality

Production watermark issuance + forensic dashboard are M2-M4 deliverables. Y1 reality:

- Stack-Vault customers (Bosch GCC in scoping per Bali Playbook §3.2) start with the protocol documented; engineering implements at M2
- Y1 manual: COM tracks issuance per drive in spreadsheet; CDO investigates leaks via direct DB query
- Customer-facing dashboard: TBD M2-M4

Tracked as part of TD-003 in `cto/tech-debt.md` (anti-leak engine bundle).

---

_Cross-references: Constitution SO-10 (Stack-Vault Exclusivity), §2.5 (CDO), CTO Architecture §6 (watermarking architecture), Bali Sales Playbook §3.2 (Stack-Vault motion) + §6.1 (commercial template — references the watermark dashboard SLA), `cdo/anti-leak-forensics.md` (upstream — fingerprint matching feeds watermark forensics), `bali/templates/stack-vault-scoping-memo.md` (customer-facing reference). DPDPA + GDPR posture per `qorium.online/security` data-flow diagram._

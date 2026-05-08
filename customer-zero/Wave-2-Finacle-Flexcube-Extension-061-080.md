# Wave 2: Finacle / Flexcube Extension Questions 061–080

**STATUS:** AI-drafted v0.6 EXTENSION (continues `Wave-2-Finacle-Flexcube-Extension-021-040.md`). SME Lead validation pending.

**Scope:** 20 questions (QOR-FNCFLX-061 through QOR-FNCFLX-080) covering Indian core banking on Finacle (Infosys) + Flexcube (Oracle FSS): treasury, trade finance, regulatory reporting, payment systems, mobile banking, AML / fraud, microservices integration, branch operations.

**Difficulty Distribution:** 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.
**Format Distribution:** 12 MCQ / 4 Code / 2 Design / 2 Case-Study.

---

## QUESTION 61: NEFT vs RTGS vs IMPS vs UPI

**question_id:** QOR-FNCFLX-061
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** payment-systems
**format:** MCQ
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** RBI Payment Systems Documentation: rbi.org.in/Scripts/PaymentSystems.aspx

**body:**

Match each Indian payment system to its key characteristic:

**options:**

- A) NEFT = batch settlement (every 30 min, 24/7); RTGS = real-time gross settlement, ≥ ₹2 lakh; IMPS = immediate, person-to-person, 24/7, ≤ ₹5 lakh; UPI = instant person-to-person/merchant, 24/7, ≤ ₹2 lakh per transaction (NCMC limits vary)
- B) All four are real-time; only the operating hours differ
- C) RTGS is batch; NEFT is real-time
- D) IMPS and UPI are the same product

**answer_key:**

A — Each Indian payment system has distinct characteristics:
- **NEFT** (National Electronic Funds Transfer): batch-based, settled in 30-minute windows, 24/7 since Dec-2019; no minimum, no ceiling.
- **RTGS** (Real-Time Gross Settlement): real-time, irrevocable, ≥ ₹2 lakh; bank-to-bank.
- **IMPS** (Immediate Payment Service): instant, 24/7, mobile/internet banking; ≤ ₹5 lakh per transaction.
- **UPI** (Unified Payments Interface): instant, mobile-first, P2P/P2M; transaction limit varies by bank (typically ≤ ₹2 lakh; ≤ ₹5 lakh for some specific use cases).

References: RBI Payment Systems Operational Guidelines.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-061-seed-2a8f1c4e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-061
**bias_check_notes:** India-specific by domain.

---

## QUESTION 62: Customer KYC Flow

**question_id:** QOR-FNCFLX-062
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** kyc-aml
**format:** MCQ
**difficulty_b:** -0.6 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** RBI KYC Master Directions

**body:**

Per RBI Master Direction on KYC, what's the Tier-3 Full-KYC requirement for retail savings account opening?

**options:**

- A) (1) Aadhaar / OVD (Officially Valid Document) for identity, (2) PAN OR Form 60, (3) Recent photograph, (4) Self-declaration of address (or address-proof OVD), (5) Periodic Re-KYC every 2/8/10 years for high/medium/low-risk customers
- B) Only PAN required
- C) Only Aadhaar required
- D) No documentation required for Tier-3

**answer_key:**

A — Full KYC per RBI Master Direction (Tier-3 / "Universal" KYC):
1. Identity proof: Aadhaar (preferred) OR any "Officially Valid Document" (PAN + Driving License OR Voter ID OR Passport).
2. PAN — mandatory for ≥₹50,000 deposit transactions; alternative is Form 60 (declaration if no PAN).
3. Recent passport-size photograph.
4. Address: self-declaration acceptable for Aadhaar-based KYC; OVD required otherwise.
5. Periodic Re-KYC: every 2 years (high-risk), 8 years (medium-risk), 10 years (low-risk).

References: RBI Master Direction — Know Your Customer (KYC) Direction, 2016 (as amended).

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-062-seed-9c4d2a8e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-062
**bias_check_notes:** India-specific by domain.

---

## QUESTION 63: End-of-Day (EOD) Batch Sequence

**question_id:** QOR-FNCFLX-063
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** eod-batch
**format:** MCQ
**difficulty_b:** 0.3 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Finacle / Flexcube EOD Documentation

**body:**

In Finacle / Flexcube EOD batch, what's the canonical processing sequence?

**options:**

- A) (1) Cut-off + lock day's transactions; (2) Pre-EOD checks (cash + clearing reconciliation); (3) Account-level processing (interest accrual, fees, charges); (4) GL posting + General Ledger close; (5) Regulatory reports generation (CRR/SLR + DSB filings); (6) Backup; (7) Open next business day
- B) Random sequence; the system orders dynamically
- C) Reports first; transactions last
- D) EOD doesn't apply to modern core banking

**answer_key:**

A — Standard EOD sequence:
1. **Cut-off + lock**: stop new transactions; freeze the day.
2. **Pre-EOD reconciliation**: cash drawer + clearing check.
3. **Account processing**: per-account interest accrual, daily fees, charge calculations.
4. **GL posting + close**: aggregate into General Ledger; close P&L for the day.
5. **Regulatory reports**: CRR (Cash Reserve Ratio), SLR (Statutory Liquidity Ratio), DSB (Daily Statement of Business) returns to RBI.
6. **Backup**: full DB + journals to DR site.
7. **BOD (Beginning of Day)**: open next day for transactions.

(B), (C), (D) all wrong. References: Finacle EOD Operations Guide §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-063-seed-3e8c1f4a
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-063
**bias_check_notes:** Standard core banking concept.

---

## QUESTION 64: Letter of Credit (LC) Workflow

**question_id:** QOR-FNCFLX-064
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** trade-finance
**format:** MCQ
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** UCP 600 (Uniform Customs and Practice for Documentary Credits) + Finacle Trade Finance Documentation

**body:**

What's the canonical LC issuance workflow in Finacle Trade Finance?

**options:**

- A) (1) Importer requests LC; (2) Issuing bank reviews credit + collateral; (3) LC drafted referencing UCP 600 rules; (4) Bank issues LC via SWIFT MT700; (5) Advising bank delivers to exporter; (6) Exporter ships goods; (7) Exporter presents documents (Bills of Lading, Invoice, Packing List, Insurance) to negotiating bank; (8) Documents examined per UCP; (9) Payment / acceptance to exporter
- B) LC = invoice; just issue and pay
- C) Bank pays exporter directly; importer reimburses later
- D) LCs are deprecated; use bank guarantees instead

**answer_key:**

A — Letter of Credit is the documentary credit instrument under ICC's UCP 600 rules. Workflow has 9 distinct steps; failure at any document examination step (UCP 600 strict-compliance check) can trigger discrepancies + rejection. Bank earns LC fee + commitment fee. (B) is wrong — LC is a payment guarantee, not an invoice. (C) wrong — payment to exporter follows document compliance. (D) wrong — LC + BG are different instruments, both active. References: UCP 600; Finacle Trade Finance User Guide §Letter of Credit.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-064-seed-7c4d2a1f
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

## QUESTION 65: SWIFT Message — MT103 vs MT700

**question_id:** QOR-FNCFLX-065
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** swift-messaging
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SWIFT Standards Documentation

**body:**

What do SWIFT message types MT103 and MT700 represent?

**options:**

- A) MT103 = Single Customer Credit Transfer (used for retail / corporate cross-border payment); MT700 = Issue of a Documentary Credit (LC issuance). Different message categories: MT1xx = customer payments; MT7xx = documentary credits / guarantees
- B) Both are payment messages
- C) MT103 = issue LC; MT700 = pay LC
- D) SWIFT has only one message type; the number is just a sequence

**answer_key:**

A — SWIFT message taxonomy:
- **MT1xx series**: Customer Payments (MT103 = single credit transfer; MT103+ = full SWIFT MT/STP).
- **MT2xx series**: Financial Institution transfers.
- **MT5xx series**: Securities markets.
- **MT7xx series**: Documentary credits + guarantees (MT700 = issue of LC; MT701 = MT700 with extended fields; MT720 = transfer of LC; MT760 = bank guarantee).
- **MT9xx series**: Cash management + customer status.

References: SWIFT Standards MT Categories; ISO 20022 mapping.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-065-seed-1d4f8a3c
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

## QUESTION 66: AML — Suspicious Transaction Reporting (STR)

**question_id:** QOR-FNCFLX-066
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** aml-fraud
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** PMLA + RBI AML Master Directions

**body:**

A retail customer makes 5 cash deposits of ₹49,000 within a single day at different branches (each below ₹50,000 PAN threshold). What's the AML compliance response?

**options:**

- A) System flags as **Structuring** (a red flag pattern); Bank's AML team investigates; if suspicious, files Suspicious Transaction Report (STR) with FIU-IND within 7 days; customer's account placed on enhanced monitoring per RBI guidelines
- B) Each deposit is below threshold so compliant; no action needed
- C) Bank closes the account immediately
- D) Bank reports to police directly

**answer_key:**

A — The pattern is **Structuring** (also called "smurfing") — splitting a large transaction into smaller pieces to avoid reporting thresholds. PMLA + RBI AML rules treat this as a red flag regardless of individual amounts. The bank's AML system must:
1. Detect the pattern (Finacle / Flexcube AML modules + downstream like Actimize / SAS / NetReveal flag this).
2. AML team investigates within 24-72 hours.
3. If suspicious, file Suspicious Transaction Report (STR) with FIU-IND (Financial Intelligence Unit, India) within 7 days.
4. Place account on Enhanced Due Diligence (EDD) monitoring.

(B) is the antipattern — exactly what structuring is designed to exploit. (C) is over-reaction without investigation. (D) wrong — STR goes to FIU-IND, not police directly. References: PMLA 2002 + Rules; RBI AML Master Directions.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-066-seed-9a3c2f7b
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-066
**bias_check_notes:** India-specific compliance topic.

---

## QUESTION 67: Loan Restructuring vs Rescheduling

**question_id:** QOR-FNCFLX-067
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** loan-servicing
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** RBI Master Direction on Loan Restructuring

**body:**

What's the regulatory distinction between Loan Restructuring and Rescheduling per RBI norms?

**options:**

- A) **Restructuring** changes economic terms (interest rate, principal moratorium, conversion to equity) — invokes Asset Classification implications (asset may move to NPA / restructured). **Rescheduling** changes only the repayment schedule (date / EMI amount within original tenure) without economic relief — does NOT impact asset classification
- B) Same thing; just different words
- C) Rescheduling is for short-term; restructuring is for long-term
- D) Both are deprecated under recent RBI guidelines

**answer_key:**

A — RBI distinguishes:
- **Restructuring** (under RBI Prudential Framework for Resolution of Stressed Assets): substantive changes to economic terms — interest concession, principal moratorium, conversion of debt to equity, extension of tenure beyond origin, etc. Triggers asset re-classification (Standard / SMA / Restructured / NPA per RBI rules); affects bank's provisioning.
- **Rescheduling**: only date / EMI changes within original sanctioned terms; no economic relief. Does NOT trigger asset classification change.

References: RBI Master Direction — Prudential Framework for Resolution of Stressed Assets, 2019.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-067-seed-3d8a4f2c
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-067
**bias_check_notes:** India-specific compliance topic.

---

## QUESTION 68: ISO 20022 Migration (SWIFT MT → MX)

**question_id:** QOR-FNCFLX-068
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** iso-20022
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SWIFT ISO 20022 Migration Documentation

**body:**

SWIFT is migrating from MT (legacy text messages) to MX (XML-based ISO 20022) by November 2025. What's the canonical strategy for an Indian bank on Finacle / Flexcube?

**options:**

- A) Bank's payment gateway upgraded to support both MT + MX during co-existence (Nov-2022 to Nov-2025); Finacle / Flexcube core upgraded to ISO 20022-aware payment processing; downstream systems (compliance, AML, accounting) also upgraded; testing across the full payment lifecycle (origination → routing → settlement → reconciliation)
- B) No upgrade needed; SWIFT will translate at the gateway
- C) Switch to MX immediately; abandon MT
- D) Wait until Dec-2025 to start; SWIFT will give a grace period

**answer_key:**

A — ISO 20022 migration is a multi-year program. SWIFT's CBPR+ (Cross-Border Payments + Reporting Plus) standard:
- Co-existence window Nov-2022 to Nov-2025.
- After Nov-2025, MX is mandatory for cross-border + correspondent banking; MT retired for those flows.
- Finacle / Flexcube vendors release ISO 20022-compliant updates that the bank installs.
- Bank tests end-to-end: payment origination → routing → settlement → reconciliation in MX.
- Adjust compliance + AML modules to handle the richer MX fields (more screening data).

(B) wrong — gateway translation is allowed during co-existence but not a long-term solution. (C) reckless. (D) misses the deadline. References: SWIFT CBPR+ Migration Guide; Finacle / Flexcube ISO 20022 Roadmap.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-068-seed-7c4a8f1e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

## QUESTION 69: Branch + Centralised Architecture

**question_id:** QOR-FNCFLX-069
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** core-banking-architecture
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Finacle / Flexcube Architecture Documentation

**body:**

In a centralised core banking architecture (Finacle 11.x or Flexcube), how does a branch ATM transaction flow?

**options:**

- A) ATM → ATM Switch → Branch Server (validation) → Centralised Core (account check + balance posting + transaction logging) → Branch Server (response) → ATM Switch → ATM (cash dispense + receipt). All processing centralised; branch is thin client
- B) ATM transactions are fully local at branch; no central core involvement
- C) ATM goes directly to RBI; bypasses bank
- D) ATM transactions route through HSM only

**answer_key:**

A — Modern core banking is centralised:
- Each branch has a thin server / lightweight client.
- ATM at the branch routes via the bank's ATM Switch (e.g., NPCI / NCR Switch).
- Central Core (Finacle / Flexcube) does account validation, balance check, transaction posting, AML/fraud check, regulatory hold check.
- Response routes back; ATM dispenses cash + prints receipt.
- All transactions journaled in central GL for EOD reconciliation.

(B) is the legacy architecture (15+ years old; abandoned for centralisation reasons). (C) wrong — RBI is regulator, not transaction gateway. (D) HSM is for crypto only.

References: Finacle / Flexcube Architecture Reference §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-069-seed-2a8d4f1c
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

## QUESTION 70: API Banking — Open Banking + UPI

**question_id:** QOR-FNCFLX-070
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** api-banking
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Indian Open Banking + UPI 2.0 Documentation

**body:**

What's the canonical API banking architecture for an Indian bank exposing services to fintechs (e.g., Razorpay, Paytm)?

**options:**

- A) **API Gateway (e.g., Apigee, Kong)** in front of internal core banking; **OAuth 2.0 + signed JWT** for fintech authentication; **rate limits per fintech** (e.g., 100 TPS); **logging + monitoring** of all API calls; integration with **UPI 2.0** for instant transactions; **DPDPA-compliant consent + data sharing**; webhooks for callback events
- B) Direct database access for fintechs
- C) Email-based file exchange daily
- D) No API banking; fintechs build their own banking infrastructure

**answer_key:**

A — Modern API banking architecture:
- **API Gateway** (Apigee / Kong / AWS API Gateway) is the perimeter.
- **OAuth 2.0 + signed JWTs** for fintech identity + scoped authorization.
- **Rate limiting per fintech** to prevent abuse.
- **Audit logging + monitoring** for AML / fraud detection on API traffic.
- **UPI 2.0 integration** for instant transactions.
- **DPDPA + RBI Account Aggregator framework** for consent + data sharing.
- **Webhooks** for asynchronous notifications.

(B), (C), (D) all wrong. References: RBI Account Aggregator Framework; UPI 2.0 Documentation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-070-seed-9a4d8c1f
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-070
**bias_check_notes:** Indian banking context.

---

## QUESTION 71: Interest Accrual Code (Code)

**question_id:** QOR-FNCFLX-071
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** interest-accrual
**format:** code
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** Finacle / Flexcube Interest Accrual Documentation

**body:**

Write pseudocode (or PL/SQL stub) for a daily interest accrual job on savings accounts. Cover: read account balances, calculate daily interest based on account-tier rate, accrue to interest payable account, handle minimum balance + tier transitions. 4% on balance ≤ ₹1L; 6% on excess.

**answer_key:**

```sql
-- Daily Interest Accrual Job (typical Finacle / Flexcube pattern)

DECLARE
  l_today_date         DATE := SYSDATE;
  l_days_in_year       NUMBER := 365;
  CURSOR c_savings_accounts IS
    SELECT account_no,
           closing_balance,
           account_tier,
           min_balance_required
      FROM cust_savings_accounts
     WHERE status = 'ACTIVE'
       AND last_interest_accrual_date < l_today_date;
BEGIN
  FOR rec IN c_savings_accounts LOOP
    DECLARE
      l_eligible_balance  NUMBER;
      l_interest_4pct     NUMBER;
      l_interest_6pct     NUMBER;
      l_total_accrual     NUMBER;
    BEGIN
      -- Skip accounts with balance < min req (RBI: no penalty; just no interest)
      IF rec.closing_balance < rec.min_balance_required THEN
        CONTINUE;
      END IF;

      -- Tiered rates: 4% on first 1L, 6% on excess
      IF rec.closing_balance <= 100000 THEN
        l_interest_4pct := rec.closing_balance * 0.04 / l_days_in_year;
        l_interest_6pct := 0;
      ELSE
        l_interest_4pct := 100000 * 0.04 / l_days_in_year;
        l_interest_6pct := (rec.closing_balance - 100000) * 0.06 / l_days_in_year;
      END IF;

      l_total_accrual := l_interest_4pct + l_interest_6pct;

      -- Accrue: Cr interest payable, Dr expense
      INSERT INTO interest_accrual_journal
        (account_no, accrual_date, accrual_amount, debit_account, credit_account)
      VALUES
        (rec.account_no, l_today_date, l_total_accrual,
         'INT_EXPENSE_GL_4500', 'INT_PAYABLE_LIAB_2300');

      -- Update last accrual date
      UPDATE cust_savings_accounts
         SET last_interest_accrual_date = l_today_date
       WHERE account_no = rec.account_no;

      COMMIT;
    EXCEPTION WHEN OTHERS THEN
      -- Log, but don't stop the batch
      INSERT INTO accrual_errors (account_no, error_msg, error_date)
      VALUES (rec.account_no, SQLERRM, l_today_date);
      ROLLBACK TO before_account;
    END;
  END LOOP;

  -- Trigger downstream: reconciliation report; AML/fraud check on unusual accruals
  CALL run_accrual_reconciliation(l_today_date);
END;
```

Key elements:

1. Cursor-based iteration over active savings accounts.
2. Skip accounts below minimum balance.
3. Tiered interest calculation (4% / 6% boundary at ₹1L).
4. Daily accrual = annual rate × balance / 365.
5. Double-entry journal posting.
6. Update last accrual date for idempotency.
7. Per-account exception handling (don't stop the batch).
8. Reconciliation trigger after batch.

**rubric:** 5/4/3/2/1/0 by completeness — tiered calc + double-entry posting + idempotency + error handling.

**watermark_seed:** qorium-fncflx-v0.6-071-seed-3a8f1c4e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

## QUESTION 72: AML Rule Engine (Code)

**question_id:** QOR-FNCFLX-072
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** aml-fraud
**format:** code
**difficulty_b:** 1.5 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** Indian AML Rule Engine Patterns

**body:**

Write a SQL / PL/SQL pseudocode AML rule that detects "Structuring" (multiple cash deposits below ₹50K threshold within a 24-hour window). Cover: detection logic, alert generation, customer escalation, regulatory reporting trigger.

**answer_key:**

```sql
CREATE OR REPLACE PROCEDURE detect_structuring (p_run_date DATE) IS
BEGIN
  -- Step 1: Find customers with multiple cash deposits below threshold
  -- in 24-hour window.
  INSERT INTO aml_alerts (alert_id, customer_id, rule_id, alert_date,
                          alert_severity, alert_status, alert_details)
  WITH suspect_customers AS (
    SELECT customer_id,
           COUNT(*) AS deposit_count,
           SUM(amount) AS total_deposits,
           MIN(amount) AS min_deposit,
           MAX(amount) AS max_deposit,
           COUNT(DISTINCT branch_id) AS distinct_branches,
           LISTAGG(transaction_id, ',') WITHIN GROUP (ORDER BY transaction_date)
             AS transaction_list
      FROM cash_transactions
     WHERE transaction_type = 'CASH_DEPOSIT'
       AND transaction_date >= p_run_date - INTERVAL '24' HOUR
       AND transaction_date < p_run_date
       AND amount BETWEEN 30000 AND 49999  -- below ₹50K threshold
       AND amount > 0
     GROUP BY customer_id
    HAVING COUNT(*) >= 3                -- 3+ structured deposits
       AND SUM(amount) >= 90000          -- aggregate ≥ ₹90K
  )
  SELECT seq_aml_alert.NEXTVAL,
         customer_id,
         'STRUCTURING_24H',
         p_run_date,
         CASE WHEN total_deposits >= 200000 THEN 'HIGH'
              WHEN total_deposits >= 100000 THEN 'MEDIUM'
              ELSE 'LOW'
         END,
         'OPEN',
         'Customer ' || customer_id || ' made ' || deposit_count ||
         ' deposits totaling ₹' || total_deposits ||
         ' across ' || distinct_branches || ' branches in 24h.' ||
         ' Tx Ids: ' || transaction_list
    FROM suspect_customers;

  -- Step 2: Auto-escalate HIGH severity to AML team
  INSERT INTO aml_review_queue
    (queue_id, alert_id, assigned_to, priority, due_date)
  SELECT seq_aml_review.NEXTVAL,
         alert_id,
         'AML_TEAM',
         'P1',
         p_run_date + 7  -- 7 days SLA for STR filing
    FROM aml_alerts
   WHERE alert_severity = 'HIGH'
     AND alert_date = p_run_date
     AND alert_status = 'OPEN';

  -- Step 3: Trigger STR filing prep for customers already on watchlist
  UPDATE aml_alerts
     SET alert_status = 'STR_REQUIRED'
   WHERE alert_id IN (
         SELECT a.alert_id
           FROM aml_alerts a
           JOIN aml_watchlist w ON w.customer_id = a.customer_id
          WHERE a.alert_date = p_run_date
            AND w.watchlist_status = 'ACTIVE'
       );

  -- Step 4: Notify branch managers of high-severity alerts (sub-asynchronous)
  ENQUEUE_NOTIFICATION (
    notification_type => 'AML_HIGH_ALERT',
    target_branch_ids => (SELECT DISTINCT branch_id FROM aml_alerts
                            WHERE alert_severity = 'HIGH'
                              AND alert_date = p_run_date),
    payload          => 'High-severity AML alert: structuring pattern detected'
  );

  COMMIT;
END;
```

Key elements:

1. Detection logic: 3+ deposits, aggregate ≥ ₹90K, all below ₹50K threshold, 24h window.
2. Severity tiering: HIGH ≥ ₹2L; MEDIUM ≥ ₹1L; LOW otherwise.
3. Auto-escalation to AML team with 7-day SLA (matches FIU-IND STR filing window).
4. Watchlist customers auto-escalated to STR_REQUIRED.
5. Branch manager notifications.
6. Comprehensive alert details for investigator.

**rubric:** 5/4/3/2/1/0 by completeness — detection logic + tiering + escalation + STR trigger + notification.

**watermark_seed:** qorium-fncflx-v0.6-072-seed-7e1a4c8f
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-072
**bias_check_notes:** India-specific (AML domain) + general SQL patterns.

---

## QUESTION 73: Treasury — FX Forward Pricing

**question_id:** QOR-FNCFLX-073
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** treasury
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** RBI FEMA + FX Forward Pricing Reference

**body:**

A USD/INR 6-month forward rate is quoted at 84.50 (spot 84.00). The interest rate differential between USD and INR is 4.5% (USD rate) and 6.5% (INR rate). Is the forward rate fairly priced per Interest Rate Parity?

**options:**

- A) Yes — Forward = Spot × (1 + r_INR × t) / (1 + r_USD × t) = 84 × (1 + 0.065 × 0.5) / (1 + 0.045 × 0.5) = 84 × 1.0325 / 1.0225 ≈ 84.82. The quoted 84.50 is slightly below theoretical, suggesting the bank prices for arbitrage protection or commission; close enough to fair.
- B) Severely mispriced; arbitrage opportunity
- C) The differential is irrelevant; forward = spot
- D) Cannot determine without more data

**answer_key:**

A — Interest Rate Parity (IRP) formula:
F = S × (1 + r_quote × t) / (1 + r_base × t)
where F = forward rate, S = spot, r_quote = INR rate (quote currency), r_base = USD rate (base currency), t = time in years.

Computation:
F = 84 × (1 + 0.065 × 0.5) / (1 + 0.045 × 0.5)
F = 84 × (1.0325) / (1.0225)
F = 84 × 1.00978
F ≈ 84.82

Quoted 84.50 vs theoretical 84.82 = ₹0.32 spread, ~0.4% commission. Within reasonable bank-spread; not arbitrage. (B), (C), (D) all wrong.

References: Hull "Options, Futures and Other Derivatives" §IRP; Finacle Treasury Module.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-073-seed-2c8a4f1e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-073
**bias_check_notes:** No bias.

---

## QUESTION 74: BSR (Basic Statistical Returns) — RBI Reporting

**question_id:** QOR-FNCFLX-074
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** regulatory-reporting
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** RBI BSR Returns Documentation

**body:**

What does BSR-1 / BSR-2 / BSR-3 cover in RBI reporting?

**options:**

- A) BSR-1 = quarterly Industry-wise Outstanding Credit; BSR-2 = annual Distribution of Bank Branches by State; BSR-3 = annual Distribution of Personnel by State
- B) BSR-1 = monthly cash position; BSR-2 = weekly liquidity; BSR-3 = daily provisioning
- C) Same series; just version numbers
- D) Deprecated; banks file CIBIL instead

**answer_key:**

A — BSR (Basic Statistical Returns) categories:
- **BSR-1**: Industry-wise Outstanding Credit, filed quarterly with RBI.
- **BSR-2**: Distribution of Bank Branches by State (also covers branch openings / closures), filed annually.
- **BSR-3**: Distribution of Bank Personnel by State, filed annually.

These are RBI's foundational statistical inputs for banking sector data + monetary policy. Finacle / Flexcube include BSR-compliant reports out of the box. (B), (C), (D) wrong. References: RBI BSR Documentation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-074-seed-3a9c2f8e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-074
**bias_check_notes:** India-specific.

---

## QUESTION 75: Disaster Recovery — RPO + RTO

**question_id:** QOR-FNCFLX-075
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** disaster-recovery
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** RBI BCP / DR Requirements

**body:**

RBI mandates RPO ≤ 30 minutes and RTO ≤ 4 hours for core banking systems. What's the canonical DR architecture to meet this?

**options:**

- A) Active-active or hot-standby DR: continuous replication (synchronous within metro distance OR async with ≤30min RPO across regions); regular DR drill (RBI mandates quarterly with all-or-nothing failover); RTO ≤ 4h means systems restored + transactions processable within 4h of incident
- B) Cold standby + nightly backup tape; restore within 24h
- C) Single-site only; trust the data centre
- D) Cloud-only; no specific DR design needed

**answer_key:**

A — RBI BCP/DR mandates:
- RPO (Recovery Point Objective): max data loss = 30 min.
- RTO (Recovery Time Objective): max downtime = 4 h.

Canonical architecture:
- Primary: production data centre.
- DR: hot-standby site (different metro / region per RBI guidelines).
- Replication: synchronous if within metro (< 100km); async with ≤30min lag for cross-region.
- Quarterly DR drill: verify failover end-to-end including reconciliation.
- Annual full failover test: customer-impacting drill.

(B) cold standby misses RTO. (C) single-site = catastrophic risk. (D) cloud requires DR design same as on-prem. References: RBI BCP / DR Master Direction.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-075-seed-4e8c1a3f
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-075
**bias_check_notes:** Indian banking RBI compliance.

---

## QUESTION 76: NPA (Non-Performing Asset) Classification

**question_id:** QOR-FNCFLX-076
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** asset-classification
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** RBI NPA Master Circular

**body:**

When does a term loan become NPA per RBI?

**options:**

- A) Term loan is NPA if interest + principal remains overdue for > 90 days; classification cascade: Standard → SMA-0 (overdue 1-30 days) → SMA-1 (31-60) → SMA-2 (61-90) → Substandard (NPA classification kicks in at 90+) → Doubtful (12+ months in substandard) → Loss
- B) NPA when overdue > 30 days
- C) NPA only when borrower formally defaults
- D) NPA classification is subjective; banks decide

**answer_key:**

A — RBI's NPA classification (Income Recognition + Asset Classification + Provisioning Norms):
- **Standard**: Performing, no overdue.
- **SMA-0** (Special Mention Account): overdue 1-30 days (early warning).
- **SMA-1**: overdue 31-60 days.
- **SMA-2**: overdue 61-90 days.
- **Substandard NPA**: overdue > 90 days (NPA classification triggers); requires 15% provisioning.
- **Doubtful NPA**: in Substandard for 12+ months; provisioning increases (25% / 40% / 100% based on age).
- **Loss**: regulatory authority requires write-off; 100% provisioning.

References: RBI Master Circular on Prudential Norms on Income Recognition.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-076-seed-1a7f4c8e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-076
**bias_check_notes:** India-specific compliance.

---

## QUESTION 77: Basel III — Capital Adequacy

**question_id:** QOR-FNCFLX-077
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** basel-iii
**format:** MCQ
**difficulty_b:** 1.1 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Basel III Framework Documentation

**body:**

Per Basel III, what's the minimum Common Equity Tier 1 (CET1) capital ratio for Indian banks?

**options:**

- A) 5.5% (RBI requires; Basel III floor is 4.5%; RBI adds 1% Conservation Buffer for total of 5.5%; Tier 1 minimum 7%; Total Capital minimum 9% per RBI; international Basel III is 4.5% / 6% / 8%)
- B) 4.5% (Basel III global floor)
- C) 8% Tier 1
- D) 10% Total

**answer_key:**

A — RBI's Basel III implementation (more stringent than global):
- **CET1**: minimum 5.5% (Basel III floor 4.5% + 1% Capital Conservation Buffer per RBI).
- **Tier 1**: minimum 7% (Basel III floor 6%).
- **Total Capital**: minimum 9% (Basel III floor 8%).
- Plus Capital Conservation Buffer (CCB) of 2.5% phase-in completed.
- Plus Counter-Cyclical Capital Buffer (CCCB) of 0-2.5% activated by RBI as needed.
- Plus Domestic Systemically Important Banks (D-SIB) surcharge.

References: RBI Basel III Master Circular; Basel III Framework.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-077-seed-9c2a4f1e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-077
**bias_check_notes:** Indian + international.

---

## QUESTION 78: Cards Tokenisation (RBI Mandate)

**question_id:** QOR-FNCFLX-078
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** cards-payments
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** RBI Card Tokenisation Master Direction

**body:**

Per RBI Card Tokenisation mandate (effective 2022), what changed about merchant card storage?

**options:**

- A) Merchants (e.g., Amazon, Swiggy, OTT) no longer store actual card numbers (PAN); they store **tokens** (provided by Card Network Tokenisation Service); for transactions, merchant sends token + CVV, card network detokenises to PAN, processes; PAN never exposed to merchant; reduces fraud + complies with PCI-DSS at scale
- B) Merchants must store card number with stronger encryption
- C) Tokenisation is optional; merchants can choose
- D) Tokenisation deprecated; banks use blockchain instead

**answer_key:**

A — RBI Card Tokenisation rules (effective Oct-2022):
- Merchants prohibited from storing card numbers (PAN) of customers.
- Card-on-file replaced by **Tokens** issued by Card Network (Visa, Mastercard, Rupay) Tokenisation Services.
- Token = card-network-specific identifier; not a PAN.
- Transaction flow: customer + token + CVV (entered each time) → card network detokenises → PAN → bank → customer.
- Reduces fraud (token theft = no PAN compromise); merchants don't need PCI-DSS Level 1.
- Banks integrate via Card Network token APIs in Finacle / Flexcube card module.

(B) wrong — RBI prohibits storage. (C) wrong — mandatory. (D) wrong — RBI tokenisation is the standard.

References: RBI Master Direction — Tokenisation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-fncflx-v0.6-078-seed-3a8c4f1e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-078
**bias_check_notes:** India-specific.

---

## QUESTION 79: Microservices Migration — Legacy Core Banking (Design)

**question_id:** QOR-FNCFLX-079
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** microservices-migration
**format:** design
**difficulty_b:** 1.7 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 20
**citation:** Banking Microservices Migration Best Practices

**body:**

Your bank wants to gradually migrate from monolithic Finacle core banking to a microservices-based architecture. Design the strangler-fig pattern. Cover: domain decomposition, data consistency, integration patterns, performance, regulatory compliance, rollback. 400-600 words.

**answer_key:**

**Strangler-Fig pattern overview:**

Migrate by extracting bounded contexts from the monolith into independent microservices, slowly. The monolith remains the source of truth until each domain is migrated; routing layer redirects traffic to new microservices as they become production-ready.

**Domain decomposition:**

Identify bounded contexts in Finacle:
- **Customer Domain**: customer onboarding, KYC, profile.
- **Account Domain**: account opening / closure, balance management.
- **Transaction Domain**: posting, reversal, settlement.
- **Loan Domain**: origination, servicing, NPA classification.
- **Treasury Domain**: FX, money market, derivatives.
- **Trade Finance Domain**: LCs, BGs, collections.
- **Regulatory Reporting Domain**: BSR, CRR/SLR, AML/STR.

Each becomes a microservice (or service group); ownership clear; data ownership clear (no shared mutable state).

**Data consistency:**

- Transactional Outbox + Change Data Capture (CDC) from Finacle's DB to event stream (Kafka / Pulsar).
- Each microservice has its own database (no shared DB).
- Cross-service consistency via Saga pattern (orchestration / choreography).
- For strict regulatory transactions (account opening must be ACID across customer + account services), use 2PC or TCC carefully — usually monolithic Finacle keeps these until last.

**Integration patterns:**

- API Gateway (Kong / Apigee) routes to monolith or new microservice based on flag.
- Anti-Corruption Layer (ACL) translates between monolith and new microservice protocols.
- Event-driven communication for non-critical flows.

**Performance:**

- Microservices add network latency; mitigate via co-location + service mesh.
- Cache aggregations.
- Batch processing for reporting.

**Regulatory compliance:**

- RBI requires 4-hour RTO + 30-min RPO; microservices architecture supports this with proper DR design.
- AML / STR continues to flow through Finacle until Reg-Reporting domain migrated.
- Audit trail: every event logged immutably (Kafka topics with retention).
- Data sovereignty: ensure microservices run in OCI Mumbai / on-prem.

**Rollback:**

- Each microservice migration: dark launch behind feature flag; A/B compare results vs monolith for 4 weeks; gradual ramp-up; feature flag rollback if issues.
- Monolith stays warm until 6 months post each microservice cutover.

**Phased rollout (24-month plan):**

- Months 1-6: Customer Domain (low-risk, high-volume).
- Months 7-12: Account Domain.
- Months 13-18: Transaction Domain (most critical; longest parallel-run).
- Months 19-24: Loan + Treasury + Trade Finance.
- Reporting Domain: stay on monolith; lower priority.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Data consistency drift between monolith and microservices | CDC + reconciliation jobs daily |
| Performance regression | Service mesh + caching |
| Regulatory non-compliance during transition | Dark launch + parallel-run; incremental flag-based traffic |
| Talent skill gap | Training program; pair with platform engineering team |
| Cost overrun | Incremental phased budget; quarterly checkpoint |

**rubric:** 5/4/3/2/1/0 by completeness — domain decomposition + data consistency + integration + compliance + phased rollout + risks.

**watermark_seed:** qorium-fncflx-v0.6-079-seed-2a4f8c1e
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-079
**bias_check_notes:** No bias.

---

## QUESTION 80: 24-Month Core Banking Modernisation (Case Study)

**question_id:** QOR-FNCFLX-080
**skill_id:** senior-finacle-flexcube
**sub_skill_id:** core-banking-modernisation
**format:** casestudy
**difficulty_b:** 2.0 (Very Hard)
**discrimination_a:** 1.8
**expected_duration_minutes:** 30
**citation:** Indian Bank Core Modernisation Best Practices

**body:**

**Scenario:** A mid-sized Indian Public Sector Bank (250 branches, 12 million customers, ₹1.5 lakh crore deposits) is migrating from Finacle 10.x (15-year-old install) to Finacle 11.x or Flexcube 14.x (cloud-tier). Decision: 24 months. Legacy customisations: 3,000+ patches over 15 years; significant Finacle 10.x reliance. Regulatory: RBI mandates 99.95% uptime; quarterly DR drills; 7-year data retention.

Design the 24-month plan. Cover: vendor selection (Finacle 11 vs Flexcube), data migration strategy, custom code disposition, integration migration, parallel-run, regulatory alignment, business continuity, risk + mitigation. 600-900 words.

**answer_key:**

**Phase 0 (Months 1-3) — Vendor Decision + Foundation:**

- RFP both Finacle 11.x and Flexcube 14.x.
- Decision criteria: Indian-localization depth, RBI compliance fit, customisation flexibility, total cost over 7 years.
- Both have strong India support; Finacle (Infosys) has ~60% Indian PSB market share; Flexcube (Oracle FSS) has ~30%; existing Finacle skill base argues for Finacle 11.x continuity.
- Months 2-3: contract + landing-zone setup; provision Finacle 11.x sandbox + DR.

**Phase 1 (Months 4-9) — Custom Code Triage:**

- Inventory all 3,000 patches from 15 years.
- Categorise:
  - **Retire** (no longer relevant; ~30%): customer requested but never used; vendor-fixed; obsolete.
  - **Standardize** (~20%): re-implement on Finacle 11 standard configuration (avoiding custom code).
  - **Refactor + carry-forward** (~40%): re-implement on Finacle 11 customer-extension framework.
  - **Specialised + carry-forward** (~10%): truly bank-specific; manual port to Finacle 11.
- Each category gets a separate engineering plan.
- Time budget: 6 months for triage + 9 months for customisation work.

**Phase 2 (Months 10-15) — Pilot + Initial Rollout:**

- Pilot: 1 small region (10 branches, 100K customers) — months 10-13.
- 6-week parallel-run with Finacle 10 + Finacle 11.
- Daily reconciliation; tolerance ±0.10 INR per transaction; investigation + fix on every variance.
- Cutover gate: 3 consecutive monthly closes within tolerance; AML / regulatory reports match.
- Rollout: months 14-15 — 50 branches.

**Phase 3 (Months 16-21) — Full Rollout + Integration Migration:**

- Months 16-21: rolling rollout of remaining 200 branches (50 / month).
- Integration migration: SWIFT, RBI reporting (BSR), Card networks, Government remittances (NPCI), Digital banking gateway.
- Each integration gets parallel-run during rollout.

**Phase 4 (Months 22-24) — Stabilisation + Decommission:**

- All 250 branches on Finacle 11 by month 22.
- Finacle 10 in read-only standby through month 24.
- 7-year data retention archived in OCI Object Storage with searchable index for legal / audit.
- Retire Finacle 10 by month 24.

**Data migration:**

- 12M customers + 50M accounts + 7-year transaction history (~5 PB).
- Approach: full bulk-load via Finacle's HCM-equivalent data migration tool.
- Pre-migration data cleansing: KYC compliance check, deduplication, address standardisation. Allocate 4-6 months before migration.
- Migration in waves; per-region, per-product.

**Integration migration:**

- SWIFT: Finacle 11 has native ISO 20022 + MT support.
- RBI reporting (BSR / DSB / CRR/SLR): re-validate on Finacle 11; RBI sign-off required.
- Card networks: re-certify with Visa / Mastercard / Rupay.
- Government remittances: NPCI re-certification.
- Digital banking gateway: API Banking platform sits in front of Finacle.

**Parallel-run:**

- 6-week parallel per region during rollout.
- Daily reconciliation report.
- Cutover gate per region: 3 consecutive monthly closes match Finacle 10 baseline.

**Regulatory alignment:**

- RBI quarterly DR drill performed both on Finacle 10 (during transition) and Finacle 11 (target).
- Annual RBI inspection: bank's audit team needs to re-validate controls in Finacle 11.
- 7-year data retention compliant in target environment.

**Business continuity:**

- Branch staff training: 1-day workshop + on-site mentor for 14 days during cutover.
- Customer notification: 30 days before each region's cutover; brief downtime window (4-8 hours overnight).
- Staff staging: critical operations done during cutover by central operations team.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Custom code regression breaks | Comprehensive test pack; 6-week parallel-run per region |
| Data corruption during migration | 3 dry-runs in TEST environment; per-table data quality checks |
| Bank file format changes break NPCI | NPCI re-certification per quarter; coordination with NPCI 6 months pre-migration |
| Regulatory deadline missed | Buffer 2-month extension built-in; CRO escalation |
| Customer service disruption | 4-8 hour cutover window; pre-staged comms; stand-by call center |
| Project cost overrun | Quarterly TCO review; CFO sign-off on phase gates |
| Vendor support gap | Negotiate 24/7 vendor support clause in contract |

**rubric:** 5/4/3/2/1/0 by completeness — multi-phase plan, regulatory + risk + business continuity, vendor decision, custom code triage, parallel-run.

**watermark_seed:** qorium-fncflx-v0.6-080-seed-7e4a3c1f
**variant_seed:** qorium-fncflx-v0.6-2026-05-07-080
**bias_check_notes:** Indian PSB context.

---

## End of Wave 2 Finacle / Flexcube Extension 061–080

**Set status:** 20/20 v0.6 complete. SME Lead validation pending. **Q081-Q100 in next file.**

# Incident Response Runbook v1.0

**For:** QOrium CTO Office (on-call until M9)  
**Effective:** Month 1 (May 2026) through Month 9  
**Authority:** Constitution Article VIII Operating Cadence; D4 Customer Zero Feedback Charter incident SLAs  
**Owner:** CTO Office — Infrastructure Lead (when hired M2; CTO Office covers solo Phase 1)

---

## §1 SEVERITY DEFINITIONS

Per D4 Customer Zero Feedback Charter §4.1. All definitions are binding SLA triggers.

| Severity | Definition | Example | Fix SLA | Customer Comms SLA |
|---|---|---|---|---|
| **P0** | Assessment delivery broken; no candidate can take assessment | PM2 process down; Postgres unreachable; API rate-limited | 4 hours | 30 min (awareness) |
| **P1** | Wrong-answer discrepancy, score mismatch, material data integrity issue | Q#42 marked wrong but answer is correct; score off by 10 points; leaked question detected | 24 hours | 30 min (awareness) |
| **P2** | UX friction, slow load time, non-blocking degradation | Export takes 5+ min; dropdown sluggish; UI layout broken on mobile | 7 days (next sprint) | 4 hours |
| **P3** | Cosmetic, typo, documentation | Button label inconsistent; typo in help text | Next sprint (14 days) | N/A (internal log) |

---

## §2 INCIDENT CHANNELS

### 2.1 Detection Sources

Incidents detected via:

1. **Talpro Sentinel watchdogs** (5 minimum: PM2 process up, Postgres reachable, Redis reachable, API health /status 200, anti-leak crawler ran <25h ago)
2. **Customer Zero Slack channel** (#qorium-customer-zero) — Talpro Delivery Head flags P0/P1 defects with template (D4 §4.2)
3. **Customer email/Slack** — External customer escalates via vendor channels
4. **Internal monitoring** — CTO Office dashboard alerts, error aggregation (Sentry, Datadog, or equivalent)

### 2.2 War-Room Channel

- **Slack channel:** `#qorium-incidents` (private, invite-only)
- **Members:** CTO, Senior Eng, on-call rotation (Phase 1: CTO solo; Phase 2+: CTO + Senior Eng alternating week-on/week-off)
- **Escalation escalation path:** On-call → CTO → CEO (for customer-facing comms decisions)

### 2.3 External Comms Channel

- **Primary:** Customer Slack channel (per DPA) or email thread
- **Secondary:** If breach suspected → Regulator notification (DPDPA/GDPR per A7 DPA, §5 Breach Notification)
- **Timeline:** Customer awareness (30 min P0/P1) → regulator notification (72 hours from awareness if breach confirmed)

---

## §3 ON-CALL ROTATION (Phase 1)

### 3.1 Phase 1 (Months 1–2)

**Single rotation:** CTO Office is sole on-call.

- **On-call hours:** 24/7 (weekends included)
- **Escalation:** CTO has final call on fix strategy + customer comms
- **Runbook:** CTO Office follows triage steps (§5) for all P0/P1 incidents

### 3.2 Post-M2 Onboarding (Months 3–9)

Once Senior Eng hired + onboarded (target M2):

- **Rotation:** Alternating week-on/week-off (CTO Week 1, Senior Eng Week 2, repeat)
- **On-call hours:** 24/7 during week-on; no interrupts during week-off
- **Escalation tree:**
  - On-call engineer → CTO (if on-call unsure or needs authority)
  - CTO → CEO (for customer-comms decisions, SLA waiver requests, breach notifications)

### 3.3 M9+ (Post-M9 Dedicated SecOps Hire)

- **Dedicated on-call:** Dedicated SecOps/SRE engineer hired M8 (ramp M9)
- **Rotation:** SecOps primary; CTO/Senior Eng secondary escalation only
- **On-call hours:** Standard business hours + weekend on-call rotation

---

## §4 TOP 5 PHASE 1 INCIDENT SCENARIOS

Each scenario includes: detection trigger, triage steps, fix strategy, customer comms template, post-mortem.

---

### SCENARIO 1: Assessment Delivery Broken (PM2 / Database / API Down)

**Severity:** P0 (fix SLA: 4 hours)

**Detection trigger:**
- Watchdog alert: PM2 process not running OR Postgres unreachable OR API health endpoint returns non-200
- Customer report: "All candidates getting 500 errors when starting assessment"

**Triage (§5, steps 1–2):**

1. **Acknowledge (within 5 min):** Post in #qorium-incidents: "🚨 P0 INCIDENT: [component] failure detected at [HH:MM]. Investigating."
2. **Severity assessment (within 15 min):** Determine which subsystem failed:
   - PM2 crash? Check PM2 logs: `pm2 logs qorium-backend --lines 100 --nostream`
   - Postgres unreachable? Check Postgres conn: `psql -U qorium_user -d qorium_prod -c "SELECT 1;"`
   - API rate-limited? Check rate-limit config in N8N or middleware

**Fix strategy (§5, step 3):**

| Scenario | Root Cause | Immediate Action | Fix Timeline |
|---|---|---|---|
| **PM2 process crashed** | OOM, panic, deployment error | `pm2 restart qorium-backend` (if safe); check /var/log/qorium-backend.log for panic | 10 min (restart) |
| **Postgres unreachable** | Connection pool exhausted; network issue; disk full | Check `pg_stat_activity` for hanging conns; kill idle: `SELECT pg_terminate_backend(pid)` if >100 conns; confirm disk space: `df -h /var/lib/postgresql` | 15 min (if conn pool); 1 hour (if disk full) |
| **API rate-limited** | N8N job queue backed up; webhook throttling | Check N8N queue: `SELECT COUNT(*) FROM queue_jobs WHERE status='waiting'`; restart N8N if queue >1000: `pm2 restart n8n` | 10 min (restart) |

**Customer comms (within 30 min of P0 detection):**

```
Subject: QOrium Assessment Service — Incident Notification

Hi [Customer Name],

We've detected an issue affecting candidate assessments starting at [HH:MM UTC]. 
Our team is actively investigating and working toward a fix.

Status: INVESTIGATING  
Expected update: [+30 min from now]

We'll follow up within 30 minutes with either a resolution or updated ETA.

— QOrium Incident Team
```

**Fix confirmation (immediately upon resolution):**

```
Subject: QOrium Assessment Service — RESOLVED

We've identified and fixed the issue. Assessments are now back online.

Root cause: [brief description]
Impact: [X candidates affected, now recovered]
Duration: [HH:MM — HH:MM UTC]

Full post-mortem will be published within 24 hours.

— QOrium Incident Team
```

**Post-mortem (within 24 hours):**
- Timeline of failure, detection, and fix
- Root cause (5-whys analysis)
- What monitoring worked; what missed
- Action items to prevent recurrence (e.g., add connection pool alert at 70% threshold)

---

### SCENARIO 2: Question Leak Detected (Anti-Leak Crawler Alert)

**Severity:** P1 (fix SLA: 24 hours; rotation required within 24 hours)

**Detection trigger:**
- Anti-leak crawler finds ≥1 item with semantic similarity ≥0.85 to known leaked corpus (LeetCode, GeeksforGeeks, HackerRank)
- CTO Office manually reviews similarity report; confirms leak is not false positive

**Triage:**

1. **Acknowledge (within 5 min):** Post in #qorium-incidents: "⚠️ P1 INCIDENT: Question leak detected [question_id]."
2. **Severity assessment (within 15 min):** Confirm leak is real (not FP):
   - Fetch question text + leaked source
   - Calculate semantic similarity using embedding distance (if >0.85, likely real leak)
   - Check if question is already marked "rotated" (if so, downgrade to resolved, log only)

**Fix strategy:**

| Action | Timeline | Owner |
|---|---|---|
| Quarantine leaked question (mark inactive in database) | 30 min | CTO Office |
| Generate 1 replacement question (SME or AI-augmented) | 4 hours | SME Lead or Content Lead |
| Calibrate replacement on reference panel (N≥30) | 24 hours (parallel to above) | IRT analyst |
| Deploy replacement to production | 24 hours | CTO Office |
| Rotation coverage: ensure no assessment uses leaked Q | 24 hours | Content Ops |

**Customer comms (within 30 min):**

```
Subject: QOrium Assessment — Leaked Question Rotation

Hi [Customer Name],

As part of our quality assurance, we've identified one assessment question 
that was found in external online repositories. We're rotating this question 
out of our active library and replacing it with a fresh alternative.

Impact: Minimal (1 of 600 questions in [role] domain)
Timeline: Complete rotation within 24 hours
Your action: No immediate action needed; new version active by [date].

This demonstrates our anti-leak system working as designed.

— QOrium Team
```

**Post-mortem (within 48 hours):**
- How was leak detected? (Crawler algorithm details)
- When did leak first enter our library? (Age analysis)
- Which candidates saw the leaked version? (Retro assessment)
- How many candidates affected?
- Remediation: Did affected candidates re-take assessment with new question?

---

### SCENARIO 3: AI Provider Outage (Anthropic / OpenAI / Gemini Down)

**Severity:** P1 or P0 depending on functionality affected (fix SLA: 24 hours; fallback immediate)

**Detection trigger:**
- API calls to Claude Opus 4.6 (or fallback provider) return 503 Service Unavailable
- N8N workflow logs show "Provider unavailable" errors for question-generation jobs
- Watchdog alert: "AI generation service down"

**Triage:**

1. **Acknowledge:** Post in #qorium-incidents: "⚠️ AI provider outage detected at [HH:MM]."
2. **Assess impact (within 5 min):**
   - Is question generation blocked? (Phase B AI-augmented authoring may pause)
   - Is calibration/scoring blocked? (Rasch calculation uses local models, unaffected)
   - Is candidate assessment blocked? (Uses local evaluation, unaffected)
   - Determine if P0 (candidate impact) or P1 (authoring only)

**Fallback chain:**

| Provider | Status | Fallback | Action |
|---|---|---|---|
| **Claude Opus 4.6** | Down | Gemini 2.0 API | Redirect N8N flow; resubmit batch |
| **Gemini 2.0** | Down | GPT-4o | Redirect N8N flow; resubmit batch |
| **GPT-4o** | Down | Manual SME authoring | Pause Phase B; escalate to CTO |
| **All down (cascade failure)** | Down | Local Llama 3 + fine-tuning | Emergency: use on-VPS Ollama instance (slower, acceptable for non-time-critical) |

**Fix strategy:**

1. **Activate fallback (within 5 min of detection):** If Claude unreachable for >5 min, auto-redirect N8N jobs to Gemini
2. **Monitor fallback (continuous):** Check latency + error rate of fallback provider
3. **Resume primary (when upstream recovers):** Once Claude healthy again, resume routing to primary (requires manual trigger to avoid switching mid-batch)
4. **No customer impact:** If only authoring affected (P1), no customer-facing outage; continue as-is

**Customer comms (only if P0; if P1 authoring delay, internal log only):**

```
No customer comms required (P1 authoring delay is internal). Log in #qorium-incidents only.
```

**Post-mortem (within 24 hours):**
- Provider outage duration and scope
- Fallback performance (latency, quality vs. primary)
- Batch completion time with fallback
- Recommendations: Should we pre-cache or batch more aggressively?

---

### SCENARIO 4: Database Failover / Data Integrity Issue (Postgres PITR Needed)

**Severity:** P0 or P1 depending on data loss scope (fix SLA: 4 hours P0; 24 hours P1)

**Detection trigger:**
- Postgres replication lag exceeds 60 seconds (watchdog alert)
- Disk corruption detected on primary node
- Point-in-time recovery needed (accidental DELETE or UPDATE)
- Data integrity check fails: `SELECT COUNT(*) FROM questions WHERE updated_at > NOW() - INTERVAL '1 hour'` returns unexpected low count

**Triage:**

1. **Acknowledge:** Post in #qorium-incidents: "🚨 P0: Database integrity issue detected. Standby replica status: [SYNC/LAG/UNKNOWN]."
2. **Determine scope (within 10 min):**
   - Replication lag? Check: `SELECT EXTRACT(EPOCH FROM (now() - pg_last_wal_receive_lsn()))::INT AS lag_seconds;`
   - Corruption? Check: `PRAGMA integrity_check;` (if SQLite) or filesystem check
   - Accidental DELETE? Check pg_stat_user_tables for `n_tup_del` spike in last 5 min

**Fix strategy:**

| Scenario | Root Cause | Fix Action | Timeline |
|---|---|---|---|
| **Replication lag >60s** | Network latency; writes exceeding replication throughput | Check network: `iftop` or `netstat -an | grep ESTABLISHED`; throttle writes if needed; restart replication: `SELECT pg_ctl_reload_standby()` (if available) or manual restart | 15 min |
| **Disk corruption** | Hardware failure; filesystem corruption | Failover to standby immediately: `pg_ctl promote -D /var/lib/postgresql/data` (on standby); order replacement disk; restore from PITR if needed | 10 min (failover) + 1 hour (restore if needed) |
| **Accidental DELETE/UPDATE** | Human error or app bug | Restore from PITR to point 5 min before DELETE: `pg_basebackup -D /tmp/recover -Xstream` + PITR restore script | 30 min |

**PITR restore procedure (if needed):**

```bash
# 1. Stop writes to primary
# 2. Backup current state (optional, for forensics)
pg_basebackup -D /var/lib/postgresql/data.backup -Xstream -v

# 3. Restore to target time (e.g., 10 min ago)
export TARGET_TIME="2026-05-15 14:35:00 UTC"
pg_basebackup -D /var/lib/postgresql/data.restore -Xstream -v
pg_ctl start -D /var/lib/postgresql/data.restore

# 4. Verify data integrity
psql -U qorium_user -d qorium_prod -c "SELECT COUNT(*) FROM questions;"
psql -U qorium_user -d qorium_prod -c "SELECT COUNT(*) FROM responses;"

# 5. If verified, promote restored DB and resume writes
pg_ctl promote -D /var/lib/postgresql/data.restore
```

**Customer comms (P0 only; if P1 data lag, internal log):**

```
Subject: QOrium Assessment Service — Brief Service Interruption

We experienced a brief database issue at [HH:MM UTC] affecting ~[X] minutes of service. 
Our team performed a failover to ensure data integrity and resume normal operations.

Affected candidates: [X] assessments may need to be retaken (we're offering make-up windows)
Timeline: Resolved at [HH:MM UTC]

— QOrium Incident Team
```

**Post-mortem (within 24 hours):**
- Root cause (hardware? replication lag? app bug?)
- PITR duration and data recovered
- Candidates affected; retake rate
- Prevention: Auto-promotion on failover? Replication monitoring improvements?

---

### SCENARIO 5: Customer Data Breach Suspected (DPDPA/GDPR Notification Required)

**Severity:** P0 (fix SLA: 4 hours containment; notification SLA: 72 hours to regulator per DPDPA)

**Detection trigger:**
- Unauthorized access detected to `candidates` or `assessment_responses` table (via audit logs or Sentinel alert)
- File-system intrusion detected (e.g., /opt/qorium-backend/.env accessed from unknown IP)
- Accidental data export sent to wrong recipient (e.g., unencrypted CSV with PII emailed to external party)

**Triage:**

1. **Acknowledge (within 5 min):** Post in #qorium-incidents: "🚨 P0 POTENTIAL BREACH: [description]. Initiating containment."
2. **Assess scope (within 15 min):**
   - What data exposed? (Candidate names? Emails? Assessments? Scores?)
   - How many records? (Row count)
   - Duration of exposure? (When first exposed? When discovered?)
   - Who has access? (Is attacker still connected?)

**Containment (within 30 min):**

| Action | Timeline | Owner |
|---|---|---|
| Isolate affected database/server (kill suspicious connections) | 10 min | CTO |
| Disable affected user accounts / API keys | 10 min | CTO |
| Change DB passwords; rotate secrets | 15 min | CTO |
| Enable enhanced logging on affected systems | 15 min | CTO |
| Notify CEO + external legal counsel | 20 min | CTO |

**Investigation (within 4 hours):**

- Forensics: Review audit logs for unauthorized access patterns
- Scope confirmation: Exactly which records were accessed/copied?
- Attacker attribution: IP logs, lateral movement, persistence mechanisms?

**DPDPA/GDPR notification (within 72 hours of confirmed breach):**

Per Constitution A7 DPA §5 Breach Notification:

```
NOTIFICATION TO DATA SUBJECT (email template):

Subject: Security Notice — QOrium Data Protection Incident

Dear [Candidate Name],

On [DATE], we discovered an unauthorized access to our assessment platform.

Details:
- Data affected: [Candidate name, email, assessment scores]
- Date of incident: [DATE TIME UTC]
- Date discovered: [DATE TIME UTC]
- Individuals affected: [COUNT]

Actions we've taken:
- Contained the breach (isolated affected systems)
- Notified law enforcement / regulatory authority
- Engaged external security forensics firm

Your rights:
- Free credit monitoring for 12 months (via [PROVIDER])
- Right to erasure: reply to request deletion of your data
- Further details: [Privacy statement + FAQ link]

Contact: [Legal team email]

— QOrium Data Protection Officer
```

**Regulator notification (within 72 hours of confirmation):**

- **DPDPA:** Notify National Informatics Centre (NIC) Data Protection Authority
- **GDPR:** Notify relevant EU data protection authority (if EU candidates affected)
- **Content:** Date, scope, individuals affected, remediation, contact info

**Customer/Talpro comms (within 72 hours, coordinated with legal):**

- Notify Talpro Delivery Head in #qorium-customer-zero: "Data incident affects [X] candidate records from your assessments. Forensics underway. Candidates being notified. Updates daily."

**Post-mortem (within 7 days):**
- Root cause (stolen credentials? SQL injection? misconfiguration?)
- Timeline: First access → detection → containment
- Lessons learned: Where did monitoring fail?
- Preventions: MFA enforcement? Secrets rotation cadence? Least-privilege access review?

---

## §5 TRIAGE PLAYBOOK (5 STEPS FOR ANY INCIDENT)

Every P0/P1 incident follows these 5 steps in order:

### Step 1: Acknowledge (within 5 minutes)

- Post incident summary in #qorium-incidents:
  ```
  🚨 [P0/P1] INCIDENT: [short description]
  Detected: [HH:MM UTC]
  Status: INVESTIGATING
  Owner: [name]
  ```
- On-call engineer reads thread within 1 min (if asleep, phone call from CTO)

### Step 2: Severity Assessment & ETA (within 15 minutes)

- Determine severity (P0/P1/P2) based on §1 definitions
- Provide **realistic** ETA for fix: "We believe we can fix this by [HH:MM UTC] based on [reason]"
- Identify root cause hypothesis
- Post update in #qorium-incidents:
  ```
  Severity confirmed: [P0/P1]
  Root cause hypothesis: [brief description]
  Fix ETA: [HH:MM UTC] (best guess; will update every 30 min)
  ```

### Step 3: Customer Comms (within 30 minutes P0/P1; within 4 hours P2)

- For P0/P1: Post brief notification to customer in #qorium-customer-zero or email
- Include: what's affected, ETA, how to escalate if urgent
- Use template from §4 (incident scenario)
- **No estimated timelines unless confident** (say "investigating" if unsure)

### Step 4: Mitigation (parallel to step 2–3)

- Deploy a fix (or workaround) by ETA specified in Step 2
- If fix unavailable: implement workaround (e.g., manual rotation of leaked question, temporary rate-limit reduction)
- Test fix in non-prod environment first (if time allows); if P0 + time-critical, deploy to prod with rollback plan ready

### Step 5: Resolution & Post-Mortem (within 24 hours)

- Post resolution in #qorium-incidents + customer channel:
  ```
  ✅ RESOLVED at [HH:MM UTC]
  Root cause: [description]
  Impact: [X candidates, [Y] assessments affected; all now recovered]
  Post-mortem: Will be published within 24 hours
  ```
- Schedule post-mortem within 24 hours (next available, same team or CTO + owner)
- Post-mortem output: /governance/incidents/INCIDENT-[ID]-post-mortem.md (see §6 template)

---

## §6 POST-MORTEM TEMPLATE

**File location:** `/governance/incidents/INCIDENT-[ID]-YYYY-MM-DD-post-mortem.md`

```markdown
# Post-Mortem: [Incident Title]

**Incident ID:** [ID]  
**Date:** [YYYY-MM-DD]  
**Duration:** [HH:MM — HH:MM UTC]  
**Severity:** [P0/P1/P2]  
**Owner:** [Name]  
**Attendees:** [Names]

## Timeline

| Time (UTC) | Event |
|---|---|
| HH:MM | Incident detected via [method] |
| HH:MM | Root cause hypothesis: [brief] |
| HH:MM | Mitigation deployed |
| HH:MM | Resolution confirmed |

## Root Cause (5-Whys)

**Why 1?** [System failed because X]  
**Why 2?** [X happened because Y]  
**Why 3?** [Y happened because Z]  
**Why 4?** [Z happened because W]  
**Why 5?** [W happened because V — ROOT CAUSE]

**Root cause:** [Final conclusion in 1 sentence]

## What Worked

- [Monitoring alert triggered in time]
- [Rollback procedure executed cleanly]
- [Team communication clear + fast]

## What Didn't Work

- [Monitoring gap: X should have alerted 10 min earlier]
- [No automated failover: manual step took 15 min]
- [Customer comms template not clear; took 20 min to draft]

## Action Items (for next sprint)

| Action | Owner | ETA | Priority |
|---|---|---|---|
| [Implement automated failover for DB] | Senior Eng | [YYYY-MM-DD] | High |
| [Add monitoring rule for connection pool >70%] | CTO | [YYYY-MM-DD] | High |
| [Update incident comms templates] | CTO Office | [YYYY-MM-DD] | Medium |

## Learning

[1–2 paragraphs: what we learned; how this makes us better]

---

**No-blame language used throughout. This is a learning document, not a blame document.**
```

---

## §7 COMMUNICATION TEMPLATES

### Template A: We're Investigating (≤30 min from detection, P0/P1)

```
Subject: [SERVICE] — Incident Notification [HH:MM UTC]

Hi [Customer Name / #qorium-customer-zero channel],

We've detected an issue affecting [specific service/feature] starting at [HH:MM UTC].

Current status: INVESTIGATING  
Affected users: [X customers / X candidates]  
Next update: [+30 min from now]

We're working to resolve this as quickly as possible.

— QOrium Incident Team
```

### Template B: We Have a Fix (immediately upon resolution, P0/P1)

```
Subject: [SERVICE] — RESOLVED [HH:MM UTC]

We've identified and fixed the issue.

Root cause: [1 sentence]  
Impact: [X candidates / X assessments affected; now recovered]  
Duration: [HH:MM — HH:MM UTC] ([X] min outage)  
Status: ✅ RESOLVED

Full post-mortem will be published within 24 hours.

— QOrium Incident Team
```

### Template C: Post-Mortem Published (within 7 days, P0/P1)

```
Subject: Post-Mortem: [Incident Title] [Date]

We've published our post-mortem analysis of the incident on [Date].

Key takeaway: [1 sentence root cause]  
Preventions: [1–2 bullet points on what we'll do differently]  

Link: [governance/incidents/INCIDENT-ID-post-mortem.md]

Questions? Reply to this thread.

— QOrium Incident Team
```

### Template D: Regulator Notification (if DPDPA/GDPR breach, within 72 hours)

```
To: [National Informatics Centre Data Authority / EU DPA]
Subject: Data Breach Notification per DPDPA §6

Organization: QOrium  
Data Controller: [CEO Name + Email]  
Date of breach: [YYYY-MM-DD]  
Date of discovery: [YYYY-MM-DD]  
Individuals affected: [COUNT]  
Categories of data: [candidate names, email, assessment scores, IP addresses]  
Measures taken: [containment, forensics, notification of individuals]  
Contact: [Legal team email]  

[Detailed description per DPDPA Schedule 2 or GDPR Article 34]
```

---

## §8 WATCHDOGS TO REGISTER AT DEPLOY (5 Minimum)

CTO Office registers 5 minimum watchdogs (per talpro_watchdog_add MCP tool) at production deploy:

| Watchdog | Check | Interval | Alert Threshold | Escalation |
|---|---|---|---|---|
| **PM2 process up** | Is `qorium-backend` running? | 2 min | Process down ≥1 cycle | Immediate P0 |
| **Postgres reachable** | Can connect to primary + standby? | 2 min | Unreachable >3 cycles | Immediate P0 |
| **Redis reachable** | Can connect + PING response OK? | 2 min | Unreachable >3 cycles | Immediate P0 |
| **API health /status** | HTTP GET /status returns 200? | 1 min | Non-200 >5 cycles | Immediate P0 |
| **Anti-leak crawler latest run** | Did crawler run in last 25 hours? | 24 hours | Last run >25 hours ago | Daily P2 escalation if missing |

**CTO Office registers these in first deploy week (May 2026):**

```bash
talpro_watchdog_add app=qorium-backend health_url=http://localhost:8080/status interval_min=2
talpro_watchdog_add app=postgres health_url=http://localhost:5432 interval_min=2
talpro_watchdog_add app=redis health_url=http://localhost:6379 interval_min=2
talpro_watchdog_add app=anti-leak-crawler health_url=http://localhost:9091/metrics interval_min=1440 (24h)
```

---

## §9 DRILL CADENCE

### Monthly Tabletop (2nd Thursday of every month, 11:00 AM IST)

- **Participants:** CTO, Senior Eng (when hired), SME Lead
- **Format:** 30-min scenario walkthrough (no actual changes; discussion only)
- **Scenario:** Rotate monthly (Scenario 1, 2, 3, 4, 5 in order)
- **Output:** Action items if gaps identified (e.g., "our runbook says X but actual procedure is Y")
- **Recording:** Optional

### Quarterly Live DR Drill (1st week of Q3/Q4, during business hours)

- **Participants:** CTO + Senior Eng + on-call
- **Scope:** Database restore from PITR (Scenario 4 live action)
- **Environment:** Staging database (not production)
- **Steps:**
  1. Simulate database corruption or accidental DELETE
  2. Restore from PITR to 15 min ago
  3. Verify data integrity
  4. Promote restored DB as primary (if needed)
  5. Run smoke tests on restored data
- **Success criteria:** Restore + validation + failover complete in <2 hours
- **Post-drill:** Document actual vs. planned times; update runbook

---

## §10 REFERENCES & CROSS-LINKS

- **A7 DPA:** QOrium Data Protection Agreement, §5 Breach Notification
- **D4 Customer Zero Charter:** §4 Defect Handling SLA
- **Operating Rituals v1.0:** §2.2 Friday Eng Notes production health reporting
- **Constitution Article VIII:** Operating Cadence; Section 2 Gatekeeper quality gate
- **Incident Response MCP:** talpro_incident_open, talpro_incident_update, talpro_incident_close

---

**End of Incident Response Runbook v1.0. Effective May 2026 — March 2027 (until M9).**

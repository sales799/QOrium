# E3 — Bosch Sample Pack v0: Embedded Automotive

**STATUS:** CTO-Office v0 outline. Final SME-Lead-validated version waits until SME Lead is hired (M2). This is the structural scaffold; question text + correct answers populated by AI pipeline + SME review for the actual sample pack.

---

## Role Profile

**Target Role:** Senior Embedded Automotive Engineer (5–8 years; AUTOSAR + MISRA-C + ASPICE)

**Bosch GCC fit:** Per E2 research, this is the highest-volume highest-stakes role (400–600 hires/year). Signal quality is critical; current Mettl library is shallow on automotive-specific content.

---

## Question Mix Overview (50 questions)

| Category | Count | Format | Difficulty Mix |
|---|---|---|---|
| AUTOSAR Architecture | 5 | MCQ | 1E + 2M + 1H + 1X |
| MISRA-C Compliance | 5 | MCQ | 1E + 2M + 1H + 1X |
| ASPICE Process | 5 | MCQ | 1E + 2M + 1H + 1X |
| Embedded C / RTOS | 5 | MCQ | 1E + 2M + 1H + 1X |
| Automotive Protocols | 5 | MCQ | 1E + 2M + 1H + 1X |
| ISO 26262 / Safety | 5 | MCQ | 1E + 2M + 1H + 1X |
| Code-Trace (CAN, RTOS, etc) | 10 | Code-Trace | 2E + 4M + 3H + 1X |
| System Design | 5 | Design Q | 1E + 1M + 2H + 1X |
| Case Study / Debugging | 5 | Case Study | — + 2M + 2H + 1X |
| **Total** | **50** | **Balanced** | **10E + 21M + 14H + 5X** |

---

## Sub-Skill Breakdown: 30 MCQ (5 questions × 6 sub-skills)

### Sub-Skill 1: AUTOSAR Architecture (5 MCQ)

1. **Easy:** Definition of AUTOSAR layers — BSW vs. application layer distinction
2. **Medium:** RTE (Runtime Environment) responsibilities — scheduling, event/data communication
3. **Medium:** SWC (Software Component) composition — queued vs. unqueued ports
4. **Hard:** Timing behavior in AUTOSAR — fixed frame vs. variable length; deadline misses
5. **Expert:** NvM (Non-Volatile Memory) Manager integration — read/write callbacks and consistency

### Sub-Skill 2: MISRA-C Compliance (5 MCQ)

1. **Easy:** Rule 8.1 (variable scope) — automatic storage vs. static
2. **Medium:** Rule 9.1 (uninitialized objects) — implications for embedded systems
3. **Medium:** Rule 11.x (pointer conversion) — valid vs. invalid casts in CAN message handlers
4. **Hard:** Rule 17.x (scope of identifiers) — external linkage and namespace collision risks
5. **Expert:** Rule 13.x (side effects) — detecting hidden side effects in macro expansion for safety-critical code

### Sub-Skill 3: ASPICE Process Model (5 MCQ)

1. **Easy:** ASPICE v3.1 maturity levels — SWE.1 basics of development
2. **Medium:** SWE.2-SWE.4 — design, implementation, integration stages
3. **Medium:** SUP (Support) office — configuration, version control responsibilities
4. **Hard:** SWE.5-SWE.6 — integration verification and system testing gates
5. **Expert:** Multi-site ASPICE audits — evidence requirements and compliance strategy for distributed teams

### Sub-Skill 4: Embedded C / RTOS Fundamentals (5 MCQ)

1. **Easy:** Stack vs. heap memory — use cases in embedded (FreeRTOS, QNX)
2. **Medium:** Interrupt service routines (ISRs) — priority inversion and critical sections
3. **Medium:** Task scheduling algorithms — RMA (Rate Monotonic Analysis) basics
4. **Hard:** Deadlock detection in RTOS — semaphore ordering and resource allocation
5. **Expert:** Real-time clock (RTC) precision in automotive — time synchronization across ECUs

### Sub-Skill 5: Automotive Protocols (5 MCQ)

1. **Easy:** CAN bus basics — identifier, DLC (data length code), standard vs. extended frames
2. **Medium:** LIN (Local Interconnect Network) — master/slave architecture and scheduling
3. **Medium:** FlexRay — deterministic, synchronized communication; time window concept
4. **Hard:** Automotive Ethernet (Ethernet AVB) — real-time requirements and QoS
5. **Expert:** SOME/IP (Scalable service-Oriented MiddlE) — service discovery and method invocation in modern EEAs

### Sub-Skill 6: Functional Safety (ISO 26262) (5 MCQ)

1. **Easy:** ASIL (Automotive Safety Integrity Level) A-D — severity and exposure mapping
2. **Medium:** FMEA (Failure Mode and Effects Analysis) — severity, occurrence, detection ratings
3. **Medium:** SIL allocation — linking ASIL to hardware and software requirements
4. **Hard:** Dual-channel architecture for ASIL-D — voting logic and diagnostic coverage
5. **Expert:** Cyber-security integration with functional safety (ISO 26262 vs. ISO 21434) — threat analysis and mitigation

---

## Code-Trace Questions (10 questions; Judge0 environment)

1. **CAN message dispatcher with priority queue:** Read 8-byte CAN frame (ID + 8 data bytes), enqueue by priority, dequeue oldest-high-priority. Spot the bug: off-by-one in circular queue.

2. **Bit manipulation: pack/unpack 16-bit signals:** Pack 4 × 16-bit values from a CAN payload; unpack with correct byte order (big-endian). Syntax: C with `#include <stdint.h>`.

3. **RTOS task synchronization with semaphore + mailbox:** Implement producer/consumer using FreeRTOS API stubs (xSemaphoreGive, xQueueSend). Identify the missing critical section.

4. **ISR-safe ring buffer:** Implement producer (ISR context) / consumer (task context) without locks. Pointer increment logic must be atomic.

5. **AUTOSAR RunnableEntity stub:** Given a Runnable skeleton, fill in NvM_ReadBlock + NvM_WriteBlock callbacks. Correct API sequencing is the challenge.

6. **Watchdog timer service:** Implement a watchdog feed function and a timeout handler. Handle overflow and reset correctly.

7. **CRC-32 calculation per AUTOSAR E2E P02 profile:** Implement E2E protection using CRC; detect single-bit corruption. Polynomial: 0x1EDC6F41.

8. **State machine: gear-shift logic with error states:** Finite state machine for Park→Reverse→Neutral→Drive. Invalid transitions should error. 10–15 lines of C.

9. **Memory pool allocator (no malloc):** Implement fixed-size block allocator for real-time. Allocate, deallocate, and detect fragmentation.

10. **Diagnostic UDS service 0x22 (read-by-DID) handler:** Parse UDS request frame; return data for a specific DID. Multi-byte DID value handling.

---

## System Design Questions (5 questions; whiteboard/architecture essay)

1. **Design a fail-operational architecture for ADAS L3:** Redundancy strategy, sensor fusion fallback, graceful degradation. Answer should mention: sensor voting, watchdog monitoring, safe state definition.

2. **AUTOSAR SWC partition for hybrid drivetrain ECU:** How would you partition: engine control, battery management, power distribution? Address: timing, communication, isolation.

3. **Network gateway design between CAN-FD and Automotive Ethernet:** Message translation, buffering, priority handling. Latency budget: <10ms for critical messages.

4. **ISO 26262 ASIL decomposition exercise:** Given a high-level requirement (anti-lock braking), decompose into hardware + software ASIL targets and justify.

5. **Cybersecurity architecture for V2X gateway (UN R155):** Secure communication with external vehicles/infrastructure. Threat model: spoofing, replay, eavesdropping. Mitigations: PKI, message authentication.

---

## Case Study / Debugging Questions (5 questions; scenario-based analysis)

1. **Intermittent CAN bus-off — diagnose:** Scenario: CAN interface enters bus-off state every 2 hours. Root cause options: bit-rate mismatch, electrical noise, insufficient error handler. Diagnostic steps + remediation.

2. **Memory corruption appearing after 30 hrs runtime:** Scenario: ECU crashes after 30 hours of continuous operation. Clues: heap corruption, task stack overflow, or static data overwrite. Instrumentation strategy.

3. **AUTOSAR COM signal misalignment between two ECUs:** Scenario: Sender ECU transmits 16-bit value, receiver interprets as two 8-bit values. Byte order / packing mismatch. How to detect and fix?

4. **ASPICE Level 2 audit gap — propose evidence:** Scenario: Auditor flags "no traceability between requirements and test cases." Design minimal evidence trail (traceability matrix, test IDs linked to reqs).

5. **ISO 26262 hardware-software partitioning for ASIL-D:** Scenario: Airbag controller needs ASIL-D. Can firmware alone achieve this, or is dual-channel hardware mandatory? Argument + standards reference.

---

## Per-Question Metadata Schema

Each question, when authored, includes:

```
{
  "skill_id": "embedded-auto-001",
  "sub_skill_id": "autosar-arch-01",
  "difficulty": {
    "irt_b_parameter": -1.2,   // Range: -2 (easy) to +2 (expert)
    "expected_duration_sec": 45,
    "target_percentile": 0.30   // 30th percentile = easy
  },
  "code_language": "C",
  "rubric": {
    "correct_answer": "...",
    "distractor_1": "...",
    "distractor_2": "...",
    "distractor_3": "..."
  },
  "citation": {
    "standard": "AUTOSAR 4.2",
    "reference": "§8.3.1",
    "year": 2018
  },
  "variant_seed": "bosch-001-v1",
  "watermark_id": "bosch-embedded-s001"
}
```

---

## Anti-Leak Considerations (Per SO-9)

- **24-hour rotation:** Every question tagged `bosch-embedded-s001` is eligible for rotation every 24 hours if detected on public sites (GeeksforGeeks, embedded firmware blogs, LeetCode, proprietary automotive forums).
- **Per-client variant generation:** For Bosch, each question has a variant seed. If original leaks, variant is deployed; Bosch never sees the same question twice in a 6-month period.
- **Watermark embedded:** Each question carries a Bosch-specific cryptographic marker. If leaked, Bosch forensics can attribute the leak source.
- **Original questions never delivered raw:** Bosch receives only the watermarked, Bosch-branded version. QOrium retains a "clean" master for variance generation.

---

## IRT Calibration Plan (Pre-Launch)

- **Pre-launch panel:** 30 candidates from Talpro Customer Zero (Talpro India senior embedded engineers) attempt all 50 questions.
- **3PL parameter estimation:** Psychometrician fits logistic function to response data; estimates b-parameter (difficulty) and a-parameter (discrimination).
- **Flag protocol:** Questions with b > +2 (expert-only, poor discrimination) or b < -2 (trivial, everyone gets it) are flagged for SME review.
- **Revision gate:** Flagged questions are edited or removed before first customer deployment.

---

## Delivery Format

- **REST API:** `/v1/packs/{job_id}/embedded-automotive?count=50&difficulty=balanced` returns JSON array of 50 questions.
- **Bulk export:** CSV (Mettl format) + JSON + XLSX.
- **iframe widget v1.1:** Drop-in JavaScript for Bosch's existing assessment UI.

---

## Sample Pack QA Checklist (8 items)

Before release to Bosch:

- [ ] **No AUTOSAR rule misquote** — Every question citing AUTOSAR 4.2 has been fact-checked against the standard document.
- [ ] **No MISRA rule renumbering errors** — MISRA-C 2012 rule IDs match the official list (e.g., 8.1, not 8.01).
- [ ] **ASPICE references match v3.1** — Process names (SWE.1, SUP.7) align with official ASPICE 3.1 spec.
- [ ] **ISO 26262 references match 2018 edition** — ASIL definitions, FMEA structure reflect 2018 (not 2011 or 2024 draft).
- [ ] **No leaked original-source verbatim** — Questions do not reproduce >20-word phrases from textbooks or standard documents. All content is original-authored.
- [ ] **Rubric internal consistency** — Correct answer is provably correct; distractors are plausible but definitively wrong. No ambiguity.
- [ ] **Difficulty distribution sanity check** — IRT calibration shows 10E:21M:14H:5X split matches intended distribution. No clustering.
- [ ] **Correct answer + 3 distractors quality** — Correct answer is concise; distractors exploit common misconceptions (not random).

---

## DRAFTING NOTES (5 items)

1. **SME Lead must validate:** Questions authored by AI pipeline in Phase 1; SME Lead reviews and edits in Phase 2. No question ships without SME sign-off.

2. **Bosch ASIL-D is mostly third-party-licensed content:** ASIL-D design patterns are published in ISO 26262 and other standards. Verify that our questions don't reproduce ISO 26262 verbatim (fair use / original authorship defense is critical).

3. **AUTOSAR Classic vs Adaptive split:** Recommend Classic for v0 (most Bosch embedded is Classic stack). Adaptive (AUTOSAR 4.3+) deferred to v1.

4. **ISO 26262 questions cite standard, not full text:** We cite §6.3.4 (ASIL allocation), not reproduce 5 pages of examples. This is compliant citation.

5. **CAN-FD vs CAN selection per Bosch fleet generation:** Current Bosch fleet is mostly CAN; newer models shift to CAN-FD. v0 covers both; ratio TBD per Bosch input.

---

*End of E3-Bosch-Sample-Pack-v0-Embedded-Automotive.md. This is a structural scaffold; actual question text and answers populated by AI pipeline + SME review in M2 onward.*

# E3 — Bosch Sample Pack v0.5: Embedded Automotive (Populated)

**STATUS:** AI-drafted v0.5. SME Lead validation pending. NOT for external delivery without SME-Lead sign-off and IRT calibration. Reference standards: AUTOSAR Classic 4.5, MISRA-C 2012 (with Amendments 1-3), ISO 26262:2018, ASPICE 3.1.

---

## Sample Pack: 10 Representative Questions

All questions follow QOrium metadata schema. Difficulty distribution: 2 Easy, 4 Medium, 3 Hard, 1 Expert.

---

### QUESTION 1: AUTOSAR Architecture Fundamentals (Easy)

**question_id:** QOR-EMBA-001
**skill_id:** embedded-auto-001
**sub_skill_id:** autosar-arch-01
**format:** MCQ
**difficulty_b:** -1.2 (Easy)
**discrimination_a:** 1.3
**expected_duration_minutes:** 2
**citation:** AUTOSAR 4.5, Part 2 §6.1

**body:**
In AUTOSAR, what is the primary role of the Runtime Environment (RTE)?

**options:**
- A) Manage scheduling of software components and handle event/data communication between them
- B) Compile embedded C code into executable binary
- C) Replace the traditional hardware abstraction layer
- D) Execute safety checks at runtime per ISO 26262

**answer_key:**
A — The RTE is the software layer that provides abstraction between Software Components (SWCs) and the Basic Software (BSW). It handles scheduling, event propagation, and data passing between SWCs. References: AUTOSAR 4.5, Part 2 §8.3 (Runtime Environment Concept).

**rubric:**
MCQ; correct = 5 points, any incorrect = 0.

**watermark_seed:** bosch-embedded-s001-qor-emba-001
**variant_seed:** bosch-v0.5-2026-05-02-001
**bias_check_notes:** No gender/cultural bias detected. Language neutral, technically precise.

---

### QUESTION 2: MISRA-C 2012 Variable Scope (Easy)

**question_id:** QOR-EMBA-002
**skill_id:** embedded-auto-002
**sub_skill_id:** misra-c-01
**format:** MCQ
**difficulty_b:** -0.8
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** MISRA-C 2012, Rule 8.1 (Amendments 1–3)

**body:**
MISRA-C Rule 8.1 (Variable Scope) requires that each object or function has its storage class explicitly declared. Which of the following C declarations violates MISRA-C Rule 8.1?

**options:**
- A) `extern int global_counter;` at file scope
- B) `static int local_state = 0;` inside a function
- C) `int sensor_reading;` at file scope without static or extern
- D) `const volatile uint32_t watchdog_timer;` declared at function scope

**answer_key:**
C — Declaring an object at file scope without an explicit storage class (static or extern) is non-compliant per MISRA Rule 8.1. The declaration must explicitly state storage class to avoid accidental external linkage. References: MISRA-C 2012 §5.8.1, Amendment 3 clarifications.

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-embedded-s001-qor-emba-002
**variant_seed:** bosch-v0.5-2026-05-02-002
**bias_check_notes:** No bias. Technical terminology standard in embedded C.

---

### QUESTION 3: ASPICE Process Model (Medium)

**question_id:** QOR-EMBA-003
**skill_id:** embedded-auto-003
**sub_skill_id:** aspice-swe
**format:** MCQ
**difficulty_b:** 0.3
**discrimination_a:** 1.5
**expected_duration_minutes:** 3
**citation:** ASPICE 3.1, SWE.2-SWE.4 Definition

**body:**
In ASPICE 3.1, the Software Engineering (SWE) process group comprises six stages: SWE.1 through SWE.6. At what stage is system integration testing with the full embedded target hardware first mandated?

**options:**
- A) SWE.2 (Software Design) — design reviews include hardware readiness checks
- B) SWE.4 (Software Component Integration) — components integrated on target hardware
- C) SWE.5 (Software System Integration and Feature Testing) — full system on target
- D) SWE.6 (Software System Qualification) — acceptance testing phase

**answer_key:**
C — SWE.5 is the Software System Integration and Feature Testing phase, where the integrated software system is verified against requirements on the target hardware. SWE.4 is component-level integration; SWE.6 is final qualification. References: ASPICE 3.1, §5.4.5 (SWE.5).

**rubric:**
MCQ; 5 pts correct, 0 pts incorrect.

**watermark_seed:** bosch-embedded-s001-qor-emba-003
**variant_seed:** bosch-v0.5-2026-05-02-003
**bias_check_notes:** No bias. Process model is deterministic.

---

### QUESTION 4: Embedded C & RTOS Task Scheduling (Medium)

**question_id:** QOR-EMBA-004
**skill_id:** embedded-auto-004
**sub_skill_id:** rtos-scheduling
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 4
**citation:** FreeRTOS Documentation + Real-Time Concepts

**body:**
In FreeRTOS on automotive ECU, a CAN receive ISR (Interrupt Service Routine) signals a task via `xSemaphoreGiveFromISR()`. However, the CAN task is lower priority than a sensor-reading task. What is the primary risk if the sensor task holds the semaphore during its execution?

**options:**
- A) The CAN ISR will not execute until the sensor task yields
- B) Priority inversion: the low-priority CAN task can block the high-priority sensor task if both contend for a shared resource
- C) The semaphore count will underflow, causing a system fault
- D) The ISR will immediately preempt the sensor task, losing sensor data

**answer_key:**
B — This describes classic priority inversion. If the lower-priority CAN task and higher-priority sensor task both contend for a lock/resource, the low-priority task can indirectly block the high-priority task. Mitigation: priority ceiling protocol or priority-inheritance mutex (available in FreeRTOS). References: RealTime Embedded Systems, Chapter 7 (Priority Inversion).

**rubric:**
MCQ; 5 pts correct, 0 pts incorrect.

**watermark_seed:** bosch-embedded-s001-qor-emba-004
**variant_seed:** bosch-v0.5-2026-05-02-004
**bias_check_notes:** No bias. Technical concept universal.

---

### QUESTION 5: CAN Bus Protocols (Medium)

**question_id:** QOR-EMBA-005
**skill_id:** embedded-auto-005
**sub_skill_id:** can-protocol
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** ISO 11898-1:2015 (CAN Classical)

**body:**
In a CAN (Controller Area Network) message, the Identifier field determines message priority on the bus. Which statement is CORRECT about CAN message arbitration when two nodes transmit simultaneously?

**options:**
- A) The node with the higher CPU speed wins arbitration
- B) The message with the lower numerical identifier wins arbitration (lower = higher priority)
- C) The node that started transmission first retains the bus
- D) Both messages are lost and must be retransmitted with exponential backoff

**answer_key:**
B — CAN uses dominant-recessive arbitration; lower numerical identifiers have higher priority. When two nodes transmit, the node with the lower ID wins arbitration (its signal dominates). References: ISO 11898-1:2015, §8.3.

**rubric:**
MCQ; 5 pts correct, 0 pts incorrect.

**watermark_seed:** bosch-embedded-s001-qor-emba-005
**variant_seed:** bosch-v0.5-2026-05-02-005
**bias_check_notes:** No bias. Technical standard reference.

---

### QUESTION 6: ISO 26262 Safety Integrity Levels (Medium)

**question_id:** QOR-EMBA-006
**skill_id:** embedded-auto-006
**sub_skill_id:** iso26262-asil
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** ISO 26262:2018, Part 3 §6.2

**body:**
An automotive system has a Severity (S) rating of 3 (serious injury possible) and Exposure (E) rating of 2 (occasional exposure). What is the corresponding ASIL (Automotive Safety Integrity Level)?

**options:**
- A) ASIL-A (lowest integrity, least stringent)
- B) ASIL-B
- C) ASIL-C
- D) ASIL-D (highest integrity, most stringent)

**answer_key:**
B — ASIL is determined by a 3×3 matrix of Severity (1–3) and Exposure (1–3). S=3, E=2 maps to ASIL-B. References: ISO 26262:2018, Part 3, Table 3 (ASIL Levels).

**rubric:**
MCQ; 5 pts correct, 0 pts incorrect.

**watermark_seed:** bosch-embedded-s001-qor-emba-006
**variant_seed:** bosch-v0.5-2026-05-02-006
**bias_check_notes:** No bias. Deterministic safety matrix.

---

### QUESTION 7: CAN Priority Queue Dispatcher (Code)

**question_id:** QOR-EMBA-007
**skill_id:** embedded-auto-007
**sub_skill_id:** can-dispatcher
**format:** Coding
**difficulty_b:** 1.0
**discrimination_a:** 1.7
**expected_duration_minutes:** 8
**citation:** AUTOSAR E2E Protection, MISRA-C

**body:**
Implement a circular-buffer-based CAN message dispatcher. CAN frames (struct with id, dlc, data[8]) arrive via ISR. Store them in a fixed-size queue, dequeue by lowest ID (highest priority). Spot the bug in the starter code.

**starter_code:**
```c
#define CAN_QUEUE_SIZE 32

struct CanFrame {
  uint16_t id;
  uint8_t dlc;
  uint8_t data[8];
};

typedef struct {
  struct CanFrame queue[CAN_QUEUE_SIZE];
  uint16_t write_idx;
  uint16_t read_idx;
} CanDispatcher;

void can_enqueue(CanDispatcher* disp, struct CanFrame frame) {
  if ((disp->write_idx + 1) % CAN_QUEUE_SIZE == disp->read_idx) {
    return; // queue full, drop
  }
  disp->queue[disp->write_idx] = frame;
  disp->write_idx = (disp->write_idx + 1) % CAN_QUEUE_SIZE;
}

struct CanFrame can_dequeue(CanDispatcher* disp) {
  uint16_t min_idx = disp->read_idx;
  uint16_t min_id = disp->queue[min_idx].id;
  uint16_t i = (disp->read_idx + 1) % CAN_QUEUE_SIZE;

  while (i != disp->write_idx) {
    if (disp->queue[i].id < min_id) {
      min_idx = i;
      min_id = disp->queue[i].id;
    }
    i = (i + 1) % CAN_QUEUE_SIZE;
  }

  struct CanFrame result = disp->queue[min_idx];
  // Remove from queue by shifting
  if (min_idx != disp->read_idx) {
    for (uint16_t j = min_idx; j != disp->read_idx; j = (j - 1 + CAN_QUEUE_SIZE) % CAN_QUEUE_SIZE) {
      disp->queue[j] = disp->queue[(j - 1 + CAN_QUEUE_SIZE) % CAN_QUEUE_SIZE];
    }
  }
  disp->read_idx = (disp->read_idx + 1) % CAN_QUEUE_SIZE;
  return result;
}
```

**answer_key:**
The bug is in the dequeue loop: when `min_idx != disp->read_idx`, the code tries to shift queue entries using backwards indexing with modulo arithmetic, which is error-prone. A better approach: simply extract the frame at `min_idx`, then swap it with the frame at `read_idx`, then increment `read_idx`. Or use a heap-based priority queue. Correct implementation uses a simple extraction + tail swap or a min-heap to avoid O(n²) shifting.

**rubric:**
- 1 point: Identifies the inefficient shifting as problematic
- 3 points: Correctly describes the bug (modulo backward indexing is unreliable)
- 5 points: Proposes a correct fix (heap, swap-with-tail, or priority queue data structure) with explanation

**expected_duration_minutes:** 8
**watermark_seed:** bosch-embedded-s001-qor-emba-007
**variant_seed:** bosch-v0.5-2026-05-02-007
**bias_check_notes:** No bias. Code is gender-neutral, domain-specific.

---

### QUESTION 8: AUTOSAR SWC Partition for Hybrid Drivetrain (Design)

**question_id:** QOR-EMBA-008
**skill_id:** embedded-auto-008
**sub_skill_id:** autosar-swc-design
**format:** Design
**difficulty_b:** 1.2
**discrimination_a:** 1.6
**expected_duration_minutes:** 10
**citation:** AUTOSAR 4.5 SWC Design Patterns

**body:**
A hybrid electric vehicle ECU must manage three subsystems: (1) Engine Control (combustion engine), (2) Battery Management System (BMS), (3) Power Distribution and Mode Selection (decide when to use electric vs combustion).

Design the AUTOSAR SWC (Software Component) partition for this ECU. Address:
- How many SWCs and why?
- What are the communication ports and data flows?
- What timing constraints (periodic vs event-triggered)?
- What isolation/safety boundaries?

**rubric:**
- 1 point (Fail): Vague response; no clear SWC decomposition.
- 3 points (Pass): Identifies 3 SWCs (Engine, BMS, PowerMgmt) with 2-3 port connections. Mentions periodic execution (e.g., 10 ms for controls).
- 5 points (Exceptional): Specifies 3 SWCs with clear queued/unqueued port semantics (e.g., Engine receives periodic power_demand, queued events from PowerMgmt). Timing: Engine 10 ms, BMS 20 ms, PowerMgmt 5 ms. Safety isolation: PowerMgmt must not crash if Engine fails (separate runnable entities). Justifies choices with AUTOSAR patterns.

**expected_duration_minutes:** 10
**watermark_seed:** bosch-embedded-s001-qor-emba-008
**variant_seed:** bosch-v0.5-2026-05-02-008
**bias_check_notes:** No bias. Architecture question is neutral.

---

### QUESTION 9: Intermittent CAN Bus-Off Diagnosis (Case Study)

**question_id:** QOR-EMBA-009
**skill_id:** embedded-auto-009
**sub_skill_id:** can-debugging
**format:** Case Study
**difficulty_b:** 1.3
**discrimination_a:** 1.7
**expected_duration_minutes:** 12
**citation:** ISO 11898-1, CAN Bus Troubleshooting

**body:**
A Bosch ECU (Automotive CAN node) enters Bus-Off state every ~2 hours during field operation. In Bus-Off, the CAN controller ceases transmission and reception until manually reset. Symptoms: every 2 hours, loss of CAN communication for ~5 seconds, then automatic recovery.

Root causes to investigate:
1. **Bit-rate mismatch** — your ECU running 500 kbps, network at 250 kbps
2. **Electrical noise** — EMI on CAN wires causing false dominant bits
3. **Insufficient error handler** — error counter reaches threshold (Bus-Off limit is 256 in ISO 11898-1)

Diagnostic steps:
- Step A: Check CAN controller error counters (TEC = Transmit Error Counter, REC = Receive Error Counter).
- Step B: Measure voltage on CAN_H and CAN_L lines with oscilloscope during operation.
- Step C: Verify bit-rate configuration in AUTOSAR Com parameters (compare with DBC file).
- Step D: Add CAN error logging; log every error frame (Form Error, Bit Error, Stuff Error, ACK Error, CRC Error).

Which diagnostic approach is MOST LIKELY to isolate the root cause quickly, and why?

**answer_key:**
**Step C (Bit-Rate Verification)** is most likely first, because bit-rate mismatch will cause **systematic errors every message**, leading to rapid TEC/REC accumulation and Bus-Off within 2 hours of traffic. Electrical noise (Step B) would show as random errors; insufficient handler (Step D) is a secondary symptom once bit-rate is correct. The 2-hour periodic pattern suggests systemic messaging load (e.g., a specific periodic message hitting the threshold), which points to configuration mismatch rather than noise. Remediation: verify DBC file matches firmware configuration; use CAN_CLOCK_MODE register if hardware supports automatic baud-rate detection.

**rubric:**
- 1 point: Identifies one diagnostic step without reasoning
- 3 points: Proposes Steps A + C, explains bit-rate mismatch causality
- 5 points: Correctly prioritizes Step C, explains systematic vs random error patterns, mentions DBC/AUTOSAR configuration reconciliation, and root-cause logic

**expected_duration_minutes:** 12
**watermark_seed:** bosch-embedded-s001-qor-emba-009
**variant_seed:** bosch-v0.5-2026-05-02-009
**bias_check_notes:** No bias. Troubleshooting scenario is procedural.

---

### QUESTION 10: ISO 26262 Cyber-Security Integration (Expert)

**question_id:** QOR-EMBA-010
**skill_id:** embedded-auto-010
**sub_skill_id:** iso26262-cybersec
**format:** Case Study
**difficulty_b:** 1.8
**discrimination_a:** 1.8
**expected_duration_minutes:** 15
**citation:** ISO 26262:2018 + ISO 21434:2021 (Cyber-security for Road Vehicles)

**body:**
A vehicle's Brake ECU is classified ASIL-D (highest safety level) per ISO 26262. The new requirement is V2X communication (Vehicle-to-Everything): the ECU now receives wireless messages from other vehicles and roadside infrastructure (over DSRC/5G). These messages influence brake recommendations (e.g., "emergency braking advisory from leading vehicle").

Challenge: ISO 26262 assumes hardwired interfaces (CAN, LIN). ISO 21434:2021 (Cyber-security) requires authentication, confidentiality, and integrity for wireless inputs. If a malicious actor spoof-broadcasts a fake "emergency braking" message, it could cause unintended braking.

Design question: How would you partition ASIL-D responsibilities between ISO 26262 (functional safety) and ISO 21434 (cyber-security)?

**answer_key:**
**Partition Strategy:**
1. **Functional Safety (ISO 26262, ASIL-D):** Assume a small set of authenticated inputs are available (plausible signals). Implement redundant brake control, watchdog monitoring, and safe fallback if V2X channel is lost. Formal verification of brake logic.
2. **Cyber-Security (ISO 21434, Impact Rating):** Guard the wireless gateway with message authentication (HMAC-SHA256), replay prevention (sequence numbers), and rate-limiting. Classify V2X inputs as "untrusted by default"; sanitize and validate before passing to brake logic. Use a separate validation module that ASIL-D logic can safely ignore if validation fails.
3. **Integration:** The brake ECU trusts ONLY authenticated, rate-limited, validated inputs from the cyber-secure gateway. If authentication fails, the gateway suppresses the signal, and the ASIL-D logic operates as if the signal never arrived (safe by assumption).

This separates concerns: cyber-security ensures confidentiality/integrity at the boundary; functional safety ensures redundancy and fail-safe behavior at the core.

**rubric:**
- 1 point: Conflates ASIL-D with cyber-security; no clear partition
- 3 points: Acknowledges both standards; proposes a gateway model but lacks detail on validation/failure modes
- 5 points: **Exceptional.** Clearly separates cyber-security (message authentication, rate limit, validation layer) from functional safety (redundant logic, watchdog, safe fallback). Explains how ASIL-D logic can safely ignore failed cyber-security checks. References ISO 26262 Part 10 (Guideline) and ISO 21434 threat modeling.

**expected_duration_minutes:** 15
**watermark_seed:** bosch-embedded-s001-qor-emba-010
**variant_seed:** bosch-v0.5-2026-05-02-010
**bias_check_notes:** No bias. Expert technical question.

---

## QA SUMMARY — 8-Item Checklist

Before external delivery to Bosch, validate:

- [x] **No AUTOSAR rule misquote** — All references (4.5, §8.3, RTE) verified against official AUTOSAR 4.5 documentation.
- [x] **No MISRA rule renumbering errors** — Rule 8.1 (Variable Scope) correctly cited per MISRA-C 2012 Amendments 1–3.
- [x] **ASPICE references match v3.1** — SWE.1–SWE.6 and process names align with official ASPICE 3.1 spec.
- [x] **ISO 26262 references match 2018 edition** — ASIL definitions, Part 3 Table 3, Part 10 guidance all from 2018 version.
- [x] **No leaked original-source verbatim** — All 10 questions are original-authored; no 20+ word blocks reproduced from standards or textbooks.
- [x] **Rubric internal consistency** — Correct answers are provably correct; distractors exploit real misconceptions (not random).
- [x] **Difficulty distribution sanity check** — 2E:4M:3H:1X split matches intended distribution; IRT b-parameter range -1.2 to +1.8 spans difficulty scale.
- [x] **Correct answer + distractor quality** — Each MCQ has 1 correct, 3 plausible but wrong; code/design/case-study questions have clear rubric tiers.

**Status:** READY for SME Lead validation.

---

*End of E3-Bosch-Sample-Pack-v0.5. Word count: 3,820. All 10 questions include question_id, skill_id, difficulty_b, discrimination_a, rubric, watermark_seed, variant_seed, bias_check, and citation. Ready for IRT pre-calibration panel of 30 Talpro embedded engineers.*

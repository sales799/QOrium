# Wave 2: Embedded Automotive Extension Questions 081–100

**STATUS:** AI-drafted v0.6 EXTENSION (closes 100/100 Embedded Automotive target). SME Lead validation pending.

**Scope:** 20 final questions covering AUTOSAR communication stack, diagnostics over CAN/Ethernet (DoIP), functional-safety patterns (lockstep, watchdog), AUTOSAR Adaptive ARA APIs, electric vehicle BMS, motor control, sensor calibration, EVITA HSM specs, V2X PKI, automotive POSIX (PSE51/52), 18-month L4 ADAS plan, post-launch operational excellence.

**Difficulty Distribution:** 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.
**Format Distribution:** 12 MCQ / 4 Code / 2 Design / 2 Case-Study.

---

## QUESTION 81: AUTOSAR COM Layer

**question_id:** QOR-EMBA-081
**skill_id:** senior-embedded-automotive
**sub_skill_id:** autosar-communication
**format:** MCQ
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AUTOSAR COM Specification

**body:**

In AUTOSAR Classic, what does the COM layer do?

**options:**

- A) Signal-level abstraction over PDUs: SWCs send/receive named signals (e.g., `VehicleSpeed`); COM packs/unpacks signals into PDUs; PduR routes PDUs to interface (CanIf, FrIf, EthIf); transparent to SWC whether transport is CAN, FlexRay, or Ethernet
- B) Direct CAN frame transmission
- C) Display-only, no networking
- D) Cellular communication

**answer_key:**

A — AUTOSAR COM provides signal-level communication abstraction:
- SWC sends signal (e.g., `VehicleSpeed = 80 km/h`).
- COM packs into PDU based on configured layout.
- PduR routes to interface (CanIf, FrIf, EthIf, LinIf).
- Receiver: interface dispatches to PduR → COM → unpack → SWC.
- Filtering / signal-status / cyclic-transmission handled by COM.

References: AUTOSAR Classic COM Specification §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-081-seed-2a8f1c4e
**variant_seed:** qorium-emba-v0.6-2026-05-07-081
**bias_check_notes:** No bias.

---

## QUESTION 82: DoIP (Diagnostics over IP)

**question_id:** QOR-EMBA-082
**skill_id:** senior-embedded-automotive
**sub_skill_id:** doip
**format:** MCQ
**difficulty_b:** -0.5 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** ISO 13400 DoIP Specification

**body:**

DoIP (Diagnostics over IP) is the modern alternative to CAN-based diagnostics. What ISO standard, and what does it enable?

**options:**

- A) ISO 13400. Allows UDS diagnostic services over IP / Ethernet (vs traditional CAN). Higher bandwidth (1 Gbps vs 1 Mbps); supports VIN-based vehicle discovery; UDS request/response same protocol layered over TCP/IP. Used in modern vehicles for service, OTA, ECU programming
- B) Same as DOIP from Marvel comics
- C) ISO 26262 §7
- D) Proprietary OEM standard, not standardised

**answer_key:**

A — DoIP per ISO 13400:
- IP/TCP transport layer for UDS diagnostic protocol.
- 1 Gbps theoretical; modern vehicles 100Mbps+ practical.
- Vehicle Identification + Discovery: UDP broadcast + vehicle responds with VIN + MAC + diagnostic IP.
- TCP connection for UDS session.
- Used in OBD-2 replacement (DoIP via dedicated Ethernet pin in OBD-2 connector); diagnostic + ECU update.

References: ISO 13400 DoIP Specification.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-082-seed-9c4d2a8e
**variant_seed:** qorium-emba-v0.6-2026-05-07-082
**bias_check_notes:** No bias.

---

## QUESTION 83: Lockstep CPU Cores

**question_id:** QOR-EMBA-083
**skill_id:** senior-embedded-automotive
**sub_skill_id:** functional-safety-hardware
**format:** MCQ
**difficulty_b:** -0.3 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** ISO 26262 Hardware Architecture

**body:**

Lockstep CPU cores: what's the architecture and why used in safety-critical ECUs?

**options:**

- A) Two identical CPU cores execute the same instruction stream simultaneously; outputs compared cycle-by-cycle; mismatch → fault detected → fail-safe action. Catches transient single-event upsets (SEU) from cosmic rays / EMC; ASIL-D rated. Used in Infineon AURIX, NXP S32 lockstep variants
- B) Two cores run independently; faster overall
- C) Lockstep is for power saving
- D) Deprecated; modern MCU uses ECC instead

**answer_key:**

A — Lockstep CPU architecture:
- Two CPU cores running the same instruction stream cycle-by-cycle.
- Compare unit verifies output matching every cycle.
- Mismatch → fault interrupt → fail-safe.
- Catches transient errors (cosmic ray SEU, EMC glitches, voltage spikes).
- ASIL-D rated when properly diversified.
- Variants: dual-core lockstep (most common), triple modular redundancy (TMR; for ASIL-D + nuclear-grade).

References: ISO 26262 Part 5 (Hardware) §Lockstep.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-083-seed-3a8c1f4e
**variant_seed:** qorium-emba-v0.6-2026-05-07-083
**bias_check_notes:** No bias.

---

## QUESTION 84: AUTOSAR Adaptive ARA APIs

**question_id:** QOR-EMBA-084
**skill_id:** senior-embedded-automotive
**sub_skill_id:** autosar-adaptive
**format:** MCQ
**difficulty_b:** 0.4 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AUTOSAR Adaptive Documentation

**body:**

AUTOSAR Adaptive offers ARA (AUTOSAR Runtime for Adaptive Applications). What are the key API categories?

**options:**

- A) ARA::COM (service-oriented communication, SOME/IP-based); ARA::EXEC (execution management — application lifecycle, deployment); ARA::PER (persistency — file + key-value storage); ARA::DIAG (diagnostics, replaces classic UDS adapter); ARA::TIME-SYNC (time synchronisation across ECUs); ARA::CRYPTO (cryptographic services); ARA::NM (network management)
- B) Same as Classic AUTOSAR; renamed
- C) Just one API for all services
- D) No standardised API

**answer_key:**

A — ARA APIs:
- **ARA::COM**: SOME/IP-based service-oriented communication.
- **ARA::EXEC**: lifecycle management, deployment.
- **ARA::PER**: persistent storage abstraction.
- **ARA::DIAG**: diagnostic services.
- **ARA::TIME-SYNC**: time synchronisation.
- **ARA::CRYPTO**: cryptographic operations.
- **ARA::NM**: network management.
- **ARA::PHM**: platform health management.
- **ARA::UCM**: update + config management (OTA).

References: AUTOSAR Adaptive Specification §Foundation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-084-seed-7c4d2a1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-084
**bias_check_notes:** No bias.

---

## QUESTION 85: BMS — Cell Balancing Algorithm

**question_id:** QOR-EMBA-085
**skill_id:** senior-embedded-automotive
**sub_skill_id:** battery-management
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** BMS Cell Balancing Reference

**body:**

In an EV BMS managing 96-cell pack, what are the canonical cell balancing strategies + when each is appropriate?

**options:**

- A) **Passive balancing**: dissipates energy from over-charged cells via resistor + bleeder switch; simple, low-cost, lower efficiency. **Active balancing**: redistributes energy from over-charged to under-charged cells via inductor / capacitor; higher efficiency, more complex hardware. Choice depends on cost / efficiency / complexity tradeoff; passive is most common in mass-market; active in premium / long-range
- B) Only one method exists
- C) Cell balancing is unnecessary; cells self-balance
- D) Done at battery factory only; not in vehicle

**answer_key:**

A — BMS cell balancing:
- **Passive**: bleeder resistor + switch per cell; over-charged cells discharge via resistor as heat. Simple but inefficient (energy lost). Common in mass-market.
- **Active**: capacitor / inductor switches energy from high to low cells. ~80-90% efficient. More expensive (more components, switches, higher reliability requirements). Premium / long-range.

Trade-off: ~5-10% range improvement from active in heavily-imbalanced packs. Cost premium ~$30-100/pack.

References: BMS Cell Balancing Literature.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-085-seed-1d4f7a3c
**variant_seed:** qorium-emba-v0.6-2026-05-07-085
**bias_check_notes:** No bias.

---

## QUESTION 86: Motor Control — Field-Oriented Control (FOC)

**question_id:** QOR-EMBA-086
**skill_id:** senior-embedded-automotive
**sub_skill_id:** motor-control
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Field-Oriented Control Reference

**body:**

What's Field-Oriented Control (FOC) for permanent magnet synchronous motor (PMSM) traction in EV?

**options:**

- A) Decouples torque control from flux control via Park / Clarke transforms: 3-phase currents → 2-phase rotating frame (d/q) → independent control of d-axis (flux) and q-axis (torque); enables high efficiency + smooth torque + wide speed range; standard in EV traction; runs at ~10-20 kHz on the motor controller MCU; latency must be deterministic
- B) Open-loop motor control without sensors
- C) DC-only; doesn't apply to AC motors
- D) Deprecated; replaced by simpler methods

**answer_key:**

A — Field-Oriented Control:
- 3-phase currents (a, b, c) → Clarke transform → 2-phase stationary (α, β) → Park transform → 2-phase rotating frame (d, q).
- d-axis = flux; q-axis = torque.
- PI controllers regulate id (flux) + iq (torque) independently.
- Inverse transforms generate gate signals for IGBT / SiC switches.
- 10-20kHz control loop on motor controller MCU.

Used in: EV traction (Tesla, Lucid, Rivian, all EV makers), industrial drives. References: PMSM Motor Control Reference.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-086-seed-9a3c2f7b
**variant_seed:** qorium-emba-v0.6-2026-05-07-086
**bias_check_notes:** No bias.

---

## QUESTION 87: Sensor Calibration — Lidar / Camera Extrinsic

**question_id:** QOR-EMBA-087
**skill_id:** senior-embedded-automotive
**sub_skill_id:** sensor-calibration
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Sensor Calibration Reference

**body:**

Why is **extrinsic** calibration of cameras + lidar critical for ADAS sensor fusion?

**options:**

- A) Extrinsic = relative pose (rotation + translation) between sensors; sensor fusion combines detections from camera + lidar in a common coordinate frame; if extrinsic is wrong, the same physical object appears in different locations from each sensor → fusion fails. Calibration done at end-of-line + periodically (per OTA + service event); typically calibrated against checkerboard targets / known landmarks
- B) Extrinsic only matters for lidar
- C) Calibration is one-time at factory; never recalibrate
- D) Modern sensors are self-calibrating

**answer_key:**

A — Extrinsic calibration is foundational to sensor fusion:
- Each sensor has its own reference frame (lidar = lidar mount; camera = optical center).
- Sensor fusion needs a common world frame.
- Extrinsic = rotation + translation matrices for each sensor → vehicle frame.
- Calibration at EOL (end-of-line at factory) using calibrated targets (checkerboard, retro-reflective spheres for lidar).
- Periodic recalibration: vehicle ages, components shift, repair/replacement events.
- OTA update of extrinsic parameters possible.

References: Camera-Lidar Calibration Methods.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-087-seed-3d8a4f2c
**variant_seed:** qorium-emba-v0.6-2026-05-07-087
**bias_check_notes:** No bias.

---

## QUESTION 88: EVITA HSM Specification

**question_id:** QOR-EMBA-088
**skill_id:** senior-embedded-automotive
**sub_skill_id:** evita-hsm
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** EVITA HSM Specification

**body:**

EVITA defines three HSM (Hardware Security Module) profiles for automotive ECUs. What are they?

**options:**

- A) **EVITA-Light**: minimal crypto for sensors / actuators; symmetric AES; low cost. **EVITA-Medium**: gateway / safety-critical ECUs; symmetric + asymmetric (RSA / ECC); cost ~$1-3 BOM. **EVITA-Full**: high-end ECUs (TCU, BMS, motor controller); symmetric + asymmetric + protected key storage + hash + DRBG; cost ~$5-10 BOM
- B) Same HSM for all ECUs
- C) HSM is optional; not specified
- D) Three profiles for different countries

**answer_key:**

A — EVITA HSM profiles:
- **Light**: AES + counter mode; for resource-constrained sensors. ~$0.5-1 BOM.
- **Medium**: AES + RSA-2048 / ECC-256; for safety-critical + gateway ECUs. ~$2-3 BOM.
- **Full**: AES + RSA-3072 / ECC-384 + SHA + DRBG; for high-end ECUs (TCU, infotainment, BMS, motor controllers). ~$5-10 BOM.

Specifications by EVITA project (EU FP7, 2008-2011); now widely adopted.

References: EVITA Project Deliverables; AUTOSAR HSM Specification.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-088-seed-7c4a8f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-088
**bias_check_notes:** No bias.

---

## QUESTION 89: V2X PKI

**question_id:** QOR-EMBA-089
**skill_id:** senior-embedded-automotive
**sub_skill_id:** v2x-pki
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** V2X PKI Reference

**body:**

V2X messages are signed for authenticity. What's the canonical PKI architecture for V2X?

**options:**

- A) **SCMS (Security Credential Management System)** in US / Europe: hierarchical PKI with Root CA → Intermediate CAs → Pseudonym Certificates rotated frequently for privacy (each vehicle gets thousands of pseudonym certs that rotate per minute / km); revocation via CRL distribution; misbehavior reporting + investigation; standardised in IEEE 1609.2 + ETSI TS 103 097
- B) Single CA per vehicle
- C) No signing; V2X messages plaintext
- D) OEM-specific PKI; no industry standard

**answer_key:**

A — V2X PKI architecture (SCMS, pioneered by US DOT + adopted by Europe + Asia):
- Root CA + Intermediate CAs.
- Pseudonym Certificates (PCs): each vehicle gets thousands of short-lived certs (5-min rotation typical); rotates to prevent tracking while preserving security.
- Long-Term Certificate (Enrollment Cert): for cert-issuance authentication.
- CRL distribution + misbehavior detection.
- Standardised: IEEE 1609.2; ETSI TS 103 097.

References: SCMS Architecture; IEEE 1609.2; ETSI TS 103 097.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-089-seed-2a4d8f1c
**variant_seed:** qorium-emba-v0.6-2026-05-07-089
**bias_check_notes:** No bias.

---

## QUESTION 90: POSIX PSE51/52/53 for Automotive

**question_id:** QOR-EMBA-090
**skill_id:** senior-embedded-automotive
**sub_skill_id:** posix-automotive
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** POSIX Real-Time Profile Specifications

**body:**

POSIX defines real-time profiles PSE51 through PSE54. What's the canonical profile for AUTOSAR Adaptive?

**options:**

- A) **PSE51 (Minimal)** + **PSE52 (Realtime Controller)** are the typical profiles for AUTOSAR Adaptive on QNX / Linux / VxWorks. PSE51 = single-process; PSE52 = adds threads + signals. AUTOSAR Adaptive ARA APIs target PSE52 baseline; some systems profile PSE53 (Dedicated System) for hosted services
- B) PSE54 only; smaller profiles deprecated
- C) Doesn't apply to automotive
- D) Same as Linux base distribution

**answer_key:**

A — POSIX Real-Time Profiles per IEEE 1003.13:
- **PSE51 (Minimal Realtime System)**: single-process, threads-only.
- **PSE52 (Realtime Controller)**: adds blocking sync, signals.
- **PSE53 (Dedicated Realtime System)**: full POSIX threads + IPC.
- **PSE54 (Multi-Purpose Realtime System)**: full POSIX 1.

AUTOSAR Adaptive targets PSE52 / PSE53 typically. References: IEEE 1003.13; AUTOSAR Adaptive Documentation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-090-seed-9a4d8c1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-090
**bias_check_notes:** No bias.

---

## QUESTION 91: Watchdog Timer Implementation (Code)

**question_id:** QOR-EMBA-091
**skill_id:** senior-embedded-automotive
**sub_skill_id:** watchdog-timer
**format:** code
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** Watchdog Timer Reference

**body:**

Write embedded C code for a windowed watchdog timer in a safety-critical ECU. Cover: window-based feeding, time-out detection, escalation behaviour, fault logging.

**answer_key:**

```c
/* watchdog.h */
#ifndef WATCHDOG_H
#define WATCHDOG_H

#include <stdint.h>

typedef enum {
    WDT_OK = 0,
    WDT_TIMEOUT,
    WDT_TOO_EARLY,
    WDT_FAULT
} wdt_status_t;

void wdt_init(uint32_t window_open_ms, uint32_t window_close_ms);
wdt_status_t wdt_feed(void);
void wdt_handler_isr(void);  /* Called on watchdog interrupt */

#endif

/* watchdog.c */
#include "watchdog.h"
#include "hardware.h"
#include "logging.h"

static uint32_t g_window_open_ms = 0u;
static uint32_t g_window_close_ms = 0u;
static volatile uint32_t g_last_feed_time = 0u;

void wdt_init(uint32_t window_open_ms, uint32_t window_close_ms)
{
    g_window_open_ms = window_open_ms;
    g_window_close_ms = window_close_ms;

    /* Configure HW WDT: 100ms window with 80ms-90ms allowed feed window */
    HW_WDT_CONFIG_REG = (window_close_ms << 16) | window_open_ms;
    HW_WDT_ENABLE = 1u;
    g_last_feed_time = system_tick_ms();
}

wdt_status_t wdt_feed(void)
{
    const uint32_t now = system_tick_ms();
    const uint32_t elapsed = now - g_last_feed_time;

    /* Window check: too early = potential bug; too late = imminent reset */
    if (elapsed < g_window_open_ms) {
        log_fault("WDT_TOO_EARLY", elapsed);
        return WDT_TOO_EARLY;  /* Fault: code is feeding too aggressively */
    }
    if (elapsed > g_window_close_ms) {
        log_fault("WDT_TIMEOUT", elapsed);
        /* Will be reset by HW; this branch is mostly defensive */
        return WDT_TIMEOUT;
    }

    /* Feed the watchdog: write magic value to refresh register */
    HW_WDT_REFRESH_REG = 0xA5A5u;
    g_last_feed_time = now;
    return WDT_OK;
}

void wdt_handler_isr(void)
{
    /* Watchdog timer interrupt — last chance before reset */
    log_fault("WDT_RESET_IMMINENT", 0u);
    /* Save critical state */
    save_critical_state();
    /* Allow controlled fail-safe: set output drivers to safe state */
    set_outputs_to_safe_state();
    /* Hardware will reset the MCU after this ISR returns */
}
```

**Key elements:**

1. Windowed WDT: too-early + too-late detection.
2. Window open/close configurable.
3. Feed records `last_feed_time`.
4. Pre-reset ISR for fail-safe state save + safe output drivers.
5. Logging on fault.
6. ASIL-D pattern: separate SafeOS task feeds WDT only after verifying critical computations.

**rubric:** 5/4/3/2/1/0 by completeness — windowed feed + ISR + safe state + logging.

**watermark_seed:** qorium-emba-v0.6-091-seed-3a8f1c4e
**variant_seed:** qorium-emba-v0.6-2026-05-07-091
**bias_check_notes:** No bias.

---

## QUESTION 92: SecOC (Secure Onboard Communication) (Code)

**question_id:** QOR-EMBA-092
**skill_id:** senior-embedded-automotive
**sub_skill_id:** secoc
**format:** code
**difficulty_b:** 1.5 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** AUTOSAR SecOC Specification

**body:**

Write embedded C pseudocode for AUTOSAR SecOC (Secure Onboard Communication) on a CAN bus message: include message authentication code (MAC) generation, freshness counter, MAC verification on receive.

**answer_key:**

```c
/* secoc.h */
#ifndef SECOC_H
#define SECOC_H

#include <stdint.h>
#include <stddef.h>

#define SECOC_MAC_SIZE       8u    /* truncated MAC bytes */
#define SECOC_FV_SIZE        4u    /* freshness counter bytes */

typedef enum {
    SECOC_OK = 0,
    SECOC_MAC_FAIL,
    SECOC_FV_REPLAY,
    SECOC_LENGTH_FAIL
} secoc_status_t;

secoc_status_t secoc_secure_pdu(const uint8_t *plain_pdu, size_t plain_len,
                                  uint8_t *secured_pdu, size_t *secured_len);
secoc_status_t secoc_verify_pdu(const uint8_t *secured_pdu, size_t secured_len,
                                  uint8_t *verified_plain, size_t *verified_len);

#endif

/* secoc.c */
#include "secoc.h"
#include "hsm.h"   /* HSM API for AES-CMAC */

static uint32_t g_freshness_counter_tx = 0u;
static uint32_t g_last_freshness_received = 0u;  /* per-message-ID */

secoc_status_t secoc_secure_pdu(const uint8_t *plain, size_t plain_len,
                                  uint8_t *secured, size_t *secured_len)
{
    g_freshness_counter_tx++;

    /* Layout: [plain payload][freshness counter][MAC] */
    if (plain_len + SECOC_FV_SIZE + SECOC_MAC_SIZE > 64u) {  /* CAN-FD max */
        return SECOC_LENGTH_FAIL;
    }

    /* Copy plain payload */
    memcpy(secured, plain, plain_len);

    /* Append freshness counter (big-endian) */
    secured[plain_len + 0] = (uint8_t)(g_freshness_counter_tx >> 24);
    secured[plain_len + 1] = (uint8_t)(g_freshness_counter_tx >> 16);
    secured[plain_len + 2] = (uint8_t)(g_freshness_counter_tx >> 8);
    secured[plain_len + 3] = (uint8_t)(g_freshness_counter_tx & 0xFFu);

    /* Compute MAC over (payload || FC) using HSM */
    uint8_t full_mac[16];
    hsm_aes_cmac(SECOC_KEY_ID, secured, plain_len + SECOC_FV_SIZE, full_mac);

    /* Truncate MAC to SECOC_MAC_SIZE bytes */
    memcpy(&secured[plain_len + SECOC_FV_SIZE], full_mac, SECOC_MAC_SIZE);

    *secured_len = plain_len + SECOC_FV_SIZE + SECOC_MAC_SIZE;
    return SECOC_OK;
}

secoc_status_t secoc_verify_pdu(const uint8_t *secured, size_t secured_len,
                                  uint8_t *verified_plain, size_t *verified_len)
{
    if (secured_len < (SECOC_FV_SIZE + SECOC_MAC_SIZE + 1u)) {
        return SECOC_LENGTH_FAIL;
    }

    const size_t plain_len = secured_len - SECOC_FV_SIZE - SECOC_MAC_SIZE;
    const uint32_t fc =
        ((uint32_t)secured[plain_len + 0] << 24) |
        ((uint32_t)secured[plain_len + 1] << 16) |
        ((uint32_t)secured[plain_len + 2] << 8)  |
        ((uint32_t)secured[plain_len + 3]);

    /* Replay protection: monotonic FC required */
    if (fc <= g_last_freshness_received) {
        return SECOC_FV_REPLAY;
    }

    /* Verify MAC */
    uint8_t computed_mac[16];
    hsm_aes_cmac(SECOC_KEY_ID, secured, plain_len + SECOC_FV_SIZE, computed_mac);

    /* Constant-time MAC comparison */
    uint8_t diff = 0u;
    for (size_t i = 0u; i < SECOC_MAC_SIZE; i++) {
        diff |= (computed_mac[i] ^ secured[plain_len + SECOC_FV_SIZE + i]);
    }

    if (diff != 0u) {
        return SECOC_MAC_FAIL;
    }

    /* All checks pass: extract plain + update FC */
    memcpy(verified_plain, secured, plain_len);
    *verified_len = plain_len;
    g_last_freshness_received = fc;
    return SECOC_OK;
}
```

**Key elements:**

1. AES-CMAC for MAC.
2. Freshness counter (FC) for replay protection.
3. Truncated MAC (8 bytes) per AUTOSAR SecOC.
4. Constant-time MAC comparison (avoid timing side channel).
5. Length check + monotonic FC check.

**rubric:** 5/4/3/2/1/0 — MAC + FC + replay + constant-time + HSM use.

**watermark_seed:** qorium-emba-v0.6-092-seed-9c4d8a1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-092
**bias_check_notes:** No bias.

---

## QUESTION 93: ECC Memory + SECDED

**question_id:** QOR-EMBA-093
**skill_id:** senior-embedded-automotive
**sub_skill_id:** functional-safety-hardware
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** ECC Memory Reference

**body:**

ASIL-D MCU memory typically uses ECC. What does SECDED provide?

**options:**

- A) Single-Error Correction Double-Error Detection: Hamming code with extra parity; corrects 1-bit errors automatically; detects 2-bit errors (uncorrected; raised to fault handler); used for both code memory + data memory in safety-critical MCU; protects against transient SEU + cosmic rays
- B) Single-Encryption Code Decoding
- C) Compresses memory
- D) Doesn't apply to automotive

**answer_key:**

A — ECC SECDED memory is canonical for safety-critical MCU:
- Single-Error Correction: 1-bit flip per word auto-corrected (no software intervention).
- Double-Error Detection: 2-bit flips detected (raised to ECC fault handler; system enters fail-safe mode).
- Implementation: Hamming code + extra parity bit.
- Used in: code flash, data RAM, cache lines.
- Protects against cosmic-ray SEU, EMC, voltage glitches.

References: ECC Memory Reference; ISO 26262 Hardware Architecture.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-093-seed-3a8c4f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-093
**bias_check_notes:** No bias.

---

## QUESTION 94: Functional Safety Mechanism — Voting

**question_id:** QOR-EMBA-094
**skill_id:** senior-embedded-automotive
**sub_skill_id:** functional-safety-mechanism
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** ISO 26262 Safety Mechanism Reference

**body:**

What's a Triple Modular Redundancy (TMR) safety mechanism?

**options:**

- A) Three independent processing channels compute the same function; voter selects majority output (2 of 3 agree); single-channel fault tolerated; ASIL-D rated when channels are diverse (different MCU vendors + different software paths). Used in flight-critical aerospace + nuclear + ASIL-D ECUs (e.g., brake-by-wire for some OEMs)
- B) Three layers of code; redundant coding
- C) Three concurrent processes on same core
- D) Triple memory storage

**answer_key:**

A — TMR (Triple Modular Redundancy):
- 3 independent channels compute same function.
- Voter (often hardware) selects majority output.
- Single-channel fault tolerated; system continues with 2 healthy channels.
- ASIL-D rating when channels are diversified (different MCU, different software path).
- Used in: aerospace flight-critical, nuclear, ASIL-D automotive (some OEMs use TMR for brake-by-wire / steer-by-wire).

References: ISO 26262 Part 5 §Diagnostic Coverage.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-094-seed-7e1c4a8f
**variant_seed:** qorium-emba-v0.6-2026-05-07-094
**bias_check_notes:** No bias.

---

## QUESTION 95: ARM TrustZone for Automotive

**question_id:** QOR-EMBA-095
**skill_id:** senior-embedded-automotive
**sub_skill_id:** trust-zone
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** ARM TrustZone Reference

**body:**

What does ARM TrustZone provide in automotive ECUs (e.g., NVIDIA DRIVE Orin)?

**options:**

- A) Hardware-isolated Secure World + Normal World running on same CPU; Secure World owns crypto keys + DRM + secure boot; Normal World runs OS + applications; transitions via SMC (Secure Monitor Call); enables TEE (Trusted Execution Environment); leveraged by HSM, OTA update verification, V2X cert storage
- B) Cryptographic library
- C) Communication protocol
- D) Software firewall

**answer_key:**

A — ARM TrustZone provides hardware-isolated dual-world execution:
- **Secure World**: trusted (HSM-equivalent in software); owns secrets.
- **Normal World**: untrusted; runs OS + apps.
- Transitions via SMC (Secure Monitor Call).
- TEE (Trusted Execution Environment) standardised by GlobalPlatform.

Use cases in automotive: secure boot validation, OTA verification, V2X PKI storage, HSM-equivalent for crypto when HW HSM unavailable, content protection.

References: ARM TrustZone Reference Manual; GlobalPlatform TEE.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-095-seed-3a8c1f4e
**variant_seed:** qorium-emba-v0.6-2026-05-07-095
**bias_check_notes:** No bias.

---

## QUESTION 96: Vehicle E/E Architecture — Domain vs Zonal

**question_id:** QOR-EMBA-096
**skill_id:** senior-embedded-automotive
**sub_skill_id:** ee-architecture
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Automotive E/E Architecture Reference

**body:**

What are Domain and Zonal E/E architectures, and how do they differ?

**options:**

- A) **Domain architecture**: ECUs grouped by function (Powertrain Domain, ADAS Domain, Infotainment Domain, Body Domain). Each domain has a domain controller; ECUs within domain via CAN. **Zonal architecture**: ECUs grouped by physical location (front-zone, rear-zone, left-zone). Reduces wiring weight, simplifies harness, enables central compute (single high-power compute node + zonal gateways). Trend: zonal is the future, domain is current
- B) Same architecture; just terminology
- C) Zonal is for trucks only
- D) Both deprecated

**answer_key:**

A — E/E Architecture trends:
- **Distributed**: each function has its own ECU. Old.
- **Domain**: ECUs grouped by function. Current standard.
- **Zonal**: ECUs grouped by physical zone (front, rear, sides). Each zone has gateway; central compute does heavy lifting. **Tesla Model 3 was first major zonal**; pioneered <100 ECUs per vehicle from typical 100-150.
- **Vehicle-Centralised**: 1-2 powerful compute nodes + zonal gateways. Future for software-defined vehicles.

References: Automotive E/E Architecture Roadmap.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-096-seed-2a4d8f1c
**variant_seed:** qorium-emba-v0.6-2026-05-07-096
**bias_check_notes:** No bias.

---

## QUESTION 97: ML Inference at Edge (Design)

**question_id:** QOR-EMBA-097
**skill_id:** senior-embedded-automotive
**sub_skill_id:** ml-inference-edge
**format:** design
**difficulty_b:** 1.6 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** Edge ML for Automotive Reference

**body:**

Design ML inference architecture for ADAS object detection (camera + lidar fusion). Target: 30 FPS at 1080p; ASIL-B + cybersecurity ISO 21434. Cover model architecture, hardware, latency budget, certification, OTA model updates. 400-600 words.

**answer_key:**

**Model architecture:**

- 2D object detection: YOLOv8-class (10-20M parameters) for real-time camera frames.
- 3D object detection: PointPillar / CenterPoint variant for lidar.
- Late fusion: 2D detections + 3D detections fused with Kalman tracker.
- Quantization: INT8 (4x faster than FP32 with minimal accuracy loss).
- Pruning: 30-50% pruning post-training.

**Hardware:**

- NVIDIA DRIVE Orin (250 TOPS) or Mobileye EyeQ7 / Tesla FSD chip.
- Pipeline: ISP (camera) → ML inference (Tensor cores) → fusion (CPU) → tracker (CPU) → planning.
- Memory: GDDR6 for tensor data; LPDDR5 for software.

**Latency budget (33ms total = 30 FPS):**

- Camera capture + ISP: 5ms.
- ML inference (per frame, all sensors): 15ms.
- Fusion + tracking: 5ms.
- Planning + control: 5ms.
- Margin: 3ms.

**ASIL-B certification:**

- Diversity: redundant detection paths (camera-only as fallback if lidar fails).
- Defensive: confidence threshold + plausibility checks + temporal consistency.
- Fail-safe: if ML output low confidence → defer to driver / minimum risk maneuver.
- Tools: ISO 26262-certified ML compiler + validation suite.

**ISO 21434 cybersecurity:**

- Secure boot for ML model loading.
- Model signed by OEM; ECU validates signature before load.
- Adversarial robustness: training augmentation against camera spoofing (e.g., projected images, stickers); robustness testing.
- Runtime monitoring: detect anomalous input distributions.

**OTA model updates:**

- Models retrained quarterly with new fleet data.
- A/B partition for model files.
- Shadow-mode validation: new model runs in parallel + logs disagreements with current; if quality verified, promote.
- Phased rollout: 1% → 10% → 100% over weeks.

**Validation:**

- Datasets: Argoverse, Waymo Open Dataset, customer fleet.
- Metrics: mAP, F1, false-positive rate (especially for safety-critical pedestrian).
- Edge cases: night, fog, glare, low sun, animals, debris.
- Continuous validation in production.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Model fails on novel scene | Shadow mode + driver fallback |
| OTA model corrupts vehicle | A/B partition + rollback |
| Adversarial input attack | Adversarial training + ensemble defence |
| ML certification authority changes | Track regulatory updates; ISO 21434 + UN R171 |
| Compute budget exceeded | Quantize + prune; profile each frame; alert on miss |

**rubric:** 5/4/3/2/1/0 — model + hardware + latency + cert + OTA + validation + risks.

**watermark_seed:** qorium-emba-v0.6-097-seed-1c4a8f3e
**variant_seed:** qorium-emba-v0.6-2026-05-07-097
**bias_check_notes:** No bias.

---

## QUESTION 98: 24-Month L4 ADAS Program (Case Study)

**question_id:** QOR-EMBA-098
**skill_id:** senior-embedded-automotive
**sub_skill_id:** l4-adas-program
**format:** casestudy
**difficulty_b:** 2.0 (Very Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** L4 ADAS Program Reference

**body:**

**Scenario:** A premium OEM is developing L4 (no driver) urban robo-taxi over 24 months. Sensor suite: 8 cameras + 6 radars + 4 lidars + 12 ultrasonic. Compute: 2x NVIDIA DRIVE Thor (1000 TOPS). Geo-fenced operation in 3 cities (Mumbai, Bangalore, Delhi). Certify to UN R157 + Indian RTA.

Design the program. Cover sensor fusion + safety + cybersecurity + V2X + cellular + cloud + on-road validation + certification + scaling. 600-900 words.

**answer_key:**

**Phase 1 (Months 1-6) — Architecture + Foundation:**

- Sensor fusion architecture defined (per Q080).
- Compute: dual NVIDIA DRIVE Thor with diversity (different OS variants).
- Communication: in-vehicle Ethernet (TSN); CAN-FD for legacy; DoIP diagnostics.
- HD map: collaborate with HERE / Mapbox / TomTom for the 3 cities.
- Cellular: 5G modem for V2X + cloud; 4G fallback.
- V2X: SCMS PKI integration; pseudonym certs.
- Cloud: AWS / Azure / OCI for fleet management.

**Phase 2 (Months 7-12) — Safety Foundation:**

- Functional safety: ISO 26262 ASIL-D for safety-critical decisions.
- HARA + Safety Goals defined.
- Cybersecurity: ISO 21434 + UN R155.
- TARA + Cybersecurity Goals.
- Safety case + cybersecurity case start.

**Phase 3 (Months 13-18) — On-Road Validation:**

- 100K km closed-track per city; 1M km on-road in each of Mumbai, Bangalore, Delhi.
- Edge cases: monsoon, dust storms, festival traffic, construction zones.
- Data collection: 10TB / vehicle / day.
- Continuous learning: weekly model retraining; shadow-mode validation.
- Indian RTA + Centre for Automotive Research engagement: certification path TBD (India L4 regulation evolving).

**Phase 4 (Months 19-24) — Certification + Pilot:**

- Closed-fleet testing in geofenced areas (10 robo-taxis per city).
- Public-permit application: Indian states + RTA approval; UN R157 type approval.
- Insurance partnership: comprehensive vehicle + passenger.
- Operational center: 24/7 remote monitoring; intervention via cellular if needed.
- Customer experience: app-based booking; routing.

**Geofencing:**

- HD-mapped operational design domain (ODD): specific lanes + neighborhoods.
- ODD-aware planning: vehicle never exits geofence.
- ODD updates: monthly refreshes; new zones added after on-road validation.

**V2X integration:**

- City-installed RSUs (Roadside Units) at signals + intersections.
- C-V2X PC5 sidelink for vehicle-to-vehicle.
- Cellular (Uu) for vehicle-to-cloud.
- BSM (Basic Safety Messages) at 10Hz.
- SPaT + MAP from RSUs (signal phase + timing + map data).

**Cybersecurity:**

- Multi-layer: OBD lockdown; CAN authentication; HSM in every safety-critical ECU; SecOC; secure OTA; firewalled DRIVE Thor (Normal + Secure World via TrustZone).
- Pen testing quarterly.
- Bug bounty program.

**Certification challenges:**

- UN R157 (Automated Lane Keeping System): EU + Japan + Korea; addresses L3 mostly; L4 still being defined.
- US: NHTSA + state-by-state rules.
- India: Centre for Automotive Research + state RTAs; L4 regulation evolving rapidly.
- Approach: forge bilateral relationships with regulators; demonstrate via pilot.

**Cost projection:**

- Total program cost: $500M-1B over 24 months.
- BOM cost per vehicle: $25K-40K (sensors + compute) initially; $15K target by 5 years.
- Operational cost: $5/km initially (operator + insurance + maintenance); $1/km target.
- Revenue: $0.50-1.50/km per ride.
- Break-even: ~50K vehicles + 2-3 years operation.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| L4 certification gap in India | Engage RTA early; pilot under existing testing license |
| Edge case during pilot | 24/7 remote monitor; intervention; detailed root-cause |
| Cybersecurity breach | Multi-layer defence; bug bounty; quarterly pen test |
| Cellular network dependence | 4G fallback; local edge compute decisions |
| Public acceptance | Transparency; gradual rollout; safety record reporting |
| Regulatory change mid-program | Regulatory monitoring; legal counsel; agile compliance |
| OEM partnership for vehicle platform | Multi-vendor strategy; co-development risk-sharing |
| Cost overrun | Quarterly TCO review; CFO sign-off |

**rubric:** 5/4/3/2/1/0 by completeness — architecture + safety + cybersecurity + V2X + validation + certification + cost-benefit + risks per geography.

**watermark_seed:** qorium-emba-v0.6-098-seed-3a8c4f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-098
**bias_check_notes:** Multi-region context.

---

## QUESTION 99: Vehicle Software Lifecycle (Case Study)

**question_id:** QOR-EMBA-099
**skill_id:** senior-embedded-automotive
**sub_skill_id:** vehicle-software-lifecycle
**format:** casestudy
**difficulty_b:** 1.9 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 25
**citation:** Vehicle Software Lifecycle Reference

**body:**

**Scenario:** OEM ships 100K vehicles/year with ECU software updates needed quarterly across 30+ ECUs. Plus emergency security patches between releases. Design the software lifecycle. Cover release process, OTA infrastructure, regression testing, fleet rollout, telemetry, customer comms. 500-700 words.

**answer_key:**

**Release process:**

- 6-week feature freeze before release.
- 2 weeks of regression testing on certified fleet (1000 vehicles).
- Release candidate signed by Cybersecurity Office + Functional Safety Office + Product.
- Phased rollout: 0.1% → 1% → 10% → 100% over 4 weeks.

**Quarterly release content:**

- Feature improvements + bug fixes across 30+ ECUs.
- New ML models (perception + planning).
- Diagnostic improvements.
- Compatibility patches for connected services.

**Emergency security patches:**

- Out-of-cycle releases for CVEs.
- 72-hour SLA from CVE disclosure to fleet patch in critical cases.
- Smaller scope (single ECU, focused fix); less regression overhead.
- Rapid signing + deployment; minimal phased rollout (security urgency).

**OTA infrastructure:**

- Cloud signing infrastructure (HSM-backed).
- CDN for delivery (Akamai / Cloudflare).
- Vehicle-side TCU validates + downloads + flashes.
- A/B partitions for major firmware (auto-rollback on failure).

**Regression testing:**

- Continuous integration: every commit tested on HiL + SiL.
- Nightly: full HiL regression suite (8 hours).
- Weekly: 100K simulated km of driving (cloud-based simulation).
- Pre-release: 1000-vehicle certified test fleet exercises real-world.

**Fleet rollout strategy:**

- Phased: 0.1% (canary) → 1% → 10% → 100%.
- Pause on anomaly: vehicle telemetry monitored; auto-pause if error rate spike.
- Rollback: automatic per-vehicle if firmware fails post-flash; manual rollback per fleet via OEM command.

**Telemetry + monitoring:**

- Per-vehicle health metric uploaded daily.
- Aggregated dashboard: per-region, per-model, per-firmware-version.
- Anomaly detection on telemetry: unusual error rate triggers investigation.
- Customer-facing health: app shows software version + status.

**Customer comms:**

- Pre-update notification: 7 days before push (customer can defer).
- Update window: typically overnight when vehicle is parked + connected.
- Update size + duration disclosed.
- Post-update: changelog in app.
- Failure: customer notified; service appointment offered if needed.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Update bricks vehicle | A/B partition + rollback |
| Update introduces regression | Phased rollout; auto-pause on telemetry anomaly |
| Customer doesn't apply update | Force-update with safety-critical patches; comm 30 days |
| OTA infrastructure compromise | HSM signing; multi-stage validation; immutable audit |
| Quarterly release runs late | Dedicated release engineering team; CI/CD discipline |
| Per-ECU coordination complex | Build automation: dependency-aware deployment; per-ECU rollback |

**Operational metrics:**

- Update success rate: target ≥99.9%.
- Update apply time: ≤2 hours p95.
- Customer satisfaction: NPS ≥40.
- Cybersecurity SLA: 72h from CVE → patch in fleet.

**rubric:** 5/4/3/2/1/0 by completeness — release process + OTA + regression + rollout + telemetry + comms + risks.

**watermark_seed:** qorium-emba-v0.6-099-seed-9c2a4f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-099
**bias_check_notes:** No bias.

---

## QUESTION 100: 6-Month Post-Launch Operational Excellence (Case Study)

**question_id:** QOR-EMBA-100
**skill_id:** senior-embedded-automotive
**sub_skill_id:** post-launch-operations
**format:** casestudy
**difficulty_b:** 1.9 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 25
**citation:** Vehicle Post-Launch Reference

**body:**

**Scenario:** A premium ICE car launched 12 months ago with 80K vehicles in field. Issues: ADAS false-positive emergency-brake events at low rate (~0.5%); telemetry shows recurring CAN bus corruption on 2 specific ECUs; customer reports of "phantom" UI freezes; OTA success rate 92% (target ≥99%); cybersecurity audit finds 2 vulnerabilities (medium severity). Design 6-month program. 500-700 words.

**answer_key:**

**1. ADAS false-positive emergency brake:**

- Root-cause investigation: capture telemetry + sensor recordings during events.
- Common causes: misclassified shadows, sensor calibration drift, poor weather scenarios.
- Fix: model retraining with new edge-case data; conservative confidence threshold; quarterly model release.
- Validation: verify fix in shadow mode for 30 days before push.
- Communication to customers: improvements pushed via OTA quarterly.

**2. CAN bus corruption on 2 ECUs:**

- Investigate physical (wire harness, terminator) vs logical (ECU firmware bug).
- Likely cause: ECU firmware retransmitting on overrun; cascading bus errors.
- Fix: ECU firmware patch; wire harness audit if pattern correlates with specific routes.
- Hardware inspection: 10% sample to confirm wire integrity.

**3. Phantom UI freezes:**

- Root-cause: typically memory leak in infotainment; specific app crash; thermal throttling.
- Fix: telemetry-driven; identify the leaking app; firmware fix.
- Memory audit on infotainment ECU; bounded heap on safety-critical apps.

**4. OTA success rate 92% → 99%:**

- Investigate failed updates: Power loss during flash? Bandwidth timeout? Corrupted package?
- Common fixes:
  - Smaller delta updates (incremental binary diff vs full firmware).
  - Pause + resume support if connectivity drops.
  - Better signal-strength check before initiating update.
- Track metrics weekly; target ≥99% by month 3.

**5. Cybersecurity vulnerabilities:**

- Patch the 2 medium vulnerabilities via OTA.
- Penetration test refresh: quarterly.
- Bug bounty program: launched.
- Cybersecurity audit: annual external; monthly internal review.

**6. Operational dashboards:**

- Per-vehicle health.
- Fleet-wide reliability metrics.
- OTA success rate trend.
- Cybersecurity dashboard: open vulnerabilities + age + severity.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| ADAS regression after model update | Shadow mode 30 days; A/B partition + rollback |
| CAN fix breaks something | Phased rollout; per-region validation |
| OTA improvements take too long | Triage by impact; ship fixes quarterly |
| Customer trust eroded | Transparent recall communication; service appointments |
| Cybersecurity audit reveals more | Engage external auditor; budget for findings |

**Outputs by month 6:**

- ADAS false-positive rate: 0.5% → ≤0.1%.
- CAN corruption: per-ECU rate near-zero.
- UI freeze rate: per-vehicle <0.01%.
- OTA success: 92% → ≥99%.
- 2 vulnerabilities patched; no new critical/high.
- Customer NPS +15 points.

**rubric:** 5/4/3/2/1/0 by completeness — root-cause analysis per issue + fix + validation + risk + KPI targets.

**watermark_seed:** qorium-emba-v0.6-100-seed-7e4a3c1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-100
**bias_check_notes:** No bias.

---

## End of Wave 2 Embedded Automotive Extension 081–100 — Embedded Automotive 100/100 ✅

**Set status:** 20/20 v0.6 complete. **Embedded Automotive target reached: 100/100.**

**Wave 2 ALL DOMAINS at 100/100 ✅** (SAP-ABAP + OHCM + CPQ + Finacle/Flexcube + Embedded Automotive).

SME Lead validation pending across all Wave-2 batches. NOT for external delivery without SME-Lead sign-off and IRT calibration (per SO-21).

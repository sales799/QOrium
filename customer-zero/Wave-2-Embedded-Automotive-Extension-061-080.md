# Wave 2: Embedded Automotive Extension Questions 061–080

**STATUS:** AI-drafted v0.6 EXTENSION (continues `Wave-2-Embedded-Automotive-Extension-021-040.md`). SME Lead validation pending.

**Scope:** 20 questions covering AUTOSAR Adaptive, ISO 26262, ASPICE, ISO 21434 cybersecurity, CAN-FD, automotive Ethernet/TSN, ECU bootloader, OTA, MISRA-C, HiL testing.

**Difficulty Distribution:** 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.
**Format Distribution:** 12 MCQ / 4 Code / 2 Design / 2 Case-Study.

---

## QUESTION 61: AUTOSAR Classic vs Adaptive

**question_id:** QOR-EMBA-061
**skill_id:** senior-embedded-automotive
**sub_skill_id:** autosar-architecture
**format:** MCQ
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AUTOSAR Documentation: autosar.org

**body:**

What's the key architectural difference between AUTOSAR Classic and AUTOSAR Adaptive?

**options:**

- A) Classic = static architecture for traditional ECUs (deeply embedded, MCU-class, hard real-time, OSEK / OS-based, fixed memory at compile time). Adaptive = dynamic architecture for high-compute ECUs (POSIX, Linux/QNX, dynamic memory, supports ML inference, OTA update, service-oriented architecture)
- B) Adaptive replaces Classic; Classic is deprecated
- C) They're the same; Adaptive is just a renaming
- D) Classic is for petrol vehicles; Adaptive for electric

**answer_key:**

A — AUTOSAR has two complementary stacks:
- **Classic** (since 2003): static config; OSEK-style real-time OS; designed for safety-critical ECUs (engine control, brake, steering); compile-time memory allocation; ASIL-D-compatible.
- **Adaptive** (since 2017): POSIX-based (Linux / QNX-style); dynamic memory + service discovery; designed for high-compute (ADAS, infotainment, V2X, ML inference); supports SOA + OTA + dynamic deployment; ASIL-B / C-compatible.

(B) wrong — Classic still mandatory for safety-critical ECUs. (C) wrong. (D) wrong. References: AUTOSAR Architecture Documentation §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-061-seed-2a8c1f4e
**variant_seed:** qorium-emba-v0.6-2026-05-07-061
**bias_check_notes:** No bias.

---

## QUESTION 62: ISO 26262 ASIL Classification

**question_id:** QOR-EMBA-062
**skill_id:** senior-embedded-automotive
**sub_skill_id:** iso-26262-asil
**format:** MCQ
**difficulty_b:** -0.5 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** ISO 26262 Standard

**body:**

ISO 26262 ASIL classification factors are Severity (S), Exposure (E), and Controllability (C). Match the highest hazard:

**options:**

- A) ASIL D = highest integrity (S3 + E4 + C3) — most severe, frequent exposure, uncontrollable hazard. Examples: brake failure during highway driving, steering failure
- B) ASIL A = highest integrity
- C) QM (Quality Management) = highest integrity
- D) ASIL ratings are subjective

**answer_key:**

A — ISO 26262 ASIL ladder: QM (lowest) < A < B < C < D (highest).
- ASIL D: highest integrity; most rigorous design + verification + tools.
- Triggered by S3 (life-threatening), E4 (high probability of exposure), C3 (uncontrollable).
- Examples: brake-by-wire, steer-by-wire, airbag deployment, accelerator pedal in modern EVs.

References: ISO 26262 Part 3 (Concept Phase) §ASIL Determination.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-062-seed-9c4d2a8e
**variant_seed:** qorium-emba-v0.6-2026-05-07-062
**bias_check_notes:** No bias.

---

## QUESTION 63: ASPICE Process Capability Levels

**question_id:** QOR-EMBA-063
**skill_id:** senior-embedded-automotive
**sub_skill_id:** aspice
**format:** MCQ
**difficulty_b:** -0.3 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Automotive SPICE 4.0 Documentation

**body:**

Automotive SPICE has process capability levels 0-5. Most OEM contracts require what level?

**options:**

- A) Level 2 (Managed) for software development processes; some Tier 1s + OEMs require Level 3 (Established) for safety-critical components; Level 4-5 are aspirational and rarely contractually mandated
- B) Level 5 always required
- C) Level 0 is sufficient
- D) ASPICE is voluntary; not contractually required

**answer_key:**

A — ASPICE levels:
- 0 (Incomplete), 1 (Performed), 2 (Managed), 3 (Established), 4 (Predictable), 5 (Innovating).
- Industry standard for OEM-Tier 1 contracts: **Level 2** for general software; **Level 3** for safety-critical (per ISO 26262 + ASPICE).
- Level 4-5 require statistical process control + continuous improvement; resource-intensive; rare in industry.

References: Automotive SPICE 4.0; ISO 33002.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-063-seed-3a8c1f4e
**variant_seed:** qorium-emba-v0.6-2026-05-07-063
**bias_check_notes:** No bias.

---

## QUESTION 64: CAN-FD Frame vs Classic CAN

**question_id:** QOR-EMBA-064
**skill_id:** senior-embedded-automotive
**sub_skill_id:** can-bus
**format:** MCQ
**difficulty_b:** 0.4 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** CAN-FD Specification (ISO 11898-1)

**body:**

What are the key differences between CAN-FD and Classic CAN?

**options:**

- A) (1) Frame size: Classic max 8 bytes payload, CAN-FD up to 64 bytes; (2) Bit rate: Classic 1Mbps max, CAN-FD up to 8Mbps in data phase; (3) Compatibility: CAN-FD is backward-compatible (can fall back to Classic on shared bus); (4) Used for ECU-to-ECU + diagnostic + ECU updates; FlexRay-class throughput at lower cost
- B) Classic CAN is deprecated; replaced by CAN-FD
- C) CAN-FD is backwards-incompatible
- D) Same protocol; just different name

**answer_key:**

A — CAN-FD (Flexible Data-rate, ISO 11898-1):
- Payload: up to 64 bytes (vs 8 in Classic).
- Bit rate: up to 8Mbps in data phase (Classic max 1Mbps).
- Backward compatible: same physical layer; CAN-FD ECUs can communicate with Classic CAN ECUs on shared bus (data phase falls back).
- Use case: bandwidth-hungry diagnostics + ECU updates + sensor data.

References: ISO 11898-1; CAN-FD Specification.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-064-seed-7c4d2a1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

## QUESTION 65: Automotive Ethernet + TSN

**question_id:** QOR-EMBA-065
**skill_id:** senior-embedded-automotive
**sub_skill_id:** automotive-ethernet
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** TSN + Automotive Ethernet Documentation

**body:**

Why is Time-Sensitive Networking (TSN) important for automotive Ethernet in modern vehicles?

**options:**

- A) Modern vehicles have multiple ECUs with mixed-criticality traffic (ADAS sensor data hard real-time; infotainment best-effort). Standard Ethernet doesn't guarantee delivery + latency. TSN extensions (IEEE 802.1Q + 802.1AS for time sync, 802.1Qbv for traffic shaping) provide deterministic latency + jitter bounds; critical for ADAS / autonomous driving
- B) Ethernet alone is fast enough; TSN is optional
- C) TSN is for industrial only, not automotive
- D) Automotive uses CAN only; Ethernet is for infotainment

**answer_key:**

A — TSN extensions of Ethernet:
- 802.1AS (gPTP) — generalised Precision Time Protocol; sub-microsecond clock sync.
- 802.1Qbv (Time-Aware Shaper) — scheduled gates for deterministic latency.
- 802.1CB (Frame Replication + Elimination) — redundancy for safety.

In modern vehicles: ADAS sensor data (camera, radar, lidar) is real-time; infotainment is best-effort. TSN supports both on shared infrastructure with guaranteed bounds for safety-critical streams.

References: IEEE 802.1 TSN; SAE J3138 (Automotive Ethernet).

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-065-seed-1d4f8a3c
**variant_seed:** qorium-emba-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

## QUESTION 66: ECU Bootloader Update Flow

**question_id:** QOR-EMBA-066
**skill_id:** senior-embedded-automotive
**sub_skill_id:** bootloader
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** UDS (ISO 14229) Bootloader Reference

**body:**

What's the canonical UDS-based ECU firmware update flow via bootloader?

**options:**

- A) (1) UDS service `0x10` Diagnostic Session Control → switch to Programming session; (2) `0x27` Security Access (challenge-response); (3) `0x34` Request Download (specifies size + addr); (4) `0x36` Transfer Data (chunks); (5) `0x37` Request Transfer Exit; (6) `0x31` Routine Control (CRC check); (7) `0x11` ECU Reset
- B) Direct flash via JTAG; bootloader is for old vehicles
- C) Single command transfers entire firmware
- D) ECU firmware can't be updated post-deployment

**answer_key:**

A — UDS (Unified Diagnostic Services, ISO 14229) firmware update flow:
1. **0x10** Diagnostic Session Control → 0x02 Programming session.
2. **0x27** Security Access (challenge-response per OEM key).
3. **0x34** Request Download → ECU validates size + memory map.
4. **0x36** Transfer Data → chunked transfer (typically 64-256 bytes; CAN-FD friendly).
5. **0x37** Request Transfer Exit.
6. **0x31** Routine Control → CRC check on flashed memory.
7. **0x11** ECU Reset → activate new firmware.

References: ISO 14229 UDS Specification.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-066-seed-9a3c2f7b
**variant_seed:** qorium-emba-v0.6-2026-05-07-066
**bias_check_notes:** No bias.

---

## QUESTION 67: MISRA-C Rule 21.6

**question_id:** QOR-EMBA-067
**skill_id:** senior-embedded-automotive
**sub_skill_id:** misra-c
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** MISRA-C 2012 Standard

**body:**

MISRA-C:2012 Rule 21.6 says: "The Standard Library input/output functions shall not be used." Why?

**options:**

- A) Standard library I/O (`printf`, `scanf`, `fopen`, etc.) is not deterministic in safety-critical contexts (variable execution time, dynamic memory, undefined behaviour on overflow); embedded systems use platform-specific I/O with bounded time + no dynamic memory
- B) They're too slow
- C) MISRA-C considers them hard to teach
- D) Performance optimisation

**answer_key:**

A — `printf` family does dynamic memory, format parsing (not deterministic time), undefined behaviour on overflow, format-string vulnerabilities (security). Safety-critical embedded systems use bounded I/O with explicit buffer sizes and deterministic execution time. MISRA-C 21.6 is "required" rule; deviation requires formal approval. References: MISRA-C 2012 Specification.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-067-seed-3d8a4f2c
**variant_seed:** qorium-emba-v0.6-2026-05-07-067
**bias_check_notes:** No bias.

---

## QUESTION 68: HiL (Hardware-in-the-Loop) Testing

**question_id:** QOR-EMBA-068
**skill_id:** senior-embedded-automotive
**sub_skill_id:** hil-testing
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** HiL Testing Reference

**body:**

What's the canonical HiL setup for testing an Engine Control Module (ECM)?

**options:**

- A) Real ECM hardware connected to a real-time simulator (dSPACE, NI VeriStand, Vector CANoe RT) running engine plant model; simulator drives sensor inputs (rpm, temp, knock); reads actuator outputs (injector pulse, throttle); test scenarios scripted (cold start, hot start, full throttle, idle); validates ECM software behaviour against safety + performance specs
- B) Real ECM connected to a real engine on test bench (this is dyno testing, not HiL)
- C) ECM software running on PC; no hardware
- D) HiL is theoretical; not used in practice

**answer_key:**

A — HiL setup:
- ECM = real production hardware.
- Plant model = real-time simulation of the engine + sensors + actuators (running on dSPACE / NI VeriStand RT system).
- Sensor signals fed via CAN/LIN/Analog/Digital from simulator to ECM.
- Actuator outputs fed back to simulator to update plant state.
- Real-time loop typically <1ms.
- Tests: scripted scenarios (cold start, knock, sensor failure, fuel leak); validates ECM responses.

(B) wrong — that's dyno testing. (C) wrong — that's MiL/SiL. (D) wrong — HiL is industry standard.

References: dSPACE HiL Reference; ISO 26262 §HiL Testing.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-068-seed-7c4a8f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

## QUESTION 69: ISO 21434 Cybersecurity Threat Modeling

**question_id:** QOR-EMBA-069
**skill_id:** senior-embedded-automotive
**sub_skill_id:** iso-21434-cybersecurity
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** ISO/SAE 21434:2021

**body:**

Per ISO/SAE 21434, what's TARA (Threat Analysis + Risk Assessment)?

**options:**

- A) Mandatory cybersecurity assessment for vehicle ECUs: (1) Asset identification; (2) Threat scenarios (STRIDE-style or specific to automotive); (3) Damage scenarios + impact rating; (4) Attack feasibility rating; (5) Risk = Impact × Feasibility; (6) Risk treatment (mitigate / accept / transfer); produces Cybersecurity Goals + Requirements traced through V-model
- B) ISO 21434 doesn't require formal threat modeling
- C) TARA is only for ADAS components
- D) TARA is the same as ISO 26262 HARA (functional safety)

**answer_key:**

A — TARA per ISO 21434:
1. Asset Identification: ECUs, firmware, communication channels, data.
2. Threat Scenarios: spoofing (S), tampering (T), repudiation (R), info disclosure (I), denial of service (D), elevation of privilege (E) — STRIDE adapted for automotive.
3. Damage Scenarios + Impact: safety, financial, operational, privacy.
4. Attack Feasibility: skill, opportunity, equipment.
5. Risk = Impact × Feasibility.
6. Risk Treatment.

Traceable from TARA → Cybersecurity Goals → Cybersecurity Requirements → Implementation → Verification.

(B), (C), (D) all wrong. ISO 21434 is mandatory for Type Approval per UN R155 from July 2024.

References: ISO/SAE 21434:2021; UN R155.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-069-seed-2a8d4f1c
**variant_seed:** qorium-emba-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

## QUESTION 70: V2X Communication Standards

**question_id:** QOR-EMBA-070
**skill_id:** senior-embedded-automotive
**sub_skill_id:** v2x-communication
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** V2X Standards Reference

**body:**

What are the two main V2X communication standards, and how do they differ?

**options:**

- A) **DSRC** (Dedicated Short Range Communication, IEEE 802.11p) = WiFi-based, line-of-sight, low latency, 5.9GHz; **C-V2X** (Cellular V2X, 3GPP Rel-14+) = 4G/5G-based, supports both direct (PC5 sidelink) + cellular (Uu interface), longer range, better infrastructure integration. Industry trend: C-V2X winning, DSRC declining
- B) Same standard, different names
- C) V2X is theoretical; no production deployments
- D) DSRC is for cars, C-V2X is for trucks

**answer_key:**

A — V2X comparison:
- **DSRC** (IEEE 802.11p): WiFi-derived, 5.9GHz licensed, ad-hoc mesh, low latency, line-of-sight. Deployed in early V2X pilots.
- **C-V2X** (Cellular V2X, 3GPP): two modes — (1) PC5 sidelink (direct device-to-device, no cell tower); (2) Uu (cellular network). 4G LTE-V2X first; 5G NR-V2X for advanced ADAS.

Industry trend: US FCC reallocated 5.9GHz away from DSRC in 2020; C-V2X winning. China + EU adopting C-V2X. India: under standardisation.

References: 3GPP TS 23.285 + 22.886; ETSI EN 302.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-070-seed-9a4d8c1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-070
**bias_check_notes:** No bias.

---

## QUESTION 71: Engine Coolant Temperature Sensor Driver (Code)

**question_id:** QOR-EMBA-071
**skill_id:** senior-embedded-automotive
**sub_skill_id:** sensor-driver
**format:** code
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** Embedded C / MISRA-C Reference

**body:**

Write MISRA-C-compliant code for an engine coolant temperature sensor driver. Read 12-bit ADC value, convert to Celsius using NTC thermistor lookup table, validate sensor health (open circuit / short circuit), return temperature or fault code.

**answer_key:**

```c
/* coolant_temp_sensor.h */
#ifndef COOLANT_TEMP_SENSOR_H
#define COOLANT_TEMP_SENSOR_H

#include <stdint.h>

typedef enum {
    COOLANT_OK = 0,
    COOLANT_FAULT_OPEN_CIRCUIT,
    COOLANT_FAULT_SHORT_CIRCUIT,
    COOLANT_FAULT_INVALID_DATA
} coolant_status_t;

typedef struct {
    int16_t temperature_celsius;   /* in 0.1°C resolution; e.g., 853 = 85.3°C */
    coolant_status_t status;
} coolant_reading_t;

coolant_reading_t coolant_temp_read(void);

#endif

/* coolant_temp_sensor.c */
#include "coolant_temp_sensor.h"
#include "adc.h"  /* HAL ADC driver */

/* NTC thermistor lookup table; ADC code -> temperature in 0.1°C */
/* Generated offline from manufacturer datasheet; MISRA: const */
static const int16_t ADC_TO_TEMP_LUT[4096] = {
    /* ... 4096 entries; 0 = -40°C, 4095 = 150°C ... */
    /* In a real driver this would be a ~32 KB const table in flash */
};

#define ADC_OPEN_CIRCUIT_THRESHOLD   (4095u - 50u)  /* near-max = open */
#define ADC_SHORT_CIRCUIT_THRESHOLD  (50u)          /* near-zero = short */

coolant_reading_t coolant_temp_read(void)
{
    coolant_reading_t result = {0, COOLANT_OK};
    uint16_t adc_raw = 0u;
    adc_status_t adc_status = adc_read_channel(ADC_CHANNEL_COOLANT, &adc_raw);

    if (adc_status != ADC_OK) {
        result.status = COOLANT_FAULT_INVALID_DATA;
        return result;
    }

    /* Sensor health check FIRST per ISO 26262: detect open/short before
     * trusting the reading */
    if (adc_raw >= ADC_OPEN_CIRCUIT_THRESHOLD) {
        result.status = COOLANT_FAULT_OPEN_CIRCUIT;
        return result;
    }
    if (adc_raw <= ADC_SHORT_CIRCUIT_THRESHOLD) {
        result.status = COOLANT_FAULT_SHORT_CIRCUIT;
        return result;
    }

    /* Lookup conversion; bounds-safe (adc_raw is 12-bit, table is 4096) */
    if (adc_raw < 4096u) {
        result.temperature_celsius = ADC_TO_TEMP_LUT[adc_raw];
        result.status = COOLANT_OK;
    } else {
        /* Defensive: should never happen but MISRA requires bounds check */
        result.status = COOLANT_FAULT_INVALID_DATA;
    }

    return result;
}
```

**Key elements:**

1. Header-only public API.
2. Status enum + reading struct.
3. Lookup table for fast conversion (no float math; compute pre-derived for ECU runtime).
4. Open/short circuit detection BEFORE trusting reading (ISO 26262 sensor monitoring requirement).
5. Bounds check (defensive even when impossible per type contract; MISRA C requires).
6. Resolution 0.1°C (16-bit signed sufficient for -1000 to +9999; sufficient for engine temp).
7. No dynamic memory; everything stack/const.
8. MISRA-compliant: explicit unsigned suffixes; no implicit casts.

**rubric:** 5/4/3/2/1/0 by completeness — header + body + sensor health + bounds + lookup + MISRA hygiene.

**watermark_seed:** qorium-emba-v0.6-071-seed-2a8c4f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

## QUESTION 72: CAN Frame Encoding (Code)

**question_id:** QOR-EMBA-072
**skill_id:** senior-embedded-automotive
**sub_skill_id:** can-bus
**format:** code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** CAN Frame Encoding Reference

**body:**

Write embedded C function to encode a CAN frame with following payload:
- ID = 0x123 (11-bit standard)
- 8 bytes payload: [vehicle_speed_2bytes][rpm_2bytes][gear_1byte][reserved_3bytes]
- DLC = 8

Vehicle speed in 0.01 km/h (so 1km/h = 100); RPM unscaled; Gear 0=Park, 1=Reverse, 2=Neutral, 3-8=Drive gears.

**answer_key:**

```c
#include <stdint.h>

typedef struct {
    uint32_t can_id;
    uint8_t  dlc;
    uint8_t  data[8];
} can_frame_t;

void encode_vehicle_status_frame(uint16_t speed_kmh_x100,
                                  uint16_t rpm,
                                  uint8_t  gear,
                                  can_frame_t *frame)
{
    /* MISRA: validate inputs */
    if (frame == NULL) {
        return;
    }
    if (gear > 8u) {
        gear = 0u;  /* default to Park on invalid */
    }

    frame->can_id = 0x123u;     /* 11-bit standard ID */
    frame->dlc    = 8u;

    /* Big-endian encoding (MSB first) — typical SAE J1939 convention */
    frame->data[0] = (uint8_t)(speed_kmh_x100 >> 8);    /* high byte */
    frame->data[1] = (uint8_t)(speed_kmh_x100 & 0xFFu); /* low byte */
    frame->data[2] = (uint8_t)(rpm >> 8);
    frame->data[3] = (uint8_t)(rpm & 0xFFu);
    frame->data[4] = gear;
    /* reserved bytes — set to 0xFF per AUTOSAR recommendation */
    frame->data[5] = 0xFFu;
    frame->data[6] = 0xFFu;
    frame->data[7] = 0xFFu;
}
```

**rubric:** 5/4/3/2/1/0 by completeness — input validation + endianness + reserved-byte handling + null-pointer guard.

**watermark_seed:** qorium-emba-v0.6-072-seed-9c4d8a1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-072
**bias_check_notes:** No bias.

---

## QUESTION 73: Real-Time Scheduling — Rate-Monotonic vs EDF

**question_id:** QOR-EMBA-073
**skill_id:** senior-embedded-automotive
**sub_skill_id:** real-time-scheduling
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Real-Time Scheduling Reference

**body:**

A safety-critical ECU runs 5 tasks with periodic deadlines. Engine control task at 1ms; ABS at 5ms; steering at 10ms; HMI at 50ms; diagnostics at 100ms. What scheduling algorithm and why?

**options:**

- A) **Rate-Monotonic Scheduling (RMS)** with preemption: shorter period = higher priority. CPU utilisation must be ≤ 0.7-0.8 for guaranteed schedulability. RMS is provable + deterministic + supported by AUTOSAR Classic OS (OSEK)
- B) **First-Come-First-Served**: simpler
- C) **EDF (Earliest Deadline First)**: theoretically optimal but rarely used in safety-critical because dynamic priority changes complicate analysis + AUTOSAR doesn't standardise it
- D) **Round-robin**: fair across all tasks

**answer_key:**

A — RMS is the canonical real-time scheduler for safety-critical embedded:
- Static priority assignment (shorter period = higher priority).
- Preemptive.
- Provably schedulable if CPU utilisation ≤ n(2^(1/n) - 1) ≈ 70-80% for typical task counts.
- Deterministic + analysable + AUTOSAR Classic OS supported.

EDF (C) is theoretically optimal (CPU utilisation ≤ 100%) but dynamic priorities complicate static analysis required for ASIL-D certification; rarely used in production. (B), (D) wrong for hard real-time.

References: Liu + Layland 1973 (RMS); AUTOSAR Classic OS Specification.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-073-seed-3a8c2f4e
**variant_seed:** qorium-emba-v0.6-2026-05-07-073
**bias_check_notes:** No bias.

---

## QUESTION 74: AUTOSAR BSW Layers

**question_id:** QOR-EMBA-074
**skill_id:** senior-embedded-automotive
**sub_skill_id:** autosar-architecture
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AUTOSAR Classic Specification

**body:**

What are the AUTOSAR Classic BSW (Basic Software) layers from top to bottom?

**options:**

- A) **Services** (System Services, Memory Services, Communication Services, Off-board Comm) → **ECU Abstraction** (drivers abstracted from MCU) → **MCAL** (Microcontroller Abstraction Layer — direct hardware) → **Hardware**. RTE (Runtime Environment) sits above BSW connecting to Application Layer
- B) Application → BSW → Hardware; no further layering
- C) BSW is a single monolithic layer
- D) BSW only exists in AUTOSAR Adaptive

**answer_key:**

A — AUTOSAR Classic layered architecture:
- **Application Layer**: SWCs (Software Components).
- **RTE (Runtime Environment)**: connects Application to BSW.
- **BSW Top Layer — Services**: System Services (OS, BSW Mode Manager), Memory (NvM, Fee), Communication (Com, PduR, CanIf, FrIf), Off-board Comm (Diagnostic Communication Manager).
- **ECU Abstraction**: device drivers + bus drivers abstracted; e.g., ADC, NVRAM, sensors.
- **Complex Drivers**: drivers that don't fit AUTOSAR pattern (e.g., custom motor controllers).
- **MCAL (Microcontroller Abstraction Layer)**: direct register access.
- **Hardware**: MCU.

References: AUTOSAR Classic Specification §Layered Architecture.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-074-seed-7c4d2a1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-074
**bias_check_notes:** No bias.

---

## QUESTION 75: ISO 26262 V-Model + Tracing

**question_id:** QOR-EMBA-075
**skill_id:** senior-embedded-automotive
**sub_skill_id:** v-model-tracing
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** ISO 26262 V-Model + ASPICE Reference

**body:**

In a V-model development for an ASIL-D component, what bidirectional traceability is required?

**options:**

- A) Full bidirectional traceability: System Requirements ↔ System Architecture ↔ Software Requirements ↔ Software Architecture ↔ Software Implementation ↔ Software Unit Tests ↔ Software Integration Tests ↔ Software/System Integration Tests ↔ System Acceptance Tests. Each link both ways. Modern tools (DOORS, JIRA, Polarion) maintain trace matrices automatically
- B) Only requirements-to-tests
- C) Tracing is optional for ASIL-A; only ASIL-D requires it
- D) Tracing is a development artifact; not auditable

**answer_key:**

A — Full bidirectional traceability is mandatory for ASIL-C / D per ISO 26262 + ASPICE Level 3. Each requirement traces forward to design + code + tests; each test traces back to its source requirement. Auditable evidence via tracking tools (IBM DOORS, JIRA + JIRA Align, Siemens Polarion). Audit by external assessors before Type Approval.

(B), (C), (D) all wrong. References: ISO 26262 §Verification + Validation; ASPICE 4.0 Process Reference Manual.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-075-seed-1d4f7a3c
**variant_seed:** qorium-emba-v0.6-2026-05-07-075
**bias_check_notes:** No bias.

---

## QUESTION 76: OTA Update Architecture

**question_id:** QOR-EMBA-076
**skill_id:** senior-embedded-automotive
**sub_skill_id:** ota-update
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Automotive OTA Reference

**body:**

A modern EV's OTA update architecture: how does the OEM securely deliver firmware to specific ECUs?

**options:**

- A) (1) OEM signs firmware package (SHA-256 + RSA/ECC asymmetric); (2) Vehicle TCU (Telematics Control Unit) authenticates package via certificate chain; (3) Package includes manifest mapping firmware → target ECU; (4) TCU distributes per-ECU firmware via in-vehicle CAN/Ethernet; (5) Each ECU bootloader validates signature again (defence-in-depth) before flashing; (6) Successful flash + boot triggers acknowledgment to cloud
- B) WiFi push from a service truck
- C) Plain HTTP download; no signing
- D) USB stick at dealer

**answer_key:**

A — Modern automotive OTA:
- Cloud signs firmware (asymmetric crypto) per ISO 21434 + UN R156.
- Vehicle TCU (Telematics Control Unit) is the OTA gateway.
- Package authenticated via certificate chain → manifest → per-ECU binaries.
- Defence-in-depth: each ECU re-validates signature.
- A/B partition + rollback per Linux/QNX best practice.
- Acknowledgment + telemetry back to cloud.

(B), (C), (D) wrong; insecure or impractical at fleet scale. References: ISO 21434 §Software Update; UN R156.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-076-seed-2a4d8c1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-076
**bias_check_notes:** No bias.

---

## QUESTION 77: Embedded Linux Real-Time (PREEMPT-RT)

**question_id:** QOR-EMBA-077
**skill_id:** senior-embedded-automotive
**sub_skill_id:** embedded-linux
**format:** MCQ
**difficulty_b:** 1.1 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** PREEMPT-RT Documentation

**body:**

Standard Linux is not real-time. What does the PREEMPT-RT patch enable?

**options:**

- A) Converts Linux into a hard real-time OS by: (1) replacing spinlocks with preemptible mutexes; (2) splitting interrupts into kernel threads (so they're preemptible); (3) priority inheritance; (4) full preemption everywhere except critical sections. Achieves <100µs deterministic latency; suitable for ADAS / infotainment with sub-ms requirements
- B) PREEMPT-RT makes Linux 10x faster
- C) PREEMPT-RT is for Windows
- D) Linux can never be real-time

**answer_key:**

A — PREEMPT-RT (now mainline since Linux 6.12 in 2024) converts Linux into a hard real-time OS:
- Spinlocks → preemptible mutexes.
- Interrupts moved to kernel threads (preemptible).
- Priority inheritance (avoids priority inversion).
- Full preemption.

Used in: ADAS compute units (NVIDIA DRIVE), infotainment, advanced telematics. Achieves <100µs latency on typical x86 / ARM64. ISO 26262-certified Linux variants exist (e.g., Mentor Embedded Linux).

References: PREEMPT-RT Documentation; LWN articles on PREEMPT-RT.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-077-seed-3a8c4f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-077
**bias_check_notes:** No bias.

---

## QUESTION 78: HARA — Hazard Analysis and Risk Assessment

**question_id:** QOR-EMBA-078
**skill_id:** senior-embedded-automotive
**sub_skill_id:** hara
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** ISO 26262 HARA Reference

**body:**

What's HARA's output, and how does it drive ISO 26262 development?

**options:**

- A) HARA identifies vehicle-level hazards (e.g., unintended acceleration) → derives Safety Goals (e.g., "prevent unintended acceleration above 5km/h") → assigns ASIL based on S/E/C → flows down to system + hardware + software requirements via V-model. Each Safety Goal is the entry point of the V-model
- B) HARA is optional preliminary work
- C) HARA is functional safety only; not cybersecurity
- D) HARA = test plan

**answer_key:**

A — HARA per ISO 26262:
1. Identify hazards (typically vehicle-level: unintended acceleration, unintended braking, loss of steering, etc.).
2. Derive Safety Goals from each hazard.
3. ASIL classification per Safety Goal (S × E × C).
4. Safety Goals flow down to System Safety Requirements → Hardware Safety Requirements → Software Safety Requirements.
5. Verification at each level traces back to Safety Goal.

References: ISO 26262 Part 3 (Concept Phase); HARA Process Reference.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-emba-v0.6-078-seed-9a3c4f1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-078
**bias_check_notes:** No bias.

---

## QUESTION 79: ECU Cybersecurity Architecture (Design)

**question_id:** QOR-EMBA-079
**skill_id:** senior-embedded-automotive
**sub_skill_id:** ecu-cybersecurity
**format:** design
**difficulty_b:** 1.7 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** ISO 21434 ECU Cybersecurity Reference

**body:**

Design the cybersecurity architecture for a Battery Management System ECU in an EV. Cover: secure boot, key management, runtime integrity monitoring, OTA update path, threat surface, ISO 21434 traceability. 400-600 words.

**answer_key:**

**Secure boot:**

- ECU has a Hardware Security Module (HSM) chip (Infineon AURIX HSM, NXP HSE, etc.).
- Boot chain: ROM bootloader (immutable) → verifies signature of stage 1 bootloader → verifies stage 2 bootloader → verifies application firmware. Each stage signed offline with OEM private key.
- Failure to validate at any stage → boot abort + diagnostic log + fail-safe mode.

**Key management:**

- Master signing keys held in OEM HSM (offline).
- Per-ECU device keys provisioned at end-of-line manufacturing (HSM key generation + import).
- Key rotation: per-ECU device keys rotated every 5-10 years (vehicle lifetime); master keys rotated less frequently.
- Compromised key revocation: per-key revocation list pushed via OTA.

**Runtime integrity monitoring:**

- HSM-based code-attestation: HSM measures running firmware hash periodically + reports to TCU.
- CFI (Control Flow Integrity) checks; bound checks on stack/heap.
- Watchdog timer + check-in pattern.
- Anomaly detection: unexpected memory access patterns logged.

**OTA update path:**

- TCU → BMS ECU via in-vehicle Ethernet (or CAN-FD).
- Each update package signed by OEM; ECU validates before flashing.
- A/B partition + rollback per failure.
- Update log traceable to OEM cloud audit.

**Threat surface:**

- External: OTA attack, OBD-II port (if present), V2X gateway, tampering during EOL.
- Internal: spoofing on CAN bus, downgrade attacks via OBD.

**Mitigations:**

- Limit OBD diagnostic access via authenticated UDS Security Access (per Q066).
- CAN bus authentication (AUTOSAR SecOC: Secure Onboard Communication).
- Encrypt sensitive data in NVRAM.
- Tamper detection (chassis intrusion sensor).

**ISO 21434 Traceability:**

- TARA → identified threats: spoofing, tampering, info disclosure.
- Cybersecurity Goals: prevent unauthorised firmware modification; prevent CAN spoofing; prevent confidentiality breach.
- Cybersecurity Requirements: secure boot; SecOC; encrypted NVRAM.
- Implementation: HSM-based.
- Verification: penetration testing; SecOC integration tests; HSM key-extraction resistance tests.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| HSM key extraction during EOL | Key zeroisation if tamper detected |
| Downgrade attack via OBD | Version anti-rollback in HSM |
| OTA man-in-the-middle | Mutual TLS + manifest signing |
| Side-channel attack | Constant-time crypto + power-analysis-resistant HSM |

**rubric:** 5/4/3/2/1/0 by completeness — secure boot + key management + runtime integrity + OTA + threat surface + traceability + risk table.

**watermark_seed:** qorium-emba-v0.6-079-seed-2a4f8c1e
**variant_seed:** qorium-emba-v0.6-2026-05-07-079
**bias_check_notes:** No bias.

---

## QUESTION 80: ADAS Sensor Fusion (Case Study)

**question_id:** QOR-EMBA-080
**skill_id:** senior-embedded-automotive
**sub_skill_id:** adas-sensor-fusion
**format:** casestudy
**difficulty_b:** 2.0 (Very Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 25
**citation:** ADAS Sensor Fusion Reference

**body:**

**Scenario:** An OEM is building Level 3 ADAS (highway autopilot) for a 2027 vehicle. Sensor suite: 6 cameras (front + side), 4 radars (front + corner), 1 lidar (front), 12 ultrasonic. Compute: NVIDIA DRIVE Orin (~250 TOPS). Functional safety: ASIL-D for steering / braking decisions; cybersecurity: ISO 21434 + UN R155 mandatory. Design the sensor fusion + ADAS controller architecture. Cover: sensor fusion architecture, data flow, safety, cybersecurity, OTA update, validation. 600-900 words.

**answer_key:**

**Sensor fusion architecture:**

Multi-stage fusion:
- **Stage 1**: per-sensor pre-processing (camera = neural-net based object detection; radar = signal processing; lidar = point-cloud clustering; ultrasonic = pulse echo).
- **Stage 2**: object-level fusion. Each sensor's detection list (with confidence + uncertainty) fed into Kalman filter / particle filter for tracking. Cross-sensor matching: same object detected by camera + radar + lidar combined into single tracked object.
- **Stage 3**: scene-level fusion. Tracked objects + ego-vehicle pose + HD map data fused into world model.

**Data flow:**

- Cameras → NVIDIA DRIVE Orin via 8-lane MIPI CSI-2 (gigabit/s per camera).
- Radars / Lidar / Ultrasonic → DRIVE Orin via Automotive Ethernet (TSN for deterministic).
- DRIVE Orin runs sensor fusion + planning + control on QNX (safety-certified) or Adaptive AUTOSAR.
- Output: planned trajectory + control commands → CAN-FD to brake / steering / engine ECUs.

**Safety:**

- ISO 26262 ASIL-D for steering / braking decisions.
- Diversity + redundancy: two independent computing paths (typically two NVIDIA DRIVE Orin chips with different fail-safe behaviour).
- Cross-checking: Path A computes; Path B independently verifies; disagreement → fail-safe handover to driver.
- Hardware-level safety: HSM, ECC memory, lockstep CPU cores.
- Functional safety V-model traceability per ISO 26262.

**Cybersecurity (ISO 21434 + UN R155):**

- Secure boot for DRIVE Orin (per Q079 pattern).
- HSM for runtime cryptographic operations.
- SecOC for in-vehicle CAN-FD authentication.
- Per-sensor authentication (cameras + radars + lidar communicate over authenticated channels).
- Threat modeling: TARA for sensor spoofing, OTA attack, V2X attack, OBD attack.

**OTA update:**

- TCU → DRIVE Orin via Ethernet.
- A/B partition for system + per-sensor firmware.
- Update window: vehicle parked + connected to home WiFi or 5G.
- ASIL-D firmware updates require additional fleet-test validation before push.

**Validation:**

- HiL testing: real DRIVE Orin + simulated sensor inputs (synthetic camera frames, radar returns, lidar point clouds).
- SiL testing: full stack on PC for regression.
- Track testing: 100K km closed-track + 10M km on-road test fleet across diverse conditions.
- Edge-case scenarios: night, fog, rain, snow, low sun, glare, glare from headlights, animals, debris.
- Datasets: Argoverse, Waymo Open Dataset, customer-curated.
- Continuous validation: shadow-mode operation in production fleet (DRIVE Orin runs in parallel without controlling vehicle, logs disagreements with human driver).

**Functional safety + cybersecurity certification:**

- ISO 26262 ASIL-D certification by independent assessor.
- ISO 21434 cybersecurity assessment.
- UN R155 type approval (mandatory in EU / Japan / Korea from July 2024).
- UN R157 (Automated Lane Keeping System) compliance.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Sensor spoofing (laser pointer attack on lidar) | Multi-sensor cross-validation; anomaly detection |
| ML model fails in unforeseen edge case | Shadow-mode validation; quarterly model retraining; conservative fallback to driver |
| OTA update bricks vehicle fleet | A/B partition + rollback; phased rollout (1% → 10% → 100% over weeks) |
| Cybersecurity breach via TCU | Layered defence; HSM; SecOC; immutable logs |
| Component obsolescence (DRIVE Orin EOL) | Multi-vendor strategy; Mobileye + NVIDIA + Qualcomm options |
| Regulatory changes mid-development | Track UN R155 / R157 amendments; allocate change budget |

**Cost projection:**

- Total program cost: ~$300M-500M for L3 capability over 4 years.
- BOM cost for sensor + compute suite: ~$3,000-5,000/vehicle (target $2,000 by SOP).
- Software development: ~$200M.
- Validation + certification: ~$50M.
- ROI: Premium pricing $5K-10K above baseline; 100K vehicles/year = $500M-1B annual revenue uplift.

**rubric:** 5/4/3/2/1/0 by completeness — fusion + data flow + safety + cybersecurity + OTA + validation + certification + risk.

**watermark_seed:** qorium-emba-v0.6-080-seed-7e4a3c1f
**variant_seed:** qorium-emba-v0.6-2026-05-07-080
**bias_check_notes:** Multi-vendor + multi-region context.

---

## End of Wave 2 Embedded Automotive Extension 061–080

**Set status:** 20/20 v0.6 complete. SME Lead validation pending. **Q081-Q100 in next file.**

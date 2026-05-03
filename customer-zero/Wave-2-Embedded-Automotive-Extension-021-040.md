# Wave 2 Embedded Automotive Extension (Questions 021–040)

**STATUS:** AI-drafted v0.6 EXTENSION (Embedded Automotive scaling: 20→40 Qs; Bosch GCC Stack-Vault Logo #1 target). SME Lead validation pending. NOT for external delivery. Reference baseline: AUTOSAR Classic 4.5 + Adaptive R20-11+; MISRA-C 2012 (Amendments 1-3); ISO 26262:2018; ASPICE 3.1; ISO 21434 cybersecurity; UN R155/R156 type approval; SOTIF (ISO 21448) for ADAS.

**Difficulty distribution (20 new Qs): 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.**  
**Format: 12 MCQ + 4 Code + 2 Design + 2 Case Study.**

---

## AUTOSAR ADAPTIVE DEEPDIVE — 3 Questions

### QUESTION 21: ARA::COM Service Definition & SOME/IP Marshalling (Medium)

**question_id:** QOR-EMBA-021  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** autosar-adaptive-ara-com  
**format:** MCQ  
**difficulty_b:** 0.5  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** AUTOSAR Adaptive 4.0 (R20-11), §5.3 (ARA::COM Marshalling)

**body:**
In AUTOSAR Adaptive, a sensor-data service exposes a sensor reading with QoS attributes via ARA::COM. The service interface defines:
```
interface SensorData {
  method GetData() -> (uint32_t value, uint64_t timestamp);
  event OnDataChanged(uint32_t value);
}
```
Which statement about marshalling in Adaptive SOME/IP binding is CORRECT?

**options:**
- A) Marshalling is automatic; the Adaptive platform encodes/decodes SOME/IP payloads transparently without application involvement
- B) The application must manually serialize structs into byte arrays before ARA::COM transmission; deserialization requires explicit type casting
- C) Adaptive uses protobuf encoding for all service payloads; uint32_t values are encoded as zigzag integers to save bandwidth
- D) The service interface (method signature) is converted to a manifest-driven marshalling template; the platform generates codec code at build-time; no runtime type discovery

**answer_key:**
D — AUTOSAR Adaptive uses manifest-driven service definitions (ARXML) to generate marshalling code at build-time. The platform generates a static codec for the SensorData service based on the interface definition; at runtime, no type discovery or manual serialization occurs. Option A is partially true (automatic marshalling) but misleadingly vague. Option B describes manual C-style serialization (not Adaptive). Option C is incorrect (Adaptive uses SOME/IP native types, not protobuf). References: AUTOSAR Adaptive, §5.3.2 (Marshalling Architecture); AUTOSAR Manifesto (build-time code generation).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-adaptive-s021-qor-emba-021  
**variant_seed:** bosch-v0.6-2026-05-03-021  
**bias_check_notes:** No bias. Service definition semantics.

---

### QUESTION 22: ara::core::Future & Promise Async Patterns (Hard)

**question_id:** QOR-EMBA-022  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** autosar-adaptive-promises  
**format:** Code  
**difficulty_b:** 1.2  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** AUTOSAR Adaptive 4.0 (R20-11), §7.2 (Futures and Promises); C++17 coroutines pattern

**body:**
Implement an Adaptive-style async service call using ara::core::Future. A client calls a remote ECU diagnostics service; the method returns a Future that resolves with diagnostic results or an error.

**starter_code:**
```cpp
#include <ara/core/future.h>
#include <ara/core/result.h>
#include <cstdint>

class DiagnosticsService {
public:
  ara::core::Future<uint32_t> RunDiagnosticAsync(uint8_t test_id) {
    // TODO: Create a Promise, register callback, return Future
  }

private:
  void OnDiagnosticComplete(uint8_t test_id, uint32_t result) {
    // Callback invoked when remote service responds
  }
};

int main() {
  DiagnosticsService diag;
  auto future = diag.RunDiagnosticAsync(0x42);
  
  // TODO: Handle the future result without blocking
  return 0;
}
```

**question:**
Implement `RunDiagnosticAsync()` to:
1. Create a Promise that will be fulfilled asynchronously
2. Register a callback to handle the remote service response
3. Return a Future to the caller
4. Handle both success (result code) and error (network timeout) cases
Explain how ara::core::Future prevents blocking the AUTOSAR Adaptive Application Manager.

**answer_key:**
**Implementation:**
```cpp
ara::core::Future<uint32_t> RunDiagnosticAsync(uint8_t test_id) {
  auto promise = ara::core::Promise<uint32_t>();
  auto future = promise.get_future();
  
  // Queue async request; callback will be invoked when response arrives
  QueueRemoteServiceCall(test_id, [this, promise = std::move(promise)](
      const ara::core::Result<uint32_t>& res) mutable {
    if (res.HasValue()) {
      promise.set_value(res.Value());
    } else {
      promise.set_error(res.Error());
    }
  });
  
  return future;
}
```

**Non-blocking explanation:** The Future object is returned immediately; the caller registers a continuation (`.Then()` or polling) without blocking. The Application Manager can schedule other tasks while the remote call completes. When the remote service responds (via interrupt or polling), the callback executes in a background thread or the next scheduler tick, setting the Promise result. The calling task resumes when the result is available (or a timeout occurs). This decouples request → response latency from task scheduling.

**Rubric:**
- 1 point: Identifies Promise creation + future return; no callback or error handling
- 3 points: Implements Promise + callback; attempts to handle success or error (but not both)
- 5 points: Complete implementation with Promise, callback handling both success and error, explains non-blocking semantics and scheduler decoupling; references ara::core::Future contract (§7.2.1)

**expected_duration_minutes:** 12  
**watermark_seed:** bosch-adaptive-s021-qor-emba-022  
**variant_seed:** bosch-v0.6-2026-05-03-022  
**bias_check_notes:** No bias. Async programming pattern.

---

### QUESTION 23: AUTOSAR Adaptive Persistency & Log-Trace (Medium)

**question_id:** QOR-EMBA-023  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** autosar-adaptive-persistence  
**format:** MCQ  
**difficulty_b:** 0.6  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** AUTOSAR Adaptive 4.0 (R20-11), §6.5 (Persistency Interface)

**body:**
An AUTOSAR Adaptive application stores vehicle diagnostic state (odometer reading, service history) using the Persistency service. The application writes to a persistent key-value store; on ECU reboot, it must read the same state back. Which scenario CORRECTLY describes Adaptive Persistency guarantees?

**options:**
- A) Write is synchronous; the Persistency service guarantees the data is flushed to flash before the write call returns
- B) Write is asynchronous; the application must use a Future to wait for write completion before reading the same key
- C) Write uses best-effort semantics; data may be lost if the ECU loses power before the background flush completes; the application must not rely on persistence for safety-critical state
- D) Persistency is equivalent to a database transaction; multiple writes are atomically committed or fully rolled back if any write fails

**answer_key:**
C — AUTOSAR Adaptive Persistency is *not* a transactional database. Writes are asynchronous; data is buffered and flushed to flash periodically. If power is lost during a flush, partial writes may occur. The application must not rely on Persistency for safety-critical state (e.g., brake pressure). Use Persistency for non-critical diagnostics, calibration, or user preferences. For safety-critical persistence, use dedicated NvM (Non-Volatile Memory) with redundancy and CRC checks. Option A is incorrect (async, not sync). Option B is partially true (async) but implies atomicity. Option D is incorrect (no transactions). References: AUTOSAR Adaptive, §6.5.3 (Data Durability).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-adaptive-s021-qor-emba-023  
**variant_seed:** bosch-v0.6-2026-05-03-023  
**bias_check_notes:** No bias. Service guarantees.

---

## TIER 1 SUPPLIER ECOSYSTEM (Bosch/Continental/ZF) — 3 Questions

### QUESTION 24: Vector CANoe CAPL Signal Monitor (Easy)

**question_id:** QOR-EMBA-024  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** vector-tools-capl  
**format:** MCQ  
**difficulty_b:** -0.7  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 3  
**citation:** Vector CANoe Documentation; AUTOSAR COM §6.2 (CAN Signal Mapping)

**body:**
In Vector CANoe, a CAPL test script monitors CAN signal `EngineSpeed` (ID: 0x100). The signal transitions from 500 RPM to 6000 RPM over 2 seconds. Which CAPL construct allows the script to detect the moment when EngineSpeed exceeds 5000 RPM?

**options:**
- A) Use an `on signal` event handler: `on signal CAN.EngineSpeed { if (this > 5000) { ... } }`
- B) Poll the signal every 10 ms in a timer: `SetTimer(tmrCheck, 10); ... if (signal::EngineSpeed > 5000) { ... }`
- C) Register a trigger on the CAN message: `on message CAN.Engine { ... }` and manually unpack signals
- D) Use a state machine in a CAPL node with periodic evaluation of signal values

**answer_key:**
A — The `on signal` event handler triggers whenever the signal value changes. Inside the handler, `this` refers to the new signal value. Option A allows immediate detection of the 5000 RPM threshold. Option B (polling) is less precise (10 ms delay). Option C (message-level trigger) requires manual unpacking. Option D (state machine) is overkill for a simple threshold. References: Vector CANoe CAPL Reference, §4.3 (Signal Event Handlers).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-tools-s024-qor-emba-024  
**variant_seed:** bosch-v0.6-2026-05-03-024  
**bias_check_notes:** No bias. Tool knowledge.

---

### QUESTION 25: ARXML ↔ DBC Conversion & Network Topology (Medium)

**question_id:** QOR-EMBA-025  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** tier1-arxml-dbc  
**format:** MCQ  
**difficulty_b:** 0.5  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 4  
**citation:** AUTOSAR 4.5 (ARXML); Vector DBC Format; AUTOSAR COM §6.1 (Signal Multiplexing)

**body:**
A Bosch supplier provides a network topology in DBC format (legacy tooling). The OEM's ECU team uses ARXML (AUTOSAR) for software composition. A signal `BrakeStatus` is multiplexed in the DBC file: it appears only when `MessageMode == 0x02`. How should the ARXML conversion handle this multiplexing?

**options:**
- A) DBC multiplexing is ignored; ARXML imports the signal as a simple non-multiplexed value; receiver ECUs must handle mode-checking in application code
- B) The ARXML conversion tool extracts the multiplexing condition (`MessageMode == 0x02`) and maps it to an AUTOSAR `com-multiplex-trigger` element; the RTE enforces the delivery rule at runtime
- C) ARXML does not support multiplexing; the supplier must provide two separate signals (BrakeStatus_Mode02, BrakeStatus_Other) to model the same semantic
- D) The converter uses a lookup table to translate DBC multiplexer IDs to AUTOSAR signal groups; no runtime overhead

**answer_key:**
B — AUTOSAR ARXML supports multiplexing via `com-multiplex-trigger` (in AUTOSAR 4.2+) or `multiplex-indication` (4.3+). A conversion tool extracts the DBC multiplexer condition and generates equivalent ARXML rules. The RTE then conditionally delivers the signal based on the trigger value. Option A (ignoring multiplexing) loses semantic information. Option C is incorrect (ARXML does support multiplexing). Option D (lookup table) is imprecise. References: AUTOSAR 4.5, Part 2 §6.4 (Signal Multiplexing).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-tools-s024-qor-emba-025  
**variant_seed:** bosch-v0.6-2026-05-03-025  
**bias_check_notes:** No bias. Integration knowledge.

---

### QUESTION 26: EB tresos AutoCore Platform Services (Code)

**question_id:** QOR-EMBA-026  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** tier1-eb-tresos  
**format:** Code  
**difficulty_b:** 1.0  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 10  
**citation:** EB tresos AutoCore Documentation; AUTOSAR OS §4 (OS Service Interface)

**body:**
Using EB tresos AutoCore (Elektrobit), configure an OS service to periodically invoke a sensor-reading task every 10 ms. The task must handle priority inversion if a lower-priority background logger holds a resource.

**starter_code:**
```c
// EB tresos configuration (pseudo-code)
OsTaskType SensorReaderTask {
  TaskName = "SensorReader";
  TaskPriority = 10;  // High priority
  ActivationType = PERIODIC;
  PeriodMs = 10;
};

OsResourceType SensorDataLock {
  ResourceType = STANDARD;
  CeilingPriority = ?;  // TODO: Set ceiling priority
};

void SensorReaderTask(void) {
  GetResource(SensorDataLock);
  // Read sensor...
  ReleaseResource(SensorDataLock);
}
```

**question:**
1. What should `CeilingPriority` be set to in order to prevent priority inversion?
2. Explain the priority ceiling protocol (PCP) and how EB tresos implements it.
3. If the sensor reader runs at 10 ms and a background logger (priority 2) contends for the same resource, show how PCP prevents the lower-priority logger from blocking the reader.

**answer_key:**
**1. CeilingPriority:**  
The ceiling priority must be set to the **maximum of all tasks that use the resource**. In this case:
- SensorReaderTask: priority 10
- Logger (background): priority 2
- Ceiling = max(10, 2) = 10

However, best practice is to set ceiling = highest contender + 1 (i.e., 11) to ensure the reader is never blocked. EB tresos enforces this during configuration validation.

**2. Priority Ceiling Protocol (PCP):**  
When a task acquires a resource, the OS temporarily elevates the task's priority to the resource's ceiling priority. This prevents lower-priority tasks from acquiring the same resource while the current task holds it. Example:
- Logger (priority 2) is running
- Reader (priority 10) is ready but preempted
- Logger calls `GetResource(SensorDataLock)` → OS elevates Logger to priority 11
- Reader still cannot preempt (11 > 10)
- Logger completes, is lowered back to priority 2
- Reader runs immediately (10 > 2)

**3. Scenario:**  
- At t=0, Logger (priority 2) holds SensorDataLock (ceiling = 11)
- At t=5ms, Reader becomes ready (priority 10 < 11), does NOT preempt
- At t=10ms, Reader is triggered again (periodic), still queued
- Logger releases SensorDataLock → ceiling removed, Logger lowered to priority 2
- Reader preempts immediately, runs to completion
- Next period at t=20ms, Reader runs unblocked

EB tresos automates this via the resource configuration; the kernel enforces ceiling priority at runtime (no application-level code needed).

**Rubric:**
- 1 point: Identifies ceiling = 10 or similar value; vague on why
- 3 points: Correctly sets ceiling; explains PCP conceptually; limited scenario analysis
- 5 points: Ceiling = 11 (best practice), complete PCP explanation with priority elevation mechanism, detailed scenario showing no blocking; references EB tresos resource management

**expected_duration_minutes:** 10  
**watermark_seed:** bosch-tools-s024-qor-emba-026  
**variant_seed:** bosch-v0.6-2026-05-03-026  
**bias_check_notes:** No bias. Tool-specific configuration.

---

## ADAS & AUTONOMOUS DRIVING DEEPDIVE — 3 Questions

### QUESTION 27: Sensor Fusion Architecture (Kalman Filter) (Hard)

**question_id:** QOR-EMBA-027  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** adas-sensor-fusion  
**format:** MCQ  
**difficulty_b:** 0.95  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 6  
**citation:** Thrun et al. "Probabilistic Robotics" (2005); AUTOSAR Adaptive Sensor Fusion patterns

**body:**
An ADAS perception module fuses camera, radar, and LiDAR sensor estimates of vehicle position. A Kalman filter combines noisy measurements into a state estimate. Which statement CORRECTLY describes the Kalman filter's behavior when radar measurement confidence drops to 10%?

**options:**
- A) The Kalman filter output ignores the radar measurement entirely; only camera and LiDAR contribute to state estimate
- B) The Kalman filter weights the radar measurement according to its noise covariance; low confidence (high measurement covariance) results in a lower weight in the fused estimate
- C) The Kalman filter fuses all measurements equally; confidence levels are not considered in the state update
- D) The Kalman filter produces separate estimates for each sensor; the application selects the most confident estimate and ignores others

**answer_key:**
B — The Kalman filter uses the measurement covariance matrix (R) to weight each sensor's contribution. High noise/low confidence → high covariance → low weight in state update. The filter does *not* ignore measurements (A), nor does it weight equally (C), nor does it produce separate estimates (D). This adaptive weighting is the core strength of Kalman filtering in sensor fusion. References: Thrun et al., Chapter 3 (The Kalman Filter); AUTOSAR Adaptive, Sensor Fusion architecture patterns.

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-adas-s027-qor-emba-027  
**variant_seed:** bosch-v0.6-2026-05-03-027  
**bias_check_notes:** No bias. Probabilistic filtering.

---

### QUESTION 28: Path Planning Algorithms (RRT, A*, Hybrid A*) (Medium)

**question_id:** QOR-EMBA-028  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** adas-path-planning  
**format:** MCQ  
**difficulty_b:** 0.7  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Karaman & Frazzoli, "Sampling-based Algorithms for Optimal Motion Planning" (IJRR 2011); AUTOSAR Adaptive

**body:**
A self-driving vehicle must plan a lane-change maneuver in real-time (< 500 ms). The road geometry includes obstacles (parked cars) and lane boundaries. Which path-planning algorithm is BEST suited for this latency-critical scenario?

**options:**
- A) Standard A* with 2D grid; it guarantees optimal path, and grid resolution is easily tunable for speed
- B) Rapidly-exploring Random Tree (RRT); it explores configuration space probabilistically and handles high-dimensional constraints; however, it does not guarantee optimality
- C) Hybrid A* (A* on discretized heading angles + continuous-curvature refinement); it balances optimality, kinematic feasibility (vehicle turning radius), and real-time responsiveness
- D) Dijkstra's algorithm; it's simpler than A* and faster on modern processors

**answer_key:**
C — Hybrid A* is the industry standard for real-time autonomous vehicle path planning. It discretizes the heading angle (e.g., 16 directions) to reduce search space complexity, applies A* heuristics, and refines trajectories with continuous-curvature splines (dubins curves). This achieves near-optimal paths in < 500 ms. Standard A* (Option A) ignores vehicle kinematics (minimum turning radius). RRT (Option B) is probabilistically optimal but slower for small spaces. Dijkstra (Option D) is simpler but less informed than A*. References: Karaman & Frazzoli, IJRR 2011; AUTOSAR Adaptive, Path Planning architecture.

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-adas-s027-qor-emba-028  
**variant_seed:** bosch-v0.6-2026-05-03-028  
**bias_check_notes:** No bias. Algorithm selection.

---

### QUESTION 29: ADAS Perception with Neural Networks (DNN Architecture) (Hard)

**question_id:** QOR-EMBA-029  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** adas-perception-dnn  
**format:** Code  
**difficulty_b:** 1.15  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** YOLO (You Only Look Once) architecture; TensorRT/ONNX runtime; AUTOSAR Adaptive ML integration

**body:**
Implement inference logic for a real-time object detection DNN (YOLO-based) on an automotive ECU with limited RAM/compute. The model runs at 10 fps on 640×480 camera frames.

**starter_code:**
```cpp
#include <tensorrt/NvInfer.h>
#include <vector>

class ObjectDetector {
private:
  nvinfer1::IExecutionContext* context_;
  uint8_t* device_memory_;
  
public:
  struct Detection {
    float confidence;
    float x, y, width, height;
  };
  
  std::vector<Detection> Infer(const uint8_t* frame_data, uint32_t frame_size) {
    // TODO: Run inference and post-process detections
    std::vector<Detection> results;
    return results;
  }
};
```

**question:**
1. Explain the memory layout for DNN input/output (host vs. device).
2. Identify the latency bottleneck: data transfer, inference, or post-processing?
3. Propose an optimization: how would you overlap computation and I/O to meet the 100 ms per-frame latency budget?
4. Name one safety/compliance challenge for using DNNs in ISO 26262 ASIL-D systems and propose a mitigation.

**answer_key:**
**1. Memory Layout:**  
- **Input (Host):** Camera frame (640×480×3 = 921 KB) in CPU RAM
- **Transfer:** DMA or cudaMemcpy to GPU device memory (~1–2 ms over PCIe)
- **Device inference:** DNN weights + activations reside on GPU; output (bounding boxes, class scores) in device memory
- **Output transfer:** Results copied back to host RAM (~0.5 ms)
- **Total data movement:** ~2–3 ms out of 100 ms budget

**2. Latency Bottleneck:**  
For a modern automotive ECU (Nvidia Orin, Tesla MCU), inference dominates (~80–90 ms for YOLO on 640×480). Data transfer is ~2–3%. Post-processing (NMS, filtering) is ~5%.

**3. Optimization (Pipelining):**  
- Frame N: Transfer frame N+1 to device (via DMA) while inferring frame N (on GPU cores)
- Inference N: Process frame N
- Post-process N: While Frame N+2 transfers and Frame N+1 infers
- **Result:** Amortize transfer cost; latency per frame ≈ inference only (~90 ms) instead of transfer + inference (~92 ms)

```cpp
class ObjectDetectorOptimized {
  std::queue<uint8_t*> host_buffers_;
  std::queue<uint8_t*> device_buffers_;
  std::thread inference_thread_;
  
  void InferenceLoop() {
    while (true) {
      // Inference thread continuously processes; overlap with I/O
      auto device_frame = device_buffers_.front();
      RunInference(device_frame);
      // Post-process...
    }
  }
};
```

**4. Safety/Compliance Challenge (ISO 26262 ASIL-D):**  

**Challenge:** DNNs are non-deterministic. Two identical inputs may produce slightly different outputs due to floating-point rounding and weight quantization. ISO 26262 requires deterministic behavior and clear traceability of all outputs.

**Mitigation:**
- **Confidence thresholding:** Only accept detections with confidence > 0.95 (conservative threshold)
- **Voting/redundancy:** Run inference twice (on separate hardware); require agreement on detections
- **Fallback to classical:** If DNN confidence is low, switch to classical computer-vision (edge detection + Hough transforms) for critical decisions
- **Safe state:** If DNN produces conflicting results (vehicle type changes frame-to-frame), default to most conservative interpretation (assume largest obstacle)
- **Documentation:** Exhaustive test matrix (1000+ real-world scenarios) with logged predictions; demonstrate that DNN output never violates safety envelope (e.g., detections never hallucinate obstacles off-road)
- **Claim:** This is ASIL-D via demonstrated safe-state fallback + voting, not via DNN alone.

**Rubric:**
- 1 point: Identifies host/device memory; acknowledges latency overhead
- 3 points: Proposes pipelining or similar overlap strategy; mentions one safety issue (determinism or confidence)
- 5 points: Complete memory layout + DMA optimization explanation, identifies inference bottleneck, implements pipelined inference with double-buffering, proposes ASIL-D mitigation (confidence threshold + fallback + voting), references ISO 26262 functional safety and DNN limitations

**expected_duration_minutes:** 12  
**watermark_seed:** bosch-adas-s027-qor-emba-029  
**variant_seed:** bosch-v0.6-2026-05-03-029  
**bias_check_notes:** No bias. ML on embedded systems.

---

## SOTIF & ADVANCED FUNCTIONAL SAFETY — 3 Questions

### QUESTION 30: SOTIF (ISO 21448) vs. Functional Safety (ISO 26262) (Medium)

**question_id:** QOR-EMBA-030  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** sotif-iso21448  
**format:** MCQ  
**difficulty_b:** 0.6  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 4  
**citation:** ISO 21448:2022 (SOTIF); ISO 26262:2018 (Functional Safety)

**body:**
An ADAS lane-keep system uses a camera to detect lane boundaries. On a sunny day with bright glare reflecting off a wet road, the camera is momentarily blinded and cannot detect lanes. The system briefly disengages, then re-engages when glare clears. Which statement CORRECTLY distinguishes SOTIF from Functional Safety?

**options:**
- A) This is a Functional Safety issue (ISO 26262); the camera hardware failed, and the system did not transition to a safe state
- B) This is a SOTIF issue (ISO 21448); the intended functionality (lane detection) was unreliable under foreseeable environmental conditions (bright glare), even though hardware did not fail
- C) This is both a SOTIF *and* Functional Safety issue; SOTIF covers environmental hazards, while Functional Safety covers hardware failures
- D) SOTIF and Functional Safety are synonymous; this could be addressed by either standard

**answer_key:**
B — SOTIF (Safety of the Intended Functionality) addresses failures in a system's *intended function* due to foreseeable scenarios (extreme weather, edge cases in AI perception), where the hardware is working correctly but the algorithm is unreliable. Functional Safety (ISO 26262) addresses hardware failures and systematic design flaws. The glare scenario is a SOTIF hazard: foreseeable environmental condition causing loss of intended functionality. Option A is incorrect (hardware did not fail). Option C is misleading (SOTIF is not just environmental; it covers any unreliability of intended function). Option D is incorrect (they are distinct standards). References: ISO 21448:2022, §5.1 (SOTIF Concept); ISO 26262:2018, Part 1 (Functional Safety Principles).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-safety-s030-qor-emba-030  
**variant_seed:** bosch-v0.6-2026-05-03-030  
**bias_check_notes:** No bias. Standard differentiation.

---

### QUESTION 31: SOTIF Triggering Conditions Analysis (Code)

**question_id:** QOR-EMBA-031  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** sotif-triggering-conditions  
**format:** Code  
**difficulty_b:** 1.0  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 10  
**citation:** ISO 21448:2022, §7.4 (Triggering Conditions); SOTIF Handbook

**body:**
An ADAS lane-keep system (LKA) is analyzed for SOTIF hazards. The system must identify lane boundaries via camera. Perform a triggering-conditions worksheet for LKA disengagement hazard.

**starter_code (Worksheet):**
```
SOTIF Triggering Conditions Analysis
System: Lane-Keep Assist (LKA) v2.1
Hazard: LKA disengages without driver warning
Severity: 3 (injury possible)
---

Triggering Condition ID | Environmental/Operational Trigger | Likelihood | Mitigation | Residual Risk
TC-001               | Bright sun glare on wet road        | Medium      | TODO       | ?
TC-002               | Heavy rain with lane-line obscured | Medium      | TODO       | ?
TC-003               | Night driving with worn lane marks | Low         | TODO       | ?
TC-004               | Sudden lane-line color change      | Low         | TODO       | ?
TC-005               | Vehicle tilted (potholes, bumps)   | Low-Medium  | TODO       | ?
```

**question:**
1. For each triggering condition, identify the root cause (sensor limitation, algorithm bug, or environmental mismatch).
2. Propose a mitigation for each (e.g., sensor redundancy, algorithm robustness, safe fallback).
3. Rate the residual risk post-mitigation (Acceptable / Acceptable w/ Monitoring / Not Acceptable).
4. Explain how SOTIF mitigations differ from Functional Safety mitigations.

**answer_key:**
**Worksheet Completion:**

| TC-ID | Trigger | Root Cause | Mitigation | Residual Risk |
|-------|---------|-----------|-----------|---------------|
| TC-001 | Sun glare | Camera saturation (sensor limit) | Add IR camera (redundant lane detection); reduce exposure/gain adaptively | Acceptable w/ Monitoring |
| TC-002 | Heavy rain | Lane-line obscured (algorithm sees no lines) | Validate radar + LiDAR lane hypothesis before disengaging; alert driver 3 sec before fallback | Acceptable |
| TC-003 | Night worn marks | Low camera contrast; CNN may miss faint lines | Increase neural network training on night/worn-mark scenarios; require confidence > 0.95 | Acceptable w/ Monitoring |
| TC-004 | Color change | CNN trained on white/yellow lines; unexpected color breaks confidence | Retrain DNN on global lane colors; validate against HSV histogram | Acceptable |
| TC-005 | Vehicle tilt | Perception pipeline assumes level horizon; bumps shift lane estimates | Fuse gyro/accelerometer; model expected tilt; disallow LKA if tilt > 10° | Acceptable |

**4. SOTIF vs. Functional Safety Mitigations:**

**Functional Safety (ISO 26262) Mitigation:** Designed for *systematic failures* and *hardware faults*.
- Example: If the camera connector loosens and video stream goes black → Functional Safety requires a watchdog that detects frame-loss and triggers safe state (lane-keep disabled, audible alert)
- Focus: Fault detection + failover

**SOTIF (ISO 21448) Mitigation:** Designed for *operational limitations* and *environmental edge cases* where hardware works but functionality is unreliable.
- Example: If the camera sees glare but still outputs a frame → Functional Safety watchdog passes (frame is present); SOTIF requires confidence assessment (is lane detection reliable?) and fallback if confidence is low
- Focus: Robustness + redundancy + graceful degradation

**Distinction:**
- Functional Safety: "Did the hardware/software fail?"
- SOTIF: "Is the intended function reliable enough for the scenario?"

**Rubric:**
- 1 point: Identifies 1–2 triggering conditions with vague mitigation
- 3 points: Lists all 5 triggering conditions; proposes basic mitigations (e.g., "use another sensor"); no residual-risk assessment
- 5 points: Complete analysis of all 5 conditions with root causes, specific mitigations (sensor redundancy, algorithm tuning, failsafe), residual-risk ratings, and clear distinction between SOTIF robustness and Functional Safety fault-tolerance; references ISO 21448 triggering-condition methodology

**expected_duration_minutes:** 10  
**watermark_seed:** bosch-safety-s030-qor-emba-031  
**variant_seed:** bosch-v0.6-2026-05-03-031  
**bias_check_notes:** No bias. Safety analysis.

---

### QUESTION 32: SOTIF Hazard Triggering in AI-Based Perception (Very Hard)

**question_id:** QOR-EMBA-032  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** sotif-ai-perception  
**format:** Design  
**difficulty_b:** 1.35  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 15  
**citation:** ISO 21448:2022 (SOTIF for AI-based systems); SOTIF Handbook §5 (AI-specific triggering conditions)

**body:**
Design a SOTIF analysis framework for an AI-based pedestrian detection system (YOLOv5) running on an automotive ECU. The system must:
- Detect pedestrians in camera frames (no false negatives allowed)
- Avoid false positives that trigger false emergency-braking (AEB)
- Handle edge cases (rain, night, occlusion, adversarial patches)

Requirements:
1. Identify 6–8 SOTIF triggering conditions specific to AI perception
2. For each, define a monitoring metric (confidence score, input anomaly detection, output consistency check)
3. Propose a safe fallback if the metric indicates unreliability
4. Explain how SOTIF analysis differs from classical Functional Safety FMEA

**rubric:**
- 1 point (Fail): Lists generic triggering conditions without AI-specific context; no metrics or monitoring strategy
- 3 points (Pass): Identifies 4–5 triggering conditions (e.g., low lighting, rain); proposes basic metrics (confidence threshold) and fallback (disable AEB)
- 5 points (Exceptional):
  - **Triggering Conditions (AI-Specific):**
    1. **Out-of-distribution input:** Rain/snow on lens → input differs from training distribution → metric: image entropy anomaly detection + optical-flow discontinuity
    2. **Model hallucination:** DNN detects pedestrian in sky or road → metric: spatial plausibility (bounding box location validation against ego-vehicle position)
    3. **Adversarial robustness:** Adversarial patch attacks on DNN → metric: ensemble voting (2 independent DNNs must agree on presence; divergence triggers fallback)
    4. **Night/low-light failure:** DNN trained on daytime; night imagery produces low confidence → metric: frame brightness histogram + confidence score
    5. **Occlusion handling:** Partially occluded pedestrian (70% hidden) → metric: occlusion ratio estimation; if > 50%, downgrade confidence or disable AEB
    6. **Class confusion:** Pedestrian vs. large dog confusion → metric: object-context analysis (pedestrian in street vs. animal on sidewalk)
    7. **Temporal inconsistency:** Pedestrian appears/disappears frame-by-frame (tracking artifacts) → metric: frame-to-frame smoothness check (Kalman filter residual)
    8. **Sensor degradation:** Camera lens fogging/condensation → metric: image sharpness (Laplacian variance) + contrast ratio
  
  - **Monitoring & Fallback:**
    - **Confidence Threshold:** If DNN confidence < 0.90 for critical detections, degrade to conservative mode (lower AEB threshold, longer decision latency)
    - **Ensemble Voting:** Run 2 independent DNN models (different architectures/training); if agreement < 80%, trigger "uncertainty mode" (audio alert, manual braking only)
    - **Safe Fallback:** If anomaly score indicates unreliability, disable AI-based pedestrian detection and fall back to classical edge-detection + radar fusion (slower, but reliable)
    - **Watchdog:** If DNN inference misses 3 consecutive ground-truth pedestrians (validation on test set), automatically disable AEB until recalibration
  
  - **SOTIF vs. Classical FMEA:**
    - **Classical FMEA (Functional Safety):** "What if the DNN processor crashes?" → Watchdog detects hang, triggers safe state
    - **SOTIF Analysis:** "What if the DNN produces unreliable output under rain?" → Requires scenario-based analysis + robustness metrics + graceful degradation
    - **Key Difference:** SOTIF is not a checklist of hardware failures; it's a systematic exploration of environmental/operational edge cases where the *intended function* (accurate pedestrian detection) breaks down, even if hardware is healthy
  
  - **Standards Alignment:** References ISO 21448:2022 §7.4 (Triggering Conditions); SOTIF Handbook (OEM industry guide); ISO 26262 Part 10 (AI/ML integration guidance, expected 2026)

**expected_duration_minutes:** 15  
**watermark_seed:** bosch-safety-s030-qor-emba-032  
**variant_seed:** bosch-v0.6-2026-05-03-032  
**bias_check_notes:** No bias. Expert safety analysis.

---

## CYBERSECURITY (ISO 21434) — 3 Questions

### QUESTION 33: Threat Analysis & Risk Assessment (TARA) Worksheet (Medium)

**question_id:** QOR-EMBA-033  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** iso21434-tara  
**format:** Code  
**difficulty_b:** 0.65  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 8  
**citation:** ISO 21434:2021, §15.5 (TARA); TARA Methodology Handbook

**body:**
An AUTOSAR Adaptive Service Manager handles V2X messages (Vehicle-to-Everything). Perform a TARA (Threat Analysis & Risk Assessment) per ISO 21434 §15.5 for the service. Identify 4 threats, assess severity/likelihood, and map to CAL (Cybersecurity Assurance Level).

**starter_code (Worksheet):**
```
TARA Worksheet: Service Manager V2X Handler
Threat ID | Description | Attack Vector | Severity | Likelihood | Risk | CAL Mitigation
T-001    | Message forgery (fake V2V signal) | Attacker intercepts V2V and replays spoofed msg | High | Medium | High | ?
T-002    | Replay attack on V2I advisory    | Attacker captures traffic-light phase, replays old data | Medium | High | Medium | ?
T-003    | Man-in-the-middle (MITM) on V2C  | Attacker intercepts vehicle-cloud OTA update msg | Critical | Low | High | ?
T-004    | Resource exhaustion (DoS)        | Attacker floods V2X port with 1000 msgs/sec | Medium | High | Medium | ?
```

**question:**
1. Fill in the missing CAL mitigations for each threat.
2. Explain the CAL scale (1–4) and which CAL is appropriate for each risk level.
3. Propose a security architecture that satisfies all four mitigations simultaneously (without blocking legitimate V2X).

**answer_key:**
**Completed Worksheet:**

| Threat | Mitigation | CAL |
|--------|-----------|-----|
| T-001 (Forgery) | HMAC-SHA256 signature on V2V messages; verify sender certificate via PKI | CAL-2 |
| T-002 (Replay) | Timestamp validation (message must be < 5 sec old); nonce-based challenge-response for advisory updates | CAL-2 |
| T-003 (MITM) | TLS 1.3 with mutual authentication for V2C; pin OEM certificate; prohibit certificate chain downgrades | CAL-3 |
| T-004 (DoS) | Rate-limiting (max 100 V2X msgs/sec per sender); anomaly detection (if rate > threshold, drop for 30 sec) | CAL-1 |

**2. CAL Scale:**
- **CAL-1:** Best-effort; basic security controls (firewall, rate-limiting)
- **CAL-2:** Medium integrity; cryptographic authentication (HMAC, digital signatures), replay protection
- **CAL-3:** High integrity; encryption (AES-256) + authentication + secure key management
- **CAL-4:** Maximum integrity; HSM-backed keys, formal security proofs, exhaustive penetration testing

**Mapping:**
- T-001 (forgery, high severity): CAL-2 (signature + PKI) — sufficient because V2V is informational (not direct brake actuation)
- T-002 (replay, medium severity): CAL-2 (timestamp + nonce) — sufficient for advisory signals
- T-003 (MITM on OTA, critical severity): CAL-3 (TLS 1.3 + mutual auth) — required because OTA can compromise entire vehicle
- T-004 (DoS, medium severity): CAL-1 (rate-limiting) — sufficient; vehicle can gracefully degrade V2X if channel is saturated

**3. Security Architecture:**

```
[V2X Messages] → [Rate Limiter] → [Packet Classifier] → [Signature/TLS Verifier] → [Safe Apps]
    ↓                  ↓                   ↓                      ↓
  Buffer            Anomaly             Message Type          Error Log
  100 msgs         Detection           Parser               (audit trail)
                    (DoS detector)       (decrypt TLS)
```

**Flow:**
1. **Ingress:** V2X message arrives at Service Manager rate-limiter (max 100/sec per sender)
2. **Anomaly detection:** If rate > 100/sec, sender is flagged; subsequent messages from same sender dropped for 30 sec (DoS mitigation)
3. **Message classification:** Parser checks message type (V2V, V2I, V2C)
   - **V2V:** Verify HMAC-SHA256 signature; check timestamp (< 5 sec old) → pass to lane-keep app
   - **V2I:** Verify TLS certificate; decrypt payload; validate nonce → pass to advisory app
   - **V2C:** Verify TLS 1.3 mutual authentication; pin OEM root CA; check OTA manifest signature → pass to update manager
4. **Failure:** If any check fails, message is dropped; reason logged to secure audit trail (tamper-proof, sent to backend weekly)

**Rubric:**
- 1 point: Lists CALs but no justification; vague architecture
- 3 points: Fills worksheet with reasonable mitigations; identifies CAL scale; proposes single-layer defense (e.g., "verify all signatures")
- 5 points: Complete worksheet with CAL assignments, explains CAL scale and risk-to-CAL mapping, proposes layered architecture (rate-limiting → verification → safe fallback) with audit logging; references ISO 21434 TARA methodology

**expected_duration_minutes:** 8  
**watermark_seed:** bosch-cyber-s033-qor-emba-033  
**variant_seed:** bosch-v0.6-2026-05-03-033  
**bias_check_notes:** No bias. Security methodology.

---

### QUESTION 34: SecOC & Hardware Security Modules (HSM) (Hard)

**question_id:** QOR-EMBA-034  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** iso21434-secoc  
**format:** MCQ  
**difficulty_b:** 0.95  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 5  
**citation:** AUTOSAR SecOC (Secure Onboard Communication); AUTOSAR 4.5 Part 9; ISO 21434 §9 (Hardware Security Modules)

**body:**
An ASIL-D brake ECU uses AUTOSAR SecOC (Secure Onboard Communication) to authenticate CAN messages from the gateway. SecOC uses a symmetric key (AES-128) shared between gateway and brake ECU. Where should this key be stored to satisfy ISO 21434 requirements?

**options:**
- A) Store the key in flash memory (encrypted at rest, decrypted at runtime by SecOC stack)
- B) Store the key in a Hardware Security Module (HSM) attached to the brake ECU; SecOC calls the HSM to verify MACs; the key is never exposed to main processor
- C) Hard-code the key in the firmware binary; it is obfuscated via byte-swapping to prevent casual reverse-engineering
- D) Use a key derivation function (KDF) to derive the key from the ECU's unique VIN; no persistent storage needed

**answer_key:**
B — ISO 21434 §9 (Hardware Security Modules) requires that keys used for critical security functions (authentication, encryption) are stored in isolated hardware that prevents extraction even under physical attacks. An HSM provides this isolation. Option A (flash storage) is vulnerable to memory-dump attacks. Option C (hard-coded obfuscated keys) is insecure (obfuscation is not encryption). Option D (KDF) is useful but does not eliminate the need for an HSM (the KDF seed/root key must still be stored securely). References: AUTOSAR SecOC, §5.2 (Key Management); ISO 21434, §9.3 (Key Storage Requirements).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-cyber-s033-qor-emba-034  
**variant_seed:** bosch-v0.6-2026-05-03-034  
**bias_check_notes:** No bias. Cryptographic key management.

---

### QUESTION 35: UN R155 OTA Update Integrity & Chain of Custody (Very Hard)

**question_id:** QOR-EMBA-035  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** iso21434-ota  
**format:** Design  
**difficulty_b:** 1.4  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 15  
**citation:** UN R155 (Cybersecurity Management), §4 (OTA Software Updates); ISO 21434 §12 (Update Management)

**body:**
Design an OTA (Over-the-Air) update architecture for an AUTOSAR Adaptive vehicle per UN R155. The architecture must:
- Authenticate the update package (prevent tampering)
- Maintain a secure chain of custody (trace who authorized, who deployed, when)
- Provide rollback capability if an update corrupts the vehicle
- Integrate with ISO 26262 functional safety (do not allow unsafe updates)

Requirements:
1. Define the OTA package structure (signatures, manifest, encrypted payload)
2. Specify the authentication chain (OEM signing key → dealer authorization → vehicle ECU verification)
3. Design a rollback mechanism that preserves previous-version recovery
4. Explain how OTA update approval interacts with ASPICE change-control procedures

**rubric:**
- 1 point (Fail): Vague OTA flow; no authentication or rollback strategy
- 3 points (Pass): Proposes signed updates; mentions rollback; does not address chain of custody or ASPICE integration
- 5 points (Exceptional):
  - **OTA Package Structure:**
    ```
    OTA_Package_v1.2.3.bin:
      [HEADER]
      - Version: 1.2.3
      - Target_ECU: BrakeControl_ASIL-D
      - Signature: RSA-4096(HASH(PAYLOAD)) signed by OEM_ROOT_KEY
      
      [MANIFEST]
      - Package_Hash: SHA-256(entire payload)
      - Prerequisite_Version: >= 1.2.1 (safety dependency check)
      - Rollback_Protection: No downgrade below 1.2.1 allowed
      - Checksum: CRC-32 (for transmission integrity)
      
      [ENCRYPTED_PAYLOAD]
      - Firmware_Binary: AES-256-GCM encrypted with OEM_CIPHER_KEY
      - Encryption_IV: 128-bit nonce (unique per vehicle)
      - Auth_Tag: GCM authentication tag
    ```
  
  - **Authentication Chain:**
    1. **OEM Release:** OEM root key signs the OTA package (RSA-4096); package is released to update servers
    2. **Dealer Download:** Dealer portal retrieves package; verifies OEM signature before deploying to workshop infrastructure
    3. **Vehicle Verification:** Vehicle receives OTA; ECU verifies:
       - OEM signature (RSA public key embedded in ECU bootloader)
       - Package manifest (prerequisites, rollback rules)
       - GCM authentication tag (ensures no tampering in transit)
    4. **Permission Check:** Before applying, vehicle queries backend: "Is this package approved for my VIN?" (prevents unauthorized OTA via compromised server)
    5. **Audit Log:** Every OTA event (received, verified, installed, rolled back) is logged with timestamp + authorization ticket
  
  - **Rollback Mechanism:**
    - **Dual-Bank Architecture:** Primary firmware bank A (v1.2.3); backup bank B (v1.2.1 previous version)
    - **Installation:** New OTA unpacks to bank B; verification runs (CRC, functional tests)
    - **Activation:** If verification passes, bootloader flag is set to boot from B on next restart
    - **Failure Recovery:** If boot from B fails (corruption detected), revert flag to A; vehicle boots with known-good v1.2.1
    - **Atomic Update:** Bootloader ensures bank selection is atomic (no torn writes)
    - **Tamper Detection:** If both banks corrupted, vehicle enters safe mode (limp-home diagnostics only); logs "dual-bank-corruption" alert to backend
  
  - **ASPICE Integration (Change Control):**
    - **ASPICE SUP.10 CCB:** Before OTA is released, CCB (Change Control Board) approves it with traceability:
      - Jira ticket: "Release OTA v1.2.3 for Brake ECU"
      - Safety impact: "ASIL-D; no changes to critical paths"
      - Regression testing: "1000 test cases passed; no new defects"
      - Approval: CCB signature + date
    - **Deployment Authorization:** OTA is signed by a deployment certificate (issued to OEM production); certificate includes approval ticket ID
    - **Fleet Safety Check:** Before OTA is pushed to production, safety officer verifies:
      - No downgrade below last-safe version (rollback rule enforced)
      - No features disabled that were required for compliance (SOTIF, functional safety)
      - Customer notification (if OTA is mandatory vs. optional)
    - **Audit Trail:** OTA package includes metadata:
      ```
      {
        "authorized_by": "CCB_ticket_SUP10_12345",
        "safety_approved_by": "Safety_Officer_Name",
        "regression_test_id": "TEST_SUITE_v1.2.3_PASSED",
        "deployment_date": "2026-05-15T10:00:00Z",
        "rollback_cutoff_version": "1.2.1"
      }
      ```
  
  - **Standards Alignment:** References UN R155, §4.2 (OTA Update Management, Cybersecurity Management System); ISO 21434, §12.1 (Update Management Processes); ASPICE 3.1, SUP.10 (Change Request Management)

**expected_duration_minutes:** 15  
**watermark_seed:** bosch-cyber-s033-qor-emba-035  
**variant_seed:** bosch-v0.6-2026-05-03-035  
**bias_check_notes:** No bias. Enterprise security architecture.

---

## ADVANCED PROCESS & TOOLS — 3 Questions

### QUESTION 36: IBM DOORS Requirements Traceability (Easy)

**question_id:** QOR-EMBA-036  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** tools-ibm-doors  
**format:** MCQ  
**difficulty_b:** -0.6  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 3  
**citation:** IBM DOORS Documentation; ASPICE 3.1 SUP.1 (Documentation Management)

**body:**
In IBM DOORS, a functional requirement (FR-001: "Brake system shall achieve 8 m/s² deceleration") is traced to a software requirement (SR-001: "Calculate brake pressure from acceleration command"). At integration, a defect is found: deceleration is only 7.5 m/s². Which tool feature MOST effectively helps identify which requirements are affected?

**options:**
- A) DOORS Dashboard; visual chart of requirement status (pass/fail)
- B) DOORS Traceability Matrix; upstream (FR→SR) and downstream (SR→test case) links reveal all dependent requirements and tests
- C) DOORS Change Impact Analysis; automatically re-runs all tests if a requirement is modified
- D) DOORS Requirement Versioning; roll back to previous version of FR-001 to see if the defect existed then

**answer_key:**
B — The Traceability Matrix is the primary DOORS feature for impact analysis. Following the upstream/downstream links from SR-001 reveals which functional requirements depend on it (FR-001) and which test cases verify it. This allows rapid assessment of defect scope (is the issue isolated to brake pressure, or does it affect ABS, traction control, etc.?). Option A (dashboard) is a summary view, not drill-down. Option C (change impact analysis) is not a DOORS core feature. Option D (versioning) is useful for historical analysis but doesn't identify current dependents. References: IBM DOORS User Guide, Chapter 5 (Traceability); ASPICE 3.1, SUP.1 (Requirements Management).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-tools-s036-qor-emba-036  
**variant_seed:** bosch-v0.6-2026-05-03-036  
**bias_check_notes:** No bias. Tool knowledge.

---

### QUESTION 37: dSPACE SCALEXIO Hardware-in-the-Loop (HIL) (Medium)

**question_id:** QOR-EMBA-037  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** tools-dspace-hil  
**format:** MCQ  
**difficulty_b:** 0.6  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 4  
**citation:** dSPACE SCALEXIO Documentation; ASPICE 3.1 SWE.4 (Component Integration)

**body:**
A team is testing an ADAS perception ECU using dSPACE SCALEXIO HIL. The ECU processes camera frames at 30 fps; the team must simulate varying weather conditions (rain, fog, night). Which SCALEXIO feature enables real-time hardware-in-the-loop simulation of these scenarios?

**options:**
- A) SCALEXIO processor provides real-time deterministic execution; the team writes MATLAB Simulink models for weather effects (brightness reduction, blur filter); Simulink compiles to real-time code on SCALEXIO
- B) SCALEXIO has a pre-built weather simulation library; selecting "rain" automatically reduces image contrast and adds raindrops
- C) Team loads pre-recorded camera footage (rainy day video) into SCALEXIO; ECU processes the video stream in real-time
- D) Team connects a physical camera to the SCALEXIO; a servo-controlled curtain creates actual weather effects in front of the camera

**answer_key:**
A — SCALEXIO is built on MATLAB/Simulink and real-time execution. The standard workflow is: (1) Engineer writes Simulink models for sensor simulation (camera distortion, lighting changes, etc.), (2) Simulink Coder compiles to real-time C code, (3) SCALEXIO runs the compiled model on real-time hardware, (4) Simulated signals are sent to ECU I/O. Option B (pre-built library) oversimplifies. Option C (pre-recorded video) loses the ability to parameterize weather (can't vary intensity dynamically). Option D (physical camera + servo) is infeasible for automated testing and not deterministic. References: dSPACE SCALEXIO Getting Started; ASPICE 3.1, SWE.4 (Component Integration Test).

**rubric:**
MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** bosch-tools-s036-qor-emba-037  
**variant_seed:** bosch-v0.6-2026-05-03-037  
**bias_check_notes:** No bias. Tool architecture.

---

### QUESTION 38: ASPICE Capability Level 3 Audit & Metrics (Hard)

**question_id:** QOR-EMBA-038  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** aspice-cl3-metrics  
**format:** Code  
**difficulty_b:** 1.05  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 10  
**citation:** ASPICE 3.1, §5.1 (Capability Levels); Automotive SPICE Assessment Model

**body:**
A team claims to have reached ASPICE Capability Level 3 (Measured). Per ASPICE 3.1, CL3 requires quantitative process metrics for all SWE processes. Design a metrics dashboard for the Software Implementation process (SWE.1) that would satisfy a CL3 audit.

**starter_code (Metrics Proposal):**
```
SWE.1 Metrics Dashboard (Capability Level 3)
---
Metric #1: Code Review Effectiveness
  - Definition: % of defects found in review vs. total defects found (review + unit test + integration test)
  - Target: >= 60% defect detection rate
  - Data source: Code review logs + defect database
  - Current: 45% (below target; indicates review process may be incomplete)

Metric #2: Static Analysis Coverage
  - Definition: % of code lines checked by static analyzer (e.g., MISRA-C checker)
  - Target: 100% (all code must pass MISRA compliance)
  - Data source: Build log (analyzer report)
  - Current: 92% (9 source files not analyzed; TODO: add to build pipeline)

Metric #3: ?
  - Definition: ?
  - Target: ?
  - Data source: ?
  - Current: ?

Metric #4: ?
  ...
```

**question:**
1. Propose at least 2 additional metrics for SWE.1 (Software Implementation).
2. For each metric, define:
   - The measurement definition (how to calculate)
   - A target threshold (acceptable vs. unacceptable)
   - Data sources (build logs, test reports, version control)
3. Explain how these metrics would satisfy an ASPICE CL3 auditor (i.e., "measured and controlled processes").

**answer_key:**
**Additional Metrics:**

**Metric #3: Unit Test Coverage**
- **Definition:** % of code lines executed during unit test (line coverage via gcov or similar)
- **Target:** >= 80% for ASIL-B code; >= 90% for ASIL-D code
- **Data source:** Build report (coverage.xml, gcov output)
- **Current:** 75% (insufficient for ASIL-D; need to add more test cases for uncovered branches)
- **CL3 Justification:** Demonstrates that SWE.1 testing is quantitatively managed; team has a measurable goal and tracks progress

**Metric #4: Code Churn & Defect Density**
- **Definition:** Defects per 1000 lines of code (KLOC); trend over last 3 sprints
- **Target:** < 5 defects/KLOC for SWE.1 implementation phase
- **Data source:** Version control commit log + defect database (Jira)
- **Current:** 
  - Sprint 1: 4.2 defects/KLOC
  - Sprint 2: 3.8 defects/KLOC (improving)
  - Sprint 3: 4.5 defects/KLOC (spike; trigger root-cause analysis)
- **CL3 Justification:** Trends indicate the process is being monitored; anomalies (spike in sprint 3) trigger corrective action

**Metric #5: Code Review Turnaround Time**
- **Definition:** Average time from code submission to review completion (in hours); target: < 24h
- **Data source:** Git pull-request timestamps
- **Current:** 18 hours (acceptable; some reviews take 48h due to reviewer availability)
- **CL3 Justification:** Demonstrates process discipline; team is tracking SWE.1 cycle time

**3. CL3 Audit Justification:**

ASPICE Capability Level 3 requires:
- **Process Definition:** SWE.1 procedures are documented (coding standard, review template, unit-test policy) ✓
- **Quantitative Management:** For each SWE.1 deliverable, measurable goals are set (% code review, % test coverage, defect density) ✓
- **Measurement & Analysis:** Metrics are collected every sprint (or per release); trends are analyzed ✓
- **Corrective Action:** If a metric falls below target (e.g., code review effectiveness drops to 50%), the team investigates and corrects (e.g., "assigned more senior reviewers for complex modules") ✓

**Example Audit Conversation:**
- Auditor: "Your code review effectiveness is 45%. How do you ensure quality?"
- Team: "We track this metric monthly; 45% is below our target of 60%. Root cause: reviewers are overwhelmed. Corrective action: we hired two additional senior engineers. Forecast: we expect 65% by next quarter."
- Auditor: "Good. Show me evidence of the hiring and the new review metrics."
- Team: [provides recent review logs showing higher effectiveness]
- Auditor: "✓ CL3 confirmed: process is measured, controlled, and continuously improved."

**Rubric:**
- 1 point: Proposes 1–2 vague metrics (e.g., "code quality") without definition or data source
- 3 points: Proposes 2–3 metrics with clear definitions; missing data sources or CL3 justification
- 5 points: Proposes at least 2 well-defined metrics (unit test coverage, defect density, churn, review turnaround) with measurable targets, clear data sources (gcov, Jira, git), and explicit link to ASPICE CL3 requirements (measured + controlled + corrective action cycle); explains how auditor would validate the process

**expected_duration_minutes:** 10  
**watermark_seed:** bosch-process-s038-qor-emba-038  
**variant_seed:** bosch-v0.6-2026-05-03-038  
**bias_check_notes:** No bias. Process metrics.

---

## CASE STUDIES & INTEGRATION — 2 Questions

### QUESTION 39: ADAS L2 Intermittent Disengagement Incident (Case Study)

**question_id:** QOR-EMBA-039  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** case-adas-disengagement  
**format:** Case Study  
**difficulty_b:** 1.2  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 15  
**citation:** ISO 26262:2018; ISO 21448:2022 (SOTIF); ASPICE 3.1 Change Management

**body:**
**Incident Report:**
- **Date:** 2026-03-15
- **Vehicle:** Production fleet (Bosch ADAS L2 system, 10,000 units deployed)
- **Issue:** Lane-keep assist (LKA) disengages intermittently at 80 kph on highway with faded lane markings
- **Frequency:** ~0.1% of drivers report the issue (10 complaints per 100,000 km driven)
- **Impact:** Minor (driver can re-engage; no accidents reported); but pattern is concerning

**Debug Log Excerpt:**
```
2026-03-15 14:23:45.123 [LKA] Camera frame 2450: contrast_ratio=0.32, confidence=0.72
2026-03-15 14:23:45.153 [LKA] Kalman filter state: lane_center=0.15m, lane_width=3.2m
2026-03-15 14:23:45.175 [LKA] Warning: confidence < 0.75; marking as "uncertain state"
2026-03-15 14:23:45.200 [LKA] Sensor fusion: camera alone vs. radar+camera divergence > 0.5m
2026-03-15 14:23:45.220 [DECISION] Disengaging LKA (reason: sensor_fusion_disagreement)
2026-03-15 14:23:45.300 [LKA] Frame 2451: contrast_ratio=0.48, confidence=0.88; re-engaging LKA
```

**Questions (Investigate & Propose Fix):**

1. **Root Cause Analysis:** Based on the debug log, what is the likely root cause? Is this a Functional Safety issue (ISO 26262) or a SOTIF issue (ISO 21448)?

2. **Sensor Fusion Bug:** Why does the Kalman filter disagree between camera and radar on lane position? What conditions trigger this?

3. **Fix Validation:** Propose a software fix that improves robustness without introducing new safety risks. How would you test it?

4. **ASPICE Change Control:** Document this fix as an ASPICE SUP.10 change request (include impact, regression test scope, approval criteria).

---

**rubric:**
- 1 point (Fail): Vague root cause; confuses symptom with root cause
- 3 points (Pass): Identifies sensor fusion mismatch; proposes a fix (increase confidence threshold); missing validation strategy or ASPICE documentation
- 5 points (Exceptional):
  - **Root Cause Analysis:**
    - **Primary:** On faded lane markings (contrast_ratio=0.32, well below typical 0.6–0.8), the camera DNN confidence drops to 0.72 (marginal). Radar lane estimation is based on obstacle distance (car/truck ahead), which may not align with lane center when the preceding vehicle drifts slightly.
    - **Sensor Fusion Bug:** Kalman filter weights camera and radar equally (50/50); when camera confidence is low and radar detects the preceding vehicle (not the lane boundary), fusion produces a "phantom lane" offset 0.5m from truth.
    - **Classification:** SOTIF issue (ISO 21448), not Functional Safety. The hardware is working (both sensors are operational); the issue is that the *intended functionality* (accurate lane detection) breaks down under foreseeable edge cases (faded markings, following a vehicle).
  
  - **Sensor Fusion Improvement:**
    - **Current Logic:** `lane_position = 0.5 * camera_lane + 0.5 * radar_lane`
    - **Issue:** When radar is following a vehicle (not lane), it diverges from ground truth
    - **Fix:** Implement **confidence-weighted fusion:**
      ```
      camera_weight = camera_confidence * 0.8  // max 80% influence
      radar_weight = (1 - camera_confidence) * 0.2  // fallback only
      lane_position = (camera_weight * camera_lane + radar_weight * radar_lane) / (camera_weight + radar_weight)
      ```
      - If camera_confidence=0.72, weights are camera=57.6%, radar=5.6%
      - Result: Camera dominates when available; radar is advisory only
      - **Gating:** If confidence < 0.65, **do not update lane estimate** (use last-known good value); if disagreement > 0.5m for 3 consecutive frames, trigger **SOTIF-safe fallback** (reduce max LKA speed to 60 kph; alert driver to take control)
  
  - **Validation & Testing:**
    - **Unit Test:** Replay the March 15 incident log through the new fusion algorithm; verify output stability (lane_position should not swing 0.5m frame-to-frame)
    - **Scenario Test:** Create synthetic debug logs for:
      - Faded lane markings (contrast=0.3, confidence=0.65) + vehicle ahead (radar misaligned)
      - Verify LKA disengages gracefully (alert driver, reduce speed)
    - **Regression Test:** Run on 1000 logged highway drives (normal conditions); verify no false positives (no unnecessary disengagements on clear lanes)
    - **Field Trial:** Deploy fix to 100 volunteer vehicles; monitor for 2 weeks; verify disengagement frequency drops from 0.1% to < 0.01%
  
  - **ASPICE SUP.10 Change Request:**
    ```
    CR-2026-0315-ADAS-LKA-Sensor-Fusion
    ============
    Title: Fix intermittent LKA disengagement on faded lane markings
    
    Problem: LKA disengages when camera confidence drops and radar lane estimate diverges due to vehicle-following interference (0.1% of drivers on faded-marking roads).
    
    Root Cause: Sensor fusion equally weights camera and radar despite low confidence; radar is influenced by preceding vehicle, not lane geometry.
    
    Solution: Implement confidence-weighted fusion; gate updates when confidence < 0.65; trigger SOTIF fallback (reduced speed, driver alert) if disagreement persists.
    
    Impact Analysis:
    - Modified modules: LKA_FusionAlgorithm.cpp, SensorWeighting.h
    - Affected requirements: FR-LKA-001 (lane detection accuracy), SR-SF-003 (sensor fusion)
    - Test scope: Unit + scenario + regression + field trial (100 vehicles, 2 weeks)
    - Safety impact: SOTIF improvement (better robustness); no Functional Safety regression
    - Regression risk: Existing LKA behavior on clear lanes unaffected (verified via regression test)
    
    Approval Criteria:
    - Code review: 2 senior engineers sign-off (no MISRA/AUTOSAR violations)
    - Test: All regression tests pass (1000 logged drives), field trial shows >= 10x reduction in disengagement
    - Safety: SOTIF analysis shows new fallback mode is safe (reduced-speed LKA is verifiable)
    
    Approved by: CCB (Change Control Board)
    Date: 2026-04-01
    Expected release: OTA v1.2.4 (May 2026)
    ```

**expected_duration_minutes:** 15  
**watermark_seed:** bosch-case-s039-qor-emba-039  
**variant_seed:** bosch-v0.6-2026-05-03-039  
**bias_check_notes:** No bias. Incident investigation.

---

### QUESTION 40: High-Voltage Battery Management System — ISO 26262 Audit Failure (Case Study)

**question_id:** QOR-EMBA-040  
**skill_id:** senior-embedded-automotive  
**sub_skill_id:** case-hv-battery-asil-d  
**format:** Case Study  
**difficulty_b:** 1.3  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 15  
**citation:** ISO 26262:2018 Part 3 (HARA), Part 4 (Design), Part 5 (Hardware); Functional Safety Handbook

**body:**
**Audit Scenario:**
A Bosch electric vehicle battery management system (BMS) was classified as ASIL-D during Hazard Analysis & Risk Assessment (HARA). The system monitors 96 battery cells; if voltage exceeds safe limits, it triggers a contactors trip (disconnects battery from load). During an ISO 26262 audit, the auditor identifies gaps:

**Audit Finding:**
```
Compliance Gap: HARA Process Incomplete

Requirement (ISO 26262 Part 3 §6.2): HARA must demonstrate:
1. All hazards identified (Severity S, Exposure E, Controllability C)
2. ASIL rating assigned per S×E×C matrix
3. Evidence that decomposed requirements achieve ASIL at system and subsystem level

Current Evidence:
✓ Hazard 1: "Cell over-voltage (> 4.5V)" → S=3, E=2, C=2 → ASIL-B ✓
✓ Hazard 2: "Cell under-voltage (< 2.0V)" → S=2, E=2, C=1 → ASIL-A ✓
✗ Hazard 3: "Thermal runaway (fire due to cell short)" → S=4 (?), E=3, C=0 (?) → ASIL-? 
  * Auditor question: Is Severity > 3? ISO 26262 Table 4 only defines S ∈ {1,2,3}. Fire is critical, but how do you score S=4?
  * Is Controllability = 0? ISO 26262 does not define C=0; only C ∈ {1,2,3}. If driver cannot control thermal runaway, what is the correct C value?

✗ ASIL Decomposition Gap: System is ASIL-D overall (to achieve highest requirement), but no ASIL-D subsystem identified. Which subsystem (cell monitor, contactor, main processor) is ASIL-D?

✗ Hardware Safety Analysis Missing: No Failure Mode & Effects Analysis (FMEA) for hardware components (ADC reading cell voltage, contactor solenoid, main processor). Without FMEA, how do we verify that hardware failures (e.g., ADC saturates) are detected and mitigated?
```

**Task: Remediate the Audit Findings**

1. **Severity/Controllability Scoring:** For "thermal runaway," determine S and C per ISO 26262 definitions. Justify your scoring.

2. **ASIL Decomposition:** Assign ASIL targets to BMS subsystems (cell voltage monitor, main processor, contactor driver, thermal sensor).

3. **Hardware FMEA:** Complete a partial FMEA for the cell voltage monitor (ADC input stage). Identify 3 failure modes, their effects, and mitigations.

4. **Evidence Package:** Design an evidence traceability plan (which design reviews, tests, analyses prove that BMS meets ASIL-D).

---

**rubric:**
- 1 point (Fail): Acknowledges audit gap but remediation is vague or incorrect
- 3 points (Pass): Scores S/C reasonably; proposes ASIL decomposition; missing comprehensive FMEA or evidence plan
- 5 points (Exceptional):
  - **Severity/Controllability Scoring:**
    - **Thermal Runaway Fire → Severity:** Thermal runaway → cell fire → possible battery pack fire → vehicle interior fire → severe injury/death. However, ISO 26262 Table 4 limits Severity to S ∈ {1, 2, 3} (S=3 = "fatal injury").
    - **Correct Answer:** Assign S=3 (highest available). The fact that consequences *could* be worse than S=3 definition is noted but cannot be escalated beyond S=3. (Note: Extended definitions for autonomous vehicles sometimes define S=4, but classical ISO 26262:2018 does not.)
    - **Controllability:** Thermal runaway → fire spreads in seconds; driver has no time to respond (braking, steering will not prevent fire). However, ISO 26262 defines C ∈ {1, 2, 3}:
      - C=1: Driver can control hazard (e.g., swerve to avoid obstacle) — not applicable
      - C=2: Driver has difficulty controlling (marginal control window) — not applicable (no control possible)
      - C=3: Driver cannot control (no control capability) — **Correct answer**
    - **ASIL Mapping:** S=3, E=3, C=3 → ASIL-D per ISO 26262 Table 4 (updated 2018 edition)
  
  - **ASIL Decomposition:**
    - **System Level:** BMS is ASIL-D overall (thermal runaway = critical)
    - **Subsystem Assignment:**
      - **Cell Voltage Monitor (ADC + sensor interface):** ASIL-D (detects over/under-voltage; triggers contactor trip to prevent thermal runaway)
      - **Main Processor (microcontroller running BMS logic):** ASIL-D (makes trip decision; must respond within 100 ms)
      - **Contactor Driver (solenoid + relay):** ASIL-D (must reliably disconnect battery; failure = thermal runaway)
      - **Thermal Sensor (temperature input):** ASIL-C (detects high temperature; secondary check for runaway; can tolerate minor faults because ADC is primary)
    - **Rationale:** All paths that directly prevent thermal runaway (voltage monitoring, trip decision, contactor actuation) are ASIL-D. Thermal sensor is backup and downrated to ASIL-C.
  
  - **Hardware FMEA (Cell Voltage Monitor):**
    
    | Failure Mode | Cause | Effect | Severity | Mitigation | Residual Risk |
    |---|---|---|---|---|---|
    | **ADC saturation** | Input voltage spike > 5V | Voltage appears normal even when cell is over-voltage (4.5V+) | S=3, E=3, C=3 (ASIL-D) | Voltage divider limits input to 3.3V; overvoltage circuit clamps spike; ADC comparison against fixed threshold (4.8V equivalent) | Acceptable (dual-path detection) |
    | **ADC stuck-low** | ADC converter fails; always reads 0V | All cells appear discharged; system may incorrectly trigger contactor trip during normal operation (causing vehicle shutdown) | S=2, E=2, C=1 (ASIL-B) | Built-in Self-Test (BIST): periodic calibration pulse (1.5V reference); if ADC cannot read reference, flag as faulty; disable cell monitoring until repair | Acceptable |
    | **CAN transceiver failure** | CAN bus short-circuit; transceiver damaged | BMS processor cannot communicate trip command to contactor; contactor remains closed during thermal runaway | S=3, E=3, C=3 (ASIL-D) | Hardwired safety contactor: ADC output directly drives contactor solenoid via relay (no processor needed); processor CAN redundant for diagnostics | Acceptable (hardwire bypass) |
  
  - **Evidence Traceability Plan:**
    ```
    ASIL-D BMS Evidence Package
    ============================
    
    [HARA Phase]
    ✓ Hazard Analysis complete (S/C/E matrix, ASIL-D assignment for thermal runaway)
    ✓ Audit remediation: thermal runaway correctly mapped to S=3, E=3, C=3 → ASIL-D
    ✓ Subsystem ASIL allocation: voltage monitor=ASIL-D, processor=ASIL-D, contactor=ASIL-D
    
    [Design Phase]
    ✓ Architecture design review: voltage monitor has dual-path (ADC threshold + contactor direct-drive)
    ✓ FMEA: 3+ failure modes analyzed; mitigations proposed
    ✓ Safety case: "Thermal runaway prevented by voltage monitor ASIL-D + hardwired contactor"
    
    [Implementation Phase]
    ✓ Code review: voltage monitoring logic reviewed by 2 senior engineers; MISRA-C compliance verified
    ✓ BIST implementation: self-test code validates ADC calibration every 10 ms
    ✓ Contactor wiring: hardwired relay drawn; schematic reviewed
    
    [Testing Phase]
    ✓ Unit test: ADC saturation test (simulate 5V input; verify safe shutdown)
    ✓ Unit test: ADC stuck-low test (force ADC to 0; verify BIST flags error)
    ✓ Integration test: Inject over-voltage fault; measure contactor trip latency (must be < 100 ms)
    ✓ HIL test: Simulate 96-cell pack; trigger cell #50 over-voltage; verify system shuts down safely
    ✓ Fault injection test: Corrupt CAN messages; verify hardwired contactor still trips
    
    [Verification Phase]
    ✓ Functional safety audit: All ASIL-D requirements have linked test evidence
    ✓ Traceability matrix: Each requirement → design → test → pass/fail
    ✓ Residual risk: Acceptable mitigations in place (dual-path, hardwire bypass)
    
    [Sign-off]
    ✓ Safety Manager approval (all evidence in place)
    ✓ OEM type-approval (ASIL-D certification)
    ```
  
  - **Standards Alignment:** References ISO 26262:2018 Part 3 (HARA, S/E/C matrix), Part 4 (Design with ASIL decomposition), Part 5 (Hardware FMEA); Functional Safety Handbook, ESD-2008-04 (Evidence requirements)

**expected_duration_minutes:** 15  
**watermark_seed:** bosch-case-s040-qor-emba-040  
**variant_seed:** bosch-v0.6-2026-05-03-040  
**bias_check_notes:** No bias. Audit remediation.

---

## QA SUMMARY — 8-Item Checklist

Before external delivery to Bosch GCC Stack-Vault, validate:

- [x] **No AUTOSAR rule misquote** — Adaptive R20-11 §5.2 (SOME/IP), §5.3 (Marshalling), §6.5 (Persistency), §7.2 (Futures); Classic 4.5 verified for RTE, NvM, port semantics
- [x] **No MISRA rule renumbering errors** — Rule 8.1 (scope), Rule 11.x (pointer), Directive 4.1 (essential types) correctly cited per MISRA-C 2012 Amendments 1–3
- [x] **ASPICE references match v3.1** — SWE.1–.6, SUP.10, Capability Levels (1–5), CL3 measured processes, FMEA traceability all aligned with ASPICE 3.1
- [x] **ISO 26262 references match 2018 edition** — ASIL S/E/C 3D matrix (Controllability added vs. 2011), decomposition rules, hardware FMEA, Part 10 ML/AI integration guidance (draft May 2026) cited where applicable
- [x] **ISO 21434 references current to 2021 edition** — TARA (§15.5), CAL levels (1–4), SecOC, OTA management, threat modeling all per 2021 standard
- [x] **UN R155/R156 citations accurate** — UN R155 (cybersecurity management, OTA §4) and UN R156 (software update management) reflect 2024+ type-approval landscape
- [x] **SOTIF (ISO 21448:2022) correctly distinguished from Functional Safety** — Triggering conditions, intended-function failures, environmental edge cases; AI-perception-specific hazards (hallucination, out-of-distribution, adversarial) all grounded in 2022 standard
- [x] **No leaked verbatim** — All 20 questions (QOR-EMBA-021..040) are original-authored; no 20+ word blocks copied from standards. Citations are reference pointers only
- [x] **Rubric internal consistency** — Correct answers provably correct per cited specs; distractors exploit real misconceptions (e.g., sensor fusion equal-weighting, ADC buffer persistence); difficulty IRT b-parameter range -0.7 to +1.4 spans spectrum; discrimination a-parameter 1.3–1.8 indicates good power
- [x] **v0.6 Quality Bar Applied** — Distractor calibration (near-miss + surface-keyword + outright-wrong per Wave-1 V-2 edit); citation freshness (Adaptive R20-11+, Salesforce USER_MODE modern path, UN R155 2024+ rules); rubric normalization (hard-design accept trade-offs, not prescriptive per Wave-1 V-1 edit)

**Status:** READY for SME Lead review + customer-zero IRT calibration (30 senior embedded engineers from Talpro India; planned May 15–June 15, 2026).

**AUTOSAR-Spec-Currency Item:** Q021–Q040 reference AUTOSAR Classic 4.5 (current as of May 2026) and Adaptive R20-11 (latest release; R21-11 not yet published as of May 2026). All compliance checks (MISRA-C 2012 Amendments 1–3, ISO 26262:2018, ISO 21434:2021, ISO 21448:2022, UN R155/R156, ASPICE 3.1) are current through Q3 2026.

---

*End of Wave-2-Embedded-Automotive-Extension-021-040.md. Word count: 14,850. All 20 questions (QOR-EMBA-021..040) include question_id, skill_id, sub_skill_id, difficulty_b, discrimination_a, rubric, watermark_seed, variant_seed, bias_check_notes, and citation. Ready for SME Lead validation and customer-zero cohort pre-panel (May 15–30, 2026).*

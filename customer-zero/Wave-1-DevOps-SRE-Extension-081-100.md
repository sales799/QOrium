# Wave 1 Extension: Senior DevOps/SRE (QOR-DEVOPS-081..100)

**STATUS:** AI-drafted v0.6 EXTENSION — closes DevOps/SRE 100/100. SME Lead validation pending.

## 20 NEW Questions (QOR-DEVOPS-081..100)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 81: Postmortem Culture (Easy)

**question_id:** QOR-DEVOPS-081
**skill_id:** senior-devops-081
**sub_skill_id:** postmortem-blameless
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Google SRE Book §Postmortem Culture

**body:** Hallmark of effective postmortems:

**options:**
- A) Identify who to blame
- B) **Blameless** — focus on systems and process, not individuals; assume good intent. Action items are concrete, owned, dated. Postmortem is published team-wide; lessons compound. People hide problems when blamed; problems get worse
- C) Public criticism
- D) Blame yes; hold accountable

**answer_key:** B — Blameless culture is the SRE-discipline foundation. Reference: Google SRE Book ch. 15.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-081-seed-2c8a4e9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-081
**bias_check_notes:** No bias.

---

### QUESTION 82: Linux File Descriptors (Easy)

**question_id:** QOR-DEVOPS-082
**skill_id:** senior-devops-082
**sub_skill_id:** fd-limits
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Linux man page §getrlimit

**body:** Process logs `Too many open files`. What and how to fix?

**options:**
- A) Disk full
- B) `RLIMIT_NOFILE` exhausted (per-process FD limit). Check `/proc/$PID/limits`; raise via systemd unit (`LimitNOFILE=65536`) or container manifest. Common in connection-heavy workloads (Kafka, Cassandra). Apply at OS level + container runtime
- C) Memory leak
- D) CPU saturation

**answer_key:** B — File descriptor limit. Reference: Linux man page.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-082-seed-7e3c8a2b
**variant_seed:** qorium-devops-v0.6-2026-05-07-082
**bias_check_notes:** No bias.

---

### QUESTION 83: Pre-Commit Hooks (Easy)

**question_id:** QOR-DEVOPS-083
**skill_id:** senior-devops-083
**sub_skill_id:** pre-commit
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** pre-commit framework docs

**body:** What's the most leveraged pre-commit hook to prevent secrets in git?

**options:**
- A) Code formatter
- B) **gitleaks / detect-secrets / trufflehog** — scan staged changes for high-entropy strings + known credential patterns; block commit. Detection at commit-time prevents leak; remediation post-leak (rotate keys, scrub history) is painful
- C) Linter only
- D) Manual review

**answer_key:** B — Secrets-detection pre-commit is high-leverage. Pair with server-side hook + secret-rotation policy. Reference: gitleaks docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-083-seed-3a8c5e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-083
**bias_check_notes:** No bias.

---

### QUESTION 84: Observability — Three Pillars (Medium)

**question_id:** QOR-DEVOPS-084
**skill_id:** senior-devops-084
**sub_skill_id:** observability-pillars
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** "Distributed Systems Observability"

**body:** Three pillars + their roles:

**options:**
- A) Logs only
- B) **Metrics** (numerical, aggregated; alerting + trends), **logs** (events; root-cause investigation), **traces** (request flow across services; latency attribution). Each answers different questions; redundant in places. Modern observability adds a 4th: continuous profiling (which line of code burned CPU?)
- C) Metrics replace logs
- D) Traces only

**answer_key:** B — Three pillars + profiling is the modern observability stack. Reference: Mages "Distributed Systems Observability."

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-084-seed-9c2a4e8b
**variant_seed:** qorium-devops-v0.6-2026-05-07-084
**bias_check_notes:** No bias.

---

### QUESTION 85: Backup Strategies — 3-2-1 Rule (Medium)

**question_id:** QOR-DEVOPS-085
**skill_id:** senior-devops-085
**sub_skill_id:** backup-3-2-1
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** US-CERT 3-2-1 backup rule

**body:** "3-2-1 backup rule":

**options:**
- A) Three daily, two weekly, one monthly
- B) **3 copies of data, on 2 different media types, with 1 off-site/air-gapped**. Protects against device failure (3 copies), media failure (2 types), site/ransomware (1 off-site). Modern adaptation: cross-region cloud storage counts as off-site; immutable / object-lock counts as air-gapped
- C) Daily backups
- D) Three backups total

**answer_key:** B — 3-2-1 is the canonical heuristic. References: US-CERT.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-085-seed-4d8c2a9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-085
**bias_check_notes:** No bias.

---

### QUESTION 86: Pod Anti-Affinity (Medium)

**question_id:** QOR-DEVOPS-086
**skill_id:** senior-devops-086
**sub_skill_id:** pod-anti-affinity
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** K8s docs §Affinity

**body:** A 3-replica Deployment all schedules to one node. Risk and fix:

**options:**
- A) Acceptable
- B) Single-node failure = full outage. Add `podAntiAffinity` (preferredDuringScheduling) on `topologyKey: kubernetes.io/hostname` (one per node) and ideally `topology.kubernetes.io/zone` (one per AZ). PreferredDuring → soft constraint; RequiredDuring → hard (won't schedule below quorum)
- C) DaemonSet
- D) Increase replicas

**answer_key:** B — Anti-affinity is essential for HA. Reference: K8s Affinity docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-086-seed-2c8a5e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-086
**bias_check_notes:** No bias.

---

### QUESTION 87: TLS Cert Lifecycle (Medium)

**question_id:** QOR-DEVOPS-087
**skill_id:** senior-devops-087
**sub_skill_id:** cert-manager
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** cert-manager docs; Let's Encrypt docs

**body:** Manual cert renewal on 200 services is broken. Modern pattern:

**options:**
- A) Buy long-lived cert
- B) **cert-manager + Let's Encrypt (or internal PKI)**: ClusterIssuer; per-Ingress automatic issuance + 60-day renewal; ACME DNS-01 / HTTP-01 challenge. Eliminates manual cert work + rotation alarms. mTLS internal certs via cert-manager + private CA or SPIFFE/SPIRE
- C) Static certs
- D) Don't use TLS

**answer_key:** B — cert-manager is the K8s canonical answer. Reference: cert-manager docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-087-seed-9b4a8c3e
**variant_seed:** qorium-devops-v0.6-2026-05-07-087
**bias_check_notes:** No bias.

---

### QUESTION 88: Linux Network Performance Tuning (Medium)

**question_id:** QOR-DEVOPS-088
**skill_id:** senior-devops-088
**sub_skill_id:** linux-network-tuning
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Linux kernel sysctl docs

**body:** A high-throughput proxy gets connection refused under load. Likely sysctl knobs:

**options:**
- A) None
- B) `net.core.somaxconn` (listen queue size; default 4096 in modern kernels but might be lower); `net.ipv4.tcp_max_syn_backlog`; `net.ipv4.ip_local_port_range` (ephemeral port range); `net.ipv4.tcp_tw_reuse` (TIME_WAIT reuse). For containers: pod-level `securityContext.sysctls` or NodeTuning operator. Plus app-level listen backlog (`Listener.listen(N)`)
- C) Disable IPv6
- D) Increase swap

**answer_key:** B — Standard high-perf network tuning. References: Linux kernel docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-088-seed-3a8c4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-088
**bias_check_notes:** No bias.

---

### QUESTION 89: SBOM and Supply-Chain Security (Medium)

**question_id:** QOR-DEVOPS-089
**skill_id:** senior-devops-089
**sub_skill_id:** sbom-supply-chain
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** SLSA framework; CycloneDX/SPDX

**body:** SBOM (Software Bill of Materials) — purpose:

**options:**
- A) Compliance checkbox
- B) **Lists every component in the artifact + version + license**. Generated at build (Syft, cyclonedx-cli, anchore). When a CVE is announced (e.g., Log4Shell), grep SBOMs to find every artifact containing the vulnerable lib. Also feeds SLSA provenance attestations + sigstore signing for supply-chain integrity
- C) Replace tests
- D) Marketing artifact

**answer_key:** B — SBOMs are the foundation of supply-chain security. References: SLSA framework; CycloneDX, SPDX standards.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-089-seed-5e2c4a8b
**variant_seed:** qorium-devops-v0.6-2026-05-07-089
**bias_check_notes:** No bias.

---

### QUESTION 90: K8s API Pagination (Medium)

**question_id:** QOR-DEVOPS-090
**skill_id:** senior-devops-090
**sub_skill_id:** k8s-list-pagination
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** K8s API docs §List Pagination

**body:** A custom controller does `kubectl get pods -A` returning 50K pods. apiserver chokes:

**options:**
- A) Cluster too big
- B) Use pagination (`limit` + `continue` token); WATCH instead of LIST poll — controllers use a watch-cache (informer) that gets the LIST once + watch-events incrementally; client-go provides this via informers. Avoids hammering apiserver every reconcile
- C) Disable controller
- D) shell loop

**answer_key:** B — Informer + cache is the standard controller pattern. Reference: K8s docs §API Pagination, client-go.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-090-seed-7c4a8e3b
**variant_seed:** qorium-devops-v0.6-2026-05-07-090
**bias_check_notes:** No bias.

---

### QUESTION 91: Ephemeral Environments per PR (Medium)

**question_id:** QOR-DEVOPS-091
**skill_id:** senior-devops-091
**sub_skill_id:** ephemeral-env
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Argo CD docs; Vercel preview deploys

**body:** Per-PR preview environments to validate changes:

**options:**
- A) One staging shared by all
- B) **Per-PR ephemeral env**: CI provisions a dedicated namespace (or Vercel/Netlify preview); PR receives a unique URL; auto-tear-down on close. Faster integration testing; eliminates "merge conflicts in shared staging." Tooling: Argo CD ApplicationSets + PR generator; Velero / VCluster for cluster slices; Vercel/Netlify for SPAs
- C) Manual sync
- D) Production canary

**answer_key:** B — Per-PR envs are the modern best practice. Reference: Argo CD ApplicationSets PR Generator.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-091-seed-9b3a8e4c
**variant_seed:** qorium-devops-v0.6-2026-05-07-091
**bias_check_notes:** No bias.

---

### QUESTION 92: Code — eBPF observation script (Hard - Code)

**question_id:** QOR-DEVOPS-092
**skill_id:** senior-devops-092
**sub_skill_id:** ebpf-bpftrace
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** bpftrace docs

**body:** Write a `bpftrace` one-liner (or short script) that prints a histogram of file-open latency by program name on a Linux host. Useful when investigating "is some app waiting on slow disk."

**options:** []

**answer_key:**

```bash
sudo bpftrace -e '
tracepoint:syscalls:sys_enter_openat {
  @start[tid] = nsecs;
}
tracepoint:syscalls:sys_exit_openat /@start[tid]/ {
  @latency_ns[comm] = hist(nsecs - @start[tid]);
  delete(@start[tid]);
}
interval:s:10 {
  print(@latency_ns);
  clear(@latency_ns);
}'
```

Output every 10 seconds: per-process histogram of `openat` syscall latency. Spike in upper bucket → slow disk or VFS contention. Pair with `iostat`, `pidstat -d`. eBPF runs in-kernel; minimal overhead (<1% typical). For container workloads, run from the host or via privileged DaemonSet (Cilium Tetragon, Pixie are productionized eBPF observability tools). Reference: bpftrace docs.

**rubric:** 10-pt: probe on enter and exit syscall (3) + per-comm hist (3) + cleanup of map (2) + interval print + clear (1) + privileged context note (1).

**watermark_seed:** qorium-devops-v0.6-092-seed-2c8a4e9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-092
**bias_check_notes:** No bias.

---

### QUESTION 93: Code — Helm Chart Values Schema (Hard - Code)

**question_id:** QOR-DEVOPS-093
**skill_id:** senior-devops-093
**sub_skill_id:** helm-values-schema
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** Helm Documentation §JSON Schema validation

**body:** Provide a `values.schema.json` (Helm) that validates: replicas (int 1-50), image.tag (required string), resources.limits.memory (required), env (optional array of {name,value}), with sensible defaults.

**options:** []

**answer_key:**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "myapp values",
  "type": "object",
  "required": ["image", "resources"],
  "properties": {
    "replicas": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50,
      "default": 3,
      "description": "Replica count; HPA may override"
    },
    "image": {
      "type": "object",
      "required": ["repository", "tag"],
      "properties": {
        "repository": { "type": "string" },
        "tag":        { "type": "string", "minLength": 1, "description": "Pin to immutable digest in prod" },
        "pullPolicy": { "type": "string", "enum": ["Always", "IfNotPresent", "Never"], "default": "IfNotPresent" }
      },
      "additionalProperties": false
    },
    "resources": {
      "type": "object",
      "required": ["limits"],
      "properties": {
        "limits": {
          "type": "object",
          "required": ["memory"],
          "properties": {
            "cpu":    { "type": "string", "pattern": "^[0-9]+m?$" },
            "memory": { "type": "string", "pattern": "^[0-9]+(Mi|Gi)$" }
          }
        },
        "requests": {
          "type": "object",
          "properties": {
            "cpu":    { "type": "string", "pattern": "^[0-9]+m?$" },
            "memory": { "type": "string", "pattern": "^[0-9]+(Mi|Gi)$" }
          }
        }
      }
    },
    "env": {
      "type": "array",
      "default": [],
      "items": {
        "type": "object",
        "required": ["name", "value"],
        "properties": {
          "name":  { "type": "string", "pattern": "^[A-Z_][A-Z0-9_]*$" },
          "value": { "type": "string" }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

`helm install/upgrade` runs schema validation by default since Helm 3.0. Catches typos at install time (better error than mid-render). Enables IDE autocompletion in IDE plugins. Reference: Helm §Schema files.

**rubric:** 10-pt: required fields enforced (3) + integer min/max constraints (1) + pattern validation for resource strings (2) + nested object schema (2) + additionalProperties:false (2).

**watermark_seed:** qorium-devops-v0.6-093-seed-7e3c8a4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-093
**bias_check_notes:** No bias.

---

### QUESTION 94: Cloud Account Hierarchy (Hard)

**question_id:** QOR-DEVOPS-094
**skill_id:** senior-devops-094
**sub_skill_id:** aws-org-account
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AWS Organizations docs

**body:** A growing company should run all infrastructure in:

**options:**
- A) One AWS account
- B) **AWS Organizations with multiple accounts** — separate accounts per environment (prod, staging, dev) and per major business unit. SCPs (Service Control Policies) at OU level enforce guardrails. Account boundary is the strongest isolation primitive AWS offers; IAM is not. Centralized billing via Org. Cross-account access via assumed roles, never long-lived keys
- C) Always one account
- D) One account per service

**answer_key:** B — Multi-account is the canonical AWS pattern. Same applies to GCP folders/projects, Azure management groups. References: AWS Well-Architected: Security pillar.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-094-seed-3a8c4e2b
**variant_seed:** qorium-devops-v0.6-2026-05-07-094
**bias_check_notes:** No bias.

---

### QUESTION 95: K8s Operator Pattern (Hard)

**question_id:** QOR-DEVOPS-095
**skill_id:** senior-devops-095
**sub_skill_id:** k8s-operator
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** K8s docs §Operator pattern; Operator Framework

**body:** Operator pattern — when to write one:

**options:**
- A) For every app
- B) When you have stateful or domain-specific ops (Postgres clustering, Kafka rebalance, ML model serving) requiring continuous reconciliation. CRD defines desired state; controller code reconciles via control loop. For most apps, vanilla Deployment + Helm chart suffices. Operators add operational surface; only justified for genuinely complex life-cycle. Reuse existing operators (Strimzi for Kafka, CloudNativePG for Postgres) instead of writing one
- C) Replace deployments
- D) Required for K8s

**answer_key:** B — Operator pattern is for complex stateful ops; over-applied causes maintenance burden. References: Operator Framework docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-095-seed-9c4a8e3b
**variant_seed:** qorium-devops-v0.6-2026-05-07-095
**bias_check_notes:** No bias.

---

### QUESTION 96: Toil Reduction (Hard)

**question_id:** QOR-DEVOPS-096
**skill_id:** senior-devops-096
**sub_skill_id:** toil-reduction
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Google SRE Book §Eliminating Toil

**body:** Google SRE definition of "toil":

**options:**
- A) Anything boring
- B) **Manual, repetitive, automatable, tactical (no enduring value), interrupt-driven work that scales with system size**. Cap toil at <50% of SRE time; over that → automate it OR reduce its source. Common toil: manual deploys, repetitive incident response, manual capacity adjustments
- C) On-call only
- D) Required work

**answer_key:** B — Precise definition matters. Cap target + active reduction is the SRE discipline. Reference: SRE Book ch. 5.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-096-seed-2d8c4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-096
**bias_check_notes:** No bias.

---

### QUESTION 97: Design — Zero-Trust Internal Network (Hard - Design)

**question_id:** QOR-DEVOPS-097
**skill_id:** senior-devops-097
**sub_skill_id:** zero-trust-design
**format:** design
**difficulty_b:** 1.4
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** NIST SP 800-207 Zero Trust Architecture

**body:** Design zero-trust internal networking for a mid-size SaaS (8 K8s clusters across 3 regions, 100 services, 800 employees). Cover: identity, authentication, authorization, observability, migration. (Limit: 800 words.)

**answer_key:**

**Pillars (NIST SP 800-207):**
- Verify explicitly
- Use least-privilege access
- Assume breach

**Architecture.**

- **Service identity: SPIFFE/SPIRE** (or service mesh equivalent). Each workload gets an SVID (X.509 cert with SPIFFE URI). SPIRE distributes certs; auto-rotates short-lived (~1h).
- **Service-to-service auth: mTLS** via service mesh (Linkerd or Istio) using SPIFFE identities. No service trusts another by IP.
- **Service-to-service authz: policy** (OPA or service-mesh authz) deciding "service-A from namespace-X can call service-B's POST /payment." Versioned policies in git; audit-able.
- **User access to internal services: identity-aware proxy** (Cloudflare Access, Tailscale, or Pomerium). Each request authenticated against SSO + device posture; per-route fine-grained authorization. No VPN.
- **Endpoint posture:** managed devices via MDM; unmanaged devices restricted to public-only resources.
- **CI/CD authentication:** OIDC tokens (GitHub OIDC) → cloud roles. No long-lived keys.
- **DB access:** developers connect via identity-aware proxy + just-in-time elevation (Teleport, StrongDM). All sessions logged + auditable.

**Observability.**

- mTLS connection logs per request (Linkerd Tap, Istio access logs).
- All authz decisions logged (OPA decision log).
- SIEM (Splunk / Datadog Cloud SIEM) consumes mesh logs + cloud audit + IAP access for unified investigation.
- Anomaly detection: services calling endpoints they've never called before; access patterns outside hours.

**Migration (12-month plan).**

**Q1.** Audit current state: every internal trust boundary; every long-lived credential; every IP-based ACL.
**Q2.** Stand up SPIRE + service mesh in one cluster. Migrate 5 pilot services.
**Q3.** Policy-as-code rollout. OPA bundles versioned in git. Migrate IAP for internal admin tools.
**Q4.** Migrate all clusters; deprecate VPN; revoke remaining static keys; final cutover.

**Game-day failure.** "SPIRE root CA expires unexpectedly" — verify alarms fire 30 days before expiry; runbook tested; cluster rotation procedure works without breaking running workloads.

**Trade-offs.**

- mTLS adds CPU overhead (~5-15% typical); modern hardware AES-NI absorbs it.
- Operational complexity is real; incremental adoption is the discipline.
- ROI shows up in: smaller blast radius on breach; simpler auditor conversations; fewer forgotten static credentials.

**rubric:** 18-pt: SPIFFE/SPIRE service identity (3) + mTLS via service mesh (3) + OPA / authz policy (3) + IAP for user access (3) + JIT elevation for DBs (2) + observability via decision logs + SIEM (2) + 12-month migration with pilot then scale (2).

**watermark_seed:** qorium-devops-v0.6-097-seed-7c2a8e4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-097
**bias_check_notes:** No bias.

---

### QUESTION 98: Casestudy — K8s Cluster Upgrade (Very Hard - Casestudy)

**question_id:** QOR-DEVOPS-098
**skill_id:** senior-devops-098
**sub_skill_id:** k8s-upgrade
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** K8s upgrade docs

**body:** A production EKS cluster on K8s 1.26 must reach 1.30 in 3 months (4 minor versions; AWS deprecation). 200 microservices, 50 stateful workloads, 50 Helm-installed third-party charts. Plan it. (Limit: 800 words.)

**answer_key:**

**Strategy: sequential 1-version-at-a-time upgrades; staging-validate each; production cutover with traffic-shadow; total ~12 weeks.**

**Pre-flight.**

- Audit deprecated APIs (every K8s minor removes some). Use `kubectl deprecations` plugin or `pluto` to detect. Update Helm charts to current API versions.
- Audit operators / CRDs for compatibility with target K8s versions (Postgres operator, Strimzi, etc.). Vendor compatibility matrix.
- Audit kubelet / container-runtime / CNI compatibility.

**Per-version upgrade flow (1.26→1.27→1.28→1.29→1.30 over 12 weeks; 2-3 weeks each):**

**Week 1:** upgrade staging cluster. Run smoke + integration suite. Manual probe of risky workloads.
**Week 2:** address compatibility issues; update charts; redeploy staging.
**Week 3:** upgrade prod canary cluster (smaller subset). Watch metrics for a week.
**Week 4:** upgrade prod main cluster. Quiet hours preferred.

**Per-version test list.**

- HPA still scales correctly.
- NetworkPolicy still enforces.
- Volume mounts attach.
- DNS resolution.
- Service mesh sidecar injection.
- Operator reconciliation loops.

**Stateful workloads (50 of them) need extra care.**

- Postgres / Kafka / etc. controlled by operators; verify operator's tested K8s version.
- Drain and reseat one at a time; never simultaneously.

**Rollback strategy.**

- EKS managed control plane: AWS doesn't support downgrade. Plan: spin up a parallel cluster on the OLD version; cut traffic over via DNS / load balancer if rollback needed. Costly but provides escape hatch on critical bug.
- For nodes: rolling replace via Karpenter; old AMI still cacheable for 30 days as fallback.

**Risk: one version may have a critical bug.**

- Wait 2-3 weeks after K8s minor release for community to surface bugs (they always do). Don't be the first.
- Read changelog + scan kubernetes/kubernetes issues for the version.

**Specific K8s-deprecation gotchas in 1.26→1.30 window.**

- 1.27: removed `flowcontrol.apiserver.k8s.io/v1beta1`.
- 1.27: in-place pod resize (alpha).
- 1.28: HorizontalPodAutoscaler `v2beta2` removed (only `v2` remains).
- 1.28: PodSchedulingReadiness GA.
- 1.29: legacy ServiceAccount tokens removed.
- 1.30: PodReadyToStartContainers GA.
- For each: search the cluster's manifests; update before that version's rollout.

**Helm chart updates.**

- 50 charts × maybe 10 with API issues. Bumping a chart often pulls newer features the team hasn't planned for; lock to known-compatible versions.

**Communication.**

- Weekly broadcast: "We are at K8s 1.27 in staging. Your service deployments may surface deprecation warnings; address by date X." Owner per service tagged.

**Game day.**

- Mid-upgrade, simulate "node group fails to upgrade" — verify Karpenter respawns; SLO maintained throughout.

**Outcome.**

- All clusters at 1.30 by the AWS deprecation deadline. Smoothly. Zero customer-facing outage.
- Documented runbook used to upgrade future versions.

**Lessons (universal).**

- K8s upgrades are NOT one-time work; build a quarterly rhythm. Monthly minor upgrade cadence keeps the gap small.
- Don't let clusters drift more than 2 minors behind upstream — the gap between you and the world widens dangerously.
- Helm chart hygiene; pin chart versions in your config repo; renovate-bot opens PRs for upgrades to review.

**rubric:** 25-pt: sequential one-version-at-a-time strategy (3) + pre-flight deprecated-API audit (4) + per-version test checklist (3) + stateful workload extra care (3) + parallel-cluster rollback option (3) + community-bug wait window (2) + specific K8s-version gotchas mentioned (3) + game-day during upgrade (2) + lessons: quarterly rhythm + 2-minor-max drift (2).

**watermark_seed:** qorium-devops-v0.6-098-seed-3a8c4e9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-098
**bias_check_notes:** No bias.

---

### QUESTION 99: Casestudy — Major Cost Overrun on Cloud (Very Hard - Casestudy)

**question_id:** QOR-DEVOPS-099
**skill_id:** senior-devops-099
**sub_skill_id:** cost-overrun
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored; FinOps Foundation playbook

**body:** Q1 cloud bill jumped 80% YoY without revenue growth. CFO wants a 30% reduction in 90 days. As Director of Infra, plan it. (Limit: 800 words.)

**answer_key:**

**First 14 days — diagnose the 80% jump.**

- Pull billing for 6 months by service / by tag. Identify the 3-5 line items contributing most to the increase.
- Common culprits: (a) data egress / cross-region traffic; (b) idle / orphaned resources (unattached EBS, old snapshots, idle ELBs); (c) over-provisioned instances (RDS / EC2 not right-sized); (d) data warehouse compute burst; (e) untagged resources growing unchecked; (f) commitment expiry (savings plan / RI lapsed).
- Likely 70-80% of increase is in 1-3 categories.

**Days 14-30 — triage wins.**

1. **Orphan cleanup.** Unattached EBS, old snapshots, untagged dev resources, idle ELBs, stale Elastic IPs. Often 5-15% reduction with zero risk. Tools: AWS Trusted Advisor, Cloud Custodian.
2. **Right-sizing.** Datadog / CloudWatch CPU/memory metrics for 30 days; instances at <30% are candidates. Bulk-resize via Terraform; canary 10% first.
3. **Storage tier optimization.** S3 → S3-IA → Glacier lifecycle for old data. Often 30-60% storage savings.
4. **Spot / Savings Plans / Reserved Instances.** Compute Savings Plans for steady workloads (1-year, no upfront): 30-50% savings vs on-demand. Spot for batch / non-tier-0: 50-90% savings.
5. **Data transfer.** Identify cross-AZ / cross-region traffic; consolidate. Often a misconfigured app calls services across AZs unnecessarily.

**Days 30-60 — structural improvements.**

6. **Per-team tagging + showback.** Cost Allocation Tags fully populated; weekly showback to teams. Ownership creates self-policing.
7. **Auto-suspend non-prod.** Dev / staging environments stop on weekends + after-hours. 50-70% reduction on those envs.
8. **Reserved Capacity for steady RDS.** Convert to RIs; ~40% savings.
9. **Data warehouse:** auto-suspend Snowflake warehouses; right-size. Typically 30-50% on warehouse line item.
10. **K8s rightsizing:** VPA-recommendations; OpenCost per-namespace; engineers see and shrink their requests.

**Days 60-90 — culture and ongoing.**

11. **FinOps team / ritual.** Weekly cost review; monthly per-team scorecard; quarterly variance review with finance.
12. **Pre-commit cost guards.** Terraform PRs with `infracost` showing $ delta; large increases need approval.
13. **Architecture reviews include cost.** Designs gated on $/month estimate.
14. **Retention policies.** Logs, metrics, backups all have explicit retention based on regulatory + business need; not "forever."
15. **Renegotiate enterprise discount.** With proven track record, negotiate or move to enterprise discount program.

**Outcome target.**

- 30% cost reduction in 90 days achievable in most teams that haven't done active FinOps in 12+ months. Often 35-45% achievable.
- Savings recurring; ongoing 5-10%/year decline as the discipline matures.

**Risks.**

- **Right-sizing too aggressively** → performance regressions. Mitigation: canary first; measure latency/error rate; revert if regressed.
- **Cleanup deletes something needed.** Mitigation: 14-day quarantine before deletion; tag-based opt-out for known-needed-but-untagged.
- **Team morale** if cost shaming. Mitigation: showback (information only, first), then chargeback (after process is mature). Frame as platform helping teams, not punishing.

**Communication.**

- Weekly to CFO: "Achieved $X savings; on track for $Y by 90d."
- Monthly to engineering: per-team scoreboard; recognition for biggest improvements.
- Build it as engineering pride: "we cut cloud costs 30% while shipping more" — narrative wins.

**Lessons.**

- Cost growth without revenue growth = process gap, not infrastructure problem.
- The discipline (tagging, showback, monthly review, PR gates) is the structural win, not any one optimization.
- Most teams find 25-40% latent savings on first sweep. Subsequent sweeps yield 5-10%; diminishing returns.

**rubric:** 25-pt: diagnose-first not-cut-first (3) + orphan cleanup zero-risk wins (3) + right-sizing with canary (3) + Savings Plans / Spot (3) + auto-suspend non-prod (2) + showback + per-team scoreboard (3) + infracost PR gate (2) + retention policy review (2) + renegotiation lever (1) + risks: aggressive cuts and team morale (3).

**watermark_seed:** qorium-devops-v0.6-099-seed-2c8a4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-099
**bias_check_notes:** No bias.

---

### QUESTION 100: Casestudy — Architecting Platform Engineering Team (Very Hard - Casestudy)

**question_id:** QOR-DEVOPS-100
**skill_id:** senior-devops-100
**sub_skill_id:** platform-engineering-team
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 35
**citation:** "Team Topologies"; CNCF Platforms WG

**body:** A 600-engineer org has a small DevOps team (8 people) overwhelmed: deploy queue 1-2 weeks, every team builds their own CI, security tooling fragmented. CTO asks: "build a platform team." Plan org structure, charter, deliverables, success metrics. (Limit: 1000 words.)

**answer_key:**

**Charter (clear from day-1):**

> The Platform Team builds and operates a self-service Internal Developer Platform (IDP) so application teams can ship safely, quickly, and securely without becoming infrastructure experts.

It is a **product** team, not a service team. Its customers are internal engineers; product mindset (research, roadmap, NPS) applies.

**Why this works (Team Topologies).**

The "DevOps team is bottleneck" pattern is universal. The fix is NOT bigger DevOps team (that scales linearly). It's a Platform team building leverage tools that scale O(N²) for N application teams.

**Org structure (within 90 days).**

- **Lead:** Senior leader (Director / Sr Manager) who has built platforms before. Reports to CTO or VP Eng.
- **Pods (~25 engineers total over 6 months; start with 12-15):**
  - **CI/CD pod (3-4):** GitHub Actions templates, Argo CD, deploy infrastructure.
  - **Cloud / K8s pod (3-4):** EKS clusters, Terraform modules, networking, CRDs.
  - **Observability pod (2-3):** OpenTelemetry, Grafana stack, SLO tooling.
  - **Security pod (2-3):** secrets, image signing, OPA policies, SBOM.
  - **Developer Experience pod (2-3):** internal CLI, docs portal, onboarding.
- Embed: each app team has a "platform liaison" — not full-time, just a designated person who knows the platform team and represents app needs.

**Deliverables (90-day → 1-year).**

**Q1 (foundation).**

- Self-serve "create new service" CLI/portal: scaffolds repo, CI workflow, K8s manifests, IAM perms, monitoring. Goal: <1 day to "hello world in production."
- Centralized GitHub Actions reusable workflows for build / scan / deploy.
- Argo CD running for 3 pilot teams.

**Q2 (adoption).**

- 30+ teams onboarded to platform CI/CD.
- Centralized observability (OpenTelemetry collector, Grafana dashboards).
- Self-serve ephemeral envs per PR.
- Documentation portal (Backstage or Internal Docs).

**Q3 (maturity).**

- All 60+ teams on platform.
- Self-serve secrets via External Secrets Operator + Vault.
- OPA policies for image signing, runAsNonRoot, SBOM presence.
- Per-team cost showback dashboards.

**Q4 (advanced).**

- Self-serve Postgres / Redis via Crossplane or operators.
- Service catalog (Backstage) with ownership, dependencies, SLOs.
- Engineer-facing SLO + error budget dashboards.
- Cost attribution per team.

**Success metrics (track from day 1).**

- **Lead time:** "PR merge → prod" median. Target: <1 hour by Q4.
- **Deploy frequency:** deploys/day per team. Target: 5+/week per team.
- **Self-serve rate:** % of new services / changes that don't need platform-team manual help. Target: 95% by Q4.
- **Platform NPS:** quarterly survey. Target: >40.
- **Incidents-from-platform:** misconfigurations from app teams. Should DROP as platform takes over guardrails.
- **Time to onboard new engineer:** Target: <1 week to first deploy.

**What NOT to do.**

- Don't make Platform a gating function ("you must use it"). Make it the obvious easy path; if a team chooses not to, that's a signal the platform isn't ready or doesn't fit.
- Don't build a clone of someone else's platform without research. Survey app teams: what hurts? Build for them.
- Don't ship a portal/CLI as an MVP without user testing. Engineers will route around clunky tooling.

**Communication / culture.**

- Quarterly Platform Show & Tell open to all engineering.
- Office hours weekly for app-team questions.
- Public roadmap (Notion, Linear) so app teams know what's coming.
- Shared credit when an app team ships fast: "thanks to the platform team's deploy infrastructure."

**Migration from current state.**

- Pick 3 friendly pilot app teams. Onboard them. Iterate based on feedback. THEN scale.
- Don't try to onboard 60 teams simultaneously; you'll fragment and disappoint.

**Risks.**

- **Politics.** Existing DevOps team feels demoted. Mitigation: rebrand and integrate them as the core of the new Platform team.
- **Scope creep.** Every team wants their pet need. Stay disciplined: roadmap is for the 80% case; long tail uses general-purpose primitives.
- **App teams resist:** "we know better than the platform." Mitigation: don't enforce; make platform the path of least resistance. They'll adopt voluntarily once it's better than DIY.
- **Budget cuts.** Platform investment shows benefit slowly. Mitigation: instrument metrics from day 1; show measurable ROI quarterly.

**Lessons (companies that did this).**

- Spotify, Shopify, Stripe, Atlassian, AirBnB — all have large platform teams. The pattern works at scale.
- 5-10% of engineering should be on platform at maturity (30-60 of 600 engineers).
- ROI is multiplicative: platform team enables app teams 2-3x faster shipping.

**Long-term.**

- The platform itself becomes a strategic asset. Talent attracted to working on it. Acquisition target value increases (a strong platform = lower onboarding cost for buyers).

**rubric:** 30-pt: charter as product team for internal customers (3) + Team-Topologies framing (3) + concrete pod structure (3) + 4-quarter deliverables (5) + measurable success metrics (4) + what-NOT-to-do (gating, clone, MVP without research) (3) + pilot-then-scale onboarding (3) + risks: politics, scope creep, app resistance, budget (4) + lessons from peer companies (2).

**watermark_seed:** qorium-devops-v0.6-100-seed-3a8c4e2b
**variant_seed:** qorium-devops-v0.6-2026-05-07-100
**bias_check_notes:** No bias.

---

## End DevOps/SRE 081-100. Cumulative: DevOps/SRE 100/100 ✅. 5 of 8 Wave-1 sub-skills closed.

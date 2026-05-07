# Wave 1 Extension: Senior DevOps/SRE (QOR-DEVOPS-061..080)

**STATUS:** AI-drafted v0.6 EXTENSION. SME Lead validation pending.

## 20 NEW Questions (QOR-DEVOPS-061..080)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 61: Blue/Green vs Canary (Easy)

**question_id:** QOR-DEVOPS-061
**skill_id:** senior-devops-061
**sub_skill_id:** blue-green-canary
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Argo Rollouts docs

**body:** Difference between blue/green and canary:

**options:**
- A) Identical
- B) **Blue/Green:** stand up full new version (green) alongside old (blue); flip 100% traffic at once. Easy rollback (flip back). High infra cost (2x). **Canary:** new version receives small % traffic, gradually ramps. Lower cost, finer-grained risk control. Modern stacks (Argo Rollouts) automate canary with metric-based promotion
- C) Blue/green is deprecated
- D) Canary is for testing

**answer_key:** B — Both have place; canary is now the modern default for non-stateful services. Reference: Argo Rollouts.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-061-seed-2c8a4e9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-061
**bias_check_notes:** No bias.

---

### QUESTION 62: Container Logs Drivers (Easy)

**question_id:** QOR-DEVOPS-062
**skill_id:** senior-devops-062
**sub_skill_id:** container-logs
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Docker docs §Logging Drivers

**body:** Best logging pattern for K8s containers:

**options:**
- A) Apps write to file
- B) **Apps log to STDOUT/STDERR** as JSON (or structured); kubelet captures + writes to node disk; a node-level collector (Fluent Bit, Vector) ships to backend (Loki, ELK, Datadog). 12-factor compliant; container can be stateless
- C) Each pod runs its own logger
- D) syslog only

**answer_key:** B — STDOUT-based logs + sidecar collector is the cloud-native standard. References: 12-factor; Fluent Bit docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-062-seed-8e3c5a4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-062
**bias_check_notes:** No bias.

---

### QUESTION 63: Immutable Infrastructure (Easy)

**question_id:** QOR-DEVOPS-063
**skill_id:** senior-devops-063
**sub_skill_id:** immutable-infra
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** "Phoenix Project"; HashiCorp Packer docs

**body:** Immutable infrastructure benefits:

**options:**
- A) Cheaper
- B) Servers/containers never modified post-deploy. Replace, don't update. No "snowflake" config drift; reproducible from declarative source; rollback = redeploy old image. Foundation of containers + GitOps. Trade-off: every change = full re-provision, higher operational rigor required
- C) Always immutable
- D) Slower deploys

**answer_key:** B — The "Phoenix server" pattern (kill and respawn) eliminates configuration drift class of bugs. References: "Phoenix Project."

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-063-seed-3a9c4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-063
**bias_check_notes:** No bias.

---

### QUESTION 64: K8s StatefulSet vs Deployment (Medium)

**question_id:** QOR-DEVOPS-064
**skill_id:** senior-devops-064
**sub_skill_id:** statefulset-vs-deployment
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** K8s Documentation

**body:** Use StatefulSet when:

**options:**
- A) Always
- B) Stable network identity per pod (`pod-0, pod-1`); persistent volumes per pod (each pod gets its own PVC); ordered start/stop (pod-N waits for pod-N-1). Use for stateful workloads (databases, Kafka, ZooKeeper). Stateless apps use Deployment
- C) Only for stateless
- D) Identical to Deployment

**answer_key:** B — StatefulSet is for stateful workloads needing stable identity + per-pod storage. Operators (Postgres operator, Strimzi for Kafka) use them. Reference: K8s docs §StatefulSet.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-064-seed-7c4a8e3b
**variant_seed:** qorium-devops-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

### QUESTION 65: Linux Cgroups for Resource Isolation (Medium)

**question_id:** QOR-DEVOPS-065
**skill_id:** senior-devops-065
**sub_skill_id:** cgroups-v2
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Linux kernel docs §cgroup-v2

**body:** Cgroups v2 vs v1:

**options:**
- A) Identical
- B) v2 is the modern unified hierarchy (single tree across resource controllers); v1 had separate hierarchies per controller. v2 is default in modern distros (Ubuntu 22.04+, RHEL 9, etc.); kubelet supports v2 since 1.25. PSI (Pressure Stall Information) is v2-only — best signal for "is this container starved for CPU/memory/IO"
- C) v1 is faster
- D) Both deprecated

**answer_key:** B — Cgroups v2 is the foundation of modern container resource isolation. PSI provides earlier-signal saturation metrics than CPU% / memory%. Reference: kernel.org cgroup-v2 docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-065-seed-9b3a8c2e
**variant_seed:** qorium-devops-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

### QUESTION 66: Event-Driven CI Triggers (Medium)

**question_id:** QOR-DEVOPS-066
**skill_id:** senior-devops-066
**sub_skill_id:** event-driven-ci
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** GitHub Actions docs

**body:** Best CI trigger strategy for monorepo with 30 services:

**options:**
- A) Run all CI on every commit
- B) **Path-filtered triggers** (`paths: services/web/**`) so only affected pipelines run. Or use change detection tooling (Nx affected, Turborepo affected, Bazel) for transitive dep awareness — changing a shared lib triggers downstream service CI. Combined with smart caching (action/cache, Nx Cloud, Turborepo Remote Cache) reduces avg PR time 5-10x
- C) Disable CI for monorepos
- D) Manual trigger only

**answer_key:** B — Path/affected filters + cache are the leverage points. Reference: GitHub Actions docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-066-seed-2d8e5c4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-066
**bias_check_notes:** No bias.

---

### QUESTION 67: Argo Rollouts Analysis Templates (Medium)

**question_id:** QOR-DEVOPS-067
**skill_id:** senior-devops-067
**sub_skill_id:** argo-analysis
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Argo Rollouts Documentation

**body:** Automated canary promotion based on metrics:

**options:**
- A) Manual approval at each step
- B) **AnalysisTemplate** queries Prometheus during canary; if error rate < threshold, auto-promote; if exceeds, auto-rollback. Multiple metrics (latency, error rate, custom). Background analysis runs continuously; pre-promotion checks run before each weight change
- C) Coin flip
- D) Always wait 24h

**answer_key:** B — AnalysisTemplate is the canonical deploy gate. References: Argo Rollouts docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-067-seed-4f8b2c9a
**variant_seed:** qorium-devops-v0.6-2026-05-07-067
**bias_check_notes:** No bias.

---

### QUESTION 68: K8s Cluster Autoscaler vs Karpenter (Medium)

**question_id:** QOR-DEVOPS-068
**skill_id:** senior-devops-068
**sub_skill_id:** karpenter
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Karpenter docs

**body:** Why Karpenter over Cluster Autoscaler on AWS?

**options:**
- A) Karpenter is older
- B) **Karpenter** observes pending pods and provisions OPTIMAL EC2 instance type per pod requirements directly (no node groups required). Cluster Autoscaler scales pre-defined ASG/MIG node groups. Karpenter delivers faster provisioning (1-2 min vs 5+ min), better bin packing, native spot, simpler config. Authored by AWS, now broader (Karpenter project)
- C) Karpenter is more expensive
- D) Identical

**answer_key:** B — Karpenter is now the AWS-recommended autoscaler. References: Karpenter docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-068-seed-7c3a8e4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

### QUESTION 69: Cloud-Native Secrets Rotation (Medium)

**question_id:** QOR-DEVOPS-069
**skill_id:** senior-devops-069
**sub_skill_id:** secrets-rotation
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AWS Secrets Manager docs

**body:** A DB password should rotate every 30 days, no app downtime. Pattern:

**options:**
- A) Cron + manual updates
- B) AWS Secrets Manager rotation (or Vault dynamic secrets): generates new password; updates DB user; updates secret version. Apps fetch latest version on startup AND have a refresh path (External Secrets Operator polls every N minutes). Two-version overlap window allows in-flight connections to drain. Zero downtime
- C) Restart all pods on each rotation
- D) Don't rotate

**answer_key:** B — Two-version overlap is the canonical pattern. Reference: AWS Secrets Manager rotation; Vault dynamic secrets.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-069-seed-3a8c5e2b
**variant_seed:** qorium-devops-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

### QUESTION 70: Cilium eBPF (Medium)

**question_id:** QOR-DEVOPS-070
**skill_id:** senior-devops-070
**sub_skill_id:** cilium-ebpf
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Cilium docs

**body:** Cilium's edge over older CNIs (Flannel, Calico-iptables) is:

**options:**
- A) Older code base
- B) **eBPF-based data plane** — kernel-level packet filtering/routing without iptables; orders of magnitude lower per-packet overhead at scale. L3-L7 NetworkPolicies (HTTP-aware), service mesh capabilities (Cilium Service Mesh), observability (Hubble flow logs). The modern CNI default for serious K8s
- C) Cilium is slower
- D) Doesn't support BGP

**answer_key:** B — eBPF + Cilium is the modern K8s networking baseline. References: Cilium docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-070-seed-9b4c2a8e
**variant_seed:** qorium-devops-v0.6-2026-05-07-070
**bias_check_notes:** No bias.

---

### QUESTION 71: GitOps Drift Detection (Medium)

**question_id:** QOR-DEVOPS-071
**skill_id:** senior-devops-071
**sub_skill_id:** gitops-drift
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Argo CD / Flux docs

**body:** Argo CD shows "OutOfSync" — cluster differs from Git. Best response:

**options:**
- A) Ignore
- B) **Investigate root cause first.** Drift sources: human kubectl edits (block via RBAC), controllers writing back to managed resources (use `ignoreDifferences`), CRD with `last-applied` annotation diff (normalize). Once understood, decide: auto-sync re-applies Git, OR manually accept drift back into Git via `kubectl get -o yaml | git`
- C) Disable Argo CD
- D) Force sync immediately

**answer_key:** B — Drift signals process or config issues; investigate before reflexive sync. Reference: Argo CD docs §Sync.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-071-seed-2c8a4e9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

### QUESTION 72: Code — Prometheus Alerting Rules (Hard - Code)

**question_id:** QOR-DEVOPS-072
**skill_id:** senior-devops-072
**sub_skill_id:** alerting-rules
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Prometheus + Grafana docs

**body:** Write Prometheus alerting rules for: (1) p99 latency > 1s for 10 minutes; (2) error rate > 1% over 5m AND over 1h (multi-burn-rate); (3) pod CPU throttling > 50% for 15 minutes. Include `for`, severity, runbook link.

**options:** []

**answer_key:**

```yaml
groups:
- name: api-slo
  interval: 30s
  rules:

  # 1. p99 latency
  - alert: HighP99Latency
    expr: histogram_quantile(0.99, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m]))) > 1
    for: 10m
    labels: { severity: warning, team: platform }
    annotations:
      summary: "p99 latency > 1s on {{ $labels.route }}"
      description: "Current p99: {{ $value | humanizeDuration }}"
      runbook_url: https://runbooks.example.com/high-latency

  # 2. Multi-burn-rate error budget alert (Google SRE pattern)
  # Fast burn: 14.4x rate over 1h => exhausts 30-day budget in 2 days
  # Slow burn: 6x rate over 6h => exhausts 30-day budget in 5 days
  - alert: ErrorBudgetBurnFast
    expr: |
      (
        sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > (14.4 * 0.001)
      )
      and
      (
        sum(rate(http_requests_total{status=~"5.."}[1h])) / sum(rate(http_requests_total[1h])) > (14.4 * 0.001)
      )
    for: 2m
    labels: { severity: critical, team: platform, slo: api }
    annotations:
      summary: "Error budget burn fast (>14.4x SLO of 99.9%)"
      runbook_url: https://runbooks.example.com/error-budget

  - alert: ErrorBudgetBurnSlow
    expr: |
      (
        sum(rate(http_requests_total{status=~"5.."}[30m])) / sum(rate(http_requests_total[30m])) > (6 * 0.001)
      )
      and
      (
        sum(rate(http_requests_total{status=~"5.."}[6h])) / sum(rate(http_requests_total[6h])) > (6 * 0.001)
      )
    for: 15m
    labels: { severity: warning, team: platform, slo: api }
    annotations:
      summary: "Error budget burn slow (>6x SLO of 99.9%)"
      runbook_url: https://runbooks.example.com/error-budget

  # 3. CPU throttling per pod
  - alert: PodCPUThrottling
    expr: rate(container_cpu_cfs_throttled_seconds_total[5m]) / rate(container_cpu_cfs_periods_total[5m]) > 0.5
    for: 15m
    labels: { severity: warning, team: platform }
    annotations:
      summary: "Pod {{ $labels.pod }} CPU throttled > 50%"
      description: "Consider raising CPU limit or removing it; current throttle ratio: {{ $value | humanizePercentage }}"
      runbook_url: https://runbooks.example.com/cpu-throttling
```

Key points:
- Multi-burn-rate alerting (Google SRE Workbook ch. 5): combines fast + slow signals to alert on real budget burn without flapping.
- `for` clause prevents flapping on single-spike anomalies.
- Runbook URLs make on-call faster.
- CFS throttling ratio is a leading indicator vs CPU usage.

References: Prometheus alerting docs; Google SRE Workbook ch. 5.

**rubric:** 12-pt: histogram_quantile p99 (3) + multi-burn-rate combined fast+slow (4) + CFS throttling ratio (2) + for/severity/runbook (3).

**watermark_seed:** qorium-devops-v0.6-072-seed-9c4a8e3b
**variant_seed:** qorium-devops-v0.6-2026-05-07-072
**bias_check_notes:** No bias.

---

### QUESTION 73: Code — Bash retry helper (Hard - Code)

**question_id:** QOR-DEVOPS-073
**skill_id:** senior-devops-073
**sub_skill_id:** bash-retry
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** Bash + AWS CLI patterns

**body:** Write a portable bash retry helper `retry <max_attempts> <command>` with exponential backoff + jitter, exit codes preserved.

**options:** []

**answer_key:**

```bash
#!/usr/bin/env bash
set -euo pipefail

# retry max_attempts -- command [args...]
retry() {
  local -r max_attempts="$1"; shift
  local attempt=1
  local exit_code=0
  local sleep_seconds

  while (( attempt <= max_attempts )); do
    if "$@"; then
      return 0
    fi
    exit_code=$?

    if (( attempt == max_attempts )); then
      printf 'retry: command failed after %d attempts (last exit %d): %s\n' \
        "$max_attempts" "$exit_code" "$*" >&2
      return "$exit_code"
    fi

    # exponential backoff with full jitter, capped at 30s
    local backoff=$(( 1 << (attempt - 1) ))     # 1, 2, 4, 8, 16
    (( backoff > 30 )) && backoff=30
    sleep_seconds=$(awk -v b="$backoff" 'BEGIN{srand(); print rand()*b}')
    printf 'retry: attempt %d/%d failed (exit %d), sleeping %ss\n' \
      "$attempt" "$max_attempts" "$exit_code" "$sleep_seconds" >&2
    sleep "$sleep_seconds"
    (( attempt++ ))
  done
}

# Usage
retry 5 -- aws s3 cp s3://bucket/key /tmp/key
retry 5 -- curl -fsS https://api.example.com/health
```

Key points: full jitter (random in [0, backoff)) prevents thundering herd; preserves exit code for the caller; `set -euo pipefail` propagates errors otherwise; `--` separator for command portability; messages on stderr to keep stdout clean. References: AWS Architecture blog "Exponential Backoff and Jitter."

**rubric:** 10-pt: full-jitter (no fixed-time backoff) (3) + exit code preserved (2) + cap at sane max (1) + final-attempt error message (1) + log to stderr (1) + `set -euo pipefail` (1) + portable awk for jitter math (1).

**watermark_seed:** qorium-devops-v0.6-073-seed-3a8c4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-073
**bias_check_notes:** No bias.

---

### QUESTION 74: SSH Bastion / Identity-Aware Proxy (Hard)

**question_id:** QOR-DEVOPS-074
**skill_id:** senior-devops-074
**sub_skill_id:** ssh-bastion-iap
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AWS SSM, GCP IAP

**body:** Modern alternative to traditional SSH bastion:

**options:**
- A) Long-lived SSH keys
- B) **Identity-aware proxy** (AWS SSM Session Manager, GCP IAP, Cloudflare Access). No public ingress to instance; auth via cloud IAM (SSO + MFA + SAML); audit logs per session; ephemeral access via session start (no SSH key pinning). Eliminates SSH key sprawl + stolen-key attack surface
- C) VPN only
- D) Public SSH

**answer_key:** B — Identity-aware proxies are the modern bastion replacement. References: AWS SSM, GCP IAP.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-074-seed-5c2a8e4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-074
**bias_check_notes:** No bias.

---

### QUESTION 75: Build Cache Strategy (Hard)

**question_id:** QOR-DEVOPS-075
**skill_id:** senior-devops-075
**sub_skill_id:** build-cache
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Bazel, Nx, Turborepo docs

**body:** Monorepo CI build matrix takes 45 min with no cache. With caching:

**options:**
- A) Add disk cache only
- B) **Remote build cache** (Bazel remote cache, Nx Cloud, Turborepo Remote Cache) — content-addressed; cache shared across CI workers and developer laptops; only changed targets rebuild. Plus per-runner local cache for hot path. Typical wins: 10-20x faster CI on incremental changes; engineer 30-min builds → 30 sec
- C) Disable cache for safety
- D) Manual rebuild

**answer_key:** B — Content-addressed remote cache is the leverage. Cache invalidation by inputs is the discipline that makes it correct. References: Bazel/Nx/Turborepo docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-075-seed-9b4a8e2c
**variant_seed:** qorium-devops-v0.6-2026-05-07-075
**bias_check_notes:** No bias.

---

### QUESTION 76: Cost Observability — FinOps (Hard)

**question_id:** QOR-DEVOPS-076
**skill_id:** senior-devops-076
**sub_skill_id:** finops
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** FinOps Foundation; OpenCost

**body:** Cloud bill is up 40% YoY; finance is unhappy. Best first step:

**options:**
- A) Mass shutdown
- B) **Cost-allocation tagging discipline + per-team showback dashboards** (cost-allocation tags, AWS Cost Explorer, OpenCost for K8s). Surfaces top offenders + ownership; teams self-optimize once they see their number. Then targeted: right-sizing, savings plans / reservations, spot, cleanup of orphaned resources
- C) Switch to on-prem
- D) Negotiate

**answer_key:** B — Visibility-first is the canonical FinOps move. OpenCost for K8s gives per-namespace/workload cost. References: FinOps Foundation playbook.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-076-seed-2c4a8e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-076
**bias_check_notes:** No bias.

---

### QUESTION 77: Design — Production K8s Cluster (Hard - Design)

**question_id:** QOR-DEVOPS-077
**skill_id:** senior-devops-077
**sub_skill_id:** prod-k8s-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Design a production K8s cluster on AWS EKS for a SaaS at 50K req/sec, 99.95% SLO. Cover: control plane sizing, node groups, networking, observability, security, DR. (Limit: 800 words.)

**answer_key:**

**Control plane: managed EKS (HA across 3 AZs).** Don't self-manage; the operational cost is rarely justified.

**Node groups.**
- **Default (system):** ~5 m6i.large, taints/tolerations for system pods (CNI, CSI, kube-proxy, metrics-server, fluent-bit). Karpenter manages spot+on-demand mix.
- **General:** Karpenter-provisioned per-pod-shape. Mix of m6i / c6i. Spot for non-critical, on-demand for stateful + tier-0 services.
- **GPU (optional):** g5 instances for ML workloads. Tainted; pods opt-in via toleration.
- All nodes: gp3 root volumes, 100 GB; container runtime containerd.

**Networking.**
- **CNI: Cilium** (eBPF; replaces iptables). Default-deny NetworkPolicy per namespace.
- **Ingress: AWS Load Balancer Controller** with ALB / NLB per ingress class.
- **Service mesh: optional Linkerd** if mTLS+observability needed across services. Not required day-1.

**Observability.**
- **Metrics:** Prometheus (Operator-deployed) + remote-write to Grafana Cloud or Mimir for retention. PromQL alerting via Alertmanager → PagerDuty.
- **Logs:** Fluent Bit DaemonSet → Loki / CloudWatch Logs.
- **Traces:** OpenTelemetry Collector → Tempo / Jaeger.
- **Per-team dashboards** in Grafana with templated variables for namespace/service.

**Security.**
- **Image admission:** OPA Gatekeeper or Kyverno with policies — distroless base, non-root, no `:latest`, signed by cosign.
- **Pod Security Standards: restricted** as default for application namespaces.
- **Secrets:** External Secrets Operator + Vault.
- **IAM:** IRSA (IAM Roles for Service Accounts) — pods get scoped AWS perms, no node-level credentials.
- **Audit logs:** EKS audit logs to CloudWatch with retention.

**Backup / DR.**
- **Velero** for cluster-resource backups (Helm releases, manifests, PVCs).
- **Stateful workload-specific backups** (RDS snapshots, etcd if self-managed).
- **DR drill quarterly:** spin up secondary EKS in another region from Velero backup; verify recovery.

**Capacity.**
- HPA (Horizontal Pod Autoscaler) per workload.
- Cluster Autoscaler / Karpenter for node count.
- Vertical recommendations via VPA-recommendation-only (don't auto-apply on production; review weekly).

**SLOs.**
- Per-service SLO defined; multi-burn-rate alerting; error budget dashboards.
- Master-meter SLO at platform tier (cluster availability) at 99.99% — gives 50% margin to per-app 99.95%.

**Game day.** Quarterly: kill a node group; verify Karpenter respawns within 5 min; verify SLO maintained throughout; chaos test next.

**Cost optimization.**
- Karpenter spot for batch / non-tier-0 (50-70% spot mix typical).
- Savings plans for steady on-demand baseline.
- OpenCost for per-team showback.
- Avoid long-running idle: auto-suspend dev environments after-hours (ops-environment / kube-downscaler).

**Anti-patterns avoided.**
- ONE giant cluster across all environments → blast radius too large. Run separate clusters for prod / staging / dev.
- Long-lived nodes (months) → reduces patch cadence. Karpenter rolls nodes naturally.
- Manual `kubectl apply` in prod → audit via GitOps only.

**rubric:** 18-pt: managed EKS choice (2) + node-group strategy with Karpenter + spot (3) + Cilium + NetworkPolicy + service mesh (3) + observability stack (3) + security: image admission, PSS, IRSA, ESO (3) + DR via Velero (2) + SLOs + game days (2).

**watermark_seed:** qorium-devops-v0.6-077-seed-4d8e2c9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-077
**bias_check_notes:** No bias.

---

### QUESTION 78: Code — GitHub Actions Reusable Workflow (Hard - Code)

**question_id:** QOR-DEVOPS-078
**skill_id:** senior-devops-078
**sub_skill_id:** github-actions-reusable
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** GitHub Actions reusable workflows docs

**body:** Write a reusable GitHub Actions workflow (`.github/workflows/build-and-publish.yml`) that another workflow can call to: build a Docker image, scan with Trivy, sign with cosign, push to GHCR, and update a config repo PR.

**options:** []

**answer_key:**

```yaml
# .github/workflows/build-and-publish.yml (in shared "actions" repo or this repo's .github/workflows)
name: build-and-publish
on:
  workflow_call:
    inputs:
      image_name:    { required: true, type: string }
      dockerfile:    { required: false, type: string, default: ./Dockerfile }
      context:       { required: false, type: string, default: . }
      config_repo:   { required: true, type: string }    # owner/repo-config
      config_path:   { required: true, type: string }    # path/to/values.yaml
    secrets:
      cosign_password: { required: true }
      config_repo_token: { required: true }

permissions:
  contents: read
  packages: write
  id-token: write   # for OIDC keyless cosign

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      sha:    ${{ steps.tag.outputs.sha }}
      digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      - id: tag
        run: echo "sha=$(git rev-parse --short HEAD)" >> "$GITHUB_OUTPUT"

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: build
        uses: docker/build-push-action@v5
        with:
          context: ${{ inputs.context }}
          file: ${{ inputs.dockerfile }}
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/${{ inputs.image_name }}:${{ steps.tag.outputs.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/${{ github.repository_owner }}/${{ inputs.image_name }}@${{ steps.build.outputs.digest }}
          format: sarif
          output: trivy-results.sarif
          severity: CRITICAL,HIGH
          exit-code: '1'   # fail on high/critical

      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with: { sarif_file: trivy-results.sarif }

      - uses: sigstore/cosign-installer@v3
      - run: cosign sign --yes ghcr.io/${{ github.repository_owner }}/${{ inputs.image_name }}@${{ steps.build.outputs.digest }}
        env:
          COSIGN_PASSWORD: ${{ secrets.cosign_password }}

  update-config:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: ${{ inputs.config_repo }}
          token: ${{ secrets.config_repo_token }}
          path: config

      - name: Bump image SHA in values
        run: |
          cd config
          yq -i '.image.tag = "${{ needs.build.outputs.sha }}"' "${{ inputs.config_path }}"

      - uses: peter-evans/create-pull-request@v6
        with:
          path: config
          token: ${{ secrets.config_repo_token }}
          commit-message: "chore: bump ${{ inputs.image_name }} to ${{ needs.build.outputs.sha }}"
          branch: bot/bump-${{ inputs.image_name }}-${{ needs.build.outputs.sha }}
          title: "Bump ${{ inputs.image_name }} to ${{ needs.build.outputs.sha }}"
```

Key points: `workflow_call` makes it reusable; OIDC keyless cosign avoids long-lived signing keys; Trivy fails on HIGH severity; PR-based config update keeps GitOps audit. Reference: GitHub Actions reusable workflows docs.

**rubric:** 12-pt: workflow_call schema (3) + image build/push (1) + Trivy scan + SARIF (2) + cosign sign (2) + needs-chain to update config repo (3) + create-pull-request action (1).

**watermark_seed:** qorium-devops-v0.6-078-seed-7c4a8e3b
**variant_seed:** qorium-devops-v0.6-2026-05-07-078
**bias_check_notes:** No bias.

---

### QUESTION 79: Casestudy — Container Image Sprawl (Very Hard - Casestudy)

**question_id:** QOR-DEVOPS-079
**skill_id:** senior-devops-079
**sub_skill_id:** image-sprawl-casestudy
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** A 5-yr-old company has 120 microservices, 50+ Dockerfile patterns; image sizes range 80MB-2GB; CVE scanner shows 3000+ HIGH+CRITICAL vulns; image registry costs $8K/mo. Plan a remediation. (Limit: 800 words.)

**answer_key:**

**Strategy: Centralize via golden images + automated remediation; budget 2 quarters.**

**Phase 0 (Week 1-2): assessment.**

- Inventory: list all images, sizes, base image, last-updated, owner team.
- CVE distribution: cluster CVEs by source (base image, language stdlib, app deps).
- Cost breakdown: storage (~5%) + transfer (~95%) — typical. Reducing image size cuts both.
- 80/20: usually a few base images and a few "fat" outliers cause most pain.

**Phase 1 (Week 3-6): build the golden-image program.**

- Define ~5-10 sanctioned base images (per language stack):
  - `acme/python-base:3.13-distroless` (built from Chainguard / distroless)
  - `acme/node-base:20-distroless`
  - `acme/jvm-base:21-distroless`
  - etc.
- These are built+scanned+signed in a central CI pipeline; rebuilt nightly to absorb upstream patches.
- Document the pattern (`Dockerfile.template`) — multi-stage, distroless final, non-root, healthcheck.

**Phase 2 (Week 7-14): codemod + adoption.**

- Automated PR-bot that opens PRs converting service Dockerfiles to use golden bases. ~80% mechanical.
- For each service team: a 30-min onboarding session; review before merge; expect resistance, plan for it.
- Track in a portal: % services on golden base; % CVE reduction; % image size reduction.

**Phase 3 (Week 15-22): hard gates.**

- After 80% adoption, CI policy: new Dockerfiles MUST use a golden base or pass a manual security review.
- OPA/Kyverno admission denies non-golden images at K8s deploy time.
- The remaining 20% of services usually have legitimate exceptions; document them.

**Phase 4 (Week 23-26): registry hygiene.**

- Retention policy: untagged images >30 days deleted; old SHAs >90 days deleted (except production-currently-running).
- Lifecycle-managed via registry's policy engine.
- Result: registry cost drops to ~$2K/mo (75% reduction).

**Outcomes target.**

- Image size avg 200MB→60MB (3-4x reduction).
- CVE count 3000→<200 (10-15x reduction; remaining CVEs reviewed weekly).
- Registry cost $8K→$2K/mo.
- New service onboarding: 1 day instead of 1 week (golden Dockerfile.template → working CI).
- Time-to-patch a critical CVE: from "depends on every team" to "rebuild golden base; cascade rebuild downstream" → automated.

**Risks.**

- **Team friction.** Mitigation: champions per dept; visible benefits; carrot before stick (don't enforce until 50% volunteer-adopt).
- **Specialized images that don't fit.** Mitigation: legitimate exceptions process; 1:1 review.
- **Build time creep** with multi-stage. Mitigation: BuildKit cache + remote cache.
- **Hidden runtime deps** when going to distroless (no shell). Mitigation: include common debug tools in a non-prod image; use `kubectl debug` pattern in prod.

**Lessons (from teams that did this; e.g., Shopify, GitLab).**

- Most CVEs are from outdated base images. Daily rebuild of golden bases catches 80%.
- Distroless requires app-side awareness (no shell-based debugging); team training matters.
- Centralizing costs ~5-10% of an SRE's time perpetually; pays for itself many times over.

**Process improvement.**

- Image-build SLO: golden bases rebuild within 24h of upstream CVE disclosure.
- Per-service CVE dashboard: each team sees their counts; embarrassment is a powerful tool.
- Quarterly review of the program; iterate on which bases / which policies.

**rubric:** 25-pt: assessment + 80/20 (3) + golden-base catalog with distroless + nightly rebuild (5) + automated PR codemod for adoption (3) + admission policy gate (3) + registry retention policy (2) + measurable outcomes for size + CVE + cost (4) + risk: team friction + hidden runtime deps (3) + lessons-from-peers angle (2).

**watermark_seed:** qorium-devops-v0.6-079-seed-3c2a4e8b
**variant_seed:** qorium-devops-v0.6-2026-05-07-079
**bias_check_notes:** No bias.

---

### QUESTION 80: Casestudy — On-Call Burnout (Very Hard - Casestudy)

**question_id:** QOR-DEVOPS-080
**skill_id:** senior-devops-080
**sub_skill_id:** oncall-burnout
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored; Google SRE Workbook

**body:** As newly-hired Director of SRE, you find: average 12 pages/week per on-call (target ≤2); 30% of pages are non-actionable; 4 senior engineers quit in last 6 months citing "on-call hell"; the next on-call rotation starts Monday. Plan the first 90 days. (Limit: 800 words.)

**answer_key:**

**Day 1-7 — triage the immediate.**

- 1:1 with every on-call engineer (12 people in a week). Listen. Don't yet promise.
- Get baseline data: pages/week per person, MTTR, % actionable, top 10 noisy alerts.
- Communicate transparently: "I've heard X. Plan in 14 days."

**Day 8-14 — first-pass alert hygiene (immediate relief).**

- Top 10 noisiest alerts (often 60% of pages): are they actionable, do they have runbooks, do they have correct thresholds? Many will be: stale alerts on retired services, alerts on transient blips, alerts that would auto-resolve in 5 min.
- Decision per alert (with team owner consent): keep / fix / delete. Aim to halve page volume in 2 weeks.
- Add a monthly "alert review" ritual.
- Set a hard rule: no new alerts without runbook + actionable severity.

**Day 15-30 — structural improvements.**

- **Runbook-or-delete policy.** Every alert needs a runbook. If no one writes one, delete the alert. Forces explicit prioritization.
- **Severity tiers documented.** SEV-1 = wake up; SEV-2 = next-day; SEV-3 = ticket-only. Reduce SEV-1 to genuinely critical.
- **Multi-burn-rate SLO alerting** replaces per-symptom alerting where possible. Single error-budget alert beats 20 micro-alerts.
- **Escalation policy.** 15-min ack window; auto-escalate. Backup on-call.

**Day 30-60 — process and culture.**

- **Compensation.** On-call pay (per-shift + per-page premium beyond a threshold). Real money signals real value of the work.
- **Rotation size.** 6+ engineers per rotation; ≤1 week shift; weekday vs weekend split. Engineers can't burn out at 1-in-6.
- **Post-shift handoff** mandatory. The next on-call inherits open issues with context.
- **Blameless postmortems** for every SEV-1; "process" is the focus, not individuals. Read out monthly.
- **No "you're the expert, you respond"** outside on-call. The whole team is on-call; the system is not "Joe's responsibility."

**Day 60-90 — investments.**

- **Tools:** noise-suppression in alerting (PagerDuty Event Intelligence), Slack/Teams integration with runbook context, dashboards every responder can find in 30s.
- **Reliability budget:** team allocates 20% of sprint capacity to reliability work (mode 1 work, in Google SRE terms). Burndown tracked; PMs cannot eat into it without explicit director approval.
- **Reliability OKRs.** Halve page volume in 6 months; keep 90% of SEV-1s under 5-min MTTA.
- **Hire backfill.** Replace the 4 quitters. Position the role with the now-improved on-call as a selling point.

**Communication to leadership.**

- "On-call was a major contributor to attrition. Here's what we're changing in 90 days. Reliability investments cost X% engineering capacity but the alternative is more attrition — the math is decisive."
- Monthly metrics to leadership: page volume, MTTA, MTTR, attrition, rotation health.

**Hard truths (be ready to defend).**

- Page volume 12→2 ≠ "do less work." It's the same reliability with less noise.
- Some PMs will resist 20% reliability budget. Hold the line; show the cost of not having it (attrition + outage hours).
- Some engineers prefer being heroes. Redirect: heroism doesn't scale; systems-thinking does.

**Trap to avoid.**

- "Just hire more people." Adds capacity without fixing the root cause; new hires churn for the same reasons. Fix the system, then hire to staff the better system.
- "Move on-call to another team." Externalizing pain doesn't reduce it.

**Outcomes target (90 days).**

- Pages/week 12→4 (target 2 by month 6).
- MTTA on SEV-1 < 5 min consistently.
- Zero attrition citing on-call (or named differently).
- Engineers express trust that on-call is bounded, predictable, fairly compensated.
- The rotation Monday looks different from this Monday; no more "on-call hell" stories.

**Lessons.**

- On-call quality is a leadership problem, not a tooling problem (though tools matter). Compensation, escalation policy, blamelessness, and 20% reliability budget are policy decisions.
- Most teams don't lack data; they lack permission to delete noisy alerts. Director can give that permission.

**rubric:** 25-pt: 1:1 listening first (3) + alert hygiene to halve volume in 2 weeks (3) + runbook-or-delete policy (3) + multi-burn-rate / SLO alerting (2) + on-call comp + rotation size (3) + 20% reliability budget (3) + blameless postmortem culture (2) + hire-after-fix-system not hire-to-fix (2) + measurable 90-day outcomes (2) + trap-avoidance: don't externalize pain (2).

**watermark_seed:** qorium-devops-v0.6-080-seed-9e3c8a4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-080
**bias_check_notes:** No bias.

---

## End DevOps/SRE 061-080.

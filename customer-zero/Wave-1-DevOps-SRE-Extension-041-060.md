# Wave 1 Extension: Senior DevOps/SRE (QOR-DEVOPS-041..060)

**STATUS:** AI-drafted v0.6 EXTENSION. SME Lead validation pending. Reference baseline: K8s 1.30+, Helm 3, Argo CD, Terraform 1.7+, Prometheus + Grafana, Vault, GitHub Actions, AWS/GCP/Azure.

## 20 NEW Questions (QOR-DEVOPS-041..060)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 41: K8s Pod Lifecycle Hooks (Easy)

**question_id:** QOR-DEVOPS-041
**skill_id:** senior-devops-041
**sub_skill_id:** pod-lifecycle-hooks
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Kubernetes Documentation §Lifecycle

**body:** A Pod is being terminated; you want graceful shutdown. Which hook + lifecycle?

**options:**
- A) postStart only
- B) preStop hook fires BEFORE SIGTERM is sent. Use it to drain connections (deregister from LB, close keep-alives). Pod has terminationGracePeriodSeconds (default 30s) before SIGKILL. Plus a readiness probe that returns NotReady on shutdown helps the LB stop sending traffic
- C) Restart the Pod
- D) postStart with sleep

**answer_key:** B — `preStop` + `terminationGracePeriodSeconds` is the K8s graceful-shutdown idiom. Reference: K8s docs §Container Lifecycle Hooks.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-041-seed-3a8c7e2b

**variant_seed:** qorium-devops-v0.6-2026-05-07-041
**bias_check_notes:** No bias.

---

### QUESTION 42: Liveness vs Readiness Probes (Easy)

**question_id:** QOR-DEVOPS-042
**skill_id:** senior-devops-042
**sub_skill_id:** probes
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** K8s Documentation §Probes

**body:** Difference between liveness and readiness probes:

**options:**
- A) Identical
- B) **Liveness** = restart the container if failing (think "deadlock recovery"). **Readiness** = remove from Service endpoints if failing (think "not ready for traffic, but don't kill"). Bad liveness probes (e.g., DB-dependent) cascade failures; readiness should validate runtime state, liveness should validate process health only
- C) Both restart
- D) Both remove from LB

**answer_key:** B — Mis-using liveness for "ready for traffic" is a classic cascade-failure source: brief DB hiccup → all pods restart → outage. Reference: K8s Probes docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-042-seed-9b3e8c4a
**variant_seed:** qorium-devops-v0.6-2026-05-07-042
**bias_check_notes:** No bias.

---

### QUESTION 43: Helm vs Kustomize (Easy)

**question_id:** QOR-DEVOPS-043
**skill_id:** senior-devops-043
**sub_skill_id:** helm-vs-kustomize
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Helm + Kustomize Documentation

**body:** When choose Kustomize over Helm?

**options:**
- A) Always
- B) **Kustomize** = overlay-based (no templating); good for "small env-specific tweaks on top of base manifests." **Helm** = templated charts; good for distributing parameterized apps with versioned releases. Many teams use BOTH (Helm for third-party charts, Kustomize for own apps). They're complementary, not competing
- C) Helm always
- D) Both deprecated

**answer_key:** B — Pragmatic combination is the modern default. References: Helm docs; Kustomize docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-043-seed-3c8a4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-043
**bias_check_notes:** No bias.

---

### QUESTION 44: Argo CD GitOps Pattern (Medium)

**question_id:** QOR-DEVOPS-044
**skill_id:** senior-devops-044
**sub_skill_id:** argocd-gitops
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Argo CD Documentation; OpenGitOps principles

**body:** GitOps with Argo CD core principle:

**options:**
- A) CI pushes to K8s
- B) **Git is the single source of truth** for desired cluster state. Argo CD continuously reconciles cluster to Git. Drift (manual changes to cluster) auto-revert to Git state OR alarm. Rollback = git revert. Audit = git log
- C) Manual kubectl apply
- D) Helm only

**answer_key:** B — Pull-based deployment from Git is the GitOps definition. Argo CD/Flux are the canonical implementations. Reference: Argo CD docs; OpenGitOps principles.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-044-seed-7e3c8a2b
**variant_seed:** qorium-devops-v0.6-2026-05-07-044
**bias_check_notes:** No bias.

---

### QUESTION 45: SLI/SLO/SLA — Error Budget (Medium)

**question_id:** QOR-DEVOPS-045
**skill_id:** senior-devops-045
**sub_skill_id:** sli-slo-error-budget
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Google SRE Book §SLOs

**body:** SLO of 99.9% availability over 30 days. What's the "error budget"?

**options:**
- A) 0.1% of revenue
- B) **0.1% of 30 days = 43 minutes 12 seconds** of unavailability allowed. The error budget is the allowed unavailability in the SLO window. Once consumed (e.g., 30-min outage), team freezes risky deploys until the window resets. Aligns dev (ship features) and ops (maintain reliability) incentives
- C) Free SLA credits
- D) An accounting metric

**answer_key:** B — Error budgets are the SRE model. They turn "reliability" from a vague goal into a measurable resource. Reference: Google SRE Book ch. 4.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-045-seed-2d8e5c9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-045
**bias_check_notes:** No bias.

---

### QUESTION 46: PromQL Rate vs Increase (Medium)

**question_id:** QOR-DEVOPS-046
**skill_id:** senior-devops-046
**sub_skill_id:** promql-rate
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Prometheus Documentation §rate

**body:** `rate(http_requests_total[5m])` vs `increase(http_requests_total[5m])`:

**options:**
- A) Identical
- B) **`rate`** = per-second average rate of increase over the window (returns ~10/sec). **`increase`** = total increase in the window (returns ~3000 in a 5m window). For alerting on "requests/sec" use rate. For "errors per hour" use increase or `sum_over_time(... / 3600)`. Always use `rate`/`increase` (NOT raw `_total`) for counters; counter resets break otherwise
- C) increase is faster
- D) Both deprecated

**answer_key:** B — Counter math 101 in PromQL. References: Prometheus docs §rate.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-046-seed-9c4e8a3b
**variant_seed:** qorium-devops-v0.6-2026-05-07-046
**bias_check_notes:** No bias.

---

### QUESTION 47: K8s ResourceRequests vs Limits (Medium)

**question_id:** QOR-DEVOPS-047
**skill_id:** senior-devops-047
**sub_skill_id:** requests-vs-limits
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** K8s Documentation §Resources

**body:** A pod has CPU request=100m, limit=500m. What does this mean?

**options:**
- A) Always 500m
- B) **Request** = guaranteed; scheduler places pod on a node with ≥100m available; CFS shares scaled to request when contended. **Limit** = throttled at 500m max. Memory is similar but EXCEEDING memory limit = OOMKilled (CPU just throttles). Best practice: set requests, set memory limit = request (avoid throttle/OOM ambiguity), CPU limit only with care (throttling causes latency cliffs)
- C) Both ignored
- D) Always 100m

**answer_key:** B — Common pitfall: setting CPU limit causes silent throttling that's hard to debug. Many teams now run "no CPU limits, only requests." Reference: K8s docs §Resources.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-047-seed-5e2c8a4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-047
**bias_check_notes:** No bias.

---

### QUESTION 48: Terraform State Management (Medium)

**question_id:** QOR-DEVOPS-048
**skill_id:** senior-devops-048
**sub_skill_id:** terraform-state
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Terraform Documentation §Backends

**body:** Terraform state best practices for a team:

**options:**
- A) Local files committed to git
- B) **Remote backend** (S3 + DynamoDB lock, GCS, Terraform Cloud) — concurrent runs locked, encrypted at rest, audit trail. NEVER commit `terraform.tfstate` to git (contains secrets). Per-environment workspaces or separate state files. Plan + apply via PR + merge gates
- C) Local with manual sync
- D) Run as root only

**answer_key:** B — Remote state with locking is non-negotiable for team use. Reference: Terraform §Backends.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-048-seed-3a8c4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-048
**bias_check_notes:** No bias.

---

### QUESTION 49: Container Image Hardening (Medium)

**question_id:** QOR-DEVOPS-049
**skill_id:** senior-devops-049
**sub_skill_id:** image-hardening
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** NIST SP 800-190; Distroless images

**body:** Best base for production container image:

**options:**
- A) `ubuntu:latest`
- B) **Distroless or scratch-minimal** (e.g., `gcr.io/distroless/static-debian12`, `cgr.dev/chainguard/static`) — no shell, no apt, minimal CVE surface. Use multi-stage build: build in `golang:1.22`, copy binary into distroless. Run as non-root user. Sign images (cosign / Sigstore). Scan with Trivy / Grype in CI
- C) `node:18` for Node apps
- D) `alpine:latest` always

**answer_key:** B — Distroless / Chainguard images are the modern security baseline. Pin by SHA, not tag. Reference: NIST SP 800-190.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-049-seed-9b2c4a8e
**variant_seed:** qorium-devops-v0.6-2026-05-07-049
**bias_check_notes:** No bias.

---

### QUESTION 50: K8s NetworkPolicy (Medium)

**question_id:** QOR-DEVOPS-050
**skill_id:** senior-devops-050
**sub_skill_id:** networkpolicy
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** K8s Documentation §NetworkPolicies

**body:** Default K8s pod network: any pod can talk to any pod. Best practice:

**options:**
- A) Trust by default
- B) **Default-deny NetworkPolicy** per namespace + explicit allow lists. Implement zero-trust intra-cluster. Requires CNI that supports NetworkPolicy (Calico, Cilium). Cilium adds L7 (HTTP-aware) policies
- C) NetworkPolicy is deprecated
- D) Use mTLS only

**answer_key:** B — Default-deny is the security baseline; mTLS via service mesh is complementary (encryption + identity). Reference: K8s NetworkPolicy docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-050-seed-4d8c2a9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-050
**bias_check_notes:** No bias.

---

### QUESTION 51: HPA + KEDA (Medium)

**question_id:** QOR-DEVOPS-051
**skill_id:** senior-devops-051
**sub_skill_id:** hpa-keda
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** KEDA Documentation; HPA docs

**body:** Native HPA scales on CPU/memory. To scale on Kafka lag, AWS SQS depth, Postgres query result:

**options:**
- A) Custom metrics endpoint
- B) **KEDA (Kubernetes Event-Driven Autoscaling)** — adds 60+ scalers for external sources (Kafka, RabbitMQ, AWS SQS, Cron, Postgres). Implements ScaledObject CRD that translates external metric → HPA. Scale-to-zero supported (HPA can't normally; KEDA adds it via the activator pattern from Knative)
- C) Manual scaling
- D) DaemonSet

**answer_key:** B — KEDA is the canonical pattern for event-driven workloads. References: KEDA docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-devops-v0.6-051-seed-2c8a4e9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-051
**bias_check_notes:** No bias.

---

### QUESTION 52: Code — Idempotent Terraform Module (Hard - Code)

**question_id:** QOR-DEVOPS-052
**skill_id:** senior-devops-052
**sub_skill_id:** terraform-module
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Terraform Module conventions

**body:** Write a Terraform module `aws_s3_bucket_with_versioning` that creates an S3 bucket with versioning, encryption, and a lifecycle rule transitioning objects to GLACIER after 90 days. Provide variables, outputs, and module call.

**options:** []

**answer_key:**

```hcl
# modules/s3-bucket-versioned/main.tf
terraform {
  required_providers { aws = { source = "hashicorp/aws", version = ">= 5.0" } }
}

variable "bucket_name" { type = string; description = "Globally unique S3 bucket name" }
variable "tags"        { type = map(string); default = {} }
variable "transition_days" { type = number; default = 90 }

resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name
  tags   = var.tags
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  depends_on = [aws_s3_bucket_versioning.this]
  rule {
    id     = "to-glacier"
    status = "Enabled"
    filter {}
    transition {
      days          = var.transition_days
      storage_class = "GLACIER"
    }
    noncurrent_version_transition {
      noncurrent_days = var.transition_days
      storage_class   = "GLACIER"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_arn" { value = aws_s3_bucket.this.arn }
output "bucket_id"  { value = aws_s3_bucket.this.id }

# usage:
# module "data_bucket" {
#   source          = "./modules/s3-bucket-versioned"
#   bucket_name     = "acme-data-prod-${random_id.suffix.hex}"
#   tags            = { Environment = "prod", Owner = "platform" }
#   transition_days = 90
# }
```

Key points: AWS provider 4.x split bucket config into separate resources (intentionally — better state hygiene). Public access block by default (security guardrail). Apply both current and noncurrent version transition (bucket has versioning ON, so old versions still exist). depends_on ensures versioning is configured before lifecycle (some lifecycle features require versioning). Reference: Terraform AWS provider docs.

**rubric:** 12-pt: split-resource pattern (3) + versioning + encryption + public-access-block (3) + lifecycle for both current and noncurrent (3) + variables + outputs (2) + module call example (1).

**watermark_seed:** qorium-devops-v0.6-052-seed-7e3c8a4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-052
**bias_check_notes:** No bias.

---

### QUESTION 53: Code — K8s Deployment + HPA + PDB (Hard - Code)

**question_id:** QOR-DEVOPS-053
**skill_id:** senior-devops-053
**sub_skill_id:** k8s-deployment-yaml
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** K8s Documentation

**body:** Write K8s manifests for a stateless web service: 3 replicas; CPU request 200m / mem 256Mi; readiness on /healthz; HPA on CPU 70% (3-20); PDB allowing only 1 unavailable; preStop graceful shutdown.

**options:** []

**answer_key:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: web, labels: { app: web } }
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      terminationGracePeriodSeconds: 30
      containers:
      - name: web
        image: registry.example.com/web@sha256:...
        ports: [{ containerPort: 8080, name: http }]
        resources:
          requests: { cpu: "200m", memory: "256Mi" }
          limits:   { memory: "256Mi" }   # no CPU limit (avoid throttle cliffs)
        readinessProbe:
          httpGet: { path: /healthz, port: http }
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 3
        livenessProbe:
          httpGet: { path: /alive, port: http }
          initialDelaySeconds: 30
          periodSeconds: 30
          failureThreshold: 5
        lifecycle:
          preStop:
            exec: { command: ["/bin/sh", "-c", "sleep 5 && kill -SIGTERM 1"] }
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities: { drop: ["ALL"] }
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: web }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: web }
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target: { type: Utilization, averageUtilization: 70 }
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # avoid thrash
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: web }
spec:
  maxUnavailable: 1
  selector: { matchLabels: { app: web } }
```

Key points: image pinned by SHA (immutability); preStop sleep gives the LB time to deregister; readiness drains traffic before SIGTERM lands; no CPU limit (only memory); securityContext locks down runtime; PDB protects against voluntary disruption. References: K8s Probes/PDB/HPA docs.

**rubric:** 12-pt: replicas + image pin (1) + resources w/ no CPU limit (2) + readiness + liveness probes (2) + preStop + grace period (2) + securityContext hardening (2) + HPA v2 utilization (2) + PDB (1).

**watermark_seed:** qorium-devops-v0.6-053-seed-3a8c2e4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-053
**bias_check_notes:** No bias.

---

### QUESTION 54: Service Mesh — Istio vs Linkerd (Hard)

**question_id:** QOR-DEVOPS-054
**skill_id:** senior-devops-054
**sub_skill_id:** service-mesh
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** CNCF service mesh comparison

**body:** Choosing service mesh:

**options:**
- A) Istio always (most popular)
- B) **Linkerd** for simplicity + low overhead (Rust data plane, smaller surface). **Istio** for advanced traffic management + multi-cluster + WASM extensions; heavier. Many teams find Linkerd is enough; Istio's complexity costs are real. Use only if you NEED a mesh — for many use cases plain K8s + DNS suffices
- C) Both deprecated
- D) Kuma always

**answer_key:** B — "Right-sized mesh." Linkerd's CNCF-graduated status + Rust performance make it the lower-friction choice for most. Reference: CNCF service mesh comparison.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-054-seed-7c4a8e3b
**variant_seed:** qorium-devops-v0.6-2026-05-07-054
**bias_check_notes:** No bias.

---

### QUESTION 55: Secrets Management — Vault vs External Secrets (Hard)

**question_id:** QOR-DEVOPS-055
**skill_id:** senior-devops-055
**sub_skill_id:** secrets-management
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** HashiCorp Vault Documentation; External Secrets Operator

**body:** K8s secrets at scale:

**options:**
- A) Plain Secret manifests in git (encrypted with sops)
- B) **External Secrets Operator (ESO)** + a backend (Vault, AWS Secrets Manager, GCP Secret Manager). ESO syncs from backend → K8s Secrets. Backends provide rotation, audit, fine-grained RBAC. SOPS + git is fine for small scale; doesn't handle rotation
- C) Plain Secrets always
- D) Avoid secrets

**answer_key:** B — ESO + backend is the canonical pattern at scale. References: External Secrets docs; Vault docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-055-seed-9b3a8e2c
**variant_seed:** qorium-devops-v0.6-2026-05-07-055
**bias_check_notes:** No bias.

---

### QUESTION 56: Distributed Tracing — OpenTelemetry (Hard)

**question_id:** QOR-DEVOPS-056
**skill_id:** senior-devops-056
**sub_skill_id:** opentelemetry
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** OpenTelemetry Documentation

**body:** Tracing strategy across 50 microservices:

**options:**
- A) Each team picks a vendor
- B) **OpenTelemetry SDKs** in each service (auto-instrumentation where possible) + OpenTelemetry Collector receiving OTLP, fanning out to backends (Tempo/Jaeger for traces, Prometheus for metrics, Loki for logs). Vendor-neutral; switch backends without changing app code. W3C Trace Context for cross-service propagation
- C) Datadog only
- D) printf

**answer_key:** B — OpenTelemetry is the CNCF-standard. Vendor-neutral instrumentation + collector pattern is the modern observability stack. Reference: OpenTelemetry docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-056-seed-2c8a4e9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-056
**bias_check_notes:** No bias.

---

### QUESTION 57: Chaos Engineering — Practical Adoption (Hard)

**question_id:** QOR-DEVOPS-057
**skill_id:** senior-devops-057
**sub_skill_id:** chaos-engineering
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** "Chaos Engineering" (O'Reilly); LitmusChaos / Chaos Mesh docs

**body:** First chaos experiment for a team adopting the practice:

**options:**
- A) Kill prod database
- B) Start in staging, narrow blast radius. Define a "steady-state hypothesis" (e.g., "checkout success rate > 99%"); inject disruption (kill 1 pod, add latency to dependency); validate hypothesis holds. Iterate weekly. Promote to prod once team is confident. Tools: LitmusChaos, Chaos Mesh, AWS Fault Injection Simulator. Game days quarterly
- C) Kill all pods at once
- D) Disable monitoring

**answer_key:** B — Chaos Engineering is a discipline, not a stunt. Steady-state hypothesis + minimal blast radius + iterative trust-building is the canonical approach. References: Netflix Chaos Engineering principles.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-devops-v0.6-057-seed-4f8b3c2a
**variant_seed:** qorium-devops-v0.6-2026-05-07-057
**bias_check_notes:** No bias.

---

### QUESTION 58: Design — End-to-End CI/CD for K8s Microservices (Hard - Design)

**question_id:** QOR-DEVOPS-058
**skill_id:** senior-devops-058
**sub_skill_id:** cicd-pipeline-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Design CI/CD for 30 microservices on K8s, 4 environments (dev/staging/canary/prod), 50 engineers. Cover: build, test, scan, image registry, deploy strategy, rollback, secrets, governance. (Limit: 800 words.)

**answer_key:**

**Stack: GitHub Actions for CI; Argo CD for CD; Helm charts in a separate config repo; image registry with scanning; OPA / Kyverno for policy.**

**Repo layout.**
- Per-service repo: source + Dockerfile + tests + Helm chart values for default config.
- Single "config" repo: per-environment Helm value overrides; Argo CD `Application` manifests. Updated by CI, watched by Argo CD.

**CI pipeline (per-service).**

1. Lint + unit tests + coverage gate (fail if drops below threshold).
2. Build container image — multi-stage; final image = distroless. Tagged with git SHA and semver.
3. SAST scan (Semgrep / CodeQL).
4. Image vulnerability scan (Trivy / Grype). Fail on HIGH severity.
5. SBOM generated (Syft) and stored.
6. Image signed (cosign).
7. Push to registry (private, with retention policies).
8. CI pushes a PR to config repo bumping the image SHA in the dev-env values.

**CD pipeline (Argo CD).**

- Watches config repo; reconciles cluster to declared state.
- Each app has 4 Argo CD `Application`s (one per env) tracking respective branches/paths.
- Sync waves: namespaces → CRDs → infra (Postgres operator) → apps.

**Deploy strategy.**

- **dev:** automatic on every commit; full Argo CD sync.
- **staging:** automatic on merge to main; runs integration tests post-deploy.
- **canary (prod-canary):** automatic; receives 5% traffic via Argo Rollouts. Metrics (error rate, latency) compared against baseline. Auto-promote or auto-rollback.
- **prod:** automatic after canary green for 30 minutes. Argo Rollouts manages progressive delivery (10% → 50% → 100% over 1-2 hours).

**Rollback.**

- `git revert` of the image-bump commit + Argo CD re-sync. Recovery in <5 minutes.
- Alternative: Argo Rollouts has `kubectl argo rollouts undo` for the in-place case.

**Secrets.**

- ESO (External Secrets Operator) syncing from Vault. Per-environment Vault namespaces.
- No secrets ever in git; values reference ESO External Secret resources.

**Governance.**

- OPA/Gatekeeper or Kyverno enforce: distroless base, runAsNonRoot, no `:latest` tags, required labels, max replicas, NetworkPolicy presence.
- Image admission: only signed images from approved registries (cosign verification via policy).
- PR review: required code reviews; required CI green; required security review for changes touching secrets/auth.

**Observability of the pipeline itself.**

- DORA metrics: deploy frequency, lead time, change-fail rate, MTTR. Dashboard.
- Per-service deploy log (audit + debugging).

**Game day failure.** Test "broken canary metric collector" — verify rollouts pause/rollback happens correctly when metrics are unavailable (fail closed, not open). Many teams have rollouts that auto-promote when the metric source dies; that's the worst-case bug.

**Migration from current state.** Pick 3 pilot services; migrate in one quarter; document runbook; roll across the rest. Don't big-bang.

**rubric:** 18-pt: per-service CI w/ test+scan+sign+SBOM (4) + GitOps via Argo CD on config repo (3) + 4-env progression w/ canary metrics (3) + Argo Rollouts (2) + ESO + Vault secrets (2) + OPA/Kyverno governance (2) + DORA observability (1) + game-day for canary metric failure (1).

**watermark_seed:** qorium-devops-v0.6-058-seed-3c8a4e7b
**variant_seed:** qorium-devops-v0.6-2026-05-07-058
**bias_check_notes:** No bias.

---

### QUESTION 59: Casestudy — Major Incident Response (Very Hard - Casestudy)

**question_id:** QOR-DEVOPS-059
**skill_id:** senior-devops-059
**sub_skill_id:** incident-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored; SRE incident management practices

**body:** It's 4 AM IST. Production is hard down: web tier returns 502, p99 latency timed out. Last deploy was 8 hours ago (no recent change). On-call sees: K8s API server slow, etcd has high disk-write latency. You're incident commander. Walk through the first 30 minutes, escalation, comms, and postmortem priorities. (Limit: 800 words.)

**answer_key:**

**Minute 0-5 — declare and orient.**

- Declare a sev-1 in PagerDuty/Slack.
- Open a war-room channel; pin a status doc.
- Roles: Incident Commander (you), Comms Lead, Tech Lead per surface (web tier, K8s, DB).
- Kick off statuspage to "Investigating."

**Minute 5-15 — orient on the symptom set.**

The clue is "K8s API slow + etcd high write latency." This is INFRASTRUCTURE-side. Web tier 502s are likely a symptom: pods can't be scheduled / probes can't be evaluated / kube-proxy can't update endpoints because the control plane is sick.

Common causes for etcd write-latency:
1. Disk saturation on etcd nodes (full or IOPS-limited). Check `iostat`, `kubectl get --raw /metrics | grep etcd`.
2. Compaction storm (etcd not compacted recently → DB bloated). `etcdctl endpoint status` shows DB size.
3. Network partition between etcd peers. `etcdctl member list` and check if quorum lost.
4. A spammy controller making excessive writes (e.g., a misconfigured operator looping reconciliations).

**Minute 15-30 — confirm and mitigate.**

If etcd disk full: free space (compact + defrag). `etcdctl compact <rev>; etcdctl defrag`. Capacity emergency: scale node up.

If runaway controller: `kubectl get events` + audit log for write spammers. Disable / scale to 0 the offender.

If quorum lost: restore from etcd backup (you have nightly backups, right?). Spanned by minutes if backup is available.

In parallel: web tier 502s. If etcd recovers, K8s schedules pods, traffic resumes. If etcd recovery takes longer, consider a manual failover to DR cluster (minutes-to-hours; only if recovery > 30min).

**Comms cadence.**

- Statuspage update every 15 minutes.
- Internal exec brief every 30 minutes.
- Customer-facing comms: factual, no minimization, ETA only when confident.

**Mitigation declaration.**

When error rate < 1% for 10 minutes, declare resolved on statuspage. Continue monitoring 1 hour before standing down war room.

**The 8-hours-since-deploy clue.**

Most incidents from "no recent change" are: (a) gradual resource exhaustion (disk, leases, certs), (b) third-party dependency failure, (c) certificate expiry, (d) cron-triggered batch (4 AM!). Etcd disk-fill is exactly the gradual-exhaustion pattern.

**Postmortem priorities (within 5 days):**

1. **Root cause** — etcd disk-write latency. Five-Whys: disk fill → no compaction job → autocompact misconfigured → no monitoring of etcd-db size → no runbook for etcd ops.
2. **Concrete commitments:**
   - Etcd compaction CronJob with monitoring (DBA, +14d).
   - Etcd disk usage alarm at 70% (SRE, +7d).
   - Backup-restore drill quarterly (SRE, +30d).
   - Runbook: "etcd disk full" with the exact compact/defrag commands tested in staging (SRE, +14d).
   - Capacity planning quarterly: review etcd disk vs cluster size growth.
3. **Process gaps:** war-room template, role designations, comms cadence — all worked. Don't fix what isn't broken.
4. **Customer trust rebuild:** SLA credit per contracts; transparent postmortem published.

**Lessons (in priority order):**

- Most prod outages from "no recent change" are gradual-exhaustion or external. Monitor leading indicators.
- Etcd is a critical dependency; its disk health = cluster health. Treat as tier-0 monitor.
- Backup-restore drills surface real recovery times. "We have backups" without practice = fiction.
- Sev-1 muscle memory: the first 30 minutes determine whether resolution is in 1h or 6h. Drill the war-room template quarterly.

**Why this matters.**

Most engineering orgs underinvest in cluster infrastructure observability and overinvest in app metrics. K8s control plane health is the silent prerequisite. The 4 AM incident is the wake-up call to rebalance.

**rubric:** 25-pt: declare + IC roles + war-room (4) + correct triage to control-plane (etcd) (4) + most likely root causes enumerated (4) + mitigation order: compaction, defrag, capacity (3) + comms cadence + statuspage (3) + 8-hour-no-deploy reasoning (gradual exhaustion) (2) + postmortem with concrete commitments + dates (3) + leading-indicators monitoring lesson (2).

**watermark_seed:** qorium-devops-v0.6-059-seed-2d8e4c9b
**variant_seed:** qorium-devops-v0.6-2026-05-07-059
**bias_check_notes:** No bias.

---

### QUESTION 60: Casestudy — Multi-Cloud vs Single-Cloud (Very Hard - Casestudy)

**question_id:** QOR-DEVOPS-060
**skill_id:** senior-devops-060
**sub_skill_id:** multicloud-decision
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** A SaaS company on AWS-only is debating multi-cloud (AWS + GCP active-active) due to: (1) board insists on resilience post-2024 AWS outage that hit competitor, (2) one tier-1 customer requires GCP for compliance. Cover: real cost of multi-cloud, alternatives, when it's actually justified, recommendation. (Limit: 800 words.)

**answer_key:**

**TL;DR. Don't go multi-cloud for general resilience. Add a GCP footprint ONLY for the specific customer; treat AWS as primary; dual-region within AWS is the right resilience answer for almost all scenarios.**

**Real cost of multi-cloud.**

- **Engineering complexity:** every IaC abstraction must be cloud-agnostic. Either compromise to lowest-common-denominator (lose vendor-specific value: BigQuery, DynamoDB, Aurora) or maintain two implementations.
- **Networking:** cross-cloud latency 30-100ms; egress charges $0.08-0.12/GB; VPN/Interconnect setup non-trivial.
- **Identity / RBAC:** two IAM systems, different paradigms; nightmare at scale.
- **Talent:** few engineers are deeply skilled in BOTH AWS and GCP; you train two stacks.
- **Operational tooling:** Terraform helps but doesn't eliminate; logging/monitoring fragmented.
- **Realistic premium:** 30-60% higher infra cost + 20-40% higher engineering cost (estimate from companies that have done it: Zoom, Snap, Shopify earlier had multi-cloud, several have consolidated).

**When multi-cloud is genuinely justified.**

1. **Specific customer compliance** — exact case: a regulated customer mandates GCP. Add a GCP footprint for THAT customer's tenant only.
2. **Geo requirements** — GCP has better presence in some regions, AWS in others.
3. **Vendor leverage at extreme scale** — Walmart, Capital One, BBC — billions in spend justify the negotiation leverage.
4. **Regulatory mandate** — some sovereign-cloud requirements (India eventually).

NOT justified by:
- "Cloud outage resilience." 99.9% of AWS outages are regional. Multi-region within AWS gives 99.99% availability with 1/10th the operational complexity.
- "Avoid vendor lock-in." Lock-in is real but switching costs are real both ways. Multi-cloud distributes lock-in across two vendors.
- "Best-of-breed." The features you'd cherry-pick (BigQuery, Spanner, etc.) you won't use because of multi-cloud constraints.

**Recommendation for this scenario.**

1. **For the resilience board concern:** invest in **multi-region AWS**. Active-active across `ap-south-1` (Mumbai) and `ap-southeast-1` (Singapore) gets you to 99.99% with minimal operational change. Document this as the resilience strategy. Most board concerns about "AWS outage" are addressed by region diversity — they assume "single AWS cloud" means "single point of failure" which is incorrect.

2. **For the GCP customer:** add a GCP footprint for THAT customer specifically.
   - Build a tenant-isolated deployment in GCP.
   - Reuse Terraform modules where feasible (S3 vs GCS, RDS vs Cloud SQL — abstraction will leak; accept it).
   - Ship operational runbooks for GCP specifically.
   - Charge the customer for the cost of running on GCP (premium tier).
   - Have an exit clause: if customer leaves, decommission GCP within 90 days.

3. **Architectural guardrails to keep "GCP for one customer" from creeping into "multi-cloud everywhere":**
   - Code paths fork by tenant config.
   - No shared infrastructure between AWS and GCP environments (no peering, no DNS sharing).
   - Tenant-specific compliance + audit reports.
   - Yearly review: is this customer profitable accounting for true multi-cloud overhead? If not, escape clause.

**Cost framing.**

- Multi-region AWS: 40% higher than single-region. Achieves the resilience goal.
- AWS + GCP for one customer: 100% AWS infra cost + ~30% GCP-specific overhead for the customer's revenue stream. Positive margin only if customer is large.
- AWS + GCP active-active everywhere: 100-150% AWS cost + GCP cost + engineering overhead. Almost never positive ROI for a single mid-large SaaS.

**Migration path if board insists "multi-cloud everywhere."**

If you're forced: pick a 2-3 service POC over 12 months. Measure operational pain. Likely outcome: they're convinced to ratchet back. If they're not, you've at least built capability deliberately.

**Lessons.**

- Multi-cloud decisions should be customer- and revenue-driven, not "vendor diversity for its own sake."
- "Resilience" concerns are usually answered by multi-region within one cloud, not multi-cloud.
- Boards see news of cloud outages and over-correct; engineering's job is to clarify the real risk and the cheapest mitigation.

**rubric:** 25-pt: rejects multi-cloud-for-resilience with reasoning (5) + multi-region AWS as resilience answer (4) + targeted GCP for specific customer (4) + cost framing of multi-cloud premium (3) + criteria for when multi-cloud IS justified (3) + architectural guardrails to limit creep (3) + customer profitability/cost-recovery angle (3).

**watermark_seed:** qorium-devops-v0.6-060-seed-7c2a8e4b
**variant_seed:** qorium-devops-v0.6-2026-05-07-060
**bias_check_notes:** No bias.

---

## End DevOps/SRE 041-060.

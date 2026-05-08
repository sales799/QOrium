# Wave 1 Extension: Senior AWS (QOR-AWS-041..060)

**STATUS:** AI-drafted v0.6 EXTENSION. SME Lead validation pending. Reference baseline: AWS 2026 (re:Invent 2025 + post), well-architected v6.

## 20 NEW Questions (QOR-AWS-041..060)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 41: VPC Subnets — Public vs Private (Easy)

**question_id:** QOR-AWS-041
**skill_id:** senior-aws-041
**sub_skill_id:** vpc-subnets
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** AWS VPC Documentation

**body:** Public vs private subnet difference:

**options:**
- A) Just naming
- B) **Public subnet** = route table has Internet Gateway (IGW) for default route; resources can have public IPs + reach internet directly. **Private subnet** = no IGW route; outbound via NAT Gateway in public subnet (or VPC Endpoints for AWS APIs). Best practice: app + DB in private subnets; ALB in public; bastion replaced by SSM Session Manager
- C) Larger public
- D) Identical

**answer_key:** B — Standard 3-tier VPC layout. Reference: AWS VPC docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-041-seed-3a8c7e2b
**variant_seed:** qorium-aws-v0.6-2026-05-08-041
**bias_check_notes:** No bias.

---

### QUESTION 42: IAM Policy — Identity vs Resource (Easy)

**question_id:** QOR-AWS-042
**skill_id:** senior-aws-042
**sub_skill_id:** iam-policy-types
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** AWS IAM Documentation

**body:** Identity-based vs resource-based IAM policies:

**options:**
- A) Same
- B) **Identity-based** attached to user/role/group; "what can THIS principal do." **Resource-based** attached to S3 bucket, KMS key, SQS queue, Lambda; "who can use THIS resource." Resource-based supports cross-account access without role-assume. Effective access = union evaluated by policy evaluation logic
- C) Identity only
- D) Resource only

**answer_key:** B — Two-axis IAM model is the foundation. Reference: AWS IAM docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-042-seed-9b3e8c4a
**variant_seed:** qorium-aws-v0.6-2026-05-08-042
**bias_check_notes:** No bias.

---

### QUESTION 43: S3 Storage Classes (Easy)

**question_id:** QOR-AWS-043
**skill_id:** senior-aws-043
**sub_skill_id:** s3-storage-classes
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** AWS S3 Documentation

**body:** Frequently changing access pattern that's hard to predict — best class:

**options:**
- A) Standard
- B) **S3 Intelligent-Tiering** auto-moves objects between Frequent / Infrequent / Archive Instant / Archive / Deep Archive based on access; tiny per-object monitoring fee; saves 30-70% vs Standard for unknown patterns. For known patterns: Standard (hot), Standard-IA (≥30d), Glacier Instant Retrieval, Deep Archive. Lifecycle rules transition by age
- C) Glacier always
- D) Deep Archive

**answer_key:** B — Intelligent-Tiering is the default for unpredictable access. Reference: S3 docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-043-seed-3c8a4e7b
**variant_seed:** qorium-aws-v0.6-2026-05-08-043
**bias_check_notes:** No bias.

---

### QUESTION 44: Lambda Cold Start (Medium)

**question_id:** QOR-AWS-044
**skill_id:** senior-aws-044
**sub_skill_id:** lambda-cold-start
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS Lambda Documentation

**body:** Lambda cold start mitigation:

**options:**
- A) Always synchronous
- B) **Provisioned Concurrency** (pay for warm instances; <10ms invoke); SnapStart for Java (snapshot of init state); minimize package size + dependencies; ARM Graviton runtime; runtimes with faster cold start (Node, Go, Rust); avoid VPC unless needed (VPC ENI attach adds 200-1000ms historically; now greatly improved). Choose based on traffic pattern
- C) Disable timeout
- D) Lambda is sync only

**answer_key:** B — Cold start has multiple levers per workload. Reference: Lambda docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-044-seed-7e3c8a2b
**variant_seed:** qorium-aws-v0.6-2026-05-08-044
**bias_check_notes:** No bias.

---

### QUESTION 45: DynamoDB On-Demand vs Provisioned (Medium)

**question_id:** QOR-AWS-045
**skill_id:** senior-aws-045
**sub_skill_id:** dynamodb-capacity
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS DynamoDB Documentation

**body:** DynamoDB capacity-mode choice:

**options:**
- A) Always provisioned
- B) **On-Demand** for unknown / spiky / new workloads (pay per request, instant scale, ~5x more expensive than well-tuned provisioned). **Provisioned + auto-scaling** for steady predictable traffic; reserved capacity buys further discount. Switch as workload matures. Hot partition key is THE biggest perf risk regardless of mode
- C) Reserved only
- D) Both identical

**answer_key:** B — Capacity-mode trade-off + hot-partition awareness. Reference: DDB docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-045-seed-2d8e5c9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-045
**bias_check_notes:** No bias.

---

### QUESTION 46: ALB vs NLB vs API Gateway (Medium)

**question_id:** QOR-AWS-046
**skill_id:** senior-aws-046
**sub_skill_id:** load-balancer-types
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS ELB Documentation

**body:** Choose:

**options:**
- A) Always ALB
- B) **ALB (L7)** for HTTP/HTTPS, path/host routing, gRPC, WebSocket, OIDC auth; container-aware (ECS/EKS). **NLB (L4)** for ultra-low-latency TCP/UDP, static IP per AZ, large concurrent connection volume; preserves source IP. **API Gateway** for managed REST/HTTP/WebSocket APIs with auth + rate limit + transform; pricing per call, expensive at high volume. Pick by workload pattern
- C) NLB only
- D) Same thing

**answer_key:** B — Three load-balancer-class choice. Reference: AWS ELB docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-046-seed-9c4e8a3b
**variant_seed:** qorium-aws-v0.6-2026-05-08-046
**bias_check_notes:** No bias.

---

### QUESTION 47: KMS Customer-Managed Keys (Medium)

**question_id:** QOR-AWS-047
**skill_id:** senior-aws-047
**sub_skill_id:** kms-cmk
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS KMS Documentation

**body:** AWS-managed vs Customer-managed KMS keys:

**options:**
- A) Same
- B) **AWS-managed** (alias/aws/rds, alias/aws/s3) free + auto-rotated annually; can't control key policy / disable / cross-account share. **Customer-managed (CMK)** $1/month; full control over policy, rotation cadence, multi-region replicas, deletion. Use CMK for: cross-account encrypted resources, regulatory compliance, programmatic key disable for compromise, IAM policy for fine-grained access
- C) AWS only
- D) Customer only

**answer_key:** B — CMK for control; AWS-managed for cost-free baseline. Reference: KMS docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-047-seed-5e2c8a4b
**variant_seed:** qorium-aws-v0.6-2026-05-08-047
**bias_check_notes:** No bias.

---

### QUESTION 48: VPC Endpoints (Medium)

**question_id:** QOR-AWS-048
**skill_id:** senior-aws-048
**sub_skill_id:** vpc-endpoints
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS PrivateLink + Gateway Endpoints

**body:** Private subnet's Lambda needs S3 + DynamoDB without NAT Gateway:

**options:**
- A) NAT GW
- B) **Gateway VPC Endpoints (S3, DynamoDB) — free**, route-table-based, regional. **Interface VPC Endpoints (most other AWS services) — pay per ENI + per GB**, DNS-resolved, supports cross-AZ. Saves NAT GW egress charges (~$0.045/GB) at scale; adds private path to AWS APIs. Plus: PrivateLink endpoints for SaaS / inter-account services
- C) Public subnet
- D) Internet-required

**answer_key:** B — VPC Endpoints kill NAT egress costs for AWS-API traffic. Reference: AWS PrivateLink docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-048-seed-3a8c4e7b
**variant_seed:** qorium-aws-v0.6-2026-05-08-048
**bias_check_notes:** No bias.

---

### QUESTION 49: ECS Fargate vs EC2 (Medium)

**question_id:** QOR-AWS-049
**skill_id:** senior-aws-049
**sub_skill_id:** ecs-fargate-vs-ec2
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AWS ECS Documentation

**body:** ECS Fargate vs EC2 launch type:

**options:**
- A) Fargate always cheaper
- B) **Fargate**: serverless containers; per-second billing; AWS handles infra; ~30-50% premium over equivalent EC2. **EC2**: cluster-managed by AWS; cost-efficient at scale (Spot 50-90% off); operational overhead. Pick Fargate for: low-volume, dev, microservices with bursty load; EC2 for: high-volume steady workloads. EKS Fargate similar trade-off
- C) Same
- D) EC2 deprecated

**answer_key:** B — Fargate vs EC2 trade-off pattern. Reference: ECS docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-049-seed-1e8c4a7b
**variant_seed:** qorium-aws-v0.6-2026-05-08-049
**bias_check_notes:** No bias.

---

### QUESTION 50: SQS Standard vs FIFO (Medium)

**question_id:** QOR-AWS-050
**skill_id:** senior-aws-050
**sub_skill_id:** sqs-fifo
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS SQS Documentation

**body:** SQS Standard vs FIFO:

**options:**
- A) Identical
- B) **Standard**: at-least-once, best-effort ordering, ~unlimited throughput. **FIFO**: exactly-once, strict-ordering per MessageGroupId, 300 TPS without batching / 3000 with batching (high-throughput FIFO higher). FIFO has MessageGroupId for parallel ordered streams; deduplication via MessageDeduplicationId. Use FIFO for ordered + dedup; Standard otherwise
- C) FIFO faster
- D) Standard ordered

**answer_key:** B — Standard for throughput; FIFO for ordering+dedup. Reference: SQS docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-050-seed-7c4a8e3b
**variant_seed:** qorium-aws-v0.6-2026-05-08-050
**bias_check_notes:** No bias.

---

### QUESTION 51: CloudFront Origin Access (Medium)

**question_id:** QOR-AWS-051
**skill_id:** senior-aws-051
**sub_skill_id:** cloudfront-oac
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AWS CloudFront Documentation

**body:** Restrict S3 bucket to CloudFront-only access:

**options:**
- A) Public bucket
- B) **Origin Access Control (OAC)** — modern (replaces OAI); SigV4-signed requests CloudFront → S3; bucket policy denies non-CloudFront principals; supports KMS-encrypted origins. Use OAC for new distributions; OAI legacy
- C) IP allowlist
- D) Disable CloudFront

**answer_key:** B — OAC is the modern S3+CloudFront pattern. Reference: CloudFront docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-051-seed-2c8a4e9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-051
**bias_check_notes:** No bias.

---

### QUESTION 52: Code — Lambda + DynamoDB CRUD (Hard - Code)

**question_id:** QOR-AWS-052
**skill_id:** senior-aws-052
**sub_skill_id:** lambda-ddb-crud
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** AWS Lambda + DynamoDB docs

**body:** Write Node.js Lambda handler for an API Gateway POST /orders endpoint that creates an order in DynamoDB with idempotency (header `Idempotency-Key`), proper validation, and structured response.

**options:** []

**answer_key:**

```js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.ORDERS_TABLE;

export const handler = async (event) => {
  try {
    const idemKey = event.headers?.['idempotency-key'];
    if (!idemKey) return reply(400, { error: 'Idempotency-Key header required' });

    // dedup check via separate idempotency table OR same table with prefix
    const existing = await ddb.send(new GetCommand({
      TableName: TABLE, Key: { pk: `IDEMP#${idemKey}` }
    }));
    if (existing.Item) return reply(200, existing.Item.response);

    const body = JSON.parse(event.body || '{}');
    if (!body.customerId || !body.amount) {
      return reply(400, { error: 'customerId + amount required' });
    }

    const order = {
      pk: `ORDER#${randomUUID()}`,
      customerId: body.customerId,
      amount: Number(body.amount),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // conditional write — fail if pk already exists
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: order,
      ConditionExpression: 'attribute_not_exists(pk)',
    }));

    // store idempotency record (TTL 24h)
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        pk: `IDEMP#${idemKey}`,
        response: order,
        ttl: Math.floor(Date.now() / 1000) + 86400,
      },
    }));

    return reply(201, order);
  } catch (err) {
    console.error('handler error', err);
    return reply(500, { error: 'internal' });
  }
};

function reply(status, body) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}
```

Key points: DocumentClient (auto JSON marshalling); idempotency via dedup record + TTL cleanup; conditional write prevents duplicate primary keys; structured error handling; environment-driven table name. Reference: AWS DDB v3 SDK docs.

**rubric:** 12-pt: Idempotency-Key dedup (3) + ConditionExpression (3) + TTL on idempotency record (2) + structured error responses (2) + env-driven config (1) + DocumentClient v3 SDK (1).

**watermark_seed:** qorium-aws-v0.6-052-seed-7e3c8a4b
**variant_seed:** qorium-aws-v0.6-2026-05-08-052
**bias_check_notes:** No bias.

---

### QUESTION 53: Code — Step Functions Saga (Hard - Code)

**question_id:** QOR-AWS-053
**skill_id:** senior-aws-053
**sub_skill_id:** step-fn-saga
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** AWS Step Functions docs

**body:** Provide an AWS Step Functions state machine ASL definition implementing a Saga: ReserveInventory → ChargePayment → ShipOrder; on any failure, run compensating transactions in reverse.

**options:** []

**answer_key:**

```json
{
  "Comment": "Order Saga",
  "StartAt": "ReserveInventory",
  "States": {
    "ReserveInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:reserveInventory",
      "Next": "ChargePayment",
      "Catch": [{ "ErrorEquals": ["States.ALL"], "ResultPath": "$.error", "Next": "FailNoCompensation" }]
    },
    "ChargePayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:chargePayment",
      "Next": "ShipOrder",
      "Catch": [{ "ErrorEquals": ["States.ALL"], "ResultPath": "$.error", "Next": "ReleaseInventory" }]
    },
    "ShipOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:shipOrder",
      "Next": "Done",
      "Catch": [{ "ErrorEquals": ["States.ALL"], "ResultPath": "$.error", "Next": "RefundPayment" }]
    },
    "RefundPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:refundPayment",
      "Next": "ReleaseInventory",
      "Retry": [{ "ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "BackoffRate": 2 }]
    },
    "ReleaseInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:::function:releaseInventory",
      "Next": "FailedAfterCompensation",
      "Retry": [{ "ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "BackoffRate": 2 }]
    },
    "Done":                     { "Type": "Succeed" },
    "FailNoCompensation":       { "Type": "Fail", "Error": "OrderFailed", "Cause": "Inventory reservation failed" },
    "FailedAfterCompensation":  { "Type": "Fail", "Error": "OrderFailed", "Cause": "Compensated" }
  }
}
```

Key points: Catch-blocks define compensation chain (reverse order); Retry on compensation steps so transient issues don't leave orphan state; Done = Succeed; Fail states distinguish "failed early before any side effects" vs "failed and compensated." Reference: Step Functions saga pattern.

**rubric:** 10-pt: forward chain (2) + Catch redirecting to compensation (3) + reverse compensation order (3) + Retry on compensations (1) + distinct fail states (1).

**watermark_seed:** qorium-aws-v0.6-053-seed-3a8c5e2b
**variant_seed:** qorium-aws-v0.6-2026-05-08-053
**bias_check_notes:** No bias.

---

### QUESTION 54: AWS Backup + RPO/RTO (Hard)

**question_id:** QOR-AWS-054
**skill_id:** senior-aws-054
**sub_skill_id:** aws-backup
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AWS Backup Documentation

**body:** Centralized backup across RDS + EBS + DynamoDB + S3:

**options:**
- A) Per-service custom scripts
- B) **AWS Backup** — central plans (cron-style), tagging-based selection, cross-region + cross-account vault, encryption, immutability via Vault Lock (compliance-mode = ransomware-resistant). Plus continuous backup for RDS (PITR). Restore-test job validates regularly. Replaces ad-hoc snapshot scripts
- C) Manual snapshots
- D) Disable backup

**answer_key:** B — AWS Backup is the central pattern. Reference: AWS Backup docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aws-v0.6-054-seed-9b3a8c4e
**variant_seed:** qorium-aws-v0.6-2026-05-08-054
**bias_check_notes:** No bias.

---

### QUESTION 55: AWS Organizations + SCP (Hard)

**question_id:** QOR-AWS-055
**skill_id:** senior-aws-055
**sub_skill_id:** scp
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AWS Organizations docs

**body:** Service Control Policies (SCPs):

**options:**
- A) IAM-equivalent
- B) **SCPs are deny-only at the OU/account level** — define maximum permissions; cannot grant. Even root-user can't exceed SCP. Common patterns: deny non-approved regions, deny disabling CloudTrail, deny unencrypted S3 buckets. Combined with IAM = effective access. Apply at OU level for inheritance
- C) IAM roles
- D) Per-user only

**answer_key:** B — SCPs are the Org-level guardrail. Reference: AWS Organizations docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aws-v0.6-055-seed-2c8a4e7b
**variant_seed:** qorium-aws-v0.6-2026-05-08-055
**bias_check_notes:** No bias.

---

### QUESTION 56: AWS Cost Optimization (Hard)

**question_id:** QOR-AWS-056
**skill_id:** senior-aws-056
**sub_skill_id:** cost-optimization
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** AWS Well-Architected Cost Pillar

**body:** $X/month AWS bill optimization order:

**options:**
- A) Just shut things down
- B) **(1) Right-size** instances using Trusted Advisor / Compute Optimizer; **(2) Savings Plans** for steady compute (40% off, 1y/3y); **(3) Spot Instances** for fault-tolerant workloads (50-90% off); **(4) Storage tiering** S3 Intelligent-Tiering; **(5) Idle resource cleanup** (unattached EBS, idle ELBs, old snapshots); **(6) Data transfer reduction** via VPC Endpoints / CloudFront; **(7) Reserved Capacity** for steady RDS/DDB
- C) Always Reserved
- D) Move to Azure

**answer_key:** B — Multi-lever cost optimization. References: Well-Architected Cost Pillar.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aws-v0.6-056-seed-5e2c4a8b
**variant_seed:** qorium-aws-v0.6-2026-05-08-056
**bias_check_notes:** No bias.

---

### QUESTION 57: Aurora vs RDS Postgres (Hard)

**question_id:** QOR-AWS-057
**skill_id:** senior-aws-057
**sub_skill_id:** aurora-vs-rds
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AWS Aurora docs

**body:** Aurora Postgres vs RDS Postgres:

**options:**
- A) Same
- B) **Aurora** = AWS-rebuilt storage layer; 5-15x faster than RDS for many workloads; auto-scaling storage; up to 15 read replicas with sub-second lag; multi-AZ standard. **RDS Postgres** = vanilla Postgres on EBS; cheaper for small workloads. **Aurora Serverless v2** auto-scales 0.5-128 ACU; good for spiky/dev. Trade-off: Aurora costs ~25% more at small scale
- C) RDS deprecated
- D) Aurora is MySQL only

**answer_key:** B — Aurora's storage architecture is the differentiator. References: Aurora docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aws-v0.6-057-seed-7c4a8e3b
**variant_seed:** qorium-aws-v0.6-2026-05-08-057
**bias_check_notes:** No bias.

---

### QUESTION 58: Design — Highly Available Web App (Hard - Design)

**question_id:** QOR-AWS-058
**skill_id:** senior-aws-058
**sub_skill_id:** ha-web-app-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** AWS Well-Architected

**body:** Design HA web app on AWS: 50K req/sec peak, 99.95% SLO, multi-AZ, sub-100ms p99, secure. Cover: compute, data, network, observability, deploy. (Limit: 800 words.)

**answer_key:**

**Architecture (3-tier, multi-AZ):**

- **Edge:** Route 53 (DNS, health checks) → CloudFront (CDN, WAF). Static assets cached; dynamic forwarded to ALB.
- **Compute:** ECS Fargate or EKS in private subnets, 3 AZs. Auto-scaling on CPU + custom metric.
- **Data:** Aurora Postgres Multi-AZ + 2 read replicas; ElastiCache Redis (cluster mode, multi-AZ); S3 for objects.
- **API:** ALB in public subnets fanning to ECS tasks; WAF rules block OWASP top 10.

**Compute layer.** ECS Fargate: 100-200 tasks at peak; min 30. CPU 70% target HPA. Tasks distributed across 3 AZs via service placement strategy. Image distroless + signed (cosign).

**Data layer.**
- **Aurora**: writer + 2 readers; reader endpoint for read traffic; failover < 30s.
- **Redis (ElastiCache)**: session cache + rate-limit counters; 3-shard cluster, 1 replica per shard, multi-AZ.
- **S3**: lifecycle policies, intelligent tiering, OAC for CloudFront.

**Network.**
- VPC with public + private subnets per AZ.
- VPC Endpoints for S3 + DynamoDB + ECR (no NAT).
- WAF on CloudFront + ALB.
- Shield Standard (free); Shield Advanced ($3K/mo) for DDoS-grade.

**Auth.**
- Cognito User Pools (or Auth0); JWT validated at ALB OIDC integration / app-side.
- Service-to-service via IAM roles (IRSA on EKS, Task Roles on Fargate).

**Observability.**
- CloudWatch metrics + custom application metrics.
- X-Ray for distributed tracing (or OpenTelemetry → AMP/Tempo).
- Alarms on RUM-derived SLOs; multi-burn-rate.
- VPC Flow Logs + GuardDuty for security anomaly.

**Deploy.**
- ECS blue/green via CodeDeploy or Argo Rollouts on EKS.
- Pre-prod canary; metric-gated promotion.
- Failure: instant rollback via deployment artifact swap.

**Cost** (rough at peak): $20-30K/mo. Spot for non-critical = 30-40% reduction.

**SLO 99.95%.** With multi-AZ + read replicas + auto-failover + multi-AZ ElastiCache + multi-AZ Aurora, single-AZ outage tolerated. Cross-region active-passive optional ($-add).

**Game day.** Quarterly: kill an AZ; verify ALB de-registers, Aurora fails over, ECS reschedules; SLO maintained throughout.

**Trade-offs.**
- Multi-region active-active: +50-100% cost; only if RPO<1s + global users justify.
- Aurora Serverless v2: cheaper for spiky; not for predictable peaks.

**rubric:** 18-pt: 3-tier multi-AZ architecture (3) + edge: CloudFront + WAF (2) + compute: ECS Fargate w/ HPA (2) + Aurora w/ readers + Redis cluster (3) + VPC endpoints + WAF (2) + observability w/ multi-burn-rate (3) + blue/green deploy w/ canary (2) + SLO + game-day (1).

**watermark_seed:** qorium-aws-v0.6-058-seed-2c8a4e9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-058
**bias_check_notes:** No bias.

---

### QUESTION 59: Casestudy — S3 Data Leak Discovery (Very Hard - Casestudy)

**question_id:** QOR-AWS-059
**skill_id:** senior-aws-059
**sub_skill_id:** s3-leak-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Security researcher emails: a publicly-accessible S3 bucket with 2M customer records (names, emails, partial addresses) in your AWS account. Walk through investigation, response, customer comms, and prevention. (Limit: 800 words.)

**answer_key:**

**Minute 0-15 — orient + contain.**

1. Confirm bucket exists; verify access (curl/aws s3 ls without creds).
2. **Block public access** immediately: `aws s3api put-public-access-block` (block_public_acls=true, ignore_public_acls=true, block_public_policy=true, restrict_public_buckets=true). Plus update bucket policy to remove public Allow.
3. Mark Sev-1; convene IR team (CISO, Legal, Comms).

**Minute 15-60 — assess scope.**

- **Access logs**: enable S3 access logging if not on; check past CloudTrail data events for `GetObject` on the bucket — count distinct source IPs / time range.
- **Server access log** OR S3 Inventory + CloudTrail-derived access timeline.
- Determine: how long was it public? Who accessed? What objects?
- If logging wasn't on prior to incident: assume worst case = all 2M records exposed since first reported ingest.

**Day 1 — formal response.**

- **Notify regulators** within SLA: GDPR 72h, DPDPA Data Protection Board, US state breach laws.
- **Customer notification** if PII confirmed accessed: written notice within statutory window; offer credit monitoring if applicable.
- **External legal counsel**: confirm reporting obligations + customer comms.
- **Statuspage**: factual, no minimization.

**Day 2-7 — prevention + audit.**

- **Org-wide S3 audit**: `aws s3 ls --recursive` cross-account via Org-level scan; find any other publicly accessible buckets. Tools: AWS Config conformance pack, Trusted Advisor, AWS Macie (PII discovery), Prowler / scout suite.
- **SCPs**: deploy "deny S3 PublicAccessBlock=false" + "deny PutBucketPolicy that allows Principal:*" at OU level. Ensures no bucket can ever be re-made public.
- **Access Analyzer** for S3: continuous detection of unintended public access.
- **Default Block Public Access** at Account level: enable.
- **AWS Macie** scans for PII in all buckets; alerts on unprotected PII.
- **CI gate**: any IaC (Terraform/CDK) with `acl=public-read` blocked in PR.

**Root cause analysis.**

Most common: developer set bucket public for "easy testing"; forgot. OR vendor IaC template with public default. OR legacy bucket from 2018-era when public-by-default was easier to misconfigure. Five-Whys leads to: missing org-level guardrail (which we now add).

**Customer trust rebuild.**

- Public statement: what happened, what data, what we're doing.
- Customer outreach + credit monitoring offer where applicable.
- Quarterly transparency report on security posture.

**Process improvements.**

1. SCPs in OU prevent recurrence (mandatory).
2. AWS Macie ongoing PII scan + alarm.
3. Access Analyzer for S3 ongoing.
4. CI policy: IaC must include explicit `block_public_access` resource.
5. Quarterly bucket audit + report to security committee.
6. Tabletop exercise quarterly: simulated S3 leak + measure response time.

**Forensic preservation.**

- Snapshot bucket access logs to a separate immutable account.
- Preserve CloudTrail logs (7 year retention).
- Document chain of custody for any legal proceedings.

**Lessons.**

- **Default-deny is the only safe S3 posture.** Public access requires deliberate, audited override.
- **Macie + Access Analyzer + SCPs** = layered defense. Single layer always fails.
- **Logging from day 1** is the difference between "we know what was accessed" and "we assume worst case." Worst case is always more painful.
- **Process rigor** (CI gates, mandatory IaC patterns) prevents recurrence; engineer training alone doesn't.

**Cost.**

- Immediate IR: legal + comms + investigation: ~$200-500K.
- Ongoing prevention tooling: Macie + Access Analyzer + Config: ~$50K/year.
- Brand impact (customer churn, share-price): $-vary by company, usually 5-25% of incident-year revenue.
- ROI of prevention: typically 100-1000x.

**rubric:** 25-pt: immediate Block Public Access (4) + scope assessment via CloudTrail (4) + regulator + customer notification timing (3) + Org-wide audit + Macie + Access Analyzer (4) + SCPs as structural fix (4) + CI gate for IaC (2) + tabletop exercise (2) + forensic preservation (2).

**watermark_seed:** qorium-aws-v0.6-059-seed-3c2a4e8b
**variant_seed:** qorium-aws-v0.6-2026-05-08-059
**bias_check_notes:** No bias.

---

### QUESTION 60: Casestudy — Cost Spike from Data Transfer (Very Hard - Casestudy)

**question_id:** QOR-AWS-060
**skill_id:** senior-aws-060
**sub_skill_id:** data-transfer-cost
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored; AWS Cost docs

**body:** AWS bill jumped $80K/mo in the past 30 days; investigation shows 'Data Transfer' line item is the culprit. Plan diagnosis + remediation. (Limit: 800 words.)

**answer_key:**

**Step 1 — diagnose by source.**

AWS data transfer is multiple sub-line items, each with different unit cost:
- **Inter-AZ**: $0.01/GB (often the biggest hidden offender at scale).
- **NAT Gateway egress**: $0.045/GB + $0.045/hr for the NAT itself.
- **VPC Peering**: $0.01/GB intra-region; $0.02/GB inter-region.
- **Internet egress**: $0.05-0.09/GB depending on destination.
- **Inter-region**: $0.02/GB + destination egress.

In CUR (Cost & Usage Report) or Cost Explorer, group by `Operation` + `Resource ID` to identify top contributors.

**Step 2 — common root causes.**

1. **Cross-AZ chatter** (most common): app calls service in different AZ → $0.01/GB each direction. Microservices with high RPC volume can rack up $K/day. Fix: pin replicas same-AZ via topology constraints; use AZ-local routing.
2. **NAT Gateway abuse**: private-subnet apps calling AWS APIs (S3, SQS, DynamoDB) via NAT → $0.045/GB. Fix: VPC Endpoints (free for Gateway endpoints S3/DDB; small per-ENI for Interface).
3. **Excessive cross-region replication** (S3 CRR, DR): kicks in at scale.
4. **CloudFront → origin**: if cache hit ratio low, every miss is back-to-origin egress.
5. **Egress from EC2 to internet**: large API responses, video streaming, broken pagination retrying.
6. **VPC Peering vs Transit Gateway**: TGW adds per-GB on top.

**Step 3 — specific investigation.**

- VPC Flow Logs for cross-AZ patterns (or `aws ec2 describe-network-interfaces` + per-instance traffic).
- NAT Gateway CloudWatch metrics: BytesOutToDestination per gateway.
- CloudFront cache statistics: hit ratio per path.
- Top egress destinations via CUR `lineItem/UsageType`.

**Step 4 — fix in priority of impact.**

1. **VPC Endpoints** (S3, DDB, SQS, Secrets Manager, ECR, etc.) — often saves 30-60% of NAT egress immediately. Free for S3/DDB; cheap for others.
2. **AZ-local routing**: ALB target group "preserve client IP" + cross-zone load balancing OFF for chatty apps; deploy services with topology spread constraints; for K8s use `topologySpreadConstraints` + `topology.kubernetes.io/zone` aware routing.
3. **CloudFront cache policies**: increase TTL where stale-acceptable; enable compression; verify cacheable headers preserved.
4. **Reduce cross-region replication**: only critical buckets.
5. **NAT Gateway alternatives**: VPC Endpoint for AWS APIs; Egress NAT via cheaper instance types where appropriate.
6. **Compression**: gzip/brotli at ALB / CloudFront; saves egress GB.
7. **API Gateway → backend**: ensure within VPC if possible.

**Step 5 — measure savings.**

- Daily Cost Explorer by Service+Operation; track Data Transfer day-over-day.
- Per-team showback: which team's services moved the most data?
- Set monthly budget alerts ($X above baseline triggers Slack alert).

**Step 6 — long-term prevention.**

- **Architecture review** for every new service: data-flow diagram + cost-per-GB estimate.
- **CUR + Athena queries** monthly to flag drift.
- **OpenCost / Kubecost** for K8s workload cost attribution.
- **Pre-deploy gate**: estimate egress cost via traffic prediction; large new services require cost review.

**Outcome target.**

- $80K/mo overshoot recovery: ~50-70% reduction in 4-6 weeks (typical, mostly from VPC Endpoints + AZ pinning).
- Recurring savings: $40-60K/mo.

**Lessons.**

- Data transfer is THE most-overlooked AWS cost line. Most teams notice it only when it hits $K/day.
- VPC Endpoints + AZ-local routing + cache discipline are 80% of the answer.
- Architecture-time review is cheaper than retrofit.
- Many teams ship microservices without thinking about cross-AZ cost; it adds up at 50K req/sec.

**Communication.**

- CFO: "$80K monthly overshoot identified; $50K recoverable in 4 weeks."
- Engineering: "Here's the breakdown by service. Each owner has a fix list."
- Continuous showback dashboard so team sees its number.

**rubric:** 25-pt: diagnose by sub-line-item (4) + cross-AZ root cause (3) + NAT GW + VPC Endpoint fix (4) + CloudFront cache improvements (2) + AZ-local routing strategy (3) + per-team showback (2) + architecture-review prevention (3) + CUR + Athena monthly query (2) + measurable savings target (2).

**watermark_seed:** qorium-aws-v0.6-060-seed-7c2a8e4b
**variant_seed:** qorium-aws-v0.6-2026-05-08-060
**bias_check_notes:** No bias.

---

## End AWS 041-060.

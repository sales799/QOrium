# Wave 1 Extension: Senior AWS (QOR-AWS-061..080)

**STATUS:** AI-drafted v0.6 EXTENSION. SME Lead validation pending.

## 20 NEW Questions (QOR-AWS-061..080)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 61: EBS gp3 vs gp2 (Easy)

**question_id:** QOR-AWS-061
**skill_id:** senior-aws-061
**sub_skill_id:** ebs-gp3
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** AWS EBS docs

**body:** Choose default EBS volume type:

**options:**
- A) gp2
- B) **gp3** — 20% cheaper than gp2 baseline; 3000 IOPS / 125 MB/s baseline included; provisioned IOPS / throughput sold separately. Modern default. gp2 IOPS scales with size (3 IOPS/GB) — pay for capacity to get IOPS. io2 Block Express for >64K IOPS / sub-ms
- C) Magnetic
- D) io1

**answer_key:** B — gp3 default since 2020; cheaper + more flexible. Reference: EBS docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-061-seed-2c8a4e9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-061
**bias_check_notes:** No bias.

---

### QUESTION 62: CloudFormation vs CDK vs Terraform (Easy)

**question_id:** QOR-AWS-062
**skill_id:** senior-aws-062
**sub_skill_id:** iac-choice
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** AWS IaC Docs

**body:** IaC choice for AWS:

**options:**
- A) Always CloudFormation
- B) **CDK (TypeScript/Python)** — typed, programmatic; synthesizes to CloudFormation; great for AWS-native + complex logic. **Terraform** — multi-cloud, mature, larger community; HCL DSL. **CloudFormation** — declarative YAML/JSON; tight AWS integration. **Pulumi** — like CDK + multi-cloud. Pick by team skills + cloud strategy. Avoid raw CFN for new code; CDK or Terraform preferred
- C) Click console
- D) Bash

**answer_key:** B — IaC choice trade-offs. References: AWS IaC docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-062-seed-9b3e8c4a
**variant_seed:** qorium-aws-v0.6-2026-05-08-062
**bias_check_notes:** No bias.

---

### QUESTION 63: AWS Config (Easy)

**question_id:** QOR-AWS-063
**skill_id:** senior-aws-063
**sub_skill_id:** aws-config
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** AWS Config docs

**body:** AWS Config purpose:

**options:**
- A) Pricing tool
- B) **Continuously records resource configuration changes** + evaluates against rules (managed + custom). Use for: "S3 bucket has encryption enabled" / "RDS public-access disabled" / "EC2 has tag X" — drift detection + compliance audit. Conformance Packs bundle rules per framework (HIPAA, PCI, NIST). Auto-remediation via SSM Automation
- C) Pricing
- D) DNS

**answer_key:** B — AWS Config is the compliance + drift-detection layer. References: AWS Config docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-063-seed-3a8c5e7b
**variant_seed:** qorium-aws-v0.6-2026-05-08-063
**bias_check_notes:** No bias.

---

### QUESTION 64: API Gateway REST vs HTTP (Medium)

**question_id:** QOR-AWS-064
**skill_id:** senior-aws-064
**sub_skill_id:** api-gw-types
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AWS API Gateway docs

**body:** API Gateway REST vs HTTP API:

**options:**
- A) Same
- B) **HTTP API** — newer, ~70% cheaper, lower latency, JWT auth built-in, no transformations. **REST API** — full feature: Mapping Templates, Request Validation, API Keys, Usage Plans, WebSocket, more granular auth. Pick HTTP for simple lambda-fronting; REST when transformations + WebSocket + rate-limited keys needed
- C) REST is faster
- D) HTTP deprecated

**answer_key:** B — Pick by feature need; HTTP for simple, REST for advanced. Reference: AWS API GW docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-064-seed-7e3c8a2b
**variant_seed:** qorium-aws-v0.6-2026-05-08-064
**bias_check_notes:** No bias.

---

### QUESTION 65: EKS vs ECS Fargate (Medium)

**question_id:** QOR-AWS-065
**skill_id:** senior-aws-065
**sub_skill_id:** eks-vs-ecs
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS EKS + ECS docs

**body:** EKS vs ECS choice:

**options:**
- A) Always EKS
- B) **EKS (managed K8s)** — portable, vast ecosystem (Helm, Argo CD, operators), team needs K8s skills. **ECS (AWS-native)** — simpler, tight AWS integration, lower ops burden. Both support Fargate. Pick EKS if team has K8s skills + multi-cloud strategy; ECS otherwise. EKS Auto-Mode (re:Invent 2024) reduces operational burden significantly
- C) ECS deprecated
- D) Same

**answer_key:** B — Container orchestration choice. References: AWS docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-065-seed-2d8e5c9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-065
**bias_check_notes:** No bias.

---

### QUESTION 66: SQS Visibility Timeout (Medium)

**question_id:** QOR-AWS-066
**skill_id:** senior-aws-066
**sub_skill_id:** sqs-visibility
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS SQS docs

**body:** SQS Visibility Timeout — purpose + tuning:

**options:**
- A) Random
- B) **After consumer receives a message, hidden from others for VT seconds. Consumer must ChangeMessageVisibility (extend) or DeleteMessage (commit) before VT expires; otherwise message reappears for retry**. Tune: longer than max processing time × 2-3 (safety margin); too short → duplicate processing; too long → slow retry on crash. Plus: DLQ after `maxReceiveCount` for poison pills
- C) Random delay
- D) Always 30s

**answer_key:** B — VT + DLQ are the SQS reliability primitives. Reference: SQS docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-066-seed-9c4e8a3b
**variant_seed:** qorium-aws-v0.6-2026-05-08-066
**bias_check_notes:** No bias.

---

### QUESTION 67: Aurora Global Database (Medium)

**question_id:** QOR-AWS-067
**skill_id:** senior-aws-067
**sub_skill_id:** aurora-global
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Aurora Global docs

**body:** Cross-region DR for Aurora at sub-second RPO:

**options:**
- A) Manual snapshot
- B) **Aurora Global Database** — cross-region async replication via Aurora storage layer (NOT logical); typical replication lag <1s; one writer in primary region + read-only replicas in up to 5 secondary regions. Failover: promote secondary to primary in <1 min. RPO < 1s, RTO < 1 min. Read traffic globally distributed
- C) Cross-region replicas
- D) DMS

**answer_key:** B — Aurora Global is the AWS DR + global-read primitive. Reference: Aurora Global docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-067-seed-4d8c2a9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-067
**bias_check_notes:** No bias.

---

### QUESTION 68: WAF Rules (Medium)

**question_id:** QOR-AWS-068
**skill_id:** senior-aws-068
**sub_skill_id:** waf-rules
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AWS WAF docs

**body:** Public-facing API needs WAF protection:

**options:**
- A) Default rules
- B) **Managed Rule Groups**: AWSManagedRulesCommonRuleSet (OWASP top 10), AWSManagedRulesKnownBadInputsRuleSet, AWSManagedRulesIpReputationList, AWSManagedRulesAmazonIpReputationList. Rate-based rule for brute-force / DDoS at L7. Country block where applicable. Custom rules for app-specific patterns. Test in COUNT mode before BLOCK
- C) IP block only
- D) Skip WAF

**answer_key:** B — Layered WAF rule strategy. References: AWS WAF docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-068-seed-3a7c5b9e
**variant_seed:** qorium-aws-v0.6-2026-05-08-068
**bias_check_notes:** No bias.

---

### QUESTION 69: SES vs SNS for Email (Medium)

**question_id:** QOR-AWS-069
**skill_id:** senior-aws-069
**sub_skill_id:** ses-vs-sns
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AWS SES docs

**body:** Send transactional + marketing emails:

**options:**
- A) SNS for emails
- B) **SES (Simple Email Service)** — purpose-built; supports SMTP/API; bounce + complaint handling via SNS; verified domains/identities; deliverability features (DKIM, SPF, DMARC, dedicated IP, configuration sets, suppression lists). **SNS** = pub/sub + push notifications, NOT email-deliverability optimized. Marketing high-volume: SES + Pinpoint for analytics
- C) Email is gone
- D) Use Gmail API

**answer_key:** B — SES for email; SNS for notifications. References: AWS SES docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-069-seed-7c4a8e3b
**variant_seed:** qorium-aws-v0.6-2026-05-08-069
**bias_check_notes:** No bias.

---

### QUESTION 70: AWS PrivateLink (Medium)

**question_id:** QOR-AWS-070
**skill_id:** senior-aws-070
**sub_skill_id:** privatelink
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** AWS PrivateLink docs

**body:** Expose service to other AWS accounts WITHOUT public internet:

**options:**
- A) ALB public + IP allowlist
- B) **PrivateLink** — service producer creates Endpoint Service backed by NLB; consumers create VPC Endpoint targeting it. Traffic stays on AWS backbone; no peering, no IGW; cross-VPC + cross-account; uni-directional (consumer → producer). Modern multi-tenant SaaS expose admin API via PrivateLink for enterprise customers
- C) Public NLB
- D) VPN

**answer_key:** B — PrivateLink is the inter-VPC private connectivity primitive. Reference: AWS PrivateLink docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-070-seed-9b3a8e4c
**variant_seed:** qorium-aws-v0.6-2026-05-08-070
**bias_check_notes:** No bias.

---

### QUESTION 71: Cognito User Pools vs Identity Pools (Medium)

**question_id:** QOR-AWS-071
**skill_id:** senior-aws-071
**sub_skill_id:** cognito-pools
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** AWS Cognito docs

**body:** User Pool vs Identity Pool:

**options:**
- A) Same
- B) **User Pool** = managed user directory (sign-up, sign-in, password reset, MFA); issues JWT tokens. **Identity Pool (Federated Identities)** = exchanges JWT/OAuth2 token for temporary AWS credentials so client can call AWS APIs directly (S3 upload, AppSync). Use User Pool for app auth; Identity Pool to grant per-user AWS-API access
- C) Pools deprecated
- D) Identity Pool only

**answer_key:** B — Two distinct Cognito features for distinct needs. References: AWS Cognito docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aws-v0.6-071-seed-2c8a4e9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-071
**bias_check_notes:** No bias.

---

### QUESTION 72: Code — CDK Stack for Lambda + API GW (Hard - Code)

**question_id:** QOR-AWS-072
**skill_id:** senior-aws-072
**sub_skill_id:** cdk-stack
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** AWS CDK docs

**body:** Write CDK (TypeScript) stack for Lambda + HTTP API + DynamoDB table + IAM least-privilege.

**options:** []

**answer_key:**

```ts
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class OrdersStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new ddb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'pk', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      encryption: ddb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'ttl',
    });

    const fn = new nodejs.NodejsFunction(this, 'OrdersFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdk.Duration.seconds(10),
      environment: { ORDERS_TABLE: table.tableName },
      logRetention: 14 as any,    // logs.RetentionDays.TWO_WEEKS
      tracing: lambda.Tracing.ACTIVE,
      bundling: { minify: true, sourceMap: true },
    });

    // least-privilege: only what fn needs
    table.grantReadWriteData(fn);

    const api = new apigw.HttpApi(this, 'OrdersApi', {
      corsPreflight: {
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowOrigins: ['https://example.com'],
      },
    });

    api.addRoutes({
      path: '/orders',
      methods: [apigw.HttpMethod.POST, apigw.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('OrdersIntegration', fn),
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.apiEndpoint });
  }
}
```

Key points: PAY_PER_REQUEST table; PITR + encryption; ARM Graviton runtime (20% cheaper); X-Ray tracing on; least-privilege IAM via `grantReadWriteData` (CDK auto-generates exactly the actions needed); HTTP API (cheaper than REST); CfnOutput for API URL. Reference: AWS CDK docs.

**rubric:** 12-pt: PAY_PER_REQUEST + PITR + encryption (3) + ARM Graviton + X-Ray + log retention (3) + least-privilege via grant method (3) + HTTP API w/ CORS (2) + CfnOutput (1).

**watermark_seed:** qorium-aws-v0.6-072-seed-7e3c8a4b
**variant_seed:** qorium-aws-v0.6-2026-05-08-072
**bias_check_notes:** No bias.

---

### QUESTION 73: Code — IAM Policy Least-Privilege (Hard - Code)

**question_id:** QOR-AWS-073
**skill_id:** senior-aws-073
**sub_skill_id:** iam-least-privilege
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** AWS IAM docs

**body:** Write IAM policy granting a Lambda role: read from one S3 bucket prefix, write to one DynamoDB table, write CloudWatch logs. Apply least-privilege.

**options:** []

**answer_key:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ReadSpecificPrefix",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::acme-orders-prod",
        "arn:aws:s3:::acme-orders-prod/inbox/*"
      ],
      "Condition": {
        "StringLike": { "s3:prefix": "inbox/*" }
      }
    },
    {
      "Sid": "DynamoDBWriteOrdersTableOnly",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem"],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Orders",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${aws:userid}"]
        }
      }
    },
    {
      "Sid": "CloudWatchLogsForThisFunction",
      "Effect": "Allow",
      "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/orders-fn:*"
    }
  ]
}
```

Key points: Resources as ARNs (NOT `*`); s3:prefix condition narrows to single prefix; DynamoDB row-level via `LeadingKeys` (limits to user-owned partitions); CloudWatch scoped to single function's log group; logs:CreateLogGroup omitted because CDK creates it. Plus: avoid `iam:PassRole *`; use IAM Access Analyzer to validate; periodic IAM review via Access Advisor.

References: AWS IAM Best Practices.

**rubric:** 10-pt: ARN-scoped resources (3) + s3:prefix condition (2) + DynamoDB LeadingKeys row-level (2) + CloudWatch log-group scope (2) + sid + structured policy (1).

**watermark_seed:** qorium-aws-v0.6-073-seed-3a8c5e2b
**variant_seed:** qorium-aws-v0.6-2026-05-08-073
**bias_check_notes:** No bias.

---

### QUESTION 74: AWS Outposts / Hybrid (Hard)

**question_id:** QOR-AWS-074
**skill_id:** senior-aws-074
**sub_skill_id:** outposts
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** AWS Outposts docs

**body:** AWS Outposts when:

**options:**
- A) Always cheaper
- B) **On-prem AWS hardware** — same APIs as cloud; for ultra-low latency to on-prem systems, data residency requirements, or extending VPC into datacenter. Trade-offs: 3-year minimum commitment, $-significant ($K-100K+), still tied to AWS region. Use only with hard requirement; cloud-native is cheaper + more flexible
- C) Replace cloud
- D) Only US

**answer_key:** B — Outposts for genuine hybrid needs only. Reference: AWS Outposts docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aws-v0.6-074-seed-9c4a8e3b
**variant_seed:** qorium-aws-v0.6-2026-05-08-074
**bias_check_notes:** No bias.

---

### QUESTION 75: GuardDuty + Security Hub (Hard)

**question_id:** QOR-AWS-075
**skill_id:** senior-aws-075
**sub_skill_id:** guardduty-securityhub
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AWS Security docs

**body:** Threat-detection stack on AWS:

**options:**
- A) Manual log review
- B) **GuardDuty** — ML-based threat detection from VPC flow logs, CloudTrail, DNS logs (no agents). Findings: cryptomining, exfiltration, brute force, anomalous API calls. **Security Hub** — central pane consolidating GuardDuty + Inspector + Macie + Config + IAM Access Analyzer + 3rd-party. Apply across Org via delegated admin account
- C) Disable
- D) Manual

**answer_key:** B — GuardDuty + Security Hub is the AWS-native security stack. References: AWS Security docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aws-v0.6-075-seed-2c8a4e7b
**variant_seed:** qorium-aws-v0.6-2026-05-08-075
**bias_check_notes:** No bias.

---

### QUESTION 76: Cross-Account Access Pattern (Hard)

**question_id:** QOR-AWS-076
**skill_id:** senior-aws-076
**sub_skill_id:** cross-account-role
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** AWS IAM docs

**body:** Service in Account-A reads from S3 in Account-B:

**options:**
- A) Share root credentials
- B) **Account-A role + Account-B bucket policy**: bucket policy in Account-B allows Account-A's role principal; A's service assumes its own role (default). OR for complex cases: A's service assumes role in Account-B via `sts:AssumeRole`; Account-B's role trusts Account-A. Use ExternalId for vendor scenarios. NEVER cross-account static credentials
- C) IAM user
- D) Public bucket

**answer_key:** B — Cross-account role + resource policy is canonical. Reference: AWS IAM docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aws-v0.6-076-seed-7e3c8a4b
**variant_seed:** qorium-aws-v0.6-2026-05-08-076
**bias_check_notes:** No bias.

---

### QUESTION 77: Design — Serverless Microservices (Hard - Design)

**question_id:** QOR-AWS-077
**skill_id:** senior-aws-077
**sub_skill_id:** serverless-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** AWS Well-Architected Serverless

**body:** Design serverless microservices for a SaaS handling 1K-50K req/sec spiky traffic, 12 services, multi-tenant. Cover: compute, data, integration, observability, deploy, cost. (Limit: 800 words.)

**answer_key:**

**Stack: Lambda + API Gateway + DynamoDB + EventBridge + Step Functions; CDK for IaC.**

**Compute.** 12 Lambda functions (one per microservice). Provisioned Concurrency on hot paths (login, order). Reserved Concurrency to bound max parallelism per function (prevents one runaway from consuming the whole account quota). ARM Graviton.

**Data.** DynamoDB primary store; one table per microservice; on-demand mode for unpredictable spikes. Per-tenant partition keys (`pk = TENANT#${tenantId}#...`). PITR on. Aurora Serverless v2 only for relational needs (reporting service).

**Multi-tenancy.** Tenant ID in JWT claim → propagated through every Lambda invocation. Per-tenant rate limits at API Gateway (Usage Plans). DynamoDB IAM policies restrict per-tenant data via `LeadingKeys` condition on `aws:userid`. Cost attribution per tenant via dimensional CloudWatch metrics.

**API.** API Gateway HTTP API per service (cheaper than REST); JWT authorizer with Cognito User Pool. Custom domain per environment. Caching where stale-acceptable.

**Integration / async.**
- **EventBridge** as event bus; services publish domain events (`OrderCreated`, `PaymentProcessed`); other services subscribe via rules. Decouples services.
- **Step Functions** for sagas (multi-step flows with compensation).
- **SQS** for queue-and-retry between services.
- **DynamoDB Streams** for change-data-capture; Lambda triggers on stream.

**Observability.**
- CloudWatch metrics + X-Ray traces per Lambda.
- OpenTelemetry SDK for app spans + custom metrics.
- Centralized log aggregation: CloudWatch → Kinesis Firehose → S3 → Athena.
- Per-service alarms on p99 latency + error rate.
- Multi-burn-rate SLO alerts.

**Deploy.**
- CDK stacks per service.
- CI: GitHub Actions; on PR runs unit tests + cdk diff; on merge runs cdk deploy to dev.
- Blue/green via Lambda Aliases + CodeDeploy with canary (10% → 100% over 10 min).
- Auto-rollback on alarm.

**Security.**
- Least-privilege IAM per Lambda role.
- KMS CMK per service.
- Secrets Manager for tokens; rotation enabled.
- WAF on API Gateway.
- VPC only for services that need RDS access; public Lambda otherwise (cheaper, no NAT).

**Cost target.**
- 1K req/sec baseline: ~$2-5K/mo.
- 50K req/sec peak: ~$15-30K/mo.
- Serverless typically 30-60% cheaper than equivalent EKS at this volume + spike pattern.

**Game-day.**
- Lambda quota limit hit: verify Reserved Concurrency limits + circuit breaker prevents cascade.
- DynamoDB throttle: verify exponential backoff + DLQ.

**Trade-offs.**
- Vendor lock-in higher than container-based.
- Cold starts impact tail latency; Provisioned Concurrency mitigates at $.
- Long-running tasks (>15 min) need Step Functions or Fargate.

**Why serverless here.**
- Spiky 1K-50K traffic = serverless scales naturally; container HPA lags behind.
- 12 microservices = small team; serverless reduces ops burden.
- Multi-tenant cost per tenant easier to attribute.

**Anti-pattern to avoid.**
- One mega-Lambda per microservice doing all routes: hard to test, hard to deploy. One Lambda per route or feature group.
- Sharing DynamoDB tables across services: tight coupling. One table per service.

**rubric:** 18-pt: Lambda + API GW + DDB stack (3) + multi-tenant via JWT + IAM LeadingKeys (3) + EventBridge + Step Functions for integration (3) + per-service CDK + canary deploy (2) + observability w/ multi-burn-rate (2) + per-service IAM + KMS + Secrets (2) + cost framing 30-60% cheaper than EKS (2) + game-day for quota + throttle (1).

**watermark_seed:** qorium-aws-v0.6-077-seed-9b3a8c4e
**variant_seed:** qorium-aws-v0.6-2026-05-08-077
**bias_check_notes:** No bias.

---

### QUESTION 78: Code — Athena Federated Query (Hard - Code)

**question_id:** QOR-AWS-078
**skill_id:** senior-aws-078
**sub_skill_id:** athena-query
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** AWS Athena docs

**body:** Write Athena query against Parquet S3 partitioned by date — get top 10 products by revenue last 7 days.

**options:** []

**answer_key:**

```sql
-- Pre-create external table (once)
CREATE EXTERNAL TABLE IF NOT EXISTS analytics.orders (
  order_id STRING,
  product_id STRING,
  customer_id STRING,
  amount DECIMAL(12,2),
  created_at TIMESTAMP
)
PARTITIONED BY (dt STRING)
STORED AS PARQUET
LOCATION 's3://acme-data-prod/orders/'
TBLPROPERTIES ('parquet.compression'='SNAPPY');

-- (Run periodically) MSCK REPAIR TABLE analytics.orders;
-- OR with AWS Glue crawler on schedule.

-- Query
SELECT product_id,
       COUNT(*) AS orders,
       SUM(amount) AS revenue
FROM   analytics.orders
WHERE  dt BETWEEN date_format(current_date - interval '7' day, '%Y-%m-%d')
              AND date_format(current_date, '%Y-%m-%d')   -- partition pruning
       AND amount IS NOT NULL
GROUP BY product_id
ORDER BY revenue DESC
LIMIT 10;
```

Key points:
- Partition column `dt` (string YYYY-MM-DD) for partition pruning — Athena reads only the 7 partitions.
- Parquet + SNAPPY = column-pruning + compression; query reads only `product_id`, `amount`.
- Cost: Athena = $5 per TB scanned; partition pruning + column projection often saves 10-100x.
- Glue catalog (or `MSCK REPAIR`) keeps partition list current.
- Alternative: Iceberg table for schema evolution + time travel.

References: AWS Athena docs.

**rubric:** 10-pt: external table w/ partition (3) + Parquet + compression (1) + partition pruning in WHERE (3) + projection-only SELECT (2) + cost awareness (1).

**watermark_seed:** qorium-aws-v0.6-078-seed-2d8e4c9b
**variant_seed:** qorium-aws-v0.6-2026-05-08-078
**bias_check_notes:** No bias.

---

### QUESTION 79: Casestudy — Region Outage (Very Hard - Casestudy)

**question_id:** QOR-AWS-079
**skill_id:** senior-aws-079
**sub_skill_id:** region-outage-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** us-east-1 has a major outage; your single-region SaaS is down. Multi-AZ doesn't help. Walk through immediate response, recovery, and architectural changes. (Limit: 800 words.)

**answer_key:**

**Minute 0-15 — confirm + comms.**

- Verify outage via Service Health Dashboard, downforeveryoneorjustme, AWS-published status.
- Statuspage update: factual ("us-east-1 disruption affecting our service; AWS investigating").
- Activate IR; CTO + CEO informed.
- DO NOT panic-failover: most regional incidents resolve within 30-90 min; partial recovery during is the worst case for your team.

**Minute 15-60 — assess damage + start DR if criteria met.**

DR criteria (defined PRE-incident in runbook):
- Outage > 30 min sustained.
- AWS predicts > 2h to recover.
- Critical customer-facing impact (revenue / SLA).

If criteria met:
- Activate DR plan → us-west-2 (or pre-built secondary).
- DR plan should include: Route 53 health-check failover; secondary region pre-warmed; RDS/Aurora cross-region replica promote; S3 CRR-replicated buckets; ECS/EKS fleet pre-provisioned (or warm-spin).
- RTO target: 30-60 min if pre-warmed; 2-4h if cold.
- RPO: depends on replication lag; for Aurora Global ~1s; for async S3 CRR ~15 min.

If under 30 min: WAIT. Avoid the fail-fail (DR activation makes things worse during partial recovery).

**Hour 1-4 — full DR if needed.**

- Customer comms every 15 min.
- Engineering on DR validation: traffic flowing? data writes succeeding? reconciliation log being captured?
- Database: writes go to DR primary; primary region writes (if any in-flight) reconcile post-recovery.

**Hour 4-12 — recovery.**

- AWS recovers us-east-1 → DON'T immediately fail back. DR primary has writes that primary region doesn't have. Plan: drain traffic, reconcile, reverse replication, controlled failback.
- Failback during off-peak; full data integrity check.

**Day 1-7 — post-incident.**

- Customer comms: detailed post-mortem; SLA credits per contract.
- Internal RCA: not "AWS broke" but "what about OUR design failed." DR didn't activate fast enough? Replication lag too high? Customer-facing site had hardcoded us-east-1 endpoints?

**Architectural changes (long-term).**

1. **Active-Active multi-region** for tier-0 services. Aurora Global, DynamoDB Global Tables, S3 CRR. Latency-routed via Route 53. Most of "what could be active-active" can be — at higher cost.
2. **Multi-region deploy pipeline.** Same artifact deployable to multiple regions. CI tested per-region.
3. **DR drill quarterly.** Actually fail over to DR; verify RTO/RPO; find issues before prod.
4. **us-east-1 vs other regions.** us-east-1 is more-frequently-broken; consider primary on us-west-2 for new architectures.
5. **Vendor risk.** Single-cloud single-region risk identified by board; multi-region within AWS is the answer 95% of the time (cheaper than multi-cloud).
6. **Status page on different region**, ideally different cloud (Atlassian Statuspage). A status page that's down too is the worst.
7. **Async / batch jobs** decoupled via SQS+ DLQ persist across region failures more naturally.

**Why "single-region with multi-AZ" wasn't enough.**

- Multi-AZ protects from datacenter failure, not regional service failure.
- AWS regional outages happen ~1-2x/year for major services; data shows us-east-1 is most-frequent.
- 99.99% on a single region is the ceiling. 99.999% requires multi-region.

**Cost trade-off.**

- Active-passive (DR): +20-40% cost; lower RTO.
- Active-active: +50-100% cost; near-zero RTO.
- Multi-region cost is ALWAYS less than the cost of a multi-hour outage for a serious SaaS.

**Lessons.**

- Define DR criteria BEFORE the incident. In the moment, you'll panic-fail-fail.
- Quarterly DR drills are non-negotiable; the only valid test of an untested DR plan is a real outage.
- AWS service health dashboard lags reality by 5-30 minutes; trust your own metrics + customer reports first.
- Most teams discover their DR is broken during a real incident; quarterly drills find it cheaper.
- "Multi-cloud for resilience" is rarely the right answer — multi-region within one cloud is dramatically simpler.

**rubric:** 25-pt: don't panic-failover; verify outage (4) + DR criteria defined pre-incident (3) + activate when criteria met (3) + reconciliation + careful failback (3) + active-active or active-passive architectural fix (4) + quarterly DR drill (3) + cost trade-off framing (2) + statuspage on different infra (2) + key lesson: define DR criteria pre-incident (1).

**watermark_seed:** qorium-aws-v0.6-079-seed-3c2a4e8b
**variant_seed:** qorium-aws-v0.6-2026-05-08-079
**bias_check_notes:** No bias.

---

### QUESTION 80: Casestudy — On-Prem to AWS Migration (Very Hard - Casestudy)

**question_id:** QOR-AWS-080
**skill_id:** senior-aws-080
**sub_skill_id:** datacenter-migration
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored; AWS Migration Hub

**body:** A 15-yr-old company runs 200 servers in 2 datacenters; lease expiry in 18 months forces decision. CTO wants to consider AWS. Plan migration. (Limit: 1000 words.)

**answer_key:**

**TL;DR.** Lift-shift-then-modernize phased migration. 18 months is tight but feasible. Don't refactor everything pre-migration; learn-then-improve.

**Phase 0 (Month 1-2): assessment.**

- Inventory: 200 servers, dependencies (AWS Application Discovery Service / Migration Hub).
- Categorize:
  - Tier-1 critical (~30%): databases, payment, customer-facing.
  - Tier-2 important (~40%): supporting services.
  - Tier-3 batch / infrequent (~30%): nightly jobs, internal tools.
- Map application dependencies (most apps have 5-15 hidden dependencies).
- Cost-benefit: per-app TCO (current vs AWS); identify candidates for retire (10-20% of apps) and refactor (10-20%).

**Phase 1 (Month 2-5): foundation + non-critical.**

- AWS account structure: Org with OU per BU + per-environment accounts (prod / staging / dev / sandbox / shared services).
- Network: Direct Connect or Site-to-Site VPN; Transit Gateway for VPC routing.
- Identity: SSO via existing AD via AWS IAM Identity Center.
- Landing zone: Control Tower for guardrails + SCPs.
- Monitoring + logging baseline.
- **Lift+shift Tier-3** apps first (low risk, learning opportunity). Use AWS MGN (Application Migration Service) for re-host.

**Phase 2 (Month 5-12): Tier-2 + Tier-1 prep.**

- Tier-2 lift+shift via MGN. Some refactor for cloud-native (RDS replaces DBs, S3 replaces NAS).
- Tier-1 prep: data replication via DMS (live), Aurora replicas, S3 staging.
- Run both old + new in parallel; sync state; reconciler.
- DR pattern established: cross-region for critical apps.

**Phase 3 (Month 12-15): Tier-1 cutover.**

- Database cutover with DMS continuous replication. Cutover window: weekend; small business-hours impact.
- Failover traffic via DNS / Route 53 health checks.
- 30-day parallel read; reconcile; cutover writes.

**Phase 4 (Month 15-18): decommission + optimize.**

- Decommission old datacenter.
- Optimize cloud-native: refactor Tier-1 apps gradually (containerize, replace EBS-backed DB with Aurora, replace cron with Step Functions, replace ETL with Glue).
- Right-size: Compute Optimizer + Trusted Advisor; eliminate idle.
- Savings Plans + Reserved Capacity for steady workloads; Spot for batch.

**Risks + mitigations.**

- **Hidden dependencies.** Mitigation: Application Discovery + traffic capture + dependency mapping.
- **Data migration data loss.** Mitigation: DMS continuous replication; checksums; reconciliation; rollback plan tested.
- **Cost overrun (lift+shift is cheaper to plan, more expensive to run on cloud).** Mitigation: defined optimization phase post-migration; budget tracking weekly.
- **Compliance.** Mitigation: per-region data residency (Hyperforce IN, EU); IAM + KMS for data protection; auditor walkthrough early.
- **Skills gap.** Mitigation: AWS training; SI partner for first 6 months; hire 2-3 cloud architects.

**Cost framing.**

- Datacenter renewal: $5M (3-yr lease + capex refresh).
- AWS year 1: ~$3-4M (lift+shift heavy; not optimized).
- AWS year 2 post-optimize: ~$2-3M.
- Net savings: $1-2M/yr ongoing after year 2.
- Plus: better DR, faster delivery, scale-on-demand.

**ROI.**
- 18-month migration cost: ~$3-5M (SI partner + internal + parallel running).
- Year 2+ recurring savings: $1-2M.
- Break-even: ~3 years.

**SI partner.**

- AWS Premier Consulting Partner for first 12 months.
- Knowledge transfer plan: every SI workshop has internal team owning the result.
- After 12 months, internal team owns; SI advisory only.

**Anti-patterns to avoid.**

- "Re-architect everything before migrating." Slows migration; rarely finishes; misses lease deadline.
- "Lift+shift forever." Pay cloud premium without cloud benefits. Plan optimization phase.
- "All teams migrate simultaneously." Coordination chaos; sequence carefully.
- "Use only AWS services." Lock-in concern is real; validate critical-path can be ported within reason.

**Outcome target.**

- 18 months: 100% migrated; old datacenter retired.
- Year 2: 30-40% cost reduction post-optimization.
- DR: cross-region active-passive (was: single-DC).
- Engineering velocity: ~2x faster (CI/CD + IaC).
- Compliance: maintained or improved (auditor sign-off).

**Lessons (from teams that did this).**

- Lift+shift first, modernize later. Don't try to refactor and migrate simultaneously.
- Reserve 20% of project for "discovered dependencies" — always more than you found in inventory.
- DMS is the standard for DB migration; budget 3-6 months for tier-1 DB migration plus reconciliation.
- AWS MGN for re-host is dramatically less work than VM-Ware export → S3 → import.
- Network bandwidth between DC and AWS is often the bottleneck; Direct Connect 10 Gbps minimum.

**rubric:** 25-pt: phased lift+shift+modernize over 18 months (4) + assessment + categorization (3) + AWS landing zone foundation (3) + DMS for DB migration with parallel reconcile (3) + Tier-1 cutover careful sequencing (3) + decommission + post-migration optimize (3) + risks: dependencies, data, cost, skills (3) + SI partner with knowledge transfer (2) + outcome target with measurable metrics (1).

**watermark_seed:** qorium-aws-v0.6-080-seed-7c2a8e4b
**variant_seed:** qorium-aws-v0.6-2026-05-08-080
**bias_check_notes:** No bias.

---

## End AWS 061-080.

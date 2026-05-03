# QOrium — VPS Capacity and Topology Plan v1.0

**Author:** CTO, Talpro Universe  
**Audience:** DevOps, infrastructure team, VP Ops (future), CEO for capacity budget sign-off  
**Date:** May 2, 2026  
**Status:** Phase-1 architecture; ready for VPS provisioning M0-end  
**Related docs:** CTO Architecture v1.0 · Blueprint v1.1

---

## 1. Current State (Hostinger KVM Shared)

QOrium shares a Talpro Universe Hostinger KVM (quad-core, 16GB RAM) alongside other ventures. To be verified via VPS status check before final capacity plan sign-off.

**Assumption for this plan:** Dedicated partition on shared VPS with ~8GB RAM reserved for QOrium. Shared: Nginx (reverse proxy), Postgres primary, Redis, N8N (workflow orchestration), shared monitoring stack.

**To verify before M0-end:**
```
talpro_vps_status          # Confirm: quad-core, 16GB total, available RAM
talpro_pm2_list            # Confirm: no QOrium-app processes yet running
talpro_nginx_status        # Confirm: Nginx is up, Let's Encrypt certs auto-renewing
```

If any status check returns errors or unexpected state, escalate to Talpro CTO immediately.

---

## 2. Phase 1 Capacity Model (M0–M12)

QOrium services in Phase 1:
1. **ReadyBank API** (REST, content search/export)
2. **JD-Forge Service** (real-time generation, 30s SLA)
3. **Stack-Vault Service** (per-customer namespace)
4. **Admin Console** (SME review, customer management)
5. **Customer Web Console** (public-facing question browsing)
6. **Anti-Leak Crawler Worker** (background job, daily/hourly)
7. **BullMQ Job Queue Worker** (async processing)

### Capacity Estimation in 3 Traffic Scenarios

Estimating **sustained request rate** + **peak hourly rate** + **RAM/CPU** for each service. Scenarios:

#### Scenario A: Customer Zero Only (M0–M2)

- **Talpro India internal:** ~100 candidates/day through ReadyBank
- **Sustained:** 50 req/min (ReadyBank search, admin console, crawler background)
- **Peak hourly:** 200 req/min (2x during candidate screening windows)

| Service | Est. RAM (MB) | Est. CPU (%) | Notes |
|---|---|---|---|
| **ReadyBank API** | 200 | 5 | Node.js + Express, connection pool |
| **JD-Forge Service** | 150 | 3 | Idle; no customers yet |
| **Stack-Vault Service** | 100 | 2 | Idle |
| **Admin Console** | 150 | 2 | SME interface, low traffic |
| **Customer Console** | 100 | 1 | Not deployed yet |
| **Anti-Leak Crawler** | 300 | 15 | Daily Serper API + embedding scan (PM2 fork, not cluster) |
| **BullMQ Worker** | 200 | 5 | Async job queue |
| **Postgres** | 1,500 | 10 | Shared across Talpro; QOrium ~300MB working set |
| **Redis** | 500 | 3 | Shared cache/queue |
| **Total QOrium** | **~2.8 GB** | **~45%** | Well within 8GB partition |

#### Scenario B: +5 Logos (Enterprise + Platforms) (M3–M6)

- **Talpro + 3 Enterprise Stack-Vault + 2 Platform API customers**
- **Sustained:** 300 req/min (API calls, SME reviews, JD generations)
- **Peak hourly:** 800 req/min (5x during enterprise hiring windows)

| Service | Est. RAM (MB) | Est. CPU (%) | Notes |
|---|---|---|---|
| **ReadyBank API** | 400 | 15 | Increased customer query volume |
| **JD-Forge Service** | 400 | 12 | Real-time generations; Claude API calls |
| **Stack-Vault Service** | 300 | 8 | 3 enterprise customers, watermarking |
| **Admin Console** | 200 | 5 | More SMEs using concurrently |
| **Customer Console** | 200 | 3 | Early adopters + recruiter tier |
| **Anti-Leak Crawler** | 400 | 20 | Hourly + daily scans; larger question corpus |
| **BullMQ Worker** | 300 | 8 | JD-Forge async processing |
| **Postgres** | 2,000 | 20 | QOrium ~1GB working set; more concurrent queries |
| **Redis** | 800 | 8 | Cache warming, session store |
| **Total QOrium** | **~5.2 GB** | **~99%** | Approaching shared VPS limit; consider migration |

#### Scenario C: +10 Logos (M6–M12 ramp)

- **Talpro + 5 Enterprise + 5 Platform customers**
- **Sustained:** 600 req/min
- **Peak hourly:** 2,000 req/min (recruitment drives, batch JD uploads)

| Service | Est. RAM (MB) | Est. CPU (%) | Notes |
|---|---|---|---|
| **ReadyBank API** | 600 | 25 | Scale to enterprise bulk exports |
| **JD-Forge Service** | 600 | 25 | Multiple concurrent generations |
| **Stack-Vault Service** | 600 | 15 | 5+ enterprise, watermarking at scale |
| **Admin Console** | 300 | 8 | Multiple SME teams |
| **Customer Console** | 300 | 5 | 10+ logos accessing library |
| **Anti-Leak Crawler** | 500 | 25 | Continuous crawl + 40K question corpus |
| **BullMQ Worker** | 500 | 12 | JD-Forge + SME review queue depth |
| **Postgres** | 3,000 | 35 | QOrium ~2GB working set; peak write load |
| **Redis** | 1,200 | 12 | Rate limiting, session store, job queue |
| **Total QOrium** | **~8.0 GB** | **~162%** | EXCEEDS shared VPS; REQUIRES migration |

**Conclusion:** Scenario B (M3–M6) is sustainable on shared VPS with tight monitoring. Scenario C (M6+) requires either:
1. **Dedicated QOrium VPS** (separate Hostinger KVM, ₹200–300/month)
2. **Postgres on managed service** (RDS/DigitalOcean Postgres, freeing 3GB on VPS)
3. **Kubernetes / container scale-out** (Year 2 decision; premature for M0–M6)

---

## 3. Decision Matrix: Shared vs Dedicated VPS vs Hybrid

| Dimension | Shared VPS (Current) | Dedicated VPS | Hybrid (Recommended) |
|---|---|---|---|
| **Phase 1 cost** | ₹0 (sunk) | +₹200/mo | +₹50/mo (managed PG) |
| **Scaling headroom** | Through M6, tight by M9 | To M12 easily | To M12, scalable to M18 |
| **Maintenance burden** | Shared (Talpro ops team) | Solo; requires DevOps | Shared responsibility |
| **Failover / DR** | Talpro-level SLA | DIY backup + restore | Managed DB; DIY apps |
| **Team size required** | None (leverage Talpro) | 0.5 FTE DevOps by M6 | None in Y1; 0.25 FTE by M9 |
| **Capital commitment** | Low | Medium | Low |

**Recommendation:** **Hybrid for Phase 1** — apps on shared Talpro VPS through M6, Postgres on managed service (DigitalOcean Postgres or AWS RDS) from M1-onward.

---

## 4. Recommended Topology: Phase 1 Hybrid Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Internet / CDN                             │
│              Cloudflare DNS + CDN (cache static)                 │
└────────────────┬────────────────────────────────────┬────────────┘
                 │                                    │
                 ▼                                    ▼
        ┌─────────────────────┐        ┌──────────────────────┐
        │   Nginx (Hostinger  │        │  Cloudflare R2       │
        │   Reverse Proxy)    │        │  (S3-compatible      │
        │   Port 80/443       │        │   object storage)    │
        │   TLS termination   │        │  Questions, exports, │
        └──────────┬──────────┘        │  watermark secrets   │
                   │                   └──────────────────────┘
                   │
         ┌─────────┴────────────────────────────┐
         │                                      │
         ▼                                      ▼
    ┌─────────────────────┐          ┌──────────────────┐
    │  PM2 Cluster Mode   │          │  PM2 Fork Mode   │
    │  (Hostinger VPS)    │          │  (Hostinger VPS) │
    │                     │          │                  │
    │  api.qorium.io      │          │  Worker Service  │
    │  ├─ ReadyBank API   │          │  ├─ AntiLeak     │
    │  ├─ JD-Forge API    │          │  │  Crawler      │
    │  ├─ Stack-Vault API │          │  └─ BullMQ       │
    │  ├─ Admin console   │          │     Job Queue    │
    │  └─ Web console     │          │                  │
    │  (cluster: 4 proc)  │          │  (fork: 1 proc)  │
    └──────────┬──────────┘          └────────┬─────────┘
               │                               │
         ┌─────┴──────────────────────────────┴────────┐
         │                                            │
         ▼                                            ▼
    ┌──────────────────────────┐        ┌────────────────────┐
    │  Postgres (managed RDS / │        │  Redis (shared)    │
    │  DO Postgres)            │        │  Hostinger VPS     │
    │  Role: primary           │        │                    │
    │  PITR backups to R2      │        │  Cache, sessions,  │
    │  Daily snapshot 15min RPO│        │  rate-limit,       │
    │  Multi-AZ (if AWS RDS)   │        │  job queue         │
    └──────────────────────────┘        └────────────────────┘
         │
         └──────────── PITR: 15-min RPO to R2 daily backup
         
┌───────────────────────────────────────────────────────────────┐
│  External APIs                                                │
│  ├─ Anthropic API (Claude generation)                        │
│  ├─ Serper.dev (web crawl for anti-leak)                    │
│  ├─ Razorpay (billing)                                       │
│  ├─ Resend (transactional email)                             │
│  └─ MSG91 (SMS OTP for admin)                                │
└───────────────────────────────────────────────────────────────┘
```

### Port Allocation

Cite shared `_shared/PORT_REGISTRY.md` (Talpro Universe standard). Reserve for QOrium:

| Port | Service | Purpose |
|---|---|---|
| **5101** | ReadyBank API | Internal; reverse-proxied via Nginx :443 |
| **5102** | JD-Forge API | Internal; reverse-proxied via Nginx :443 |
| **5103** | Stack-Vault API | Internal; reverse-proxied via Nginx :443 |
| **5104** | Anti-Leak Crawler | Internal; not exposed |
| **5110** | Webhook receiver | Async job callbacks (Serper, Razorpay) |
| **5120** | Internal mgmt** | Metrics, health checks (localhost only) |
| **6379** | Redis | Shared with Talpro (port standard) |
| **5432** | Postgres | Managed service (not on VPS) |

---

## 5. Cost Envelope (Phase 1, monthly ops cost)

Itemized operating costs for Months 1–12:

| Component | Cost/month | Notes | Total Y1 |
|---|---|---|---|
| **Hostinger VPS partition** | ₹0 | Shared with Talpro | ₹0 |
| **DigitalOcean Managed Postgres** | ₹40–60 | 1GB SSD starter, auto-backups, PITR enabled | ₹540–720 |
| **Cloudflare R2 storage** | ₹5–15 | 100GB free quota; Questions + exports + backups | ₹60–180 |
| **Anthropic API usage** | ₹200–500 | Token spend for Claude Opus; wave ramps M1→M12 | ₹3,000–6,000 |
| **Serper.dev API** | ₹50–100 | Web crawl queries for anti-leak; scales with corpus | ₹600–1,200 |
| **Sentry (hobby tier)** | ₹0 | Free for early-stage startups; upgrade to Team ($29/mo) if warranted by M9 | ₹0–200 |
| **Grafana Cloud (free tier)** | ₹0 | Free metrics + logs; upgrade to Standard ($25/mo) by M9 | ₹0–200 |
| **Razorpay (fees)** | ₹0 | % of transactions; not a fixed cost | variable |
| **N8N orchestration** | ₹0 | Shared across Talpro ventures | ₹0 |
| **Resend email service** | ₹0 | Free tier (100 emails/month); upgrade if needed | ₹0–500 |
| **Judge0 sandbox** | ₹0 | Self-hosted Docker on VPS or free tier API | ₹0 |
| **Monitoring + alerts** | ₹0 | Talpro Sentinel integration | ₹0 |
| **SSL certs (Let's Encrypt)** | ₹0 | Auto-renewal via Nginx | ₹0 |
| **DNS (Route 53 or Cloudflare)** | ₹0–50 | Shared with Talpro; minimal QOrium overhead | ₹0–600 |
| **Backup storage (redundancy)** | ₹5–10 | Extra R2 egress for off-site snapshots | ₹60–120 |
| **Sub-total operational** | **₹300–800** | | **₹4,260–10,620** |
| **Contingency (10%)** | **₹30–80** | | **₹420–1,060** |
| **Total Y1 ops budget** | **₹330–880/month** | | **~₹5,000–10,000** |

**Recommendation:** Budget **₹10,000/month** (₹1.2L Y1 total) for ops. This includes all infrastructure, APIs, and 10% contingency for surprises.

---

## 6. DR + Backup Strategy (Phase 1)

### Postgres Backup

- **Automated daily PITR:** DigitalOcean/RDS auto-backup with 15-minute RPO (Recovery Point Objective)
- **Backup retention:** 30 days of continuous point-in-time recovery
- **Weekly off-site snapshot:** Download DigitalOcean backup, store encrypted on Cloudflare R2 (₹0 incremental cost)
- **Tested quarterly:** Restore a production snapshot to a staging database (M3, M6, M9, M12) to verify recoverability

### Redis Backup

- **Persistence:** Redis RDB snapshot to disk on VPS; no separate backup (ephemeral; acceptable to lose)
- **If Redis corruption:** PM2 restart reloads data from Postgres (eventual consistency)

### Object Storage Backup

- **Primary:** Cloudflare R2 (all exports, watermark secrets, user-uploaded files)
- **Redundancy:** Enable R2 cross-region replication to EU region (₹5–10/month extra) by M6

### Code / Config Backup

- **GitHub private repo:** All source code (daily auto-backup via GitHub default)
- **Infrastructure-as-code:** Nginx config + PM2 ecosystem.config.js stored in GitHub private repo; auto-deployed

### Recovery Procedures

**RTO (Recovery Time Objective):** 4 hours (for Postgres; data can be restored within 4 hours of incident)

1. **Database corruption / data loss:** Restore from DigitalOcean PITR to specific point-in-time (10 min)
2. **App service outage:** PM2 restart or redeploy from GitHub (5 min)
3. **VPS full failure:** Spin up new Hostinger KVM, restore Postgres backup, redeploy apps (2 hours)

---

## 7. Migration Plan: Phase 1 → Phase 2 (M6 decision gate)

At **end of M6**, evaluate decision:

- **Option A (stay hybrid):** Postgres on managed service, apps on shared VPS. Works if traffic < Scenario B.
- **Option B (dedicated VPS):** Spin up dedicated Hostinger KVM for QOrium, migrate all apps + Redis. Consider if approaching Scenario C.
- **Option C (cloud migration):** M6 assess AWS Lightsail or Google Cloud Run for auto-scaling. Deferred to M9+ evaluation.

**Default:** Stay with **Option A** through M12 (hybrid). Revisit M6 decision gate based on actual traffic + logos.

---

## 8. Monitoring + Observability Stack (Phase 1)

### Logging (Pino → Grafana Loki)

- All services log in JSON via Pino (structured logging)
- Logs ship to Grafana Cloud Loki via Vector agent (Talpro standard)
- Log retention: 7 days (free tier Grafana)

### Metrics (OpenTelemetry → Grafana)

- Node.js services instrumented with OpenTelemetry SDK
- Key metrics: request latency (p50/p95/p99), error rate, AI generation latency, SME review queue depth, leak detection rate
- Grafana dashboard: "QOrium health" (1 dashboard per service + 1 org-level dashboard)

### Alerting (Sentry + Grafana)

- **Sentry:** Application errors → Slack #qorium-alerts
- **Grafana:** SLA breaches (latency p95 > 2s, error rate > 1%) → Slack alert
- **PagerDuty:** Onboarded M6 when SLAs are formal; escalates critical Sentry errors

### Health Checks

- Ping `/health` endpoint every 10s from talpro_watchdog service
- Auto-restart via PM2 if response != 200
- Monitored in talpro_fleet_health daily

---

## 9. Security Posture (Phase 1)

- **HSTS + CSP headers:** All responses (Nginx config)
- **Rate limiting:** 10 req/sec sustained, 20 burst (Redis-backed)
- **API key auth:** HMAC-SHA256 for customer keys (hashed at rest, salted per Talpro standard)
- **Auth admin:** NextAuth.js OAuth + MSG91 OTP + TOTP MFA
- **Data encryption:** Postgres TLS in-transit (if managed), gitleaks in CI, no secrets in code
- **Secrets management:** Environment variables via .env.local (not version-controlled)

---

## 10. Decision: CEO Sign-off Required

Before VPS provisioning (M0-end), CEO confirms:

- [ ] Hybrid topology (apps on shared VPS + managed Postgres) is approved
- [ ] ₹10,000/month ops budget is allocated
- [ ] Postgres managed service (DigitalOcean or AWS RDS) will be provisioned by M1-week-2
- [ ] DR procedure (weekly snapshots, quarterly restore tests) is owned by ops team
- [ ] Phase 2 migration (M6 decision gate) will be revisited with actual traffic data

---

## 11. Day-1 VPS Provisioning Checklist

Before Month 1 spend:

- [ ] DigitalOcean Postgres cluster provisioned (1GB, auto-backups, daily snapshots to R2)
- [ ] Hostinger VPS ports 5101–5110, 5120 reserved in `PORT_REGISTRY.md`
- [ ] PM2 ecosystem.config.js written with 4 cluster procs (ReadyBank, JD-Forge, Stack-Vault, Admin) + 1 fork proc (AntiLeak)
- [ ] Nginx reverse proxy configured: qorium.io, api.qorium.io, admin.qorium.io, app.qorium.io → ports 5101–5103
- [ ] SSL certificates issued via Let's Encrypt (auto-renewal via certbot)
- [ ] Postgres primary restored from backup template (schema only, no data)
- [ ] Redis cluster joined (shared Talpro Redis)
- [ ] Cloudflare R2 bucket created + credentials in `.env`
- [ ] Sentry project created + DSN in `.env`
- [ ] Grafana Loki endpoint + API key in `.env`
- [ ] Anthropic, Serper.dev, Razorpay API keys in `.env`

---

*End of B1 — VPS Capacity and Topology Plan v1.0. Next: E1 Bosch GCC Warm-Intro Email.*

/**
 * QOrium PM2 Ecosystem Configuration
 * Authored by CTO Office 2026-05-02
 * Lives at: /opt/qorium/ecosystem.config.js
 *
 * Purpose: Define all QOrium application processes managed by PM2
 *
 * Structure:
 *   - 4 services in CLUSTER mode (stateless, rolling restart)
 *   - 1 service in FORK mode (single instance, long-running)
 *
 * Port allocation: 5101–5104 (from B1 VPS Capacity Plan)
 * See _shared/PORT_REGISTRY.md before pm2 start
 *
 * Activation: pm2 start ecosystem.config.js --env production
 * Monitoring: pm2 monit
 * Logs: pm2 logs qorium-api (all services)
 *
 * Health checks: Managed by talpro_watchdog_add (see comments below)
 */

module.exports = {
  apps: [
    /**
     * =====================================================================
     * READYBANK API SERVICE (Cluster Mode)
     * =====================================================================
     * Purpose: Question search, pack generation, export
     * Mode: Cluster (multiple instances for load balancing)
     * Port: 5101 (reverse-proxied via Nginx :443)
     *
     * Watchdog health check:
     *   talpro_watchdog_add \
     *     --app "qorium-api" \
     *     --health_url "http://localhost:5101/health" \
     *     --interval_min 5
     */
    {
      name: 'qorium-api',
      script: './dist/api/server.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5101,

      // Memory management
      max_memory_restart: '768M',
      exp_backoff_restart_delay: 500,

      // Graceful shutdown
      kill_timeout: 30000,
      listen_timeout: 10000,

      // Environment: staging
      env: {
        NODE_ENV: 'staging',
        PORT: 5101,
        SERVICE_NAME: 'qorium-api',
      },

      // Environment: production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5101,
        SERVICE_NAME: 'qorium-api',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        SERPER_API_KEY: process.env.SERPER_API_KEY,
        CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      // Logging
      out_file: '/var/log/pm2/qorium-api-out.log',
      error_file: '/var/log/pm2/qorium-api-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto-restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * JD-FORGE SERVICE (Cluster Mode)
     * =====================================================================
     * Purpose: Real-time JD-based question generation (30s SLA)
     * Mode: Cluster (multiple instances)
     * Port: 5102 (reverse-proxied via Nginx :443)
     *
     * Watchdog health check:
     *   talpro_watchdog_add \
     *     --app "qorium-jd-forge" \
     *     --health_url "http://localhost:5102/health" \
     *     --interval_min 5
     */
    {
      name: 'qorium-jd-forge',
      script: './dist/jd-forge/server.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5102,

      max_memory_restart: '1024M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        PORT: 5102,
        SERVICE_NAME: 'qorium-jd-forge',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 5102,
        SERVICE_NAME: 'qorium-jd-forge',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-jd-forge-out.log',
      error_file: '/var/log/pm2/qorium-jd-forge-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * STACK-VAULT SERVICE (Cluster Mode)
     * =====================================================================
     * Purpose: Per-customer question namespace, watermarking, retrieval
     * Mode: Cluster (multiple instances)
     * Port: 5103 (reverse-proxied via Nginx :443)
     *
     * Watchdog health check:
     *   talpro_watchdog_add \
     *     --app "qorium-stack-vault" \
     *     --health_url "http://localhost:5103/health" \
     *     --interval_min 5
     */
    {
      name: 'qorium-stack-vault',
      script: './dist/stack-vault/server.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5103,

      max_memory_restart: '768M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        PORT: 5103,
        SERVICE_NAME: 'qorium-stack-vault',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 5103,
        SERVICE_NAME: 'qorium-stack-vault',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-stack-vault-out.log',
      error_file: '/var/log/pm2/qorium-stack-vault-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * ADMIN CONSOLE (Cluster Mode)
     * =====================================================================
     * Purpose: Next.js admin web app (SME review, customer management)
     * Mode: Cluster (multiple instances)
     * Port: 5104 (reverse-proxied via Nginx :443 as admin.qorium.io)
     *
     * Watchdog health check:
     *   talpro_watchdog_add \
     *     --app "qorium-admin" \
     *     --health_url "http://localhost:5104/api/health" \
     *     --interval_min 5
     */
    {
      name: 'qorium-admin',
      script: './node_modules/.bin/next',
      args: 'start',
      cwd: './apps/admin',
      instances: 2,
      exec_mode: 'cluster',
      port: 5104,

      max_memory_restart: '768M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,

      env: {
        NODE_ENV: 'staging',
        PORT: 5104,
        SERVICE_NAME: 'qorium-admin',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 5104,
        SERVICE_NAME: 'qorium-admin',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: 'https://admin.qorium.io',
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-admin-out.log',
      error_file: '/var/log/pm2/qorium-admin-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * ANTI-LEAK CRAWLER WORKER (Fork Mode)
     * =====================================================================
     * Purpose: Background scheduled crawl for leaked questions
     *   - Queries Serper.dev for known leak sources
     *   - Embeds question body in semantic search
     *   - Detects high-similarity leaks
     *   - Marks for rotation or dismissal
     *
     * Mode: Fork (single instance; long-running stateful job)
     * Port: None (internal, not exposed)
     * Schedule: Cron — daily restart at 02:00 IST (UTC+5:30 = 20:30 prev day UTC)
     *
     * Watchdog: Not applicable (intentional restarts via cron)
     */
    {
      name: 'qorium-leak-crawler',
      script: './dist/workers/anti-leak-crawler.js',
      instances: 1,
      exec_mode: 'fork',

      max_memory_restart: '768M',
      exp_backoff_restart_delay: 500,

      // Cold restart daily at 02:00 IST (20:30 UTC)
      // Format: "minute hour day month day_of_week"
      cron_restart: '0 2 * * *',

      // Critical: Keep autorestart enabled between cron cycles
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',

      env: {
        NODE_ENV: 'staging',
        SERVICE_NAME: 'qorium-leak-crawler',
      },

      env_production: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'qorium-leak-crawler',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        SERPER_API_KEY: process.env.SERPER_API_KEY,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
        CRAWL_MODE: 'daily',       // daily = full corpus scan; hourly = delta scan
      },

      out_file: '/var/log/pm2/qorium-leak-crawler-out.log',
      error_file: '/var/log/pm2/qorium-leak-crawler-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    /**
     * =====================================================================
     * IRT CALIBRATION PIPELINE (Fork Mode + Daily Cron)
     * =====================================================================
     * Purpose: Nightly 2PL/3PL Item Response Theory parameter estimation
     *   - Loads questions in `calibrating` status with N >= 30 responses
     *   - Fits (a, b) via Newton-Raphson MLE; c per format default
     *   - Detects parameter drift; transitions to `released` or `sme_review`
     *   - Audits every fit attempt to content.calibration_history
     *
     * Mode: Fork (single instance; CPU-bound numerical job)
     * Port: None (internal)
     * Schedule: Cron — daily restart at 03:00 IST, after the leak crawler
     *
     * Spec: infra/IRT-Calibration-Pipeline-v0-Spec.md (CTO Office, 2026-05-02)
     * Constitutional gate: SO-21 (IRT mandatory before release)
     *
     * NOTE: This entry was added by Sprint 1.5 (Stream B autonomous build).
     * Logged as infra/CTO-deltas/CTO-DELTA-b10-irt-calibration-entry.md.
     */
    {
      name: 'qorium-irt-calibration',
      script: './dist/workers/irt-calibration.js',
      instances: 1,
      exec_mode: 'fork',

      max_memory_restart: '1024M',
      exp_backoff_restart_delay: 500,

      // Cold restart daily at 03:00 IST (21:30 UTC) — after leak crawler @ 02:00
      cron_restart: '0 3 * * *',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',

      env: {
        NODE_ENV: 'staging',
        SERVICE_NAME: 'qorium-irt-calibration',
      },

      env_production: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'qorium-irt-calibration',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
        IRT_MIN_RESPONSES: '30',
        IRT_MAX_QUESTIONS_PER_RUN: '1000',
        IRT_MAX_ITERATIONS: '50',
      },

      out_file: '/var/log/pm2/qorium-irt-calibration-out.log',
      error_file: '/var/log/pm2/qorium-irt-calibration-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    /**
     * =====================================================================
     * JUDGE0 ORCHESTRATOR (Fork Mode)
     * =====================================================================
     * Purpose: Sandboxed code execution for coding questions (12 langs +
     *   Apex deferred to v0.1)
     * Mode: Fork (single instance; manages execution + scoring + persistence)
     * Port: 5108 (internal healthcheck only; not exposed via Nginx)
     *
     * Spec: infra/Judge0-Sandbox-Integration-Spec-v0.md (CTO Office, 2026-05-02)
     *
     * v0 deferrals (logged):
     *   - infra/CTO-deltas/CTO-DELTA-judge0-bullmq-deferred.md
     *     (Postgres polling now; BullMQ in Sprint ≥1.7)
     *   - infra/CTO-deltas/CTO-DELTA-judge0-apex-deferred.md
     *     (Salesforce CLI path defers to v0.1 when Wave 2 needs Apex)
     */
    {
      name: 'qorium-judge0-orchestrator',
      script: './dist/workers/judge0-orchestrator.js',
      instances: 1,
      exec_mode: 'fork',

      max_memory_restart: '768M',
      exp_backoff_restart_delay: 500,

      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',

      env: {
        NODE_ENV: 'staging',
        SERVICE_NAME: 'qorium-judge0-orchestrator',
      },

      env_production: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'qorium-judge0-orchestrator',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        JUDGE0_URL: process.env.JUDGE0_URL,
        JUDGE0_AUTH_TOKEN: process.env.JUDGE0_AUTH_TOKEN,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
        JUDGE0_POLL_INTERVAL_MS: '500',
        JUDGE0_POLL_TIMEOUT_MS: '60000',
        JUDGE0_MAX_RESPONSES_PER_RUN: '100',
      },

      out_file: '/var/log/pm2/qorium-judge0-orchestrator-out.log',
      error_file: '/var/log/pm2/qorium-judge0-orchestrator-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    /**
     * =====================================================================
     * TESTFORGE QA PIPELINE ORCHESTRATOR (Fork Mode)
     * =====================================================================
     * Purpose: Coordinator for the 6 QA gates (SME validation,
     *   pre-calibration prior, IRT calibration, bias DIF, anti-leak,
     *   plagiarism benchmark, quality scorecard) per
     *   governance/TestForge-QA-Pipeline-v1.md.
     *
     * Mode: Fork (single instance; coordinator + plagiarism detector
     *   co-located; see CTO-DELTA-testforge-plagiarism-detector-colocated.md)
     * Port: 5110 (internal healthcheck only; not exposed via Nginx)
     *
     * Spec: governance/TestForge-QA-Pipeline-v1.md
     * Constitutional gates: SO-22 (AI plagiarism ≥93% public benchmark),
     *   Article VII Quality Gate (auto-fail on benchmark <93%).
     */
    {
      name: 'qorium-testforge-orchestrator',
      script: './dist/workers/testforge-orchestrator.js',
      instances: 1,
      exec_mode: 'fork',

      max_memory_restart: '768M',
      exp_backoff_restart_delay: 500,

      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',

      env: {
        NODE_ENV: 'staging',
        SERVICE_NAME: 'qorium-testforge-orchestrator',
      },

      env_production: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'qorium-testforge-orchestrator',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
        TESTFORGE_MAX_ITEMS_PER_RUN: '500',
      },

      out_file: '/var/log/pm2/qorium-testforge-orchestrator-out.log',
      error_file: '/var/log/pm2/qorium-testforge-orchestrator-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    /**
     * =====================================================================
     * WEBHOOKS SERVICE (Cluster Mode)
     * =====================================================================
     * Purpose: Outbound webhook subscriptions + signed delivery
     * Mode: Cluster (CRUD plane stateless; delivery worker is fork mode +
     *   BullMQ in v1, deferred per
     *   infra/CTO-deltas/CTO-DELTA-webhooks-bullmq-deferred.md)
     * Port: 5106
     * Spec: infra/Webhooks-Service-v0-Spec.md
     */
    {
      name: 'qorium-webhooks',
      script: './services/webhooks/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5106,

      max_memory_restart: '512M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        WEBHOOKS_PORT: 5106,
        SERVICE_NAME: 'qorium-webhooks',
      },

      env_production: {
        NODE_ENV: 'production',
        WEBHOOKS_PORT: 5106,
        SERVICE_NAME: 'qorium-webhooks',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-webhooks-out.log',
      error_file: '/var/log/pm2/qorium-webhooks-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * SSO SERVICE (Cluster Mode)
     * =====================================================================
     * Purpose: SAML 2.0 + OIDC enterprise authentication
     * Mode: Cluster (stateless; JWT-only sessions in v0)
     * Port: 5107
     * Spec: infra/SSO-SAML-Enterprise-Spec-v0.md
     * Deferred: live IdP wire-up + RS256 KMS keys per
     *   infra/CTO-deltas/CTO-DELTA-sso-idp-credentials-deferred.md
     */
    {
      name: 'qorium-sso',
      script: './services/sso/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5107,

      max_memory_restart: '512M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        SSO_PORT: 5107,
        SERVICE_NAME: 'qorium-sso',
      },

      env_production: {
        NODE_ENV: 'production',
        SSO_PORT: 5107,
        SERVICE_NAME: 'qorium-sso',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        SSO_JWT_SIGNING_SECRET: process.env.SSO_JWT_SIGNING_SECRET,
        SSO_BASE_URL: 'https://api.qorium.io',
        SSO_JWT_AUDIENCE: 'https://app.qorium.io',
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-sso-out.log',
      error_file: '/var/log/pm2/qorium-sso-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * AUDIT LOG SERVICE (Cluster Mode)
     * =====================================================================
     * Purpose: Tenant-scoped read API for audit.events
     * Mode: Cluster (read-only; bulk export deferred per
     *   infra/CTO-deltas/CTO-DELTA-audit-log-naming.md)
     * Port: 5111
     * Spec: infra/Audit-Log-API-Spec-v0.md
     */
    {
      name: 'qorium-audit-log',
      script: './services/audit-log/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5111,

      max_memory_restart: '512M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        AUDIT_LOG_PORT: 5111,
        SERVICE_NAME: 'qorium-audit-log',
      },

      env_production: {
        NODE_ENV: 'production',
        AUDIT_LOG_PORT: 5111,
        SERVICE_NAME: 'qorium-audit-log',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-audit-log-out.log',
      error_file: '/var/log/pm2/qorium-audit-log-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * BILLING SERVICE (Cluster Mode)
     * =====================================================================
     * Purpose: Subscriptions + invoices + Razorpay webhooks
     * Mode: Cluster (2 instances)
     * Port: 5112
     * Spec: infra/Billing-Service-v0-Spec.md
     * Razorpay live wire-up deferred per CTO-DELTA #24.
     */
    {
      name: 'qorium-billing',
      script: './services/billing/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5112,

      max_memory_restart: '512M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        BILLING_PORT: 5112,
        SERVICE_NAME: 'qorium-billing',
      },

      env_production: {
        NODE_ENV: 'production',
        BILLING_PORT: 5112,
        SERVICE_NAME: 'qorium-billing',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
        RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
        BILLING_DEFAULT_GST_BPS: '1800',
        BILLING_DEFAULT_CURRENCY: 'INR',
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-billing-out.log',
      error_file: '/var/log/pm2/qorium-billing-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * API KEY MANAGEMENT (Cluster Mode)
     * =====================================================================
     * Purpose: Issue/revoke/rotate API keys; expose scope catalogue
     * Mode: Cluster (2 instances; stateless once pepper resolved)
     * Port: 5113
     * Spec: infra/D3-Talpro-Internal-API-Key-Spec.md
     */
    {
      name: 'qorium-api-key-mgmt',
      script: './services/api-key-mgmt/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      port: 5113,

      max_memory_restart: '256M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        API_KEY_MGMT_PORT: 5113,
        SERVICE_NAME: 'qorium-api-key-mgmt',
      },

      env_production: {
        NODE_ENV: 'production',
        API_KEY_MGMT_PORT: 5113,
        SERVICE_NAME: 'qorium-api-key-mgmt',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        API_KEY_PEPPER: process.env.API_KEY_PEPPER,
        API_KEY_CUSTOMER_ROTATION_DAYS: '365',
        API_KEY_INTERNAL_ROTATION_DAYS: '180',
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-api-key-mgmt-out.log',
      error_file: '/var/log/pm2/qorium-api-key-mgmt-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * SECRET ROTATION WORKER (Fork Mode + 6h tick)
     * =====================================================================
     */
    {
      name: 'qorium-secret-rotation',
      script: './services/secret-rotation-worker/dist/index.js',
      instances: 1,
      exec_mode: 'fork',

      max_memory_restart: '256M',
      exp_backoff_restart_delay: 500,

      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',

      env: {
        NODE_ENV: 'staging',
        SERVICE_NAME: 'qorium-secret-rotation',
      },

      env_production: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'qorium-secret-rotation',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        SECRET_ROTATION_LOOK_AHEAD_DAYS: '14',
        SECRET_ROTATION_PERFORM: 'false',
        SECRET_ROTATION_TICK_INTERVAL_MS: String(6 * 3_600_000),
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-secret-rotation-out.log',
      error_file: '/var/log/pm2/qorium-secret-rotation-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    /**
     * =====================================================================
     * UPTIME MONITOR (Cluster Mode)
     * =====================================================================
     */
    {
      name: 'qorium-uptime-monitor',
      script: './services/uptime-monitor/dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      port: 5114,

      max_memory_restart: '256M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        UPTIME_PORT: 5114,
        UPTIME_TICK_INTERVAL_MS: '60000',
        SERVICE_NAME: 'qorium-uptime-monitor',
      },

      env_production: {
        NODE_ENV: 'production',
        UPTIME_PORT: 5114,
        UPTIME_TICK_INTERVAL_MS: '60000',
        SERVICE_NAME: 'qorium-uptime-monitor',
        DATABASE_URL: process.env.DATABASE_URL_PROD,
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-uptime-monitor-out.log',
      error_file: '/var/log/pm2/qorium-uptime-monitor-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],

  // ========================================================================
  // PM2 DEPLOY CONFIGURATION (for multi-host deployments)
  // ========================================================================
  deploy: {
    production: {
      user: 'node',
      host: 'api.qorium.io',
      ref: 'origin/main',
      repo: 'git@github.com:qorium/qorium-platform.git',
      path: '/opt/qorium',
      'post-deploy': `
        npm install &&
        npm run build &&
        pm2 reload ecosystem.config.js --env production &&
        pm2 save
      `,
      'pre-deploy-local': 'echo "Deploying to production..."',
    },

    staging: {
      user: 'node',
      host: 'staging.qorium.io',
      ref: 'origin/main',
      repo: 'git@github.com:qorium/qorium-platform.git',
      path: '/opt/qorium-staging',
      'post-deploy': `
        npm install &&
        npm run build &&
        pm2 reload ecosystem.config.js --env staging &&
        pm2 save
      `,
    },
  },
};

/**
 * ========================================================================
 * QUICK START GUIDE
 * ========================================================================
 *
 * 1. Verify ports reserved in _shared/PORT_REGISTRY.md:
 *    5101: qorium-api
 *    5102: qorium-jd-forge
 *    5103: qorium-stack-vault
 *    5104: qorium-admin
 *    5105: qorium-leak-crawler (internal; not exposed)
 *
 * 2. Start all processes (production):
 *    pm2 start ecosystem.config.js --env production
 *
 * 3. Verify all processes running:
 *    pm2 status
 *    pm2 logs
 *
 * 4. Monitor in real-time:
 *    pm2 monit
 *
 * 5. Save PM2 state (auto-start on reboot):
 *    pm2 save
 *    pm2 startup  # Generates system startup script
 *
 * 6. Graceful reload (zero-downtime deploy):
 *    pm2 reload qorium-api --env production
 *
 * 7. View logs:
 *    pm2 logs qorium-api      # All instances, streaming
 *    pm2 logs qorium-api 0    # Instance 0 only
 *    pm2 flush                # Clear all logs
 *
 * 8. Restart single process:
 *    pm2 restart qorium-api
 *
 * 9. Stop all:
 *    pm2 stop all
 *
 * ========================================================================
 * HEALTH CHECK SETUP (Watchdog)
 * ========================================================================
 *
 * Register each service with talpro_watchdog_add for auto-restart on failure:
 *
 *   talpro_watchdog_add \
 *     --app "qorium-api" \
 *     --health_url "http://localhost:5101/health" \
 *     --interval_min 5
 *
 *   talpro_watchdog_add \
 *     --app "qorium-jd-forge" \
 *     --health_url "http://localhost:5102/health" \
 *     --interval_min 5
 *
 *   talpro_watchdog_add \
 *     --app "qorium-stack-vault" \
 *     --health_url "http://localhost:5103/health" \
 *     --interval_min 5
 *
 *   talpro_watchdog_add \
 *     --app "qorium-admin" \
 *     --health_url "http://localhost:5104/api/health" \
 *     --interval_min 5
 *
 * Note: qorium-leak-crawler is intentionally NOT watched (controlled via cron).
 *
 * ========================================================================
 * LOG LOCATIONS
 * ========================================================================
 *
 * All logs written to /var/log/pm2/:
 *
 *   qorium-api-out.log        | stdout from qorium-api (both instances)
 *   qorium-api-err.log        | stderr from qorium-api
 *   qorium-jd-forge-out.log   | stdout from qorium-jd-forge
 *   qorium-jd-forge-err.log   | stderr from qorium-jd-forge
 *   qorium-stack-vault-out.log  | stdout from qorium-stack-vault
 *   qorium-stack-vault-err.log  | stderr from qorium-stack-vault
 *   qorium-admin-out.log      | stdout from Next.js admin
 *   qorium-admin-err.log      | stderr from Next.js admin
 *   qorium-leak-crawler-out.log | stdout from crawler worker
 *   qorium-leak-crawler-err.log | stderr from crawler worker
 *
 * View logs via Grafana Loki (structured JSON) or locally:
 *   tail -f /var/log/pm2/qorium-api-out.log
 *
 * ========================================================================
 * SCALING & TUNING (Year 2+)
 * ========================================================================
 *
 * If load increases (5K→10K req/min), tune per service:
 *
 *   - Increase instances: 2 → 4
 *   - Increase max_memory_restart: 768M → 1024M
 *   - Add dedicated worker VPS (move leak-crawler off main VPS)
 *   - Enable Postgres read replica for ReadyBank queries
 *
 * ========================================================================
 */

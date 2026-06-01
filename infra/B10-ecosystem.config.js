const fs = require('node:fs');

/**
 * QOrium PM2 Ecosystem Configuration
 * Authored by CTO Office 2026-05-02
 * Lives at: /opt/qorium/ecosystem.config.js
 *
 * Purpose: Define all QOrium application processes managed by PM2
 *
 * Structure:
 *   - 4 services in CLUSTER mode (stateless, rolling restart)
 *   - 2 services in FORK mode (chatbot + long-running crawler)
 *
 * Port allocation: 5101–5105 plus 5122 for the buyer-facing chatbot.
 * See _shared/PORT_REGISTRY.md before pm2 start
 *
 * Activation: pm2 start ecosystem.config.js --env production
 * Monitoring: pm2 monit
 * Logs: pm2 logs qorium-api (all services)
 *
 * Health checks: Managed by talpro_watchdog_add (see comments below)
 */

const ROOT_DIR = '/opt/apps/qorium-marketing';
const SECRETS_FILE = '/opt/apps/qorium-marketing/.env.production.local';

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return {};

  return fs
    .readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return env;
      const equals = trimmed.indexOf('=');
      if (equals <= 0) return env;
      const key = trimmed.slice(0, equals).trim();
      const value = trimmed.slice(equals + 1).trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
      return env;
    }, {});
}

const productionEnv = loadEnvFile(SECRETS_FILE);

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
      cwd: ROOT_DIR,
      script: './services/readybank/dist/index.js',
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
        ...productionEnv,
        NODE_ENV: 'production',
        READYBANK_PORT: 5101,
        PORT: 5101,
        SERVICE_NAME: 'qorium-api',
        DATABASE_URL: productionEnv.DATABASE_URL ?? process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        ANTHROPIC_API_KEY: productionEnv.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: productionEnv.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY,
        SERPER_API_KEY: productionEnv.SERPER_API_KEY ?? process.env.SERPER_API_KEY,
        CLOUDFLARE_R2_ACCESS_KEY_ID: productionEnv.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID,
        CLOUDFLARE_R2_SECRET_ACCESS_KEY: productionEnv.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
        SENTRY_DSN: productionEnv.SENTRY_DSN ?? process.env.SENTRY_DSN,
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
     * MARKETING CHATBOT SERVICE (Fork Mode)
     * =====================================================================
     * Purpose: Buyer-facing cited RAG chat, demo qualification, and human
     * escalation for qorium.online.
     * Mode: Fork (single instance; session persistence lives in Postgres)
     * Port: 5122 (server-side proxy from qorium-marketing /api/chatbot/*)
     *
     * Watchdog health check:
     *   talpro_watchdog_add \
     *     --app "qorium-chatbot" \
     *     --health_url "http://localhost:5122/v1/chatbot/health" \
     *     --interval_min 5
     */
    {
      name: 'qorium-chatbot',
      cwd: ROOT_DIR,
      script: './services/chatbot/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      port: 5122,

      max_memory_restart: '512M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'staging',
        CHATBOT_PORT: 5122,
        PORT: 5122,
        SERVICE_NAME: 'qorium-chatbot',
      },

      env_production: {
        ...productionEnv,
        NODE_ENV: 'production',
        CHATBOT_PORT: 5122,
        PORT: 5122,
        SERVICE_NAME: 'qorium-chatbot',
        DATABASE_URL: productionEnv.DATABASE_URL ?? process.env.DATABASE_URL_PROD,
        QORIUM_PUBLIC_BASE_URL: 'https://qorium.online',
        ANTHROPIC_API_KEY: productionEnv.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: productionEnv.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY,
        CHATBOT_LEAD_HMAC_SECRET:
          productionEnv.CHATBOT_LEAD_HMAC_SECRET ?? process.env.CHATBOT_LEAD_HMAC_SECRET,
        CHATBOT_SLACK_WEBHOOK_URL:
          productionEnv.CHATBOT_SLACK_WEBHOOK_URL ?? process.env.CHATBOT_SLACK_WEBHOOK_URL,
        CHATBOT_EMAIL_WEBHOOK_URL:
          productionEnv.CHATBOT_EMAIL_WEBHOOK_URL ?? process.env.CHATBOT_EMAIL_WEBHOOK_URL,
        CHATBOT_SALES_EMAIL_TO:
          productionEnv.CHATBOT_SALES_EMAIL_TO ?? process.env.CHATBOT_SALES_EMAIL_TO,
        CHATBOT_SYSTEM_PROMPT_PATH:
          productionEnv.CHATBOT_SYSTEM_PROMPT_PATH ??
          process.env.CHATBOT_SYSTEM_PROMPT_PATH ??
          `${ROOT_DIR}/services/chatbot/prompts/system.v1.md`,
        LOG_LEVEL: 'info',
      },

      out_file: '/var/log/pm2/qorium-chatbot-out.log',
      error_file: '/var/log/pm2/qorium-chatbot-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },

    /**
     * =====================================================================
     * ANTI-LEAK CRAWLER WORKER (Fork Mode)
     * =====================================================================
     * Purpose: Persistent scheduler for leaked-question scans. The scanner
     * itself is one-shot; this wrapper stays alive under PM2 so successful
     * scans do not look like crash loops.
     *
     * Mode: Fork (single instance; no public port)
     * Schedule: ANTILEAK_SCAN_INTERVAL defaults to 24h. PM2 also performs a
     * daily cold restart at 02:00 UTC to pick up env rotation.
     */
    {
      name: 'qorium-leak-crawler',
      cwd: ROOT_DIR,
      script: './services/anti-leak/dist/worker.js',
      instances: 1,
      exec_mode: 'fork',

      max_memory_restart: '768M',
      exp_backoff_restart_delay: 500,
      cron_restart: '0 2 * * *',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '30s',

      env: {
        NODE_ENV: 'staging',
        SERVICE_NAME: 'qorium-leak-crawler',
        ANTILEAK_PROVIDER: 'mock',
        ANTILEAK_SCAN_INTERVAL: '24h',
      },

      env_production: {
        ...productionEnv,
        NODE_ENV: 'production',
        SERVICE_NAME: 'qorium-leak-crawler',
        DATABASE_URL: productionEnv.DATABASE_URL ?? process.env.DATABASE_URL_PROD,
        REDIS_URL: 'redis://localhost:6379',
        SERPER_API_KEY: productionEnv.SERPER_API_KEY ?? process.env.SERPER_API_KEY,
        ANTHROPIC_API_KEY: productionEnv.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY,
        SENTRY_DSN: productionEnv.SENTRY_DSN ?? process.env.SENTRY_DSN,
        LOG_LEVEL: 'info',
        ANTILEAK_PROVIDER: productionEnv.SERPER_API_KEY ?? process.env.SERPER_API_KEY ? 'serper' : 'mock',
        ANTILEAK_SCAN_INTERVAL: productionEnv.ANTILEAK_SCAN_INTERVAL ?? '24h',
        CRAWL_MODE: 'daily',
      },

      out_file: '/var/log/pm2/qorium-leak-crawler-out.log',
      error_file: '/var/log/pm2/qorium-leak-crawler-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
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
 *    5105: qorium-ats-bridge
 *    5122: qorium-chatbot (server-side proxy only)
 *    qorium-leak-crawler: internal worker, no port
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
 *   talpro_watchdog_add \
 *     --app "qorium-chatbot" \
 *     --health_url "http://localhost:5122/v1/chatbot/health" \
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
 *   qorium-chatbot-out.log    | stdout from marketing chatbot
 *   qorium-chatbot-err.log    | stderr from marketing chatbot
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

// PM2 ecosystem for the qorium-mailer side-deploy.
//
// Runs from /opt/qorium-mailer. Loads its own .env (cwd-relative) so it
// doesn't pick up /opt/qorium/.env by accident. Cluster of 2 to match the
// shape of qorium-api (any single-instance failure is masked by the peer).
//
// Activation:
//   cd /opt/qorium-mailer
//   pm2 start infra/side-deploy/qorium-mailer/ecosystem.cjs
//
// Health check:
//   talpro_watchdog_add --app "qorium-mailer" \
//     --health_url "http://localhost:5102/healthz" --interval_min 5

module.exports = {
  apps: [
    {
      name: 'qorium-mailer',
      cwd: '/opt/qorium-mailer',
      script: './services/readybank/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',

      // Memory ceiling — readybank averages ~60-70 MB per instance.
      max_memory_restart: '512M',
      exp_backoff_restart_delay: 500,

      // Graceful shutdown so in-flight invites complete before SIGKILL.
      kill_timeout: 30000,
      listen_timeout: 10000,

      // Load .env from /opt/qorium-mailer/.env (PM2 doesn't auto-load).
      // We rely on the readybank service code calling dotenv.config() at boot;
      // if that's not the case, prepend the start command with `--env-file`
      // (Node 20+) or use pm2-runtime --env-file.
      env: {
        NODE_ENV: 'production',
        PORT: 5102,
        SERVICE_NAME: 'qorium-mailer',
      },

      // Log files — distinct from qorium-api so they don't get mixed up.
      out_file: '/var/log/pm2/qorium-mailer.out.log',
      error_file: '/var/log/pm2/qorium-mailer.err.log',
      merge_logs: true,
      time: true,
    },
  ],
};

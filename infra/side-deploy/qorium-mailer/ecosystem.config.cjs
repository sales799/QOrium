module.exports = {
  apps: [
    {
      name: 'qorium-mailer',
      cwd: '/opt/qorium-mailer',
      script: './services/readybank/dist/index.js',
      interpreter: 'node',
      interpreter_args: '--env-file=/opt/qorium-mailer/.env',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      exp_backoff_restart_delay: 500,
      kill_timeout: 30000,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 5150,
        SERVICE_NAME: 'qorium-mailer',
      },
      out_file: '/var/log/pm2/qorium-mailer.out.log',
      error_file: '/var/log/pm2/qorium-mailer.err.log',
      merge_logs: true,
      time: true,
    },
  ],
};

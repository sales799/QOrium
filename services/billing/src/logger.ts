import pino, { type Logger } from 'pino';

export function buildLogger(opts: { level?: string; gitSha?: string | undefined } = {}): Logger {
  return pino({
    level: opts.level ?? process.env.LOG_LEVEL ?? 'info',
    base: {
      service: 'qorium-billing',
      git_sha: opts.gitSha ?? process.env.GIT_SHA,
    },
    redact: {
      paths: [
        'DATABASE_URL',
        'RAZORPAY_KEY_SECRET',
        'RAZORPAY_WEBHOOK_SECRET',
        '*.razorpay_webhook_secret',
        '*.payment_provider_signature',
      ],
      remove: true,
    },
  });
}

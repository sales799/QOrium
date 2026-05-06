import pino, { type Logger } from 'pino';

export function buildLogger(opts: { level?: string; gitSha?: string | undefined } = {}): Logger {
  return pino({
    level: opts.level ?? process.env.LOG_LEVEL ?? 'info',
    base: {
      service: 'qorium-sso',
      git_sha: opts.gitSha ?? process.env.GIT_SHA,
    },
    redact: {
      paths: [
        'DATABASE_URL',
        'SSO_JWT_SIGNING_SECRET',
        '*.private_key_pem',
        '*.oidc_client_secret_cipher',
        '*.SAMLResponse',
        '*.assertion',
      ],
      remove: true,
    },
  });
}

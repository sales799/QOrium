export interface Config {
  serviceName: string;
  nodeEnv: 'development' | 'staging' | 'production' | 'test';
  port: number;
  logLevel: string;
  version: string;
  gitSha: string;
  publicBaseUrl: string;
  leadHmacSecret: string | undefined;
  slackWebhookUrl: string | undefined;
  salesEmailTo: string;
  emailWebhookUrl: string | undefined;
  anthropicApiKey: string | undefined;
  anthropicModel: string;
  openaiApiKey: string | undefined;
  openaiModel: string;
  systemPromptPath: string | undefined;
  requestLimitPerMinute: number;
  sessionLimitPerDay: number;
}

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Required environment variable ${name} is missing.`);
}

function parseNodeEnv(raw: string): Config['nodeEnv'] {
  switch (raw) {
    case 'development':
    case 'staging':
    case 'production':
    case 'test':
      return raw;
    default:
      return 'development';
  }
}

function parseInteger(name: string, fallback: string): number {
  const raw = getEnv(name, fallback);
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: ${raw}`);
  }
  return parsed;
}

export function loadConfig(): Config {
  return {
    serviceName: 'qorium-chatbot',
    nodeEnv: parseNodeEnv(getEnv('NODE_ENV', 'development')),
    port: parseInteger('CHATBOT_PORT', getEnv('PORT', '5105')),
    logLevel: getEnv('LOG_LEVEL', 'info'),
    version: getEnv('npm_package_version', '0.0.0'),
    gitSha: getEnv('GIT_SHA', 'unknown'),
    publicBaseUrl: getEnv('QORIUM_PUBLIC_BASE_URL', 'https://qorium.online'),
    leadHmacSecret: process.env.CHATBOT_LEAD_HMAC_SECRET,
    slackWebhookUrl: process.env.CHATBOT_SLACK_WEBHOOK_URL,
    salesEmailTo: getEnv('CHATBOT_SALES_EMAIL_TO', 'sales@qorium.online'),
    emailWebhookUrl: process.env.CHATBOT_EMAIL_WEBHOOK_URL,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicModel: getEnv('CHATBOT_ANTHROPIC_MODEL', 'claude-sonnet-4-6'),
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: getEnv('CHATBOT_OPENAI_MODEL', 'gpt-4o-mini'),
    systemPromptPath: process.env.CHATBOT_SYSTEM_PROMPT_PATH,
    requestLimitPerMinute: parseInteger('CHATBOT_REQUEST_LIMIT_PER_MINUTE', '30'),
    sessionLimitPerDay: parseInteger('CHATBOT_SESSION_LIMIT_PER_DAY', '200'),
  };
}

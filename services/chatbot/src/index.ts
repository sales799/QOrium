import { createServer } from './server.js';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { InMemoryConversationStore } from './store/memory.js';
import { PostgresConversationStore } from './store/postgres.js';
import { InMemoryRetriever, PostgresRetriever } from './rag/retriever.js';
import { defaultCorpusChunks } from './rag/corpus.js';
import { createModelRouter } from './llm/router.js';
import { createPool } from '@qorium/db';
import { createLeadNotifier } from './notify.js';

const config = loadConfig();
const logger = createLogger(config);
const pool = process.env.DATABASE_URL
  ? createPool({ applicationName: 'qorium-chatbot' })
  : undefined;
const fallbackRetriever = new InMemoryRetriever(defaultCorpusChunks);
const { app } = createServer({
  config,
  logger,
  store: pool ? new PostgresConversationStore(pool) : new InMemoryConversationStore(),
  retriever: pool ? new PostgresRetriever(pool, fallbackRetriever) : fallbackRetriever,
  model: createModelRouter(config),
  notifier: createLeadNotifier(config),
});

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'qorium-chatbot listening');
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info({ signal }, 'qorium-chatbot shutting down');
  server.close(() => {
    void pool?.end().finally(() => process.exit(0));
    if (!pool) process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

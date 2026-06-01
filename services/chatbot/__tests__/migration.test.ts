import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = join(process.cwd(), '../../infra/B7-postgres-migrations/0016_chatbot.sql');

describe('chatbot migration', () => {
  it('creates the public chatbot tables and pgvector-backed corpus index', async () => {
    const sql = await readFile(migrationPath, 'utf8');

    expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS vector');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS chatbot_sessions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS chatbot_messages');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS chatbot_leads');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS chatbot_corpus_chunks');
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_chatbot_corpus_chunks_embedding');
  });
});

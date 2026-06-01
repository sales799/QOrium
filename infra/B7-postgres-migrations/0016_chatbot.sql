-- 0016_chatbot.sql
-- C1 Marketing Chatbot: sessions, messages, lead capture, and cited RAG corpus.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL UNIQUE,
  page_path TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  ip_hash TEXT,
  summary_redacted TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content_redacted TEXT NOT NULL,
  intent TEXT,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chatbot_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chatbot_sessions(id) ON DELETE SET NULL,
  email_hash TEXT NOT NULL,
  email_redacted TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  need_redacted TEXT NOT NULL,
  page_path TEXT,
  escalation_status TEXT NOT NULL DEFAULT 'queued'
    CHECK (escalation_status IN ('queued', 'sent', 'failed')),
  escalation_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE TABLE IF NOT EXISTS chatbot_corpus_chunks (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding vector(1536),
  source_kind TEXT NOT NULL DEFAULT 'marketing_page',
  is_shipped_surface BOOLEAN NOT NULL DEFAULT TRUE,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_expires_at
  ON chatbot_sessions (expires_at);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session_created
  ON chatbot_messages (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chatbot_leads_created_at
  ON chatbot_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chatbot_corpus_chunks_url
  ON chatbot_corpus_chunks (url);

CREATE INDEX IF NOT EXISTS idx_chatbot_corpus_chunks_embedding
  ON chatbot_corpus_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100)
  WHERE embedding IS NOT NULL;

COMMENT ON TABLE chatbot_sessions IS 'Buyer-facing marketing chatbot sessions. 90-day retention per DPDP-aligned C1 brief.';
COMMENT ON TABLE chatbot_messages IS 'Redacted chatbot messages with mandatory citation metadata for assistant claims.';
COMMENT ON TABLE chatbot_leads IS 'Redacted demo/human-escalation leads captured by the marketing chatbot.';
COMMENT ON TABLE chatbot_corpus_chunks IS 'Build-time cited RAG corpus from shipped QOrium marketing, trust, and library surfaces.';

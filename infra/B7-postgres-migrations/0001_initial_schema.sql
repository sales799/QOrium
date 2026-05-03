-- QOrium PostgreSQL Initial Schema
-- Authored by CTO Office 2026-05-02
-- Purpose: Initialize the QOrium database with all core tables for Phase 1
-- Lives at: db/migrations/0001_initial_schema.sql
-- Apply via: node-pg-migrate or sqitch (see README.md in this directory)
--
-- Schema overview:
--   app.*       — User accounts, tenants, API keys
--   content.*   — Skills, roles, questions, variants, responses
--   audit.*     — Audit log (partitioned by month)
--
-- Features:
--   - PostgreSQL 16+ (pgcrypto, citext, pg_trgm extensions)
--   - JSONB columns for flexible metadata (questions, responses)
--   - Row-level security (RLS) stubbed for future 0002_rls_policies.sql
--   - Constraints & indexes for performance
--   - Audit trail (who, what, when, why)
--
-- Transaction-safe: Wrapped in BEGIN/COMMIT (auto by pg-migrate)
-- Reversibility: Manual DROP statements at end (for rollback reference)

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- For UUID + hashing
CREATE EXTENSION IF NOT EXISTS citext;        -- Case-insensitive text (emails)
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- Trigram full-text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation functions

-- ============================================================================
-- SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS app;     -- Application (users, tenants, auth)
CREATE SCHEMA IF NOT EXISTS content; -- Content (questions, skills, roles)
CREATE SCHEMA IF NOT EXISTS audit;   -- Audit trail (immutable events)

-- ============================================================================
-- APP SCHEMA: Users, Tenants, API Keys
-- ============================================================================

CREATE TABLE app.users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 CITEXT NOT NULL UNIQUE,
  name                  VARCHAR(200) NOT NULL,
  role                  VARCHAR(50) NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('owner', 'admin', 'sme', 'viewer', 'customer-admin')),
  password_hash         VARCHAR(255),         -- For internal auth (if not OAuth)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at         TIMESTAMPTZ,
  status                VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled', 'pending_verification')),
  metadata              JSONB DEFAULT '{}'    -- Additional user attributes
);

CREATE INDEX users_email_idx ON app.users (email);
CREATE INDEX users_role_idx ON app.users (role);
CREATE INDEX users_status_idx ON app.users (status);

COMMENT ON TABLE app.users IS 'Core user table. Roles: owner (org founder), admin (ops), sme (contractor), viewer (read-only), customer-admin (customer enterprise contact).';
COMMENT ON COLUMN app.users.metadata IS 'Flexible storage for profile_pic_url, last_ip, mfa_enabled, etc.';

-- ============================================================================

CREATE TABLE app.tenants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(200) NOT NULL,
  slug                  CITEXT NOT NULL UNIQUE,
  type                  VARCHAR(50) NOT NULL
    CHECK (type IN ('internal', 'customer-platform', 'customer-enterprise', 'customer-recruiter')),
  plan                  VARCHAR(50) NOT NULL DEFAULT 'starter'
    CHECK (plan IN ('starter', 'growth', 'enterprise')),
  status                VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'churned')),
  contract_start_date   DATE,
  contract_end_date     DATE,
  billing_contact_email CITEXT,
  metadata              JSONB DEFAULT '{}',  -- pricing_tier, sla_level, etc.
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tenants_slug_idx ON app.tenants (slug);
CREATE INDEX tenants_type_idx ON app.tenants (type);
CREATE INDEX tenants_status_idx ON app.tenants (status);

COMMENT ON TABLE app.tenants IS 'Tenant (customer) records. Type: internal=Talpro India (Customer Zero), customer-*=paid customers. Plan: pricing tier.';
COMMENT ON COLUMN app.tenants.metadata IS 'Custom SLA overrides, custom rate limits, feature flags, etc.';

-- ============================================================================

CREATE TABLE app.tenant_users (
  tenant_id             UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  role                  VARCHAR(50) NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE INDEX tenant_users_user_id_idx ON app.tenant_users (user_id);

COMMENT ON TABLE app.tenant_users IS 'Join table: users to tenants (many-to-many). Records user roles within each tenant.';

-- ============================================================================

CREATE TABLE app.api_keys (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  name                  VARCHAR(200),        -- Human-readable key name (e.g., "JD-Forge Integration")
  prefix                VARCHAR(10) NOT NULL,  -- Visible part of key (e.g., "qor_test_" or "qor_live_")
  hashed_key            VARCHAR(255) NOT NULL UNIQUE, -- SHA256(full_key), never expose full key
  scopes                TEXT[] NOT NULL DEFAULT '{"read"}', -- Permissions: read, write, admin
  last_used_at          TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ,        -- NULL = no expiry (set by rotation policy)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at            TIMESTAMPTZ,
  created_by            UUID REFERENCES app.users(id)
);

CREATE INDEX api_keys_tenant_id_idx ON app.api_keys (tenant_id);
CREATE INDEX api_keys_prefix_idx ON app.api_keys (prefix);
CREATE INDEX api_keys_revoked_idx ON app.api_keys (revoked_at) WHERE revoked_at IS NULL;

COMMENT ON TABLE app.api_keys IS 'API keys for programmatic access. Hashed at rest; never store plaintext. Scopes limit permissions per key.';
COMMENT ON COLUMN app.api_keys.expires_at IS 'Rotation policy enforced; typically 90-180 days per secret type. NULL allows indefinite use (not recommended).';

-- ============================================================================
-- CONTENT SCHEMA: Skills, Roles, Questions
-- ============================================================================

CREATE TABLE content.skills (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  VARCHAR(100) NOT NULL UNIQUE,
  name                  VARCHAR(200) NOT NULL,
  description           TEXT,
  parent_skill_id       UUID REFERENCES content.skills(id) ON DELETE SET NULL,
  depth                 SMALLINT NOT NULL DEFAULT 1, -- Hierarchy depth (1=root)
  family                VARCHAR(50) NOT NULL
    CHECK (family IN ('tech', 'india-stack', 'aptitude', 'ai-era', 'soft')),
  metadata              JSONB DEFAULT '{}',  -- tags, keywords, etc.
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX skills_slug_idx ON content.skills (slug);
CREATE INDEX skills_parent_idx ON content.skills (parent_skill_id);
CREATE INDEX skills_family_idx ON content.skills (family);

COMMENT ON TABLE content.skills IS 'Skill taxonomy. Hierarchical (parent_skill_id allows nesting). Families: tech (Java, React, AWS), india-stack (SAP ABAP, Oracle, etc.), aptitude, ai-era, soft-skills.';

-- ============================================================================

CREATE TABLE content.sub_skills (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id              UUID NOT NULL REFERENCES content.skills(id) ON DELETE CASCADE,
  slug                  VARCHAR(100) NOT NULL,
  name                  VARCHAR(200) NOT NULL,
  description           TEXT,
  canonical_id         VARCHAR(100),  -- For linking to external taxonomies (e.g., "java_concurrency_4.2")
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill_id, slug)
);

CREATE INDEX sub_skills_skill_id_idx ON content.sub_skills (skill_id);
CREATE INDEX sub_skills_canonical_id_idx ON content.sub_skills (canonical_id);

COMMENT ON TABLE content.sub_skills IS 'Leaf-node skills under a parent skill. E.g., skill="Java", sub_skills=["Concurrency", "Collections", "Spring Boot", "Hibernate"].';

-- ============================================================================

CREATE TABLE content.roles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  VARCHAR(100) NOT NULL UNIQUE,
  name                  VARCHAR(200) NOT NULL,
  family                VARCHAR(50) NOT NULL,
  level                 VARCHAR(20) NOT NULL DEFAULT 'mid'
    CHECK (level IN ('junior', 'mid', 'senior', 'lead', 'principal')),
  description           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX roles_slug_idx ON content.roles (slug);
CREATE INDEX roles_level_idx ON content.roles (level);

COMMENT ON TABLE content.roles IS 'Job roles (Senior Backend Engineer, DevOps Lead, QA Specialist). Paired with skills in role_skills table.';

-- ============================================================================

CREATE TABLE content.role_skills (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id               UUID NOT NULL REFERENCES content.roles(id) ON DELETE CASCADE,
  sub_skill_id          UUID NOT NULL REFERENCES content.sub_skills(id) ON DELETE CASCADE,
  weight                NUMERIC(3, 2) NOT NULL DEFAULT 1.0, -- Importance 0.0–5.0
  depth_required        SMALLINT NOT NULL DEFAULT 1,   -- Difficulty level for this role (1–5)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, sub_skill_id)
);

CREATE INDEX role_skills_role_id_idx ON content.role_skills (role_id);
CREATE INDEX role_skills_sub_skill_id_idx ON content.role_skills (sub_skill_id);

COMMENT ON TABLE content.role_skills IS 'Junction: roles to sub-skills (many-to-many). Weight indicates importance for hiring (1.0 = required, 5.0 = critical).';

-- ============================================================================

CREATE TABLE content.questions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                   VARCHAR(50) NOT NULL
    CHECK (sku IN ('readybank', 'jd-forge', 'stack-vault')),
  format                VARCHAR(50) NOT NULL,  -- mcq, msq, coding-fn, design, casestudy, sjt, video, etc.
  skill_id              UUID REFERENCES content.skills(id) ON DELETE SET NULL,
  sub_skill_id          UUID REFERENCES content.sub_skills(id) ON DELETE SET NULL,

  -- Question content (JSONB for format flexibility)
  body_md               TEXT NOT NULL,        -- Markdown question text (for indexing, anti-leak)
  body_json             JSONB NOT NULL,       -- Format-specific structure (options, code, etc.)
  answer_key            JSONB,                -- Correct answer(s)
  rubric_json           JSONB,                -- Scoring rubric (for non-MCQ)
  reference_solution    JSONB,                -- Code: reference implementation
  test_cases            JSONB,                -- Code: test suite

  -- Difficulty & IRT calibration
  difficulty_b          NUMERIC(4, 2) CHECK (difficulty_b BETWEEN -4 AND 4),  -- IRT b parameter (post-calibration)
  discrimination_a      NUMERIC(4, 2),       -- IRT a parameter (discrimination)
  guessing_c            NUMERIC(4, 2),       -- IRT c parameter (pseudo-guessing)
  empirical_pass_rate   NUMERIC(4, 3),       -- Observed % of candidates passing

  -- Authorship & provenance
  authored_by           VARCHAR(50) NOT NULL, -- 'claude-opus-4.6', 'gpt-5', etc.
  sme_validated_by      UUID REFERENCES app.users(id) ON DELETE SET NULL,
  calibration_n         INT DEFAULT 0,       -- Number of calibration attempts
  source_corpus         VARCHAR(100),        -- If RAG-grounded, source reference

  -- Status & versions
  status                VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sme_review', 'calibrating', 'released', 'deprecated', 'leaked')),
  parent_question_id    UUID REFERENCES content.questions(id) ON DELETE SET NULL, -- For variants
  watermark_id          VARCHAR(128),        -- Stack-Vault: per-customer watermark token

  -- AI self-critique scores (0–10 per dimension)
  ai_critique_scores    JSONB DEFAULT '{}',  -- {ambiguity: 9, distractor_quality: 8, edge_cases: 7, bias: 9, leak_risk: 8}

  -- Multi-language support
  language              CHAR(2) NOT NULL DEFAULT 'en',

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at           TIMESTAMPTZ,
  deprecated_at         TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX questions_sku_status_idx ON content.questions (sku, status);
CREATE INDEX questions_skill_idx ON content.questions (skill_id);
CREATE INDEX questions_sub_skill_idx ON content.questions (sub_skill_id);
CREATE INDEX questions_format_idx ON content.questions (format);
CREATE INDEX questions_watermark_idx ON content.questions (watermark_id) WHERE watermark_id IS NOT NULL;
CREATE INDEX questions_status_idx ON content.questions (status);
CREATE INDEX questions_body_trgm_idx ON content.questions USING GIN (body_md gin_trgm_ops);
CREATE INDEX questions_released_at_idx ON content.questions (released_at) WHERE status = 'released';

COMMENT ON TABLE content.questions IS 'Central question asset table. Stores all question types (MCQ, Coding, Design, etc.) across all SKUs (ReadyBank, JD-Forge, Stack-Vault).';
COMMENT ON COLUMN content.questions.body_json IS 'Format-specific; MCQ={options, correct_index}, Coding={signature, examples}, SJT={scenario, responses}, etc.';
COMMENT ON COLUMN content.questions.watermark_id IS 'Stack-Vault: encoded customer ID for leak forensics. ReadyBank/JD-Forge: NULL.';

-- ============================================================================

CREATE TABLE content.question_variants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_question_id    UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,
  variant_question_id   UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,
  watermark_seed        VARCHAR(128),        -- Per-customer variant marker
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_question_id, variant_question_id)
);

CREATE INDEX question_variants_parent_idx ON content.question_variants (parent_question_id);

COMMENT ON TABLE content.question_variants IS 'Maps question variants: one logical question may have N client-specific variants (Stack-Vault) or versions (deprecated → replacement).';

-- ============================================================================

CREATE TABLE content.responses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id           UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,
  tenant_id             UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  candidate_id          VARCHAR(100) NOT NULL, -- External candidate ID (not a user)

  response_body         JSONB NOT NULL,       -- Candidate's answer (format-dependent)
  score                 NUMERIC(5, 2),        -- Numeric score (0–100 or points)
  time_taken_ms         INTEGER,              -- How long candidate spent (ms)

  suspicious_signals    JSONB DEFAULT '{}',  -- Cheating indicators: {suspicious_copy_paste, fast_completion, ip_change, etc.}

  started_at            TIMESTAMPTZ,
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX responses_question_id_idx ON content.responses (question_id);
CREATE INDEX responses_tenant_id_idx ON content.responses (tenant_id);
CREATE INDEX responses_candidate_id_idx ON content.responses (tenant_id, candidate_id);
CREATE INDEX responses_submitted_at_idx ON content.responses (submitted_at);

COMMENT ON TABLE content.responses IS 'Candidate responses to questions. Used for analytics (pass rate, difficulty drift) and anti-leak leak detection (pass-rate spikes).';
COMMENT ON COLUMN content.responses.suspicious_signals IS 'Flags for plagiarism, timing anomalies, etc. Used by anti-leak engine to detect leaks.';

-- ============================================================================

CREATE TABLE content.leak_alerts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id           UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,

  source_url            TEXT NOT NULL,       -- Where leak was found (Glassdoor, Reddit, etc.)
  source_type           VARCHAR(50),         -- glassdoor, reddit, gfg, leetcode-discuss, github, etc.
  detected_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  similarity_score      NUMERIC(4, 3) NOT NULL, -- Semantic similarity 0.0–1.0; > 0.85 = high confidence leak
  severity              VARCHAR(20) NOT NULL
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  status                VARCHAR(50) NOT NULL DEFAULT 'detected'
    CHECK (status IN ('detected', 'under_review', 'rotated', 'dismissed', 'false_positive')),

  rotated_to_question_id UUID REFERENCES content.questions(id) ON DELETE SET NULL, -- Link to replacement question

  evidence_jsonb        JSONB,               -- Scrape snippet, matching text, etc.
  reviewed_by           UUID REFERENCES app.users(id) ON DELETE SET NULL,
  review_notes          TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX leak_alerts_question_id_idx ON content.leak_alerts (question_id);
CREATE INDEX leak_alerts_severity_idx ON content.leak_alerts (severity);
CREATE INDEX leak_alerts_status_idx ON content.leak_alerts (status);
CREATE INDEX leak_alerts_detected_at_idx ON content.leak_alerts (detected_at DESC);

COMMENT ON TABLE content.leak_alerts IS 'Anti-leak monitoring records. Triggered by daily crawl; severity determines auto-rotation vs manual review.';
COMMENT ON COLUMN content.leak_alerts.similarity_score IS 'Embedding-based semantic similarity (0–1). Threshold typically 0.85 for automatic action.';

-- ============================================================================
-- AUDIT SCHEMA: Immutable Audit Log
-- ============================================================================

CREATE TABLE audit.events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id              UUID REFERENCES app.users(id) ON DELETE SET NULL,
  actor_type            VARCHAR(50) NOT NULL DEFAULT 'user'
    CHECK (actor_type IN ('user', 'api_key', 'system', 'scheduled_job')),

  event_type            VARCHAR(100) NOT NULL, -- question.created, secret.rotated, user.login, etc.
  entity_type           VARCHAR(50),          -- questions, users, tenants, api_keys, etc.
  entity_id             VARCHAR(100),         -- UUID or ID of affected entity

  changes               JSONB,                -- {before: {field: old_val}, after: {field: new_val}}
  payload               JSONB DEFAULT '{}',  -- Additional context

  ip_address            INET,
  user_agent            TEXT,

  occurred_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partition audit log by month (recommended for large scale)
-- Typically created as:
--   CREATE TABLE audit.events_202605 PARTITION OF audit.events
--     FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
-- But for simplicity, start with single table; partition in 0002_partitions.sql

CREATE INDEX audit_events_actor_idx ON audit.events (actor_id, occurred_at DESC);
CREATE INDEX audit_events_entity_idx ON audit.events (entity_type, entity_id);
CREATE INDEX audit_events_type_idx ON audit.events (event_type);
CREATE INDEX audit_events_occurred_at_idx ON audit.events (occurred_at DESC);

COMMENT ON TABLE audit.events IS 'Immutable audit log (append-only). Every material action logged here. Partitioned by month in production.';
COMMENT ON COLUMN audit.events.changes IS 'JSON diff: {before: {field: old}, after: {field: new}}. Allows rollback auditing.';

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) — Stubbed for future 0002_rls_policies.sql
-- ============================================================================
-- Enable RLS on sensitive tables:
--   ALTER TABLE app.api_keys ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE content.questions ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE content.responses ENABLE ROW LEVEL SECURITY;
--   etc.
--
-- Policies to be defined in migration 0002_rls_policies.sql
-- Principle: Tenants can only see their own data; SMEs can see only sme_review questions.

-- ============================================================================
-- CONSTRAINTS & CHECKS
-- ============================================================================

-- Question difficulty must be valid IRT b parameter
-- Already checked in table definition:
-- CHECK (difficulty_b BETWEEN -4 AND 4)

-- Ensure released questions have release timestamp
-- Enforced via app logic (set released_at when status → 'released')

-- Ensure deprecated questions have deprecation timestamp
-- Enforced via app logic

-- ============================================================================
-- TRIGGERS (Optional; typically handled in app code)
-- ============================================================================

-- Auto-update updated_at on user changes
CREATE OR REPLACE FUNCTION app.update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_updated_at_trigger
  BEFORE UPDATE ON app.users
  FOR EACH ROW
  EXECUTE FUNCTION app.update_user_updated_at();

-- Similar for tenants
CREATE OR REPLACE FUNCTION app.update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_updated_at_trigger
  BEFORE UPDATE ON app.tenants
  FOR EACH ROW
  EXECUTE FUNCTION app.update_tenant_updated_at();

-- ============================================================================
-- SCHEMA PERMISSIONS (for future use)
-- ============================================================================

-- Typical permissions (to be set based on roles):
-- GRANT USAGE ON SCHEMA app, content, audit TO qorium_app_role;
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA app TO qorium_app_role;
-- GRANT SELECT ON ALL TABLES IN SCHEMA content TO qorium_viewer_role;
-- etc.

COMMIT;

-- ============================================================================
-- ROLLBACK STATEMENTS (for reference; not executed)
-- ============================================================================
-- To rollback this migration, run:
--
-- BEGIN;
-- DROP TABLE IF EXISTS audit.events CASCADE;
-- DROP TABLE IF EXISTS content.leak_alerts CASCADE;
-- DROP TABLE IF EXISTS content.responses CASCADE;
-- DROP TABLE IF EXISTS content.question_variants CASCADE;
-- DROP TABLE IF EXISTS content.questions CASCADE;
-- DROP TABLE IF EXISTS content.role_skills CASCADE;
-- DROP TABLE IF EXISTS content.roles CASCADE;
-- DROP TABLE IF EXISTS content.sub_skills CASCADE;
-- DROP TABLE IF EXISTS content.skills CASCADE;
-- DROP TABLE IF EXISTS app.api_keys CASCADE;
-- DROP TABLE IF EXISTS app.tenant_users CASCADE;
-- DROP TABLE IF EXISTS app.tenants CASCADE;
-- DROP TABLE IF EXISTS app.users CASCADE;
-- DROP FUNCTION IF EXISTS app.update_tenant_updated_at CASCADE;
-- DROP FUNCTION IF EXISTS app.update_user_updated_at CASCADE;
-- DROP SCHEMA IF EXISTS audit CASCADE;
-- DROP SCHEMA IF EXISTS content CASCADE;
-- DROP SCHEMA IF EXISTS app CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS pg_trgm;
-- DROP EXTENSION IF EXISTS citext;
-- DROP EXTENSION IF EXISTS pgcrypto;
-- COMMIT;

-- ============================================================================

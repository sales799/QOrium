-- QOrium PostgreSQL Migration 0017 — interactive proof surfaces
-- Purpose: persist public JD-Forge demo calls, curated grader exemplars,
-- sample-pack lead unlocks, and fairness feedback for the I1/I2/I4
-- interactive proof shard.
--
-- Zero-downtime posture: new tables only, no existing table rewrites.

BEGIN;

CREATE TABLE content.grader_exemplars (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id         VARCHAR(120) NOT NULL UNIQUE,
  title             VARCHAR(200) NOT NULL,
  skill             VARCHAR(160) NOT NULL,
  family            VARCHAR(40) NOT NULL
    CHECK (family IN ('code', 'sql', 'document', 'scenario')),
  question_md       TEXT NOT NULL,
  answer_md         TEXT NOT NULL,
  rubric_json       JSONB NOT NULL,
  score             NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  breakdown_json    JSONB NOT NULL,
  reasoning_json    JSONB NOT NULL,
  rubric_version    VARCHAR(80) NOT NULL,
  model_version     VARCHAR(120) NOT NULL,
  prompt_hash       VARCHAR(96) NOT NULL,
  input_hash        VARCHAR(96) NOT NULL,
  graded_at         TIMESTAMPTZ NOT NULL,
  status            VARCHAR(30) NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'retired')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX grader_exemplars_status_idx ON content.grader_exemplars (status);
CREATE INDEX grader_exemplars_skill_idx ON content.grader_exemplars (skill);
CREATE INDEX grader_exemplars_family_idx ON content.grader_exemplars (family);

COMMENT ON TABLE content.grader_exemplars IS 'Admin-curated public examples for the graded-answer viewer. Never stores private candidate responses without explicit consent.';
COMMENT ON COLUMN content.grader_exemplars.prompt_hash IS 'Prompt hash shown publicly for auditability and reproduction.';
COMMENT ON COLUMN content.grader_exemplars.input_hash IS 'Input payload hash shown publicly for auditability and reproduction.';

CREATE TABLE content.sample_packs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                VARCHAR(140) NOT NULL UNIQUE,
  title               VARCHAR(220) NOT NULL,
  skill               VARCHAR(160) NOT NULL,
  role                VARCHAR(180) NOT NULL,
  stack               VARCHAR(120) NOT NULL,
  family              VARCHAR(120) NOT NULL,
  level               VARCHAR(60) NOT NULL,
  item_count          INTEGER NOT NULL CHECK (item_count > 0),
  calibration_badge   VARCHAR(240) NOT NULL,
  summary             TEXT NOT NULL,
  library_href        TEXT NOT NULL,
  role_href           TEXT NOT NULL,
  stack_href          TEXT NOT NULL,
  preview_items_json  JSONB NOT NULL,
  gated_items_json    JSONB NOT NULL,
  source_path         TEXT,
  status              VARCHAR(30) NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'retired')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sample_packs_status_idx ON content.sample_packs (status);
CREATE INDEX sample_packs_family_idx ON content.sample_packs (family);
CREATE INDEX sample_packs_stack_idx ON content.sample_packs (stack);

COMMENT ON TABLE content.sample_packs IS 'Public sample-pack metadata and gated item manifests for the I4 lead magnet.';
COMMENT ON COLUMN content.sample_packs.calibration_badge IS 'Honest visible calibration status. Packs with incomplete IRT evidence must say so.';

CREATE TABLE audit.interactive_proof_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      VARCHAR(80) NOT NULL,
  surface         VARCHAR(80) NOT NULL,
  anonymous_ip_hash VARCHAR(96),
  session_id      VARCHAR(160),
  entity_type     VARCHAR(80),
  entity_id       VARCHAR(160),
  payload         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX interactive_proof_events_type_created_idx
  ON audit.interactive_proof_events (event_type, created_at DESC);
CREATE INDEX interactive_proof_events_surface_created_idx
  ON audit.interactive_proof_events (surface, created_at DESC);

COMMENT ON TABLE audit.interactive_proof_events IS 'Anonymized telemetry/audit events from public interactive proof surfaces.';

CREATE TABLE app.sample_pack_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_pack_id  UUID REFERENCES content.sample_packs(id) ON DELETE SET NULL,
  email           CITEXT NOT NULL,
  company         VARCHAR(180) NOT NULL,
  role            VARCHAR(140) NOT NULL,
  source          VARCHAR(80) NOT NULL DEFAULT 'sample_pack_unlock',
  pdf_token_hash  VARCHAR(96),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sample_pack_leads_email_idx ON app.sample_pack_leads (email);
CREATE INDEX sample_pack_leads_pack_created_idx
  ON app.sample_pack_leads (sample_pack_id, created_at DESC)
  WHERE sample_pack_id IS NOT NULL;

COMMENT ON TABLE app.sample_pack_leads IS 'Email-gated sample-pack unlock leads. Stores lead capture event, not candidate assessment data.';

CREATE TABLE content.grader_exemplar_feedback (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grader_exemplar_id  UUID NOT NULL REFERENCES content.grader_exemplars(id) ON DELETE CASCADE,
  session_id          VARCHAR(160),
  vote                VARCHAR(10) NOT NULL CHECK (vote IN ('up', 'down')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (grader_exemplar_id, session_id)
);

CREATE INDEX grader_exemplar_feedback_created_idx
  ON content.grader_exemplar_feedback (created_at DESC);

COMMENT ON TABLE content.grader_exemplar_feedback IS 'Public fairness votes for curated exemplars. Votes are signal only and never mutate the grade.';

COMMIT;

-- ROLLBACK REFERENCE ONLY:
-- BEGIN;
-- DROP TABLE IF EXISTS content.grader_exemplar_feedback;
-- DROP TABLE IF EXISTS app.sample_pack_leads;
-- DROP TABLE IF EXISTS audit.interactive_proof_events;
-- DROP TABLE IF EXISTS content.sample_packs;
-- DROP TABLE IF EXISTS content.grader_exemplars;
-- COMMIT;

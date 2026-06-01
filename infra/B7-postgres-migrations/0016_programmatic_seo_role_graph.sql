-- QOrium Programmatic SEO Role Graph
-- Purpose: Add SEO-generation fields and role/stack/competitor matrix tables.
-- Safety: Expand-only migration. No drops, no blocking rewrites, no data backfill.

BEGIN;

ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS category VARCHAR(80);
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS stack_family VARCHAR(120);
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS calibration_status VARCHAR(40)
  CHECK (calibration_status IN ('IRT-calibrated', 'Beta', 'Authored'));
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS item_count_total INT NOT NULL DEFAULT 0;
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS item_count_calibrated INT NOT NULL DEFAULT 0;
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS last_calibrated_at TIMESTAMPTZ;
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS sme_lead VARCHAR(160);
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS seo_meta JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE content.skills ADD COLUMN IF NOT EXISTS content_md TEXT;

ALTER TABLE content.roles ADD COLUMN IF NOT EXISTS seniority_levels TEXT[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE content.roles ADD COLUMN IF NOT EXISTS seo_meta JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE content.role_skills ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES content.skills(id) ON DELETE CASCADE;
ALTER TABLE content.role_skills ADD COLUMN IF NOT EXISTS signal_strength NUMERIC(4, 2) NOT NULL DEFAULT 1.0;
ALTER TABLE content.role_skills ADD COLUMN IF NOT EXISTS core_flag VARCHAR(20)
  CHECK (core_flag IN ('core', 'recommended'));

CREATE TABLE IF NOT EXISTS content.stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  vendor VARCHAR(160),
  region_relevance TEXT[] NOT NULL DEFAULT '{}'::text[],
  seo_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_md TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.stack_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID NOT NULL REFERENCES content.stacks(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES content.skills(id) ON DELETE CASCADE,
  weight NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  core_flag VARCHAR(20) NOT NULL DEFAULT 'recommended'
    CHECK (core_flag IN ('core', 'recommended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (stack_id, skill_id)
);

CREATE TABLE IF NOT EXISTS content.skill_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES content.skills(id) ON DELETE CASCADE,
  synonym VARCHAR(200) NOT NULL,
  source VARCHAR(120) NOT NULL DEFAULT 'qorium-authored',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill_id, synonym)
);

CREATE TABLE IF NOT EXISTS content.competitor_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_slug VARCHAR(120) NOT NULL,
  competitor_name VARCHAR(200) NOT NULL,
  dimension VARCHAR(160) NOT NULL,
  qorium_claim TEXT NOT NULL,
  competitor_claim TEXT NOT NULL,
  where_competitor_is_better TEXT,
  source_url TEXT,
  source_checked_at TIMESTAMPTZ,
  evidence_status VARCHAR(40) NOT NULL DEFAULT 'live-review-required'
    CHECK (evidence_status IN ('internal-source', 'live-review-required')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (competitor_slug, dimension)
);

CREATE INDEX IF NOT EXISTS skills_calibration_status_idx
  ON content.skills (calibration_status);
CREATE INDEX IF NOT EXISTS skills_stack_family_idx
  ON content.skills (stack_family);
CREATE INDEX IF NOT EXISTS role_skills_skill_id_idx
  ON content.role_skills (skill_id)
  WHERE skill_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stacks_slug_idx
  ON content.stacks (slug);
CREATE INDEX IF NOT EXISTS stack_skills_skill_idx
  ON content.stack_skills (skill_id);
CREATE INDEX IF NOT EXISTS skill_synonyms_synonym_trgm_idx
  ON content.skill_synonyms USING GIN (synonym gin_trgm_ops);
CREATE INDEX IF NOT EXISTS competitor_matrix_slug_idx
  ON content.competitor_matrix (competitor_slug);
CREATE INDEX IF NOT EXISTS competitor_matrix_evidence_idx
  ON content.competitor_matrix (evidence_status);

COMMENT ON COLUMN content.skills.calibration_status IS
  'Public SEO calibration badge: IRT-calibrated, Beta, or Authored. Pages below IRT threshold must not claim calibrated status.';
COMMENT ON TABLE content.stacks IS
  'Enterprise stack taxonomy for /solutions/stack/{stack} programmatic pages.';
COMMENT ON TABLE content.competitor_matrix IS
  'Evidence-gated /vs competitor comparison matrix. Numeric public claims require source_url + source_checked_at.';

COMMIT;

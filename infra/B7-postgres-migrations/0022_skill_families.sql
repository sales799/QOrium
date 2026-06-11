-- ============================================================================
-- Migration 0022: skill_families — persist the N7 canonical family taxonomy
-- ============================================================================
-- Per QOrium N7 (skill consolidation 511->~13 families). Slices 1+2 computed
-- families in-app from services/readybank/src/lib/skill-families.ts. This slice
-- persists the canonical family reference server-side so other services / SQL
-- reporting can JOIN a stable family table instead of re-deriving it.
--
-- DROP-IN: infra/B7-postgres-migrations/0022_skill_families.sql. Apply via the
-- documented pipeline (psql per infra/B7 README): PR review, then STAGING, then
-- production. Do NOT hand-apply to the live bank DB.
--
-- ADDITIVE + REVERSIBLE. Creates one new reference table seeded with the 13
-- families. No existing table is altered; no rows moved or dropped. The in-app
-- familyForSkill() mapping is unchanged and remains the source of truth for
-- skill->family assignment. Down-migration: DROP TABLE content.skill_families.
--
-- Seed rows MUST stay in lockstep with SKILL_FAMILY_SEED in
-- services/readybank/src/lib/skill-families.ts; __tests__/skill-families-seed
-- .test.ts fails CI on drift.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS content.skill_families (
 id VARCHAR(64) PRIMARY KEY,
 name VARCHAR(128) NOT NULL,
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE content.skill_families IS
 'N7 canonical buyer-facing skill families. Mirrored from lib/skill-families.ts SKILL_FAMILY_SEED; reversible (DROP TABLE).';

INSERT INTO content.skill_families (id, name, sort_order) VALUES
 ('enterprise-erp', 'Enterprise & ERP', 0),
 ('cloud-devops', 'Cloud & DevOps', 1),
 ('data-science-ml', 'Data Science, ML & AI', 2),
 ('data-databases', 'Data & Databases', 3),
 ('mobile', 'Mobile', 4),
 ('frontend', 'Frontend', 5),
 ('backend', 'Backend', 6),
 ('qa-testing', 'QA & Testing', 7),
 ('security', 'Security', 8),
 ('systems-networking', 'Systems & Networking', 9),
 ('project-product', 'Project & Product', 10),
 ('programming-fundamentals', 'Programming Fundamentals', 11),
 ('other', 'Other', 12)
ON CONFLICT (id) DO NOTHING;

COMMIT;

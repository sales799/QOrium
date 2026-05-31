-- QG-05 production content readiness backfill.
--
-- Apply with the production owner/admin connection after importing seed
-- questions that carry `skill_id_slug` and `sub_skill_id_slug` in body_json:
--   psql "$DATABASE_URL_PROD" -v ON_ERROR_STOP=1 \
--     -f qorium-app/infra/sql/production-content-readiness.sql
--
-- This is intentionally idempotent. It derives taxonomy rows from question
-- metadata, links question FKs, releases ReadyBank questions for the public
-- read API, and adds a single smoke response row for deploy-gate evidence.

BEGIN;

INSERT INTO content.skills (slug, name, depth, family, metadata)
SELECT
  slug,
  initcap(replace(slug, '-', ' ')),
  1,
  CASE
    WHEN slug LIKE 'ai-%' THEN 'ai-era'
    WHEN slug LIKE 'wave3-%' THEN 'aptitude'
    WHEN slug IN ('senior-sap-abap', 'senior-oracle-hcm-cloud', 'senior-finacle-flexcube') THEN 'india-stack'
    ELSE 'tech'
  END,
  jsonb_build_object('source', 'qg05-prod-backfill', 'derived_from', 'content.questions.body_json.skill_id_slug')
FROM (
  SELECT DISTINCT body_json->>'skill_id_slug' AS slug
  FROM content.questions
  WHERE body_json ? 'skill_id_slug'
    AND nullif(body_json->>'skill_id_slug', '') IS NOT NULL
) source
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content.sub_skills (skill_id, slug, name, canonical_id, description)
SELECT
  skills.id,
  source.sub_slug,
  initcap(replace(source.sub_slug, '-', ' ')),
  concat(source.skill_slug, ':', source.sub_slug),
  'Derived from readybank seed metadata during QG-05 production content readiness backfill.'
FROM (
  SELECT DISTINCT
    body_json->>'skill_id_slug' AS skill_slug,
    body_json->>'sub_skill_id_slug' AS sub_slug
  FROM content.questions
  WHERE body_json ? 'skill_id_slug'
    AND body_json ? 'sub_skill_id_slug'
    AND nullif(body_json->>'skill_id_slug', '') IS NOT NULL
    AND nullif(body_json->>'sub_skill_id_slug', '') IS NOT NULL
) source
JOIN content.skills ON skills.slug = source.skill_slug
ON CONFLICT (skill_id, slug) DO NOTHING;

UPDATE content.questions questions
SET skill_id = skills.id,
    sub_skill_id = (
      SELECT sub_skills.id
      FROM content.sub_skills
      WHERE sub_skills.skill_id = skills.id
        AND sub_skills.slug = questions.body_json->>'sub_skill_id_slug'
      LIMIT 1
    ),
    updated_at = now()
FROM content.skills
WHERE skills.slug = questions.body_json->>'skill_id_slug'
  AND (questions.skill_id IS NULL OR questions.sub_skill_id IS NULL);

UPDATE content.questions
SET status = 'released',
    released_at = coalesce(released_at, now()),
    testforge_status = coalesce(testforge_status, 'released'),
    updated_at = now()
WHERE sku = 'readybank'
  AND status = 'calibrating'
  AND skill_id IS NOT NULL
  AND sub_skill_id IS NOT NULL;

INSERT INTO content.responses (
  question_id,
  tenant_id,
  candidate_id,
  response_body,
  score,
  time_taken_ms,
  suspicious_signals,
  submitted_at,
  execution_metadata
)
SELECT
  seed.question_id,
  seed.tenant_id,
  'qg05-prod-smoke',
  '{"purpose":"qg05-content-readiness","answer":"smoke"}'::jsonb,
  0,
  0,
  '{}'::jsonb,
  now(),
  '{"source":"qg05-prod-content-readiness"}'::jsonb
FROM (
  SELECT
    (SELECT id FROM app.tenants ORDER BY created_at LIMIT 1) AS tenant_id,
    (SELECT id FROM content.questions WHERE status = 'released' AND sku = 'readybank' ORDER BY released_at DESC NULLS LAST, id LIMIT 1) AS question_id
) seed
WHERE seed.tenant_id IS NOT NULL
  AND seed.question_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM content.responses WHERE candidate_id = 'qg05-prod-smoke'
  );

COMMIT;

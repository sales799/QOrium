-- QG-05 production runtime grants.
--
-- Apply with the production owner/admin connection after schema migrations:
--   psql "$DATABASE_URL_PROD" -v ON_ERROR_STOP=1 \
--     -f qorium-app/infra/sql/production-runtime-grants.sql
--
-- The API process connects as qorium_app. These grants are the minimum surface
-- needed for API-key auth, question search, and pack generation/export.

GRANT USAGE ON SCHEMA app, content TO qorium_app;

GRANT SELECT ON app.api_keys TO qorium_app;
GRANT UPDATE (last_used_at) ON app.api_keys TO qorium_app;

GRANT SELECT, INSERT, UPDATE ON app.packs TO qorium_app;

GRANT SELECT ON content.questions, content.skills, content.sub_skills TO qorium_app;

-- Phase F scale wedges — on-demand runtime sessions.
--
-- These sessions are tenant-scoped because the /v1 surface is API-key
-- authenticated. Runtime payloads remain JSONB so Cognitive, Video, M3, M8,
-- M9, and M10 can evolve without forcing a migration per prompt/rubric tweak.

CREATE TABLE IF NOT EXISTS app.scale_wedge_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES app.api_keys(id) ON DELETE SET NULL,
  module TEXT NOT NULL CHECK (
    module IN (
      'cognitive',
      'job-simulation',
      'video-response',
      'scheduling',
      'live-room',
      'reference-check'
    )
  ),
  candidate_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live_on_demand' CHECK (
    status IN ('live_on_demand', 'completed', 'cancelled')
  ),
  runtime JSONB NOT NULL DEFAULT '{}'::jsonb,
  events JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(events) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scale_wedge_sessions_tenant_created
  ON app.scale_wedge_sessions (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scale_wedge_sessions_tenant_module
  ON app.scale_wedge_sessions (tenant_id, module, created_at DESC);

COMMENT ON TABLE app.scale_wedge_sessions IS
  'Phase F on-demand runtime sessions for cognitive, video, job simulation, scheduling, live room, and reference check wedges.';

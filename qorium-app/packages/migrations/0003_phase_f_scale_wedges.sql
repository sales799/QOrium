ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'simulation';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'video_response';

ALTER TABLE question
ADD COLUMN IF NOT EXISTS body_json jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS scale_wedge_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  candidate_email text NOT NULL,
  status text NOT NULL DEFAULT 'live_on_demand',
  runtime jsonb NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scale_wedge_session_module_idx
ON scale_wedge_session (module, created_at DESC);

CREATE INDEX IF NOT EXISTS scale_wedge_session_candidate_idx
ON scale_wedge_session (candidate_email, created_at DESC);

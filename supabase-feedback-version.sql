-- Add app_version to feedback so submissions can be sorted/filtered by version.
-- Run in Supabase SQL editor (after supabase-feedback-schema.sql).

ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS app_version TEXT;

CREATE INDEX IF NOT EXISTS idx_feedback_app_version ON feedback(app_version);

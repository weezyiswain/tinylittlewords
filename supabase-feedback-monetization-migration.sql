-- Add monetization fields to feedback (run after supabase-feedback-schema.sql).
-- Use for existing projects that already have the feedback table.

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS pricing_preference TEXT,
  ADD COLUMN IF NOT EXISTS features_valued TEXT[];

COMMENT ON COLUMN feedback.pricing_preference IS 'One of: subscription | one_time | not_sure | wouldnt_pay';
COMMENT ON COLUMN feedback.features_valued IS 'Selected feature keys, e.g. 4-5-letter-words, word-packs, progress-per-kid, unlimited-daily, other';

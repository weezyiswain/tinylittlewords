-- Feedback submissions for Tiny Little Words
-- Run after supabase-parents-schema.sql (profiles table required for parent_id FK).
-- Stores in-app feedback; anonymous INSERT allowed. View via Supabase dashboard.

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  who TEXT,
  what_worked TEXT,
  what_improve TEXT,
  anything_else TEXT,
  email TEXT,

  pricing_preference TEXT,
  features_valued TEXT[],

  source TEXT,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_source ON feedback(source);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (anon insert). No public read.
CREATE POLICY "Allow anonymous insert" ON feedback
  FOR INSERT WITH CHECK (true);

-- Optional: allow users to read only their own (if parent_id set). For now we skip;
-- you view all feedback via Supabase dashboard or service role.

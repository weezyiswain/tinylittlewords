-- Supabase Database Schema for Tiny Little Words
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create words table
CREATE TABLE IF NOT EXISTS words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text VARCHAR(50) NOT NULL,
  length INTEGER NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'easy',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packs table
CREATE TABLE IF NOT EXISTS packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pack_words junction table
CREATE TABLE IF NOT EXISTS pack_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pack_id, word_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_words_length ON words(length);
CREATE INDEX IF NOT EXISTS idx_words_enabled ON words(enabled);
CREATE INDEX IF NOT EXISTS idx_words_text ON words(text);
CREATE INDEX IF NOT EXISTS idx_packs_enabled ON packs(enabled);
CREATE INDEX IF NOT EXISTS idx_pack_words_pack_id ON pack_words(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_words_word_id ON pack_words(word_id);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_words ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Allow public read access to words" ON words
  FOR SELECT USING (enabled = true);

CREATE POLICY "Allow public read access to packs" ON packs
  FOR SELECT USING (enabled = true);

CREATE POLICY "Allow public read access to pack_words" ON pack_words
  FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packs_updated_at BEFORE UPDATE ON packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

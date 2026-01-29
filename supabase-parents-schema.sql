-- Parents & kid profiles for Tiny Little Words
-- Run after supabase-schema.sql

-- Parent profile (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kid profiles (parent-managed, no passwords)
CREATE TABLE IF NOT EXISTS kid_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  avatar_id VARCHAR(50) NOT NULL DEFAULT 'bear',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kid_profiles_parent ON kid_profiles(parent_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_profiles ENABLE ROW LEVEL SECURITY;

-- Parents can read/update own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Parents can CRUD own kid profiles
CREATE POLICY "Parents can manage own kid profiles" ON kid_profiles
  FOR ALL USING (auth.uid() = parent_id)
  WITH CHECK (auth.uid() = parent_id);

-- Create profile on signup (call from app or use trigger)
-- Example trigger (requires auth.users trigger):
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

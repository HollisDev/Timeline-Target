-- Complete database setup script for VOD Search Engine
-- Run this script in your Supabase SQL editor or via CLI

-- Step 1: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vods (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vod_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcripts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  vod_id BIGINT NOT NULL REFERENCES vods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp FLOAT8 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_vods_user_id ON vods(user_id);
CREATE INDEX IF NOT EXISTS idx_vods_status ON vods(status);
CREATE INDEX IF NOT EXISTS idx_vods_created_at ON vods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_vod_id ON transcripts(vod_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_timestamp ON transcripts(timestamp);
CREATE INDEX IF NOT EXISTS idx_transcripts_content_search ON transcripts USING gin(to_tsvector('english', content));

-- Step 4: Create trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vods_updated_at 
  BEFORE UPDATE ON vods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- VODs policies
CREATE POLICY "Users can view own vods" ON vods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vods" ON vods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vods" ON vods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vods" ON vods
  FOR DELETE USING (auth.uid() = user_id);

-- Transcripts policies
CREATE POLICY "Users can view own transcripts" ON transcripts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcripts" ON transcripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transcripts" ON transcripts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transcripts" ON transcripts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Transcripts must belong to user vods" ON transcripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vods 
      WHERE vods.id = transcripts.vod_id 
      AND vods.user_id = auth.uid()
    )
  );

-- Step 8: Create utility functions

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Full-text search function
CREATE OR REPLACE FUNCTION search_transcripts(
  search_query TEXT,
  vod_id_param BIGINT DEFAULT NULL,
  user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  vod_id BIGINT,
  user_id UUID,
  content TEXT,
  timestamp FLOAT8,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.vod_id,
    t.user_id,
    t.content,
    t.timestamp,
    t.created_at,
    ts_rank(to_tsvector('english', t.content), plainto_tsquery('english', search_query)) as rank
  FROM transcripts t
  WHERE 
    (user_id_param IS NULL OR t.user_id = user_id_param)
    AND (vod_id_param IS NULL OR t.vod_id = vod_id_param)
    AND to_tsvector('english', t.content) @@ plainto_tsquery('english', search_query)
    AND (auth.uid() = t.user_id)
  ORDER BY rank DESC, t.timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- VOD statistics function
CREATE OR REPLACE FUNCTION get_vod_stats(vod_id_param BIGINT)
RETURNS TABLE (
  total_transcripts BIGINT,
  total_duration FLOAT8,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(t.id) as total_transcripts,
    COALESCE(MAX(t.timestamp), 0) as total_duration,
    v.status
  FROM vods v
  LEFT JOIN transcripts t ON v.id = t.vod_id
  WHERE v.id = vod_id_param
    AND v.user_id = auth.uid()
  GROUP BY v.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Status update function
CREATE OR REPLACE FUNCTION update_vod_status(
  vod_id_param BIGINT,
  new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  IF new_status NOT IN ('pending', 'processing', 'completed', 'failed') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  UPDATE vods 
  SET status = new_status, updated_at = NOW()
  WHERE id = vod_id_param 
    AND user_id = auth.uid();
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Add AI features tables for MVP
-- Chapters table for AI-generated chapters
CREATE TABLE IF NOT EXISTS chapters (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  vod_id BIGINT NOT NULL REFERENCES vods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp FLOAT8 NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viral moments table for AI-detected engaging moments
CREATE TABLE IF NOT EXISTS viral_moments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  vod_id BIGINT NOT NULL REFERENCES vods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp FLOAT8 NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add summary field to vods table
ALTER TABLE vods ADD COLUMN IF NOT EXISTS summary TEXT;

-- Enable RLS on new tables
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_moments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapters
CREATE POLICY "Users can view chapters for their own VODs" ON chapters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert chapters for their own VODs" ON chapters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update chapters for their own VODs" ON chapters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete chapters for their own VODs" ON chapters
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for viral_moments
CREATE POLICY "Users can view viral moments for their own VODs" ON viral_moments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert viral moments for their own VODs" ON viral_moments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update viral moments for their own VODs" ON viral_moments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete viral moments for their own VODs" ON viral_moments
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapters_vod_id ON chapters(vod_id);
CREATE INDEX IF NOT EXISTS idx_chapters_user_id ON chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_timestamp ON chapters(timestamp);

CREATE INDEX IF NOT EXISTS idx_viral_moments_vod_id ON viral_moments(vod_id);
CREATE INDEX IF NOT EXISTS idx_viral_moments_user_id ON viral_moments(user_id);
CREATE INDEX IF NOT EXISTS idx_viral_moments_timestamp ON viral_moments(timestamp);

-- Add comments
COMMENT ON TABLE chapters IS 'AI-generated chapters with timestamps and titles for VOD navigation';
COMMENT ON TABLE viral_moments IS 'AI-detected viral moments with timestamps and descriptions';
COMMENT ON COLUMN vods.summary IS 'AI-generated summary of the VOD content';

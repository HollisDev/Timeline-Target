-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- VODs RLS Policies
-- Users can view their own VODs
CREATE POLICY "Users can view own vods" ON vods
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own VODs
CREATE POLICY "Users can insert own vods" ON vods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own VODs
CREATE POLICY "Users can update own vods" ON vods
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own VODs
CREATE POLICY "Users can delete own vods" ON vods
  FOR DELETE USING (auth.uid() = user_id);

-- Transcripts RLS Policies
-- Users can view transcripts for their own VODs
CREATE POLICY "Users can view own transcripts" ON transcripts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert transcripts for their own VODs
CREATE POLICY "Users can insert own transcripts" ON transcripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update transcripts for their own VODs
CREATE POLICY "Users can update own transcripts" ON transcripts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete transcripts for their own VODs
CREATE POLICY "Users can delete own transcripts" ON transcripts
  FOR DELETE USING (auth.uid() = user_id);

-- Additional policy to ensure transcripts belong to user's VODs
CREATE POLICY "Transcripts must belong to user vods" ON transcripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vods 
      WHERE vods.id = transcripts.vod_id 
      AND vods.user_id = auth.uid()
    )
  );
-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for full-text search on transcripts
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
    AND (auth.uid() = t.user_id) -- Ensure RLS compliance
  ORDER BY rank DESC, t.timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get VOD statistics
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
    AND v.user_id = auth.uid() -- Ensure RLS compliance
  GROUP BY v.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update VOD status (for API use)
CREATE OR REPLACE FUNCTION update_vod_status(
  vod_id_param BIGINT,
  new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  -- Validate status
  IF new_status NOT IN ('pending', 'processing', 'completed', 'failed') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  UPDATE vods 
  SET status = new_status, updated_at = NOW()
  WHERE id = vod_id_param 
    AND user_id = auth.uid(); -- Ensure RLS compliance
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
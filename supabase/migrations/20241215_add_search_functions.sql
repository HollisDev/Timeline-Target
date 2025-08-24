-- Add full-text search capabilities to transcripts table

-- Create a text search vector column for better performance
ALTER TABLE transcripts 
ADD COLUMN search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION update_transcript_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER update_transcript_search_vector_trigger
  BEFORE INSERT OR UPDATE ON transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_transcript_search_vector();

-- Create index for full-text search
CREATE INDEX idx_transcripts_search_vector ON transcripts USING gin(search_vector);

-- Update existing records
UPDATE transcripts SET search_vector = to_tsvector('english', content);

-- Create a function for advanced search with ranking
CREATE OR REPLACE FUNCTION search_transcripts(
  search_query TEXT,
  vod_id_param INTEGER DEFAULT NULL,
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 50
)
RETURNS TABLE (
  id INTEGER,
  vod_id INTEGER,
  user_id UUID,
  content TEXT,
  timestamp INTEGER,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
DECLARE
  query_tsquery tsquery;
BEGIN
  -- Convert search query to tsquery
  query_tsquery := websearch_to_tsquery('english', search_query);
  
  -- Return empty if query is invalid
  IF query_tsquery IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    t.id,
    t.vod_id,
    t.user_id,
    t.content,
    t.timestamp,
    t.created_at,
    ts_rank(t.search_vector, query_tsquery) as rank
  FROM transcripts t
  WHERE 
    t.search_vector @@ query_tsquery
    AND (user_id_param IS NULL OR t.user_id = user_id_param)
    AND (vod_id_param IS NULL OR t.vod_id = vod_id_param)
  ORDER BY 
    ts_rank(t.search_vector, query_tsquery) DESC,
    t.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_transcripts(TEXT, INTEGER, UUID, INTEGER) TO authenticated;

-- Create a function to get search suggestions (for autocomplete)
CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_query TEXT,
  user_id_param UUID,
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
  suggestion TEXT,
  frequency INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    word,
    COUNT(*)::INTEGER as frequency
  FROM (
    SELECT unnest(string_to_array(lower(content), ' ')) as word
    FROM transcripts
    WHERE user_id = user_id_param
  ) words
  WHERE 
    word LIKE lower(partial_query) || '%'
    AND length(word) > 2
    AND word ~ '^[a-zA-Z]+$' -- Only alphabetic words
  GROUP BY word
  ORDER BY frequency DESC, word
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_search_suggestions(TEXT, UUID, INTEGER) TO authenticated;

-- Create a function to get popular search terms
CREATE OR REPLACE FUNCTION get_popular_search_terms(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 20
)
RETURNS TABLE (
  term TEXT,
  frequency INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    word,
    COUNT(*)::INTEGER as frequency
  FROM (
    SELECT unnest(string_to_array(lower(content), ' ')) as word
    FROM transcripts
    WHERE user_id = user_id_param
  ) words
  WHERE 
    length(word) > 3
    AND word ~ '^[a-zA-Z]+$' -- Only alphabetic words
    AND word NOT IN ('the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its', 'who', 'oil', 'sit', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'has', 'him', 'old', 'see', 'two', 'way', 'may', 'say', 'each', 'which', 'their', 'time', 'will', 'about', 'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'very', 'what', 'know', 'just', 'first', 'get', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'go', 'me', 'back', 'little', 'only', 'round', 'man', 'year', 'came', 'show', 'every', 'good', 'me', 'give', 'our', 'under', 'name', 'very', 'through', 'just', 'form', 'sentence', 'great', 'think', 'say', 'help', 'low', 'line', 'differ', 'turn', 'cause', 'much', 'mean', 'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'tell', 'does', 'set', 'three', 'want', 'air', 'well', 'also', 'play', 'small', 'end', 'put', 'home', 'read', 'hand', 'port', 'large', 'spell', 'add', 'even', 'land', 'here', 'must', 'big', 'high', 'such', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'us', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self', 'earth', 'father', 'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'between', 'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left', 'late', 'run', 'dont', 'while', 'press', 'close', 'night', 'real', 'life', 'few', 'north', 'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk', 'example', 'ease', 'paper', 'group', 'always', 'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'book', 'carry', 'took', 'science', 'eat', 'room', 'friend', 'began', 'idea', 'fish', 'mountain', 'stop', 'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face', 'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best', 'hour', 'better', 'during', 'hundred', 'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan', 'figure', 'star', 'box', 'noun', 'field', 'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood', 'contain', 'front', 'teach', 'week', 'final', 'gave', 'green', 'oh', 'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'multiply', 'nothing', 'course', 'stay', 'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'record', 'boat', 'common', 'gold', 'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'thousands', 'ago', 'ran', 'check', 'game', 'shape', 'equate', 'hot', 'miss', 'brought', 'heat', 'snow', 'tire', 'bring', 'yes', 'distant', 'fill', 'east', 'paint', 'language', 'among') -- Common stop words
  GROUP BY word
  ORDER BY frequency DESC, word
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_popular_search_terms(UUID, INTEGER) TO authenticated;

-- Add comments
COMMENT ON FUNCTION search_transcripts IS 'Full-text search function for transcripts with ranking';
COMMENT ON FUNCTION get_search_suggestions IS 'Get search suggestions for autocomplete functionality';
COMMENT ON FUNCTION get_popular_search_terms IS 'Get popular search terms for a user (excluding common stop words)';
COMMENT ON COLUMN transcripts.search_vector IS 'Full-text search vector for efficient searching';
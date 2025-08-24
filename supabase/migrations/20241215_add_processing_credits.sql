-- Add processing_credits column to profiles table
-- This implements the zero-cost trial system with 8 free credits per user

-- Add the processing_credits column with default value of 8
ALTER TABLE profiles 
ADD COLUMN processing_credits INTEGER NOT NULL DEFAULT 8;

-- Add a check constraint to ensure credits cannot go negative
ALTER TABLE profiles 
ADD CONSTRAINT processing_credits_non_negative 
CHECK (processing_credits >= 0);

-- Create an index for efficient credit queries
CREATE INDEX idx_profiles_processing_credits ON profiles(processing_credits);

-- Update existing users to have 8 credits (if any exist)
UPDATE profiles SET processing_credits = 8 WHERE processing_credits IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN profiles.processing_credits IS 'Number of processing credits available for VOD transcription. Each hour of video costs 1 credit. Default: 8 credits for new users.';

-- Create a function to safely deduct credits (atomic operation)
CREATE OR REPLACE FUNCTION deduct_processing_credits(
  user_id UUID,
  credits_to_deduct INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Lock the row and get current credits
  SELECT processing_credits INTO current_credits
  FROM profiles
  WHERE id = user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if sufficient credits
  IF current_credits < credits_to_deduct THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE profiles
  SET processing_credits = processing_credits - credits_to_deduct
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION deduct_processing_credits(UUID, INTEGER) TO authenticated;

-- Create a function to add credits (for future credit purchases)
CREATE OR REPLACE FUNCTION add_processing_credits(
  user_id UUID,
  credits_to_add INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  -- Validate input
  IF credits_to_add <= 0 THEN
    RAISE EXCEPTION 'Credits to add must be positive';
  END IF;
  
  -- Add credits
  UPDATE profiles
  SET processing_credits = processing_credits + credits_to_add
  WHERE id = user_id;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (for future use)
GRANT EXECUTE ON FUNCTION add_processing_credits(UUID, INTEGER) TO authenticated;
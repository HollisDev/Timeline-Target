-- Add duration_hours column to vods table
-- This stores the duration of the video in hours for credit calculation

-- Add the duration_hours column
ALTER TABLE vods 
ADD COLUMN duration_hours INTEGER;

-- Add a check constraint to ensure duration is positive
ALTER TABLE vods 
ADD CONSTRAINT duration_hours_positive 
CHECK (duration_hours > 0);

-- Create an index for efficient duration queries
CREATE INDEX idx_vods_duration_hours ON vods(duration_hours);

-- Add a comment to document the column
COMMENT ON COLUMN vods.duration_hours IS 'Duration of the video in hours (rounded up). Used for processing credit calculation. Each hour costs 1 credit.';

-- Create a function to calculate duration in hours from seconds
CREATE OR REPLACE FUNCTION calculate_duration_hours(duration_seconds INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Convert seconds to hours and round up
  -- This ensures even partial hours count as full hours for billing
  RETURN CEIL(duration_seconds::DECIMAL / 3600);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_duration_hours(INTEGER) TO authenticated;

-- Create a function to update duration_hours from duration_seconds (if that column exists)
-- This is for future use when we get actual video duration from metadata
CREATE OR REPLACE FUNCTION update_duration_hours_from_seconds()
RETURNS TRIGGER AS $$
BEGIN
  -- If duration_seconds is provided, calculate duration_hours
  IF NEW.duration_seconds IS NOT NULL AND NEW.duration_seconds > 0 THEN
    NEW.duration_hours = calculate_duration_hours(NEW.duration_seconds);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We'll create the trigger when we add duration_seconds column in the future
-- For now, duration_hours will be set manually by the frontend based on user input
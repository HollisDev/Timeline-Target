-- Seed data for development and testing
-- Note: This should only be run in development environments

-- Insert sample data (these will be protected by RLS)
-- The actual user IDs will need to be replaced with real UUIDs from auth.users

-- Sample VOD statuses for reference
INSERT INTO vods (user_id, vod_url, status) VALUES
  ('00000000-0000-0000-0000-000000000000', 'https://example.com/video1.mp4', 'completed'),
  ('00000000-0000-0000-0000-000000000000', 'https://example.com/video2.mp4', 'processing'),
  ('00000000-0000-0000-0000-000000000000', 'https://example.com/video3.mp4', 'pending')
ON CONFLICT DO NOTHING;

-- Sample transcript data
INSERT INTO transcripts (vod_id, user_id, content, timestamp) VALUES
  (1, '00000000-0000-0000-0000-000000000000', 'Welcome to this video tutorial about Next.js development.', 0.0),
  (1, '00000000-0000-0000-0000-000000000000', 'In this section, we will cover the basics of React components.', 15.5),
  (1, '00000000-0000-0000-0000-000000000000', 'Let me show you how to create a simple functional component.', 32.2),
  (1, '00000000-0000-0000-0000-000000000000', 'Now we will discuss state management and hooks.', 58.7),
  (1, '00000000-0000-0000-0000-000000000000', 'Thank you for watching this tutorial.', 125.3)
ON CONFLICT DO NOTHING;

-- Note: In a real application, these sample records will only be visible
-- to users whose auth.uid() matches the user_id due to RLS policies
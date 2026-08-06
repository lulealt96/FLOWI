-- Add custom flowling name to user_avatars
ALTER TABLE user_avatars ADD COLUMN IF NOT EXISTS flowling_name TEXT;

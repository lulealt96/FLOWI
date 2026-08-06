-- Add species column to user_avatars
ALTER TABLE user_avatars ADD COLUMN IF NOT EXISTS species TEXT NOT NULL DEFAULT 'bloom';

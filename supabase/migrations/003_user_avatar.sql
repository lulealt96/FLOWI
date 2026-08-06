-- ============================================================
-- MIGRACIÓN 003: Avatar global del usuario (Flowling)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Avatar único por usuario (el Flowling)
CREATE TABLE IF NOT EXISTS user_avatars (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp     int  NOT NULL DEFAULT 0,
  level        int  NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS user_avatars_user_id_idx ON user_avatars(user_id);

ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_avatars_own" ON user_avatars
  USING  ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- FIN MIGRACIÓN 003
-- ============================================================

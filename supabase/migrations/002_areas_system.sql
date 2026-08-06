-- ============================================================
-- MIGRACIÓN 002: Sistema de Áreas de Vida
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. TABLA: areas
-- Las 8 áreas de vida + las que el usuario agregue
CREATE TABLE IF NOT EXISTS areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  emoji       text NOT NULL DEFAULT '⭐',
  color       text NOT NULL DEFAULT '#F06B8A',
  description text,
  order_index int  NOT NULL DEFAULT 0,
  is_default  bool NOT NULL DEFAULT false,
  is_active   bool NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS areas_user_id_idx ON areas(user_id);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas_own" ON areas
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 2. TABLA: area_evaluations
-- Diagnóstico inicial + evaluaciones mensuales (score 0-100 por área)
CREATE TABLE IF NOT EXISTS area_evaluations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id      uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  score        int  NOT NULL CHECK (score >= 0 AND score <= 100),
  notes        text,
  evaluated_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS area_evals_user_id_idx ON area_evaluations(user_id);
CREATE INDEX IF NOT EXISTS area_evals_area_id_idx ON area_evaluations(area_id);

ALTER TABLE area_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "area_evals_own" ON area_evaluations
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 3. TABLA: area_avatars
-- XP y nivel del avatar por área (crece con tareas completadas)
CREATE TABLE IF NOT EXISTS area_avatars (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id    uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  xp         int  NOT NULL DEFAULT 0,
  level      int  NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, area_id)
);

CREATE INDEX IF NOT EXISTS area_avatars_user_id_idx ON area_avatars(user_id);

ALTER TABLE area_avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "area_avatars_own" ON area_avatars
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 4. TABLA: streaks
-- Racha diaria del usuario
CREATE TABLE IF NOT EXISTS streaks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak    int  NOT NULL DEFAULT 0,
  longest_streak    int  NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks_own" ON streaks
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 5. TABLA: wa_schedules
-- Horarios programados para mensajes motivacionales de WhatsApp
CREATE TABLE IF NOT EXISTS wa_schedules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  send_time    time NOT NULL DEFAULT '08:00:00',
  days_of_week int[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 0=dom, 1=lun ... 6=sab
  message_type text NOT NULL DEFAULT 'motivation' CHECK (message_type IN ('motivation','reminder','check_in')),
  is_active    bool NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wa_schedules_user_id_idx ON wa_schedules(user_id);

ALTER TABLE wa_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_schedules_own" ON wa_schedules
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 6. TABLA: weekly_reviews
-- Resumen semanal automático de progreso
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start       date NOT NULL,
  week_end         date NOT NULL,
  tasks_completed  int  NOT NULL DEFAULT 0,
  tasks_pending    int  NOT NULL DEFAULT 0,
  streak_at_close  int  NOT NULL DEFAULT 0,
  area_xp_snapshot jsonb, -- { area_id: xp_ganado_esa_semana }
  avatar_levels    jsonb, -- { area_id: level }
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS weekly_reviews_user_id_idx ON weekly_reviews(user_id);

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly_reviews_own" ON weekly_reviews
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 7. MODIFICAR: projects — agregar area_id
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_area_id_idx ON projects(area_id);

-- 8. MODIFICAR: tasks — agregar notes si no existe (de sesiones anteriores)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS section text;

-- ============================================================
-- FIN DE MIGRACIÓN 002
-- ============================================================

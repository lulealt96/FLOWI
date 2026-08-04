-- =============================================
-- FLOWI — Esquema inicial
-- Pegar en: Supabase → SQL Editor → New query
-- =============================================

-- 1. PROFILES (extiende auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  avatar_url  text,
  whatsapp_phone text unique,
  onboarding_completed boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id);

-- Auto-crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PROJECTS
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  emoji      text not null default '📁',
  color      text not null default '#6B8AF0',
  category   text not null default 'personal' check (category in ('work', 'personal', 'life')),
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);

alter table public.projects enable row level security;

create policy "projects_select_own" on public.projects
  for select using ((select auth.uid()) = user_id);
create policy "projects_insert_own" on public.projects
  for insert with check ((select auth.uid()) = user_id);
create policy "projects_update_own" on public.projects
  for update using ((select auth.uid()) = user_id);
create policy "projects_delete_own" on public.projects
  for delete using ((select auth.uid()) = user_id);

-- 3. TASKS
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  project_id   uuid not null references public.projects(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date     timestamptz,
  source       text not null default 'web' check (source in ('whatsapp', 'web', 'reminder')),
  raw_message  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index tasks_user_id_idx    on public.tasks(user_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_status_idx     on public.tasks(status);
create index tasks_due_date_idx   on public.tasks(due_date) where due_date is not null;

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks
  for update using ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete using ((select auth.uid()) = user_id);

-- 4. REMINDERS
create table public.reminders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  task_id      uuid references public.tasks(id) on delete set null,
  project_id   uuid references public.projects(id) on delete set null,
  message      text not null,
  scheduled_at timestamptz not null,
  sent_at      timestamptz,
  status       text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  recurrence   text check (recurrence in ('daily', 'weekly')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index reminders_user_id_idx      on public.reminders(user_id);
create index reminders_scheduled_at_idx on public.reminders(scheduled_at) where status = 'pending';
create index reminders_task_id_idx      on public.reminders(task_id) where task_id is not null;

alter table public.reminders enable row level security;

create policy "reminders_select_own" on public.reminders
  for select using ((select auth.uid()) = user_id);
create policy "reminders_insert_own" on public.reminders
  for insert with check ((select auth.uid()) = user_id);
create policy "reminders_update_own" on public.reminders
  for update using ((select auth.uid()) = user_id);
create policy "reminders_delete_own" on public.reminders
  for delete using ((select auth.uid()) = user_id);

-- 5. WA_CONVERSATIONS
create table public.wa_conversations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  wa_message_id   text unique not null,
  direction       text not null check (direction in ('inbound', 'outbound')),
  body            text not null,
  parsed_intent   jsonb,
  created_at      timestamptz not null default now()
);

create index wa_conversations_user_id_idx on public.wa_conversations(user_id);

alter table public.wa_conversations enable row level security;

create policy "wa_conversations_select_own" on public.wa_conversations
  for select using ((select auth.uid()) = user_id);
create policy "wa_conversations_insert_own" on public.wa_conversations
  for insert with check ((select auth.uid()) = user_id);

-- =====================================================
-- PRONIA SOCIAL FEATURES DATABASE SCHEMA
-- This migration is idempotent (safe to run multiple times)
-- =====================================================

-- =====================================================
-- 1. FOLLOWS TABLE
-- =====================================================
create table if not exists follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

create index if not exists follows_follower_idx on follows(follower_id);
create index if not exists follows_following_idx on follows(following_id);

alter table follows enable row level security;

DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- =====================================================
-- 2. POSTS TABLE
-- =====================================================
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  caption text,
  media_url text,
  media_type text default 'video',
  reply_to uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists posts_user_idx on posts(user_id);
create index if not exists posts_created_at_idx on posts(created_at desc);

alter table posts enable row level security;

DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. LIKES TABLE
-- =====================================================
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

create index if not exists likes_post_idx on likes(post_id);
create index if not exists likes_user_idx on likes(user_id);

alter table likes enable row level security;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON public.likes;

CREATE POLICY "Anyone can view likes" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON public.likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. NOTIFICATIONS TABLE
-- =====================================================
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  actor_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('follow', 'like')),
  post_id uuid references posts(id) on delete cascade,
  read boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists notifications_user_idx on notifications(user_id, read, created_at desc);
create index if not exists notifications_actor_idx on notifications(actor_id);

alter table notifications enable row level security;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications (mark read)" ON public.notifications;
DROP POLICY IF EXISTS "Actor can delete their notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications for others" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id AND auth.uid() <> user_id);

CREATE POLICY "Users can update own notifications (mark read)" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Actor can delete their notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = actor_id);

-- =====================================================
-- 5. PROFILES TABLE
-- =====================================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  name text,
  bio text,
  avatar_url text,
  instruments text[] default '{}',
  followers_count integer default 0,
  following_count integer default 0,
  is_private boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists profiles_username_idx on profiles(username);

alter table profiles enable row level security;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 6. HELPER FUNCTION: Create profile on signup
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter integer := 0;
begin
  -- Generate a base username from email or metadata
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'))
  );
  
  -- Ensure username is at least 3 chars
  if length(base_username) < 3 then
    base_username := 'user';
  end if;
  
  -- Try to find a unique username by appending numbers if needed
  final_username := base_username || '_' || substring(new.id::text, 1, 6);
  
  -- Insert profile with unique username
  insert into public.profiles (id, username, name, avatar_url, instruments, bio, experience_level)
  values (
    new.id,
    final_username,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    '{}',
    '',
    ''
  )
  on conflict (id) do nothing;
  
  return new;
exception
  when unique_violation then
    -- If username already taken (very rare), append random suffix
    final_username := base_username || '_' || substring(md5(random()::text), 1, 8);
    insert into public.profiles (id, username, name, avatar_url, instruments, bio, experience_level)
    values (
      new.id,
      final_username,
      coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'avatar_url',
      '{}',
      '',
      ''
    )
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- 7. REALTIME SUBSCRIPTIONS (run only once)
-- =====================================================
DO $$
BEGIN
  -- These may fail silently if already added
  BEGIN
    alter publication supabase_realtime add table notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    alter publication supabase_realtime add table posts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    alter publication supabase_realtime add table likes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- =====================================================
-- 8. PRACTICE SESSIONS TABLE
-- =====================================================
create table if not exists practice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  duration integer not null, -- in seconds
  piece text,
  composer text,
  notes text,
  practiced_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index if not exists practice_sessions_user_idx on practice_sessions(user_id);
create index if not exists practice_sessions_date_idx on practice_sessions(practiced_at);

alter table practice_sessions enable row level security;

DROP POLICY IF EXISTS "Users can view own practice sessions" ON public.practice_sessions;
DROP POLICY IF EXISTS "Users can create own practice sessions" ON public.practice_sessions;
DROP POLICY IF EXISTS "Users can update own practice sessions" ON public.practice_sessions;
DROP POLICY IF EXISTS "Users can delete own practice sessions" ON public.practice_sessions;

CREATE POLICY "Users can view own practice sessions" ON public.practice_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own practice sessions" ON public.practice_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice sessions" ON public.practice_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice sessions" ON public.practice_sessions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 9. LIBRARY PIECES TABLE
-- =====================================================
create table if not exists library_pieces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  composer text not null,
  era text default 'Other',
  status text default 'Not Started' check (status in ('Not Started', 'In Progress', 'Mastered')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists library_pieces_user_idx on library_pieces(user_id);

alter table library_pieces enable row level security;

DROP POLICY IF EXISTS "Users can view own library pieces" ON public.library_pieces;
DROP POLICY IF EXISTS "Users can create own library pieces" ON public.library_pieces;
DROP POLICY IF EXISTS "Users can update own library pieces" ON public.library_pieces;
DROP POLICY IF EXISTS "Users can delete own library pieces" ON public.library_pieces;

CREATE POLICY "Users can view own library pieces" ON public.library_pieces
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own library pieces" ON public.library_pieces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own library pieces" ON public.library_pieces
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own library pieces" ON public.library_pieces
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- DONE! Your social features database is ready.
-- =====================================================

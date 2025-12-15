-- Ensure uuid-ossp extension is enabled
create extension if not exists "uuid-ossp";

-- Create or update the profiles table
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  name text not null,
  username text not null unique,
  bio text,
  avatar_url text,
  instruments text[] default '{}',
  experience_level text,
  followers_count integer default 0,
  following_count integer default 0,
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: Allow authenticated users to insert/update their own profile
create policy "Allow users to insert their own profile" on public.profiles
  for insert using (auth.uid() = id);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policy: Allow anyone to select (public profiles)
create policy "Allow anyone to select profiles" on public.profiles
  for select using (true);

-- (Optional) Policy: Only allow delete by owner
create policy "Allow users to delete their own profile" on public.profiles
  for delete using (auth.uid() = id);

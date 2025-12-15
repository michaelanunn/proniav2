-- Add this to your supabase/schema.sql

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text CHECK (media_type IN ('video', 'audio')) NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reply_to uuid REFERENCES public.posts(id) ON DELETE SET NULL
);

-- Index for feed ordering
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

-- Policy: Only owner can insert/delete, all can select
-- (You may want to adjust for public/private posts)

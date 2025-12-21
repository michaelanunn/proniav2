-- =====================================================
-- PRONIA FOLLOW SYSTEM - SUPABASE SQL SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create the follows table (if not exists)
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate follows
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  
  -- Prevent self-follows at database level
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 2. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created ON follows(created_at DESC);

-- 3. Ensure profiles table has the count columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for follows table
-- Anyone can view follow relationships
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

-- Users can only create follows where they are the follower
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can only delete their own follows
DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- 6. RECONCILIATION FUNCTION
-- Recalculates all follower/following counts from actual relationships
CREATE OR REPLACE FUNCTION reconcile_follow_counts()
RETURNS void AS $$
BEGIN
  -- Update followers_count for all profiles
  UPDATE profiles p
  SET followers_count = (
    SELECT COUNT(*) 
    FROM follows f 
    WHERE f.following_id = p.id
  );
  
  -- Update following_count for all profiles  
  UPDATE profiles p
  SET following_count = (
    SELECT COUNT(*) 
    FROM follows f 
    WHERE f.follower_id = p.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. OPTIONAL: RPC functions for incrementing/decrementing (if you prefer RPC)
CREATE OR REPLACE FUNCTION increment_followers(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_followers(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 1) - 1) WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_following(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_following(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET following_count = GREATEST(0, COALESCE(following_count, 1) - 1) WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CLEANUP: Remove any test/placeholder data
-- Uncomment and modify these if you have test users to remove
-- DELETE FROM profiles WHERE email LIKE '%test%' OR name IN ('John Smith', 'Jane Doe', 'Test User');
-- DELETE FROM follows WHERE follower_id NOT IN (SELECT id FROM profiles) OR following_id NOT IN (SELECT id FROM profiles);

-- 9. RUN RECONCILIATION (execute after setup)
-- This ensures all counts are accurate based on actual relationships
SELECT reconcile_follow_counts();

-- 10. VERIFY: Check for orphaned follows (should return 0 rows)
SELECT f.* FROM follows f
LEFT JOIN profiles p1 ON f.follower_id = p1.id
LEFT JOIN profiles p2 ON f.following_id = p2.id
WHERE p1.id IS NULL OR p2.id IS NULL;

-- =====================================================
-- USAGE NOTES:
-- 
-- To manually reconcile counts at any time:
--   SELECT reconcile_follow_counts();
--
-- To check a user's actual follower count:
--   SELECT COUNT(*) FROM follows WHERE following_id = 'user-uuid-here';
--
-- To check a user's actual following count:
--   SELECT COUNT(*) FROM follows WHERE follower_id = 'user-uuid-here';
--
-- To see who follows a user:
--   SELECT p.* FROM profiles p 
--   JOIN follows f ON f.follower_id = p.id 
--   WHERE f.following_id = 'user-uuid-here';
--
-- To see who a user follows:
--   SELECT p.* FROM profiles p 
--   JOIN follows f ON f.following_id = p.id 
--   WHERE f.follower_id = 'user-uuid-here';
-- =====================================================


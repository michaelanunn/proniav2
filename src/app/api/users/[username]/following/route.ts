import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { username } = params;

  try {
    // Get the user ID from username
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ users: [] });
    }

    // Get current user to check follow status
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Get following
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select(`
        following_id,
        profiles!follows_following_id_fkey (
          id,
          name,
          username,
          avatar_url
        )
      `)
      .eq("follower_id", targetUser.id);

    if (followsError) {
      console.error("Error fetching following:", followsError);
      return NextResponse.json({ users: [] });
    }

    // Transform data and check if current user follows each
    const users = await Promise.all(
      (follows || []).map(async (follow: any) => {
        const profile = follow.profiles;
        let isFollowing = false;

        if (currentUser) {
          const { data: followCheck } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUser.id)
            .eq("following_id", profile.id)
            .single();
          isFollowing = !!followCheck;
        }

        return {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          isFollowing,
        };
      })
    );

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Following API error:", error);
    return NextResponse.json({ users: [] });
  }
}


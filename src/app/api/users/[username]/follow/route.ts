import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { username } = params;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get target user
    const { data: targetUser, error: targetError } = await supabase
      .from("profiles")
      .select("id, followers_count, following_count")
      .eq("username", username)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-follow
    if (user.id === targetUser.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUser.id)
      .single();

    if (existing) {
      // Unfollow - delete the relationship first
      const { error: deleteError } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUser.id);

      if (deleteError) {
        console.error("Delete follow error:", deleteError);
        return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 });
      }

      // Update counts directly (more reliable than RPC)
      await supabase
        .from("profiles")
        .update({ followers_count: Math.max(0, (targetUser.followers_count || 1) - 1) })
        .eq("id", targetUser.id);
      
      // Get current user's following count
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("following_count")
        .eq("id", user.id)
        .single();
      
      await supabase
        .from("profiles")
        .update({ following_count: Math.max(0, (currentProfile?.following_count || 1) - 1) })
        .eq("id", user.id);

      // Delete the follow notification
      await supabase
        .from("notifications")
        .delete()
        .eq("actor_id", user.id)
        .eq("user_id", targetUser.id)
        .eq("type", "follow");

      return NextResponse.json({ following: false });
    } else {
      // Follow - insert the relationship first
      const { error: insertError } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUser.id });

      if (insertError) {
        // Check if it's a duplicate key error (already following)
        if (insertError.code === '23505') {
          return NextResponse.json({ following: true, message: "Already following" });
        }
        console.error("Insert follow error:", insertError);
        return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
      }

      // Update counts directly
      await supabase
        .from("profiles")
        .update({ followers_count: (targetUser.followers_count || 0) + 1 })
        .eq("id", targetUser.id);
      
      // Get current user's following count
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("following_count")
        .eq("id", user.id)
        .single();
      
      await supabase
        .from("profiles")
        .update({ following_count: (currentProfile?.following_count || 0) + 1 })
        .eq("id", user.id);

      // Create notification for the followed user
      await supabase.from("notifications").insert({
        user_id: targetUser.id,
        actor_id: user.id,
        type: "follow",
        post_id: null,
      });

      return NextResponse.json({ following: true });
    }
  } catch (error: any) {
    console.error("Follow API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Check if following
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { username } = params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ following: false });
    }

    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (!targetUser) {
      return NextResponse.json({ following: false });
    }

    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUser.id)
      .single();

    return NextResponse.json({ following: !!existing });
  } catch (error) {
    return NextResponse.json({ following: false });
  }
}


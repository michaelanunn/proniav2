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
      .select("id")
      .eq("username", username)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUser.id)
      .single();

    if (existing) {
      // Unfollow
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUser.id);

      // Update counts
      await supabase.rpc("decrement_followers", { user_id: targetUser.id });
      await supabase.rpc("decrement_following", { user_id: user.id });

      return NextResponse.json({ following: false });
    } else {
      // Follow
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUser.id });

      // Update counts
      await supabase.rpc("increment_followers", { user_id: targetUser.id });
      await supabase.rpc("increment_following", { user_id: user.id });

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


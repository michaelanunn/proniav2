import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Reconcile follower/following counts for a user based on actual relationships
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count actual followers (people following this user)
    const { count: actualFollowers, error: followersError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id);

    if (followersError) {
      console.error("Error counting followers:", followersError);
      return NextResponse.json({ error: "Failed to count followers" }, { status: 500 });
    }

    // Count actual following (people this user follows)
    const { count: actualFollowing, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);

    if (followingError) {
      console.error("Error counting following:", followingError);
      return NextResponse.json({ error: "Failed to count following" }, { status: 500 });
    }

    // Update the profile with correct counts
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        followers_count: actualFollowers || 0,
        following_count: actualFollowing || 0,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating counts:", updateError);
      return NextResponse.json({ error: "Failed to update counts" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      followers_count: actualFollowers || 0,
      following_count: actualFollowing || 0,
    });
  } catch (error: any) {
    console.error("Reconcile counts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Admin endpoint to reconcile all users (requires special handling)
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get current user to verify they're authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id");

    if (profilesError || !profiles) {
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    let updated = 0;

    for (const profile of profiles) {
      // Count actual followers
      const { count: actualFollowers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id);

      // Count actual following
      const { count: actualFollowing } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id);

      // Update the profile
      await supabase
        .from("profiles")
        .update({
          followers_count: actualFollowers || 0,
          following_count: actualFollowing || 0,
        })
        .eq("id", profile.id);

      updated++;
    }

    return NextResponse.json({
      success: true,
      profiles_updated: updated,
    });
  } catch (error: any) {
    console.error("Reconcile all counts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


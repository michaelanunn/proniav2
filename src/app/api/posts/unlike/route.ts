import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { post_id } = await request.json();
    
    if (!post_id) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get post owner for notification deletion
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", post_id)
      .single();

    // Delete like
    const { error: unlikeError } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", post_id);

    if (unlikeError) {
      console.error("Unlike error:", unlikeError);
      return NextResponse.json({ error: "Failed to unlike post" }, { status: 500 });
    }

    // Delete the like notification
    if (post && post.user_id !== user.id) {
      await supabase
        .from("notifications")
        .delete()
        .eq("actor_id", user.id)
        .eq("user_id", post.user_id)
        .eq("type", "like")
        .eq("post_id", post_id);
    }

    return NextResponse.json({ liked: false });
  } catch (error: any) {
    console.error("Unlike API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


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

    // Check if already liked
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", post_id)
      .single();

    if (existing) {
      return NextResponse.json({ liked: true, message: "Already liked" });
    }

    // Get post owner for notification
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", post_id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Insert like
    const { error: likeError } = await supabase
      .from("likes")
      .insert({ user_id: user.id, post_id });

    if (likeError) {
      // Handle duplicate key error
      if (likeError.code === "23505") {
        return NextResponse.json({ liked: true, message: "Already liked" });
      }
      console.error("Like error:", likeError);
      return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
    }

    // Create notification for post owner (if not liking own post)
    if (post.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: user.id,
        type: "like",
        post_id,
      });
    }

    return NextResponse.json({ liked: true });
  } catch (error: any) {
    console.error("Like API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


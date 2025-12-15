import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET: List posts (optionally by user)
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("user_id");
  let query = supabase
    .from("posts")
    .select("id, user_id, media_url, media_type, caption, created_at, reply_to, profiles:profiles(id, username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();
  const { media_url, media_type, caption, reply_to } = body;
  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data, error } = await supabase.from("posts").insert([
    {
      user_id: user.id,
      media_url,
      media_type,
      caption,
      reply_to: reply_to || null,
    },
  ]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as
    | "signup"
    | "magiclink"
    | "email"
    | "recovery"
    | "invite"
    | "email_change";

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", url.origin));
  }

  const supabase = createRouteHandlerClient({ cookies });

  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/feed", url.origin));
}

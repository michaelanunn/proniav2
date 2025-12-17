import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const ALLOWED_TYPES = new Set([
  "signup",
  "magiclink",
  "email",
  "recovery",
  "invite",
  "email_change",
] as const);

type OtpType = (typeof ALLOWED_TYPES extends Set<infer T> ? T : never);

export async function GET(req: Request) {
  const url = new URL(req.url);

  const token_hash = url.searchParams.get("token_hash");
  const typeParam = url.searchParams.get("type");

  if (!token_hash || !typeParam || !ALLOWED_TYPES.has(typeParam as any)) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", url.origin));
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: typeParam as OtpType,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/post-auth", url.origin));
}

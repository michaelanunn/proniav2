import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: { message: "Missing email or code" } }, { status: 400 });
  }

  // Supabase does not natively support 6-digit code verification for email confirmation.
  // If using magic links, you must use the link in the email. If using OTP, use verifyOtp.
  // Here, we assume you have enabled OTP (one-time password) for email verification.
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email"
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

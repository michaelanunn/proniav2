import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as any;
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buffer = await file.arrayBuffer();
    const filename = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, Buffer.from(buffer), { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Store reference to file path in profiles table
    try {
      await supabase.from('profiles').update({ avatar_url: filename }).eq('id', user.id);
    } catch (err) {
      console.warn('Failed to update profile avatar reference:', err);
    }

    // Create a signed URL (valid 7 days) so private buckets work for clients
    const { data: signedData, error: signedErr } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filename, 60 * 60 * 24 * 7);

    if (signedErr) {
      console.warn('Signed URL creation failed, returning public URL fallback:', signedErr);
      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filename);
      return NextResponse.json({ url: publicData.publicUrl, path: filename });
    }

    return NextResponse.json({ url: signedData.signedUrl, path: filename });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

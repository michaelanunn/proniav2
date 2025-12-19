export const runtime = "nodejs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";


export async function POST(request: NextRequest) {
  // Debug: log cookies
  const allCookies = cookies();
  console.log("[UPLOAD API] Cookies received:", allCookies);
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as any;
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }


    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("[UPLOAD API] Supabase user:", user, "Error:", userError);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized (no user)" }, { status: 401 });
    }


    let buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${user.id}/${Date.now()}-${file.name}`;

    // Try to compress if image
    const mimeType = file.type || "";
    if (mimeType.startsWith("image/")) {
      try {
        // Use sharp to compress (resize if too large, convert to jpeg/webp, set quality)
        let sharpInstance = sharp(buffer);
        // Optionally resize if very large (e.g. max 2000px)
        sharpInstance = sharpInstance.resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true
        });
        // Convert to webp for best compression, fallback to jpeg if needed
        if (mimeType === "image/png" || mimeType === "image/jpeg") {
          buffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
        } else {
          buffer = await sharpInstance.toBuffer();
        }
      } catch (err) {
        console.warn("Image compression failed, uploading original:", err);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, buffer, { upsert: true });

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

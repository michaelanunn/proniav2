import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?spotify_error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard?spotify_error=no_code", request.url)
    );
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 
      `${request.nextUrl.origin}/api/spotify/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Spotify token error:", errorData);
      return NextResponse.redirect(
        new URL(`/dashboard?spotify_error=token_failed`, request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    // Redirect back to dashboard with token in URL params
    // In production, you should store this in your database instead
    const redirectUrl = new URL("/dashboard", request.url);
    redirectUrl.searchParams.set("spotify_token", tokenData.access_token);
    redirectUrl.searchParams.set("spotify_expires_in", tokenData.expires_in.toString());
    
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Spotify callback error:", err);
    return NextResponse.redirect(
      new URL("/dashboard?spotify_error=callback_failed", request.url)
    );
  }
}


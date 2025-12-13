import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=20",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();

    // Transform the data to a simpler format
    const tracks = data.items?.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join(", "),
      album: item.track.album.name,
      albumArt: item.track.album.images[0]?.url || "",
      playedAt: item.played_at,
    })) || [];

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("Spotify recent tracks error:", err);
    return NextResponse.json(
      { error: "Failed to fetch recent tracks" },
      { status: 500 }
    );
  }
}


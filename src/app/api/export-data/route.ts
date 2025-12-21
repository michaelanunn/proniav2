import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all practice sessions for the user
    const { data: sessions, error: fetchError } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    // Generate CSV content
    const headers = ["Date", "Duration (min)", "Pieces", "Notes"];
    const rows = (sessions || []).map((session) => {
      const date = new Date(session.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const durationMinutes = Math.round((session.duration || 0) / 60);
      const pieces = session.piece || session.pieces_practiced || "";
      const notes = (session.notes || "").replace(/"/g, '""'); // Escape quotes
      
      return `"${date}","${durationMinutes}","${pieces}","${notes}"`;
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Return as downloadable CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="pronia-practice-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


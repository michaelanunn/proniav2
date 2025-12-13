import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    // In production, get the customer ID from your database/session
    // For now, this is a placeholder - you'll need to store customer IDs when users subscribe
    const customerId = ""; // Get from your user's profile/database
    
    if (!customerId) {
      return NextResponse.json(
        { error: "No customer ID found. Please subscribe first." },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


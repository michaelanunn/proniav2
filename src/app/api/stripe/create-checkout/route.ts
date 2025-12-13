import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();
    
    // Get the origin for redirect URLs
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session with 3-day free trial
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID || "price_1SdpfJPwxnlJIe7lE1xqumz8",
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 3, // 3-day free trial like Speechify
      },
      payment_method_collection: "always", // Collect card upfront
      success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/record?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


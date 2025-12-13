"use client";

/**
 * Stripe Integration Hook
 * 
 * Uses environment variables for configuration.
 * Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file.
 */

import { useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

// Load Stripe with your publishable key from environment
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface UseStripeReturn {
  isLoading: boolean;
  error: string | null;
  startCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

export const useStripe = (): UseStripeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start Stripe Checkout for subscription with 3-day free trial
   */
  const startCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call your API endpoint to create a checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw error;
        }
      }
    } catch (err) {
      setError("Failed to start checkout. Please try again.");
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open Stripe Customer Portal for subscription management
   */
  const openCustomerPortal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError("Failed to open customer portal.");
      console.error("Portal error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    startCheckout,
    openCustomerPortal,
  };
};

export { stripePromise };
export default useStripe;

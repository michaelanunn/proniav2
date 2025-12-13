"use client";

import { X, Check, Mic, Sparkles, Crown, Loader2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStripe } from "@/hooks/useStripe";
import { usePremium } from "@/contexts/PremiumContext";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  "Unlimited practice recordings",
  "AI-powered performance analysis",
  "Progress insights & statistics",
  "Cloud backup for all recordings",
  "Custom themes & colors",
  "Spotify integration",
  "Priority support",
];

export const PaywallModal = ({
  isOpen,
  onClose,
}: PaywallModalProps) => {
  const { isLoading, startCheckout } = useStripe();
  const { hasUsedTrial, startTrial } = usePremium();

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    await startCheckout();
  };

  const handleStartTrial = async () => {
    // In production, this would also go through Stripe checkout
    // with trial_period_days set, collecting card upfront
    try {
      await startCheckout();
      startTrial();
      onClose();
    } catch (error) {
      console.error("Error starting trial:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 px-6 pt-8 pb-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Go Premium</h2>
          <p className="text-white/90 text-sm">
            Unlock the full power of Pronia
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Premium Features Badge */}
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl mb-6">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Mic className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">Recording + Themes</p>
              <p className="text-xs text-gray-500">Unlock all premium features</p>
            </div>
            <Sparkles className="h-5 w-5 text-orange-500" />
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-gray-900">$9.99</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Cancel anytime</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            {!hasUsedTrial ? (
              <Button
                onClick={handleStartTrial}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Start 3-Day Free Trial"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Subscribe Now"
                )}
              </Button>
            )}
            <p className="text-xs text-center text-gray-400">
              {!hasUsedTrial
                ? "Card required. No charge until trial ends."
                : "Secure payment powered by Stripe"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Crown, Check } from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial?: () => void;
  onSubscribe?: () => void;
  hasUsedTrial?: boolean;
}

export function PaywallModal({
  isOpen,
  onClose,
  onStartTrial,
  onSubscribe,
  hasUsedTrial = false,
}: PaywallModalProps) {
  if (!isOpen) return null;

  const features = [
    "Unlimited practice recording",
    "Advanced analytics",
    "Custom themes",
    "Priority support",
    "Ad-free experience",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              Pronia Premium
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-muted-foreground">
              Unlock all premium features and take your practice to the next level
            </p>

            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {!hasUsedTrial && onStartTrial && (
              <Button
                onClick={onStartTrial}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              >
                Start 7-Day Free Trial
              </Button>
            )}

            {onSubscribe && (
              <Button
                onClick={onSubscribe}
                variant={hasUsedTrial ? "default" : "outline"}
                className="w-full h-12"
              >
                {hasUsedTrial ? "Subscribe Now" : "Subscribe Without Trial"}
              </Button>
            )}

            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime. No credit card required for trial.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PaywallModal;
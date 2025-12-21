"use client";

import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  showBranding?: boolean;
}

export const Layout = ({ children, showBranding = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar showBranding={showBranding} />
      <main className="pt-16 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

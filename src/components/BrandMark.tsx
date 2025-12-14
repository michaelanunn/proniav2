"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string;
  className?: string;
}

export const BrandMark = ({ href = "/", className }: BrandMarkProps) => {
  const mark = (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      <img src="/logo.png" alt="Pronia logo" className="h-8 w-auto" />
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center justify-center">
      {mark}
    </Link>
  ) : (
    mark
  );
};

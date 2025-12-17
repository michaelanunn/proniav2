"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string;
  className?: string;
}

export const BrandMark = ({ href = "/", className }: BrandMarkProps) => {
	const mark = (
    <div className={cn("inline-flex items-center gap-2 select-none font-extrabold tracking-widest text-2xl md:text-3xl text-black", className)} style={{ fontFamily: 'Times New Roman, serif' }}>
      <span>PRONIA</span>
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

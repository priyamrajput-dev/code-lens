import React from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition
 * Wraps page content with a smooth fade + subtle translate entrance.
 * Automatically disabled on prefers-reduced-motion via CSS rules.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("page-enter w-full", className)}>
      {children}
    </div>
  );
}

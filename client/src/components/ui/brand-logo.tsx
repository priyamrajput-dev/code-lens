import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: "default" | "glow" | "minimal";
}

export function BrandLogo({
  className,
  size = 30,
  showText = true,
  variant = "default",
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none group/logo cursor-pointer", className)}>
      {/* High-Precision SVG Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-black dark:from-[#181A27] dark:via-[#11131F] dark:to-[#090A0F] border border-border/80 dark:border-white/10 shadow-sm shrink-0 overflow-hidden transition-all duration-300 group-hover/logo:border-accent-brand/40 group-hover/logo:shadow-md",
          variant === "glow" && "glow-accent",
        )}
        style={{ width: size, height: size }}
      >
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-brand/15 via-transparent to-emerald-500/10 opacity-70 pointer-events-none" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 relative z-10"
        >
          <defs>
            <linearGradient id="logo-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="logo-lens-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Outer Lens Ring */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="3 2"
            className="text-muted-foreground/30 transition-colors group-hover/logo:text-accent-brand/40"
          />

          {/* Precision Crosshair Ticks */}
          <path d="M16 2.5V5.5M16 26.5V29.5M2.5 16H5.5M26.5 16H29.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-muted-foreground/40" />

          {/* Code Angle Left Bracket */}
          <path
            d="M11 11.5L7.5 16L11 20.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground transition-transform duration-200 group-hover/logo:-translate-x-0.5"
          />

          {/* Code Angle Right Bracket */}
          <path
            d="M21 11.5L24.5 16L21 20.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground transition-transform duration-200 group-hover/logo:translate-x-0.5"
          />

          {/* Central Aperture Lens & Core Focal Dot */}
          <circle
            cx="16"
            cy="16"
            r="5"
            stroke="url(#logo-brand-grad)"
            strokeWidth="1.6"
          />
          <circle
            cx="16"
            cy="16"
            r="2"
            fill="url(#logo-brand-grad)"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Brand Typography Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-bold tracking-tight text-base text-foreground font-sans flex items-center gap-0.5">
            Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-extrabold">Lens</span>
          </span>
        </div>
      )}
    </div>
  );
}

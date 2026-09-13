import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function BrandLogo({ className, size = 28, showText = true }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className="relative flex items-center justify-center rounded-lg bg-[#111111] dark:bg-[#151515] border border-[#DED7CC] dark:border-[#252525] shadow-xs shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Subtle reticle / aperture lines */}
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 2"
            className="text-muted-foreground/30"
          />
          {/* Central orange aperture */}
          <circle
            cx="12"
            cy="12"
            r="4.5"
            stroke="#C86B16"
            strokeWidth="1.5"
            className="dark:stroke-[#D9781C]"
          />
          {/* Left code bracket */}
          <path
            d="M8 10L6.5 12L8 14"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />
          {/* Right code bracket */}
          <path
            d="M16 10L17.5 12L16 14"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />
          {/* Center focus dot */}
          <circle cx="12" cy="12" r="1.2" fill="#C86B16" className="dark:fill-[#D9781C]" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-semibold tracking-tight text-base text-foreground font-sans">
            Code<span className="text-[#C86B16] dark:text-[#D9781C]">Lens</span>
          </span>
        </div>
      )}
    </div>
  );
}

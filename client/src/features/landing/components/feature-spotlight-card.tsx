import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface FeatureSpotlightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureSpotlightCard({
  icon,
  title,
  description,
  className,
}: FeatureSpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      data-feature-card
      className={cn(
        "group relative rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-7 space-y-3.5 overflow-hidden transition-all duration-300",
        "hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5",
        "backdrop-blur-xs",
        className
      )}
    >
      {/* Amber Cursor Spotlight Overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(245, 158, 11, 0.12), transparent 75%)",
        }}
      />

      {/* Subtle Border Glow on Hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 border border-amber-500/30"
        aria-hidden="true"
      />

      {/* Icon with glowing pill */}
      <div className="relative z-10 size-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-105 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-300">
        {icon}
      </div>

      <div className="relative z-10 space-y-2">
        <h3 className="text-base font-semibold text-foreground tracking-tight group-hover:text-amber-500/90 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

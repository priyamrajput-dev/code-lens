import { type ReactNode } from "react";
import { clsx } from "clsx";

export interface EyebrowLabelProps {
  children: ReactNode;
  className?: string;
  variant?: "charcoal" | "orange";
}

export function EyebrowLabel({
  children,
  className,
  variant = "charcoal",
}: EyebrowLabelProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-1 rounded-[6px] text-[13px] font-medium tracking-wide uppercase leading-none select-none",
        variant === "charcoal"
          ? "bg-sand/50 text-charcoal border border-sand"
          : "bg-ember-orange/10 text-ember-orange border border-ember-orange/20",
        className
      )}
    >
      {children}
    </div>
  );
}
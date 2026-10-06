import { type ReactNode } from "react";
import { clsx } from "clsx";

export type BadgeVariant = "default" | "primary" | "outline" | "ghost" | "dark";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-sand/60 text-ink-black border border-sand",
    primary: "bg-ember-orange text-pure-white border border-transparent",
    outline: "bg-transparent text-pewter border border-sand",
    ghost: "bg-transparent text-warm-gray",
    dark: "bg-deep-charcoal text-sand border border-charcoal",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-caption",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[6px] font-medium leading-none select-none transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
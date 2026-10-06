import { type ReactNode } from "react";
import { clsx } from "clsx";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string | ReactNode;
  description?: string;
  align?: "left" | "center";
  size?: "md" | "lg";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  size = "md",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center max-w-2xl mx-auto" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="text-[13px] font-medium uppercase tracking-widest text-pewter">
          {eyebrow}
        </span>
      )}

      <h2
        className={clsx(
          "font-normal text-ink-black tracking-tight",
          size === "lg"
            ? "text-heading-lg leading-[1.0] tracking-[-0.04em]"
            : "text-heading leading-[1.05] tracking-[-0.03em]"
        )}
      >
        {title}
      </h2>

      {description && (
        <p className="text-body text-pewter font-normal leading-relaxed max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}
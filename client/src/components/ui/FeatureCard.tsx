import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";

export type FeatureCardVariant = "peach" | "white" | "dark";

export interface FeatureCardProps {
  eyebrow: string;
  heading: string;
  description: string;
  variant?: FeatureCardVariant;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function FeatureCard({
  eyebrow,
  heading,
  description,
  variant = "white",
  children,
  icon,
  className,
}: FeatureCardProps) {
  const shouldReduce = useReducedMotion();

  const variantStyles = {
    peach:
      "bg-gradient-to-br from-peach-blush to-sunset-coral text-ink-black border border-sunset-coral/30",
    white:
      "bg-pure-white text-ink-black border border-sand hover:border-charcoal/40",
    dark:
      "bg-deep-charcoal text-pure-white border border-charcoal hover:border-sand/40",
  };

  const eyebrowColor = {
    peach: "text-charcoal",
    white: "text-warm-gray",
    dark: "text-stone",
  };

  const headingColor = {
    peach: "text-ink-black",
    white: "text-ink-black",
    dark: "text-pure-white",
  };

  const descColor = {
    peach: "text-charcoal/90",
    white: "text-pewter",
    dark: "text-sand/80",
  };

  return (
    <motion.div
      whileHover={shouldReduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "rounded-[40px] p-8 flex flex-col justify-between overflow-hidden relative transition-colors duration-200 select-none",
        variantStyles[variant],
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span
            className={clsx(
              "text-[13px] font-medium uppercase tracking-wider",
              eyebrowColor[variant]
            )}
          >
            {eyebrow}
          </span>
          {icon && (
            <div
              className={clsx(
                "w-10 h-10 rounded-2xl flex items-center justify-center",
                variant === "peach"
                  ? "bg-pure-white/30 text-ink-black"
                  : variant === "dark"
                    ? "bg-charcoal text-pure-white"
                    : "bg-sand/30 text-ink-black"
              )}
            >
              {icon}
            </div>
          )}
        </div>

        <h3
          className={clsx(
            "text-[32px] font-normal leading-[1.05] tracking-[-0.03em] mb-3",
            headingColor[variant]
          )}
        >
          {heading}
        </h3>

        <p
          className={clsx(
            "text-body font-normal leading-relaxed",
            descColor[variant]
          )}
        >
          {description}
        </p>
      </div>

      {children && <div className="mt-6 pt-4">{children}</div>}
    </motion.div>
  );
}
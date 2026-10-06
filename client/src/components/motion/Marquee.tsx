import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface MarqueeProps {
  children: ReactNode;
  speed?: number; // duration in seconds
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  speed = 28,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <div className={`overflow-x-auto flex gap-8 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`group relative flex overflow-hidden select-none ${className}`}
      style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
    >
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        className={`flex shrink-0 items-center gap-12 pr-12 ${
          pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
        }`}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

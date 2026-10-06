import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionEasings } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.45,
  yOffset = 20,
  className,
  once = true,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: motionEasings.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

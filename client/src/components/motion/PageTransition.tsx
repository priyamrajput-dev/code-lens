import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionDurations, motionEasings } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: motionDurations.fast } }}
      transition={{
        duration: motionDurations.base,
        ease: motionEasings.easeOut,
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

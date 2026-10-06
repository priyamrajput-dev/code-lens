import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
}

const paddingMap = {
  none: "",
  sm: "p-4 sm:p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
};

export function Card({
  children,
  className,
  padding = "md",
  interactive = false,
  onClick,
}: CardProps) {
  const shouldReduce = useReducedMotion();

  if (interactive) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={shouldReduce ? undefined : { y: -4 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={clsx(
          "bg-pure-white rounded-[20px] border border-sand hover:border-charcoal/50 transition-colors duration-200 cursor-pointer select-none",
          paddingMap[padding],
          className
        )}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={clsx(
        "bg-pure-white rounded-[20px] border border-sand",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
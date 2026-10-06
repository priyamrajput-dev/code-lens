// Re-export core Motion primitives from motion/react and motion
export {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
} from "motion/react";

export { animate, inView, stagger, spring } from "motion";

// Custom animation hooks and helpers
export * from "./use-reveal";
export * from "./use-split-text";
export * from "./use-magnetic";
export * from "./use-counter";
export * from "./scroll-utils";

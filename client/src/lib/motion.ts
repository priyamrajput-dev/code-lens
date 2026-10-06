import type { Transition } from "motion/react";

/**
 * Code Lens Motion Tokens & Presets
 * Design language: "warm workshop with coral sparks"
 * Feel: warm, springy, confident, tactile, never jittery.
 */

export const motionDurations = {
  fast: 0.15,
  base: 0.25,
  slow: 0.5,
  hero: 0.9,
} as const;

export const motionEasings = {
  easeOut: [0.22, 1, 0.36, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  gentle: [0.16, 1, 0.3, 1],
} as const;

export const motionSprings = {
  snappy: {
    type: "spring",
    stiffness: 300,
    damping: 25,
    mass: 0.8,
  } as Transition,
  standard: {
    type: "spring",
    stiffness: 260,
    damping: 24,
  } as Transition,
  soft: {
    type: "spring",
    stiffness: 120,
    damping: 20,
  } as Transition,
  bouncy: {
    type: "spring",
    stiffness: 400,
    damping: 18,
  } as Transition,
};

export const staggerDelays = {
  fast: 0.04,
  base: 0.07,
  slow: 0.1,
} as const;

/**
 * Standard animation variants for component entrances
 */
export const fadeUpVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDurations.base,
      ease: motionEasings.easeOut,
    },
  },
};

export const scaleFadeVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: motionSprings.standard,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: motionDurations.fast },
  },
};

import { type RefObject, useEffect } from "react";
import { animate } from "motion";

export interface UseSplitTextOptions {
  type?: "words" | "lines" | "chars" | "lines,words";
  stagger?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  trigger?: RefObject<HTMLElement | null>;
  start?: string;
}

/**
 * useSplitText
 * Smooth text appearance without proprietary GSAP SplitText plugin.
 */
export function useSplitText(
  targetRef: RefObject<HTMLElement | null>,
  options: UseSplitTextOptions = {}
) {
  const {
    stagger = 0.04,
    duration = 0.8,
    delay = 0.1,
  } = options;

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    animate(
      el,
      { opacity: [0, 1], y: [16, 0] },
      { duration, delay, ease: [0.16, 1, 0.3, 1] }
    );
  }, [targetRef, stagger, duration, delay]);
}

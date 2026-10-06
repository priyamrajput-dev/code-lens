import { type RefObject, useEffect } from "react";
import { animate, inView } from "motion";

export interface UseRevealOptions {
  /** Target elements to animate (CSS selector). Defaults to container itself */
  target?: string;
  /** Y offset in px to animate from (default: 24) */
  y?: number;
  /** X offset in px to animate from (default: 0) */
  x?: number;
  /** Initial opacity (default: 0) */
  opacity?: number;
  /** Stagger delay between matched elements in seconds (default: 0.08) */
  stagger?: number;
  /** Duration in seconds (default: 0.7) */
  duration?: number;
  /** Delay before animation starts (default: 0) */
  delay?: number;
  ease?: string;
  start?: string;
  once?: boolean;
}

/**
 * useReveal
 * Motion inView reveal hook respecting prefers-reduced-motion.
 * Animates opacity and transforms smoothly when elements enter viewport.
 */
export function useReveal(
  scopeRef: RefObject<HTMLElement | null>,
  options: UseRevealOptions = {}
) {
  const {
    target,
    y = 24,
    x = 0,
    opacity = 0,
    stagger = 0.08,
    duration = 0.7,
    delay = 0,
  } = options;

  useEffect(() => {
    const el = scopeRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const elements = target ? Array.from(el.querySelectorAll<HTMLElement>(target)) : [el];
    elements.forEach((item) => {
      item.style.opacity = `${opacity}`;
      item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    const stop = inView(
      el,
      () => {
        elements.forEach((item, index) => {
          animate(
            item,
            { opacity: 1, y: 0, x: 0 },
            {
              duration,
              delay: delay + index * stagger,
              ease: [0.16, 1, 0.3, 1], // easeOutExpo
            }
          );
        });
      },
      { margin: "0px 0px -15% 0px", amount: "some" }
    );

    return () => stop();
  }, [scopeRef, target, y, x, opacity, stagger, duration, delay]);
}

import { type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap-setup";

export interface UseRevealOptions {
  /** Target elements to animate (CSS selector or element ref). Defaults to children of container */
  target?: string;
  /** Y offset in px to animate from (default: 24) */
  y?: number;
  /** X offset in px to animate from (default: 0) */
  x?: number;
  /** Initial opacity (default: 0) */
  opacity?: number;
  /** Stagger delay between matched elements in seconds (default: 0.1) */
  stagger?: number;
  /** Duration in seconds (default: 0.8) */
  duration?: number;
  /** Delay before animation starts (default: 0) */
  delay?: number;
  /** GSAP easing (default: "power3.out") */
  ease?: string;
  /** ScrollTrigger start point (default: "top 85%") */
  start?: string;
  /** Whether animation triggers only once (default: true) */
  once?: boolean;
}

/**
 * useReveal
 * Scoped ScrollTrigger reveal hook respecting prefers-reduced-motion.
 * Animates only transform (x, y) and opacity.
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
    stagger = 0.1,
    duration = 0.8,
    delay = 0,
    ease = "power3.out",
    start = "top 85%",
    once = true,
  } = options;

  useGSAP(
    () => {
      const el = scopeRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Normal animation for users without reduced motion preferences
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = target ? el.querySelectorAll(target) : el;
        if (!targets || (targets instanceof NodeList && targets.length === 0)) return;

        gsap.fromTo(
          targets,
          {
            opacity,
            y,
            x,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration,
            stagger,
            delay,
            ease,
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: once
                ? "play none none none"
                : "play none none reverse",
              once,
            },
          }
        );
      });

      // Reduced motion: ensure final visual state with 0 translation/animation
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const targets = target ? el.querySelectorAll(target) : el;
        if (targets) {
          gsap.set(targets, { opacity: 1, y: 0, x: 0 });
        }
      });
    },
    { scope: scopeRef, dependencies: [target, y, x, opacity, stagger, duration, delay, ease, start, once] }
  );
}

import { type RefObject, useEffect } from "react";
import { animate } from "motion";
import { useInView } from "motion/react";

export interface UseCounterOptions {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  ease?: string;
  start?: string;
}

/**
 * useCounter
 * Animates a numeric text node from `from` to `to` when scrolled into view using Motion.
 */
export function useCounter(
  ref: RefObject<HTMLElement | null>,
  options: UseCounterOptions
) {
  const {
    from = 0,
    to,
    duration = 1.6,
    decimals = 0,
    prefix = "",
    suffix = "",
  } = options;

  const isInView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !isInView) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      const formatted = decimals > 0 ? to.toFixed(decimals) : Math.round(to).toLocaleString();
      el.textContent = `${prefix}${formatted}${suffix}`;
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo / power3.out equivalent
      onUpdate: (latest) => {
        if (el) {
          const formatted = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString();
          el.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [isInView, from, to, duration, decimals, prefix, suffix, ref]);
}

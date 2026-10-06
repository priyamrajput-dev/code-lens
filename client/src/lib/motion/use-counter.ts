import { type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap-setup";

export interface UseCounterOptions {
  from?: number;
  to: number;
  duration?: number;
  ease?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  start?: string;
}

/**
 * useCounter
 * Animates a numeric text node from `from` to `to` when scrolled into view.
 */
export function useCounter(
  ref: RefObject<HTMLElement | null>,
  options: UseCounterOptions
) {
  const {
    from = 0,
    to,
    duration = 1.6,
    ease = "power2.out",
    decimals = 0,
    prefix = "",
    suffix = "",
    start = "top 85%",
  } = options;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counterObj = { val: from };

        gsap.to(counterObj, {
          val: to,
          duration,
          ease,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
          onUpdate: () => {
            if (el) {
              const formatted = decimals > 0
                ? counterObj.val.toFixed(decimals)
                : Math.round(counterObj.val).toLocaleString();
              el.textContent = `${prefix}${formatted}${suffix}`;
            }
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const formatted = decimals > 0
          ? to.toFixed(decimals)
          : Math.round(to).toLocaleString();
        el.textContent = `${prefix}${formatted}${suffix}`;
      });
    },
    { scope: ref, dependencies: [from, to, duration, ease, decimals, prefix, suffix, start] }
  );
}

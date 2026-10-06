import { type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "./gsap-setup";

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
 * Splits text into masked lines or words and animates them upwards with transform & opacity only.
 * Safely reverts the split DOM on unmount or media query change.
 */
export function useSplitText(
  targetRef: RefObject<HTMLElement | null>,
  options: UseSplitTextOptions = {}
) {
  const {
    type = "lines,words",
    stagger = 0.04,
    duration = 0.9,
    delay = 0.1,
    ease = "power3.out",
    start = "top 90%",
  } = options;

  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let split: SplitText | null = null;

        try {
          split = new SplitText(el, {
            type,
            linesClass: "split-line overflow-hidden py-0.5",
            wordsClass: "split-word inline-block",
          });

          const elementsToAnimate = type.includes("words") ? split.words : split.lines;

          gsap.fromTo(
            elementsToAnimate,
            {
              y: "115%",
              opacity: 0,
            },
            {
              y: "0%",
              opacity: 1,
              duration,
              stagger,
              delay,
              ease,
              scrollTrigger: options.trigger
                ? {
                    trigger: options.trigger.current || el,
                    start,
                    once: true,
                  }
                : undefined,
            }
          );
        } catch {
          // Graceful fallback if SplitText encounters unusual inline nodes
          gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration, delay, ease }
          );
        }

        return () => {
          if (split) {
            split.revert();
          }
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { opacity: 1, y: 0 });
      });
    },
    { scope: targetRef, dependencies: [type, stagger, duration, delay, ease, start] }
  );
}

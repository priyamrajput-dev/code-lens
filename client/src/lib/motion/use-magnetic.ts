import { type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap-setup";

export interface UseMagneticOptions {
  /** Maximum distance in px the element will shift (default: 16) */
  strength?: number;
  /** Active proximity radius in px around the button (default: 80) */
  radius?: number;
  /** Animation duration on release (default: 0.6) */
  duration?: number;
  /** Easing on return (default: "elastic.out(1, 0.3)") */
  ease?: string;
}

/**
 * useMagnetic
 * Pulls element toward mouse pointer when within proximity radius.
 * Active ONLY on fine pointer (desktop mouse/trackpad), disabled on touch devices and reduced motion.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  options: UseMagneticOptions = {}
) {
  const {
    strength = 16,
    radius = 80,
    duration = 0.6,
    ease = "elastic.out(1, 0.3)",
  } = options;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Only enable for desktop mice and users without reduced-motion preference
      mm.add(
        "(pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.25, ease: "power2.out" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.25, ease: "power2.out" });

          const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            const distance = Math.hypot(distanceX, distanceY);

            if (distance < radius) {
              const pullFactor = (1 - distance / radius) * strength;
              xTo((distanceX / radius) * pullFactor * 1.5);
              yTo((distanceY / radius) * pullFactor * 1.5);
            } else {
              xTo(0);
              yTo(0);
            }
          };

          const handleMouseLeave = () => {
            gsap.to(el, {
              x: 0,
              y: 0,
              duration,
              ease,
              overwrite: "auto",
            });
          };

          window.addEventListener("mousemove", handleMouseMove, { passive: true });
          el.addEventListener("mouseleave", handleMouseLeave);

          return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            el.removeEventListener("mouseleave", handleMouseLeave);
            gsap.set(el, { x: 0, y: 0 });
          };
        }
      );

      mm.add("(prefers-reduced-motion: reduce), (pointer: coarse)", () => {
        gsap.set(el, { x: 0, y: 0 });
      });
    },
    { scope: ref, dependencies: [strength, radius, duration, ease] }
  );
}

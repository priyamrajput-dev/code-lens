import { type RefObject, useEffect } from "react";
import { animate } from "motion";

export interface UseMagneticOptions {
  /** Maximum distance in px the element will shift (default: 16) */
  strength?: number;
  /** Active proximity radius in px around the button (default: 80) */
  radius?: number;
  /** Animation duration on release (default: 0.6) */
  duration?: number;
  /** Easing on return */
  ease?: string;
}

/**
 * useMagnetic
 * Pulls element toward mouse pointer when within proximity radius using spring Motion.
 * Active ONLY on fine pointer (desktop mouse/trackpad), disabled on touch devices and reduced motion.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  options: UseMagneticOptions = {}
) {
  const {
    strength = 16,
    radius = 80,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let isNear = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance < radius) {
        isNear = true;
        const pullFactor = (1 - distance / radius) * strength;
        const targetX = (distanceX / radius) * pullFactor * 1.5;
        const targetY = (distanceY / radius) * pullFactor * 1.5;

        animate(el, { x: targetX, y: targetY }, { duration: 0.2, ease: "easeOut" });
      } else if (isNear) {
        isNear = false;
        animate(
          el,
          { x: 0, y: 0 },
          { type: "spring", stiffness: 350, damping: 20 }
        );
      }
    };

    const handleMouseLeave = () => {
      if (isNear) {
        isNear = false;
        animate(
          el,
          { x: 0, y: 0 },
          { type: "spring", stiffness: 350, damping: 20 }
        );
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      el.style.transform = "";
    };
  }, [ref, strength, radius]);
}

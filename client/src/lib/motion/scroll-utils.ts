import { gsap, ScrollTrigger } from "./gsap-setup";

/**
 * scrollToTarget
 * Smooth, ScrollTrigger-aware scrolling to an anchor ID or element with offset for the fixed navbar.
 * Respects prefers-reduced-motion.
 */
export function scrollToTarget(targetIdOrElement: string | HTMLElement, offset: number = 72) {
  if (typeof window === "undefined") return;

  const target = typeof targetIdOrElement === "string"
    ? document.getElementById(targetIdOrElement.replace(/^#/, ""))
    : targetIdOrElement;

  if (!target) return;

  const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    window.scrollTo({ top: targetY, behavior: "auto" });
    return;
  }

  const scrollObj = { y: window.scrollY };

  gsap.to(scrollObj, {
    y: targetY,
    duration: 0.85,
    ease: "power3.out",
    onUpdate: () => {
      window.scrollTo(0, scrollObj.y);
      ScrollTrigger.update();
    },
    onComplete: () => {
      ScrollTrigger.refresh();
    },
  });
}

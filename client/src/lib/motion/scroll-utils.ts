/**
 * scrollToTarget
 * Smooth, reliable scrolling to an anchor ID or element with offset for the fixed navbar.
 * Respects prefers-reduced-motion and Tailwind scroll-mt-* classes (e.g. scroll-mt-24).
 */
export function scrollToTarget(targetIdOrElement: string | HTMLElement, offset: number = 80) {
  if (typeof window === "undefined") return;

  let target: HTMLElement | null = null;

  if (typeof targetIdOrElement === "string") {
    const cleanId = targetIdOrElement.replace(/^#/, "").trim();
    target = (document.getElementById(cleanId) ||
      document.querySelector(`[name="${cleanId}"]`) ||
      document.querySelector(`#${cleanId}`)) as HTMLElement | null;
  } else {
    target = targetIdOrElement;
  }

  if (!target) {
    console.warn(`[scrollToTarget] Target element not found:`, targetIdOrElement);
    return;
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Native scrollIntoView smoothly honors CSS scroll-margin-top (e.g. scroll-mt-24)
  // and avoids frame-by-frame conflict with html { scroll-behavior: smooth }
  try {
    target.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  } catch {
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
    window.scrollTo({
      top: targetY,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }
}

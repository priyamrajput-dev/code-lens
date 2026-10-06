import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let isInitialized = false;

export function initGSAP() {
  if (typeof window === "undefined" || isInitialized) {
    return { gsap, ScrollTrigger, SplitText };
  }

  // Register plugins once
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Set global defaults per motion specification
  gsap.defaults({
    duration: 0.8,
    ease: "power3.out",
  });

  // Re-calculate trigger offsets after web fonts finish rendering
  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    }).catch(() => {
      // Safe fallback if document.fonts.ready rejects
      ScrollTrigger.refresh();
    });
  }

  // Ensure window resize refreshes triggers cleanly
  window.addEventListener(
    "resize",
    () => {
      ScrollTrigger.refresh();
    },
    { passive: true }
  );

  isInitialized = true;
  return { gsap, ScrollTrigger, SplitText };
}

// Auto-initialize when module is loaded in browser
initGSAP();

export { gsap, ScrollTrigger, SplitText };

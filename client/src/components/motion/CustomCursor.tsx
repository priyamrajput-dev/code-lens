import { useEffect, useState } from "react";
import { motion, useSpring, useReducedMotion } from "motion/react";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(true);
  const shouldReduce = useReducedMotion();

  const spring = { stiffness: 450, damping: 28, mass: 0.5 };
  const cursorX = useSpring(-100, spring);
  const cursorY = useSpring(-100, spring);

  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(hasTouch);
    if (hasTouch || shouldReduce) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest("button, a, input, textarea, select, [role='button'], [tabindex='0']")
      );
      setHovered(isInteractive);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, visible, shouldReduce]);

  if (isTouch || shouldReduce || !visible) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: hovered ? 44 : 20,
        height: hovered ? 44 : 20,
        borderColor: hovered ? "rgba(255, 60, 0, 0.85)" : "rgba(223, 221, 216, 0.7)",
        backgroundColor: hovered ? "rgba(255, 60, 0, 0.08)" : "transparent",
      }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-solid"
      aria-hidden="true"
    />
  );
}

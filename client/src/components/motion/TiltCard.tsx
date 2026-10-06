import { useRef, useState, useEffect, type ReactNode } from "react";
import { motion, useSpring, useReducedMotion } from "motion/react";

interface TiltCardProps {
  children: ReactNode;
  maxTilt?: number;
  className?: string;
  glow?: boolean;
}

export function TiltCard({
  children,
  maxTilt = 6,
  className = "",
  glow = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, active: false });
  const shouldReduce = useReducedMotion();

  const springConfig = { stiffness: 220, damping: 20 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || shouldReduce || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPct = (x / rect.width - 0.5) * 2; // -1 to 1
    const yPct = (y / rect.height - 0.5) * 2; // -1 to 1

    rotateX.set(-yPct * maxTilt);
    rotateY.set(xPct * maxTilt);

    if (glow) {
      setGlowPos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        active: true,
      });
    }
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setGlowPos((prev) => ({ ...prev, active: false }));
  };

  if (isTouch || shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div style={{ perspective: 1000 }} className="inline-block w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative overflow-hidden ${className}`}
      >
        {children}

        {glow && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: glowPos.active ? 0.15 : 0,
              background: `radial-gradient(circle 350px at ${glowPos.x}% ${glowPos.y}%, rgba(255, 60, 0, 0.4), transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}
      </motion.div>
    </div>
  );
}

import { motion, useReducedMotion } from "motion/react";
import { motionEasings } from "@/lib/motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  highlightWord?: string;
  highlightClass?: string;
}

export function SplitText({
  text,
  className = "",
  delay = 0,
  highlightWord,
  highlightClass = "text-ember-orange",
}: SplitTextProps) {
  const words = text.split(" ");
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {words.map((word, i) => {
        const isHighlight =
          highlightWord &&
          word.toLowerCase().replace(/[^a-z]/g, "") ===
            highlightWord.toLowerCase().replace(/[^a-z]/g, "");

        return (
          <span
            key={i}
            className="inline-block overflow-hidden relative pb-[0.08em]"
          >
            <motion.span
              initial={{ y: "115%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: delay + i * 0.05,
                ease: motionEasings.easeOut,
              }}
              className={`inline-block ${isHighlight ? highlightClass : ""}`}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

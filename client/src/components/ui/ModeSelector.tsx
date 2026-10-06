import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Compass,
  GraduationCap,
  ListOrdered,
  Sparkles,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { clsx } from "clsx";

export interface Mode {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
}

export interface ModeSelectorProps {
  activeMode: string;
  onSelect: (mode: string) => void;
  modes?: Mode[];
  className?: string;
}

export const defaultModes: Mode[] = [
  {
    value: "overview",
    label: "Overview",
    icon: <Compass className="w-6 h-6" strokeWidth={1.5} />,
    description: "High-level summary of architecture & behavior",
  },
  {
    value: "beginner",
    label: "Beginner",
    icon: <GraduationCap className="w-6 h-6" strokeWidth={1.5} />,
    description: "Plain-English walkthrough with zero jargon",
  },
  {
    value: "line-by-line",
    label: "Line-by-line",
    icon: <ListOrdered className="w-6 h-6" strokeWidth={1.5} />,
    description: "Every statement annotated and decoded",
  },
  {
    value: "advanced",
    label: "Advanced",
    icon: <Sparkles className="w-6 h-6" strokeWidth={1.5} />,
    description: "Deep dive into complexity, memory & patterns",
  },
  {
    value: "security",
    label: "Security",
    icon: <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />,
    description: "Vulnerability analysis & sanitizer audit",
  },
  {
    value: "refactor",
    label: "Refactor",
    icon: <Wrench className="w-6 h-6" strokeWidth={1.5} />,
    description: "Modernize code smells & clean architecture",
  },
];

export function ModeSelector({
  activeMode,
  onSelect,
  modes = defaultModes,
  className,
}: ModeSelectorProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Explanation modes"
      className={clsx(
        "flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center",
        className
      )}
    >
      {modes.map((mode) => {
        const isActive = activeMode === mode.value;

        return (
          <button
            key={mode.value}
            role="radio"
            aria-checked={isActive}
            type="button"
            onClick={() => onSelect(mode.value)}
            className={clsx(
              "group relative flex flex-col items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl transition-all duration-150 cursor-pointer min-w-[76px]",
              isActive
                ? "text-ember-orange"
                : "text-pewter hover:text-ember-orange"
            )}
          >
            {/* Sliding background pill on active */}
            {isActive && (
              <motion.div
                layoutId="mode-active-pill"
                className="absolute inset-0 bg-pure-white rounded-2xl border border-sand"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}

            {/* Icon (24px outline) */}
            <span
              className={clsx(
                "relative z-10 transition-colors duration-150",
                isActive
                  ? "text-ember-orange"
                  : "text-pewter group-hover:text-ember-orange"
              )}
            >
              {mode.icon}
            </span>

            {/* Label (13px / 500) */}
            <span
              className={clsx(
                "relative z-10 text-[13px] font-medium tracking-tight transition-colors duration-150",
                isActive ? "text-ink-black" : "text-pewter group-hover:text-ink-black"
              )}
            >
              {mode.label}
            </span>

            {/* Orange underline indicator */}
            {isActive && (
              <motion.div
                layoutId="mode-active-underline"
                className="absolute bottom-1 w-6 h-[2px] bg-ember-orange rounded-full z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
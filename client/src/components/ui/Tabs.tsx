import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  size = "md",
}: TabsProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div
      role="tablist"
      className={clsx(
        "inline-flex items-center gap-1 p-1 bg-warm-canvas border border-sand rounded-pill select-none",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              "relative px-4 py-1.5 font-medium transition-colors duration-150 cursor-pointer rounded-pill flex items-center gap-2",
              size === "sm" ? "text-caption py-1 px-3" : "text-small-ui",
              isActive
                ? "text-ink-black"
                : "text-pewter hover:text-ink-black"
            )}
          >
            {/* Sliding white pill indicator */}
            {isActive && (
              <motion.div
                layoutId="tab-active-indicator"
                className="absolute inset-0 bg-pure-white rounded-pill border border-sand"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            {tab.icon && (
              <span className="relative z-10">{tab.icon}</span>
            )}

            <span className="relative z-10">{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={clsx(
                  "relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                  isActive
                    ? "bg-sand text-ink-black"
                    : "bg-sand/60 text-warm-gray"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
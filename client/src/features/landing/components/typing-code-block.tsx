import React, { useState, useEffect, useRef } from "react";
import { useInView } from "@/lib/motion";

interface TypingCodeBlockProps {
  lines: string[];
}

export function TypingCodeBlock({ lines }: TypingCodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "0px 0px -15% 0px" });
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setRevealedCount(lines.length);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setRevealedCount(current);
      if (current >= lines.length) {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isInView, lines.length]);

  return (
    <div
      ref={containerRef}
      className="p-3 rounded-lg bg-[#07080C] border border-[#1E2235] font-mono text-[11px] leading-relaxed overflow-x-auto text-slate-300"
    >
      {lines.slice(0, revealedCount).map((line, idx) => (
        <div key={idx} className="flex gap-3">
          <span className="text-slate-600 select-none w-4 text-right">{idx + 1}</span>
          <span className="text-amber-300/90">{line}</span>
        </div>
      ))}
    </div>
  );
}

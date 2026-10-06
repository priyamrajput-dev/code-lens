import React, { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import { useGSAP } from "@gsap/react";

interface TypingCodeBlockProps {
  lines: string[];
}

export function TypingCodeBlock({ lines }: TypingCodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(
          {},
          {
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
              onEnter: () => {
                setHasTriggered(true);
              },
            },
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        setRevealedCount(lines.length);
      });
    },
    { scope: containerRef, dependencies: [lines.length] }
  );

  useEffect(() => {
    if (!hasTriggered) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setRevealedCount(current);
      if (current >= lines.length) {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [hasTriggered, lines.length]);

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-border/60 bg-[#07080C] text-slate-300 p-3 sm:p-3.5 text-[11px] font-mono leading-relaxed overflow-x-auto shadow-inner"
    >
      <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
        // Recommended Fix:
      </div>
      <div className="space-y-0.5 text-slate-200">
        {lines.slice(0, Math.max(1, revealedCount)).map((line, idx) => (
          <div key={idx} className="whitespace-pre">
            <span>{line}</span>
            {revealedCount < lines.length && idx === revealedCount - 1 && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-amber-400 animate-pulse align-middle" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

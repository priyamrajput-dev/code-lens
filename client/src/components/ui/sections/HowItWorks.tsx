import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CodeCard } from "../CodeCard";
import { ArrowRight, Code, Sliders, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface Step {
  id: number;
  icon: typeof Code;
  title: string;
  tag: string;
  description: string;
  codeSnippet: string;
  language: string;
  mode: string;
}

const steps: Step[] = [
  {
    id: 1,
    icon: Code,
    title: "Drop or paste any snippet",
    tag: "Step 01",
    description:
      "Paste any confusing block, upload source files, or drag in snippets from TypeScript, Python, Rust, Go, or SQL.",
    codeSnippet: `// 1. Raw code input
function calculateThrottle(rateLimit: number, burstWindow: number) {
  const tokenBucket = Math.min(burstWindow, rateLimit * 1.5);
  return (tokensRemaining: number) => {
    if (tokensRemaining <= 0) return { allowed: false, retryAfter: 1000 };
    return { allowed: true, tokensRemaining: tokensRemaining - 1 };
  };
}`,
    language: "typescript",
    mode: "Raw Input",
  },
  {
    id: 2,
    icon: Sliders,
    title: "Pick your lens mode",
    tag: "Step 02",
    description:
      "Choose from 6 focused lenses: High-level Overview, Beginner friendly, Line-by-line breakdown, Deep Architecture, Security audit, or Refactor.",
    codeSnippet: `// 2. Mode selected: [Security Audit]
✓ Verified: No unbounded memory leak vectors
✓ Verified: Deterministic token bucket calculation
⚠️ Advisory: Consider clock-drift tolerance across cluster nodes
⚠️ Advisory: Set fail-open policy for non-critical telemetry`,
    language: "bash",
    mode: "Security Audit",
  },
  {
    id: 3,
    icon: Sparkles,
    title: "Get instant insight & chat",
    tag: "Step 03",
    description:
      "Receive streaming insights in plain English. Keep asking follow-up questions in the context-aware companion panel without leaving your flow.",
    codeSnippet: `// 3. AI Explanation & Refactoring
"This closure implements a leaky token bucket algorithm. 
It guarantees that consumers cannot exceed 'burstWindow'
while smoothly distributing calls across rateLimit intervals.
Recommended refactor: Extract clock interface for unit tests."`,
    language: "markdown",
    mode: "AI Explanation",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const shouldReduce = useReducedMotion();

  const currentStep = steps[activeStep];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Step Selection */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={clsx(
                  "text-left p-6 rounded-[24px] border transition-all duration-200 cursor-pointer relative",
                  isActive
                    ? "bg-pure-white border-ember-orange"
                    : "bg-transparent border-sand hover:border-charcoal/30 hover:bg-pure-white/40"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="how-it-works-pill"
                    className="absolute left-0 top-4 bottom-4 w-1 bg-ember-orange rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-medium",
                        isActive
                          ? "bg-ember-orange text-pure-white"
                          : "bg-sand text-ink-black"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[12px] font-mono uppercase tracking-wider text-warm-gray">
                      {step.tag}
                    </span>
                  </div>
                </div>

                <h3 className="text-[20px] font-medium text-ink-black tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-body text-pewter font-normal leading-relaxed text-[15px]">
                  {step.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Preview CodeCard with crossfade animation */}
        <div className="lg:col-span-7">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <CodeCard
                  title={`code-lens://preview/${currentStep.mode.toLowerCase().replace(/\s+/g, "-")}`}
                  code={currentStep.codeSnippet}
                  language={currentStep.language}
                  showLineNumbers={true}
                  radius="32"
                  scanning={activeStep === 1}
                  className="w-full min-h-[380px]"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
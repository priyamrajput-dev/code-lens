import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";

interface CodeCardProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  scanning?: boolean;
  className?: string;
  radius?: "20" | "32" | "40";
}

export function CodeCard({
  code,
  language = "typescript",
  title,
  showLineNumbers = true,
  highlightLines = [],
  scanning = false,
  className,
  radius = "20",
}: CodeCardProps) {
  const [copied, setCopied] = useState(false);
  const shouldReduce = useReducedMotion();

  const lines = useMemo(() => {
    return code.split("\n");
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  const radiusClass = {
    "20": "rounded-[20px]",
    "32": "rounded-[32px]",
    "40": "rounded-[40px]",
  }[radius];

  return (
    <div
      className={clsx(
        "relative bg-deep-charcoal border border-charcoal text-pure-white overflow-hidden flex flex-col select-none",
        radiusClass,
        className
      )}
    >
      {/* Scanning lens glow bar */}
      {scanning && !shouldReduce && (
        <motion.div
          animate={{
            y: ["0%", "100%", "0%"],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute left-0 right-0 h-10 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(255, 60, 0, 0.15), rgba(255, 60, 0, 0.25), transparent)",
            boxShadow: "0 0 15px rgba(255, 60, 0, 0.2)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Header with Mac-style muted dots */}
      <div className="h-11 px-4 border-b border-charcoal/80 flex items-center justify-between shrink-0 bg-deep-charcoal/95">
        <div className="flex items-center gap-2">
          {/* Mac-style dots in muted tones */}
          <div className="w-2.5 h-2.5 rounded-full bg-slate/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate/40" />

          {title && (
            <span className="ml-2 text-caption font-mono text-warm-gray truncate">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone">
            {language}
          </span>

          {/* Copy button with morphing checkmark icon */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-warm-gray hover:text-pure-white hover:bg-charcoal/60 transition-colors cursor-pointer"
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 text-[11px] text-ember-orange font-sans font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                Copied
              </motion.span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="p-4 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto flex-1 bg-deep-charcoal">
        <div className="table w-full">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);

            return (
              <div
                key={idx}
                className={clsx(
                  "table-row group transition-colors",
                  isHighlighted ? "bg-ember-orange/15" : "hover:bg-charcoal/30"
                )}
              >
                {showLineNumbers && (
                  <span className="table-cell select-none pr-4 text-right text-stone/50 w-8 font-mono text-[11px]">
                    {lineNum}
                  </span>
                )}
                <span className="table-cell whitespace-pre font-mono text-sand">
                  {formatSimpleSyntax(lineText)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Lightweight syntax colorizer for keywords, functions, comments
function formatSimpleSyntax(line: string) {
  if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
    return <span className="text-stone italic">{line}</span>;
  }

  const parts = line.split(/(\b(?:const|let|var|function|return|if|else|import|export|from|type|interface|async|await|class|new)\b)/g);

  return parts.map((part, i) => {
    if (
      ["const", "let", "var", "function", "return", "if", "else", "import", "export", "from", "type", "interface", "async", "await", "class", "new"].includes(
        part
      )
    ) {
      return (
        <span key={i} className="text-peach-blush font-medium">
          {part}
        </span>
      );
    }
    if (part.includes('"') || part.includes("'") || part.includes("`")) {
      return (
        <span key={i} className="text-[#a5d6a7]">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
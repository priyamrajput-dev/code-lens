import { useState, useRef, type FormEvent } from "react";
import { ArrowRight, CornerDownLeft } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Typewriter } from "@/components/motion/Typewriter";
import { clsx } from "clsx";

interface PromptBarProps {
  placeholder?: string;
  dynamicPlaceholders?: string[];
  onSubmit: (prompt: string) => void;
  className?: string;
  isStreaming?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  autoFocus?: boolean;
}

const defaultPlaceholders = [
  "Paste a tricky function to see how it works...",
  "Upload a React hook to find performance leaks...",
  "Audit an authentication middleware for security flaws...",
  "Refactor nested conditionals into clean guard clauses...",
];

export function PromptBar({
  placeholder,
  dynamicPlaceholders = defaultPlaceholders,
  onSubmit,
  className,
  isStreaming = false,
  value: controlledValue,
  onChange,
  autoFocus = false,
}: PromptBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduce = useReducedMotion();

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isControlled) {
      onChange?.(val);
    } else {
      setInternalValue(val);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isStreaming) return;
    onSubmit(value);
    if (!isControlled) {
      setInternalValue("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "relative w-full max-w-[680px] h-[56px] bg-pure-white rounded-[20px] border border-sand transition-all duration-200 flex items-center px-4 gap-3",
        isFocused && "border-ember-orange ring-2 ring-ember-orange/15",
        className
      )}
    >
      <div className="relative flex-1 h-full flex items-center overflow-hidden">
        {/* Animated Typewriter Placeholder when empty & unfocused */}
        {!value && !isFocused && !placeholder && (
          <div
            onClick={() => inputRef.current?.focus()}
            className="absolute inset-0 flex items-center text-stone text-body select-none pointer-events-none truncate"
          >
            <Typewriter phrases={dynamicPlaceholders} />
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || (isFocused ? "" : undefined)}
          disabled={isStreaming}
          autoFocus={autoFocus}
          className="w-full bg-transparent border-none outline-none text-body text-ink-black placeholder:text-stone font-sans"
        />
      </div>

      {/* Embedded 44px circular orange submit button with arrow */}
      <motion.button
        type="submit"
        disabled={isStreaming || !value.trim()}
        whileHover={shouldReduce || isStreaming || !value.trim() ? undefined : { scale: 1.05 }}
        whileTap={shouldReduce || isStreaming || !value.trim() ? undefined : { scale: 0.95 }}
        className={clsx(
          "w-[44px] h-[44px] rounded-full bg-ember-orange text-pure-white flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
          "hover:bg-burnt-rust focus-visible:outline-2 focus-visible:outline-ember-orange"
        )}
        aria-label="Submit code for explanation"
      >
        {isStreaming ? (
          <span
            className="w-4 h-4 border-2 border-pure-white border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : (
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
        )}
      </motion.button>
    </form>
  );
}
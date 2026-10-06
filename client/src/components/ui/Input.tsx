import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full bg-pure-white border border-sand rounded-[6px] px-3.5 py-2.5 text-body text-ink-black placeholder:text-stone font-sans",
          "transition-all duration-150 outline-none",
          "focus:border-ember-orange focus:ring-2 focus:ring-ember-orange/15",
          "disabled:opacity-50 disabled:bg-warm-canvas/50 disabled:cursor-not-allowed",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          "w-full bg-pure-white border border-sand rounded-[6px] p-3.5 text-body text-ink-black placeholder:text-stone font-sans resize-y",
          "transition-all duration-150 outline-none",
          "focus:border-ember-orange focus:ring-2 focus:ring-ember-orange/15",
          "disabled:opacity-50 disabled:bg-warm-canvas/50 disabled:cursor-not-allowed",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
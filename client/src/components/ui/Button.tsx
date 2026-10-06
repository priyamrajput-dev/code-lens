import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  icon,
  disabled,
  ...rest
}: ButtonProps) {
  const shouldReduce = useReducedMotion();

  const baseStyles =
    "group inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-ember-orange focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-caption rounded-pill",
    md: "px-5 py-2.5 text-small-ui rounded-pill",
    lg: "px-6 py-3 text-body rounded-pill",
  };

  const variantStyles = {
    primary:
      "bg-ember-orange text-pure-white border border-transparent hover:bg-burnt-rust active:bg-burnt-rust",
    secondary:
      "bg-transparent text-ink-black border-[1.5px] border-ink-black hover:bg-sand/30 active:bg-sand/50",
    ghost:
      "bg-transparent text-pewter hover:text-ink-black hover:bg-sand/30 active:bg-sand/50 border border-transparent",
  };

  return (
    <motion.button
      whileHover={shouldReduce || disabled || isLoading ? undefined : { scale: 1.02 }}
      whileTap={shouldReduce || disabled || isLoading ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        isLoading && "pointer-events-none opacity-80",
        className
      )}
      disabled={disabled || isLoading}
      {...(rest as any)}
    >
      {isLoading ? (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
      {icon && (
        <span className="inline-block transition-transform duration-150 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </motion.button>
  );
}
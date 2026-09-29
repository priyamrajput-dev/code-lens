import { cn } from "cn"

function Skeleton({ className, variant = "pulse", ...props }: React.ComponentProps<"div"> & { variant?: "pulse" | "shimmer" }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        variant === "shimmer"
          ? "animate-none shimmer rounded-md bg-muted"
          : "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
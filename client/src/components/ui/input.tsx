import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-card/50 px-3 py-1 text-xs transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:border-accent-brand focus-visible:ring-2 focus-visible:ring-accent-brand/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-card/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 shadow-2xs",
        className
      )}
      {...props}
    />
  )
}

export { Input }

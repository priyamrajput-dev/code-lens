import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

function Spinner({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"svg"> & { size?: "xs" | "sm" | "default" | "lg" }) {
  const sizeClasses = {
    xs: "size-3",
    sm: "size-3.5",
    default: "size-4",
    lg: "size-5",
  }
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("animate-spin text-foreground", sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Spinner }
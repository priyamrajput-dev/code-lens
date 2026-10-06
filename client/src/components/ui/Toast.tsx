import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id?: string;
  message: string;
  type?: ToastType;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  message,
  type = "info",
  onClose,
  className,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const shouldReduce = useReducedMotion();

  const iconMap: Record<ToastType, ReactNode> = {
    success: <Check className="w-4 h-4 text-green-600" />,
    error: <X className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-electric-blue" />,
  };

  const handleDismiss = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          layout
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={clsx(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-pure-white border border-sand rounded-[12px] text-small-ui text-ink-black min-w-[280px] max-w-sm select-none",
            className
          )}
          role="status"
        >
          <div className="shrink-0">{iconMap[type]}</div>
          <p className="flex-1 text-sm font-normal text-pewter">{message}</p>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-stone hover:text-ink-black hover:bg-sand/30 transition-colors cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
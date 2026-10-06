"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "relative inline-flex size-8.5 items-center justify-center rounded-lg border border-border bg-card/70 hover:bg-card hover:border-foreground/20 text-foreground transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95",
        className,
      )}
      aria-label="Toggle theme"
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-[#C86B16]" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-[#F5F5F5]" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

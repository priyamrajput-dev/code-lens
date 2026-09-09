import { ModeToggle } from "@/components/ui/mode-toggle";
import { SidebarUserButton } from "./sidebar-user-button";
import { Code2 } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-6">
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Code2 className="size-4" />
        </div>
        <span className="font-semibold">CodeLens</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <ModeToggle />
        <div className="md:hidden">
          <SidebarUserButton />
        </div>
      </div>
    </header>
  );
}

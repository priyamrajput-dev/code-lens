import { DashboardNav } from "./dashboard-nav";
import { SidebarUserButton } from "./sidebar-user-button";
import { Code2 } from "lucide-react";

export function DashboardSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Code2 className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight text-base">CodeLens</span>
          <span className="text-xs text-muted-foreground">AI Code Reviewer</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <DashboardNav />
      </div>

      <div className="p-4 border-t">
        <SidebarUserButton />
      </div>
    </aside>
  );
}

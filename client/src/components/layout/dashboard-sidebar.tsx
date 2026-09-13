import { Link } from "react-router-dom";
import { DashboardNav } from "./dashboard-nav";
import { SidebarUserButton } from "./sidebar-user-button";
import { BrandLogo } from "@/components/ui/brand-logo";

export function DashboardSidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/50 backdrop-blur-sm h-screen">
      <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <BrandLogo size={30} />
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted/40">
          v1.0
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-5">
        <DashboardNav />
      </div>

      <div className="p-3 border-t border-border bg-card/30 shrink-0">
        <SidebarUserButton />
      </div>
    </aside>
  );
}

import { Link } from "react-router-dom";
import { DashboardNav } from "./dashboard-nav";
import { SidebarUserButton } from "./sidebar-user-button";
import { BrandLogo } from "@/components/ui/brand-logo";

export function DashboardSidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/80 bg-card/60 backdrop-blur-md h-screen">
      <div className="p-5 border-b border-border/80 flex items-center justify-between shrink-0">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <BrandLogo size={30} />
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/80 text-muted-foreground bg-muted/60 font-semibold">
          v1.0
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-5">
        <DashboardNav />
      </div>

      <div className="p-3.5 border-t border-border/80 bg-card/40 shrink-0">
        <SidebarUserButton />
      </div>
    </aside>
  );
}

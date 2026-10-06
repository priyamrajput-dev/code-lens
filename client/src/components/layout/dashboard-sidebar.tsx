import { Link } from "react-router-dom";
import { DashboardNav } from "./dashboard-nav";
import { SidebarUserButton } from "./sidebar-user-button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  return (
    <aside className={cn(
      "hidden md:flex w-64 shrink-0 flex-col border-r border-border/60 bg-card/70 backdrop-blur-xl h-screen transition-all duration-300",
      "data-[state=collapsed]:w-20"
    )}>
      {/* Sidebar Header */}
      <div className="flex flex-col gap-4 p-5 border-b border-border/60 shrink-0">
        <Link to="/" className="hover:opacity-90 transition-opacity" aria-label="CodeLens Home">
          <BrandLogo size={30} />
        </Link>

        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground bg-muted/40 font-semibold self-center">
          v1.0
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5">
        <DashboardNav />
      </div>

      {/* User Section */}
      <div className="p-3.5 border-t border-border/60 bg-card/50 shrink-0">
        <SidebarUserButton />
      </div>
    </aside>
  );
}
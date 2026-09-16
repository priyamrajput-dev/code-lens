import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderGit2, Settings, History } from "lucide-react";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";

export const NAV_ITEMS = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Repositories",
    href: "/dashboard/repos",
    icon: FolderGit2,
  },
  {
    title: "Review History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "GitHub App",
    href: "/dashboard/github",
    icon: GitHubIcon,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
] as const;

interface DashboardNavProps {
  onItemClick?: () => void;
}

export function DashboardNav({ onItemClick }: DashboardNavProps) {
  const location = useLocation();

  return (
    <nav className="flex flex-col space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.href ||
          (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 relative group cursor-pointer",
              isActive
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className="flex-1 truncate">{item.title}</span>
            {isActive && (
              <span className="size-1.5 rounded-full bg-amber-500 shadow-xs" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

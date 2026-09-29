import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderGit2, Settings, History } from "lucide-react";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";

export const NAV_ITEMS = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Workspace summary",
  },
  {
    title: "Repositories",
    href: "/dashboard/repos",
    icon: FolderGit2,
    description: "Manage connected repos",
  },
  {
    title: "Review History",
    href: "/dashboard/history",
    icon: History,
    description: "Past review activity",
  },
  {
    title: "GitHub App",
    href: "/dashboard/github",
    icon: GitHubIcon,
    description: "Connection status",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account preferences",
  },
] as const;

interface DashboardNavProps {
  onItemClick?: () => void;
}

export function DashboardNav({ onItemClick }: DashboardNavProps) {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-1.5" aria-label="Dashboard navigation">
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
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer group/nav",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-foreground text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-background" : "text-muted-foreground group-hover/nav:text-foreground"
              )}
            />
            <span className="flex-1 truncate">{item.title}</span>
            {isActive && (
              <span className="size-1.5 rounded-full bg-accent-brand" />
            )}
            {item.description && (
              <span className="hidden xl:inline text-[10px] opacity-60">{item.description}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
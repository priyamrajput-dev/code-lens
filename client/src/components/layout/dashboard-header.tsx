import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SidebarUserButton } from "./sidebar-user-button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { FolderGit2, ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";

export function DashboardHeader() {
  return (
    <header className="shrink-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <BrandLogo size={28} />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link to="/dashboard/repos">
          <Button size="xs" variant="outline" className="gap-1.5 border-border hover:border-foreground/30 text-xs font-mono">
            <FolderGit2 className="size-3.5 text-[#C86B16] dark:text-[#D9781C]" />
            Repositories
          </Button>
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Landing Page
          <ArrowUpRight className="size-3 opacity-70" />
        </Link>

        <a
          href="https://github.com/priyamrajput-dev"
          target="_blank"
          rel="noreferrer"
          className="inline-flex size-8.5 items-center justify-center rounded-lg border border-border bg-card/60 hover:bg-card hover:border-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
          title="GitHub"
        >
          <GitHubIcon className="size-4" />
        </a>

        <ModeToggle />

        <div className="md:hidden">
          <SidebarUserButton />
        </div>
      </div>
    </header>
  );
}

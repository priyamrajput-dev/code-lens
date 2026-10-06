import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SidebarUserButton } from "./sidebar-user-button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { FolderGit2, ArrowUpRight, Menu, X } from "lucide-react";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";
import { DashboardNav } from "./dashboard-nav";

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Mobile: hamburger + brand */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="dashboard-mobile-nav"
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>

            <Link to="/" aria-label="CodeLens home" className="hover:opacity-90 transition-opacity">
              <BrandLogo size={28} />
            </Link>
          </div>

          {/* Desktop quick action */}
          <div className="hidden md:flex items-center">
            <Link to="/dashboard/repos">
              <Button size="xs" variant="outline" className="gap-1.5 border-border hover:border-foreground/40 text-xs font-mono">
                <FolderGit2 className="size-3.5 text-amber-500" />
                Repositories
              </Button>
            </Link>
          </div>

          {/* Center spacer */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Developer Workspace
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-1.5 rounded-md"
            >
              Landing Page
              <ArrowUpRight className="size-3 opacity-70" />
            </Link>

            <a
              href="https://github.com/priyamrajput-dev"
              target="_blank"
              rel="noreferrer"
              aria-label="CodeLens on GitHub"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:border-foreground/30"
            >
              <GitHubIcon className="size-4" />
            </a>

            <ModeToggle />

            <div className="md:hidden">
              <SidebarUserButton compact />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div
          id="dashboard-mobile-nav"
          className="md:hidden fixed inset-x-0 top-16 z-30 border-b border-border bg-card/95 backdrop-blur-xl p-4 shadow-2xl animate-slide-down"
        >
          <div className="flex flex-col gap-1.5">
            <DashboardNav onItemClick={() => setMobileMenuOpen(false)} />
          </div>
          <div className="mt-4 border-t border-border/60 pt-4">
            <SidebarUserButton />
          </div>
        </div>
      )}
    </>
  );
}
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
      <header className="shrink-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex size-8.5 items-center justify-center rounded-lg border border-border/80 bg-card/60 text-foreground cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <Link to="/" className="hover:opacity-90 transition-opacity">
            <BrandLogo size={28} />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/dashboard/repos">
            <Button size="xs" variant="outline" className="gap-1.5 border-border/80 hover:border-foreground/30 text-xs font-mono">
              <FolderGit2 className="size-3.5 text-amber-500" />
              Repositories
            </Button>
          </Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Landing Page
            <ArrowUpRight className="size-3 opacity-70" />
          </Link>

          <a
            href="https://github.com/priyamrajput-dev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card/60 hover:bg-card hover:border-foreground/20 text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
            title="GitHub"
          >
            <GitHubIcon className="size-3.5" />
          </a>

          <ModeToggle />

          <div className="md:hidden">
            <SidebarUserButton compact />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu for Dashboard */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 z-40 relative">
          <DashboardNav onItemClick={() => setMobileMenuOpen(false)} />
          <div className="pt-2 border-t border-border/60">
            <SidebarUserButton />
          </div>
        </div>
      )}
    </>
  );
}

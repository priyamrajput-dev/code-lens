import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, LogOut, LayoutDashboard, FolderGit2, History, ArrowRight, ShieldCheck } from "lucide-react";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";
import { cn } from "@/lib/utils";

export function SiteNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!session?.user;
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Repositories", href: isAuthenticated ? "/dashboard/repos" : "/sign-in" },
    { label: "History", href: isAuthenticated ? "/dashboard/history" : "/sign-in" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes("#")) {
      const hash = href.split("#")[1];
      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${hash}`);
        }
      } else {
        navigate(`/#${hash}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <BrandLogo size={32} />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur-md shadow-2xs">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/priyamrajput-dev"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card/60 hover:bg-card hover:border-foreground/25 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-2xs"
            title="GitHub Repository"
          >
            <GitHubIcon className="size-4" />
          </a>

          <ModeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="hidden sm:inline-block">
                <Button variant="outline" size="sm" className="gap-1.5 font-medium border-border/80 hover:bg-card">
                  <LayoutDashboard className="size-3.5 text-amber-500" />
                  Dashboard
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center outline-none cursor-pointer">
                  <Avatar className="size-8 border border-border/80 shadow-2xs transition-transform duration-200 hover:scale-105">
                    {user?.image ? <AvatarImage src={user.image} alt={user.name || "User"} /> : null}
                    <AvatarFallback className="text-xs bg-muted text-foreground font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-lg border-border/80">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 size-4 text-amber-500" />
                    Overview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/repos")} className="cursor-pointer">
                    <FolderGit2 className="mr-2 size-4 text-emerald-500" />
                    Repositories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/history")} className="cursor-pointer">
                    <History className="mr-2 size-4 text-blue-500" />
                    Review History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/sign-in">
                <Button
                  size="sm"
                  variant="brand"
                  className="font-medium px-4 shadow-sm gap-1.5 cursor-pointer rounded-lg"
                >
                  Sign In
                  <ArrowRight className="size-3.5 opacity-90" />
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card/70 text-foreground cursor-pointer transition-colors hover:bg-card"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, link.href);
              }}
              className={cn(
                "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location.pathname === link.href
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-amber-500 hover:bg-muted/60"
            >
              Dashboard Overview →
            </Link>
          )}

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">CodeLens v1.0</span>
            <a
              href="https://github.com/priyamrajput-dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <GitHubIcon className="size-3.5" />
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '@/components/ui/brand-logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Menu,
    X,
    LogOut,
    LayoutDashboard,
    FolderGit2,
    History,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';
import { GitHubIcon } from '@/features/auth/components/github-sign-in-form';
import { cn } from '@/lib/utils';
import { routePreloadProps } from '@/lib/route-utils';

export function SiteNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isAuthenticated = !!session?.user;
    const user = session?.user;

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'U';

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Repositories', href: isAuthenticated ? '/dashboard/repos' : '/sign-in' },
        { label: 'History', href: isAuthenticated ? '/dashboard/history' : '/sign-in' },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.includes('#')) {
            const hash = href.split('#')[1];
            if (location.pathname === '/') {
                e.preventDefault();
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', `#${hash}`);
                }
            } else {
                navigate(`/#${hash}`);
            }
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/sign-in');
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Left: Brand Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2.5 hover:opacity-95 transition-opacity"
                    aria-label="CodeLens Home"
                >
                    <BrandLogo size={32} />
                </Link>

                {/* Center: Desktop Navigation */}
                <nav
                    className="hidden md:flex items-center gap-0.5 rounded-full border border-border/60 bg-card/50 px-1 py-1 text-xs font-medium backdrop-blur-sm"
                    aria-label="Main navigation"
                >
                    {navLinks.map((link) => {
                        const isActive =
                            link.href === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.label}
                                to={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={cn(
                                    'px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-medium',
                                    isActive
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <a
                        href="https://github.com/priyamrajput-dev"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="CodeLens on GitHub"
                        className="hidden sm:inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card/50 text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:border-foreground/30"
                    >
                        <GitHubIcon className="size-4" />
                    </a>

                    <ModeToggle />

                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <Link to="/dashboard" {...routePreloadProps('overview')} className="hidden sm:inline-flex">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 font-medium border-border/70 hover:bg-card"
                                >
                                    <LayoutDashboard className="size-3.5 text-amber-500" />
                                    Dashboard
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    className="flex items-center outline-none cursor-pointer"
                                    aria-label="User menu"
                                >
                                    <Avatar className="size-8 border border-border/60 shadow-sm transition-transform duration-200 hover:scale-105">
                                        {user?.image ? (
                                            <AvatarImage
                                                src={user.image}
                                                alt={user.name || 'User'}
                                            />
                                        ) : null}
                                        <AvatarFallback className="text-xs bg-muted text-foreground font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 mt-2 rounded-xl border-border/80 shadow-lg"
                                >
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none text-foreground">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => navigate('/dashboard')}
                                        className="cursor-pointer"
                                    >
                                        <LayoutDashboard className="mr-2 size-4 text-amber-500" />
                                        Overview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => navigate('/dashboard/repos')}
                                        className="cursor-pointer"
                                    >
                                        <FolderGit2 className="mr-2 size-4 text-emerald-500" />
                                        Repositories
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => navigate('/dashboard/history')}
                                        className="cursor-pointer"
                                    >
                                        <History className="mr-2 size-4 text-blue-500" />
                                        Review History
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/sign-in" {...routePreloadProps('signIn')}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 font-medium border-border/70 hover:bg-card hidden sm:inline-flex"
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/sign-in" {...routePreloadProps('signIn')}>
                                <Button
                                    size="sm"
                                    variant="brand"
                                    className="font-medium px-4 shadow-sm gap-1.5 cursor-pointer rounded-lg"
                                >
                                    Get Started
                                    <ArrowRight className="size-3.5 opacity-90" />
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="site-mobile-nav"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        className="md:hidden inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card/50 text-foreground transition-colors hover:bg-card"
                    >
                        {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div
                    id="site-mobile-nav"
                    className="md:hidden fixed inset-x-0 top-16 z-40 border-b border-border bg-background/95 backdrop-blur-xl p-4 shadow-2xl animate-slide-down"
                >
                    <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                        {navLinks.map((link) => {
                            const isActive =
                                link.href === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    onClick={(e) => {
                                        handleNavClick(e, link.href);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        'block px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                                        isActive
                                            ? 'bg-muted text-foreground font-semibold'
                                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        {isAuthenticated && (
                            <Link
                                to="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 rounded-lg text-sm font-medium text-amber-500 hover:bg-muted/60"
                            >
                                Dashboard Overview →
                            </Link>
                        )}

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground font-mono">
                                CodeLens v1.0
                            </span>
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
                    </nav>
                </div>
            )}
        </header>
    );
}

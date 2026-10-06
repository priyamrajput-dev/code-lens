import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from "motion/react";
import { Button } from "./Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  href: string;
  isNew?: boolean;
}

const navItems: NavItem[] = [
  { label: "Workspace", href: "/app", isNew: true },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "History", href: "/history" },
  { label: "Settings", href: "/settings" },
];

export function NavBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const shouldReduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    if (latest > 50 && diff > 10 && !mobileOpen) {
      setHidden(true);
    } else if (diff < -8) {
      setHidden(false);
    }

    setScrolled(latest > 20);
  });

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden && !shouldReduce ? "hidden" : "visible"}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={clsx(
          "sticky top-0 z-40 w-full transition-all duration-200",
          scrolled
            ? "bg-warm-canvas/90 backdrop-blur-md border-b border-sand shadow-none"
            : "bg-warm-canvas border-b border-sand/40"
        )}
      >
        <div className="max-w-1200 mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink-black hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-ember-orange flex items-center justify-center text-pure-white font-mono font-medium text-sm">
              CL
            </div>
            <span className="font-sans font-medium text-[19px] tracking-tight text-ink-black">
              Code Lens
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href) ||
                    (item.href.startsWith("/#") && location.hash === item.href.slice(1));

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onMouseEnter={() => setHoveredPath(item.href)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className="relative px-3.5 py-1.5 text-small-ui font-medium text-slate hover:text-ink-black transition-colors flex items-center gap-2"
                >
                  <span>{item.label}</span>

                  {item.isNew && (
                    <span className="bg-ember-orange text-pure-white text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-[6px] uppercase leading-none">
                      New
                    </span>
                  )}

                  {/* Shared layout active underline */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-ember-orange rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover indicator */}
                  {!isActive && hoveredPath === item.href && !shouldReduce && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-sand rounded-full"
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/app">
              <Magnetic strength={0.3} distance={60}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Open Studio
                </Button>
              </Magnetic>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-ink-black rounded-lg hover:bg-sand/30"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-warm-canvas border-b border-sand px-6 py-6 overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className="flex items-center justify-between py-2 text-body font-medium text-ink-black border-b border-sand/40"
                  >
                    <span>{item.label}</span>
                    {item.isNew && (
                      <span className="bg-ember-orange text-pure-white text-xs px-2 py-0.5 rounded-[6px]">
                        New
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-2">
                <Link to="/app" className="block w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Open Studio
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
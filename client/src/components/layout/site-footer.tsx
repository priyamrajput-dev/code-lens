import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/ui/brand-logo";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur-xs transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <BrandLogo size={28} />
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              AI-powered code reviews for better software. Catch correctness bugs, security vulnerabilities, and performance bottlenecks before they hit production.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                All AI Engine Services Operational
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/dashboard/repos" className="hover:text-foreground transition-colors">
                  Repositories & Indexing
                </Link>
              </li>
              <li>
                <Link to="/dashboard/history" className="hover:text-foreground transition-colors">
                  Review History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 font-mono">
              Integrations & Community
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/dashboard/github" className="hover:text-foreground transition-colors">
                  GitHub App Integration
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/priyamrajput-dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <GitHubIcon className="size-3.5" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link to="/dashboard/settings" className="hover:text-foreground transition-colors">
                  Account & Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CodeLens. Built for developers with precision.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">RAG Vector Indexing • Gemini 2.0 • Octokit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/ui/brand-logo";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/40 backdrop-blur-sm transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 md:col-span-2 space-y-3.5">
            <BrandLogo size={30} />
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Autonomous, context-aware AI code reviews for GitHub pull requests. Catch correctness bugs, security vulnerabilities, and performance bottlenecks with codebase intelligence.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                All AI Engine Services Operational
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3.5 font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-foreground transition-colors">
                  Interactive Demo
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
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3.5 font-mono">
              Integrations & Docs
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
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
                  Account & Subscriptions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CodeLens. Built for engineering teams who value code excellence.</p>
          <div className="flex items-center gap-4 text-muted-foreground/70">
            <span className="font-mono text-[11px]">Pinecone RAG • Gemini 2.0 • Octokit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

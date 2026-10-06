import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Code2,
  GitPullRequest,
  Database,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Cpu,
  Layers,
  Play,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { InteractiveWalkthroughSection } from "../components/interactive-walkthrough-section";

export function LandingPage() {
  const [copiedSample, setCopiedSample] = useState(false);

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", "#how-it-works");
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 60);
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const heroCode = `// User authentication & session handler
export async function authenticateUser(req: Request, db: Database) {
  const { token, email } = await req.json();

  // Query session from database
  const user = await db.query(
    \`SELECT * FROM users WHERE email = '\${email}'\`
  );

  if (!user || user.token !== token) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({ success: true, user });
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(heroCode);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <SiteNavbar />

      {/* Global Background Grid & Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-tech-grid opacity-20 mask-radial-hero" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/8 dark:bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm text-xs font-mono shadow-sm">
              <span className="relative flex items-center">
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-amber-500" />
                <span className="relative w-2 h-2 rounded-full bg-amber-500" />
              </span>
              <span className="font-semibold text-foreground tracking-wide text-[11px]">
                Autonomous PR Code Reviews
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-[11px]">Pinecone RAG + Gemini 2.0</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Write better code. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-amber-500 dark:to-amber-400 font-extrabold">
                Ship with confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Review your pull requests with a 24/7 intelligent AI reviewer that catches bugs, security flaws, and performance regressions using deep codebase context.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/sign-in">
                <Button
                  size="lg"
                  variant="brand"
                  className="font-semibold px-6 py-4 rounded-xl shadow-md gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-2 px-5 py-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card text-foreground font-medium text-sm transition-all duration-200"
              >
                <Play className="size-3.5 fill-amber-500 text-amber-500" />
                Watch Interactive Demo
              </button>
            </div>

            {/* Quick Benefits Checklist */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border/50 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Zero configuration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Automated GitHub webhooks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Pinecone vector codebase indexing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Reviewer Visual */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl border border-border/80 bg-[#07080C] text-[#F8FAFC] shadow-xl overflow-hidden font-mono text-xs">
              {/* Terminal Window Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#11131F] border-b border-[#1E2235]">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-[#F43F5E]/90" />
                  <div className="size-2.5 rounded-full bg-[#F59E0B]/90" />
                  <div className="size-2.5 rounded-full bg-[#10B981]/90" />
                  <span className="ml-2 text-[11px] text-slate-400">auth-controller.ts</span>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg cursor-pointer"
                  title="Copy sample snippet"
                  aria-label={copiedSample ? "Code copied" : "Copy sample snippet"}
                >
                  {copiedSample ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 overflow-x-auto text-[12px] leading-relaxed text-slate-300 bg-[#07080C]">
                <pre className="font-mono">
                  <code>{heroCode}</code>
                </pre>
              </div>

              {/* Live AI Annotations Overlay */}
              <div className="p-3.5 border-t border-[#1E2235] bg-[#0D0E15] space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3 text-amber-400" />
                    AI Findings Detected (2)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/25">
                    Score: 68/100
                  </span>
                </div>

                {/* Finding 1: Security Alert */}
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-rose-400 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[10px] uppercase font-bold">SECURITY</span>
                    <span>Line 6: Potential SQL Injection (CWE-89)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-snug">
                    Direct template literal interpolation into SQL query. User input is unescaped.
                  </p>
                </div>

                {/* Finding 2: Bug */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-amber-400 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] uppercase font-bold">BUG</span>
                    <span>Line 10: Unhandled null pointer</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-snug">
                    Accessing <code className="text-white">user.token</code> may throw if database query returns empty.
                  </p>
                </div>

                {/* Quick Action */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Gemini 2.0 • Pinecone RAG</span>
                  <button
                    type="button"
                    onClick={scrollToHowItWorks}
                    className="text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Explore demo walkthrough
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Video Demo Walkthrough Section */}
      <InteractiveWalkthroughSection />

      {/* Core Features Grid */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Engineered for Code Excellence
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Built for software engineering teams who prioritize velocity, stability, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-3 hover:border-foreground/25 hover:shadow-sm transition-all">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm">
              <ShieldAlert className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Security & Vulnerability Audits
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Catches SQL injections, authentication bypasses, exposed API secrets, unsafe regexes, and unvalidated user inputs.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-3 hover:border-foreground/25 hover:shadow-sm transition-all">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm">
              <Zap className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Performance Regression Checks
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Flags N+1 queries, unindexed queries, memory leaks, unmemoized render cascades, and heavy synchronous loops.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-3 hover:border-foreground/25 hover:shadow-sm transition-all">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm">
              <GitPullRequest className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              GitHub Native Webhooks
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Listens to pull request events in real time. The moment a PR is opened or synchronized, CodeLens analyzes the git patch.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-3 hover:border-foreground/25 hover:shadow-sm transition-all">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm">
              <Database className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Pinecone Vector RAG
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chunks and indexes entire repository codebases to provide reviews with full context into your modules and types.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-3 hover:border-foreground/25 hover:shadow-sm transition-all">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm">
              <Layers className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Architecture & DRY Evaluation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Highlights duplicate code, tight coupling, SOLID violations, missing null checks, and unclear naming conventions.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-3 hover:border-foreground/25 hover:shadow-sm transition-all">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-sm">
              <Code2 className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              1-Click Actionable Code Fixes
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generates ready-to-merge markdown diff suggestions directly inside GitHub pull request comment threads.
            </p>
          </div>
        </div>
      </section>

      {/* Real Review Experience Preview */}
      <section className="relative z-10 py-20 border-t border-border/60 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Live Review Output
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Actionable Feedback at a Glance
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Review results categorize issues by severity with line numbers and recommended replacements.
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card shadow-xl p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Review Score Card */}
              <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-xl border border-border/70 bg-secondary-bg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Review Score
                    </span>
                    <Badge variant="success">
                      Good Quality
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight text-foreground font-mono">
                      87
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">/ 100</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Code demonstrates clean architecture. 2 non-blocking warnings and 3 readability recommendations identified.
                  </p>
                </div>

                <div className="pt-6 border-t border-border/60 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Critical Issues
                    </span>
                    <span className="font-mono font-bold text-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2 rounded-full bg-amber-500" />
                      Warnings
                    </span>
                    <span className="font-mono font-bold text-foreground">2</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2 rounded-full bg-blue-500" />
                      Suggestions
                    </span>
                    <span className="font-mono font-bold text-foreground">3</span>
                  </div>
                </div>
              </div>

              {/* Sample Findings List */}
              <div className="lg:col-span-8 space-y-4">
                {/* Finding 1 */}
                <div className="rounded-xl border border-amber-500/30 bg-card p-4.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        WARNING
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">Line 24</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">Performance</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Inefficient Database Query Inside Iteration
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This query executes sequentially inside a loop and will introduce severe latency with larger datasets (N+1 query antipattern).
                  </p>
                  <div className="rounded-lg border border-border/60 bg-[#07080C] text-slate-300 p-3 text-[11px] font-mono">
                    <span className="text-emerald-400">// Recommended Fix:</span>
                    <br />
                    const userIds = users.map(u =&gt; u.id);
                    <br />
                    const profiles = await db.query(`SELECT * FROM profiles WHERE user_id IN (?)`, [userIds]);
                  </div>
                </div>

                {/* Finding 2 */}
                <div className="rounded-xl border border-border/60 bg-card p-4.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        SUGGESTION
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">Line 42</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">Readability</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Extract Complex Validation to Pure Utility
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Splitting this compound condition into an exported helper improves unit testability and simplifies cognitive load.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-card/90 via-card/50 to-card/20 p-8 sm:p-12 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute -right-24 -top-24 size-60 rounded-full bg-amber-500/8 dark:bg-amber-500/12 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 size-60 rounded-full bg-emerald-500/5 dark:bg-emerald-500/8 blur-3xl pointer-events-none" />

          <Badge variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            Ready to ship cleaner code?
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
            Start reviewing your code in seconds.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Connect your GitHub account to enable automatic PR reviews for your team with codebase RAG context.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/sign-in">
              <Button size="lg" variant="brand" className="font-semibold px-6 py-4 rounded-xl shadow-md gap-2 text-sm cursor-pointer">
                Connect GitHub & Protect PRs
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card text-foreground font-medium text-sm transition-all"
            >
              Watch Interactive Demo
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
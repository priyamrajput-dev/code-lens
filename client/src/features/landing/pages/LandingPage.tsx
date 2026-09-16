import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Code2,
  GitPullRequest,
  Database,
  ArrowRight,
  Terminal,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Cpu,
  Layers,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FolderGit2,
  CheckCircle,
} from "lucide-react";

export function LandingPage() {
  const [copiedSample, setCopiedSample] = useState(false);

  // Video / Interactive Demo Walkthrough State
  const [demoStep, setDemoStep] = useState<1 | 2 | 3>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDemoStep((s) => (s === 3 ? 1 : ((s + 1) as 1 | 2 | 3)));
          return 0;
        }
        return prev + 2; // ~5 seconds per chapter
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSelectStep = (step: 1 | 2 | 3) => {
    setDemoStep(step);
    setProgress(0);
  };

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
    <div className="min-h-screen flex flex-col bg-background selection:bg-amber-500/20 relative overflow-x-hidden">
      <SiteNavbar />

      {/* Global Background Grid & Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-tech-grid opacity-25 mask-radial-hero" />
      <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-amber-500/10 dark:bg-amber-500/8 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-card/60 backdrop-blur-md text-xs font-mono shadow-xs">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
              <span className="font-semibold text-foreground tracking-wide uppercase text-[11px]">
                Autonomous PR Code Reviews
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-[11px]">Pinecone RAG + Gemini 2.0</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
              Write better code. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-amber-500 dark:to-amber-400">
                Ship with confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Review your pull requests with a 24/7 intelligent AI reviewer that catches bugs, security flaws, and performance regressions using deep codebase context.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link to="/sign-in">
                <Button
                  size="lg"
                  variant="brand"
                  className="font-semibold px-6 py-5.5 rounded-xl shadow-md gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#how-it-works" onClick={scrollToHowItWorks}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/80 bg-card/70 hover:bg-card text-foreground font-medium px-5 py-5.5 rounded-xl text-xs sm:text-sm cursor-pointer gap-2 backdrop-blur-xs"
                >
                  <Play className="size-3.5 fill-amber-500 text-amber-500" />
                  Watch Interactive Demo
                </Button>
              </a>
            </div>

            {/* Quick Benefits Checklist */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border/70 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Zero configuration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Automated GitHub PR webhooks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Pinecone vector codebase indexing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Reviewer Visual */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl border border-border/90 bg-[#07080C] text-[#F8FAFC] shadow-2xl overflow-hidden font-mono text-xs">
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
                  className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                  title="Copy sample snippet"
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
                  <a
                    href="#how-it-works"
                    onClick={scrollToHowItWorks}
                    className="text-amber-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    Explore demo walkthrough
                    <ChevronRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Video Demo Walkthrough Section */}
      <section id="how-it-works" className="relative z-10 py-24 border-t border-border/80 bg-card/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Interactive Walkthrough
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Watch CodeLens Review a Pull Request
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              From the instant a pull request is submitted on GitHub, CodeLens retrieves codebase context, detects security flaws, and delivers line-level comments.
            </p>
          </div>

          {/* Video Player Container */}
          <div className="max-w-5xl mx-auto rounded-2xl border border-border/90 bg-[#07080C] text-[#F8FAFC] shadow-2xl overflow-hidden font-mono">
            {/* Top Player Browser Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#11131F] border-b border-[#1E2235]">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-[#F43F5E]/90" />
                <div className="size-2.5 rounded-full bg-[#F59E0B]/90" />
                <div className="size-2.5 rounded-full bg-[#10B981]/90" />
                <span className="ml-2 text-xs text-slate-400 truncate">
                  github.com/priyamrajput-dev/Cursor_UI_Clone/pull/42
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400 font-semibold">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE SIMULATION • 1080p
                </span>
              </div>
            </div>

            {/* Video Canvas Stage */}
            <div className="p-4 sm:p-8 min-h-[380px] bg-[#090A0F] flex flex-col justify-center">
              {demoStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E2235]">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="size-4 text-emerald-400" />
                      <span className="font-semibold text-sm text-[#F8FAFC]">
                        PR #42: Refactor user session lookup
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-sans">
                        Open
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">main ← feature/auth-speedup</span>
                  </div>

                  {/* Git Diff Display */}
                  <div className="rounded-xl border border-[#1E2235] bg-[#07080C] overflow-hidden text-xs">
                    <div className="px-3 py-1.5 bg-[#11131F] border-b border-[#1E2235] text-[11px] text-slate-400">
                      server/src/modules/auth/user-service.ts
                    </div>
                    <div className="p-3.5 text-[12px] leading-relaxed">
                      <div className="text-slate-500">@@ -12,5 +12,6 @@ export async function getUserProfile(userId: string) &#123;</div>
                      <div className="text-rose-400 bg-rose-500/10 px-2 py-0.5 my-0.5 rounded">
                        - const user = await db.users.findUnique(&#123; where: &#123; id: userId &#125; &#125;);
                      </div>
                      <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 my-0.5 rounded">
                        + // Unsanitized raw query string
                      </div>
                      <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 my-0.5 rounded">
                        + const query = `SELECT * FROM users WHERE id = '$&#123;userId&#125;'`;
                      </div>
                      <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 my-0.5 rounded">
                        + const user = await db.raw(query);
                      </div>
                      <div className="text-slate-400"> return user;</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      GitHub Webhook delivered to CodeLens review worker
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Step 1 of 3</span>
                  </div>
                </div>
              )}

              {demoStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E2235]">
                    <div className="flex items-center gap-2">
                      <Cpu className="size-4 text-amber-400" />
                      <span className="font-semibold text-sm text-[#F8FAFC]">
                        CodeLens AI Engine: Deep Multi-Vector Analysis
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400 animate-pulse">
                      <Sparkles className="size-3" />
                      Auditing AST & Embeddings…
                    </span>
                  </div>

                  {/* Scanning Terminal Simulation */}
                  <div className="rounded-xl border border-[#1E2235] bg-[#07080C] p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>RAG PIPELINE: PINECONE VECTOR SEARCH</span>
                      <span className="text-emerald-400 font-semibold">INDEX MATCH: 99.4%</span>
                    </div>

                    <div className="w-full bg-[#181A27] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${Math.max(progress, 35)}%` }}
                      />
                    </div>

                    <div className="pt-2 space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="size-3.5" />
                        <span>Abstract Syntax Tree (AST) generated (8 files, 214 lines)</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="size-3.5" />
                        <span>Codebase embeddings retrieved from Pinecone index "codelens-repos"</span>
                      </div>
                      <div className="flex items-center gap-2 text-rose-400">
                        <AlertTriangle className="size-3.5" />
                        <span className="font-semibold">VULNERABILITY DETECTED: CWE-89 SQL Injection on line 14</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-400">
                        <Sparkles className="size-3.5" />
                        <span>Gemini 2.0 synthesizes targeted mitigation diff (Latency: 680ms)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span>Audit Score: 62/100 • Critical: 1 • Warnings: 0</span>
                    <span className="text-[11px] text-slate-400 font-mono">Step 2 of 3</span>
                  </div>
                </div>
              )}

              {demoStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E2235]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-400" />
                      <span className="font-semibold text-sm text-[#F8FAFC]">
                        CodeLens AI Bot: Review Comment Posted to GitHub PR
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-sans font-semibold">
                      Changes Requested
                    </span>
                  </div>

                  {/* GitHub Bot Comment Simulation */}
                  <div className="rounded-xl border border-[#1E2235] bg-[#07080C] overflow-hidden text-xs">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#11131F] border-b border-[#1E2235]">
                      <div className="flex items-center gap-2">
                        <span className="size-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                          CL
                        </span>
                        <span className="font-bold text-xs text-[#F8FAFC]">codelens-ai[bot]</span>
                        <span className="text-[10px] text-slate-400">commented 5 seconds ago</span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-400">
                        Score: 62/100
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px]">
                        <div className="font-semibold text-rose-400 flex items-center gap-1.5 mb-1">
                          <ShieldAlert className="size-3.5" />
                          <span>CRITICAL: Unsanitized SQL Query (CWE-89)</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Variable <code className="text-white font-mono">userId</code> is interpolated directly into raw SQL. An attacker can inject arbitrary statements to bypass authentication or extract sensitive records.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold">Suggested Fix (1-Click Apply):</span>
                        <div className="rounded-lg bg-[#11131F] border border-[#1E2235] p-2.5 text-[11px] space-y-0.5">
                          <div className="text-rose-400">- const query = `SELECT * FROM users WHERE id = '$&#123;userId&#125;'`;</div>
                          <div className="text-rose-400">- const user = await db.raw(query);</div>
                          <div className="text-emerald-400">+ const user = await db.users.findUnique(&#123; where: &#123; id: userId &#125; &#125;);</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span className="text-emerald-400 font-medium">✓ PR checks marked complete on GitHub</span>
                    <span className="text-[11px] text-slate-400 font-mono">Step 3 of 3</span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Player Controller Bar */}
            <div className="p-4 bg-[#11131F] border-t border-[#1E2235] space-y-3">
              {/* Scrub Timeline */}
              <div className="w-full bg-[#1E2235] h-1.5 rounded-full overflow-hidden cursor-pointer relative">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-100 rounded-full"
                  style={{
                    width: `${((demoStep - 1) * 33.3) + (progress * 0.333)}%`,
                  }}
                />
              </div>

              {/* Control Buttons & Timers */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="size-8 rounded-lg bg-[#181A27] hover:bg-[#202438] text-[#F8FAFC] flex items-center justify-center transition-colors cursor-pointer"
                    title={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDemoStep(1);
                      setProgress(0);
                      setIsPlaying(true);
                    }}
                    className="size-8 rounded-lg bg-[#181A27] hover:bg-[#202438] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>

                  <span className="text-xs text-slate-400 font-mono">
                    {demoStep === 1 ? "00:04" : demoStep === 2 ? "00:10" : "00:18"} / 00:20
                  </span>
                </div>

                {/* Chapter Selectors */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectStep(1)}
                    className={`px-3 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      demoStep === 1
                        ? "bg-[#202438] text-white font-semibold shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    1. Pull Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectStep(2)}
                    className={`px-3 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      demoStep === 2
                        ? "bg-[#202438] text-white font-semibold shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    2. AI Vector Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectStep(3)}
                    className={`px-3 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      demoStep === 3
                        ? "bg-[#202438] text-white font-semibold shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    3. Bot Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Step Interactive Cards Under Player */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
            <div
              onClick={() => handleSelectStep(1)}
              className={`rounded-xl border p-5 transition-all cursor-pointer ${
                demoStep === 1
                  ? "border-amber-500 bg-card shadow-md"
                  : "border-border/80 bg-card/60 hover:bg-card hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-amber-500">01</span>
                <GitPullRequest className="size-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Developer Opens PR</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Work natively in your GitHub git flow. Webhooks trigger the review automatically with zero manual steps.
              </p>
            </div>

            <div
              onClick={() => handleSelectStep(2)}
              className={`rounded-xl border p-5 transition-all cursor-pointer ${
                demoStep === 2
                  ? "border-amber-500 bg-card shadow-md"
                  : "border-border/80 bg-card/60 hover:bg-card hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-amber-500">02</span>
                <Cpu className="size-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Deep Vector & AST Audit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pinecone vector similarity queries and Gemini 2.0 inspect syntax, security rules, and architecture patterns.
              </p>
            </div>

            <div
              onClick={() => handleSelectStep(3)}
              className={`rounded-xl border p-5 transition-all cursor-pointer ${
                demoStep === 3
                  ? "border-amber-500 bg-card shadow-md"
                  : "border-border/80 bg-card/60 hover:bg-card hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-amber-500">03</span>
                <CheckCircle className="size-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Inline Fixes on GitHub</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Actionable comments and 1-click suggested diffs are posted right into the pull request review conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

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
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 hover:border-foreground/25 hover:shadow-md transition-all">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-xs">
              <ShieldAlert className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">Security & Vulnerability Audits</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Catches SQL injections, authentication bypasses, exposed API secrets, unsafe regexes, and unvalidated user inputs.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 hover:border-foreground/25 hover:shadow-md transition-all">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-xs">
              <Zap className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">Performance Regression Checks</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Flags N+1 queries, unindexed queries, memory leaks, unmemoized render cascades, and heavy synchronous loops.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 hover:border-foreground/25 hover:shadow-md transition-all">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-xs">
              <GitPullRequest className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">GitHub Native Webhooks</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Listens to pull request events in real time. The moment a PR is opened or synchronized, CodeLens analyzes the git patch.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 hover:border-foreground/25 hover:shadow-md transition-all">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-xs">
              <Database className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">Pinecone Vector RAG</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Chunks and indexes entire repository codebases to provide reviews with full context into your modules and types.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 hover:border-foreground/25 hover:shadow-md transition-all">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-xs">
              <Layers className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">Architecture & DRY Evaluation</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Highlights duplicate code, tight coupling, SOLID violations, missing null checks, and unclear naming conventions.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 hover:border-foreground/25 hover:shadow-md transition-all">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-xs">
              <Code2 className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">1-Click Actionable Code Fixes</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Generates ready-to-merge markdown diff suggestions directly inside GitHub pull request comment threads.
            </p>
          </div>
        </div>
      </section>

      {/* Real Review Experience Preview */}
      <section className="relative z-10 py-20 border-t border-border/80 bg-card/20">
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

          <div className="rounded-2xl border border-border/80 bg-card shadow-xl p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Review Score Card */}
              <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-xl border border-border/80 bg-secondary-bg">
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

                <div className="pt-6 border-t border-border/80 space-y-2.5">
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
                  <div className="rounded-lg border border-border/80 bg-[#07080C] text-slate-300 p-3 text-[11px] font-mono">
                    <span className="text-emerald-400">// Recommended Fix:</span>
                    <br />
                    const userIds = users.map(u =&gt; u.id);
                    <br />
                    const profiles = await db.query(`SELECT * FROM profiles WHERE user_id IN (?)`, [userIds]);
                  </div>
                </div>

                {/* Finding 2 */}
                <div className="rounded-xl border border-border/80 bg-card p-4.5 space-y-2.5">
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
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/60 to-card/30 p-8 sm:p-14 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <Badge variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            Ready to ship cleaner code?
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
            Start reviewing your code in seconds.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Connect your GitHub account to enable automatic PR reviews for your team with codebase RAG context.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/sign-in">
              <Button size="lg" variant="brand" className="font-semibold px-6 py-5.5 rounded-xl shadow-md gap-2 text-xs sm:text-sm cursor-pointer">
                Connect GitHub & Protect PRs
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#how-it-works" onClick={scrollToHowItWorks}>
              <Button size="lg" variant="outline" className="border-border/80 bg-card/60 hover:bg-card text-foreground font-medium px-5 py-5.5 rounded-xl text-xs sm:text-sm cursor-pointer">
                Watch Interactive Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

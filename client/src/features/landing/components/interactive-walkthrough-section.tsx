import React, { useState, useEffect, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GitPullRequest,
  Database,
  Sparkles,
  Cpu,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export const InteractiveWalkthroughSection = memo(function InteractiveWalkthroughSection() {
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

  return (
    <section id="how-it-works" className="relative z-10 py-24 sm:py-32 border-t border-border/60 bg-card/20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            Interactive Walkthrough
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Watch CodeLens Review a Pull Request
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            From the instant a pull request is submitted on GitHub, CodeLens retrieves codebase context, detects security flaws, and delivers line-level comments.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-border/70 bg-[#07080C] text-[#F8FAFC] shadow-xl overflow-hidden font-mono">
          {/* Top Player Browser Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#11131F] border-b border-[#1E2235]">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-[#F43F5E]/90" />
              <div className="size-2.5 rounded-full bg-[#F59E0B]/90" />
              <div className="size-2.5 rounded-full bg-[#10B981]/90" />
              <span className="ml-2 text-xs text-slate-400 truncate max-w-48">
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
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2235]">
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
                    <div className="text-slate-500">@@ -18,6 +18,7 @@ export async function findUser(id: string) &#123;</div>
                    <div className="text-slate-400">   const session = await getSession();</div>
                    <div className="bg-rose-500/10 text-rose-400 px-1 py-0.5 rounded flex items-center gap-1.5">
                      <span>-</span>
                      <span>const query = `SELECT * FROM users WHERE token = '${"${session.token}"}'`;</span>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded flex items-center gap-1.5">
                      <span>+</span>
                      <span>const query = await db.users.findUnique(&#123; where: &#123; token: session.token &#125; &#125;);</span>
                    </div>
                    <div className="text-slate-400">   return query;</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                    Webhook received: analyzing changes…
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Step 1 of 3</span>
                </div>
              </div>
            )}

            {demoStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2235]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-400" />
                    <span className="font-semibold text-sm text-[#F8FAFC]">
                      Pinecone Vector Context Search
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 font-mono">3 context chunks matched</span>
                </div>

                {/* Similarity Match Visualizer */}
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Database className="size-3.5" />
                        server/src/db/schema.prisma (Vector Match 0.94)
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">94% similarity</span>
                    </div>
                    <div className="w-full bg-[#11131F] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: "94%" }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border/40 bg-[#07080C] space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-emerald-400" />
                        SQL Injection Security Ruleset (Semgrep & AST)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">Pattern match</span>
                    </div>
                    <div className="w-full bg-[#11131F] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(progress, 35)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Cpu className="size-3.5" />
                    Google Gemini reasoning complete (0.8s)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Step 2 of 3</span>
                </div>
              </div>
            )}

            {demoStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2235]">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-md bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                      CL
                    </div>
                    <span className="font-semibold text-sm text-[#F8FAFC]">
                      CodeLens Bot (automated review)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-mono">
                      bot
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">posted 2s ago</span>
                </div>

                {/* Simulated GitHub Review Comment */}
                <div className="rounded-xl border border-rose-500/30 bg-[#07080C] p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                    <AlertTriangle className="size-4 shrink-0 text-rose-400" />
                    <span>Potential SQL Injection vulnerability detected (CWE-89)</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Direct template literal interpolation into raw queries allows hostile parameters to bypass authentication. We suggest using parameterized ORM queries instead:
                  </p>
                  <div className="rounded-lg border border-[#1E2235] bg-[#0A0C14] p-3 text-[11px] font-mono">
                    <div className="text-slate-400">// Suggested diff:</div>
                    <div className="mt-1 space-y-0.5">
                      <div className="text-rose-400">- const user = await db.query(`SELECT * FROM users WHERE id = '${"${userId}"}'`);</div>
                      <div className="text-emerald-400">+ const user = await db.users.findUnique(&#123; where: &#123; id: userId &#125; &#125;);</div>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="size-9 rounded-lg bg-[#181A27] hover:bg-[#202438] text-[#F8FAFC] flex items-center justify-center transition-colors"
                  title={isPlaying ? "Pause video" : "Play video"}
                  aria-label={isPlaying ? "Pause demo" : "Play demo"}
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDemoStep(1);
                    setProgress(0);
                    setIsPlaying(true);
                  }}
                  className="size-9 rounded-lg bg-[#181A27] hover:bg-[#202438] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Restart from beginning"
                  aria-label="Restart demo"
                >
                  <RotateCcw className="size-4" />
                </button>

                <span className="text-xs text-slate-400 font-mono" aria-label="Demo progress">
                  {demoStep === 1 ? "00:04" : demoStep === 2 ? "00:10" : "00:18"} / 00:20
                </span>
              </div>

              {/* Chapter Selectors */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectStep(1)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] transition-colors",
                    demoStep === 1
                      ? "bg-[#202438] text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#181A27]"
                  )}
                  aria-pressed={demoStep === 1}
                >
                  1. Pull Request
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectStep(2)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] transition-colors",
                    demoStep === 2
                      ? "bg-[#202438] text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#181A27]"
                  )}
                  aria-pressed={demoStep === 2}
                >
                  2. AI Vector Scan
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectStep(3)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] transition-colors",
                    demoStep === 3
                      ? "bg-[#202438] text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#181A27]"
                  )}
                  aria-pressed={demoStep === 3}
                >
                  3. Bot Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Interactive Cards Under Player */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          <button
            type="button"
            onClick={() => handleSelectStep(1)}
            className={cn(
              "w-full text-left rounded-xl border p-5 transition-all",
              demoStep === 1
                ? "border-amber-500 bg-card shadow-lg"
                : "border-border/60 bg-card/50 hover:bg-card hover:border-foreground/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-bold text-amber-500">01</span>
              <GitPullRequest className="size-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Developer Opens PR</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Work natively in your GitHub git flow. Webhooks trigger the review automatically with zero manual steps.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStep(2)}
            className={cn(
              "w-full text-left rounded-xl border p-5 transition-all",
              demoStep === 2
                ? "border-amber-500 bg-card shadow-lg"
                : "border-border/60 bg-card/50 hover:bg-card hover:border-foreground/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-bold text-amber-500">02</span>
              <Cpu className="size-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Deep Vector & AST Audit</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pinecone vector similarity queries and Google Gemini inspect syntax, security rules, and architecture patterns.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStep(3)}
            className={cn(
              "w-full text-left rounded-xl border p-5 transition-all",
              demoStep === 3
                ? "border-amber-500 bg-card shadow-lg"
                : "border-border/60 bg-card/50 hover:bg-card hover:border-foreground/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-bold text-amber-500">03</span>
              <CheckCircle className="size-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Inline Fixes on GitHub</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Actionable comments and 1-click suggested diffs are posted right into the pull request review conversation.
            </p>
          </button>
        </div>
      </div>
    </section>
  );
});

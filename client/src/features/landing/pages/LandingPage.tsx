import { useState, useEffect, useRef } from "react";
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
  Layers,
  Play,
} from "lucide-react";
import { InteractiveWalkthroughSection } from "../components/interactive-walkthrough-section";
import { HeroCodeTerminal } from "../components/hero-code-terminal";
import { FeatureSpotlightCard } from "../components/feature-spotlight-card";
import { TrustedStackStrip } from "../components/trusted-stack-strip";
import { gsap, scrollToTarget, useReveal, useCounter, useMagnetic } from "@/lib/motion";
import { useGSAP } from "@gsap/react";

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const bottomCtaRef = useRef<HTMLButtonElement>(null);

  // Magnetic pulls for CTA buttons
  useMagnetic(heroCtaRef, { strength: 16, radius: 90 });
  useMagnetic(bottomCtaRef, { strength: 16, radius: 90 });

  // Feature Section reveals
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  useReveal(featuresSectionRef, {
    target: "[data-feature-reveal]",
    y: 20,
    stagger: 0.1,
    start: "top 85%",
  });
  useReveal(featuresSectionRef, {
    target: "[data-feature-card]",
    y: 28,
    stagger: 0.1,
    start: "top 80%",
  });

  // Review Section reveals
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  useReveal(reviewSectionRef, {
    target: "[data-review-reveal]",
    y: 20,
    stagger: 0.1,
    start: "top 85%",
  });

  // Counters in review preview
  const scoreCounterRef = useRef<HTMLSpanElement>(null);
  const critCounterRef = useRef<HTMLSpanElement>(null);
  const warnCounterRef = useRef<HTMLSpanElement>(null);
  const suggCounterRef = useRef<HTMLSpanElement>(null);

  useCounter(scoreCounterRef, { from: 0, to: 87, duration: 1.8, ease: "power2.out" });
  useCounter(critCounterRef, { from: 0, to: 0, duration: 0.5 });
  useCounter(warnCounterRef, { from: 0, to: 2, duration: 1.2, ease: "power1.out" });
  useCounter(suggCounterRef, { from: 0, to: 3, duration: 1.4, ease: "power1.out" });

  // CTA Section reveals
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  useReveal(ctaSectionRef, {
    target: "[data-cta-reveal]",
    y: 20,
    stagger: 0.1,
    start: "top 85%",
  });

  const scrollToHowItWorks = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    scrollToTarget("how-it-works");
    window.history.pushState(null, "", "#how-it-works");
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        setTimeout(() => {
          scrollToTarget(id);
        }, 80);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Tier 1: Page-load fade/slide-in for hero elements
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
        tl.fromTo(
          "[data-hero-fade]",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, delay: 0.1 }
        ).fromTo(
          "[data-hero-visual]",
          { y: 32, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.9 },
          "-=0.5"
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(["[data-hero-fade]", "[data-hero-visual]"], { y: 0, opacity: 1, scale: 1 });
      });
    },
    { scope: heroRef }
  );

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <SiteNavbar />

      {/* Global Background Grid & Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-tech-grid opacity-20 mask-radial-hero" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/8 dark:bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <div data-hero-fade className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm text-xs font-mono shadow-sm">
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

            <h1 data-hero-fade className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Write better code. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-amber-500 dark:to-amber-400 font-extrabold">
                Ship with confidence.
              </span>
            </h1>

            <p data-hero-fade className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Review your pull requests with a 24/7 intelligent AI reviewer that catches bugs, security flaws, and performance regressions using deep codebase context.
            </p>

            <div data-hero-fade className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/sign-in">
                <Button
                  ref={heroCtaRef}
                  size="lg"
                  variant="brand"
                  className="font-semibold px-6 py-4 rounded-xl shadow-md gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="size-4 icon-nudge" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-2 px-5 py-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card text-foreground font-medium text-sm transition-all duration-200 cursor-pointer"
              >
                <Play className="size-3.5 fill-amber-500 text-amber-500" />
                Watch Interactive Demo
              </button>
            </div>

            {/* Quick Benefits Checklist */}
            <div data-hero-fade className="pt-6 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border/50 w-full">
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
          <div data-hero-visual className="lg:col-span-5 w-full">
            <HeroCodeTerminal onExploreWalkthrough={scrollToHowItWorks} />
          </div>
        </div>
      </section>

      {/* Trusted Stack Infinite Marquee Strip */}
      <TrustedStackStrip />

      {/* Interactive Video Demo Walkthrough Section */}
      <InteractiveWalkthroughSection />

      {/* Core Features Grid */}
      <section ref={featuresSectionRef} className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge data-feature-reveal variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            Features
          </Badge>
          <h2 data-feature-reveal className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Engineered for Code Excellence
          </h2>
          <p data-feature-reveal className="text-sm sm:text-base text-muted-foreground">
            Built for software engineering teams who prioritize velocity, stability, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureSpotlightCard
            icon={<ShieldAlert className="size-5" />}
            title="Security & Vulnerability Audits"
            description="Catches SQL injections, authentication bypasses, exposed API secrets, unsafe regexes, and unvalidated user inputs."
          />
          <FeatureSpotlightCard
            icon={<Zap className="size-5" />}
            title="Performance Regression Checks"
            description="Flags N+1 queries, unindexed queries, memory leaks, unmemoized render cascades, and heavy synchronous loops."
          />
          <FeatureSpotlightCard
            icon={<GitPullRequest className="size-5" />}
            title="GitHub Native Webhooks"
            description="Listens to pull request events in real time. The moment a PR is opened or synchronized, CodeLens analyzes the git patch."
          />
          <FeatureSpotlightCard
            icon={<Database className="size-5" />}
            title="Pinecone Vector RAG"
            description="Chunks and indexes entire repository codebases to provide reviews with full context into your modules and types."
          />
          <FeatureSpotlightCard
            icon={<Layers className="size-5" />}
            title="Architecture & DRY Evaluation"
            description="Highlights duplicate code, tight coupling, SOLID violations, missing null checks, and unclear naming conventions."
          />
          <FeatureSpotlightCard
            icon={<Code2 className="size-5" />}
            title="1-Click Actionable Code Fixes"
            description="Generates ready-to-merge markdown diff suggestions directly inside GitHub pull request comment threads."
          />
        </div>
      </section>

      {/* Real Review Experience Preview */}
      <section ref={reviewSectionRef} className="relative z-10 py-20 border-t border-border/60 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge data-review-reveal variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Live Review Output
            </Badge>
            <h2 data-review-reveal className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Actionable Feedback at a Glance
            </h2>
            <p data-review-reveal className="text-sm sm:text-base text-muted-foreground">
              Review results categorize issues by severity with line numbers and recommended replacements.
            </p>
          </div>

          <div data-review-reveal className="rounded-2xl border border-border/70 bg-card shadow-xl p-6 sm:p-8">
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
                    <span ref={scoreCounterRef} className="text-5xl font-extrabold tracking-tight text-foreground font-mono">
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
                    <span ref={critCounterRef} className="font-mono font-bold text-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2 rounded-full bg-amber-500" />
                      Warnings
                    </span>
                    <span ref={warnCounterRef} className="font-mono font-bold text-foreground">2</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2 rounded-full bg-blue-500" />
                      Suggestions
                    </span>
                    <span ref={suggCounterRef} className="font-mono font-bold text-foreground">3</span>
                  </div>
                </div>
              </div>

              {/* Sample Findings List */}
              <div className="lg:col-span-8 space-y-4">
                {/* Finding 1 */}
                <div className="rounded-xl border border-amber-500/30 bg-card p-4.5 space-y-2.5 hover:border-amber-500/50 hover:shadow-md transition-all">
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
                <div className="rounded-xl border border-border/60 bg-card p-4.5 space-y-2.5 hover:border-foreground/30 hover:shadow-md transition-all">
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
      <section ref={ctaSectionRef} className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-card/90 via-card/50 to-card/20 p-8 sm:p-12 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute -right-24 -top-24 size-60 rounded-full bg-amber-500/8 dark:bg-amber-500/12 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 size-60 rounded-full bg-emerald-500/5 dark:bg-emerald-500/8 blur-3xl pointer-events-none" />

          <Badge data-cta-reveal variant="brand" className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            Ready to ship cleaner code?
          </Badge>

          <h2 data-cta-reveal className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
            Start reviewing your code in seconds.
          </h2>

          <p data-cta-reveal className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Connect your GitHub account to enable automatic PR reviews for your team with codebase RAG context.
          </p>

          <div data-cta-reveal className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/sign-in">
              <Button
                ref={bottomCtaRef}
                size="lg"
                variant="brand"
                className="font-semibold px-6 py-4 rounded-xl shadow-md gap-2 text-sm cursor-pointer"
              >
                Connect GitHub & Protect PRs
                <ArrowRight className="size-4 icon-nudge" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card text-foreground font-medium text-sm transition-all cursor-pointer"
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
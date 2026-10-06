import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { NavBar } from "@/components/ui/NavBar";
import { PromptBar } from "@/components/ui/PromptBar";
import { ModeSelector } from "@/components/ui/ModeSelector";
import { CodeCard } from "@/components/ui/CodeCard";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { HowItWorks } from "@/components/ui/sections/HowItWorks";
import { TrustStrip } from "@/components/ui/TrustStrip";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitText } from "@/components/motion/SplitText";
import { TiltCard } from "@/components/motion/TiltCard";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CountUp } from "@/components/motion/CountUp";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { PageTransition } from "@/components/motion/PageTransition";
import { useWorkspaceStore } from "@/lib/stores";
import {
  ArrowRight,
  Shield,
  Zap,
  Code2,
  Terminal,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

const heroPreviewCode = `// Analyze any algorithm or async workflow instantly
export async function authenticateSession(token: string) {
  const verified = await jwt.verify(token, process.env.SECRET);
  if (!verified) throw new AuthenticationError("Invalid signature");

  const permissions = await db.roles.find({ userId: verified.sub });
  return { user: verified.sub, scopes: permissions.map(p => p.name) };
}`;

export function LandingPage() {
  const navigate = useNavigate();
  const { setCode, setMode } = useWorkspaceStore();
  const [selectedMode, setSelectedMode] = useState("overview");
  const shouldReduce = useReducedMotion();

  const handleHeroSubmit = (prompt: string) => {
    setCode(prompt);
    setMode(selectedMode);
    navigate("/app");
  };

  return (
    <PageTransition className="min-h-screen bg-warm-canvas text-ink-black flex flex-col relative overflow-hidden">
      <NavBar />

      {/* Floating decorative ambient background shapes */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <ParallaxLayer speed={0.15}>
          <div className="absolute top-12 left-10 w-96 h-96 rounded-full bg-peach-blush/25 blur-3xl" />
        </ParallaxLayer>
        <ParallaxLayer speed={-0.12}>
          <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-sunset-coral/20 blur-3xl" />
        </ParallaxLayer>
      </div>

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="max-w-1200 mx-auto px-6 pt-16 sm:pt-24 pb-16 flex flex-col items-center text-center">
          <Reveal delay={0.05}>
            <EyebrowLabel variant="orange" className="mb-6">
              <Sparkles className="w-3.5 h-3.5 text-ember-orange" />
              Understand any code, instantly
            </EyebrowLabel>
          </Reveal>

          {/* 64px display headline with keyword highlighted in #ff3c00 */}
          <h1 className="text-display max-w-4xl text-ink-black mb-6">
            <SplitText
              text="Read code at the speed of thought."
              highlightWord="speed"
              highlightClass="text-ember-orange"
              delay={0.1}
            />
          </h1>

          <Reveal delay={0.25} className="max-w-2xl mb-10">
            <p className="text-subheading text-pewter font-normal leading-relaxed">
              Paste or drop any complex snippet, pick a specialized lens, and get
              production-grade breakdowns with zero hallucinated fluff.
            </p>
          </Reveal>

          {/* PromptBar hero centerpiece with typewriter placeholder */}
          <Reveal delay={0.35} className="w-full flex justify-center mb-8">
            <PromptBar
              onSubmit={handleHeroSubmit}
              className="w-full max-w-[640px]"
            />
          </Reveal>

          {/* ModeSelector category row */}
          <Reveal delay={0.45} className="mb-14">
            <ModeSelector
              activeMode={selectedMode}
              onSelect={setSelectedMode}
            />
          </Reveal>

          {/* Hero Dark CodeCard Preview with 3D cursor tilt */}
          <Reveal delay={0.55} className="w-full max-w-4xl">
            <TiltCard glow={true} className="rounded-[32px] border border-charcoal">
              <CodeCard
                title="example.auth.ts"
                code={heroPreviewCode}
                language="typescript"
                showLineNumbers={true}
                scanning={true}
                radius="32"
                highlightLines={[2, 3]}
                className="w-full shadow-none"
              />
            </TiltCard>
          </Reveal>
        </section>

        {/* ================= TRUST STRIP ================= */}
        <section className="max-w-1200 mx-auto px-6 border-y border-sand/60">
          <TrustStrip />
        </section>

        {/* ================= BENTO GRID FEATURE CARDS ================= */}
        <section id="features" className="max-w-1200 mx-auto px-6 py-20 sm:py-28">
          <SectionHeading
            eyebrow="Architected For Developers"
            title="Six specialized lenses for every workflow"
            description="Choose between executive architecture summaries, zero-jargon beginner walks, or deep security vulnerability audits."
            className="mb-16"
          />

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Peach Feature Card (Max 2 per viewport) */}
            <StaggerItem className="md:col-span-2">
              <FeatureCard
                eyebrow="Primary Lens"
                heading="Multi-Perspective Analysis"
                description="One single click toggles between high-level architectural overview, line-by-line statement annotations, or deep algorithmic time-space complexity."
                variant="peach"
                icon={<Layers className="w-5 h-5 text-ink-black" />}
                className="min-h-[320px]"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-pure-white/40 text-ink-black text-caption font-medium border border-pure-white/30">
                    AST Parser
                  </span>
                  <span className="px-3 py-1 rounded-full bg-pure-white/40 text-ink-black text-caption font-medium border border-pure-white/30">
                    Control Flow Graphs
                  </span>
                  <span className="px-3 py-1 rounded-full bg-pure-white/40 text-ink-black text-caption font-medium border border-pure-white/30">
                    Deterministic Memory Models
                  </span>
                </div>
              </FeatureCard>
            </StaggerItem>

            {/* 2. White Feature Card */}
            <StaggerItem>
              <FeatureCard
                eyebrow="Security First"
                heading="Vulnerability & Injection Audits"
                description="Flags unsanitized user inputs, tainted queries, hardcoded keys, and buffer boundary hazards before PR review."
                variant="white"
                icon={<Shield className="w-5 h-5 text-ember-orange" />}
                className="min-h-[320px]"
              >
                <div className="space-y-2 font-mono text-caption text-pewter">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" /> No SQL injection vectors
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" /> Bounded token consumption
                  </div>
                </div>
              </FeatureCard>
            </StaggerItem>

            {/* 3. Dark Feature Card */}
            <StaggerItem>
              <FeatureCard
                eyebrow="Refactoring Engine"
                heading="Automated Code Smells Clean-Up"
                description="Identifies nested cyclomatic complexity and outputs clean guard clauses, modern functional pipelines, and typed interfaces."
                variant="dark"
                icon={<Code2 className="w-5 h-5 text-pure-white" />}
                className="min-h-[320px]"
              >
                <div className="p-3 rounded-xl bg-charcoal font-mono text-caption text-sand">
                  <code>if (!user) return null; // Guard clause</code>
                </div>
              </FeatureCard>
            </StaggerItem>

            {/* 4. White Feature Card */}
            <StaggerItem className="md:col-span-2">
              <FeatureCard
                eyebrow="Context Awareness"
                heading="Live Code Companion Chat"
                description="Ask targeted follow-ups about edge cases, threading race conditions, or framework migrations without re-pasting your code."
                variant="white"
                icon={<Zap className="w-5 h-5 text-ember-orange" />}
                className="min-h-[320px]"
              >
                <div className="flex items-center gap-4 text-small-ui text-pewter">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Full AST in memory
                  </div>
                  <div>•</div>
                  <div>Zero rate-limit latency</div>
                </div>
              </FeatureCard>
            </StaggerItem>
          </Stagger>
        </section>

        {/* ================= STATS COUNTER STRIP ================= */}
        <section className="max-w-1200 mx-auto px-6 py-12">
          <div className="bg-pure-white rounded-[32px] border border-sand p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-[44px] font-medium tracking-tight text-ink-black">
                <CountUp to={48} suffix="+" />
              </div>
              <p className="text-small-ui text-pewter mt-1">Programming languages supported</p>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-sand/70 py-6 sm:py-0">
              <div className="text-[44px] font-medium tracking-tight text-ember-orange">
                <CountUp to={180} suffix="ms" />
              </div>
              <p className="text-small-ui text-pewter mt-1">Average time to first stream token</p>
            </div>
            <div>
              <div className="text-[44px] font-medium tracking-tight text-ink-black">
                <CountUp to={100} suffix="%" />
              </div>
              <p className="text-small-ui text-pewter mt-1">Client-side masked API key privacy</p>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS (3 STEPS STORYTELLING) ================= */}
        <section id="how-it-works" className="max-w-1200 mx-auto px-6 py-20 sm:py-28">
          <SectionHeading
            eyebrow="How It Works"
            title="From confusion to clarity in 3 steps"
            description="Designed for developers who value immediate clarity over verbose explanations."
            className="mb-16"
          />

          <HowItWorks />
        </section>

        {/* ================= FINAL CTA SECTION ================= */}
        <section className="max-w-1200 mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-peach-blush to-sunset-coral rounded-[40px] p-10 sm:p-16 text-center text-ink-black border border-sunset-coral/30 flex flex-col items-center select-none">
            <span className="text-[13px] font-medium uppercase tracking-widest text-charcoal mb-4">
              Get Started Free
            </span>
            <h2 className="text-heading-lg font-normal tracking-[-0.04em] max-w-2xl mb-6">
              Experience the fastest way to decode unfamiliar codebases.
            </h2>
            <p className="text-body text-charcoal/90 max-w-lg mb-8 leading-relaxed">
              No account required. Jump straight into the workspace with mock or your own API keys.
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link to="/app">
                <Magnetic distance={70} strength={0.4}>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Open Studio Now
                  </Button>
                </Magnetic>
              </Link>
              <Link to="/settings">
                <Button variant="secondary" size="lg">
                  Configure Model
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}

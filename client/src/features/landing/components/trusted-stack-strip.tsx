import React from "react";
import { GitPullRequest, Database, Sparkles, Shield, Cpu, Terminal, Layers } from "lucide-react";

interface TechItem {
  name: string;
  category: string;
  icon: React.ReactNode;
}

const techStack: TechItem[] = [
  { name: "GitHub Apps & Webhooks", category: "VCS Integration", icon: <GitPullRequest className="size-4 text-emerald-400" /> },
  { name: "Pinecone Vector RAG", category: "Context Retrieval", icon: <Database className="size-4 text-amber-400" /> },
  { name: "Google Gemini 2.0 Flash", category: "LLM Reasoning", icon: <Sparkles className="size-4 text-blue-400" /> },
  { name: "PostgreSQL & pgvector", category: "Relational Persistence", icon: <Layers className="size-4 text-indigo-400" /> },
  { name: "Upstash Redis", category: "Atomic Limiting & Caching", icon: <Cpu className="size-4 text-rose-400" /> },
  { name: "OWASP & AST Linting", category: "Static Rule Engine", icon: <Shield className="size-4 text-teal-400" /> },
  { name: "Bun & TypeScript ESM", category: "Runtime Performance", icon: <Terminal className="size-4 text-amber-300" /> },
];

export function TrustedStackStrip() {
  return (
    <div className="w-full py-12 border-y border-border/60 bg-card/25 overflow-hidden select-none relative">
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
          Powered by Enterprise-Grade Developer Infrastructure
        </span>
      </div>

      <div
        className="relative flex overflow-hidden group"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="flex shrink-0 items-center gap-8 sm:gap-12 animate-marquee pr-8 sm:pr-12 group-hover:[animation-play-state:paused]">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-2 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs text-xs font-mono text-foreground/80 hover:text-foreground hover:border-amber-500/40 transition-colors shrink-0"
            >
              <span>{tech.icon}</span>
              <span className="font-semibold">{tech.name}</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">• {tech.category}</span>
            </div>
          ))}
        </div>

        {/* Duplicate track for seamless infinite marquee loop */}
        <div className="flex shrink-0 items-center gap-8 sm:gap-12 animate-marquee pr-8 sm:pr-12 group-hover:[animation-play-state:paused]" aria-hidden="true">
          {techStack.map((tech, idx) => (
            <div
              key={`dup-${idx}`}
              className="flex items-center gap-3 px-4 py-2 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs text-xs font-mono text-foreground/80 hover:text-foreground hover:border-amber-500/40 transition-colors shrink-0"
            >
              <span>{tech.icon}</span>
              <span className="font-semibold">{tech.name}</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">• {tech.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

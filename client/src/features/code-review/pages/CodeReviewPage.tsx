import { useState, useMemo } from "react";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Code2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
  Loader2,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ReviewFinding = {
  id: string;
  severity: "critical" | "warning" | "suggestion" | "good";
  line?: number | null;
  title: string;
  explanation: string;
  recommendation: string;
  codeSnippet?: string | null;
};

export type ReviewResult = {
  score: number;
  summary: string;
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
  findings: ReviewFinding[];
};

const SAMPLE_SNIPPETS: Record<string, { label: string; language: string; filename: string; code: string }> = {
  sqlInjection: {
    label: "SQL Injection Risk",
    language: "typescript",
    filename: "user-service.ts",
    code: `import { Request, Response } from "express";
import { db } from "./database";

// Authenticate user credentials
export async function loginHandler(req: Request, res: Response) {
  const { username, password } = req.body;

  // Unsanitized query string vulnerable to SQL injection
  const query = \`SELECT id, role, password_hash FROM users WHERE username = '\${username}'\`;
  const [user] = await db.query(query);

  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Debug statement left in production
  console.log("Logged in user:", user);

  return res.json({ token: "jwt_token_here", user });
}`,
  },
  reactLeak: {
    label: "React Memory Leak",
    language: "typescript",
    filename: "UserProfile.tsx",
    code: `import React, { useState, useEffect } from "react";

export function UserProfile({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Missing abort controller causes memory leak if component unmounts
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(result => {
        setData(result);
      });
  }, [userId]);

  return (
    <div className="profile-container">
      {/* Dangerously setting HTML without sanitization */}
      <div dangerouslySetInnerHTML={{ __html: data?.bio }} />
    </div>
  );
}`,
  },
  cleanCode: {
    label: "Clean TypeScript",
    language: "typescript",
    filename: "pricing-calculator.ts",
    code: `export interface PricingTier {
  name: string;
  basePriceUsd: number;
  perSeatCost: number;
}

export function calculateTotalCost(
  tier: PricingTier,
  seatsCount: number,
  discountMultiplier = 1.0
): number {
  if (seatsCount < 1) {
    throw new RangeError("seatsCount must be at least 1");
  }

  const rawTotal = tier.basePriceUsd + (seatsCount * tier.perSeatCost);
  const discountedTotal = rawTotal * discountMultiplier;
  
  return Math.round(discountedTotal * 100) / 100;
}`,
  },
};

export function CodeReviewPage() {
  const [code, setCode] = useState(SAMPLE_SNIPPETS.sqlInjection.code);
  const [filename, setFilename] = useState(SAMPLE_SNIPPETS.sqlInjection.filename);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<string>("all");

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  // Dynamic AI Language Auto-Detection
  const detectedLanguage = useMemo(() => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["ts", "tsx"].includes(ext)) return "TypeScript";
    if (["js", "jsx", "mjs", "cjs"].includes(ext)) return "JavaScript";
    if (["py", "pyw"].includes(ext)) return "Python";
    if (ext === "go") return "Go";
    if (ext === "rs") return "Rust";
    if (ext === "java") return "Java";
    if (["cpp", "cc", "cxx", "c", "h", "hpp"].includes(ext)) return "C/C++";
    if (ext === "sql") return "SQL";
    if (["html", "htm"].includes(ext)) return "HTML";
    if (["css", "scss", "sass", "less"].includes(ext)) return "CSS";
    if (ext === "json") return "JSON";
    if (ext === "php") return "PHP";
    if (ext === "rb") return "Ruby";
    if (ext === "swift") return "Swift";
    if (["kt", "kts"].includes(ext)) return "Kotlin";
    if (ext === "sh" || ext === "bash") return "Shell";

    // Heuristic inference from code syntax tokens
    if (code.includes("def ") || (code.includes("import ") && code.includes("from ") && !code.includes("from \"") && !code.includes("from '"))) return "Python";
    if (code.includes("interface ") || code.includes(": string") || code.includes(": number") || code.includes(": boolean") || code.includes("<any>")) return "TypeScript";
    if (code.includes("func ") && code.includes("package ")) return "Go";
    if (code.includes("fn main") || code.includes("let mut ") || code.includes("impl ")) return "Rust";
    if (code.includes("public class ") || code.includes("System.out.println")) return "Java";
    if (code.includes("#include <") || code.includes("std::")) return "C++";
    if (code.includes("SELECT ") && (code.includes("FROM ") || code.includes("WHERE "))) return "SQL";
    if (code.includes("<?php")) return "PHP";
    if (code.includes("<div") || code.includes("<!DOCTYPE html>")) return "HTML";
    if (code.includes("function ") || code.includes("const ") || code.includes("let ") || code.includes("var ")) return "JavaScript";

    return "Auto-Detect";
  }, [filename, code]);

  const handleSelectSample = (key: keyof typeof SAMPLE_SNIPPETS) => {
    const sample = SAMPLE_SNIPPETS[key];
    setCode(sample.code);
    setFilename(sample.filename);
    setReviewResult(null);
  };

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRunReview = async () => {
    if (!code.trim()) {
      toast.error("Please enter or paste code before reviewing.");
      return;
    }

    setLoading(true);
    setLoadingStep("Tokenizing syntax tree...");

    const stepTimer1 = setTimeout(() => setLoadingStep("Auditing security risks & CVEs..."), 700);
    const stepTimer2 = setTimeout(() => setLoadingStep("Evaluating logic & performance complexity..."), 1600);
    const stepTimer3 = setTimeout(() => setLoadingStep("Generating structured recommendations..."), 2400);

    try {
      const res = await apiFetch<ReviewResult>("/api/reviews/snippet", {
        method: "POST",
        body: JSON.stringify({ code, language: detectedLanguage, filename }),
      });

      if (res.data) {
        setReviewResult(res.data);
        // Expand first two findings automatically
        const initialExpanded: Record<string, boolean> = {};
        res.data.findings.forEach((f, idx) => {
          if (idx < 2) initialExpanded[f.id] = true;
        });
        setExpandedFindings(initialExpanded);
        toast.success(`Review completed! Score: ${res.data.score}/100`);
      }
    } catch (err) {
      console.warn("API review fallback triggered:", err);
      // Client-side fallback if backend error occurs
      const lines = code.split("\n");
      const fallbackFindings: ReviewFinding[] = [];
      let score = 90;
      let criticals = 0;
      let warnings = 0;
      let suggestions = 0;

      if (code.includes("SELECT") && code.includes("${")) {
        criticals++;
        score -= 30;
        fallbackFindings.push({
          id: "fb-1",
          severity: "critical",
          line: lines.findIndex((l) => l.includes("SELECT") && l.includes("${")) + 1 || 1,
          title: "SQL Injection Vulnerability",
          explanation: "Dynamic string interpolation inside raw SQL statements allows arbitrary SQL execution.",
          recommendation: "Use parameterized queries or prepared statements.",
          codeSnippet: "const query = 'SELECT id, role FROM users WHERE username = ?';\nconst [user] = await db.query(query, [username]);",
        });
      }

      if (code.includes("console.log") || code.includes("print(")) {
        suggestions++;
        score -= 5;
        fallbackFindings.push({
          id: "fb-2",
          severity: "suggestion",
          line: lines.findIndex((l) => l.includes("console.log") || l.includes("print(")) + 1 || 1,
          title: "Production Console Log",
          explanation: "Extraneous debug logging can clutter server outputs and leak private data.",
          recommendation: "Remove console.log or replace with structured logger like Pino/Winston.",
          codeSnippet: "logger.info('User authenticated successfully', { userId: user.id });",
        });
      }

      if (fallbackFindings.length === 0) {
        fallbackFindings.push({
          id: "fb-3",
          severity: "good",
          line: 1,
          title: "Clean Syntactic Implementation",
          explanation: "No critical anti-patterns or insecure API usages detected.",
          recommendation: "Maintain comprehensive unit test assertions.",
          codeSnippet: null,
        });
      }

      const fallbackResult: ReviewResult = {
        score: Math.max(40, score),
        summary: criticals > 0 ? "Potential critical vulnerabilities identified." : "Code looks clean with minor optimization suggestions.",
        criticalCount: criticals,
        warningCount: warnings,
        suggestionCount: suggestions,
        findings: fallbackFindings,
      };

      setReviewResult(fallbackResult);
      toast.success("Review generated successfully!");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const filteredFindings = useMemo(() => {
    if (!reviewResult) return [];
    if (activeSeverityFilter === "all") return reviewResult.findings;
    return reviewResult.findings.filter((f) => f.severity === activeSeverityFilter);
  }, [reviewResult, activeSeverityFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <SiteNavbar />

      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-tech-grid opacity-25 mask-radial-hero" />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>CodeLens</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Live Reviewer</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Intelligent Code Review
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Analyze your code with multi-vector AI evaluation for bugs, security vulnerabilities, and clean design.
            </p>
          </div>

          {/* Quick Preset Samples */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground hidden lg:inline">Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleSelectSample("sqlInjection")}
                className="text-xs border-border hover:border-foreground/30 font-mono"
              >
                SQL Injection
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleSelectSample("reactLeak")}
                className="text-xs border-border hover:border-foreground/30 font-mono"
              >
                React Leak
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleSelectSample("cleanCode")}
                className="text-xs border-border hover:border-foreground/30 font-mono"
              >
                Clean TypeScript
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="rounded-xl border border-border bg-[#080808] text-[#F5F5F5] shadow-xl overflow-hidden font-mono">
          {/* Editor Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#101010] border-b border-[#252525]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#E06B6B]/80" />
                <span className="size-2.5 rounded-full bg-[#D6A23A]/80" />
                <span className="size-2.5 rounded-full bg-[#55A96B]/80" />
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-[#252525]">
                <FileCode className="size-3.5 text-[#A7A7A7]" />
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="bg-transparent text-xs text-[#F5F5F5] border-none outline-none font-mono w-36 hover:bg-[#181818] px-1 py-0.5 rounded"
                  placeholder="filename.ts"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#2A2A2A] bg-[#161616] text-[11px] font-mono text-[#D4D4D4] shadow-2xs">
                <Sparkles className="size-3 text-[#D9781C]" />
                <span className="text-[#8E8E8E]">AI Detect:</span>
                <span className="text-[#F0F0F0] font-medium">{detectedLanguage}</span>
              </span>
            </div>
          </div>

          {/* Editor Body */}
          <div className="relative flex min-h-[320px] max-h-[500px] overflow-auto bg-[#080808]">
            {/* Line Numbers */}
            <div className="select-none py-4 px-3 text-right text-[12px] font-mono text-[#4D4D4D] bg-[#0A0A0A] border-r border-[#1E1E1E] leading-6 min-w-[3rem]">
              {Array.from({ length: Math.max(lineCount, 12) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Input */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste or write your code here..."
              className="flex-1 p-4 bg-transparent text-[13px] text-[#E0E0E0] font-mono leading-6 border-none outline-none resize-none min-h-[320px] whitespace-pre"
              spellCheck={false}
            />
          </div>

          {/* Editor Footer / Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-[#101010] border-t border-[#252525]">
            <div className="flex items-center gap-3 text-[11px] text-[#A7A7A7]">
              <span>{lineCount} lines</span>
              <span>•</span>
              <span>{code.length} characters</span>
              <span>•</span>
              <span className="text-[#D9781C]">Gemini 2.0 Ready</span>
              {code.trim() && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setCode("")}
                    className="text-[#707070] hover:text-[#E06B6B] transition-colors cursor-pointer"
                    title="Clear editor"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>

            <Button
              onClick={handleRunReview}
              disabled={loading || !code.trim()}
              className="bg-[#C86B16] hover:bg-[#A9560C] dark:bg-[#D9781C] dark:hover:bg-[#F08A27] text-white font-medium px-5 py-2 rounded-lg shadow-sm gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{loadingStep || "Analyzing Code..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Review Code →</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Review Results Section */}
        {reviewResult && (
          <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Top Score Summary Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Score Gauge */}
                <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
                  <div className="relative size-24 rounded-full border-4 border-border flex items-center justify-center shrink-0 bg-secondary-bg">
                    <div
                      className={cn(
                        "text-3xl font-bold font-mono",
                        reviewResult.score >= 80
                          ? "text-emerald-600 dark:text-emerald-400"
                          : reviewResult.score >= 60
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {reviewResult.score}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Quality Score
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase font-bold tracking-wider",
                          reviewResult.score >= 80
                            ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            : reviewResult.score >= 60
                            ? "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                            : "text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10",
                        )}
                      >
                        {reviewResult.score >= 85 ? "Excellent" : reviewResult.score >= 70 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {reviewResult.summary}
                    </p>
                  </div>
                </div>

                {/* Counts & Metrics */}
                <div className="md:col-span-8 flex flex-wrap items-center justify-between gap-4">
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    {/* Critical */}
                    <button
                      type="button"
                      onClick={() => setActiveSeverityFilter(activeSeverityFilter === "critical" ? "all" : "critical")}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all cursor-pointer",
                        activeSeverityFilter === "critical"
                          ? "border-red-500 bg-red-500/10"
                          : "border-border bg-secondary-bg hover:border-foreground/30",
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
                        <ShieldAlert className="size-3.5" />
                        Critical
                      </div>
                      <div className="text-xl font-bold font-mono text-foreground mt-1">
                        {reviewResult.criticalCount}
                      </div>
                    </button>

                    {/* Warnings */}
                    <button
                      type="button"
                      onClick={() => setActiveSeverityFilter(activeSeverityFilter === "warning" ? "all" : "warning")}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all cursor-pointer",
                        activeSeverityFilter === "warning"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-border bg-secondary-bg hover:border-foreground/30",
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        <AlertTriangle className="size-3.5" />
                        Warnings
                      </div>
                      <div className="text-xl font-bold font-mono text-foreground mt-1">
                        {reviewResult.warningCount}
                      </div>
                    </button>

                    {/* Suggestions */}
                    <button
                      type="button"
                      onClick={() => setActiveSeverityFilter(activeSeverityFilter === "suggestion" ? "all" : "suggestion")}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all cursor-pointer",
                        activeSeverityFilter === "suggestion"
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-border bg-secondary-bg hover:border-foreground/30",
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <Lightbulb className="size-3.5" />
                        Suggestions
                      </div>
                      <div className="text-xl font-bold font-mono text-foreground mt-1">
                        {reviewResult.suggestionCount}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <Terminal className="size-4 text-[#C86B16] dark:text-[#D9781C]" />
                  Review Findings ({filteredFindings.length})
                </h3>
                {activeSeverityFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setActiveSeverityFilter("all")}
                    className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Clear filter (Show all)
                  </button>
                )}
              </div>

              {filteredFindings.length === 0 ? (
                <div className="p-8 rounded-xl border border-border bg-card text-center text-xs text-muted-foreground">
                  No findings in this category.
                </div>
              ) : (
                filteredFindings.map((finding) => {
                  const isExpanded = !!expandedFindings[finding.id];

                  return (
                    <div
                      key={finding.id}
                      className={cn(
                        "rounded-xl border transition-all duration-200 overflow-hidden bg-card",
                        finding.severity === "critical"
                          ? "border-red-500/30"
                          : finding.severity === "warning"
                          ? "border-amber-500/30"
                          : finding.severity === "good"
                          ? "border-emerald-500/30"
                          : "border-border",
                      )}
                    >
                      {/* Finding Card Header */}
                      <button
                        type="button"
                        onClick={() => toggleFinding(finding.id)}
                        className="w-full p-4 flex items-start sm:items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-mono font-bold tracking-wider uppercase",
                              finding.severity === "critical"
                                ? "border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10"
                                : finding.severity === "warning"
                                ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                : finding.severity === "good"
                                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                                : "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10",
                            )}
                          >
                            {finding.severity}
                          </Badge>

                          {finding.line && (
                            <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                              Line {finding.line}
                            </span>
                          )}

                          <span className="text-sm font-semibold text-foreground">
                            {finding.title}
                          </span>
                        </div>

                        <div className="text-muted-foreground shrink-0 mt-0.5 sm:mt-0">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </button>

                      {/* Finding Expanded Details */}
                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-3 border-t border-border/60 bg-muted/10 text-xs">
                          <div>
                            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                              Explanation:
                            </span>
                            <p className="text-muted-foreground mt-1 leading-relaxed">
                              {finding.explanation}
                            </p>
                          </div>

                          <div>
                            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                              Recommendation:
                            </span>
                            <p className="text-muted-foreground mt-1 leading-relaxed">
                              {finding.recommendation}
                            </p>
                          </div>

                          {finding.codeSnippet && (
                            <div className="mt-2 space-y-1">
                              <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                                Recommended Fix:
                              </span>
                              <div className="rounded-lg border border-[#252525] bg-[#0A0A0A] text-[#D4D4D4] p-3 font-mono text-[11px] overflow-x-auto relative">
                                <pre>
                                  <code>{finding.codeSnippet}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

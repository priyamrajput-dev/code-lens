import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Copy, Check, ChevronRight } from "lucide-react";
import { gsap, scrollToTarget } from "@/lib/motion";
import { useGSAP } from "@gsap/react";

interface HeroCodeTerminalProps {
  onExploreWalkthrough?: () => void;
}

export function HeroCodeTerminal({ onExploreWalkthrough }: HeroCodeTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [typedLinesCount, setTypedLinesCount] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const findingsRef = useRef<HTMLDivElement>(null);
  const finding1Ref = useRef<HTMLDivElement>(null);
  const finding2Ref = useRef<HTMLDivElement>(null);

  const rawLines = [
    { num: 1, text: "// User authentication & session handler", type: "comment" },
    { num: 2, text: "export async function authenticateUser(req: Request, db: Database) {", type: "fn" },
    { num: 3, text: "  const { token, email } = await req.json();", type: "code" },
    { num: 4, text: "", type: "empty" },
    { num: 5, text: "  // Query session from database", type: "comment" },
    { num: 6, text: "  const user = await db.query(", type: "code" },
    { num: 7, text: "    `SELECT * FROM users WHERE email = '${email}'`", type: "vuln", highlight: "rose" },
    { num: 8, text: "  );", type: "code" },
    { num: 9, text: "", type: "empty" },
    { num: 10, text: "  if (!user || user.token !== token) {", type: "warn", highlight: "amber" },
    { num: 11, text: '    return new Response("Unauthorized", { status: 401 });', type: "code" },
    { num: 12, text: "  }", type: "code" },
    { num: 13, text: "", type: "empty" },
    { num: 14, text: "  return Response.json({ success: true, user });", type: "code" },
    { num: 15, text: "}", type: "code" },
  ];

  const fullCodeText = rawLines.map((l) => l.text).join("\n");

  const copyCode = () => {
    navigator.clipboard.writeText(fullCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Respect prefers-reduced-motion: if reduced, show immediately
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setTypedLinesCount(rawLines.length);
      setIsTypingComplete(true);
      return;
    }

    // Line-by-line typing sequence
    let currentLine = 0;
    const interval = setInterval(() => {
      currentLine += 1;
      setTypedLinesCount(currentLine);
      if (currentLine >= rawLines.length) {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 75);

    return () => clearInterval(interval);
  }, [rawLines.length]);

  // Animate the AI finding cards in with stagger and pulse once typing finishes
  useGSAP(
    () => {
      if (!isTypingComplete) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          findingsRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 }
        ).fromTo(
          [finding1Ref.current, finding2Ref.current],
          { opacity: 0, x: 20, scale: 0.97 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            stagger: 0.2,
            duration: 0.6,
          },
          "-=0.2"
        ).to(
          finding1Ref.current,
          {
            boxShadow: "0 0 16px rgba(244, 63, 94, 0.25)",
            repeat: 1,
            yoyo: true,
            duration: 0.8,
            ease: "sine.inOut",
          },
          "+=0.1"
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([findingsRef.current, finding1Ref.current, finding2Ref.current], {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        });
      });
    },
    { scope: containerRef, dependencies: [isTypingComplete] }
  );

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-border/80 bg-[#07080C] text-[#F8FAFC] shadow-2xl overflow-hidden font-mono text-xs transition-all duration-300 hover:border-amber-500/30"
    >
      {/* Terminal Window Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#11131F] border-b border-[#1E2235]">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-[#F43F5E]/90 shadow-xs shadow-rose-500/50" />
          <div className="size-2.5 rounded-full bg-[#F59E0B]/90 shadow-xs shadow-amber-500/50" />
          <div className="size-2.5 rounded-full bg-[#10B981]/90 shadow-xs shadow-emerald-500/50" />
          <span className="ml-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="text-amber-400">TS</span> auth-controller.ts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            git branch: feature/auth
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg cursor-pointer hover:bg-[#1E2235]"
            title="Copy sample snippet"
            aria-label={copied ? "Code copied" : "Copy sample snippet"}
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Snippet Box with Line Numbers & Syntax Highlighting */}
      <div className="p-3.5 sm:p-4 overflow-x-auto text-[11.5px] sm:text-[12px] leading-relaxed bg-[#07080C] min-h-[300px]">
        <div className="flex flex-col">
          {rawLines.slice(0, Math.max(1, typedLinesCount)).map((line, idx) => {
            const isVuln = line.type === "vuln";
            const isWarn = line.type === "warn";

            return (
              <div
                key={line.num}
                className={`flex items-start font-mono py-0.5 px-2 -mx-2 rounded transition-colors ${
                  isVuln
                    ? "bg-rose-500/15 border-l-2 border-rose-500 text-rose-200"
                    : isWarn
                    ? "bg-amber-500/10 border-l-2 border-amber-500 text-amber-200"
                    : "hover:bg-slate-800/30 text-slate-300"
                }`}
              >
                <span className="w-8 shrink-0 select-none text-[10.5px] text-slate-600 text-right pr-3 font-mono">
                  {line.num}
                </span>
                <span className="whitespace-pre flex-1">
                  {line.type === "comment" ? (
                    <span className="text-slate-500 italic">{line.text}</span>
                  ) : line.type === "fn" ? (
                    <span>
                      <span className="text-purple-400">export async function</span>{" "}
                      <span className="text-blue-400">authenticateUser</span>
                      <span className="text-slate-400">(req: </span>
                      <span className="text-emerald-400">Request</span>
                      <span className="text-slate-400">, db: </span>
                      <span className="text-emerald-400">Database</span>
                      <span className="text-slate-400">) &#123;</span>
                    </span>
                  ) : isVuln ? (
                    <span>
                      <span className="text-slate-400">    `SELECT * FROM users WHERE email = '</span>
                      <span className="text-rose-400 font-bold">&#36;&#123;email&#125;</span>
                      <span className="text-slate-400">'`</span>
                    </span>
                  ) : isWarn ? (
                    <span>
                      <span className="text-purple-400">  if</span> (
                      <span className="text-rose-400">!user</span> || user.token !== token) &#123;
                    </span>
                  ) : (
                    <span>{line.text}</span>
                  )}
                  {/* Blinking typing cursor on active line */}
                  {!isTypingComplete && idx === typedLinesCount - 1 && (
                    <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-amber-400 animate-pulse align-middle" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live AI Annotations Overlay */}
      <div
        ref={findingsRef}
        className={`p-3.5 border-t border-[#1E2235] bg-[#0D0E15] space-y-2.5 transition-opacity ${
          isTypingComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-400" />
            AI Findings Detected (2)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/25">
            Quality Score: 68/100
          </span>
        </div>

        {/* Finding 1: Security Alert */}
        <div
          ref={finding1Ref}
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 space-y-1 transition-all"
        >
          <div className="flex items-center gap-2 font-semibold text-rose-400 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[10px] uppercase font-bold tracking-wider">
              SECURITY
            </span>
            <span>Line 7: Potential SQL Injection (CWE-89)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-snug">
            Direct template literal interpolation into SQL query. User input is unescaped.
          </p>
        </div>

        {/* Finding 2: Bug */}
        <div
          ref={finding2Ref}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-1 transition-all"
        >
          <div className="flex items-center gap-2 font-semibold text-amber-400 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] uppercase font-bold tracking-wider">
              BUG
            </span>
            <span>Line 10: Unhandled null pointer</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-snug">
            Accessing <code className="text-white">user.token</code> may throw if database query returns empty.
          </p>
        </div>

        {/* Quick Action */}
        <div className="pt-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Google Gemini • Pinecone</span>
          <button
            type="button"
            onClick={() => {
              if (onExploreWalkthrough) onExploreWalkthrough();
              else scrollToTarget("how-it-works");
            }}
            className="text-amber-400 hover:text-amber-300 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            Explore demo walkthrough
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

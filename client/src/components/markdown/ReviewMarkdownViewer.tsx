import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";

// Import Prism language grammars in correct dependency order
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";

// Dark syntax theme for code blocks
import "prismjs/themes/prism-tomorrow.css";

import {
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileCode,
  ExternalLink,
  Terminal,
} from "lucide-react";

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightCode(code: string, language: string): string {
  const lang = (language || "").toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    py: "python",
    yml: "yaml",
    md: "markdown",
    golang: "go",
    rs: "rust",
  };
  const resolvedLang = aliasMap[lang] || lang;
  const grammar =
    Prism.languages[resolvedLang] ||
    Prism.languages.javascript ||
    Prism.languages.plain;

  if (!grammar) {
    return escapeHtml(code);
  }

  try {
    return Prism.highlight(code, grammar, resolvedLang);
  } catch (err) {
    console.warn("Prism highlight error for language:", resolvedLang, err);
    return escapeHtml(code);
  }
}

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code snippet:", err);
    }
  };

  const lineCount = code.trim().split("\n").length;
  const displayLang = language ? language.toUpperCase() : "CODE";
  const highlightedHtml = highlightCode(code, language);

  return (
    <div className="my-4 rounded-xl border border-[#1E2235] bg-[#07080C] overflow-hidden shadow-lg font-mono text-left">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#11131F] border-b border-[#1E2235] select-none">
        <div className="flex items-center gap-2">
          <FileCode className="size-3.5 text-amber-500" />
          <span className="text-[11px] font-semibold text-muted-foreground font-mono tracking-wider">
            {displayLang}
          </span>
          <span className="text-[#3a3a40]">•</span>
          <span className="text-[11px] text-muted-foreground/60 font-mono">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Highlighted Code Area */}
      <div className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[#E2E8F0] bg-[#07080C]">
        <pre className="m-0 p-0 bg-transparent overflow-visible">
          <code
            className={`language-${language || "plain"}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node) && node.props && (node.props as { children?: React.ReactNode }).children) {
    return getNodeText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

interface ReviewMarkdownViewerProps {
  content: string;
}

export function ReviewMarkdownViewer({ content }: ReviewMarkdownViewerProps) {
  if (!content || !content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border text-center text-muted-foreground space-y-2">
        <Terminal className="size-6 text-muted-foreground/60" />
        <p className="text-sm font-medium">No review commentary recorded</p>
        <p className="text-xs">The review has completed without textual feedback.</p>
      </div>
    );
  }

  return (
    <div className="text-foreground leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom Heading 2
          h2({ children }) {
            const text = getNodeText(children).toLowerCase();

            if (text.includes("looks good") || text.includes("strengths") || text.includes("✅")) {
              return (
                <div className="flex items-center gap-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl mt-6 mb-3">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  <span>{children}</span>
                </div>
              );
            }

            if (text.includes("suggestion") || text.includes("improvements") || text.includes("⚠️")) {
              return (
                <div className="flex items-center gap-2.5 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 rounded-xl mt-6 mb-3">
                  <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                  <span>{children}</span>
                </div>
              );
            }

            if (text.includes("critical") || text.includes("error") || text.includes("bug") || text.includes("❌")) {
              return (
                <div className="flex items-center gap-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl mt-6 mb-3">
                  <ShieldAlert className="size-4 shrink-0 text-rose-500" />
                  <span>{children}</span>
                </div>
              );
            }

            return (
              <h2 className="text-base font-bold text-foreground mt-6 mb-3 pb-1.5 border-b border-border/60">
                {children}
              </h2>
            );
          },

          // Custom Heading 3
          h3({ children }) {
            const text = getNodeText(children).toLowerCase();

            if (text.includes("looks good") || text.includes("strengths") || text.includes("✅")) {
              return (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl mt-6 mb-3">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  <span>{children}</span>
                </div>
              );
            }

            if (text.includes("suggestion") || text.includes("improvements") || text.includes("⚠️")) {
              return (
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl mt-6 mb-3">
                  <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                  <span>{children}</span>
                </div>
              );
            }

            if (text.includes("critical") || text.includes("error") || text.includes("bug") || text.includes("❌")) {
              return (
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl mt-6 mb-3">
                  <ShieldAlert className="size-4 shrink-0 text-rose-500" />
                  <span>{children}</span>
                </div>
              );
            }

            return (
              <h3 className="text-sm font-bold text-foreground mt-5 mb-2.5 tracking-tight">
                {children}
              </h3>
            );
          },

          // Paragraph
          p({ children }) {
            return (
              <p className="text-[14px] leading-relaxed text-foreground/90 my-2.5">
                {children}
              </p>
            );
          },

          // Unordered list
          ul({ children }) {
            return (
              <ul className="list-disc pl-5 space-y-2 my-3 text-[14px] text-foreground/90 leading-relaxed marker:text-muted-foreground">
                {children}
              </ul>
            );
          },

          // Ordered list
          ol({ children }) {
            return (
              <ol className="list-decimal pl-5 space-y-3 my-3 text-[14px] text-foreground/90 leading-relaxed marker:text-amber-500 marker:font-semibold">
                {children}
              </ol>
            );
          },

          // List item
          li({ children }) {
            return <li className="pl-1">{children}</li>;
          },

          // Bold text
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>;
          },

          // Inline & Block Code
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeText = String(children).replace(/\n$/, "");

            if (match || codeText.includes("\n")) {
              return (
                <CodeBlock
                  code={codeText}
                  language={match ? match[1] : ""}
                />
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-muted/90 text-foreground font-mono text-[12px] border border-border/60 font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Pre element wrapper
          pre({ children }) {
            return <>{children}</>;
          },

          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-amber-500 bg-muted/20 pl-4 py-2 my-3 rounded-r-md text-[13px] text-muted-foreground italic">
                {children}
              </blockquote>
            );
          },

          // Horizontal rule
          hr() {
            return <hr className="my-6 border-border/60" />;
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-amber-500 hover:text-amber-600 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                {children}
                <ExternalLink className="size-3 inline ml-0.5" />
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { useState, useCallback, useRef } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { Button } from "@/components/ui/Button";
import { ModeSelector, defaultModes } from "@/components/ui/ModeSelector";
import { CodeCard } from "@/components/ui/CodeCard";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { PageTransition } from "@/components/motion/PageTransition";
import { explainCode, type ExplainMode } from "@/lib/explain-service";
import { useWorkspaceStore, useHistoryStore } from "@/lib/stores";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Play,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Sparkles,
  MessageSquare,
  FileText,
  Check,
} from "lucide-react";
import { clsx } from "clsx";

const languageOptions = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
];

export function WorkspacePage() {
  const {
    code,
    language,
    mode,
    explanation,
    isStreaming,
    chatMessages,
    setCode,
    setLanguage,
    setMode,
    setExplanation,
    appendExplanation,
    setIsStreaming,
    addChatMessage,
    reset,
  } = useWorkspaceStore();

  const { addItem: addHistoryItem } = useHistoryStore();
  const [activeTab, setActiveTab] = useState("explanation");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduce = useReducedMotion();

  const handleExplain = useCallback(async () => {
    if (!code.trim() || isStreaming) return;

    setIsStreaming(true);
    setExplanation("");
    setActiveTab("explanation");

    let fullResult = "";

    await explainCode(code, mode as ExplainMode, {
      onChunk: (chunk) => {
        if (chunk.text) {
          appendExplanation(chunk.text);
          fullResult += chunk.text;
        }
      },
      onComplete: () => {
        setIsStreaming(false);
        addHistoryItem({
          code,
          language,
          mode,
          explanation: fullResult,
        });
      },
    });
  }, [code, mode, language, isStreaming, setIsStreaming, setExplanation, appendExplanation, addHistoryItem]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "py") setLanguage("python");
        else if (ext === "rs") setLanguage("rust");
        else if (ext === "go") setLanguage("go");
        else if (ext === "sql") setLanguage("sql");
        else if (ext === "js") setLanguage("javascript");
        else setLanguage("typescript");
      }
    };
    reader.readAsText(file);
  };

  const handleCopyExplanation = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleDownload = () => {
    if (!explanation) return;
    const blob = new Blob([explanation], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-lens-${mode}-explanation.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition className="min-h-screen bg-warm-canvas text-ink-black flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-pure-white border border-sand rounded-[20px] px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="text-small-ui font-medium text-ink-black">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-warm-canvas border border-sand rounded-[6px] px-3 py-1.5 text-small-ui text-ink-black font-mono focus:border-ember-orange outline-none cursor-pointer"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Upload file
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleExplain}
              isLoading={isStreaming}
              icon={<Play className="w-4 h-4 fill-current" />}
            >
              {isStreaming ? "Analyzing..." : "Explain Code"}
            </Button>
          </div>
        </div>

        {/* Two-Pane Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[620px]">
          {/* ================= LEFT PANE: CODE INPUT ================= */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex-1 flex flex-col bg-deep-charcoal border border-charcoal rounded-[24px] overflow-hidden min-h-[460px]">
              {/* Editor Header */}
              <div className="h-11 px-4 border-b border-charcoal flex items-center justify-between bg-deep-charcoal/90 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate/40" />
                  <span className="ml-2 font-mono text-[11px] text-stone">
                    snippet.{language === "typescript" ? "ts" : language}
                  </span>
                </div>
                <Badge variant="dark" size="sm">
                  {code.split("\n").length} lines
                </Badge>
              </div>

              {/* Code Textarea Editor */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste or type code here..."
                className="w-full flex-1 p-5 bg-deep-charcoal text-sand font-mono text-[13px] leading-relaxed outline-none border-none resize-none placeholder:text-stone/40 selection:bg-ember-orange/30"
                spellCheck={false}
              />
            </div>

            {/* ModeSelector beneath editor */}
            <div className="bg-pure-white border border-sand rounded-[20px] p-4 flex flex-col items-center">
              <span className="text-caption font-mono text-warm-gray mb-2 uppercase tracking-wider">
                Select Analysis Lens
              </span>
              <ModeSelector activeMode={mode} onSelect={setMode} />
            </div>
          </div>

          {/* ================= RIGHT PANE: EXPLANATION | CHAT ================= */}
          <div className="lg:col-span-6 flex flex-col min-h-[460px]">
            <div className="bg-pure-white border border-sand rounded-[24px] flex-1 flex flex-col overflow-hidden">
              {/* Header with pill tabs */}
              <div className="p-4 border-b border-sand flex items-center justify-between shrink-0">
                <Tabs
                  tabs={[
                    {
                      id: "explanation",
                      label: "Explanation",
                      icon: <FileText className="w-3.5 h-3.5" />,
                    },
                    {
                      id: "chat",
                      label: "Chat Companion",
                      icon: <MessageSquare className="w-3.5 h-3.5" />,
                      badge: chatMessages.length > 0 ? chatMessages.length : undefined,
                    },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />

                {activeTab === "explanation" && explanation && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyExplanation}
                      className="p-1.5 rounded-lg text-pewter hover:text-ink-black hover:bg-sand/30 transition-colors cursor-pointer"
                      title="Copy explanation"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-ember-orange" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-1.5 rounded-lg text-pewter hover:text-ink-black hover:bg-sand/30 transition-colors cursor-pointer"
                      title="Export markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tab Content with cross-fade */}
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeTab === "explanation" ? (
                    <motion.div
                      key="tab-explanation"
                      initial={shouldReduce ? undefined : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduce ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="h-full overflow-y-auto p-6 text-body leading-relaxed select-text"
                    >
                      {!explanation && !isStreaming ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-warm-gray p-8">
                          <div className="w-12 h-12 rounded-full bg-sand/40 flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-ember-orange" />
                          </div>
                          <h3 className="text-heading-sm text-ink-black mb-2">
                            Ready to analyze
                          </h3>
                          <p className="text-body text-pewter max-w-sm">
                            Click <strong className="text-ink-black">Explain Code</strong> above or choose a lens mode to generate instant streaming insight.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-sand/60">
                            <div className="flex items-center gap-2">
                              <Badge variant="primary" size="sm">
                                {defaultModes.find((m) => m.value === mode)?.label || mode}
                              </Badge>
                              <span className="text-caption text-warm-gray font-mono">
                                Streaming explanation
                              </span>
                            </div>
                            {isStreaming && (
                              <div className="flex items-center gap-2 text-caption text-ember-orange font-mono">
                                <span className="w-2 h-2 rounded-full bg-ember-orange animate-ping" />
                                Processing
                              </div>
                            )}
                          </div>

                          <div className="text-[15.5px] text-ink-black leading-relaxed whitespace-pre-wrap font-sans">
                            {explanation}
                            {/* Blinking orange caret during streaming */}
                            {isStreaming && (
                              <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.7, repeat: Infinity }}
                                className="inline-block w-2 h-4 bg-ember-orange ml-1 align-middle"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tab-chat"
                      initial={shouldReduce ? undefined : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduce ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ChatPanel
                        messages={chatMessages}
                        onSendMessage={(msg) => {
                          addChatMessage({ role: "user", content: msg });
                          // Simulate companion answer
                          setTimeout(() => {
                            addChatMessage({
                              role: "assistant",
                              content: `Regarding your question about "${msg.slice(0, 35)}...": In the current snippet, the execution flow is deterministic. If you want to make it safer for concurrent callers, ensure shared state is guarded by an atomic mutex or encapsulated in an isolated worker.`,
                            });
                          }, 600);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
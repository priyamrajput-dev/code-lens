import { Link } from "react-router-dom";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { PageTransition } from "@/components/motion/PageTransition";
import { useHistoryStore, useWorkspaceStore } from "@/lib/stores";
import { Trash2, ArrowRight, Clock, Code2, Sparkles } from "lucide-react";

export function HistoryPage() {
  const { items, removeItem, clearHistory } = useHistoryStore();
  const { setCode, setLanguage, setMode, setExplanation } = useWorkspaceStore();

  const handleLoadInStudio = (item: (typeof items)[0]) => {
    setCode(item.code);
    setLanguage(item.language);
    setMode(item.mode);
    setExplanation(item.explanation);
  };

  return (
    <PageTransition className="min-h-screen bg-warm-canvas text-ink-black flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-1200 w-full mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-sand">
          <div>
            <h1 className="text-heading font-normal text-ink-black tracking-tight">
              Analysis History
            </h1>
            <p className="text-body text-pewter mt-1">
              Review and reopen previously explained code snippets.
            </p>
          </div>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear history
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-pure-white rounded-[32px] border border-sand p-12 text-center flex flex-col items-center justify-center my-12">
            <div className="w-14 h-14 rounded-full bg-sand/40 flex items-center justify-center mb-4 text-warm-gray">
              <Clock className="w-6 h-6 text-ember-orange" />
            </div>
            <h2 className="text-heading-sm font-medium text-ink-black mb-2">
              No analyses recorded yet
            </h2>
            <p className="text-body text-pewter max-w-sm mb-6">
              When you analyze code snippets in the studio, your history will automatically save here locally.
            </p>
            <Link to="/app">
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Workspace
              </Button>
            </Link>
          </div>
        ) : (
          <Stagger className="space-y-4">
            {items.map((item) => (
              <StaggerItem key={item.id}>
                <Card interactive padding="md" className="group">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="primary" size="sm">
                          {item.mode}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {item.language}
                        </Badge>
                        <span className="text-caption text-warm-gray font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[14.5px] text-ink-black font-normal line-clamp-2 leading-relaxed">
                        {item.explanation}
                      </p>

                      <div className="mt-3 font-mono text-caption text-warm-gray truncate max-w-lg bg-warm-canvas/60 p-1.5 rounded-[6px] border border-sand/40">
                        {item.code.split("\n")[0]}...
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link to="/app" onClick={() => handleLoadInStudio(item)}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Sparkles className="w-3.5 h-3.5" />}
                        >
                          Reopen
                        </Button>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="p-2 rounded-lg text-stone hover:text-red-600 hover:bg-sand/30 transition-colors cursor-pointer"
                        title="Delete from history"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </main>

      <Footer />
    </PageTransition>
  );
}
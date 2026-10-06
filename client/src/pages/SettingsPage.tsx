import { useState } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { PageTransition } from "@/components/motion/PageTransition";
import { useSettingsStore, type AIProvider } from "@/lib/stores";
import { Eye, EyeOff, KeyRound, Cpu, ShieldCheck, Check, Sparkles } from "lucide-react";

export function SettingsPage() {
  const { provider, apiKey, theme, setProvider, setApiKey, setTheme } = useSettingsStore();
  const [showKey, setShowKey] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const providers: { id: AIProvider; name: string; desc: string; badge: string }[] = [
    {
      id: "gemini",
      name: "Google Gemini 1.5 Pro / Flash",
      desc: "High token limits, fast code reasoning, ideal for full files.",
      badge: "Recommended",
    },
    {
      id: "claude",
      name: "Anthropic Claude 3.5 Sonnet",
      desc: "Exceptional refactoring suggestions and line-by-line clarity.",
      badge: "Accurate",
    },
    {
      id: "openai",
      name: "OpenAI GPT-4o",
      desc: "Balanced general analysis and fast streaming responses.",
      badge: "Fast",
    },
  ];

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <PageTransition className="min-h-screen bg-warm-canvas text-ink-black flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12">
        <div className="mb-8 pb-6 border-b border-sand">
          <h1 className="text-heading font-normal text-ink-black tracking-tight">
            Settings & Model Configuration
          </h1>
          <p className="text-body text-pewter mt-1">
            Configure your AI provider preferences. All keys are stored securely in your browser's local storage.
          </p>
        </div>

        <div className="space-y-6">
          {/* Provider Selection Card */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-ember-orange" />
              <h2 className="text-subheading font-medium text-ink-black">
                Select AI Engine
              </h2>
            </div>
            <p className="text-caption text-pewter mb-5">
              Choose the LLM provider that will process your code explanations.
            </p>

            <div className="space-y-3">
              {providers.map((p) => {
                const isSelected = provider === p.id;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`w-full text-left p-4 rounded-[16px] border transition-all duration-150 flex items-start justify-between gap-4 cursor-pointer ${
                      isSelected
                        ? "bg-warm-canvas/60 border-ember-orange ring-1 ring-ember-orange/20"
                        : "bg-pure-white border-sand hover:border-charcoal/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-small-ui font-medium text-ink-black">
                          {p.name}
                        </span>
                        <Badge
                          variant={isSelected ? "primary" : "default"}
                          size="sm"
                        >
                          {p.badge}
                        </Badge>
                      </div>
                      <p className="text-caption text-pewter">{p.desc}</p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "border-ember-orange bg-ember-orange text-pure-white"
                          : "border-sand bg-pure-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* API Key Card */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-ember-orange" />
              <h2 className="text-subheading font-medium text-ink-black">
                Provider API Key
              </h2>
            </div>
            <p className="text-caption text-pewter mb-4">
              Leave blank to use Code Lens built-in demo streaming engine, or paste your own key for unlimited quota.
            </p>

            <div className="relative flex items-center">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... or AIzaSy..."
                className="pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-stone hover:text-ink-black transition-colors cursor-pointer"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4 text-caption text-warm-gray">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Keys never touch our servers. Saved only to client localStorage.</span>
            </div>
          </Card>

          {/* Theme Note Card */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-ember-orange" />
              <h2 className="text-subheading font-medium text-ink-black">
                Design Theme Note
              </h2>
            </div>
            <p className="text-body text-pewter leading-relaxed">
              Code Lens is crafted around the <strong className="text-ink-black">"Warm Workshop with Coral Sparks"</strong> aesthetic: a creamy #faf6f1 canvas, ember-orange accents, and deeply contrastive #1a1919 code cards.
            </p>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              icon={<Check className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {savedToast && (
        <Toast
          message="Settings updated successfully!"
          type="success"
          onClose={() => setSavedToast(false)}
        />
      )}
    </PageTransition>
  );
}
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { PromptBar } from "./PromptBar";
import { MessageSquare, Sparkles, User, Bot } from "lucide-react";
import { clsx } from "clsx";
import type { ChatMessage } from "@/lib/stores";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isStreaming?: boolean;
  className?: string;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isStreaming = false,
  className,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = (text: string) => {
    if (!text.trim() || isStreaming) return;
    onSendMessage(text);
    setInputValue("");
  };

  return (
    <div
      className={clsx(
        "flex flex-col h-full bg-warm-canvas rounded-[20px] border border-sand overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="h-12 px-5 border-b border-sand/80 flex items-center justify-between bg-pure-white/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 text-ink-black font-medium text-small-ui">
          <MessageSquare className="w-4 h-4 text-ember-orange" />
          <span>Code Companion</span>
        </div>
        <span className="text-[11px] font-mono text-warm-gray">Context-Aware</span>
      </div>

      {/* Message Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 select-text"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-warm-gray">
            <div className="w-12 h-12 rounded-full bg-sand/50 flex items-center justify-center text-pewter mb-3">
              <Sparkles className="w-5 h-5 text-ember-orange" />
            </div>
            <p className="text-small-ui font-medium text-ink-black">No questions yet</p>
            <p className="text-caption text-pewter mt-1 max-w-xs">
              Ask about potential edge cases, how to optimize time complexity, or rewrite in another framework.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <motion.div
                  key={msg.id}
                  initial={shouldReduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={clsx(
                    "flex gap-2.5 max-w-[85%]",
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {/* Avatar badge */}
                  <div
                    className={clsx(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 select-none",
                      isUser
                        ? "bg-ember-orange text-pure-white"
                        : "bg-sand text-ink-black"
                    )}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble: user = white card with border, assistant = sand wash */}
                  <div
                    className={clsx(
                      "rounded-[16px] px-4 py-3 text-body font-normal leading-relaxed",
                      isUser
                        ? "bg-pure-white border border-sand text-ink-black"
                        : "bg-sand/60 text-ink-black border border-transparent"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-[14.5px]">{msg.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing indicator: 3 bouncing dots */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mr-auto"
          >
            <div className="w-7 h-7 rounded-full bg-sand text-ink-black flex items-center justify-center text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-sand/60 rounded-[16px] px-4 py-2.5 flex items-center gap-1.5 border border-transparent">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-ember-orange inline-block"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-ember-orange inline-block"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                className="w-1.5 h-1.5 rounded-full bg-ember-orange inline-block"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Composer: PromptBar style */}
      <div className="p-3 bg-pure-white border-t border-sand">
        <PromptBar
          placeholder="Ask follow-up question..."
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSend}
          isStreaming={isStreaming}
          className="max-w-none h-[48px]"
        />
      </div>
    </div>
  );
}
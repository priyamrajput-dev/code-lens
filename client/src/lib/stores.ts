import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIProvider = "gemini" | "claude" | "openai";

export interface SettingsState {
  provider: AIProvider;
  apiKey: string;
  theme: "light" | "dark" | "system";
  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: "gemini",
      apiKey: "",
      theme: "light",
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "code-lens-settings" }
  )
);

export interface HistoryItem {
  id: string;
  code: string;
  language: string;
  mode: string;
  explanation: string;
  timestamp: number;
}

export interface HistoryState {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, "id" | "timestamp">) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [
        {
          id: "hist-1",
          code: `function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {\n  let timer: NodeJS.Timeout;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}`,
          language: "typescript",
          mode: "overview",
          explanation: "Implements a generic debounce wrapper that cancels pending timeouts and buffers calls until silence for delay milliseconds.",
          timestamp: Date.now() - 3600000 * 2,
        },
        {
          id: "hist-2",
          code: `async function fetchWithRetry(url: string, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try { return await fetch(url); }\n    catch (err) { if (i === retries - 1) throw err; }\n  }\n}`,
          language: "javascript",
          mode: "security",
          explanation: "Security audit verified URL parsing, network error backoff considerations, and resource retry boundaries.",
          timestamp: Date.now() - 3600000 * 24,
        },
      ],
      addItem: (item) =>
        set((state) => ({
          items: [
            { ...item, id: crypto.randomUUID(), timestamp: Date.now() },
            ...state.items.slice(0, 49),
          ],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearHistory: () => set({ items: [] }),
    }),
    { name: "code-lens-history" }
  )
);

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface WorkspaceState {
  code: string;
  language: string;
  mode: string;
  explanation: string;
  isStreaming: boolean;
  chatMessages: ChatMessage[];
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setMode: (mode: string) => void;
  setExplanation: (exp: string) => void;
  appendExplanation: (chunk: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChat: () => void;
  reset: () => void;
}

const defaultSnippet = `// Paste or drop your code here to analyze
export function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  return -1;
}`;

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  code: defaultSnippet,
  language: "typescript",
  mode: "overview",
  explanation: "",
  isStreaming: false,
  chatMessages: [
    {
      id: "initial-1",
      role: "assistant",
      content: "Hello! I'm your Code Lens code companion. I have full context on the code in your editor. Ask me anything about edge cases, complexity, or how to adapt this snippet.",
      timestamp: Date.now(),
    },
  ],
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setMode: (mode) => set({ mode }),
  setExplanation: (explanation) => set({ explanation }),
  appendExplanation: (chunk) =>
    set((state) => ({ explanation: state.explanation + chunk })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        { ...message, id: crypto.randomUUID(), timestamp: Date.now() },
      ],
    })),
  clearChat: () => set({ chatMessages: [] }),
  reset: () =>
    set({
      code: defaultSnippet,
      language: "typescript",
      mode: "overview",
      explanation: "",
      isStreaming: false,
      chatMessages: [],
    }),
}));
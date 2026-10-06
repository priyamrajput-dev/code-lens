# Code Lens — Web Client

A modern code explanation studio built from scratch with React 19, TypeScript, and Tailwind CSS v4.

---

## Design Language: "Warm Workshop with Coral Sparks"
A tactile cream canvas, vivid orange accents, pill-shaped controls, large rounded cards, and flat border-driven contrast (no drop shadows).

### Color Tokens (`src/index.css`)
- `--color-ember-orange: #ff3c00`: Primary CTAs, brand accents, active states
- `--color-burnt-rust: #ec4e02`: Button hover state
- `--color-sunset-coral: #ff764c` & `--color-peach-blush: #ffb199`: Peach feature card gradients
- `--color-electric-blue: #2492ff`: Secondary links
- `--color-warm-canvas: #faf6f1`: Main page background
- `--color-pure-white: #ffffff`: Cards and inputs
- `--color-ink-black: #0e0e0f`: Primary typography
- `--color-deep-charcoal: #1a1919`: Code cards
- `--color-charcoal: #312e2e` & `--color-pewter: #52545a`: Body text & borders
- `--color-sand: #dfddd8`: Hairline dividers and borders

---

## Getting Started

### 1. Install Dependencies
```bash
bun install
# or npm install
```

### 2. Run Development Server
```bash
bun run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
bun run build
```

---

## Connecting a Real AI Provider

The codebase uses a mock streaming service (`src/lib/explain-service.ts`) with realistic token streaming and mode-specific reasoning.

To plug in a real LLM provider (Google Gemini, Anthropic Claude, or OpenAI):
1. Navigate to `/settings` in the UI to select your provider and save your API key (stored in browser `localStorage`).
2. Update `src/lib/explain-service.ts`:
   ```ts
   import { useSettingsStore } from "./stores";

   export async function explainCode(code: string, mode: ExplainMode, options?: ExplainCallbacks) {
     const { provider, apiKey } = useSettingsStore.getState();
     
     if (apiKey) {
       // Call your real backend or SDK directly:
       // e.g. POST /api/explain with { code, mode, provider, apiKey }
       // and stream chunks via Server-Sent Events (SSE) or WebSockets.
     } else {
       // Falls back to high-fidelity simulated streaming
     }
   }
   ```

---

## Pages & Routes
- `/`: Landing page with animated hero, word-by-word reveal, 3D tilt preview card, bento feature cards, and interactive 3-step walkthrough.
- `/app`: Two-pane studio workspace with syntax highlighting, language selector, file upload, 6 explanation lenses, and code-aware companion chat.
- `/history`: Local storage history of previous explanations with one-click reload.
- `/settings`: AI engine selection, masked API key manager, and security verification.
- `*`: 404 handler with design system styling.

See [MOTION.md](./MOTION.md) for full documentation of the animation tokens, motion wrappers, and accessibility features.

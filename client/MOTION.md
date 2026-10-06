# Code Lens Motion Design System (`MOTION.md`)

## Design Language: "Warm Workshop with Coral Sparks"
The motion language in Code Lens is warm, springy, tactile, confident, and never jittery. Every transition reflects mechanical precision inspired by modern developer workshops.

---

## 1. Motion Tokens (`src/lib/motion.ts`)

### Durations
- **Fast (`150ms` / `0.15s`)**: Micro-interactions, hover color shifts, copy icon resets.
- **Base (`250ms` / `0.25s`)**: Component state changes, route transitions, modal/tab cross-fades.
- **Slow (`500ms` / `0.5s`)**: Content section reveals, bento card hover lifts.
- **Hero (`900ms` / `0.9s`)**: Headline entry, floating ambient canvas shapes.

### Easings
- **`easeOut`**: `[0.22, 1, 0.36, 1]` — Decelerating natural ease for entrances and reveals.
- **`easeInOut`**: `[0.65, 0, 0.35, 1]` — Symmetric transitions for scanning highlights.
- **`gentle`**: `[0.16, 1, 0.3, 1]` — Smooth dampening for ambient background motion.

### Springs
- **`motionSprings.snappy`**: `{ stiffness: 300, damping: 25, mass: 0.8 }` (buttons, cursor ring)
- **`motionSprings.standard`**: `{ stiffness: 260, damping: 24 }` (active pills, tabs)
- **`motionSprings.soft`**: `{ stiffness: 120, damping: 20 }` (ambient floats)
- **`motionSprings.bouncy`**: `{ stiffness: 400, damping: 18 }` (chat bubbles, badge pops)

---

## 2. Implemented Motion Hierarchy

### Level 1: Micro-Interactions (Everywhere)
- **Buttons (`Button.tsx`)**: Hover color shift to burnt-rust `#ec4e02`, spring `scale: 1.02`, press `scale: 0.97`, embedded arrow icon translates `+4px` on hover.
- **Navbar Links (`NavBar.tsx`)**: Active item underline slides between links using Framer Motion `layoutId="nav-active-pill"`.
- **Cards (`Card.tsx`, `FeatureCard.tsx`)**: Flat border-driven elevation with `translateY(-4px)` lift on hover (no drop shadows).
- **Inputs & PromptBar (`PromptBar.tsx`, `Input.tsx`)**: Hairline sand border with orange focus ring fade-in.
- **Copy Button (`CodeCard.tsx`)**: Morphing transition from copy icon to checkmark with an automatic `1.5s` reset.
- **Skeleton (`Skeleton.tsx`)**: Shimmer in warm sand tones (`color-mix(in srgb, var(--color-sand) 80%, transparent)`).

### Level 2: Component & Layout Animation
- **Route Transitions (`App.tsx`, `PageTransition.tsx`)**: Handled via `AnimatePresence mode="wait"` with subtle `y: 16` slide-up and quick opacity exit.
- **Mode Selector (`ModeSelector.tsx`)**: Active pill slides smoothly between 6 lenses via shared `layoutId="mode-active-pill"`.
- **Workspace Tabs (`Tabs.tsx`)**: Active indicator slides between "Explanation" and "Chat Companion" with cross-fading tab panels.
- **AI Streaming Explanation (`WorkspacePage.tsx`)**: Simulated token streaming with a blinking orange caret (`animate={{ opacity: [1, 0, 1] }}`).
- **Chat Companion (`ChatPanel.tsx`)**: Messages spring in from the bottom with distinct white cards (user) vs sand wash (assistant); 3 bouncing orange dots for typing status.

### Level 3: Hero & Bento Showpieces
- **Word-by-Word Reveal (`SplitText.tsx`)**: Hero headline reveals each word with a masked vertical slide-up (`y: 115%` → `0%`).
- **Looping Typewriter (`Typewriter.tsx`)**: PromptBar cycles through real developer prompt examples with natural typing and deletion rhythms.
- **3D Tilt & Glow (`TiltCard.tsx`)**: Hero dark CodeCard tilts up to `±6deg` based on mouse position with an orange radial glow tracking the cursor.
- **Magnetic Buttons (`Magnetic.tsx`)**: Primary CTAs pull toward cursor within `80px` radius (desktop only).
- **Interactive Cursor Ring (`CustomCursor.tsx`)**: 20px ring expands to 44px with an orange tint when hovering buttons, links, or inputs.
- **Code Scanning Lens (`CodeCard.tsx`)**: Animated horizontal beam sweeps across code lines.
- **Viewport Counters (`CountUp.tsx`)**: Stats animate from `0` to target numbers with cubic ease when scrolled into view.

### Level 4: Scroll Storytelling & Pinned Sequences
- **Lenis Smooth Scroll (`useSmoothScroll.ts`)**: Smooth wheel scrolling enabled on landing and marketing pages; automatically disabled in `/app` so code editor panels retain native scroll performance.
- **Fixed Scroll Progress (`ScrollProgress.tsx`)**: 3px orange indicator fixed at the top driven by `useScroll` + `useSpring`.
- **How It Works (`HowItWorks.tsx`)**: 3-step interactive storytelling section that crossfades code preview states (Raw input → Security audit → AI explanation).
- **Infinite Ecosystem Marquee (`Marquee.tsx`, `TrustStrip.tsx`)**: Continuous grayscale logo scroll with pause-on-hover.
- **Parallax Layers (`ParallaxLayer.tsx`)**: Soft peach and coral background ambient blobs drift at differentiated scroll velocities.

---

## 3. Performance & Accessibility Guarantees

1. **`prefers-reduced-motion`**: All motion wrappers check `useReducedMotion()`. When active, all 3D tilt, parallax, marquee loops, and spring transforms are bypassed, keeping instant rendering or simple fades.
2. **Touch Device Isolation**: Custom cursor and magnetic pull are automatically disabled when touch support is detected (`navigator.maxTouchPoints > 0`).
3. **GPU Acceleration**: Transforms strictly target `transform` (X, Y, scale, rotate) and `opacity`. Layout shifts (`width`/`height`) are avoided except when explicitly managed by Framer Motion's GPU layout engine.
4. **Lifecycle Cleanup**: Smooth scroll and GSAP ticker instances are automatically destroyed on unmount.

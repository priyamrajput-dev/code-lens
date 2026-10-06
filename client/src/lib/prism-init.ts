import Prism from "prismjs";

// Ensure Prism is attached to window and globalThis before any grammars execute
if (typeof window !== "undefined") {
  (window as unknown as { Prism: typeof Prism }).Prism = Prism;
}
if (typeof globalThis !== "undefined") {
  (globalThis as unknown as { Prism: typeof Prism }).Prism = Prism;
}

export default Prism;
export { Prism };
